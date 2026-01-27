import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, Session, Formation } from "@prisma/client";
import { AdminUpdateSessionDto } from "./dto/admin-update-session.dto";
import { AdminBillSessionDto } from "./dto/admin-bill-session.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        client: {
          include: { user: true },
        },
        trainer: true,
        formation: true,
      },
    });
    if (!session) {
      throw new NotFoundException("Session not found");
    }
    return session;
  }

  async findAll(start?: Date, end?: Date, status?: string, filter?: string) {
    const where: Prisma.SessionWhereInput = {};

    if (start && end) {
      where.date = {
        gte: start,
        lte: end,
      };
    } else if (start) {
      where.date = { gte: start };
    } else if (end) {
      where.date = { lte: end };
    }

    if (status) {
      where.status = status;
    }

    // Admin Specific Filters
    if (filter === "NO_TRAINER") {
      where.status = "CONFIRMED";
      where.trainerId = null;
    } else if (filter === "MISSING_LOGISTICS") {
      const now = new Date();
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setHours(now.getHours() - 48);

      where.status = "CONFIRMED";
      where.date = { gte: now };
      where.createdAt = { lte: twoDaysAgo };
      where.OR = [{ logistics: null }, { logistics: "" }, { logistics: "{}" }];
    } else if (filter === "MISSING_PROOF") {
      where.date = { lt: new Date() };
      where.status = "CONFIRMED";
      where.proofUrl = null;
    } else if (filter === "READY_TO_BILL") {
      where.proofUrl = { not: null };
      where.billedAt = null;
    }

    return this.prisma.session.findMany({
      where,
      include: {
        client: {
          include: { user: true },
        },
        trainer: true,
        formation: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async findByUserId(userId: string, role: string) {
    const where: Prisma.SessionWhereInput = {};

    if (role === "CLIENT") {
      where.client = { userId };
    } else if (role === "TRAINER") {
      where.trainer = { userId };
    } else {
      return [];
    }

    return this.prisma.session.findMany({
      where,
      include: {
        client: {
          include: { user: true },
        },
        trainer: true,
        formation: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async updateProof(id: string, proofUrl: string) {
    return this.prisma.session.update({
      where: { id },
      data: {
        proofUrl,
        status: "PROOF_RECEIVED",
      },
    });
  }

  calculatePricing(session: Session & { formation: Formation }) {
    const basePrice = session.formation.price
      ? Number(session.formation.price)
      : 0;

    // Options Logic
    let optionsFee = 0;
    const optionsDetails = [];

    if (session.logistics) {
      try {
        const log = JSON.parse(session.logistics);
        if (log.videoMaterial && log.videoMaterial.length > 0) {
          optionsFee += 20;
          optionsDetails.push("Kit Vidéo (20€)");
        }
        // Add other options logic here if needed
      } catch {
        // invalid json, ignore
      }
    }

    return {
      basePrice,
      distanceFee: 0, // Manual input required
      optionsFee,
      optionsDetails,
      total: basePrice + optionsFee,
    };
  }

  async getBillingPreview(id: string) {
    const session = await this.findOne(id);
    return this.calculatePricing(session);
  }

  async billSession(id: string, billingData: AdminBillSessionDto) {
    const updated = await this.prisma.session.update({
      where: { id },
      data: {
        billedAt: new Date(),
        billingData: JSON.stringify(billingData),
        status: "INVOICED",
      },
      include: { client: { include: { user: true } }, formation: true },
    });

    // Notify Client
    if (updated.client?.user?.email) {
      try {
        await this.emailService.sendEmail(
          updated.client.user.email,
          `Facture disponible : ${updated.formation.title}`,
          `<p>La session du ${new Date(updated.date).toLocaleDateString()} a été validée pour facturation.</p>
            <p>Montant Final : ${billingData.finalPrice} €</p>`,
        );
      } catch (e) {
        console.error("Failed to send billing email:", e);
        // Continue, do not fail the request
      }
    }

    return updated;
  }

  async update(id: string, data: Prisma.SessionUpdateInput) {
    return this.prisma.session.update({
      where: { id },
      data,
    });
  }

  async adminUpdate(id: string, data: AdminUpdateSessionDto) {
    const session = await this.findOne(id);

    // Prepare update data
    const updateData: Prisma.SessionUpdateInput = {};
    if (data.trainerId !== undefined)
      updateData.trainer = data.trainerId
        ? { connect: { id: data.trainerId } }
        : { disconnect: true };
    if (data.isLogisticsOpen !== undefined)
      updateData.isLogisticsOpen = data.isLogisticsOpen;
    if (data.status !== undefined) updateData.status = data.status;

    // Auto-confirm if assigning trainer to a PENDING session
    if (
      session.status === "PENDING" &&
      data.trainerId &&
      !data.status
    ) {
      updateData.status = "CONFIRMED";
    }

    const updatedSession = await this.prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        client: { include: { user: true } },
        trainer: true,
        formation: true,
      },
    });

    // Handle Cancellation Notification
    if (data.status === "CANCELLED" && session.status !== "CANCELLED") {
      // Notify Client
      if (updatedSession.client?.user?.email) {
        await this.emailService.sendEmail(
          updatedSession.client.user.email,
          `Annulation de session : ${updatedSession.formation.title}`,
          `<p>Votre session prévue le ${updatedSession.date} a été annulée.</p>`,
        );
      }
      // Notify Trainer
      if (updatedSession.trainer?.email) {
        await this.emailService.sendEmail(
          updatedSession.trainer.email,
          `Annulation de mission : ${updatedSession.formation.title}`,
          `<p>La session prévue le ${updatedSession.date} a été annulée.</p>`,
        );
      }
    }

    return updatedSession;
  }

  async getAdminStats() {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const [
      pendingRequests,
      noTrainer,
      missingLogistics,
      missingProof,
      readyToBill,
    ] = await Promise.all([
      // 1. Demandes à valider (PENDING)
      this.prisma.session.count({ where: { status: "PENDING" } }),

      // 2. Sessions sans formateur (CONFIRMED et trainerId est null)
      this.prisma.session.count({
        where: { status: "CONFIRMED", trainerId: null },
      }),

      // 3. Logistique manquante (T+48h, status CONFIRMED et logistics est null/vide)
      this.prisma.session.count({
        where: {
          status: "CONFIRMED",
          date: { gte: now },
          createdAt: {
            lte: new Date(new Date().setHours(new Date().getHours() - 48)),
          },
          OR: [{ logistics: null }, { logistics: "" }, { logistics: "{}" }],
        },
      }),

      // 4. Feuilles de présence manquantes (Session passée, status CONFIRMED ou PROOF_RECEIVED, mais proofUrl null)
      this.prisma.session.count({
        where: {
          date: { lt: now },
          status: "CONFIRMED",
          proofUrl: null,
        },
      }),

      // 5. À Facturer (Session passée, proofUrl présent, mais billedAt null)
      this.prisma.session.count({
        where: {
          proofUrl: { not: null },
          billedAt: null,
        },
      }),
    ]);

    return {
      pendingRequests,
      noTrainer,
      missingLogistics,
      missingProof,
      readyToBill,
    };
  }
}

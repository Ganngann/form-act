import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, Session, Formation } from "@prisma/client";
import { AdminUpdateSessionDto } from "./dto/admin-update-session.dto";
import { AdminBillSessionDto } from "./dto/admin-bill-session.dto";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email-templates/email-templates.service";
import * as PDFDocument from "pdfkit";

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private emailTemplatesService: EmailTemplatesService,
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

  async findAll(
    start?: Date,
    end?: Date,
    status?: string,
    filter?: string,
    query?: string,
  ) {
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

    if (query) {
      where.OR = [
        { formation: { title: { contains: query } } },
        { client: { companyName: { contains: query } } },
        { trainer: { firstName: { contains: query } } },
        { trainer: { lastName: { contains: query } } },
      ];
    }

    // Admin Specific Filters
    if (filter === "NO_TRAINER") {
      where.status = "CONFIRMED";
      where.trainerId = null;
    } else if (filter === "MISSING_LOGISTICS") {
      const now = new Date();
      // J-14 logic as per V2 spec
      const in14Days = new Date(now);
      in14Days.setDate(now.getDate() + 14);

      where.status = "CONFIRMED";
      where.date = { gte: now, lte: in14Days };
    } else if (filter === "MISSING_PROOF") {
      where.date = { lt: new Date() };
      where.status = "CONFIRMED";
      where.proofUrl = null;
    } else if (filter === "READY_TO_BILL") {
      where.proofUrl = { not: null };
      where.billedAt = null;
    } else if (filter === "ARCHIVED") {
      where.billedAt = { not: null };
    }

    const sessions = await this.prisma.session.findMany({
      where,
      include: {
        client: {
          include: { user: true },
        },
        trainer: true,
        formation: true,
      },
      orderBy: {
        date: filter === "ARCHIVED" ? "desc" : "asc",
      },
    });

    if (filter === "MISSING_LOGISTICS") {
      return sessions.filter((s) => !this.isLogisticsStrictlyComplete(s));
    }

    return sessions;
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

  async sendLogisticsReminder(id: string) {
    const session = await this.findOne(id);
    if (!session) throw new NotFoundException("Session not found");

    if (this.isLogisticsStrictlyComplete(session)) {
      throw new BadRequestException("Logistics already complete");
    }

    if (session.client?.user?.email) {
      await this.emailService.sendEmail(
        session.client.user.email,
        "Action requise : Informations logistiques manquantes",
        `<p>Bonjour ${session.client.companyName},</p>
         <p>Merci de compléter les informations logistiques pour votre session de formation du ${new Date(
           session.date,
         ).toLocaleDateString()}.</p>
         <p>Veuillez vous rendre sur votre <a href="${
           process.env.FRONTEND_URL
         }/dashboard/sessions/${id}">Espace Client</a> pour finaliser les détails.</p>
         <p>Cordialement,<br>L'équipe Formact</p>`,
      );

      // Log the reminder
      await this.prisma.notificationLog.create({
        data: {
          type: "LOGISTICS_REMINDER_MANUAL",
          recipient: session.client.user.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        },
      });
    }

    return { message: "Reminder sent" };
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
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "SESSION_INVOICED",
          {
            formation_title: updated.formation.title,
            date: new Date(updated.date).toLocaleDateString("fr-BE"),
            finalPrice: billingData.finalPrice,
          },
        );
        await this.emailService.sendEmail(
          updated.client.user.email,
          template.subject,
          template.body,
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
    if (data.logistics !== undefined) updateData.logistics = data.logistics;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;

    // Auto-confirm if assigning trainer to a PENDING session
    // Removed for US-02/US-03 workflow: Status must be updated via Offer/Accept flow
    // if (session.status === "PENDING" && data.trainerId && !data.status) {
    //   updateData.status = "CONFIRMED";
    // }

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
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "SESSION_CANCELLED_CLIENT",
          {
            formation_title: updatedSession.formation.title,
            date: new Date(updatedSession.date).toLocaleDateString("fr-BE"),
          },
        );
        await this.emailService.sendEmail(
          updatedSession.client.user.email,
          template.subject,
          template.body,
        );
      }
      // Notify Trainer
      if (updatedSession.trainer?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "SESSION_CANCELLED_TRAINER",
          {
            formation_title: updatedSession.formation.title,
            date: new Date(updatedSession.date).toLocaleDateString("fr-BE"),
          },
        );
        await this.emailService.sendEmail(
          updatedSession.trainer.email,
          template.subject,
          template.body,
        );
      }
    }

    return updatedSession;
  }

  async acceptOffer(id: string) {
    const session = await this.findOne(id);
    if (session.status !== "OFFER_SENT") {
      throw new Error("Session is not in OFFER_SENT status");
    }

    const updatedSession = await this.prisma.session.update({
      where: { id },
      data: {
        status: "CONFIRMED",
      },
      include: {
        client: { include: { user: true } },
        formation: true,
      },
    });

    // Notify Client
    if (updatedSession.client?.user?.email) {
      const template = await this.emailTemplatesService.getRenderedTemplate(
        "SESSION_CONFIRMATION",
        {
          formation_title: updatedSession.formation.title,
          date: new Date(updatedSession.date).toLocaleDateString("fr-BE"),
        },
      );
      await this.emailService.sendEmail(
        updatedSession.client.user.email,
        template.subject,
        template.body,
      );
    }

    // Notify Admin (optional, but good for awareness)
    // Could send to a generic admin email if available, or just rely on dashboard.

    return updatedSession;
  }

  async sendOffer(id: string, price: number) {
    await this.findOne(id);

    const updatedSession = await this.prisma.session.update({
      where: { id },
      data: {
        price,
        status: "OFFER_SENT",
      },
      include: {
        client: { include: { user: true } },
        formation: true,
      },
    });

    // Notify Client
    if (updatedSession.client?.user?.email) {
      const priceTtc = (Number(price) * 1.21).toFixed(2);
      const template = await this.emailTemplatesService.getRenderedTemplate(
        "SESSION_OFFER",
        {
          formation_title: updatedSession.formation.title,
          price: price,
          priceTtc: priceTtc,
          link: `${process.env.FRONTEND_URL}/dashboard/sessions/${id}`,
        },
      );
      await this.emailService.sendEmail(
        updatedSession.client.user.email,
        template.subject,
        template.body,
      );
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
      // 1. Demandes à valider (PENDING_APPROVAL)
      this.prisma.session.count({ where: { status: "PENDING_APPROVAL" } }),

      // 2. Sessions sans formateur (CONFIRMED et trainerId est null)
      this.prisma.session.count({
        where: { status: "CONFIRMED", trainerId: null },
      }),

      // 3. Logistique manquante (T+48h, status CONFIRMED et logistique incomplete)
      // Note: We count in JS because of JSON parsing complexity
      this.prisma.session
        .findMany({
          where: {
            status: "CONFIRMED",
            date: { gte: now },
            createdAt: {
              lte: new Date(new Date().setHours(new Date().getHours() - 48)),
            },
          },
        })
        .then(
          (sessions) =>
            sessions.filter((s) => !this.isLogisticsStrictlyComplete(s)).length,
        ),

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

  isLogisticsStrictlyComplete(session: Session): boolean {
    // 1. Location present
    if (!session.location || session.location.trim() === "") return false;

    // 2. Participants present
    if (!session.participants) return false;
    try {
      const participants = JSON.parse(session.participants);
      if (!Array.isArray(participants) || participants.length === 0)
        return false;
    } catch {
      return false;
    }

    if (!session.logistics) return false;

    try {
      const log = JSON.parse(session.logistics);

      // 3. Wifi present (yes/no)
      if (log.wifi !== "yes" && log.wifi !== "no") return false;

      // 4. Subsides present (yes/no)
      if (log.subsidies !== "yes" && log.subsidies !== "no") return false;

      // 5. Material present (Video OR Writing OR NONE flag)
      // "NONE" is stored as ['NONE'] in videoMaterial by the frontend
      const hasVideo =
        Array.isArray(log.videoMaterial) && log.videoMaterial.length > 0;
      const hasWriting =
        Array.isArray(log.writingMaterial) && log.writingMaterial.length > 0;

      if (!hasVideo && !hasWriting) return false;

      return true;
    } catch {
      return false; // Invalid JSON means incomplete
    }
  }

  async generateAttendanceSheet(id: string): Promise<Buffer> {
    const session = await this.findOne(id);

    // Allow if status is confirmed or later
    const validStatuses = [
      "CONFIRMED",
      "PROOF_RECEIVED",
      "INVOICED",
      "ARCHIVED",
    ];
    if (!validStatuses.includes(session.status)) {
      throw new BadRequestException(
        "L'émargement n'est disponible que pour les sessions confirmées",
      );
    }

    return new Promise((resolve, reject) => {
      const DocClass = (PDFDocument as any).default || PDFDocument;
      const doc = new DocClass({ margin: 50, size: "A4" });

      const buffers: Buffer[] = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // --- Header ---
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("FEUILLE D'ÉMARGEMENT", { align: "center" });
      doc.moveDown();

      // --- Session Info ---
      doc.fontSize(11).font("Helvetica");
      const leftX = 50;

      doc.text(`Formation : ${session.formation.title}`, leftX);
      doc.moveDown(0.5);
      doc.text(
        `Date : ${new Date(session.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Paris" })}`,
      );
      doc.moveDown(0.5);

      const slotLabel =
        session.slot === "AM"
          ? "Matin (09:00 - 12:30)"
          : session.slot === "PM"
            ? "Après-midi (13:30 - 17:00)"
            : "Journée complète (09:00 - 17:00)";
      doc.text(`Horaire : ${slotLabel}`);
      doc.moveDown(0.5);

      doc.text(`Client : ${session.client?.companyName || "Non spécifié"}`);
      doc.moveDown(0.5);

      const trainerName = session.trainer
        ? `${session.trainer.firstName} ${session.trainer.lastName}`
        : "Non assigné";
      doc.text(`Formateur : ${trainerName}`);
      doc.moveDown(0.5);

      const location =
        session.location || session.client?.address || "Non spécifié";
      doc.text(`Lieu : ${location}`);
      doc.moveDown(2);

      // --- Table Headers ---
      const tableTop = doc.y;
      const nameX = 50;
      const sign1X = 300;
      const sign2X = 450;

      doc.font("Helvetica-Bold");
      doc.text("Nom / Prénom", nameX, tableTop);

      if (session.slot === "AM") {
        doc.text("Signature (Matin)", sign1X, tableTop);
      } else if (session.slot === "PM") {
        doc.text("Signature (Après-midi)", sign1X, tableTop);
      } else {
        doc.text("Matin", sign1X, tableTop);
        doc.text("Après-midi", sign2X, tableTop);
      }

      doc.moveTo(nameX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown(1.5);
      doc.font("Helvetica");

      // --- Participants ---
      let participants: any[] = [];
      try {
        participants = session.participants
          ? JSON.parse(session.participants)
          : [];
      } catch (e) {
        // ignore
      }

      if (participants.length === 0) {
        doc.text("Aucun participant enregistré.", nameX);
      } else {
        participants.forEach((p) => {
          const currentY = doc.y;

          // Avoid page break in the middle of a row if possible
          if (currentY > 750) {
            doc.addPage();
            // Could re-print headers here
          }

          const name =
            p.name ||
            `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
            "Participant";
          doc.text(name, nameX, currentY + 10);

          // Draw line for signature
          doc
            .moveTo(nameX, currentY + 30)
            .lineTo(550, currentY + 30)
            .strokeColor("#cccccc")
            .stroke();
          doc.strokeColor("black"); // reset

          doc.y = currentY + 35;
        });
      }

      // --- Footer / Trainer Signature ---
      doc.moveDown(4);
      if (doc.y > 700) doc.addPage();

      doc.fontSize(10).font("Helvetica-Oblique");
      doc.text("Signature du Formateur :", 350);
      doc.moveDown(3);
      doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();

      doc.end();
    });
  }
}

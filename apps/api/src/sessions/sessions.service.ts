import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { AdminUpdateSessionDto } from "./dto/admin-update-session.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

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

  async findAll(start?: Date, end?: Date, status?: string) {
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
}

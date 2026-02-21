import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email-templates/email-templates.service";
import { NotificationLogService } from "./notification-log.service";
import { SessionsService } from "../sessions/sessions.service";
import { PdfService, SessionWithRelations } from "../files/pdf.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly logService: NotificationLogService,
    private readonly sessionsService: SessionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log("Starting notification cron job...");
    const sessions = await this.sessionsService.findAll();
    const now = new Date();

    const chunkSize = 50;
    for (let i = 0; i < sessions.length; i += chunkSize) {
      const chunk = sessions.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((session) => this.processSession(session, now)),
      );
    }
    this.logger.log("Notification cron job finished.");
  }

  private async processSession(session: SessionWithRelations, now: Date) {
    if (session.status === "CANCELLED") return;

    try {
      await Promise.all([
        this.checkLogisticsTPlus48(session, now),
        this.checkParticipantsJ15(session, now),
        this.checkParticipantsJ9(session, now),
        this.checkProgramJ30(session, now),
        this.checkMissionJ21(session, now),
        this.checkAttendanceJ7(session, now),
        this.checkProofJPlus1(session, now),
      ]);
    } catch (error) {
      this.logger.error(
        `Error processing session ${session.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  // 1. T+48h: Relance si Logistique vide
  private async checkLogisticsTPlus48(
    session: SessionWithRelations,
    now: Date,
  ) {
    if (this.sessionsService.isLogisticsStrictlyComplete(session)) return;

    const createdAt = new Date(session.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 3600);

    if (hoursDiff >= 48) {
      const type = "LOGISTICS_REMINDER_48H";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.client?.user?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "LOGISTICS_REMINDER_48H",
          {
            companyName: session.client.companyName,
            date: new Date(session.date).toLocaleDateString("fr-BE"),
          },
        );
        await this.emailService.sendEmail(
          session.client.user.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.client.user.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
        this.logger.log(`Sent logistics reminder for session ${session.id}`);
      }
    }
  }

  // 2. J-15: Alerte si Participants vides
  private async checkParticipantsJ15(session: SessionWithRelations, now: Date) {
    if (!this.isEmpty(session.participants)) return;

    const days = this.getDaysUntil(new Date(session.date), now);
    if (days <= 15 && days > 9) {
      const type = "PARTICIPANTS_ALERT_J15";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.client?.user?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "PARTICIPANTS_ALERT_J15",
          {
            companyName: session.client.companyName,
          },
        );
        await this.emailService.sendEmail(
          session.client.user.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.client.user.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
      }
    }
  }

  // 3. J-9: Alerte Critique si Participants vides
  private async checkParticipantsJ9(session: SessionWithRelations, now: Date) {
    if (!this.isEmpty(session.participants)) return;

    const days = this.getDaysUntil(new Date(session.date), now);
    if (days <= 9) {
      const type = "PARTICIPANTS_CRITICAL_J9";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.client?.user?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "PARTICIPANTS_CRITICAL_J9",
          {
            companyName: session.client.companyName,
          },
        );
        await this.emailService.sendEmail(
          session.client.user.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.client.user.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
      }
    }
  }

  // 4. J-30: Envoi PDF Programme (Client)
  private async checkProgramJ30(session: SessionWithRelations, now: Date) {
    const days = this.getDaysUntil(new Date(session.date), now);
    if (days <= 30) {
      const type = "PROGRAM_SEND_J30";
      if (await this.logService.hasLog(type, session.id)) return;

      const programLink = session.formation.programLink;
      if (programLink && session.client?.user?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "PROGRAM_SEND_J30",
          {
            programLink,
          },
        );
        await this.emailService.sendEmail(
          session.client.user.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.client.user.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
      }
    }
  }

  // 5. J-21: Rappel Mission avec détails (Formateur)
  private async checkMissionJ21(session: SessionWithRelations, now: Date) {
    const days = this.getDaysUntil(new Date(session.date), now);
    if (days <= 21) {
      const type = "MISSION_REMINDER_J21";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.trainer?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "MISSION_REMINDER_J21",
          {
            firstName: session.trainer.firstName,
            date: new Date(session.date).toLocaleDateString("fr-BE"),
            companyName: session.client?.companyName || "Inconnu",
            location: session.location || session.client?.address || "À confirmer",
          },
        );
        await this.emailService.sendEmail(
          session.trainer.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.trainer.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
      }
    }
  }

  // 6. J-7: Envoi Pack Documentaire (Formateur) + Verrouillage (implied)
  private async checkAttendanceJ7(session: SessionWithRelations, now: Date) {
    const days = this.getDaysUntil(new Date(session.date), now);
    if (days <= 7) {
      const type = "DOC_PACK_J7";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.trainer?.email) {
        const pdfBuffer =
          await this.pdfService.generateAttendanceSheet(session);

        const template = await this.emailTemplatesService.getRenderedTemplate(
          "DOC_PACK_J7",
          {
            firstName: session.trainer.firstName,
            date: new Date(session.date).toLocaleDateString("fr-BE"),
          },
        );

        await this.emailService.sendEmailWithAttachments(
          session.trainer.email,
          template.subject,
          template.body,
          [{ filename: "emargement.pdf", content: pdfBuffer }],
        );

        await this.logService.createLog({
          type,
          recipient: session.trainer.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
      }
    }
  }

  // 7. J+1: Rappel Preuve (Formateur)
  private async checkProofJPlus1(session: SessionWithRelations, now: Date) {
    // Si la preuve est déjà là ou session annulée (déjà filtré en haut mais double check), on ne fait rien
    if (session.proofUrl) return;

    const sessionDate = new Date(session.date);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Vérifie si la session a eu lieu "hier" (même jour calendaire)
    if (
      sessionDate.getDate() === yesterday.getDate() &&
      sessionDate.getMonth() === yesterday.getMonth() &&
      sessionDate.getFullYear() === yesterday.getFullYear()
    ) {
      const type = "PROOF_REMINDER_J1";
      if (await this.logService.hasLog(type, session.id)) return;

      if (session.trainer?.email) {
        const template = await this.emailTemplatesService.getRenderedTemplate(
          "PROOF_REMINDER_J1",
          {
            firstName: session.trainer.firstName,
            date: sessionDate.toLocaleDateString("fr-BE"),
            companyName: session.client?.companyName || "Inconnu",
          },
        );
        await this.emailService.sendEmail(
          session.trainer.email,
          template.subject,
          template.body,
        );
        await this.logService.createLog({
          type,
          recipient: session.trainer.email,
          status: "SENT",
          metadata: JSON.stringify({ sessionId: session.id }),
        });
        this.logger.log(`Sent proof reminder for session ${session.id}`);
      }
    }
  }

  private getDaysUntil(date: Date, now: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.ceil((date.getTime() - now.getTime()) / oneDay);
  }

  private isEmpty(val: string | null): boolean {
    if (!val) return true;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length === 0) return true;
      if (typeof parsed === "object" && Object.keys(parsed).length === 0)
        return true;
    } catch {
      return val.trim() === "";
    }
    return false;
  }
}

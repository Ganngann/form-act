import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailService } from "../email/email.service";
import { NotificationLogService } from "./notification-log.service";
import { SessionsService } from "../sessions/sessions.service";
import { PdfService, SessionWithRelations } from "../files/pdf.service";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly logService: NotificationLogService,
    private readonly sessionsService: SessionsService,
    private readonly pdfService: PdfService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log("Starting notification cron job...");
    const sessions = await this.sessionsService.findAll();
    const now = new Date();

    for (const session of sessions) {
      if (session.status === "CANCELLED") continue;

      try {
        await this.checkLogisticsTPlus48(session, now);
        await this.checkParticipantsJ15(session, now);
        await this.checkParticipantsJ9(session, now);
        await this.checkProgramJ30(session, now);
        await this.checkMissionJ21(session, now);
        await this.checkAttendanceJ7(session, now);
        await this.checkProofJPlus1(session, now);
      } catch (error) {
        this.logger.error(
          `Error processing session ${session.id}: ${error.message}`,
          error.stack,
        );
      }
    }
    this.logger.log("Notification cron job finished.");
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
        await this.emailService.sendEmail(
          session.client.user.email,
          "Action requise : Informations logistiques manquantes",
          `<p>Bonjour ${session.client.companyName},</p>
           <p>Merci de compléter les informations logistiques pour votre session de formation du ${new Date(
             session.date,
           ).toLocaleDateString()}.</p>
           <p>Cordialement,<br>L'équipe Formact</p>`,
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
        await this.emailService.sendEmail(
          session.client.user.email,
          "Rappel : Liste des participants attendue",
          `<p>Bonjour ${session.client.companyName},</p>
           <p>La formation approche (J-15). Merci de renseigner la liste des participants.</p>`,
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
        await this.emailService.sendEmail(
          session.client.user.email,
          "URGENT : Liste des participants manquante",
          `<p>Bonjour ${session.client.companyName},</p>
           <p>Sans liste de participants sous 24h, la session risque d'être annulée.</p>`,
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
        await this.emailService.sendEmail(
          session.client.user.email,
          "Votre programme de formation",
          `<p>Bonjour,</p>
           <p>Voici le programme pour votre formation à venir : <a href="${programLink}">Télécharger le programme</a></p>`,
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
        await this.emailService.sendEmail(
          session.trainer.email,
          "Rappel de votre mission",
          `<p>Bonjour ${session.trainer.firstName},</p>
           <p>Rappel pour la session du ${new Date(session.date).toLocaleDateString()}.</p>
           <p>Client : ${session.client?.companyName}</p>
           <p>Lieu : ${session.location || session.client?.address}</p>`,
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

        await this.emailService.sendEmailWithAttachments(
          session.trainer.email,
          "Votre Pack Documentaire (Feuille d'émargement)",
          `<p>Bonjour ${session.trainer.firstName},</p>
             <p>Voici la feuille d'émargement pour la session du ${new Date(
               session.date,
             ).toLocaleDateString()}.</p>
             <p>Rappel : Les modifications client sont désormais verrouillées.</p>`,
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
        await this.emailService.sendEmail(
          session.trainer.email,
          "Action requise : Dépôt de la feuille d'émargement",
          `<p>Bonjour ${session.trainer.firstName},</p>
           <p>La session de formation du ${sessionDate.toLocaleDateString()} pour le client ${
             session.client?.companyName || "Inconnu"
           } est terminée.</p>
           <p>Merci de déposer la feuille d'émargement signée sur votre espace formateur afin de déclencher la facturation.</p>
           <p>Cordialement,<br>L'équipe Formact</p>`,
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

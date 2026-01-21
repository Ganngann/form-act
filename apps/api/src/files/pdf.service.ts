import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { Session, Client, Formation, Formateur, User } from "@prisma/client";

// Define a type that includes relations
export type SessionWithRelations = Session & {
  client: (Client & { user: User }) | null;
  formation: Formation;
  trainer: Formateur;
};

@Injectable()
export class PdfService {
  async generateAttendanceSheet(
    session: SessionWithRelations,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.fontSize(20).text("Feuille d'émargement", { align: "center" });
      doc.moveDown();

      // Session Info
      doc.fontSize(12).text(`Formation: ${session.formation.title}`);

      // Formatting date manually to avoid locale issues if not available
      const date = new Date(session.date);
      const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;

      doc.text(`Date: ${dateStr}`);
      doc.text(
        `Formateur: ${session.trainer.firstName} ${session.trainer.lastName}`,
      );
      doc.text(`Client: ${session.client?.companyName || "N/A"}`);
      doc.text(`Lieu: ${session.location || session.client?.address || "N/A"}`);
      doc.moveDown();

      // Table Header
      const startX = 50;
      let currentY = doc.y;

      doc.text("Participant", startX, currentY);
      doc.text("Signature Matin", startX + 200, currentY);
      doc.text("Signature Après-midi", startX + 350, currentY);

      currentY += 20;
      doc.moveTo(startX, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // Participants
      let participants: { name?: string; email?: string }[] = [];
      try {
        if (session.participants) {
          participants = JSON.parse(session.participants);
        }
      } catch {
        participants = [];
      }

      if (participants.length === 0) {
        doc.text("Aucun participant enregistré", startX, currentY);
      } else {
        participants.forEach((p) => {
          doc.text(p.name || p.email || "Inconnu", startX, currentY);
          // Draw boxes for signature
          doc.rect(startX + 200, currentY - 5, 100, 30).stroke();
          doc.rect(startX + 350, currentY - 5, 100, 30).stroke();
          currentY += 40;
        });
      }

      doc.end();
    });
  }
}

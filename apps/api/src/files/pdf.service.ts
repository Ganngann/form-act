import { Injectable } from "@nestjs/common";
import * as PDFDocument from "pdfkit";
import { Session, Client, Formation, Formateur, User } from "@prisma/client";

// Define a type that includes relations
export type SessionWithRelations = Session & {
  client: (Client & { user: User }) | null;
  formation: Formation;
  trainer: Formateur | null;
};

@Injectable()
export class PdfService {
  async generateAttendanceSheet(
    session: SessionWithRelations,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Handle interop issues with PDFDocument
      const PDFDoc = (PDFDocument as any).default || PDFDocument;
      const doc = new PDFDoc({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // --- Header ---
      doc.fontSize(20).text("Feuille d'émargement", { align: "center" });
      doc.moveDown(2);

      // --- Session Info Section ---
      const infoX = 50;
      let infoY = doc.y;
      const labelWidth = 80;

      // Helper to draw a line of info
      const drawInfo = (label: string, value: string) => {
        doc.font("Helvetica-Bold").fontSize(10).text(label, infoX, infoY);
        doc
          .font("Helvetica")
          .text(value, infoX + labelWidth, infoY, { width: 400 });
        infoY += 15;
      };

      // Date Formatting
      const date = new Date(session.date);
      const dateStr = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      // Capitalize first letter
      const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      // Time Slot
      let timeSlot = "09:00 - 17:00";
      if (session.slot === "AM") timeSlot = "09:00 - 12:30";
      if (session.slot === "PM") timeSlot = "13:30 - 17:00";

      drawInfo("Formation :", session.formation.title);
      drawInfo("Date :", formattedDate);
      drawInfo("Horaire :", timeSlot);
      drawInfo(
        "Formateur :",
        session.trainer
          ? `${session.trainer.firstName} ${session.trainer.lastName}`
          : "Non assigné",
      );
      drawInfo(
        "Client :",
        session.client
          ? `${session.client.companyName} (${session.client.user.name || "N/A"})`
          : "N/A",
      );
      drawInfo(
        "Lieu :",
        session.location || session.client?.address || "Non spécifié",
      );

      doc.moveDown(2);

      // --- Participants Table ---
      const tableTop = doc.y;
      const colNameX = 50;
      const colMorningX = 250;
      const colAfternoonX = 400;
      const rowHeight = 40;

      // Table Header
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("Participant", colNameX, tableTop);
      doc.text("Matin (Signature)", colMorningX, tableTop);
      doc.text("Après-midi (Signature)", colAfternoonX, tableTop);

      let currentY = tableTop + 20;

      // Draw Header Line
      doc
        .moveTo(colNameX, currentY - 5)
        .lineTo(550, currentY - 5)
        .lineWidth(1)
        .stroke();

      // Parse Participants
      let participants: {
        firstName?: string;
        lastName?: string;
        name?: string;
        email?: string;
      }[] = [];
      try {
        if (session.participants) {
          participants = JSON.parse(session.participants);
        }
      } catch {
        participants = [];
      }

      doc.font("Helvetica").fontSize(10);

      if (participants.length === 0) {
        currentY += 10;
        doc.text(
          "Aucun participant enregistré pour le moment.",
          colNameX,
          currentY,
        );
      } else {
        participants.forEach((p) => {
          // Check for page break
          if (currentY + rowHeight > doc.page.height - 50) {
            doc.addPage();
            currentY = 50; // Reset Y on new page
          }

          // Name Logic: Try structured first/last, fallback to name, fallback to email
          let displayName = "Inconnu";
          if (p.firstName || p.lastName) {
            displayName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
          } else if (p.name) {
            displayName = p.name;
          } else if (p.email) {
            displayName = p.email;
          }

          // Center text vertically in the row
          doc.text(displayName, colNameX, currentY + 12);

          // Draw Signature Boxes
          // Morning Box
          doc
            .rect(colMorningX, currentY, 120, 30)
            .lineWidth(0.5)
            .strokeColor("#cccccc")
            .stroke();

          // Afternoon Box
          doc
            .rect(colAfternoonX, currentY, 120, 30)
            .lineWidth(0.5)
            .strokeColor("#cccccc")
            .stroke();

          // Reset stroke color for text
          doc.strokeColor("black");

          currentY += rowHeight;
        });
      }

      // --- Footer ---
      const bottomY = doc.page.height - 50;
      doc.fontSize(8).text("Généré par la plateforme de formation", 50, bottomY, {
        align: "center",
        width: 500,
      });

      doc.end();
    });
  }
}

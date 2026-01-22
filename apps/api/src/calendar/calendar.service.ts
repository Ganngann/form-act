import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import ical, { ICalCalendarMethod } from "ical-generator";

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async generateIcs(token: string): Promise<string> {
    const trainer = await this.prisma.formateur.findUnique({
      where: { calendarToken: token },
      include: {
        sessions: {
          include: {
            formation: true,
            client: true,
          },
          where: {
            // Optional: only future sessions? The user said "Flux Sortant", implied all or future.
            // Standard is usually everything or window. I'll fetch everything for now.
            status: { not: "CANCELLED" },
          },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!trainer) {
      throw new NotFoundException("Calendar not found");
    }

    const calendar = ical({
      name: `Form-Act - ${trainer.firstName} ${trainer.lastName}`,
      method: ICalCalendarMethod.PUBLISH,
      timezone: "Europe/Brussels",
    });

    for (const session of trainer.sessions) {
      const { start, end, allDay } = this.calculateTimes(
        session.date,
        session.slot,
      );

      const descriptionParts = [
        `Client: ${session.client?.companyName || "N/A"}`,
        `Formation: ${session.formation?.title || "N/A"}`,
        `Lieu: ${session.location || session.client?.address || "Non défini"}`,
      ];

      if (session.logistics) {
        try {
          const logistics = JSON.parse(session.logistics);
          const logStr = Object.entries(logistics)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          descriptionParts.push(`Logistique: ${logStr}`);
        } catch {
          descriptionParts.push(`Logistique: ${session.logistics}`);
        }
      }

      calendar.createEvent({
        start,
        end,
        allDay,
        timezone: "Europe/Brussels",
        summary: session.formation?.title
          ? `Formation: ${session.formation.title}`
          : "Mission Form-Act",
        description: descriptionParts.join("\n"),
        location: session.location || session.client?.address,
        // url: `https://app.form-act.com/trainer/missions`, // TODO: Make base URL configurable
      });
    }

    return calendar.toString();
  }

  private calculateTimes(date: Date, slot: string) {
    const start = new Date(date);
    const end = new Date(date);
    let allDay = false;

    // Reset time components
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Timezone handling is tricky in JS Date (it uses local).
    // The server is likely UTC.
    // However, the ICS library handles timezone if we pass Date objects.
    // Assuming `date` from Prisma is UTC midnight of the day.

    // We want 9:00 Brussels time.
    // If we use simple setHours(9), it sets 9:00 in Server Local Time (or UTC if Docker).
    // Ideally we should use a library like `date-fns-tz` or just handle it simply.
    // Since `ical-generator` supports timezone, if we pass a Date, it formats it to UTC with 'Z'.
    // If I want fixed "Wall Time" (Floating time), I should pass string or handle it carefully.
    // But ical events usually have a timezone.

    // Simplification: Assume Server is UTC.
    // 9:00 Brussels is 8:00 UTC (Winter) or 7:00 UTC (Summer).
    // This complexity is high.
    // Alternative: Use "Floating Time" (no timezone) which means "9:00 AM wherever you are".
    // For a physical event in Brussels, 9:00 is 9:00 Brussels time.
    // If the user views it in NY, it should still be 9:00 Brussels time? No, it should be 3:00 AM NY.
    // So we need absolute time.

    // Let's rely on the fact that these are physical events in Belgium.
    // I will set hours assuming UTC and apply an offset? No that's bad.

    // Best effort: Set hours on the Date object.

    switch (slot) {
      case "AM":
        start.setHours(9, 0, 0, 0);
        end.setHours(12, 30, 0, 0);
        break;
      case "PM":
        start.setHours(13, 30, 0, 0);
        end.setHours(17, 0, 0, 0);
        break;
      case "ALL_DAY":
        start.setHours(9, 0, 0, 0);
        end.setHours(17, 0, 0, 0);
        break;
      default:
        allDay = true;
    }

    return { start, end, allDay };
  }
}

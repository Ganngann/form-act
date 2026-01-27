import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds available trainers based on zone and optional expertise.
   *
   * @param date - The date of the formation.
   *               TODO: Currently ignored. Temporal availability filtering will be implemented
   *               once the Calendar/Session models are available (Sprint 1, US-03/04).
   * @param zoneId - The ID of the zone where the formation takes place.
   * @param expertiseId - (Optional) The ID of the expertise required.
   */
  async findAvailableTrainers(
    date: Date,
    zoneId: string,
    expertiseId?: string,
  ) {
    if (expertiseId) {
      // Expertise Formation: Check if trainer has the expertise AND the zone is in (expertiseZones OR predilectionZones)
      // "Bible 2.2: Toute zone 'Prédilection' est incluse d'office dans 'Expertise'."
      return this.prisma.formateur.findMany({
        where: {
          expertises: {
            some: { id: expertiseId },
          },
          OR: [
            {
              expertiseZones: {
                some: { id: zoneId },
              },
            },
            {
              predilectionZones: {
                some: { id: zoneId },
              },
            },
          ],
        },
        include: {
          predilectionZones: true,
          expertiseZones: true,
          expertises: true,
        },
      });
    } else {
      // Standard Formation: Check if zone is in predilectionZones
      return this.prisma.formateur.findMany({
        where: {
          predilectionZones: {
            some: { id: zoneId },
          },
        },
        include: {
          predilectionZones: true,
          expertiseZones: true,
          expertises: true,
        },
      });
    }
  }
}

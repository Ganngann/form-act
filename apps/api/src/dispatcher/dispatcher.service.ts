import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

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

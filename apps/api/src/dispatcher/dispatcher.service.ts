import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds available trainers based on zone and formation type (Expertise vs Standard).
   *
   * @param date - The date of the formation.
   * @param zoneId - The ID of the zone where the formation takes place.
   * @param formationId - The ID of the formation to be dispensed.
   */
  async findAvailableTrainers(date: Date, zoneId: string, formationId: string) {
    const formation = await this.prisma.formation.findUnique({
      where: { id: formationId },
    });

    if (!formation) {
      throw new BadRequestException("Formation not found");
    }

    if (formation.isExpertise) {
      // Expertise Formation: Check if trainer is authorized AND the zone is in (expertiseZones OR predilectionZones)
      return this.prisma.formateur.findMany({
        where: {
          authorizedFormations: {
            some: { id: formationId },
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
        },
      });
    }
  }
}

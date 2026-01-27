import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds available trainers based on zone and formation requirements.
   *
   * @param date - The date of the formation.
   * @param zoneId - The ID of the zone where the formation takes place.
   * @param formationId - (Optional) The ID of the formation to check for specific expertise requirements.
   */
  async findAvailableTrainers(
    date: Date,
    zoneId: string,
    formationId?: string,
  ) {
    let isExpertise = false;
    let allowedTrainerIds: string[] = [];

    if (formationId) {
      const formation = await this.prisma.formation.findUnique({
        where: { id: formationId },
        include: { trainers: true },
      });
      if (formation && formation.isExpertise) {
        isExpertise = true;
        allowedTrainerIds = formation.trainers.map((t) => t.id);
      }
    }

    if (isExpertise) {
      // Expertise Formation:
      // 1. Must be in the allowed list (allowedTrainerIds)
      // 2. Must cover the zone in ExpertiseZones (or PredilectionZones, inherited)
      return this.prisma.formateur.findMany({
        where: {
          id: { in: allowedTrainerIds },
          OR: [
            { expertiseZones: { some: { id: zoneId } } },
            { predilectionZones: { some: { id: zoneId } } },
          ],
        },
        include: {
          predilectionZones: true,
          expertiseZones: true,
          formations: true,
        },
      });
    } else {
      // Standard Formation:
      // Any trainer covering the zone in PredilectionZones
      return this.prisma.formateur.findMany({
        where: {
          predilectionZones: {
            some: { id: zoneId },
          },
        },
        include: {
          predilectionZones: true,
          expertiseZones: true,
          formations: true,
        },
      });
    }
  }
}

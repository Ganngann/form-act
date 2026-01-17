import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  async findAvailableTrainers(zoneId: string, expertiseId?: string) {
    if (expertiseId) {
      // Expertise Formation: Check if trainer has the expertise AND the zone is in expertiseZones
      return this.prisma.formateur.findMany({
        where: {
          expertises: {
            some: { id: expertiseId },
          },
          expertiseZones: {
            some: { id: zoneId },
          },
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DispatcherService } from '../dispatcher/dispatcher.service';

@Injectable()
export class FormationsService {
  constructor(
    private prisma: PrismaService,
    private dispatcherService: DispatcherService,
  ) {}

  async findAll(zoneId?: string) {
    const formations = await this.prisma.formation.findMany({
      include: {
        expertise: true,
      },
    });

    if (!zoneId) {
      return formations;
    }

    const availableFormations = [];
    const date = new Date(); // Current date, as date logic isn't fully implemented yet but required by signature

    for (const formation of formations) {
      const trainers = await this.dispatcherService.findAvailableTrainers(
        date,
        zoneId,
        formation.expertiseId || undefined,
      );

      if (trainers.length > 0) {
        availableFormations.push(formation);
      }
    }

    return availableFormations;
  }
}

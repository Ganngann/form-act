import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainersService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(trainerId: string, month?: string) {
    const where: any = {
      trainerId,
    };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(monthNum)) {
         const startDate = new Date(year, monthNum - 1, 1);
         // Get last day of the month by going to day 0 of next month
         const endDate = new Date(year, monthNum, 0, 23, 59, 59);
         where.date = {
            gte: startDate,
            lte: endDate,
         };
      }
    } else {
        const today = new Date();
        today.setHours(0,0,0,0);
        where.date = {
            gte: today,
        };
    }

    return this.prisma.session.findMany({
      where,
      select: {
        id: true,
        date: true,
        slot: true,
        status: true,
        formation: {
            select: {
                title: true,
                durationType: true
            }
        }
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(start?: Date, end?: Date) {
    const where: Prisma.SessionWhereInput = {};

    if (start && end) {
      where.date = {
        gte: start,
        lte: end,
      };
    } else if (start) {
        where.date = { gte: start };
    } else if (end) {
        where.date = { lte: end };
    }

    return this.prisma.session.findMany({
      where,
      include: {
        client: {
            include: { user: true }
        },
        trainer: true,
        formation: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        client: {
          include: { user: true },
        },
        trainer: true,
        formation: true,
      },
    });
  }
}

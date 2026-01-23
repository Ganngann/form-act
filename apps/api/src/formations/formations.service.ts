import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: string, search?: string) {
    const where: Prisma.FormationWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        // Note: 'mode: insensitive' is not supported by Prisma for SQLite provider.
        // However, SQLite 'LIKE' is case-insensitive for ASCII characters by default.
        // When migrating to Postgres, add { mode: 'insensitive' } here.
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return this.prisma.formation.findMany({
      where,
      include: {
        category: true,
        expertise: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.formation.findUnique({
      where: { id },
      include: {
        category: true,
        expertise: true,
      },
    });
  }
}

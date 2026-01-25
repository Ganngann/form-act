import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateFormationDto } from "./dto/create-formation.dto";
import { UpdateFormationDto } from "./dto/update-formation.dto";

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFormationDto) {
    const existing = await this.prisma.formation.findUnique({
      where: { title: data.title },
    });
    if (existing) {
      throw new BadRequestException("Formation with this title already exists");
    }

    return this.prisma.formation.create({
      data,
    });
  }

  async update(id: string, data: UpdateFormationDto) {
    if (data.title) {
      const existing = await this.prisma.formation.findUnique({
        where: { title: data.title },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          "Formation with this title already exists",
        );
      }
    }
    return this.prisma.formation.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const sessionCount = await this.prisma.session.count({
      where: { formationId: id },
    });
    if (sessionCount > 0) {
      throw new BadRequestException(
        "Cannot delete formation with linked sessions. Archive it instead.",
      );
    }
    return this.prisma.formation.delete({
      where: { id },
    });
  }

  async findAll(categoryId?: string, search?: string, includeHidden: boolean = false) {
    const where: Prisma.FormationWhereInput = {};

    if (!includeHidden) {
      where.isPublished = true;
    }

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

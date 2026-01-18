import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};

    return this.prisma.formation.findMany({
      where,
      include: {
        category: true,
        expertise: true, // Keeping it for now as per plan, but mainly using category
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

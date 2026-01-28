import { Injectable, BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { AuthService } from "../auth/auth.service";
import * as crypto from "crypto";

@Injectable()
export class TrainersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll(skip: number = 0, take: number = 10, search?: string) {
    const where: Prisma.FormateurWhereInput = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.formateur.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.formateur.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string) {
    const formateur = await this.prisma.formateur.findUnique({
      where: { id },
      include: {
        user: true,
        predilectionZones: true,
        expertiseZones: true,
        authorizedFormations: true,
      },
    });
    if (!formateur) throw new BadRequestException("Trainer not found");
    return formateur;
  }

  async create(data: CreateTrainerDto) {
    const tempPassword = "password123";
    const hashedPassword = await this.authService.hashPassword(tempPassword);

    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new BadRequestException("User with this email already exists");
      }

      const existingTrainer = await tx.formateur.findUnique({
        where: { email: data.email },
      });
      if (existingTrainer) {
        throw new BadRequestException("Trainer with this email already exists");
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          password: hashedPassword,
          role: "TRAINER",
        },
      });

      const formateur = await tx.formateur.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userId: user.id,
        },
      });

      return formateur;
    });
  }

  async update(id: string, data: UpdateTrainerDto) {
    return this.prisma.$transaction(async (tx) => {
      const trainer = await tx.formateur.findUnique({
        where: { id },
        include: { predilectionZones: true },
      });
      if (!trainer) throw new BadRequestException("Trainer not found");

      const updateData: Prisma.FormateurUpdateInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
      };

      if (data.predilectionZones) {
        updateData.predilectionZones = {
          set: data.predilectionZones.map((id) => ({ id })),
        };
      }

      if (data.expertiseZones) {
        const predilectionIds = data.predilectionZones
          ? data.predilectionZones
          : trainer.predilectionZones.map((z) => z.id);

        const validExpertiseIds = data.expertiseZones.filter(
          (id) => !predilectionIds.includes(id),
        );
        updateData.expertiseZones = {
          set: validExpertiseIds.map((id) => ({ id })),
        };
      }

      const updatedTrainer = await tx.formateur.update({
        where: { id },
        data: updateData,
      });

      if (trainer.userId) {
        await tx.user.update({
          where: { id: trainer.userId },
          data: {
            email: data.email,
            name: `${data.firstName || trainer.firstName} ${data.lastName || trainer.lastName}`,
          },
        });
      }

      return updatedTrainer;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const trainer = await tx.formateur.findUnique({ where: { id } });
      if (!trainer) throw new BadRequestException("Trainer not found");

      const sessionCount = await tx.session.count({ where: { trainerId: id } });
      if (sessionCount > 0) {
        throw new BadRequestException(
          "Cannot delete trainer with existing sessions",
        );
      }

      await tx.formateur.delete({ where: { id } });

      if (trainer.userId) {
        await tx.user.delete({ where: { id: trainer.userId } });
      }

      return { success: true };
    });
  }

  async getAvailability(trainerId: string, month?: string) {
    const where: Prisma.SessionWhereInput = {
      trainerId,
    };

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
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
      today.setHours(0, 0, 0, 0);
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
            durationType: true,
          },
        },
      },
    });
  }

  async getMissions(trainerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.session.findMany({
      where: {
        trainerId,
        date: {
          gte: today,
        },
      },
      include: {
        formation: true,
        client: {
          include: { user: true },
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async updateAvatar(id: string, avatarUrl: string) {
    return this.prisma.formateur.update({
      where: { id },
      data: { avatarUrl },
    });
  }

  async ensureCalendarToken(id: string) {
    const trainer = await this.prisma.formateur.findUnique({
      where: { id },
      select: { calendarToken: true },
    });
    if (!trainer) throw new BadRequestException("Trainer not found");

    if (trainer.calendarToken) {
      return trainer.calendarToken;
    }

    const token = crypto.randomUUID();
    await this.prisma.formateur.update({
      where: { id },
      data: { calendarToken: token },
    });
    return token;
  }
}

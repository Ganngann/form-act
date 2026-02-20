import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateClientProfileDto } from "./dto/update-client-profile.dto";
import { CreateClientProfileDto } from "./dto/create-client-profile.dto";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createProfile(userId: string, data: CreateClientProfileDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { userId },
    });

    if (existingClient) {
      throw new BadRequestException(
        "Client profile already exists for this user.",
      );
    }

    return this.prisma.client.create({
      data: {
        userId,
        companyName: data.companyName,
        vatNumber: data.vatNumber,
        address: data.address,
      },
      include: {
        user: { select: { email: true } },
      },
    });
  }

  async findByUserId(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });
    if (!client) throw new NotFoundException("Client profile not found");
    return client;
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        sessions: {
          include: {
            formation: true,
            trainer: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });
    if (!client) throw new NotFoundException("Client not found");
    return client;
  }

  async updateProfile(
    userId: string,
    data: UpdateClientProfileDto,
    modifierName: string,
  ) {
    const client = await this.findByUserId(userId);
    const changes = [];

    // Check for changes in Client fields
    if (data.companyName !== client.companyName) {
      changes.push({
        field: "Nom Entreprise",
        old: client.companyName,
        new: data.companyName,
      });
    }
    if (data.vatNumber !== client.vatNumber) {
      changes.push({
        field: "TVA",
        old: client.vatNumber,
        new: data.vatNumber,
      });
    }
    if (data.address !== client.address) {
      changes.push({
        field: "Adresse",
        old: client.address,
        new: data.address,
      });
    }

    // Check for changes in User email
    if (data.email && data.email !== client.user.email) {
      changes.push({
        field: "Email",
        old: client.user.email,
        new: data.email,
      });
    }

    if (changes.length === 0) {
      return client;
    }

    // Update Audit Log
    const currentLog = client.auditLog ? JSON.parse(client.auditLog) : [];
    const newEntry = {
      date: new Date(),
      by: modifierName,
      changes,
    };
    const updatedLog = JSON.stringify([newEntry, ...currentLog]);

    // Perform Update Transaction
    return this.prisma.$transaction(async (tx) => {
      // Update User email if needed
      if (data.email && data.email !== client.user.email) {
        await tx.user.update({
          where: { id: client.userId },
          data: { email: data.email },
        });
      }

      // Update Client data
      return tx.client.update({
        where: { id: client.id },
        data: {
          companyName: data.companyName,
          vatNumber: data.vatNumber,
          address: data.address,
          auditLog: updatedLog,
        },
      });
    });
  }

  async updateById(
    id: string,
    data: UpdateClientProfileDto,
    modifierName: string,
  ) {
    const client = await this.findOne(id);
    const changes = [];

    if (data.companyName !== client.companyName) {
      changes.push({
        field: "Nom Entreprise",
        old: client.companyName,
        new: data.companyName,
      });
    }
    if (data.vatNumber !== client.vatNumber) {
      changes.push({
        field: "TVA",
        old: client.vatNumber,
        new: data.vatNumber,
      });
    }
    if (data.address !== client.address) {
      changes.push({
        field: "Adresse",
        old: client.address,
        new: data.address,
      });
    }
    if (data.email && data.email !== client.user.email) {
      changes.push({ field: "Email", old: client.user.email, new: data.email });
    }

    if (changes.length === 0) return client;

    const currentLog = client.auditLog ? JSON.parse(client.auditLog) : [];
    const newEntry = { date: new Date(), by: modifierName, changes };
    const updatedLog = JSON.stringify([newEntry, ...currentLog]);

    return this.prisma.$transaction(async (tx) => {
      if (data.email && data.email !== client.user.email) {
        await tx.user.update({
          where: { id: client.userId },
          data: { email: data.email },
        });
      }

      return tx.client.update({
        where: { id },
        data: {
          companyName: data.companyName,
          vatNumber: data.vatNumber,
          address: data.address,
          auditLog: updatedLog,
        },
      });
    });
  }
}

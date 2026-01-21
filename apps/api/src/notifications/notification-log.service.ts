import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class NotificationLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: Prisma.NotificationLogCreateInput) {
    return this.prisma.notificationLog.create({
      data,
    });
  }
}

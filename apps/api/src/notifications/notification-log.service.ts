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

  async hasLog(type: string, sessionId: string): Promise<boolean> {
    const count = await this.prisma.notificationLog.count({
      where: {
        type,
        metadata: {
          contains: sessionId,
        },
      },
    });
    return count > 0;
  }

  async getLogsForSessions(sessionIds: string[]): Promise<Set<string>> {
    const existingLogs = new Set<string>();
    const BATCH_SIZE = 50;

    for (let i = 0; i < sessionIds.length; i += BATCH_SIZE) {
      const batch = sessionIds.slice(i, i + BATCH_SIZE);
      const logs = await this.prisma.notificationLog.findMany({
        where: {
          OR: batch.map((id) => ({
            metadata: {
              contains: id,
            },
          })),
        },
        select: {
          type: true,
          metadata: true,
        },
      });

      for (const log of logs) {
        if (!log.metadata) continue;
        for (const id of batch) {
          if (log.metadata.includes(id)) {
            existingLogs.add(`${log.type}:${id}`);
          }
        }
      }
    }
    return existingLogs;
  }
}

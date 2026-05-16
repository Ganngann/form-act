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
    const logs = await this.prisma.notificationLog.findMany({
      where: {
        OR: sessionIds.map((id) => ({
          metadata: { contains: id },
        })),
      },
      select: {
        type: true,
        metadata: true,
      },
    });

    const cache = new Set<string>();
    for (const log of logs) {
      if (log.metadata) {
        try {
          const parsed = JSON.parse(log.metadata);
          if (parsed.sessionId) {
            cache.add(`${parsed.sessionId}:${log.type}`);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return cache;
  }
}

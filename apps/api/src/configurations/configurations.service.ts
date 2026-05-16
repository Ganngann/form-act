import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConfigurationsService {
  constructor(private prisma: PrismaService) {}

  async getConfiguration(key: string) {
    try {
      const config = await this.prisma.siteConfiguration.findUnique({
        where: { key },
      });

      if (!config) {
        return null;
      }

      return JSON.parse(config.value);
    } catch (e) {
      console.error(
        `[ConfigurationsService] Error fetching key "${key}":`,
        e.message,
      );
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateConfiguration(key: string, value: any) {
    // Ensure value is an object/valid JSON
    const stringValue = JSON.stringify(value);

    return this.prisma.siteConfiguration.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });
  }
}

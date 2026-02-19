import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ConfigurationsService {
  constructor(private prisma: PrismaService) {}

  async getConfiguration(key: string) {
    const config = await this.prisma.siteConfiguration.findUnique({
      where: { key },
    });

    if (!config) {
      // Return empty JSON object if not found, or throw?
      // For CMS, returning default/empty might be safer for frontend not to crash
      // But let's return null and let controller decide, or just return {}
      return {};
    }

    try {
      return JSON.parse(config.value);
    } catch (e) {
      console.error(`Failed to parse configuration for key ${key}`, e);
      return {};
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

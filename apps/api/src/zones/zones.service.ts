import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Zone } from "@prisma/client";

@Injectable()
export class ZonesService {
  private zonesPromise: Promise<Zone[]> | null = null;

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Zone[]> {
    if (this.zonesPromise) {
      return this.zonesPromise;
    }

    this.zonesPromise = this.prisma.zone.findMany().catch((err) => {
      this.zonesPromise = null;
      throw err;
    });

    return this.zonesPromise;
  }
}

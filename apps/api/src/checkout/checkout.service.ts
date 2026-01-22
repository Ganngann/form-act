import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./create-booking.dto";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async processCheckout(data: CreateBookingDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException("User with this email already exists.");
    }

    // Check if client (VAT) exists
    const existingClient = await this.prisma.client.findUnique({
      where: { vatNumber: data.vatNumber },
    });
    if (existingClient) {
      throw new BadRequestException(
        "Company with this VAT already registered.",
      );
    }

    const hashedPassword = await this.authService.hashPassword(data.password);

    // Atomic transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.companyName,
          password: hashedPassword,
        },
      });

      // 2. Create Client
      const client = await tx.client.create({
        data: {
          vatNumber: data.vatNumber,
          companyName: data.companyName,
          address: data.address,
          userId: user.id,
        },
      });

      // 3. Create Session
      const session = await tx.session.create({
        data: {
          date: new Date(data.date),
          slot: data.slot,
          formationId: data.formationId,
          trainerId: data.trainerId,
          clientId: client.id,
          status: data.trainerId ? "CONFIRMED" : "PENDING_ASSIGNMENT",
        },
      });

      return {
        user: { id: user.id, email: user.email },
        client,
        session,
      };
    });
  }
}

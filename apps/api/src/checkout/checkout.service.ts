import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./create-booking.dto";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) { }

  async processCheckout(data: CreateBookingDto) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { client: true }
    });

    if (!user && !data.password) {
      throw new BadRequestException("Password is required for new users.");
    }

    // Atomic transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Get or Create User
      if (!user) {
        const hashedPassword = await this.authService.hashPassword(data.password!);
        user = await tx.user.create({
          data: {
            email: data.email,
            name: data.companyName,
            password: hashedPassword,
          },
          include: { client: true }
        });
      }

      // 2. Get or Create Client
      let client = user.client || await tx.client.findUnique({
        where: { vatNumber: data.vatNumber }
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            vatNumber: data.vatNumber,
            companyName: data.companyName,
            address: data.address,
            userId: user.id,
          },
        });
      } else if (client.userId !== user.id) {
        throw new BadRequestException("VAT number already associated with another account.");
      }

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

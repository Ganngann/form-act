import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./create-booking.dto";
import { AuthService } from "../auth/auth.service";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email-templates/email-templates.service";

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private emailService: EmailService,
    private emailTemplatesService: EmailTemplatesService,
  ) {}

  async processCheckout(data: CreateBookingDto) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { client: true },
    });

    if (!user && !data.password) {
      throw new BadRequestException("Password is required for new users.");
    }

    // Atomic transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Get or Create User
      if (!user) {
        const hashedPassword = await this.authService.hashPassword(
          data.password!,
        );
        user = await tx.user.create({
          data: {
            email: data.email,
            name: data.companyName,
            password: hashedPassword,
          },
          include: { client: true },
        });
      }

      // 2. Get or Create Client
      let client =
        user.client ||
        (await tx.client.findUnique({
          where: { vatNumber: data.vatNumber },
        }));

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
        throw new BadRequestException(
          "VAT number already associated with another account.",
        );
      }

      // 2.5 Check for conflicts if trainer is assigned
      if (data.trainerId) {
        const conflict = await tx.session.findFirst({
          where: {
            trainerId: data.trainerId,
            date: new Date(data.date),
            status: { not: "CANCELLED" },
            OR: [
              { slot: "ALL_DAY" },
              { slot: data.slot },
              ...(data.slot === "ALL_DAY"
                ? [{ slot: "AM" }, { slot: "PM" }]
                : []),
            ],
          },
        });

        if (conflict) {
          throw new BadRequestException(
            "The selected trainer is not available for this slot.",
          );
        }
      }

      // 3. Create Session
      const session = await tx.session.create({
        data: {
          date: new Date(data.date),
          slot: data.slot,
          formationId: data.formationId,
          trainerId: data.trainerId,
          clientId: client.id,
          status: "PENDING_APPROVAL",
        },
      });

      return {
        user: { id: user.id, email: user.email },
        client,
        session,
      };
    });

    // 4. Send Confirmation Email
    try {
      const template = await this.emailTemplatesService.getRenderedTemplate(
        "CHECKOUT_CONFIRMATION",
        {
          date: new Date(data.date).toLocaleDateString("fr-BE"),
          slot: data.slot,
        },
      );
      await this.emailService.sendEmail(
        result.user.email,
        template.subject,
        template.body,
      );
    } catch (e) {
      console.error("Failed to send confirmation email", e);
    }

    return result;
  }
}

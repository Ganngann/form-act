import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { EmailService } from "../email/email.service";
import * as crypto from "crypto";
import { getFrontendUrl } from "../common/config";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  // A valid bcrypt hash (cost 10) to use for timing consistency when user is not found.
  // This prevents user enumeration via timing attacks.
  private readonly DUMMY_HASH =
    "$2b$10$SaPN12DzXHe4gEaZAEFDw.eP9qNg6x.JeqMfEcGzj24IV3PwmBXDy";

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async register(data: RegisterDto): Promise<Omit<User, "password">> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException("This email is already in use.");
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "CLIENT",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        formateur: {
          select: { isActive: true },
        },
      },
    });

    // Mitigate timing attack: Always compare password, even if user not found.
    const passwordToCompare =
      user && user.password ? user.password : this.DUMMY_HASH;
    const isMatch = await bcrypt.compare(pass, passwordToCompare);

    if (user && isMatch && user.password) {
      if (user.formateur && user.formateur.isActive === false) {
        throw new ForbiddenException(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur.",
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, formateur, ...result } = user as any;
      return result;
    }
    return null;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return silently to prevent enumeration
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    const frontendUrl = getFrontendUrl();
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.emailService.sendEmail(
      email,
      "Réinitialisation de votre mot de passe",
      `<p>Bonjour ${user.name || "Client"},</p>
       <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
       <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe (valable 1h) :</p>
       <p><a href="${resetLink}">${resetLink}</a></p>
       <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Token invalide ou expiré");
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }

  async login(user: Omit<User, "password">) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        formateur: {
          select: { id: true },
        },
        client: true, // Include client details for checkout pre-fill
      },
    });
  }
}

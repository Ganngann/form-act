import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { EmailModule } from "../email/email.module";
import { getJwtSecret } from "./jwt.config";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

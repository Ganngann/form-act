import {
  Controller,
  Post,
  UseGuards,
  Res,
  Body,
  Get,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LoginThrottlerGuard } from "./login-throttler.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginThrottlerGuard)
  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return {
      message:
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    };
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.password);
    return { message: "Mot de passe mis à jour avec succès." };
  }

  @UseGuards(LoginThrottlerGuard)
  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const { access_token } = await this.authService.login(user);

    res.cookie("Authentication", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Lax is better for navigation from external sites, strict might be too aggressive for now
      path: "/",
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return user;
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("Authentication", { path: "/" });
    return { success: true };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async getProfile(@Req() req) {
    const user = await this.authService.getUserProfile(req.user.userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}

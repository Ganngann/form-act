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

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

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
  getProfile(@Req() req) {
    return req.user;
  }
}

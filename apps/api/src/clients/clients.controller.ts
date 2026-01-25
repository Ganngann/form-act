import {
  Controller,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
  Body,
  Param,
} from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { AuthGuard } from "@nestjs/passport";
import { UpdateClientProfileDto } from "./dto/update-client-profile.dto";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async findAll(@Request() req) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.clientsService.findAll();
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("me")
  async getMyProfile(@Request() req) {
    // Allows CLIENT and ADMIN (if admin wants to see their client profile, though rare)
    // Primarily for CLIENT role
    return this.clientsService.findByUserId(req.user.userId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("me")
  async updateMyProfile(@Request() req, @Body() body: UpdateClientProfileDto) {
    return this.clientsService.updateProfile(
      req.user.userId,
      body,
      req.user.email, // Use email as "modifierName" for audit log
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async findOne(@Request() req, @Param("id") id: string) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.clientsService.findOne(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id")
  async update(@Request() req, @Param("id") id: string, @Body() body: UpdateClientProfileDto) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.clientsService.updateById(
      id,
      body,
      `ADMIN (${req.user.email})`,
    );
  }
}

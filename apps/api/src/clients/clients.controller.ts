import { Controller, Get, UseGuards, Request, ForbiddenException } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get()
  async findAll(@Request() req) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.clientsService.findAll();
  }
}

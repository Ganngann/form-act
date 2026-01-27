import { Controller, Get, UseGuards } from "@nestjs/common";
import { ExpertisesService } from "./expertises.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("expertises")
export class ExpertisesController {
  constructor(private readonly expertisesService: ExpertisesService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  findAll() {
    return this.expertisesService.findAll();
  }
}

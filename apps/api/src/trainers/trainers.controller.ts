import { Controller, Get, Param, Query } from "@nestjs/common";
import { TrainersService } from "./trainers.service";

@Controller("trainers")
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get(":id/availability")
  async getAvailability(
    @Param("id") id: string,
    @Query("month") month?: string,
  ) {
    return this.trainersService.getAvailability(id, month);
  }

  @Get(":id/missions")
  async getMissions(@Param("id") id: string) {
    return this.trainersService.getMissions(id);
  }
}

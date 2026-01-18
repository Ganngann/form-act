import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrainersService } from './trainers.service';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: string,
    @Query('month') month?: string,
  ) {
    return this.trainersService.getAvailability(id, month);
  }
}

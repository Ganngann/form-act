import { Controller, Get, Query } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';

@Controller('dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @Get('trainers')
  async findTrainers(
    @Query('zoneId') zoneId: string,
    @Query('expertiseId') expertiseId?: string,
  ) {
    if (!zoneId) {
      return [];
    }
    // Date is ignored by the service for now
    return this.dispatcherService.findAvailableTrainers(new Date(), zoneId, expertiseId);
  }
}

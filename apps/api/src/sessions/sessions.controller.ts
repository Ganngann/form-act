import { Controller, Get, Param, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.sessionsService.findAll(startDate, endDate);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }
}

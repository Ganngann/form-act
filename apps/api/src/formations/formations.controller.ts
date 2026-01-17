import { Controller, Get, Query } from '@nestjs/common';
import { FormationsService } from './formations.service';

@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.formationsService.findAll(categoryId);
  }
}

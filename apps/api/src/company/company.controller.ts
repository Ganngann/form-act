import { Controller, Get, Param } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('check-vat/:vatNumber')
  async checkVat(@Param('vatNumber') vatNumber: string) {
    return this.companyService.validateVat(vatNumber);
  }
}

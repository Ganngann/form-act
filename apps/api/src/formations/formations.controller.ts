import { Controller, Get, Param, Query } from "@nestjs/common";
import { FormationsService } from "./formations.service";

@Controller("formations")
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  findAll(
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string,
  ) {
    return this.formationsService.findAll(categoryId, search);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.formationsService.findOne(id);
  }
}

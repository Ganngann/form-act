import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { FormationsService } from "./formations.service";
import { CreateFormationDto } from "./dto/create-formation.dto";
import { UpdateFormationDto } from "./dto/update-formation.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin/formations")
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN")
export class AdminFormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Get()
  findAll() {
    return this.formationsService.findAll(undefined, undefined, true);
  }

  @Post()
  create(@Body() createFormationDto: CreateFormationDto) {
    return this.formationsService.create(createFormationDto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateFormationDto: UpdateFormationDto,
  ) {
    return this.formationsService.update(id, updateFormationDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.formationsService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { TrainersService } from "./trainers.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";

@Controller("admin/trainers")
export class AdminTrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get()
  findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("search") search?: string,
  ) {
    return this.trainersService.findAll(
      skip ? +skip : 0,
      take ? +take : 10,
      search,
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.trainersService.findOne(id);
  }

  @Post()
  create(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainersService.create(createTrainerDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTrainerDto: UpdateTrainerDto) {
    return this.trainersService.update(id, updateTrainerDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.trainersService.remove(id);
  }
}

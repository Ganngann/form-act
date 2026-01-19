import { Module } from "@nestjs/common";
import { TrainersController } from "./trainers.controller";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TrainersController, AdminTrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}

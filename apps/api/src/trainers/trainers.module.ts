import { Module } from "@nestjs/common";
import { TrainersController } from "./trainers.controller";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TrainersController, AdminTrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}

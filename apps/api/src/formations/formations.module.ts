import { Module } from "@nestjs/common";
import { FormationsService } from "./formations.service";
import { FormationsController } from "./formations.controller";
import { AdminFormationsController } from "./admin-formations.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule], // Need PrismaModule for PrismaService
  controllers: [FormationsController, AdminFormationsController],
  providers: [FormationsService],
})
export class FormationsModule {}

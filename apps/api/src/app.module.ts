import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { DispatcherModule } from "./dispatcher/dispatcher.module";
import { ZonesModule } from "./zones/zones.module";
import { FormationsModule } from "./formations/formations.module";
import { CategoriesModule } from "./categories/categories.module";
import { TrainersModule } from "./trainers/trainers.module";

@Module({
  imports: [PrismaModule, DispatcherModule, ZonesModule, FormationsModule, CategoriesModule, TrainersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

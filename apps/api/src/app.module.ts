import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { DispatcherModule } from "./dispatcher/dispatcher.module";
import { ZonesModule } from "./zones/zones.module";
import { FormationsModule } from "./formations/formations.module";
import { CategoriesModule } from "./categories/categories.module";

@Module({
  imports: [PrismaModule, DispatcherModule, ZonesModule, FormationsModule, CategoriesModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

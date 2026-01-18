import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { DispatcherModule } from "./dispatcher/dispatcher.module";
import { ZonesModule } from "./zones/zones.module";
import { FormationsModule } from "./formations/formations.module";
import { CategoriesModule } from "./categories/categories.module";
import { TrainersModule } from "./trainers/trainers.module";
import { CompanyModule } from "./company/company.module";
import { CheckoutModule } from "./checkout/checkout.module";

@Module({
  imports: [
    PrismaModule,
    DispatcherModule,
    ZonesModule,
    FormationsModule,
    CategoriesModule,
    TrainersModule,
    CompanyModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { DispatcherModule } from "./dispatcher/dispatcher.module";
import { ZonesModule } from "./zones/zones.module";
import { FormationsModule } from "./formations/formations.module";
import { CategoriesModule } from "./categories/categories.module";
import { ClientsModule } from "./clients/clients.module";
import { TrainersModule } from "./trainers/trainers.module";
import { CompanyModule } from "./company/company.module";
import { CheckoutModule } from "./checkout/checkout.module";
import { SessionsModule } from "./sessions/sessions.module";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";
import { EmailModule } from "./email/email.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CalendarModule } from "./calendar/calendar.module";

@Module({
  imports: [
    PrismaModule,
    DispatcherModule,
    ZonesModule,
    FormationsModule,
    CategoriesModule,
    ClientsModule,
    TrainersModule,
    CompanyModule,
    CheckoutModule,
    SessionsModule,
    AuthModule,
    FilesModule,
    EmailModule,
    NotificationsModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { EmailModule } from "../email/email.module";
import { NotificationsService } from "./notifications.service";
import { NotificationLogService } from "./notification-log.service";

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule],
  providers: [NotificationsService, NotificationLogService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

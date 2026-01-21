import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { EmailModule } from "../email/email.module";
import { NotificationsService } from "./notifications.service";
import { NotificationLogService } from "./notification-log.service";
import { SessionsModule } from "../sessions/sessions.module";
import { FilesModule } from "../files/files.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EmailModule,
    SessionsModule,
    FilesModule,
  ],
  providers: [NotificationsService, NotificationLogService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

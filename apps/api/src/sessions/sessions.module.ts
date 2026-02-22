import { Module } from "@nestjs/common";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { EmailTemplatesModule } from "../email-templates/email-templates.module";
import { FilesModule } from "../files/files.module";

@Module({
  imports: [PrismaModule, EmailModule, EmailTemplatesModule, FilesModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}

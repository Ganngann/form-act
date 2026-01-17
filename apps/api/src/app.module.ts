import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { DispatcherModule } from "./dispatcher/dispatcher.module";

@Module({
  imports: [PrismaModule, DispatcherModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

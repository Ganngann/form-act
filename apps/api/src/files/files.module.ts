import { Module } from "@nestjs/common";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { PdfService } from "./pdf.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FilesService, PdfService],
  exports: [PdfService],
})
export class FilesModule {}

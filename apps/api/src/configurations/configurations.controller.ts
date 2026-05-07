import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigurationsService } from "./configurations.service";
import {
  createDiskStorage,
  fileFilter,
  MAX_FILE_SIZE,
} from "../common/file-upload.utils";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("configurations")
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Get(":key")
  async getConfiguration(@Param("key") key: string) {
    return this.configurationsService.getConfiguration(key);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @Put(":key")
  async updateConfiguration(
    @Param("key") key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ) {
    return this.configurationsService.updateConfiguration(key, body);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: createDiskStorage("./uploads/public"), // Store in public folder
      fileFilter: fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");

    // Return the public URL
    // Assuming /files/public serves from ./uploads/public
    // Need to verify static serving or FilesController
    return { url: `/files/public/${file.filename}` };
  }
}

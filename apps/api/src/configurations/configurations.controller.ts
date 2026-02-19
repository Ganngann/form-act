import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigurationsService } from './configurations.service';
import {
  createDiskStorage,
  fileFilter,
  MAX_FILE_SIZE,
} from '../common/file-upload.utils';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Get(':key')
  async getConfiguration(@Param('key') key: string) {
    return this.configurationsService.getConfiguration(key);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':key')
  async updateConfiguration(
    @Param('key') key: string,
    @Body() body: any,
    @Request() req,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update configurations');
    }
    return this.configurationsService.updateConfiguration(key, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage('./uploads/public'), // Store in public folder
      fileFilter: fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can upload files');
    }
    if (!file) throw new BadRequestException('File is required');

    // Return the public URL
    // Assuming /files/public serves from ./uploads/public
    // Need to verify static serving or FilesController
    return { url: `/files/public/${file.filename}` };
  }
}

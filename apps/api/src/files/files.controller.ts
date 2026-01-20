import { Controller, Get, Param, UseGuards, Request, Response } from '@nestjs/common';
import { FilesService } from './files.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':type/:filename')
  async getFile(@Param('type') type: string, @Param('filename') filename: string, @Request() req, @Response({ passthrough: true }) res) {
      const file = await this.filesService.getFile(type, filename, req.user);

      if (filename.endsWith('.pdf')) res.set({ 'Content-Type': 'application/pdf' });
      else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) res.set({ 'Content-Type': 'image/jpeg' });
      else if (filename.endsWith('.png')) res.set({ 'Content-Type': 'image/png' });
      else res.set({ 'Content-Type': 'application/octet-stream' });

      return file;
  }
}

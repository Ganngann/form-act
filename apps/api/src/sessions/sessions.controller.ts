import { Controller, Get, Param, Query, Post, UseInterceptors, UploadedFile, UseGuards, Request, ForbiddenException, BadRequestException } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthGuard } from "@nestjs/passport";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.sessionsService.findOne(id);
  }

  @Get()
  async findAll(@Query("start") start?: string, @Query("end") end?: string) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.sessionsService.findAll(startDate, endDate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/proof')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/proofs',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadProof(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
      if (!file) throw new BadRequestException('File is required');

      const session = await this.sessionsService.findOne(id);

      // Permission: Admin or The Trainer
      if (req.user.role === 'ADMIN') {
          // OK
      } else if (req.user.role === 'TRAINER') {
          if (session.trainer.userId !== req.user.userId) {
              throw new ForbiddenException('You can only upload proofs for your own sessions');
          }
      } else {
          throw new ForbiddenException('Access denied'); // Client cannot upload proof
      }

      const proofUrl = `/files/proofs/${file.filename}`;
      return this.sessionsService.updateProof(id, proofUrl);
  }
}

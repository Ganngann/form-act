import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { UpdateSessionDto } from "./dto/update-session.dto";
import { AdminUpdateSessionDto } from "./dto/admin-update-session.dto";
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
  async findAll(
    @Query("start") start?: string,
    @Query("end") end?: string,
    @Query("status") status?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.sessionsService.findAll(startDate, endDate, status);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/proof")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/proofs",
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadProof(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException("File is required");

    const session = await this.sessionsService.findOne(id);

    // Permission: Admin or The Trainer
    if (req.user.role === "ADMIN") {
      // OK
    } else if (req.user.role === "TRAINER") {
      if (session.trainer.userId !== req.user.userId) {
        throw new ForbiddenException(
          "You can only upload proofs for your own sessions",
        );
      }
    } else {
      throw new ForbiddenException("Access denied"); // Client cannot upload proof
    }

    const proofUrl = `/files/proofs/${file.filename}`;
    return this.sessionsService.updateProof(id, proofUrl);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @Request() req,
  ) {
    const session = await this.sessionsService.findOne(id);

    if (req.user.role === "CLIENT") {
      if (session.client?.userId !== req.user.userId) {
        throw new ForbiddenException("Access denied");
      }

      // Locking logic: J-7
      const now = new Date();
      const sessionDate = new Date(session.date);
      const diffTime = sessionDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      // Check if unlocked by admin
      if (diffDays < 7 && !session.isLogisticsOpen) {
        throw new ForbiddenException(
          "Modifications are locked 7 days before the session",
        );
      }
    } else if (req.user.role === "TRAINER") {
      if (session.trainer.userId !== req.user.userId) {
        throw new ForbiddenException("Access denied");
      }
    } else if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }

    return this.sessionsService.update(id, updateSessionDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch(":id/admin-update")
  async adminUpdate(
    @Param("id") id: string,
    @Body() body: AdminUpdateSessionDto,
    @Request() req,
  ) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.sessionsService.adminUpdate(id, body);
  }
}

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
import { AdminBillSessionDto } from "./dto/admin-bill-session.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import {
  createDiskStorage,
  fileFilter,
  MAX_FILE_SIZE,
  removeFile,
} from "../common/file-upload.utils";

@Controller("sessions")
@UseGuards(AuthGuard("jwt"))
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get("me")
  async findMySessions(@Request() req) {
    return this.sessionsService.findByUserId(req.user.userId, req.user.role);
  }

  @Get("admin/stats")
  async getAdminStats(@Request() req) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.sessionsService.getAdminStats();
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    const session = await this.sessionsService.findOne(id);

    if (req.user.role === "ADMIN") return session;
    if (
      req.user.role === "TRAINER" &&
      session.trainer?.userId === req.user.userId
    )
      return session;
    if (
      req.user.role === "CLIENT" &&
      session.client?.userId === req.user.userId
    )
      return session;

    throw new ForbiddenException("Access denied");
  }

  @Get()
  async findAll(
    @Request() req,
    @Query("start") start?: string,
    @Query("end") end?: string,
    @Query("status") status?: string,
    @Query("filter") filter?: string,
    @Query("q") q?: string,
  ) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }

    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.sessionsService.findAll(startDate, endDate, status, filter, q);
  }

  @Post(":id/proof")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: createDiskStorage("./uploads/proofs"),
      fileFilter: fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadProof(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException("File is required");

    try {
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
      return await this.sessionsService.updateProof(id, proofUrl);
    } catch (error) {
      if (file && file.path) {
        await removeFile(file.path);
      }
      throw error;
    }
  }

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

      // Locking logic: J-7 (Calendar days)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      const diffTime = sessionDate.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      // Check if unlocked by admin
      if (diffDays <= 7 && !session.isLogisticsOpen) {
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

  @Patch(":id/offer")
  async sendOffer(
    @Param("id") id: string,
    @Body() body: { price: number },
    @Request() req,
  ) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.sessionsService.sendOffer(id, body.price);
  }

  @Patch(":id/accept")
  async acceptOffer(@Param("id") id: string, @Request() req) {
    const session = await this.sessionsService.findOne(id);

    if (req.user.role === "CLIENT") {
      if (session.client?.userId !== req.user.userId) {
        throw new ForbiddenException("Access denied");
      }
    } else if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }

    return this.sessionsService.acceptOffer(id);
  }

  @Get(":id/billing-preview")
  async getBillingPreview(@Param("id") id: string, @Request() req) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.sessionsService.getBillingPreview(id);
  }

  @Post(":id/bill")
  async billSession(
    @Param("id") id: string,
    @Body() body: AdminBillSessionDto,
    @Request() req,
  ) {
    if (req.user.role !== "ADMIN") {
      throw new ForbiddenException("Access denied");
    }
    return this.sessionsService.billSession(id, body);
  }
}

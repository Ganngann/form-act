import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { TrainersService } from "./trainers.service";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import {
  createDiskStorage,
  fileFilter,
  MAX_FILE_SIZE,
  removeFile,
} from "../common/file-upload.utils";

@Controller("trainers")
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get(":id/availability")
  async getAvailability(
    @Param("id") id: string,
    @Query("month") month?: string,
  ) {
    return this.trainersService.getAvailability(id, month);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/missions")
  async getMissions(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);

    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }

    return this.trainersService.getMissions(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/unavailability")
  async addUnavailability(
    @Param("id") id: string,
    @Body() data: { date: string; slot: string },
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);
    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }
    return this.trainersService.addUnavailability(id, data.date, data.slot);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id/unavailability/:unavailabilityId")
  async removeUnavailability(
    @Param("id") id: string,
    @Param("unavailabilityId") unavailabilityId: string,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);
    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }
    return this.trainersService.removeUnavailability(unavailabilityId, id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Put(":id/settings")
  async updateSettings(
    @Param("id") id: string,
    @Body() data: { defaultAvailableDays: string },
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);
    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }
    return this.trainersService.update(id, {
      defaultAvailableDays: data.defaultAvailableDays,
    });
  }

  @Get(":id/public")
  async findOnePublic(@Param("id") id: string) {
    const trainer = await this.trainersService.findOne(id);
    return {
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      bio: trainer.bio,
      avatarUrl: trainer.avatarUrl,
    };
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);

    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }

    if (trainer.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (trainer.user as any).password;
    }
    return trainer;
  }

  @UseGuards(AuthGuard("jwt"))
  @Post(":id")
  async updateProfile(
    @Param("id") id: string,
    @Body() updateDto: UpdateTrainerDto,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);

    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("You can only update your own profile");
    }

    return this.trainersService.update(id, updateDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/avatar")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: createDiskStorage("./uploads/avatars"),
      fileFilter: fileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadAvatar(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    if (!file) throw new BadRequestException("File is required");

    try {
      const trainer = await this.trainersService.findOne(id);
      if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
        throw new ForbiddenException("You can only update your own profile");
      }

      const avatarUrl = `/files/avatars/${file.filename}`;
      return await this.trainersService.updateAvatar(id, avatarUrl);
    } catch (error) {
      if (file && file.path) {
        await removeFile(file.path);
      }
      throw error;
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/calendar-url")
  async getCalendarUrl(
    @Param("id") id: string,
    @Request() req: ExpressRequest & { user: { role: string; userId: string } },
  ) {
    const trainer = await this.trainersService.findOne(id);
    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("Access denied");
    }

    const token = await this.trainersService.ensureCalendarToken(id);

    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = process.env.PUBLIC_API_URL || `${protocol}://${host}`;

    return { url: `${baseUrl}/calendars/${token}/events.ics` };
  }
}

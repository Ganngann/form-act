import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { TrainersService } from "./trainers.service";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthGuard } from "@nestjs/passport";

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

  @Get(":id/missions")
  async getMissions(@Param("id") id: string) {
    return this.trainersService.getMissions(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
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
  @Patch(":id")
  async updateProfile(
    @Param("id") id: string,
    @Body() updateDto: UpdateTrainerDto,
    @Request() req,
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
      storage: diskStorage({
        destination: "./uploads/avatars",
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
  async uploadAvatar(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException("File is required");

    const trainer = await this.trainersService.findOne(id);
    if (req.user.role !== "ADMIN" && trainer.userId !== req.user.userId) {
      throw new ForbiddenException("You can only update your own profile");
    }

    const avatarUrl = `/files/avatars/${file.filename}`;
    return this.trainersService.updateAvatar(id, avatarUrl);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id/calendar-url")
  async getCalendarUrl(@Param("id") id: string, @Request() req) {
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

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  StreamableFile,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createReadStream, existsSync } from "fs";
import { join, resolve, sep } from "path";

interface UserPayload {
  userId: string;
  role: string;
  email: string;
}

@Injectable()
export class FilesService {
  // Whitelist of allowed folders to prevent arbitrary file access
  private readonly ALLOWED_FOLDERS = ["proofs", "avatars", "public"];

  constructor(private prisma: PrismaService) {}

  async getFile(
    type: string,
    filename: string,
    user: UserPayload,
  ): Promise<StreamableFile> {
    if (!this.ALLOWED_FOLDERS.includes(type)) {
      throw new ForbiddenException("Access to this folder is forbidden");
    }

    const basePath = join(process.cwd(), "uploads", type);
    // Use resolve with just basePath and filename so absolute path override takes effect
    const targetPath = resolve(basePath, filename);

    // Basic Path Traversal protection
    if (filename.includes("..") || type.includes(".."))
      throw new NotFoundException();

    if (!targetPath.startsWith(basePath + sep)) {
      throw new NotFoundException();
    }

    if (!existsSync(targetPath)) {
      throw new NotFoundException("File not found");
    }

    if (type === "proofs") {
      await this.validateProofAccess(filename, user);
    }

    const file = createReadStream(targetPath);
    return new StreamableFile(file);
  }

  async getPublicFile(filename: string): Promise<StreamableFile> {
    const basePath = join(process.cwd(), "uploads", "public");
    const targetPath = resolve(basePath, filename);

    if (filename.includes("..")) throw new NotFoundException();

    if (!targetPath.startsWith(basePath + sep)) {
      throw new NotFoundException();
    }

    if (!existsSync(targetPath)) {
      throw new NotFoundException("File not found");
    }

    const file = createReadStream(targetPath);
    return new StreamableFile(file);
  }

  private async validateProofAccess(filename: string, user: UserPayload) {
    if (user.role === "ADMIN") return;

    // Find session by proofUrl
    // We expect proofUrl to contain the filename.
    // Since we control how we save it (next steps), we can assume it will be mapped correctly.
    // However, duplicates are unlikely but possible if names are not unique.
    // We should ensure unique filenames when saving.
    const session = await this.prisma.session.findFirst({
      where: { proofUrl: { contains: filename } },
      include: { client: true },
    });

    if (!session) {
      // If file exists but isn't linked to a session, only ADMIN should see it.
      throw new ForbiddenException("Access denied");
    }

    // Check Trainer
    if (user.role === "TRAINER") {
      const formateur = await this.prisma.formateur.findUnique({
        where: { userId: user.userId },
      });
      if (formateur && formateur.id === session.trainerId) return;
    }

    // Check Client
    if (user.role === "CLIENT") {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.userId },
      });
      if (client && client.id === session.clientId) return;
    }

    throw new ForbiddenException(
      "You do not have permission to view this file",
    );
  }
}

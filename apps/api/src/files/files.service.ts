import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  StreamableFile,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createReadStream, existsSync } from "fs";
import { resolve, sep } from 'path';

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

    const rootUploadsPath = resolve(process.cwd(), 'uploads');
    // Ensure the folder type itself is safely resolved inside 'uploads' first
    const typePath = resolve(rootUploadsPath, type);

    // Prevent directory traversal attacks
    if (!typePath.startsWith(rootUploadsPath + sep)) {
      throw new NotFoundException();
    }

    const targetPath = resolve(typePath, filename);

    // Robust Path Traversal protection: ensure target path is within the resolved type directory
    if (!targetPath.startsWith(typePath + sep)) {
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
    const rootPublicPath = resolve(process.cwd(), 'uploads', 'public');
    const targetPath = resolve(rootPublicPath, filename);

    // Robust Path Traversal protection: ensure target path is within uploads/public
    if (!targetPath.startsWith(rootPublicPath + sep)) {
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

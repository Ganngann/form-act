import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import * as crypto from "crypto";
import * as fs from "fs/promises";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
};

export const ALLOWED_EXTENSIONS_LIST = Object.values(ALLOWED_FILE_TYPES).flat();
export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES);

export const ALLOWED_EXTENSIONS = new RegExp(
  `\\.(${ALLOWED_EXTENSIONS_LIST.join("|")})$`,
  "i",
);

export const fileFilter = (
  req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(ALLOWED_EXTENSIONS)) {
    return callback(
      new BadRequestException(
        `Only ${ALLOWED_EXTENSIONS_LIST.join(", ")} files are allowed!`,
      ),
      false,
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(new BadRequestException("Invalid file type!"), false);
  }

  callback(null, true);
};

export const generateSecureFilename = (originalName: string): string => {
  const randomName = crypto.randomBytes(16).toString("hex");
  return `${randomName}${extname(originalName)}`;
};

export const createDiskStorage = (destination: string) => {
  return diskStorage({
    destination,
    filename: (req, file, cb) => {
      const filename = generateSecureFilename(file.originalname);
      return cb(null, filename);
    },
  });
};

interface SystemError extends Error {
  code?: string;
}

export const removeFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // If file doesn't exist (ENOENT), ignore. Otherwise log.
    const err = error as SystemError;
    if (err.code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

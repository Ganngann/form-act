import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomBytes } from "crypto";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp|pdf)$/i;

export const fileFilter = (
  req: unknown,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(ALLOWED_EXTENSIONS)) {
    return callback(
      new BadRequestException(
        "Only image (jpg, png, webp) and pdf files are allowed!",
      ),
      false,
    );
  }

  // Basic MIME type check (not foolproof but filters obvious mismatches)
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new BadRequestException("Invalid file type!"), false);
  }

  callback(null, true);
};

export const createDiskStorage = (destination: string) => {
  return diskStorage({
    destination,
    filename: (req, file, cb) => {
      // Security: Use crypto.randomBytes for unpredictable filenames
      // 16 bytes = 32 hex characters
      const randomName = randomBytes(16).toString("hex");
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  });
};

import {
  fileFilter,
  generateSecureFilename,
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
} from "./file-upload.utils";
import { BadRequestException } from "@nestjs/common";

describe("File Validation Logic", () => {
  it("should generate ALLOWED_EXTENSIONS regex that matches all defined extensions", () => {
    const allExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
    allExtensions.forEach((ext) => {
      expect(`test.${ext}`).toMatch(ALLOWED_EXTENSIONS);
      expect(`test.${ext.toUpperCase()}`).toMatch(ALLOWED_EXTENSIONS);
    });
  });

  it("should not match extensions not in the allowed list", () => {
    const invalidExtensions = ["exe", "bat", "sh", "gif"];
    invalidExtensions.forEach((ext) => {
      expect(`test.${ext}`).not.toMatch(ALLOWED_EXTENSIONS);
    });
  });
});

describe("fileFilter", () => {
  it("should accept valid image files", () => {
    const file = {
      originalname: "test.jpg",
      mimetype: "image/jpeg",
    } as unknown as Express.Multer.File;
    const callback = jest.fn();

    fileFilter({}, file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("should accept valid pdf files", () => {
    const file = {
      originalname: "test.pdf",
      mimetype: "application/pdf",
    } as unknown as Express.Multer.File;
    const callback = jest.fn();

    fileFilter({}, file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("should reject invalid extension", () => {
    const file = {
      originalname: "test.exe",
      mimetype: "application/x-msdownload",
    } as unknown as Express.Multer.File;
    const callback = jest.fn();

    fileFilter({}, file, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false,
    );
  });

  it("should reject invalid mime type", () => {
    const file = {
      originalname: "test.jpg",
      mimetype: "text/html", // Spoofed mimetype? Or mismatch
    } as unknown as Express.Multer.File;
    const callback = jest.fn();

    fileFilter({}, file, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.any(BadRequestException),
      false,
    );
  });
});

describe("generateSecureFilename", () => {
  it("should generate a filename with 32 hex characters plus extension", () => {
    const originalName = "test.jpg";
    const filename = generateSecureFilename(originalName);
    // 32 chars from hex + 4 chars from ".jpg" = 36
    expect(filename).toHaveLength(36);
    expect(filename.endsWith(".jpg")).toBe(true);
  });

  it("should preserve the original extension", () => {
    const originalName = "my-report.pdf";
    const filename = generateSecureFilename(originalName);
    expect(filename.endsWith(".pdf")).toBe(true);
  });

  it("should generate unique filenames", () => {
    const name1 = generateSecureFilename("image.png");
    const name2 = generateSecureFilename("image.png");
    expect(name1).not.toBe(name2);
  });
});

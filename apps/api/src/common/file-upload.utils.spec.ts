import {
  fileFilter,
  generateSecureFilename,
  ALLOWED_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  removeFile,
  createDiskStorage,
} from "./file-upload.utils";
import { BadRequestException } from "@nestjs/common";
import * as fs from "fs/promises";
import { diskStorage } from "multer";

jest.mock("fs/promises");
jest.mock("multer", () => ({
  diskStorage: jest.fn().mockReturnValue({}),
}));

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

describe("removeFile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should verify file deletion", async () => {
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    await removeFile("test.jpg");
    expect(fs.unlink).toHaveBeenCalledWith("test.jpg");
  });

  it("should ignore ENOENT error", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";
    (fs.unlink as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await removeFile("test.jpg");

    expect(fs.unlink).toHaveBeenCalledWith("test.jpg");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log other errors", async () => {
    const error: any = new Error("Permission denied");
    error.code = "EACCES";
    (fs.unlink as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await removeFile("test.jpg");

    expect(fs.unlink).toHaveBeenCalledWith("test.jpg");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error deleting file test.jpg:",
      error,
    );
    consoleSpy.mockRestore();
  });
});

describe("createDiskStorage", () => {
  it("should configure disk storage with correct filename logic", () => {
    (diskStorage as jest.Mock).mockClear();
    createDiskStorage("./uploads");
    expect(diskStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "./uploads",
        filename: expect.any(Function),
      }),
    );

    // Get the filename function passed to diskStorage
    const config = (diskStorage as jest.Mock).mock.calls[0][0];
    const filenameFn = config.filename;

    const file = { originalname: "test.jpg" };
    const cb = jest.fn();

    filenameFn(null, file, cb);

    expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^[a-f0-9]{32}\.jpg$/));
  });
});

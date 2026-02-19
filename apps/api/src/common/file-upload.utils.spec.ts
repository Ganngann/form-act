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
jest.mock("multer");

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
  it("should unlink file", async () => {
    await removeFile("path/to/file");
    expect(fs.unlink).toHaveBeenCalledWith("path/to/file");
  });

  it("should ignore ENOENT error", async () => {
    const error: any = new Error("Not found");
    error.code = "ENOENT";
    (fs.unlink as jest.Mock).mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    await removeFile("path/to/file");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should log other errors", async () => {
    const error = new Error("Other error");
    (fs.unlink as jest.Mock).mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    await removeFile("path/to/file");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error deleting file path/to/file:",
      error,
    );
    consoleSpy.mockRestore();
  });
});

describe("createDiskStorage", () => {
  it("should create disk storage with correct config", () => {
    const destination = "./uploads";
    createDiskStorage(destination);
    expect(diskStorage).toHaveBeenCalledWith({
      destination,
      filename: expect.any(Function),
    });
  });

  it("should use generateSecureFilename in filename function", () => {
    const destination = "./uploads";
    createDiskStorage(destination);

    // Get the configuration object passed to diskStorage
    const config = (diskStorage as jest.Mock).mock.calls[0][0];
    const filenameFn = config.filename;

    const req = {};
    const file = { originalname: "test.png" };
    const cb = jest.fn();

    filenameFn(req, file, cb);

    expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/[a-f0-9]{32}\.png/));
  });
});

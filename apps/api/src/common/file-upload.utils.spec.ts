import { fileFilter, generateSecureFilename, removeFile } from "./file-upload.utils";
import { BadRequestException } from "@nestjs/common";
import * as fs from "fs/promises";

jest.mock("fs/promises");

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
  const mockUnlink = fs.unlink as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully remove a file", async () => {
    mockUnlink.mockResolvedValue(undefined);
    await removeFile("path/to/file.jpg");
    expect(mockUnlink).toHaveBeenCalledWith("path/to/file.jpg");
  });

  it("should ignore ENOENT error if file does not exist", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";
    mockUnlink.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await removeFile("path/to/missing.jpg");

    expect(mockUnlink).toHaveBeenCalledWith("path/to/missing.jpg");
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should log other errors", async () => {
    const error = new Error("Permission denied");
    mockUnlink.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await removeFile("path/to/locked.jpg");

    expect(mockUnlink).toHaveBeenCalledWith("path/to/locked.jpg");
    expect(consoleSpy).toHaveBeenCalledWith("Error deleting file path/to/locked.jpg:", error);

    consoleSpy.mockRestore();
  });
});

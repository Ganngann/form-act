import { fileFilter, createDiskStorage } from "./file-upload.utils";
import { BadRequestException } from "@nestjs/common";
// We need to mock multer to access the configuration passed to diskStorage
jest.mock("multer", () => ({
  diskStorage: jest.fn().mockImplementation((config) => config),
}));

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

describe("createDiskStorage", () => {
  it("should generate random hex filenames of length 32 + extension", () => {
    const storageConfig = createDiskStorage("./uploads");
    // Since we mocked diskStorage to return its config, we can access the filename function
    const filenameFn = (storageConfig as any).filename;

    const file = { originalname: "test.jpg" } as unknown as Express.Multer.File;
    const callback = jest.fn();

    filenameFn(null, file, callback);

    expect(callback).toHaveBeenCalled();
    const generatedFilename = callback.mock.calls[0][1]; // 2nd argument is the filename

    // Check format: 32 hex chars + .jpg
    expect(generatedFilename).toMatch(/^[a-f0-9]{32}\.jpg$/);
  });

  it("should generate unique filenames", () => {
    const storageConfig = createDiskStorage("./uploads");
    const filenameFn = (storageConfig as any).filename;

    const file = { originalname: "test.png" } as unknown as Express.Multer.File;
    const filenames = new Set();

    for (let i = 0; i < 100; i++) {
      const callback = jest.fn();
      filenameFn(null, file, callback);
      const generatedFilename = callback.mock.calls[0][1];
      filenames.add(generatedFilename);
    }

    expect(filenames.size).toBe(100);
  });
});

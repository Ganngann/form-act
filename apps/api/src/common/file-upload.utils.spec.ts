import { fileFilter } from "./file-upload.utils";
import { BadRequestException } from "@nestjs/common";

describe("fileFilter", () => {
  it("should accept valid image files", () => {
    const file = {
      originalname: "test.jpg",
      mimetype: "image/jpeg",
    } as any;
    const callback = jest.fn();

    fileFilter({} as any, file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("should accept valid pdf files", () => {
    const file = {
      originalname: "test.pdf",
      mimetype: "application/pdf",
    } as any;
    const callback = jest.fn();

    fileFilter({} as any, file, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("should reject invalid extension", () => {
    const file = {
      originalname: "test.exe",
      mimetype: "application/x-msdownload",
    } as any;
    const callback = jest.fn();

    fileFilter({} as any, file, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
  });

  it("should reject invalid mime type", () => {
    const file = {
      originalname: "test.jpg",
      mimetype: "text/html", // Spoofed mimetype? Or mismatch
    } as any;
    const callback = jest.fn();

    fileFilter({} as any, file, callback);

    expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
  });
});

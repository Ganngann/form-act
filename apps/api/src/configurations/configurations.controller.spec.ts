import { Test, TestingModule } from "@nestjs/testing";
import { ConfigurationsController } from "./configurations.controller";
import { ConfigurationsService } from "./configurations.service";
import { BadRequestException } from "@nestjs/common";
import * as fileUploadUtils from "../common/file-upload.utils";

jest.mock("../common/file-upload.utils", () => {
  return {
    ...jest.requireActual("../common/file-upload.utils"),
    removeFile: jest.fn(),
  };
});

describe("ConfigurationsController", () => {
  let controller: ConfigurationsController;
  let service: ConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationsController],
      providers: [
        {
          provide: ConfigurationsService,
          useValue: {
            getConfiguration: jest.fn(),
            updateConfiguration: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConfigurationsController>(ConfigurationsController);
    service = module.get<ConfigurationsService>(ConfigurationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getConfiguration", () => {
    it("should return the configuration", async () => {
      const mockConfig = { key: "test", value: "value" };
      (service.getConfiguration as jest.Mock).mockResolvedValue(mockConfig);

      const result = await controller.getConfiguration("test");
      expect(result).toEqual(mockConfig);
      expect(service.getConfiguration).toHaveBeenCalledWith("test");
    });
  });

  describe("updateConfiguration", () => {
    it("should update and return the configuration", async () => {
      const mockConfig = { key: "test", value: "new_value" };
      (service.updateConfiguration as jest.Mock).mockResolvedValue(mockConfig);

      const result = await controller.updateConfiguration("test", {
        value: "new_value",
      });
      expect(result).toEqual(mockConfig);
      expect(service.updateConfiguration).toHaveBeenCalledWith("test", {
        value: "new_value",
      });
    });
  });

  describe("uploadFile", () => {
    it("should return the public URL on success", async () => {
      const file = {
        filename: "test.jpg",
        path: "uploads/public/test.jpg",
      } as Express.Multer.File;

      const result = await controller.uploadFile(file);
      expect(result).toEqual({ url: "/files/public/test.jpg" });
      expect(fileUploadUtils.removeFile).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException if no file is provided", async () => {
      await expect(controller.uploadFile(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should remove the file and rethrow if an error occurs during processing", async () => {
      const file = {
        path: "uploads/public/test.jpg",
        get filename() {
          throw new Error("Processing error");
        },
      } as unknown as Express.Multer.File;

      await expect(controller.uploadFile(file)).rejects.toThrow(
        "Processing error",
      );
      expect(fileUploadUtils.removeFile).toHaveBeenCalledWith(
        "uploads/public/test.jpg",
      );
    });
  });
});

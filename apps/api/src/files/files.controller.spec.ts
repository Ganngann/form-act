import { Test, TestingModule } from "@nestjs/testing";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

describe("FilesController", () => {
  let controller: FilesController;
  let service: FilesService;

  const mockFilesService = {
    getFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getFile", () => {
    it("should return file and set correct content type for PDF", async () => {
      const fileStream = "file_content";
      mockFilesService.getFile.mockResolvedValue(fileStream);
      const res = { set: jest.fn() };
      const req = { user: { userId: "1" } };

      const result = await controller.getFile("proofs", "test.pdf", req, res);

      expect(res.set).toHaveBeenCalledWith({
        "Content-Type": "application/pdf",
      });
      expect(result).toBe(fileStream);
      expect(service.getFile).toHaveBeenCalledWith(
        "proofs",
        "test.pdf",
        req.user,
      );
    });

    it("should return file and set correct content type for JPG", async () => {
      mockFilesService.getFile.mockResolvedValue("file");
      const res = { set: jest.fn() };
      const req = { user: { userId: "1" } };

      await controller.getFile("proofs", "test.jpg", req, res);

      expect(res.set).toHaveBeenCalledWith({ "Content-Type": "image/jpeg" });
    });

    it("should return file and set correct content type for PNG", async () => {
      mockFilesService.getFile.mockResolvedValue("file");
      const res = { set: jest.fn() };
      const req = { user: { userId: "1" } };

      await controller.getFile("proofs", "test.png", req, res);

      expect(res.set).toHaveBeenCalledWith({ "Content-Type": "image/png" });
    });

    it("should fallback to octet-stream for unknown types", async () => {
      mockFilesService.getFile.mockResolvedValue("file");
      const res = { set: jest.fn() };
      const req = { user: { userId: "1" } };

      await controller.getFile("proofs", "test.xyz", req, res);

      expect(res.set).toHaveBeenCalledWith({
        "Content-Type": "application/octet-stream",
      });
    });
  });
});

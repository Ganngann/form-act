import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all categories", async () => {
      mockCategoriesService.findAll.mockResolvedValue([
        { id: "1", name: "Test" },
      ]);
      const result = await controller.findAll();
      expect(result).toEqual([{ id: "1", name: "Test" }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create a category", async () => {
      const dto = { name: "New" };
      mockCategoriesService.create.mockResolvedValue({ id: "1", ...dto });
      const result = await controller.create(dto);
      expect(result).toEqual({ id: "1", name: "New" });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      const dto = { name: "Updated" };
      mockCategoriesService.update.mockResolvedValue({ id: "1", ...dto });
      const result = await controller.update("1", dto);
      expect(result).toEqual({ id: "1", name: "Updated" });
      expect(service.update).toHaveBeenCalledWith("1", dto);
    });
  });

  describe("remove", () => {
    it("should remove a category", async () => {
      mockCategoriesService.remove.mockResolvedValue({ id: "1", name: "Del" });
      const result = await controller.remove("1");
      expect(result).toEqual({ id: "1", name: "Del" });
      expect(service.remove).toHaveBeenCalledWith("1");
    });
  });
});

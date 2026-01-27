import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([{ id: 1, name: "Test" }]),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return all categories", async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1, name: "Test" }]);
    expect(service.findAll).toHaveBeenCalled();
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { FormationsController } from "./formations.controller";
import { FormationsService } from "./formations.service";

describe("FormationsController", () => {
  let controller: FormationsController;
  let service: FormationsService;

  const mockFormationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormationsController],
      providers: [
        {
          provide: FormationsService,
          useValue: mockFormationsService,
        },
      ],
    }).compile();

    controller = module.get<FormationsController>(FormationsController);
    service = module.get<FormationsService>(FormationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return formations", async () => {
      const formations = [{ id: "1", title: "Formation 1" }];
      mockFormationsService.findAll.mockResolvedValue(formations);

      const result = await controller.findAll();

      expect(result).toEqual(formations);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should pass categoryId if provided", async () => {
      const formations = [{ id: "1", title: "Formation 1" }];
      mockFormationsService.findAll.mockResolvedValue(formations);

      await controller.findAll("cat1");

      expect(service.findAll).toHaveBeenCalledWith("cat1");
    });
  });

  describe("findOne", () => {
    it("should return a formation", async () => {
      const formation = { id: "1", title: "Formation 1" };
      mockFormationsService.findOne.mockResolvedValue(formation);

      const result = await controller.findOne("1");

      expect(result).toEqual(formation);
      expect(service.findOne).toHaveBeenCalledWith("1");
    });
  });
});

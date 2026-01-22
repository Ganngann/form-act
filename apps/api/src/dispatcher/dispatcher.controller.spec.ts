import { Test, TestingModule } from "@nestjs/testing";
import { DispatcherController } from "./dispatcher.controller";
import { DispatcherService } from "./dispatcher.service";

describe("DispatcherController", () => {
  let controller: DispatcherController;
  let service: DispatcherService;

  const mockDispatcherService = {
    findAvailableTrainers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatcherController],
      providers: [
        {
          provide: DispatcherService,
          useValue: mockDispatcherService,
        },
      ],
    }).compile();

    controller = module.get<DispatcherController>(DispatcherController);
    service = module.get<DispatcherService>(DispatcherService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findTrainers", () => {
    it("should return empty array if zoneId is missing", async () => {
      const result = await controller.findTrainers("", "exp1");
      expect(result).toEqual([]);
      expect(service.findAvailableTrainers).not.toHaveBeenCalled();
    });

    it("should call findAvailableTrainers with defaults", async () => {
      const trainers = [{ id: "1" }];
      mockDispatcherService.findAvailableTrainers.mockResolvedValue(trainers);

      const result = await controller.findTrainers("zone1", "exp1");

      expect(result).toEqual(trainers);
      expect(service.findAvailableTrainers).toHaveBeenCalledWith(expect.any(Date), "zone1", "exp1");
    });
  });
});

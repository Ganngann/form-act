import { Test, TestingModule } from "@nestjs/testing";
import { DispatcherController } from "./dispatcher.controller";
import { DispatcherService } from "./dispatcher.service";

describe("DispatcherController", () => {
  let controller: DispatcherController;
  let service: DispatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatcherController],
      providers: [
        {
          provide: DispatcherService,
          useValue: {
            findAvailableTrainers: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<DispatcherController>(DispatcherController);
    service = module.get<DispatcherService>(DispatcherService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call findAvailableTrainers", async () => {
    await controller.findTrainers("zone-1", "expert-1");
    expect(service.findAvailableTrainers).toHaveBeenCalledWith(
      expect.any(Date),
      "zone-1",
      "expert-1",
    );
  });
});

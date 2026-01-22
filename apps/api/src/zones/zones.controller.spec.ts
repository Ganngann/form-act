import { Test, TestingModule } from "@nestjs/testing";
import { ZonesController } from "./zones.controller";
import { ZonesService } from "./zones.service";

describe("ZonesController", () => {
  let controller: ZonesController;
  let service: ZonesService;

  const mockZonesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonesController],
      providers: [
        {
          provide: ZonesService,
          useValue: mockZonesService,
        },
      ],
    }).compile();

    controller = module.get<ZonesController>(ZonesController);
    service = module.get<ZonesService>(ZonesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of zones", async () => {
      const zones = [{ id: "1", name: "Zone 1" }];
      mockZonesService.findAll.mockResolvedValue(zones);

      const result = await controller.findAll();
      expect(result).toEqual(zones);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});

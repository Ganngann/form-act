import { Test, TestingModule } from "@nestjs/testing";
import { ZonesService } from "./zones.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ZonesService", () => {
  let service: ZonesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    zone: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ZonesService>(ZonesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of zones", async () => {
      const zones = [{ id: "1", name: "Zone 1" }];
      (mockPrismaService.zone.findMany as jest.Mock).mockResolvedValue(zones);

      const result = await service.findAll();
      expect(result).toEqual(zones);
      expect(prisma.zone.findMany).toHaveBeenCalled();
    });
  });
});

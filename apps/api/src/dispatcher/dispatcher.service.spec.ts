import { Test, TestingModule } from "@nestjs/testing";
import { DispatcherService } from "./dispatcher.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrismaService = {
  formateur: {
    findMany: jest.fn(),
  },
};

describe("DispatcherService", () => {
  let service: DispatcherService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatcherService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DispatcherService>(DispatcherService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAvailableTrainers", () => {
    it("should query predilectionZones for Standard formation (no expertiseId)", async () => {
      const zoneId = "zone-1";
      const date = new Date();
      await service.findAvailableTrainers(date, zoneId);
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            predilectionZones: {
              some: { id: zoneId },
            },
          },
        }),
      );
    });

    it("should query expertiseZones OR predilectionZones for Expertise formation (Inheritance Rule)", async () => {
      const zoneId = "zone-1";
      const expertiseId = "exp-1";
      const date = new Date();
      await service.findAvailableTrainers(date, zoneId, expertiseId);
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            expertises: {
              some: { id: expertiseId },
            },
            OR: [
              {
                expertiseZones: {
                  some: { id: zoneId },
                },
              },
              {
                predilectionZones: {
                  some: { id: zoneId },
                },
              },
            ],
          },
        }),
      );
    });

    it("should return empty array if no trainer matches zone (Desert Rule)", async () => {
      const zoneId = "desert-zone";
      const date = new Date();

      // Mock Prisma to return empty array
      (prisma.formateur.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAvailableTrainers(date, zoneId);
      expect(result).toEqual([]);
      expect(prisma.formateur.findMany).toHaveBeenCalled();
    });
  });
});

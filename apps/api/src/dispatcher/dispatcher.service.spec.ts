import { Test, TestingModule } from "@nestjs/testing";
import { DispatcherService } from "./dispatcher.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrismaService = {
  formateur: {
    findMany: jest.fn(),
  },
  formation: {
    findUnique: jest.fn(),
  },
};

describe("DispatcherService", () => {
  let service: DispatcherService;
  let prisma: typeof mockPrismaService;

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
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAvailableTrainers", () => {
    it("should query predilectionZones for Standard formation (no formationId)", async () => {
      const zoneId = "zone-1";
      const date = new Date();

      // Standard flow when no formationId provided (or formation not found/not expertise)
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

    it("should query predilectionZones for Standard formation (formation is not expertise)", async () => {
      const zoneId = "zone-1";
      const date = new Date();
      const formationId = "form-std";

      prisma.formation.findUnique.mockResolvedValue({
        id: formationId,
        isExpertise: false,
        trainers: []
      });

      await service.findAvailableTrainers(date, zoneId, formationId);

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

    it("should query expertiseZones OR predilectionZones for Expertise formation (Inheritance Rule) AND filter by whitelist", async () => {
      const zoneId = "zone-1";
      const formationId = "form-exp";
      const date = new Date();
      const allowedTrainerIds = ["t1", "t2"];

      prisma.formation.findUnique.mockResolvedValue({
        id: formationId,
        isExpertise: true,
        trainers: [{ id: "t1" }, { id: "t2" }]
      });

      await service.findAvailableTrainers(date, zoneId, formationId);

      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { in: allowedTrainerIds },
            OR: [
              { expertiseZones: { some: { id: zoneId } } },
              { predilectionZones: { some: { id: zoneId } } },
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

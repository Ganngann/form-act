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
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAvailableTrainers", () => {
    it("should query predilectionZones for Standard formation", async () => {
      const zoneId = "zone-1";
      const date = new Date();
      const formationId = "f-std";

      (prisma.formation.findUnique as jest.Mock).mockResolvedValue({
        id: formationId,
        isExpertise: false,
      });

      await service.findAvailableTrainers(date, zoneId, formationId);

      expect(prisma.formation.findUnique).toHaveBeenCalledWith({
        where: { id: formationId },
      });
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            predilectionZones: {
              some: { id: zoneId },
            },
          }),
        }),
      );
    });

    it("should query expertiseZones OR predilectionZones AND restrict to authorized trainers for Expertise formation", async () => {
      const zoneId = "zone-1";
      const date = new Date();
      const formationId = "f-exp";

      (prisma.formation.findUnique as jest.Mock).mockResolvedValue({
        id: formationId,
        isExpertise: true,
      });

      await service.findAvailableTrainers(date, zoneId, formationId);

      expect(prisma.formation.findUnique).toHaveBeenCalledWith({
        where: { id: formationId },
      });
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorizedFormations: {
              some: { id: formationId },
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
          }),
        }),
      );
    });

    it("should throw if formation not found", async () => {
      const zoneId = "zone-1";
      const date = new Date();
      const formationId = "f-missing";

      (prisma.formation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findAvailableTrainers(date, zoneId, formationId),
      ).rejects.toThrow();
    });
  });
});

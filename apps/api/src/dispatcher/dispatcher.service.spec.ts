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
      await service.findAvailableTrainers(zoneId);
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

    it("should query expertiseZones and expertises for Expertise formation", async () => {
      const zoneId = "zone-1";
      const expertiseId = "exp-1";
      await service.findAvailableTrainers(zoneId, expertiseId);
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            expertises: {
              some: { id: expertiseId },
            },
            expertiseZones: {
              some: { id: zoneId },
            },
          },
        }),
      );
    });
  });
});

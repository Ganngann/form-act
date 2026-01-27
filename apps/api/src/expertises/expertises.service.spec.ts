import { Test, TestingModule } from "@nestjs/testing";
import { ExpertisesService } from "./expertises.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ExpertisesService", () => {
  let service: ExpertisesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    expertise: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertisesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpertisesService>(ExpertisesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of expertises ordered by name", async () => {
      const expertises = [
        { id: 1, name: "Communication" },
        { id: 2, name: "Management" },
      ];

      (prisma.expertise.findMany as jest.Mock).mockResolvedValue(expertises);

      const result = await service.findAll();

      expect(prisma.expertise.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: "asc",
        },
      });
      expect(result).toEqual(expertises);
    });
  });
});

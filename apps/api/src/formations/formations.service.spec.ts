import { Test, TestingModule } from "@nestjs/testing";
import { FormationsService } from "./formations.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrismaService = {
  formation: {
    findMany: jest.fn().mockResolvedValue([
      { id: "1", title: "NestJS Intro", categoryId: "dev" },
      { id: "2", title: "Management 101", categoryId: "mgt" },
    ]),
    findUnique: jest.fn().mockResolvedValue({ id: "1", title: "NestJS Intro" }),
  },
};

describe("FormationsService", () => {
  let service: FormationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FormationsService>(FormationsService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all formations if no args provided", async () => {
      await service.findAll();
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true, expertise: true },
      });
    });

    it("should filter by categoryId", async () => {
      await service.findAll("dev");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: { categoryId: "dev" },
        include: { category: true, expertise: true },
      });
    });

    it("should filter by search term", async () => {
      await service.findAll(undefined, "Nest");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: "Nest" } },
            { description: { contains: "Nest" } },
          ],
        },
        include: { category: true, expertise: true },
      });
    });

    it("should filter by categoryId and search term", async () => {
      await service.findAll("dev", "Nest");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: "dev",
          OR: [
            { title: { contains: "Nest" } },
            { description: { contains: "Nest" } },
          ],
        },
        include: { category: true, expertise: true },
      });
    });
  });

  describe("findOne", () => {
    it("should return a formation by id", async () => {
      const result = await service.findOne("1");
      expect(result).toEqual({ id: "1", title: "NestJS Intro" });
      expect(mockPrismaService.formation.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { category: true, expertise: true },
      });
    });
  });
});

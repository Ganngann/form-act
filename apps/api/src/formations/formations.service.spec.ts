import { Test, TestingModule } from "@nestjs/testing";
import { FormationsService } from "./formations.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";

const mockPrismaService = {
  formation: {
    findMany: jest.fn().mockResolvedValue([
      { id: "1", title: "NestJS Intro", categoryId: "dev", isPublished: true },
      {
        id: "2",
        title: "Management 101",
        categoryId: "mgt",
        isPublished: true,
      },
    ]),
    findUnique: jest.fn().mockImplementation(({ where }) => {
      if (where.id === "1")
        return Promise.resolve({ id: "1", title: "NestJS Intro" });
      if (where.title === "NestJS Intro")
        return Promise.resolve({ id: "1", title: "NestJS Intro" });
      return Promise.resolve(null);
    }),
    create: jest
      .fn()
      .mockImplementation(({ data }) => Promise.resolve({ id: "3", ...data })),
    update: jest
      .fn()
      .mockImplementation(({ where, data }) =>
        Promise.resolve({ id: where.id, ...data }),
      ),
    delete: jest.fn().mockResolvedValue({ id: "1" }),
  },
  session: {
    count: jest.fn().mockResolvedValue(0),
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
    it("should return published formations by default", async () => {
      await service.findAll();
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        include: { category: true, trainers: true },
      });
    });

    it("should return all formations if includeHidden is true", async () => {
      await service.findAll(undefined, undefined, true);
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true, trainers: true },
      });
    });

    it("should filter by categoryId", async () => {
      await service.findAll("dev");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: { categoryId: "dev", isPublished: true },
        include: { category: true, trainers: true },
      });
    });

    it("should filter by search term", async () => {
      await service.findAll(undefined, "Nest");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: "Nest" } },
            { description: { contains: "Nest" } },
          ],
        },
        include: { category: true, trainers: true },
      });
    });
  });

  describe("create", () => {
    it("should create a formation", async () => {
      const dto = {
        title: "New Formation",
        description: "Desc",
        level: "Beginner",
        duration: "1 day",
        durationType: "FULL_DAY",
        isPublished: true,
      };
      await service.create(dto);
      expect(mockPrismaService.formation.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it("should throw if title exists", async () => {
      const dto = {
        title: "NestJS Intro", // Exists in mock
        description: "Desc",
        level: "Beginner",
        duration: "1 day",
        durationType: "FULL_DAY",
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("remove", () => {
    it("should remove if no sessions linked", async () => {
      mockPrismaService.session.count.mockResolvedValue(0);
      await service.remove("1");
      expect(mockPrismaService.formation.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw if sessions linked", async () => {
      mockPrismaService.session.count.mockResolvedValue(1);
      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
    });
  });
});

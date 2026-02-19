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
      if (where.title === "New Title") return Promise.resolve(null);
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
        include: { category: true, authorizedTrainers: true },
      });
    });

    it("should return all formations if includeHidden is true", async () => {
      await service.findAll(undefined, undefined, true);
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: {},
        include: { category: true, authorizedTrainers: true },
      });
    });

    it("should filter by categoryId", async () => {
      await service.findAll("dev");
      expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
        where: { categoryId: "dev", isPublished: true },
        include: { category: true, authorizedTrainers: true },
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
        include: { category: true, authorizedTrainers: true },
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
        durationType: "FULL_DAY" as const,
        isPublished: true,
      };
      await service.create(dto);
      expect(mockPrismaService.formation.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it("should create a formation with authorized trainers", async () => {
      const dto = {
        title: "New Formation With Trainers",
        description: "Desc",
        level: "Advanced",
        duration: "2 days",
        durationType: "FULL_DAY" as const,
        isPublished: true,
        authorizedTrainerIds: ["t1", "t2"],
      };

      await service.create(dto);

      const expectedData = {
        title: dto.title,
        description: dto.description,
        level: dto.level,
        duration: dto.duration,
        durationType: dto.durationType,
        isPublished: dto.isPublished,
        authorizedTrainers: {
          connect: [{ id: "t1" }, { id: "t2" }],
        },
      };

      expect(mockPrismaService.formation.create).toHaveBeenCalledWith({
        data: expectedData,
      });
    });

    it("should throw if title exists", async () => {
      const dto = {
        title: "NestJS Intro", // Exists in mock
        description: "Desc",
        level: "Beginner",
        duration: "1 day",
        durationType: "FULL_DAY" as const,
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("update", () => {
    it("should update formation fields", async () => {
      const dto = {
        description: "Updated Desc",
      };
      await service.update("1", dto);
      expect(mockPrismaService.formation.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: dto,
      });
    });

    it("should update formation title if unique", async () => {
      const dto = {
        title: "New Title",
      };
      await service.update("1", dto);
      expect(mockPrismaService.formation.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: dto,
      });
    });

    it("should throw if updating title to existing title", async () => {
      // Mock findUnique to return existing formation with different ID
      mockPrismaService.formation.findUnique.mockResolvedValueOnce({
        id: "2",
        title: "Existing Title",
      });

      const dto = {
        title: "Existing Title",
      };
      await expect(service.update("1", dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should allow updating title if it belongs to current formation", async () => {
      // Mock findUnique to return existing formation with SAME ID
      mockPrismaService.formation.findUnique.mockResolvedValueOnce({
        id: "1",
        title: "My Title",
      });

      const dto = {
        title: "My Title",
      };
      await service.update("1", dto);
      expect(mockPrismaService.formation.update).toHaveBeenCalled();
    });

    it("should update authorized trainers", async () => {
      const dto = {
        authorizedTrainerIds: ["t3"],
      };
      await service.update("1", dto);
      expect(mockPrismaService.formation.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          authorizedTrainers: {
            set: [{ id: "t3" }],
          },
        },
      });
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

  describe("findOne", () => {
    it("should return a formation", async () => {
      await service.findOne("1");
      expect(mockPrismaService.formation.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: {
          category: true,
          authorizedTrainers: true,
        },
      });
    });
  });
});

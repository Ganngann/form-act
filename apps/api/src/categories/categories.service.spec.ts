import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesService } from "./categories.service";
import { PrismaService } from "../prisma/prisma.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

const mockPrismaService = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  formation: {
    count: jest.fn(),
  },
};

describe("CategoriesService", () => {
  let service: CategoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of categories", async () => {
      mockPrismaService.category.findMany.mockResolvedValue([
        { id: "1", name: "Bureautique" },
      ]);
      const result = await service.findAll();
      expect(result).toEqual([{ id: "1", name: "Bureautique" }]);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a category if exists", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: "1",
        name: "Test",
      });
      const result = await service.findOne("1");
      expect(result).toEqual({ id: "1", name: "Test" });
    });

    it("should throw NotFoundException if not exists", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.findOne("999")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a category", async () => {
      const dto = { name: "New Category" };
      mockPrismaService.category.create.mockResolvedValue({ id: "1", ...dto });
      const result = await service.create(dto);
      expect(result).toEqual({ id: "1", name: "New Category" });
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: "1",
        name: "Old",
      });
      mockPrismaService.category.update.mockResolvedValue({
        id: "1",
        name: "New",
      });
      const result = await service.update("1", { name: "New" });
      expect(result).toEqual({ id: "1", name: "New" });
    });

    it("should throw error if category to update not found", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.update("999", { name: "New" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove a category if not used", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: "1",
        name: "To Delete",
      });
      mockPrismaService.formation.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue({
        id: "1",
        name: "To Delete",
      });

      const result = await service.remove("1");
      expect(result).toEqual({ id: "1", name: "To Delete" });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should throw BadRequestException if category is used", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: "1",
        name: "Used",
      });
      mockPrismaService.formation.count.mockResolvedValue(5);

      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if category not found", async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.remove("999")).rejects.toThrow(NotFoundException);
    });
  });
});

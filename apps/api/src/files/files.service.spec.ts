import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { existsSync, createReadStream } from "fs";

// Mock fs and path
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

describe("FilesService", () => {
  let service: FilesService;

  const mockPrismaService = {
    session: {
      findFirst: jest.fn(),
    },
    formateur: {
      findUnique: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);

    // Reset mocks
    (existsSync as jest.Mock).mockReturnValue(true);
    (createReadStream as jest.Mock).mockReturnValue("fileStream");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getFile", () => {
    it("should throw NotFoundException for path traversal", async () => {
      await expect(
        service.getFile("proofs", "../test.jpg", {
          userId: "1",
          role: "ADMIN",
          email: "a@a.com",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if file does not exist", async () => {
      (existsSync as jest.Mock).mockReturnValue(false);
      await expect(
        service.getFile("proofs", "test.jpg", {
          userId: "1",
          role: "ADMIN",
          email: "a@a.com",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should return file stream if accessible by ADMIN", async () => {
      const result = await service.getFile("proofs", "test.jpg", {
        userId: "1",
        role: "ADMIN",
        email: "a@a.com",
      });
      expect(result).toBeDefined();
    });

    it("should throw ForbiddenException if session not found linked to proof", async () => {
      mockPrismaService.session.findFirst.mockResolvedValue(null);
      await expect(
        service.getFile("proofs", "test.jpg", {
          userId: "1",
          role: "TRAINER",
          email: "a@a.com",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow TRAINER if they own the session", async () => {
      mockPrismaService.session.findFirst.mockResolvedValue({
        trainerId: "t1",
      });
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        userId: "u1",
      });

      const result = await service.getFile("proofs", "test.jpg", {
        userId: "u1",
        role: "TRAINER",
        email: "a@a.com",
      });
      expect(result).toBeDefined();
    });

    it("should deny TRAINER if they do not own the session", async () => {
      mockPrismaService.session.findFirst.mockResolvedValue({
        trainerId: "t2",
      });
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        userId: "u1",
      });

      await expect(
        service.getFile("proofs", "test.jpg", {
          userId: "u1",
          role: "TRAINER",
          email: "a@a.com",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow CLIENT if they own the session", async () => {
      mockPrismaService.session.findFirst.mockResolvedValue({ clientId: "c1" });
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: "c1",
        userId: "u1",
      });

      const result = await service.getFile("proofs", "test.jpg", {
        userId: "u1",
        role: "CLIENT",
        email: "a@a.com",
      });
      expect(result).toBeDefined();
    });

    it("should deny CLIENT if they do not own the session", async () => {
      mockPrismaService.session.findFirst.mockResolvedValue({ clientId: "c2" });
      mockPrismaService.client.findUnique.mockResolvedValue({
        id: "c1",
        userId: "u1",
      });

      await expect(
        service.getFile("proofs", "test.jpg", {
          userId: "u1",
          role: "CLIENT",
          email: "a@a.com",
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

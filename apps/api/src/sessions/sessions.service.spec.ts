import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { Session } from "@prisma/client";

describe("SessionsService", () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: {
            session: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    it("should return session", async () => {
      const mockSession = { id: "1" } as Session;
      jest.spyOn(prisma.session, "findUnique").mockResolvedValue(mockSession);

      const result = await service.findOne("1");
      expect(result).toEqual(mockSession);
    });

    it("should throw NotFoundException if not found", async () => {
      jest.spyOn(prisma.session, "findUnique").mockResolvedValue(null);
      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should return all sessions", async () => {
      const mockSessions = [{ id: "1" }] as Session[];
      jest.spyOn(prisma.session, "findMany").mockResolvedValue(mockSessions);

      const result = await service.findAll();
      expect(result).toEqual(mockSessions);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it("should filter by start date", async () => {
      const date = new Date();
      await service.findAll(date);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: { gte: date } },
        }),
      );
    });

    it("should filter by end date", async () => {
      const date = new Date();
      await service.findAll(undefined, date);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: { lte: date } },
        }),
      );
    });

    it("should filter by start and end date", async () => {
      const start = new Date();
      const end = new Date();
      await service.findAll(start, end);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: { gte: start, lte: end } },
        }),
      );
    });
  });

  describe("updateProof", () => {
    it("should update proof", async () => {
      const mockSession = {
        id: "1",
        proofUrl: "url",
        status: "PROOF_RECEIVED",
      } as Session;
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      const result = await service.updateProof("1", "url");
      expect(result).toEqual(mockSession);
    });
  });

  describe("update", () => {
    it("should update session", async () => {
      const mockSession = { id: "1", logistics: "{}" } as Session;
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      const result = await service.update("1", { logistics: "{}" });
      expect(result).toEqual(mockSession);
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { logistics: "{}" },
      });
    });
  });
});

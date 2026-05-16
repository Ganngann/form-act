import { Test, TestingModule } from "@nestjs/testing";
import { NotificationLogService } from "./notification-log.service";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

describe("NotificationLogService", () => {
  let service: NotificationLogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    notificationLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationLogService>(NotificationLogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createLog", () => {
    it("should create a log entry", async () => {
      const data = {
        type: "TEST",
        recipient: "a@a.com",
        status: "SENT",
      } as unknown as Prisma.NotificationLogCreateInput;
      mockPrismaService.notificationLog.create.mockResolvedValue(data);

      const result = await service.createLog(data);
      expect(result).toEqual(data);
      expect(prisma.notificationLog.create).toHaveBeenCalledWith({ data });
    });
  });

  describe("hasLog", () => {
    it("should return true if log exists", async () => {
      mockPrismaService.notificationLog.count.mockResolvedValue(1);
      const result = await service.hasLog("TEST", "session1");
      expect(result).toBe(true);
    });

    it("should return false if log does not exist", async () => {
      mockPrismaService.notificationLog.count.mockResolvedValue(0);
      const result = await service.hasLog("TEST", "session1");
      expect(result).toBe(false);
    });
  });

  describe("getLogsForSessions", () => {
    it("should return a set of cached log keys", async () => {
      mockPrismaService.notificationLog.findMany = jest.fn().mockResolvedValue([
        {
          type: "TEST_TYPE_1",
          metadata: JSON.stringify({ sessionId: "session1" }),
        },
        {
          type: "TEST_TYPE_2",
          metadata: JSON.stringify({ sessionId: "session2" }),
        },
        {
          type: "INVALID_METADATA",
          metadata: "invalid json",
        },
      ]);

      const result = await service.getLogsForSessions(["session1", "session2"]);

      expect(prisma.notificationLog.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { metadata: { contains: "session1" } },
            { metadata: { contains: "session2" } },
          ],
        },
        select: {
          type: true,
          metadata: true,
        },
      });

      expect(result.size).toBe(2);
      expect(result.has("session1:TEST_TYPE_1")).toBe(true);
      expect(result.has("session2:TEST_TYPE_2")).toBe(true);
    });
  });
});

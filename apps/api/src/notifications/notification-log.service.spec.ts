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
    it("should return a set of existing logs", async () => {
      const sessionIds = ["s1", "s2"];
      const logs = [
        { type: "TEST", metadata: '{"sessionId":"s1"}' },
        { type: "TEST2", metadata: '{"sessionId":"s2"}' },
      ];
      mockPrismaService.notificationLog.findMany.mockResolvedValue(logs);

      const result = await service.getLogsForSessions(sessionIds);
      expect(result.has("TEST:s1")).toBe(true);
      expect(result.has("TEST2:s2")).toBe(true);
      expect(result.size).toBe(2);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { NotFoundException } from "@nestjs/common";
import { Session } from "@prisma/client";

describe("SessionsService", () => {
  let service: SessionsService;
  let prisma: PrismaService;
  let emailService: EmailService;

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
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendEmailWithAttachments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
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

  describe("adminUpdate", () => {
    it("should update trainer connect", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSession = { id: "1" } as any;
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession);
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      await service.adminUpdate("1", { trainerId: "t1" });

      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trainer: { connect: { id: "t1" } },
          }),
        }),
      );
    });

    it("should update trainer disconnect", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSession = { id: "1" } as any;
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession);
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      await service.adminUpdate("1", { trainerId: "" }); // Empty string -> disconnect

      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trainer: { disconnect: true },
          }),
        }),
      );
    });

    it("should send email on cancellation", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSession = { id: "1", status: "CONFIRMED" } as any;
      const updatedSession = {
        ...mockSession,
        status: "CANCELLED",
        formation: { title: "Formation" },
        client: { user: { email: "client@test.com" } },
        trainer: { email: "trainer@test.com" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      jest.spyOn(service, "findOne").mockResolvedValue(mockSession);
      jest.spyOn(prisma.session, "update").mockResolvedValue(updatedSession);

      await service.adminUpdate("1", { status: "CANCELLED" });

      expect(emailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "client@test.com",
        expect.stringContaining("Annulation"),
        expect.any(String),
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "trainer@test.com",
        expect.stringContaining("Annulation"),
        expect.any(String),
      );
    });

    it("should NOT send email if already cancelled", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSession = { id: "1", status: "CANCELLED" } as any;
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession);
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      await service.adminUpdate("1", { status: "CANCELLED" });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});

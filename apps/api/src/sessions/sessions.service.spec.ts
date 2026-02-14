import { Test, TestingModule } from "@nestjs/testing";
import { SessionsService } from "./sessions.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { NotFoundException } from "@nestjs/common";
import { Session, Formation } from "@prisma/client";

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
              count: jest.fn(),
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

  afterEach(() => {
    jest.restoreAllMocks();
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

    it("should handle NO_TRAINER filter", async () => {
      await service.findAll(undefined, undefined, undefined, "NO_TRAINER");
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "CONFIRMED",
            trainerId: null,
          }),
        }),
      );
    });

    it("should handle MISSING_LOGISTICS filter", async () => {
      jest.spyOn(prisma.session, "findMany").mockResolvedValue([]);
      await service.findAll(
        undefined,
        undefined,
        undefined,
        "MISSING_LOGISTICS",
      );
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "CONFIRMED",
            date: { gte: expect.any(Date), lte: expect.any(Date) },
            // OR clause removed, we filter in JS
          }),
        }),
      );
    });

    it("should handle MISSING_PROOF filter", async () => {
      await service.findAll(undefined, undefined, undefined, "MISSING_PROOF");
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "CONFIRMED",
            proofUrl: null,
          }),
        }),
      );
    });

    it("should handle READY_TO_BILL filter", async () => {
      await service.findAll(undefined, undefined, undefined, "READY_TO_BILL");
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            proofUrl: { not: null },
            billedAt: null,
          }),
        }),
      );
    });
  });

  describe("findByUserId", () => {
    it("should return client sessions", async () => {
      await service.findByUserId("u1", "CLIENT");
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { client: { userId: "u1" } },
        }),
      );
    });

    it("should return trainer sessions", async () => {
      await service.findByUserId("u2", "TRAINER");
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainer: { userId: "u2" } },
        }),
      );
    });

    it("should return empty array for other roles", async () => {
      const result = await service.findByUserId("u3", "ADMIN");
      expect(result).toEqual([]);
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
      const mockSession = { id: "1" } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession as any);
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
      const mockSession = { id: "1" } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession as any);
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

    it("should auto-confirm PENDING session when trainer is assigned", async () => {
      const mockSession = { id: "1", status: "PENDING" } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession as any);
      jest.spyOn(prisma.session, "update").mockResolvedValue({
        ...mockSession,
        status: "CONFIRMED",
      });

      await service.adminUpdate("1", { trainerId: "t1" });

      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trainer: { connect: { id: "t1" } },
            status: "CONFIRMED",
          }),
        }),
      );
    });

    it("should send email on cancellation", async () => {
      const mockSession = { id: "1", status: "CONFIRMED" } as Session;
      const updatedSession = {
        ...mockSession,
        status: "CANCELLED",
        formation: { title: "Formation" },
        client: { user: { email: "client@test.com" } },
        trainer: { email: "trainer@test.com" },
      } as unknown as Session;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession as any);
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
      const mockSession = { id: "1", status: "CANCELLED" } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, "findOne").mockResolvedValue(mockSession as any);
      jest.spyOn(prisma.session, "update").mockResolvedValue(mockSession);

      await service.adminUpdate("1", { status: "CANCELLED" });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("getAdminStats", () => {
    it("should return counts", async () => {
      jest.spyOn(prisma.session, "count").mockResolvedValue(5);
      jest.spyOn(prisma.session, "findMany").mockResolvedValue([
        { id: "1", location: "", logistics: null } as Session,
        { id: "2", location: "Loc", logistics: null } as Session,
        {
          id: "3",
          location: "Loc",
          participants: '[{"name":"A"}]',
          logistics: JSON.stringify({
            wifi: "yes",
            subsidies: "no",
            videoMaterial: ["None"],
          }),
        } as Session,
      ]);

      const result = await service.getAdminStats();

      expect(result).toEqual({
        pendingRequests: 5,
        noTrainer: 5,
        missingLogistics: 2, // 2 incomplete sessions
        missingProof: 5,
        readyToBill: 5,
      });
      // Called 4 times for other metrics
      expect(prisma.session.count).toHaveBeenCalledTimes(4);
      expect(prisma.session.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("isLogisticsStrictlyComplete", () => {
    const validLogistics = JSON.stringify({
      wifi: "yes",
      subsidies: "no",
      videoMaterial: ["A"],
    });
    const validParticipants = '[{"name":"John"}]';

    it("should return false if no location", () => {
      const s = {
        location: "",
        participants: validParticipants,
        logistics: validLogistics,
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return false if no participants", () => {
      const s = {
        location: "Loc",
        participants: "[]",
        logistics: validLogistics,
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return false if invalid json", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: "invalid",
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return false if no wifi", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({ subsidies: "yes", videoMaterial: ["A"] }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return false if no subsidies", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({ wifi: "yes", videoMaterial: ["A"] }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return false if no material", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({ wifi: "yes", subsidies: "yes" }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(false);
    });

    it("should return true if all present (video)", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({
          wifi: "yes",
          subsidies: "no",
          videoMaterial: ["A"],
        }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(true);
    });

    it("should return true if all present (writing)", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({
          wifi: "no",
          subsidies: "yes",
          writingMaterial: ["A"],
        }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(true);
    });

    it("should return true if all present (none)", () => {
      const s = {
        location: "Loc",
        participants: validParticipants,
        logistics: JSON.stringify({
          wifi: "no",
          subsidies: "yes",
          videoMaterial: ["NONE"],
        }),
      } as Session;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.isLogisticsStrictlyComplete(s as any)).toBe(true);
    });
  });

  describe("Billing", () => {
    describe("calculatePricing", () => {
      it("should return base price and defaults", () => {
        const session = {
          formation: { price: "100" },
          logistics: null,
        } as unknown as Session & { formation: Formation };
        const result = service.calculatePricing(session);
        expect(result).toEqual({
          basePrice: 100,
          distanceFee: 0,
          optionsFee: 0,
          optionsDetails: [],
          total: 100,
        });
      });

      it("should detect video material option", () => {
        const session = {
          formation: { price: "100" },
          logistics: JSON.stringify({ videoMaterial: ["Projector"] }),
        } as unknown as Session & { formation: Formation };
        const result = service.calculatePricing(session);
        expect(result).toEqual({
          basePrice: 100,
          distanceFee: 0,
          optionsFee: 20,
          optionsDetails: ["Kit Vidéo (20€)"],
          total: 120,
        });
      });

      it("should handle invalid JSON logistics", () => {
        const session = {
          formation: { price: "100" },
          logistics: "invalid",
        } as unknown as Session & { formation: Formation };
        const result = service.calculatePricing(session);
        expect(result).toEqual({
          basePrice: 100,
          distanceFee: 0,
          optionsFee: 0,
          optionsDetails: [],
          total: 100,
        });
      });
    });

    describe("getBillingPreview", () => {
      it("should return pricing for session", async () => {
        const session = {
          id: "1",
          formation: { price: "100" },
        } as unknown as Awaited<ReturnType<SessionsService["findOne"]>>;
        jest.spyOn(service, "findOne").mockResolvedValue(session);

        const result = await service.getBillingPreview("1");
        expect(result.basePrice).toBe(100);
      });
    });

    describe("billSession", () => {
      it("should update session and send email", async () => {
        const session = {
          id: "1",
          client: { user: { email: "c@test.com" } },
          formation: { title: "Formation" },
        } as unknown as Awaited<ReturnType<SessionsService["findOne"]>>;

        const billingData = {
          basePrice: 100,
          optionsFee: 0,
          optionsDetails: [],
          distanceFee: 0,
          adminAdjustment: 50,
          finalPrice: 150,
        };
        const updatedSession = { ...session, billedAt: new Date() };

        jest.spyOn(service, "findOne").mockResolvedValue(session);
        jest.spyOn(prisma.session, "update").mockResolvedValue(updatedSession);

        await service.billSession("1", billingData);

        expect(prisma.session.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              billingData: JSON.stringify(billingData),
              billedAt: expect.any(Date),
              status: "INVOICED",
            }),
          }),
        );
        expect(emailService.sendEmail).toHaveBeenCalledWith(
          "c@test.com",
          expect.stringContaining("Facture disponible"),
          expect.stringContaining("150"),
        );
      });

      it("should not fail if email sending fails", async () => {
        jest.spyOn(console, "error").mockImplementation();
        const session = {
          id: "1",
          client: { user: { email: "c@test.com" } },
          formation: { title: "Formation" },
        } as unknown as Awaited<ReturnType<SessionsService["findOne"]>>;

        const billingData = {
          basePrice: 100,
          optionsFee: 0,
          optionsDetails: [],
          distanceFee: 0,
          adminAdjustment: 50,
          finalPrice: 150,
        };
        const updatedSession = { ...session, billedAt: new Date() };

        jest.spyOn(service, "findOne").mockResolvedValue(session);
        jest.spyOn(prisma.session, "update").mockResolvedValue(updatedSession);
        jest
          .spyOn(emailService, "sendEmail")
          .mockRejectedValue(new Error("Email error"));

        await expect(service.billSession("1", billingData)).resolves.toEqual(
          updatedSession,
        );
      });
    });
  });
});

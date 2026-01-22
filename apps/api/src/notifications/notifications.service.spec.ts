import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { EmailService } from "../email/email.service";
import { NotificationLogService } from "./notification-log.service";
import { SessionsService } from "../sessions/sessions.service";
import { PdfService, SessionWithRelations } from "../files/pdf.service";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let emailService: EmailService;
  let logService: NotificationLogService;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendEmailWithAttachments: jest.fn(),
          },
        },
        {
          provide: NotificationLogService,
          useValue: {
            hasLog: jest.fn(),
            createLog: jest.fn(),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateAttendanceSheet: jest
              .fn()
              .mockResolvedValue(Buffer.from("pdf")),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    emailService = module.get<EmailService>(EmailService);
    logService = module.get<NotificationLogService>(NotificationLogService);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Helper to create a base session
  const createSession = (
    overrides: Partial<SessionWithRelations> = {},
  ): SessionWithRelations =>
    ({
      id: "s1",
      date: new Date("2024-02-01T12:00:00Z"),
      createdAt: new Date("2024-01-01T12:00:00Z"),
      status: "CONFIRMED",
      logistics: null,
      participants: null,
      client: {
        id: "c1",
        vatNumber: "123",
        companyName: "ACME",
        address: "123 St",
        userId: "u1",
        user: {
          id: "u1",
          email: "client@acme.com",
          name: "Client",
          password: "",
          role: "CLIENT",
        },
      },
      formation: {
        id: "f1",
        title: "NestJS",
        description: "",
        level: "",
        duration: "",
        durationType: "HALF_DAY",
        programLink: "http://pdf.com",
        expertiseId: null,
        categoryId: null,
      },
      trainer: {
        id: "t1",
        firstName: "John",
        lastName: "Doe",
        email: "trainer@api.com",
        userId: "u2",
        bio: "",
        avatarUrl: "",
      },
      ...overrides,
    }) as unknown as SessionWithRelations;

  describe("T+48h Logistics", () => {
    it("should send reminder if logistics missing and > 48h", async () => {
      const now = new Date("2024-01-03T13:00:00Z"); // 49h after creation
      jest.useFakeTimers({ now });
      const session = createSession({ logistics: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "client@acme.com",
        expect.stringContaining("Informations logistiques manquantes"),
        expect.any(String),
      );
    });

    it("should NOT send reminder if logistics present", async () => {
      const now = new Date("2024-01-03T13:00:00Z");
      jest.useFakeTimers({ now });
      // Remove programLink to avoid J-30 trigger
      const session = createSession({
        logistics: JSON.stringify({ wifi: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formation: { programLink: null } as any,
      });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("should NOT send reminder if < 48h", async () => {
      const now = new Date("2024-01-02T10:00:00Z"); // 22h after creation
      jest.useFakeTimers({ now });
      // Remove programLink to avoid J-30 trigger
      const session = createSession({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formation: { programLink: null } as any,
      });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("J-15 Participants", () => {
    it("should send alert if participants missing at J-15", async () => {
      const now = new Date("2024-01-17T12:00:00Z"); // 15 days before Feb 1
      jest.useFakeTimers({ now });
      const session = createSession({ participants: "[]" }); // Empty array json

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "client@acme.com",
        expect.stringContaining("Rappel : Liste des participants attendue"),
        expect.any(String),
      );
    });

    it("should NOT send alert if > J-15", async () => {
      const now = new Date("2024-01-01T12:00:00Z"); // 30 days before
      jest.useFakeTimers({ now });
      const session = createSession({ participants: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("J-9 Participants Critical", () => {
    it("should send critical alert at J-9", async () => {
      const now = new Date("2024-01-24T12:00:00Z"); // 8 days before (<=9)
      jest.useFakeTimers({ now });
      const session = createSession({ participants: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "client@acme.com",
        expect.stringContaining("URGENT : Liste des participants manquante"),
        expect.any(String),
      );
    });
  });

  describe("J-30 Program", () => {
    it("should send program at J-30", async () => {
      const now = new Date("2024-01-02T12:00:00Z"); // 30 days before
      jest.useFakeTimers({ now });
      const session = createSession();

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "client@acme.com",
        expect.stringContaining("Votre programme de formation"),
        expect.any(String),
      );
    });
  });

  describe("J-21 Mission", () => {
    it("should send mission reminder to trainer at J-21", async () => {
      const now = new Date("2024-01-11T12:00:00Z"); // 21 days before
      jest.useFakeTimers({ now });
      const session = createSession();

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "trainer@api.com",
        expect.stringContaining("Rappel de votre mission"),
        expect.any(String),
      );
    });
  });

  describe("J-7 Attendance", () => {
    it("should send attendance sheet to trainer at J-7", async () => {
      const now = new Date("2024-01-25T12:00:00Z"); // 7 days before
      jest.useFakeTimers({ now });
      const session = createSession();

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(false);

      await service.handleCron();
      expect(emailService.sendEmailWithAttachments).toHaveBeenCalledWith(
        "trainer@api.com",
        expect.stringContaining("Votre Pack Documentaire"),
        expect.any(String),
        expect.any(Array),
      );
    });
  });

  describe("J+1 Proof", () => {
    it("should send proof reminder to trainer at J+1", async () => {
      // Session date is Feb 1st
      // Now is Feb 2nd
      const now = new Date("2024-02-02T10:00:00Z");
      jest.useFakeTimers({ now });
      const session = createSession({ proofUrl: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      // Silence other notifications by pretending they were sent
      jest
        .spyOn(logService, "hasLog")
        .mockImplementation(async (type) => type !== "PROOF_REMINDER_J1");

      await service.handleCron();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "trainer@api.com",
        expect.stringContaining(
          "Action requise : Dépôt de la feuille d'émargement",
        ),
        expect.any(String),
      );
      expect(logService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "PROOF_REMINDER_J1",
        }),
      );
    });

    it("should NOT send proof reminder if proof exists", async () => {
      const now = new Date("2024-02-02T10:00:00Z");
      jest.useFakeTimers({ now });
      const session = createSession({ proofUrl: "http://proof.com" });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      // Silence all notifications
      jest.spyOn(logService, "hasLog").mockResolvedValue(true);

      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("should NOT send proof reminder if not J+1 (e.g. J+2)", async () => {
      const now = new Date("2024-02-03T10:00:00Z"); // 2 days later
      jest.useFakeTimers({ now });
      const session = createSession({ proofUrl: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      // Silence all notifications
      jest.spyOn(logService, "hasLog").mockResolvedValue(true);

      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe("General", () => {
    it("should skip cancelled sessions", async () => {
      const now = new Date("2024-01-25T12:00:00Z");
      jest.useFakeTimers({ now });
      const session = createSession({ status: "CANCELLED" });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(emailService.sendEmailWithAttachments).not.toHaveBeenCalled();
    });

    it("should handle duplicate logs (idempotency)", async () => {
      const now = new Date("2024-01-25T12:00:00Z");
      jest.useFakeTimers({ now });
      const session = createSession();

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      jest.spyOn(logService, "hasLog").mockResolvedValue(true); // Already sent

      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});

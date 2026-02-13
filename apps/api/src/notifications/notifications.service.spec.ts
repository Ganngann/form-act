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
            getLogsForSessions: jest.fn().mockResolvedValue(new Set()),
          },
        },
        {
          provide: SessionsService,
          useValue: {
            findAll: jest.fn(),
            isLogisticsStrictlyComplete: jest.fn(),
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
      jest
        .spyOn(sessionsService, "isLogisticsStrictlyComplete")
        .mockReturnValue(false);

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
      jest
        .spyOn(sessionsService, "isLogisticsStrictlyComplete")
        .mockReturnValue(true);

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
      jest
        .spyOn(sessionsService, "isLogisticsStrictlyComplete")
        .mockReturnValue(false);

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
      // Silence other notifications by pretending they were sent (via getLogsForSessions)
      // Note: We need to know which ones would be triggered.
      // J+1 checks are after J-7, J-21, etc.
      // But the date checks inside J-7 etc should prevent them from firing at J+1 (Feb 2nd vs Feb 1st session)
      // J-7: <= 7 days before. Feb 2 is AFTER Feb 1. Days diff is negative.
      // getDaysUntil(date, now): (date - now). Feb 1 - Feb 2 = -1 day.
      // -1 <= 7. So J-7 check passes!
      // Wait, J-7 check logic: days <= 7.
      // If session is in the past, days is negative.
      // So checks for J-7, J-21, J-30, J-15, J-9 will ALL pass if we only check <= X.
      // But we probably sent them already.
      // In this test, we want to ensure J+1 sends.
      // We should mock getLogsForSessions to return all others?
      // Or just accept that others might be called?
      // "expect(emailService.sendEmail).toHaveBeenCalledWith(..., 'Dépôt de la feuille d'émargement', ...)" checks specific call.

      // Let's mock return of getLogsForSessions to contain others just in case we want to be clean.
      // The old test mocked hasLog to return true for others.
      // We can do the same.
      jest.spyOn(logService, "getLogsForSessions").mockResolvedValue(new Set([
        "DOC_PACK_J7:s1",
        "MISSION_REMINDER_J21:s1",
        "PROGRAM_SEND_J30:s1",
        "PARTICIPANTS_ALERT_J15:s1",
        "PARTICIPANTS_CRITICAL_J9:s1",
        "LOGISTICS_REMINDER_48H:s1"
      ]));

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
      jest.spyOn(logService, "getLogsForSessions").mockResolvedValue(
        new Set([
          "PROOF_REMINDER_J1:s1",
          "LOGISTICS_REMINDER_48H:s1",
          "PARTICIPANTS_ALERT_J15:s1",
          "PARTICIPANTS_CRITICAL_J9:s1",
          "PROGRAM_SEND_J30:s1",
          "MISSION_REMINDER_J21:s1",
          "DOC_PACK_J7:s1",
        ]),
      );

      await service.handleCron();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("should NOT send proof reminder if not J+1 (e.g. J+2)", async () => {
      const now = new Date("2024-02-03T10:00:00Z"); // 2 days later
      jest.useFakeTimers({ now });
      const session = createSession({ proofUrl: null });

      jest.spyOn(sessionsService, "findAll").mockResolvedValue([session]);
      // Silence all notifications
      jest.spyOn(logService, "getLogsForSessions").mockResolvedValue(
        new Set([
          "PROOF_REMINDER_J1:s1",
          "LOGISTICS_REMINDER_48H:s1",
          "PARTICIPANTS_ALERT_J15:s1",
          "PARTICIPANTS_CRITICAL_J9:s1",
          "PROGRAM_SEND_J30:s1",
          "MISSION_REMINDER_J21:s1",
          "DOC_PACK_J7:s1",
        ]),
      );

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
      // Already sent DOC_PACK_J7
      jest.spyOn(logService, "getLogsForSessions").mockResolvedValue(new Set(["DOC_PACK_J7:s1"]));

      await service.handleCron();
      expect(emailService.sendEmailWithAttachments).not.toHaveBeenCalled();
    });
  });
});

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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should send J-15 alert if participants empty", async () => {
    const now = new Date("2024-01-01T12:00:00Z");
    jest.useFakeTimers({ now });

    // J-15 means "days <= 15". Date is 15 days later?
    // 2024-01-16 is 15 days from 2024-01-01.
    const sessionDate = new Date("2024-01-16T12:00:00Z");

    const session = {
      id: "s1",
      date: sessionDate,
      participants: null,
      client: {
        companyName: "ACME",
        user: { email: "client@acme.com" },
      },
      formation: {}, // Prevent crash in checkProgramJ30
      trainer: {}, // Prevent crash in checkMissionJ21
    };

    jest
      .spyOn(sessionsService, "findAll")
      .mockResolvedValue([session as unknown as SessionWithRelations]);
    jest
      .spyOn(sessionsService, "findAll")
      .mockResolvedValue([session as unknown as SessionWithRelations]);
    jest.spyOn(logService, "hasLog").mockResolvedValue(false);

    await service.handleCron();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      "client@acme.com",
      expect.stringContaining("Rappel : Liste des participants attendue"),
      expect.any(String),
    );
    expect(logService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "PARTICIPANTS_ALERT_J15",
      }),
    );
  });

  it("should send T+48h logistics reminder", async () => {
    const now = new Date("2024-01-03T13:00:00Z"); // Jan 3rd 13:00
    jest.useFakeTimers({ now });

    const createdAt = new Date("2024-01-01T12:00:00Z"); // Created Jan 1st 12:00 (49h ago)
    const sessionDate = new Date("2024-02-01T12:00:00Z");

    const session = {
      id: "s2",
      createdAt,
      date: sessionDate,
      logistics: null,
      client: {
        companyName: "ACME",
        user: { email: "client@acme.com" },
      },
      formation: {}, // Prevent crash in checkProgramJ30
      trainer: {}, // Prevent crash in checkMissionJ21
    };

    jest
      .spyOn(sessionsService, "findAll")
      .mockResolvedValue([session as unknown as SessionWithRelations]);
    jest.spyOn(logService, "hasLog").mockResolvedValue(false);

    await service.handleCron();

    expect(emailService.sendEmail).toHaveBeenCalledWith(
      "client@acme.com",
      expect.stringContaining(
        "Action requise : Informations logistiques manquantes",
      ),
      expect.any(String),
    );
    expect(logService.createLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "LOGISTICS_REMINDER_48H",
      }),
    );
  });
});

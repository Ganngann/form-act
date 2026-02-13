import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationLogService } from './notification-log.service';
import { SessionsService } from '../sessions/sessions.service';
import { EmailService } from '../email/email.service';
import { PdfService } from '../files/pdf.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService Performance', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  // Create 100 sessions that trigger multiple checks
  const mockSessions = Array.from({ length: 100 }, (_, i) => ({
    id: `session-${i}`,
    status: 'CONFIRMED',
    // Date is 10 days from now (J-10)
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    // Created 50 days ago (T+48h passed)
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    client: {
      companyName: 'Test Company',
      user: { email: 'test@test.com' },
    },
    trainer: {
      firstName: 'Trainer',
      email: 'trainer@test.com',
    },
    formation: {
      programLink: 'http://example.com/program.pdf',
    },
    participants: JSON.stringify([]), // Empty participants
    logistics: null, // Empty logistics
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        NotificationLogService,
        {
          provide: SessionsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockSessions),
            isLogisticsStrictlyComplete: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendEmailWithAttachments: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateAttendanceSheet: jest.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            notificationLog: {
              count: jest.fn().mockResolvedValue(0), // Simulate no logs exist
              create: jest.fn(),
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should measure database calls for 100 sessions', async () => {
    // Silence logger error during test
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await service.handleCron();

    const countCalls = (prismaService.notificationLog.count as jest.Mock).mock.calls.length;
    const findManyCalls = (prismaService.notificationLog.findMany as jest.Mock).mock.calls.length;

    // Optimized: count calls should be 0 (replaced by batch fetching)
    expect(countCalls).toBe(0);

    // Optimized: findMany calls should be low (100 sessions / 50 batch size = 2 calls)
    expect(findManyCalls).toBeLessThan(10);
  });
});

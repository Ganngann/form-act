import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CalendarService', () => {
  let service: CalendarService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: PrismaService,
          useValue: {
            formateur: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateIcs', () => {
    it('should generate ICS content', async () => {
      const mockTrainer = {
        firstName: 'John',
        lastName: 'Doe',
        sessions: [
          {
            date: new Date('2024-01-01T00:00:00Z'),
            slot: 'AM',
            formation: { title: 'Test Formation' },
            client: { companyName: 'Test Client', address: 'Test Addr' },
            location: 'Specific Loc',
            logistics: null,
          },
        ],
      };

      (prisma.formateur.findUnique as jest.Mock).mockResolvedValue(mockTrainer);

      const ics = await service.generateIcs('valid-token');
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('SUMMARY:Formation: Test Formation');
      expect(ics).toContain('LOCATION:Specific Loc');
      expect(ics).toContain('TZID=Europe/Brussels');
    });

    it('should throw error if token invalid', async () => {
        (prisma.formateur.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(service.generateIcs('invalid')).rejects.toThrow();
    });
  });
});

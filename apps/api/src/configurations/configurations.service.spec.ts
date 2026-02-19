import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationsService } from './configurations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConfigurationsService', () => {
  let service: ConfigurationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationsService,
        {
          provide: PrismaService,
          useValue: {
            siteConfiguration: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConfigurationsService>(ConfigurationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfiguration', () => {
    it('should return parsed JSON value', async () => {
      const mockConfig = { key: 'test', value: '{"foo":"bar"}', updatedAt: new Date() };
      (prisma.siteConfiguration.findUnique as jest.Mock).mockResolvedValue(mockConfig);

      const result = await service.getConfiguration('test');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return empty object if not found', async () => {
      (prisma.siteConfiguration.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getConfiguration('test');
      expect(result).toEqual({});
    });
  });
});

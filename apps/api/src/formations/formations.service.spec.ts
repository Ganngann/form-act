import { Test, TestingModule } from '@nestjs/testing';
import { FormationsService } from './formations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  formation: {
    findMany: jest.fn().mockResolvedValue([
      { id: '1', title: 'NestJS Intro', categoryId: 'dev' },
      { id: '2', title: 'Management 101', categoryId: 'mgt' },
    ]),
  },
};

describe('FormationsService', () => {
  let service: FormationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FormationsService>(FormationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all formations if no categoryId provided', async () => {
    await service.findAll();
    expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
      where: {},
      include: { category: true, expertise: true },
    });
  });

  it('should filter by categoryId if provided', async () => {
    await service.findAll('dev');
    expect(mockPrismaService.formation.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'dev' },
      include: { category: true, expertise: true },
    });
  });
});

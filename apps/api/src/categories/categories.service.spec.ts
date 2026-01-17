import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  category: {
    findMany: jest.fn().mockResolvedValue([
      { id: '1', name: 'Bureautique' },
      { id: '2', name: 'Management' },
    ]),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of categories', async () => {
    const categories = await service.findAll();
    expect(categories).toEqual([
      { id: '1', name: 'Bureautique' },
      { id: '2', name: 'Management' },
    ]);
    expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });
});

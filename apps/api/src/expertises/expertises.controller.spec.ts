import { Test, TestingModule } from '@nestjs/testing';
import { ExpertisesController } from './expertises.controller';
import { ExpertisesService } from './expertises.service';

describe('ExpertisesController', () => {
  let controller: ExpertisesController;
  let service: ExpertisesService;

  const mockExpertisesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpertisesController],
      providers: [
        {
          provide: ExpertisesService,
          useValue: mockExpertisesService,
        },
      ],
    }).compile();

    controller = module.get<ExpertisesController>(ExpertisesController);
    service = module.get<ExpertisesService>(ExpertisesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of expertises', async () => {
      const expertises = [
        { id: 1, name: 'Communication' },
        { id: 2, name: 'Management' },
      ];

      mockExpertisesService.findAll.mockResolvedValue(expertises);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expertises);
    });
  });
});

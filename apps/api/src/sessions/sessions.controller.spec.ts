import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            updateProof: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get<SessionsService>(SessionsService);
  });

  describe('update', () => {
    it('should allow Admin to update anytime', async () => {
      const mockSession = { id: 's1', date: new Date(), client: { userId: 'u1' } };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);
      jest.spyOn(service, 'update').mockResolvedValue(mockSession as any);

      await controller.update('s1', {}, { user: { role: 'ADMIN', userId: 'admin' } });
      expect(service.update).toHaveBeenCalled();
    });

    it('should allow Client to update if > 7 days', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);
        const mockSession = { id: 's1', date: futureDate, client: { userId: 'u1' } };

        jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);
        jest.spyOn(service, 'update').mockResolvedValue(mockSession as any);

        await controller.update('s1', {}, { user: { role: 'CLIENT', userId: 'u1' } });
        expect(service.update).toHaveBeenCalled();
    });

    it('should BLOCK Client update if < 7 days', async () => {
        const nearDate = new Date();
        nearDate.setDate(nearDate.getDate() + 2);
        const mockSession = { id: 's1', date: nearDate, client: { userId: 'u1' } };

        jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);

        await expect(
            controller.update('s1', {}, { user: { role: 'CLIENT', userId: 'u1' } })
        ).rejects.toThrow(ForbiddenException);
    });

    it('should BLOCK Client update if not owner', async () => {
        const mockSession = { id: 's1', date: new Date(), client: { userId: 'u1' } };
        jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);

        await expect(
            controller.update('s1', {}, { user: { role: 'CLIENT', userId: 'other' } })
        ).rejects.toThrow(ForbiddenException);
    });

    it('should allow Trainer to update own session', async () => {
        const mockSession = { id: 's1', date: new Date(), trainer: { userId: 't1' } };
        jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);
        jest.spyOn(service, 'update').mockResolvedValue(mockSession as any);

        await controller.update('s1', {}, { user: { role: 'TRAINER', userId: 't1' } });
        expect(service.update).toHaveBeenCalled();
    });

    it('should BLOCK Trainer update if not owner', async () => {
        const mockSession = { id: 's1', date: new Date(), trainer: { userId: 't1' } };
        jest.spyOn(service, 'findOne').mockResolvedValue(mockSession as any);

        await expect(
            controller.update('s1', {}, { user: { role: 'TRAINER', userId: 'other' } })
        ).rejects.toThrow(ForbiddenException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplatesService,
        {
          provide: PrismaService,
          useValue: {
            emailTemplate: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of templates', async () => {
      const result = [{ id: '1', type: 'TEST' }];
      jest.spyOn(prisma.emailTemplate, 'findMany').mockResolvedValue(result as any);

      expect(await service.findAll()).toBe(result);
      expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith({
        orderBy: { type: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a template', async () => {
      const result = { id: '1', type: 'TEST' };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(result as any);

      expect(await service.findOne('TEST')).toBe(result);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('TEST')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      const existing = { id: '1', type: 'TEST' };
      const updated = { id: '1', type: 'TEST', subject: 'New' };

      jest.spyOn(service, 'findOne').mockResolvedValue(existing as any);
      jest.spyOn(prisma.emailTemplate, 'update').mockResolvedValue(updated as any);

      expect(await service.update('TEST', { subject: 'New' })).toBe(updated);
      expect(prisma.emailTemplate.update).toHaveBeenCalledWith({
        where: { type: 'TEST' },
        data: { subject: 'New' },
      });
    });
  });

  describe('getRenderedTemplate', () => {
    it('should replace variables', async () => {
      const template = {
        id: '1',
        type: 'TEST',
        subject: 'Hello {{name}}',
        body: 'Your code is {{code}}.',
      };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(template as any);

      const result = await service.getRenderedTemplate('TEST', {
        name: 'John',
        code: 123,
      });

      expect(result).toEqual({
        subject: 'Hello John',
        body: 'Your code is 123.',
      });
    });

    it('should handle missing values as empty strings', async () => {
      const template = {
        id: '1',
        type: 'TEST',
        subject: 'Hello {{name}}',
        body: 'Body',
      };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(template as any);

      const result = await service.getRenderedTemplate('TEST', {
        name: null,
      });

      expect(result.subject).toBe('Hello ');
    });

    it('should throw NotFoundException if template missing', async () => {
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(null);

      await expect(service.getRenderedTemplate('TEST', {})).rejects.toThrow(NotFoundException);
    });
  });
});

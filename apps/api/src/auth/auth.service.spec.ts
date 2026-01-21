import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
      it('should hash password', async () => {
          jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed'));
          const result = await service.hashPassword('pass');
          expect(result).toBe('hashed');
      });
  });

  describe('validateUser', () => {
      it('should return user without password if valid', async () => {
          const mockUser = { id: '1', email: 'test@example.com', password: 'hashed' };
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
          jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

          const result = await service.validateUser('test@example.com', 'pass');
          expect(result).toEqual({ id: '1', email: 'test@example.com' });
      });

      it('should return null if user not found', async () => {
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
          const result = await service.validateUser('test@example.com', 'pass');
          expect(result).toBeNull();
      });

      it('should return null if password invalid', async () => {
          const mockUser = { id: '1', email: 'test@example.com', password: 'hashed' };
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
          jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

          const result = await service.validateUser('test@example.com', 'pass');
          expect(result).toBeNull();
      });
  });

  describe('login', () => {
      it('should return access token', async () => {
          const mockUser = { id: '1', email: 'test@example.com', role: 'ADMIN' };
          const result = await service.login(mockUser as any);
          expect(result).toEqual({ access_token: 'token' });
          expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id, role: mockUser.role });
      });
  });

  describe('getUserProfile', () => {
      it('should return user profile', async () => {
          const mockUser = { id: '1', email: 'test@example.com' };
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

          const result = await service.getUserProfile('1');
          expect(result).toEqual(mockUser);
          expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
              where: { id: '1' },
              include: { formateur: { select: { id: true } } }
          }));
      });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy, cookieExtractor } from "./jwt.strategy";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user object if user exists", async () => {
      const payload = { sub: "123", email: "test@example.com", role: "ADMIN" };
      const mockUser = { id: "123", email: "test@example.com", role: "ADMIN" };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);
      expect(result).toEqual({
        userId: "123",
        email: "test@example.com",
        role: "ADMIN",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      const payload = { sub: "nonexistent", email: "test@example.com", role: "ADMIN" };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("cookieExtractor", () => {
    it("should return token from cookies", () => {
      const req = {
        cookies: { Authentication: "token" },
      } as unknown as Request;
      expect(cookieExtractor(req)).toBe("token");
    });

    it("should return undefined if no cookies", () => {
      const req = {} as unknown as Request;
      expect(cookieExtractor(req)).toBeUndefined();
    });

    it("should return undefined if cookie not present", () => {
      const req = { cookies: {} } as unknown as Request;
      expect(cookieExtractor(req)).toBeUndefined();
    });
  });
});

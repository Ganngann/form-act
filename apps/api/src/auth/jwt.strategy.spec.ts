import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy, cookieExtractor } from "./jwt.strategy";
import { Request } from "express";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = "test-secret";

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user object from payload", async () => {
      const payload = { sub: "123", email: "test@example.com", role: "User" };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        userId: "123",
        email: "test@example.com",
        role: "User",
      });
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

import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Response } from "express";

describe("AuthController Security", () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("login", () => {
    it("should NOT return sensitive fields (resetToken, resetTokenExpires)", async () => {
      const dto = { email: "test@example.com", password: "password" };

      // Simulate user object returned by validateUser (which omits password but includes others)
      const userFromService = {
        id: "1",
        email: dto.email,
        name: "Test User",
        role: "CLIENT",
        resetToken: "sensitive-token-123",
        resetTokenExpires: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(userFromService);
      mockAuthService.login.mockResolvedValue({ access_token: "jwt_token" });

      const res = { cookie: jest.fn() } as unknown as Response;

      const result: any = await controller.login(dto, res);

      // Core assertions for security fix
      expect(result).toHaveProperty("email", "test@example.com");
      expect(result).not.toHaveProperty("resetToken");
      expect(result).not.toHaveProperty("resetTokenExpires");
    });
  });
});

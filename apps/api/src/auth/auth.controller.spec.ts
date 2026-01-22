import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { Response } from "express";

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    getUserProfile: jest.fn(),
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

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return user and set cookie on successful login", async () => {
      const dto = { email: "test@example.com", password: "password" };
      const user = { userId: "1", email: dto.email };
      const token = { access_token: "jwt_token" };
      const res = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login(dto, res);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
      expect(res.cookie).toHaveBeenCalledWith(
        "Authentication",
        "jwt_token",
        expect.any(Object),
      );
      expect(result).toEqual(user);
    });

    it("should throw UnauthorizedException if validation fails", async () => {
      const dto = { email: "test@example.com", password: "wrong" };
      mockAuthService.validateUser.mockResolvedValue(null);
      const res = { cookie: jest.fn() } as unknown as Response;

      await expect(controller.login(dto, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("logout", () => {
    it("should clear the cookie", () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith("Authentication", {
        path: "/",
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("getProfile", () => {
    it("should return the user profile without password", async () => {
      const req = { user: { userId: "1" } };
      const userProfile = {
        userId: "1",
        email: "test@example.com",
        password: "hash",
      };

      mockAuthService.getUserProfile.mockResolvedValue(userProfile);

      const result = await controller.getProfile(req);

      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith("1");
      expect(result).toEqual({ userId: "1", email: "test@example.com" });
      expect(result).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const req = { user: { userId: "1" } };
      mockAuthService.getUserProfile.mockResolvedValue(null);

      await expect(controller.getProfile(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

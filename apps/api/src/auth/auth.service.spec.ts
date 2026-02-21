import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email-templates/email-templates.service";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";

import { BadRequestException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let emailTemplatesService: EmailTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: EmailTemplatesService,
          useValue: {
            getRenderedTemplate: jest.fn().mockResolvedValue({
              subject: "Rendered Subject",
              body: "Rendered Body",
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    emailTemplatesService = module.get<EmailTemplatesService>(
      EmailTemplatesService,
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("hashPassword", () => {
    it("should hash password", async () => {
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));
      const result = await service.hashPassword("pass");
      expect(result).toBe("hashed");
    });
  });

  describe("register", () => {
    it("should throw BadRequestException if email already exists", async () => {
      const dto = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue({ id: "1" } as User);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it("should create a new user", async () => {
      const dto = {
        name: "Test User",
        email: "new@example.com",
        password: "password123",
      };
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));

      const createdUser = {
        id: "1",
        ...dto,
        password: "hashed",
        role: "CLIENT",
      } as User;

      jest.spyOn(prisma.user, "create").mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          password: "hashed",
          role: "CLIENT",
        },
      });
      expect(result).toEqual({
        id: "1",
        name: dto.name,
        email: dto.email,
        role: "CLIENT",
      });
      expect(result).not.toHaveProperty("password");
    });
  });

  describe("validateUser", () => {
    it("should return user without password if valid", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashed",
      } as User;
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser("test@example.com", "pass");
      expect(result).toEqual({ id: "1", email: "test@example.com" });
    });

    it("should return null if user not found", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      const result = await service.validateUser("test@example.com", "pass");
      expect(result).toBeNull();
    });

    it("should return null if password invalid", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashed",
      } as User;
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser("test@example.com", "pass");
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        role: "ADMIN",
      } as User;
      const result = await service.login(mockUser);
      expect(result).toEqual({ access_token: "token" });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile", async () => {
      const mockUser = { id: "1", email: "test@example.com" } as User;
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);

      const result = await service.getUserProfile("1");
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "1" },
          include: { formateur: { select: { id: true } }, client: true },
        }),
      );
    });
  });

  describe("forgotPassword", () => {
    it("should return silently if user not found", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      await service.forgotPassword("test@test.com");
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it("should generate token and send email if user found", async () => {
      const mockUser = {
        id: "1",
        email: "test@test.com",
        name: "User",
      } as User;
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, "update").mockResolvedValue(mockUser);

      await service.forgotPassword("test@test.com");

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "1" },
          data: expect.objectContaining({
            resetToken: expect.any(String),
          }),
        }),
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        "test@test.com",
        "Rendered Subject",
        "Rendered Body",
      );
    });
  });

  describe("resetPassword", () => {
    it("should throw BadRequestException if token invalid/expired", async () => {
      jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null);
      await expect(service.resetPassword("token", "newpass")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should update password and clear token", async () => {
      const mockUser = { id: "1" } as User;
      jest.spyOn(prisma.user, "findFirst").mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, "update").mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation(() => Promise.resolve("hashed"));

      await service.resetPassword("token", "newpass");

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "1" },
          data: {
            password: "hashed",
            resetToken: null,
            resetTokenExpires: null,
          },
        }),
      );
    });
  });
});

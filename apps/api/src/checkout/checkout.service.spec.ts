import { Test, TestingModule } from "@nestjs/testing";
import { CheckoutService } from "./checkout.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email-templates/email-templates.service";
import { BadRequestException } from "@nestjs/common";
import { CreateBookingDto } from "./create-booking.dto";
import { User, Client, Session } from "@prisma/client";

describe("CheckoutService", () => {
  let service: CheckoutService;
  let prisma: PrismaService;
  let authService: AuthService;
  let emailService: EmailService;
  let emailTemplatesService: EmailTemplatesService;

  // Mock transaction client
  const mockTx = {
    user: { create: jest.fn() },
    client: { findUnique: jest.fn(), create: jest.fn() },
    session: { create: jest.fn(), findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            client: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn().mockImplementation((cb) => cb(mockTx)),
          },
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
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

    service = module.get<CheckoutService>(CheckoutService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    emailService = module.get<EmailService>(EmailService);
    emailTemplatesService = module.get<EmailTemplatesService>(
      EmailTemplatesService,
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("processCheckout", () => {
    const mockDto: CreateBookingDto = {
      email: "test@example.com",
      password: "password123",
      companyName: "Test Company",
      vatNumber: "VAT123",
      address: "123 St",
      date: "2023-01-01",
      slot: "AM",
      formationId: "formation-1",
      trainerId: "trainer-1",
    };

    it("should use existing user if user already exists", async () => {
      const existingUser = { id: "1", email: "test@example.com" } as User;
      const mockSession = {
        id: "s1",
        status: "PENDING_APPROVAL",
      } as unknown as Session;

      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(existingUser);

      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue({ id: "c1", userId: "1" });
      mockTx.session.findFirst.mockResolvedValue(null);
      mockTx.session.create.mockResolvedValue(mockSession);

      await expect(service.processCheckout(mockDto)).resolves.not.toThrow();

      expect(mockTx.user.create).not.toHaveBeenCalled();
      expect(mockTx.client.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if client already exists and belongs to another user", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      const newUser = { id: "new-user-id", email: mockDto.email };
      mockTx.user.create.mockResolvedValue(newUser);

      mockTx.client.findUnique.mockResolvedValue({
        id: "1",
        vatNumber: "VAT123",
        userId: "other-user-id",
      } as Client);

      await expect(service.processCheckout(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if trainer is not available", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(authService, "hashPassword")
        .mockResolvedValue("hashed_password");

      const mockUser = { id: "user-1", email: mockDto.email };
      const mockClient = { id: "client-1", ...mockDto, userId: "user-1" };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue(mockClient);
      mockTx.session.findFirst.mockResolvedValue({ id: "conflict-session" });

      await expect(service.processCheckout(mockDto)).rejects.toThrow(
        "The selected trainer is not available for this slot.",
      );
    });

    it("should successfully process checkout with PENDING_APPROVAL status even if trainer assigned", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(authService, "hashPassword")
        .mockResolvedValue("hashed_password");

      const mockUser = { id: "user-1", email: mockDto.email };
      const mockClient = { id: "client-1", ...mockDto, userId: "user-1" };
      const mockSession = { id: "session-1", status: "PENDING_APPROVAL" };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue(mockClient);
      mockTx.session.findFirst.mockResolvedValue(null);
      mockTx.session.create.mockResolvedValue(mockSession);

      const result = await service.processCheckout(mockDto);

      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email },
        client: mockClient,
        session: mockSession,
      });
      expect(prisma.$transaction).toHaveBeenCalled();

      // Verify correct status passed to create
      expect(mockTx.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING_APPROVAL",
          }),
        }),
      );

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        "Rendered Subject",
        "Rendered Body",
      );
    });

    it("should process checkout without trainerId (Manual Booking) as PENDING_APPROVAL", async () => {
      const manualDto = { ...mockDto, trainerId: undefined };
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      const mockUser = { id: "user-1", email: manualDto.email };
      const mockClient = { id: "client-1", ...manualDto, userId: "user-1" };
      const mockSession = { id: "session-1", status: "PENDING_APPROVAL" };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue(mockClient);
      mockTx.session.create.mockResolvedValue(mockSession);

      const result = await service.processCheckout(manualDto);

      expect(mockTx.session.findFirst).not.toHaveBeenCalled();
      expect(result.session.status).toBe("PENDING_APPROVAL");

      expect(mockTx.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PENDING_APPROVAL",
          }),
        }),
      );
    });

    it("should check for conflicts correctly when slot is ALL_DAY", async () => {
      const allDayDto = { ...mockDto, slot: "ALL_DAY" };
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      const mockUser = { id: "user-1", email: allDayDto.email };
      const mockClient = { id: "client-1", ...allDayDto, userId: "user-1" };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue(mockClient);
      mockTx.session.findFirst.mockResolvedValue(null);
      mockTx.session.create.mockResolvedValue({ id: "s1" });

      await service.processCheckout(allDayDto);

      expect(mockTx.session.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { slot: "ALL_DAY" },
              { slot: "ALL_DAY" },
              { slot: "AM" },
              { slot: "PM" },
            ]),
          }),
        }),
      );
    });
  });
});

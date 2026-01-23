import { Test, TestingModule } from "@nestjs/testing";
import { CheckoutService } from "./checkout.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { BadRequestException } from "@nestjs/common";
import { CreateBookingDto } from "./create-booking.dto";
import { User, Client } from "@prisma/client";

describe("CheckoutService", () => {
  let service: CheckoutService;
  let prisma: PrismaService;
  let authService: AuthService;

  // Mock transaction client
  const mockTx = {
    user: { create: jest.fn() },
    client: { findUnique: jest.fn(), create: jest.fn() },
    session: { create: jest.fn() },
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
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

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
      // User exists outside transaction
      const existingUser = { id: "1", email: "test@example.com" } as User;
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue(existingUser);

      // Client does not exist
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue({ id: "c1", userId: "1" });
      mockTx.session.create.mockResolvedValue({ id: "s1" });

      await expect(service.processCheckout(mockDto)).resolves.not.toThrow();

      // Should not create user
      expect(mockTx.user.create).not.toHaveBeenCalled();
      // Should create client
      expect(mockTx.client.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if client already exists and belongs to another user", async () => {
      // User does not exist
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Inside tx:
      // Create user returns new user
      const newUser = { id: "new-user-id", email: mockDto.email };
      mockTx.user.create.mockResolvedValue(newUser);

      // Client exists but belongs to "other-user-id"
      mockTx.client.findUnique.mockResolvedValue({ id: "1", vatNumber: "VAT123", userId: "other-user-id" } as Client);

      await expect(service.processCheckout(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should successfully process checkout", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(authService, "hashPassword")
        .mockResolvedValue("hashed_password");

      const mockUser = { id: "user-1", email: mockDto.email };
      const mockClient = { id: "client-1", ...mockDto, userId: "user-1" };
      const mockSession = { id: "session-1", status: "CONFIRMED" };

      mockTx.user.create.mockResolvedValue(mockUser);
      mockTx.client.findUnique.mockResolvedValue(null);
      mockTx.client.create.mockResolvedValue(mockClient);
      mockTx.session.create.mockResolvedValue(mockSession);

      const result = await service.processCheckout(mockDto);

      expect(result).toEqual({
        user: { id: mockUser.id, email: mockUser.email },
        client: mockClient,
        session: mockSession,
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});

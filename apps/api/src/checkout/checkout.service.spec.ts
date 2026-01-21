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
            $transaction: jest.fn(),
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

    it("should throw BadRequestException if user already exists", async () => {
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue({ id: "1", email: "test@example.com" } as User);

      await expect(service.processCheckout(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if client already exists", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(prisma.client, "findUnique")
        .mockResolvedValue({ id: "1", vatNumber: "VAT123" } as Client);

      await expect(service.processCheckout(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should successfully process checkout", async () => {
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(null);
      jest
        .spyOn(authService, "hashPassword")
        .mockResolvedValue("hashed_password");

      const mockUser = { id: "user-1", email: mockDto.email };
      const mockClient = { id: "client-1", ...mockDto };
      const mockSession = { id: "session-1", status: "CONFIRMED" };

      jest
        .spyOn(prisma, "$transaction")
        .mockImplementation(async (callback) => {
          const tx = {
            user: { create: jest.fn().mockResolvedValue(mockUser) },
            client: { create: jest.fn().mockResolvedValue(mockClient) },
            session: { create: jest.fn().mockResolvedValue(mockSession) },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return callback(tx as any);
        });

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

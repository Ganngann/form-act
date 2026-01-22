import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { PrismaService } from "../prisma/prisma.service";
import { Client } from "@prisma/client";

import { NotFoundException } from "@nestjs/common";

describe("ClientsService", () => {
  let service: ClientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            user: {
              update: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prisma)),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of clients", async () => {
      // Mocking partial client data that matches what the service returns (Client & User relation)
      // Since the service query uses 'include', the return type is technically Client & { user: { email: string } }
      // But for the purpose of the test, we can cast to unknown first or use proper typing if available.
      // However, to satisfy strict linting without any, we should use 'unknown' and then cast, or use a Partial.
      const result = [{ id: "1", companyName: "Test" }] as unknown as Client[];

      jest.spyOn(prisma.client, "findMany").mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(prisma.client.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });
  });

  describe("findByUserId", () => {
    it("should return client if found", async () => {
      const mockClient = { id: "1" } as Client;
      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(mockClient);

      expect(await service.findByUserId("u1")).toBe(mockClient);
    });

    it("should throw NotFoundException if not found", async () => {
      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(null);
      await expect(service.findByUserId("u1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update client profile and audit log", async () => {
      const mockClient = {
        id: "1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        auditLog: "[]",
        user: { email: "old@test.com" },
      } as any;

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);
      jest.spyOn(prisma.user, "update").mockResolvedValue({} as any);

      await service.updateProfile(
        "u1",
        {
          companyName: "New",
          vatNumber: "123",
          address: "Addr",
          email: "new@test.com",
        },
        "Admin",
      );

      // Verify user email update
      expect(prisma.user.update).toHaveBeenCalled();
      // Verify client update
      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "1" },
          data: expect.objectContaining({
            companyName: "New",
            auditLog: expect.stringContaining("Nom Entreprise"),
          }),
        }),
      );
    });

    it("should return early if no changes", async () => {
      const mockClient = {
        id: "1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        user: { email: "old@test.com" },
      } as any;

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);

      await service.updateProfile(
        "u1",
        {
          companyName: "Old",
          vatNumber: "123",
          address: "Addr",
          email: "old@test.com",
        },
        "Admin",
      );

      expect(prisma.client.update).not.toHaveBeenCalled();
    });
  });
});

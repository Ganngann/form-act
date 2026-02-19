import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { PrismaService } from "../prisma/prisma.service";
import { Client, User } from "@prisma/client";

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
      } as unknown as Client & { user: { email: string } };

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      jest
        .spyOn(prisma.user, "update")
        .mockResolvedValue({} as unknown as User);

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

    it("should update specific fields only", async () => {
      const mockClient = {
        id: "1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        auditLog: "[]",
        user: { email: "old@test.com" },
      } as unknown as Client & { user: { email: string } };

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateProfile(
        "u1",
        {
          companyName: "Old",
          vatNumber: "456", // Only changing vatNumber
          address: "Addr",
          email: "old@test.com",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vatNumber: "456",
            auditLog: expect.stringContaining("TVA"),
          }),
        }),
      );
    });

    it("should update address only", async () => {
      const mockClient = {
        id: "1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "OldAddr",
        auditLog: "[]",
        user: { email: "old@test.com" },
      } as unknown as Client & { user: { email: string } };

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateProfile(
        "u1",
        {
          companyName: "Old",
          vatNumber: "123",
          address: "NewAddr",
          email: "old@test.com",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            address: "NewAddr",
            auditLog: expect.stringContaining("Adresse"),
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
      } as unknown as Client & { user: { email: string } };

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

    it("should handle null auditLog", async () => {
      const mockClient = {
        id: "1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        auditLog: null,
        user: { email: "old@test.com" },
      } as unknown as Client & { user: { email: string } };

      jest.spyOn(service, "findByUserId").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateProfile(
        "u1",
        {
          companyName: "New",
          vatNumber: "123",
          address: "Addr",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            auditLog: expect.stringContaining("Nom Entreprise"),
          }),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return client by id", async () => {
      const mockClient = { id: "c1" } as Client;
      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(mockClient);

      const result = await service.findOne("c1");
      expect(result).toBe(mockClient);
    });

    it("should throw if not found", async () => {
      jest.spyOn(prisma.client, "findUnique").mockResolvedValue(null);
      await expect(service.findOne("c1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateById", () => {
    it("should update any client by id", async () => {
      const mockClient = {
        id: "c1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);
      jest.spyOn(prisma.user, "update").mockResolvedValue({} as User);

      await service.updateById(
        "c1",
        { companyName: "New", vatNumber: "123", address: "Addr" },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "c1" },
          data: expect.objectContaining({ companyName: "New" }),
        }),
      );
    });

    it("should update vatNumber via updateById", async () => {
      const mockClient = {
        id: "c1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "OldVAT",
        address: "Addr",
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateById(
        "c1",
        {
          companyName: "New",
          vatNumber: "123",
          address: "Addr",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            auditLog: expect.stringContaining("Nom Entreprise"),
          }),
        }),
      );
    });

    it("should append to existing auditLog in updateById", async () => {
      const existingLog = [
        { date: "2023-01-01", by: "User", changes: [] },
      ];
      const mockClient = {
        id: "c1",
        companyName: "Old",
        auditLog: JSON.stringify(existingLog),
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateById(
        "c1",
        {
          companyName: "Old",
          vatNumber: "NewVAT",
          address: "Addr",
          email: "old@test.com",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vatNumber: "NewVAT",
            auditLog: expect.stringContaining("TVA"),
          }),
        }),
      );
    });

    it("should update address via updateById", async () => {
      const mockClient = {
        id: "c1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "OldAddr",
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateById(
        "c1",
        {
          companyName: "Old",
          vatNumber: "123",
          address: "NewAddr",
          email: "old@test.com",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            address: "NewAddr",
            auditLog: expect.stringContaining("Adresse"),
          }),
        }),
      );
    });

    it("should update email via updateById", async () => {
      const mockClient = {
        id: "c1",
        userId: "u1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);
      jest.spyOn(prisma.user, "update").mockResolvedValue({} as User);

      await service.updateById(
        "c1",
        {
          companyName: "Old",
          vatNumber: "123",
          address: "Addr",
          email: "new@test.com",
        },
        "Admin",
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { email: "new@test.com" },
      });
      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            auditLog: expect.stringContaining("Email"),
          }),
        }),
      );
    });

    it("should return early if no changes in updateById", async () => {
      const mockClient = {
        id: "c1",
        companyName: "Old",
        vatNumber: "123",
        address: "Addr",
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);

      await service.updateById(
        "c1",
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

    it("should handle null auditLog in updateById", async () => {
      const mockClient = {
        id: "c1",
        companyName: "Old",
        auditLog: null,
        user: { email: "old@test.com" },
        sessions: [],
      } as unknown as Awaited<ReturnType<ClientsService["findOne"]>>;

      jest.spyOn(service, "findOne").mockResolvedValue(mockClient);
      jest.spyOn(prisma.client, "update").mockResolvedValue(mockClient);

      await service.updateById(
        "c1",
        {
          companyName: "New",
          vatNumber: "123",
          address: "Addr",
        },
        "Admin",
      );

      expect(prisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            auditLog: expect.stringContaining("Nom Entreprise"),
          }),
        }),
      );
    });
  });
});

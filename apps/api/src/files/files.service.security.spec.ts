import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { existsSync, createReadStream } from "fs";

// Mock fs
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));


describe("FilesService Security", () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: {
            // Mock empty prisma service
            session: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);

    // Default mocks
    (existsSync as jest.Mock).mockReturnValue(true);
    (createReadStream as jest.Mock).mockReturnValue("fileStream");
  });

  it("should block access to non-whitelisted folders", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };

    // Testing with a hypothetical sensitive folder
    await expect(
      service.getFile("secrets", "passwords.txt", user),
    ).rejects.toThrow(ForbiddenException);

    // Testing with a hypothetical system folder
    await expect(service.getFile("etc", "passwd", user)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should allow access to whitelisted folders (public)", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };

    // Should not throw ForbiddenException about folder
    // Note: It might throw NotFound or other errors depending on mocking depth,
    // but if it returns stream or proceeds, it means folder check passed.
    const result = await service.getFile("public", "logo.png", user);
    expect(result).toBeDefined();
  });

  it("should allow access to whitelisted folders (avatars)", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };

    const result = await service.getFile("avatars", "user.jpg", user);
    expect(result).toBeDefined();
  });

  it("should reject URI-encoded path traversal", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };
    // %2e%2e%2f is ../
    await expect(
      service.getFile("public", "%2e%2e%2fetc/passwd", user),
    ).rejects.toThrow(NotFoundException);
  });

  it("should reject null bytes in filename", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };
    await expect(
      service.getFile("public", "test.jpg\0.php", user),
    ).rejects.toThrow(NotFoundException);
  });

  it("should reject invalid URI encoding", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };
    await expect(
      service.getFile("public", "test%G1.jpg", user),
    ).rejects.toThrow(NotFoundException);
  });
});

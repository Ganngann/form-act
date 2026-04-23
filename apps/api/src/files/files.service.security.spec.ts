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

// We must not mock path here so that resolve and join work correctly
// and so that the path traversal checks properly evaluate true/false

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

    const result = await service.getFile("public", "logo.png", user);
    expect(result).toBeDefined();
  });

  it("should allow access to whitelisted folders (avatars)", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };

    const result = await service.getFile("avatars", "user.jpg", user);
    expect(result).toBeDefined();
  });

  it("should block absolute path overrides due to path traversal", async () => {
    const user = { userId: "1", role: "ADMIN", email: "admin@test.com" };

    await expect(
      service.getFile("public", "/etc/passwd", user),
    ).rejects.toThrow(NotFoundException);

    await expect(service.getPublicFile("/etc/passwd")).rejects.toThrow(
      NotFoundException,
    );
  });
});

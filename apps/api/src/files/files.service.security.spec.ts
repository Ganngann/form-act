import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { PrismaService } from "../prisma/prisma.service";
import { existsSync, createReadStream } from "fs";
import { ForbiddenException, NotFoundException, StreamableFile } from "@nestjs/common";

// Mock fs and path
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));

jest.mock("path", () => ({
  ...jest.requireActual("path"),
  join: jest.fn((...args) => args.join("/")),
}));

describe("FilesService Security Test", () => {
  let service: FilesService;

  const mockPrismaService = {
    session: {
      findFirst: jest.fn(),
    },
    formateur: {
      findUnique: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
  };

  const mockUser = {
    userId: "u1",
    role: "CLIENT",
    email: "client@example.com",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);

    // Reset mocks
    (existsSync as jest.Mock).mockReset();
    (createReadStream as jest.Mock).mockReset();
  });

  it("should DENY access to arbitrary folders not in whitelist", async () => {
    // Simulate that the file exists in a sensitive folder
    (existsSync as jest.Mock).mockReturnValue(true);
    (createReadStream as jest.Mock).mockReturnValue("fakeStream");

    // Attempt to access a file in 'secret' folder which is NOT in allowed list
    // Should fail with ForbiddenException
    await expect(
      service.getFile("secret", "passwords.txt", mockUser),
    ).rejects.toThrow(ForbiddenException);

    // Verify it NEVER checked file existence (fail fast)
    expect(existsSync).not.toHaveBeenCalled();
  });
});

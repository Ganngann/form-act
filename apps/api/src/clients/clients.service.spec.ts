import { Test, TestingModule } from "@nestjs/testing";
import { ClientsService } from "./clients.service";
import { PrismaService } from "../prisma/prisma.service";
import { Client } from "@prisma/client";

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
            },
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
});

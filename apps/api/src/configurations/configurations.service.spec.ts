import { Test, TestingModule } from "@nestjs/testing";
import { ConfigurationsService } from "./configurations.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ConfigurationsService", () => {
  let service: ConfigurationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationsService,
        {
          provide: PrismaService,
          useValue: {
            siteConfiguration: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConfigurationsService>(ConfigurationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getConfiguration", () => {
    it("should return parsed JSON value", async () => {
      const mockConfig = {
        key: "test",
        value: '{"foo":"bar"}',
        updatedAt: new Date(),
      };
      (prisma.siteConfiguration.findUnique as jest.Mock).mockResolvedValue(
        mockConfig,
      );

      const result = await service.getConfiguration("test");
      expect(result).toEqual({ foo: "bar" });
    });

    it("should return null if not found", async () => {
      (prisma.siteConfiguration.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.getConfiguration("test");
      expect(result).toBeNull();
    });

    it("should handle findUnique errors, log to console.error and return null", async () => {
      const mockError = new Error("Database error");
      (prisma.siteConfiguration.findUnique as jest.Mock).mockRejectedValue(
        mockError,
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await service.getConfiguration("test");

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ConfigurationsService] Error fetching key "test":',
        "Database error"
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it("should handle JSON.parse errors, log to console.error and return null", async () => {
      const mockConfig = {
        key: "test",
        value: 'invalid-json',
        updatedAt: new Date(),
      };
      (prisma.siteConfiguration.findUnique as jest.Mock).mockResolvedValue(
        mockConfig,
      );

      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await service.getConfiguration("test");

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ConfigurationsService] Error fetching key "test":',
        expect.stringContaining("Unexpected token")
      );
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("updateConfiguration", () => {
    it("should stringify an object value and call upsert", async () => {
      const mockResult = {
        key: "test-key",
        value: '{"foo":"bar"}',
        updatedAt: new Date(),
      };
      (prisma.siteConfiguration.upsert as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await service.updateConfiguration("test-key", {
        foo: "bar",
      });

      expect(prisma.siteConfiguration.upsert).toHaveBeenCalledWith({
        where: { key: "test-key" },
        update: { value: '{"foo":"bar"}' },
        create: { key: "test-key", value: '{"foo":"bar"}' },
      });
      expect(result).toEqual(mockResult);
    });

    it("should stringify a primitive value and call upsert", async () => {
      const mockResult = {
        key: "primitive-key",
        value: '"string-value"',
        updatedAt: new Date(),
      };
      (prisma.siteConfiguration.upsert as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await service.updateConfiguration(
        "primitive-key",
        "string-value",
      );

      expect(prisma.siteConfiguration.upsert).toHaveBeenCalledWith({
        where: { key: "primitive-key" },
        update: { value: '"string-value"' },
        create: { key: "primitive-key", value: '"string-value"' },
      });
      expect(result).toEqual(mockResult);
    });
  });
});

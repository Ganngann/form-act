import { Test, TestingModule } from "@nestjs/testing";
import { CompanyService } from "./company.service";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("CompanyService", () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyService],
    }).compile();

    service = module.get<CompanyService>(CompanyService);

    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateVat", () => {
    it("should throw BAD_REQUEST if VAT format is invalid (too short)", async () => {
      await expect(service.validateVat("12")).rejects.toThrow(
        new HttpException("Invalid VAT format", HttpStatus.BAD_REQUEST),
      );
    });

    it("should return valid company data if VIES returns valid", async () => {
      const mockResponse = {
        isValid: true,
        name: "Test Company",
        address: "Test Address",
      };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.validateVat("BE123456789");

      expect(result).toEqual({
        isValid: true,
        companyName: "Test Company",
        address: "Test Address",
        vatNumber: "BE123456789",
      });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://ec.europa.eu/taxation_customs/vies/rest-api/ms/BE/vat/123456789",
      );
    });

    it("should return invalid status if VIES returns invalid", async () => {
      const mockResponse = { isValid: false };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.validateVat("BE123456789");

      expect(result).toEqual({
        isValid: false,
        companyName: "",
        address: "",
      });
    });

    it("should throw BAD_GATEWAY if VIES API errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue("Error"),
      });

      await expect(service.validateVat("BE123456789")).rejects.toThrow(
        new HttpException("VIES API Error: 500", HttpStatus.BAD_GATEWAY),
      );
    });

    it("should throw INTERNAL_SERVER_ERROR on network exception", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(service.validateVat("BE123456789")).rejects.toThrow(
        new HttpException(
          "Error connecting to VIES",
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});

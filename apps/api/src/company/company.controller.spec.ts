import { Test, TestingModule } from "@nestjs/testing";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";

describe("CompanyController", () => {
  let controller: CompanyController;
  let service: CompanyService;

  const mockCompanyService = {
    validateVat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    service = module.get<CompanyService>(CompanyService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("checkVat", () => {
    it("should call validateVat with correct parameters", async () => {
      const vatNumber = "BE123456789";
      const expectedResult = {
        isValid: true,
        companyName: "Test Co",
        address: "123 St",
      };
      mockCompanyService.validateVat.mockResolvedValue(expectedResult);

      const result = await controller.checkVat(vatNumber);

      expect(result).toEqual(expectedResult);
      expect(service.validateVat).toHaveBeenCalledWith(vatNumber);
    });
  });
});

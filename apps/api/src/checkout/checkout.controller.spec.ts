import { Test, TestingModule } from "@nestjs/testing";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { CreateBookingDto } from "./create-booking.dto";

describe("CheckoutController", () => {
  let controller: CheckoutController;
  let service: CheckoutService;

  const mockCheckoutService = {
    processCheckout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("checkout", () => {
    it("should process checkout", async () => {
      const dto = new CreateBookingDto();
      mockCheckoutService.processCheckout.mockResolvedValue({ success: true });

      const result = await controller.checkout(dto);
      expect(result).toEqual({ success: true });
      expect(service.processCheckout).toHaveBeenCalledWith(dto);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { CalendarController } from "./calendar.controller";
import { CalendarService } from "./calendar.service";

describe("CalendarController", () => {
  let controller: CalendarController;
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: {
            generateIcs: jest.fn().mockResolvedValue("BEGIN:VCALENDAR..."),
          },
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getEvents", () => {
    it("should return ICS content", async () => {
      const result = await controller.getEvents("token");
      expect(result).toBe("BEGIN:VCALENDAR...");
      expect(service.generateIcs).toHaveBeenCalledWith("token");
    });
  });
});

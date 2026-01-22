import { Test, TestingModule } from "@nestjs/testing";
import { TrainersController } from "./trainers.controller";
import { TrainersService } from "./trainers.service";
import { ForbiddenException } from "@nestjs/common";

describe("TrainersController", () => {
  let controller: TrainersController;

  const mockTrainer = {
    id: "trainer-id",
    userId: "user-id",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  };

  const mockTrainersService = {
    findOne: jest.fn(),
    getAvailability: jest.fn(),
    getMissions: jest.fn(),
    update: jest.fn(),
    updateAvatar: jest.fn(),
    ensureCalendarToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainersController],
      providers: [
        {
          provide: TrainersService,
          useValue: mockTrainersService,
        },
      ],
    }).compile();

    controller = module.get<TrainersController>(TrainersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findOne", () => {
    it("should return a trainer if user is owner", async () => {
      mockTrainersService.findOne.mockResolvedValue(mockTrainer);
      const req = { user: { role: "TRAINER", userId: "user-id" } };

      const result = await controller.findOne("trainer-id", req);
      expect(result).toEqual(mockTrainer);
    });

    it("should throw ForbiddenException if user is not owner and not admin", async () => {
      mockTrainersService.findOne.mockResolvedValue(mockTrainer);
      const req = { user: { role: "TRAINER", userId: "other-id" } };

      await expect(controller.findOne("trainer-id", req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getCalendarUrl", () => {
    it("should return calendar URL", async () => {
      mockTrainersService.findOne.mockResolvedValue(mockTrainer);
      mockTrainersService.ensureCalendarToken.mockResolvedValue("token-123");
      const req = {
        user: { role: "TRAINER", userId: "user-id" },
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost:3000"),
      };

      const result = await controller.getCalendarUrl("trainer-id", req);
      expect(result).toEqual({
        url: "http://localhost:3000/calendars/token-123/events.ics",
      });
    });

    it("should throw ForbiddenException if user is not owner", async () => {
      mockTrainersService.findOne.mockResolvedValue(mockTrainer);
      const req = { user: { role: "TRAINER", userId: "other-id" } };

      await expect(
        controller.getCalendarUrl("trainer-id", req),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

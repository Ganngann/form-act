import { Test, TestingModule } from "@nestjs/testing";
import { TrainersController } from "./trainers.controller";
import { TrainersService } from "./trainers.service";
import { ForbiddenException, BadRequestException } from "@nestjs/common";

describe("TrainersController", () => {
  let controller: TrainersController;
  let service: TrainersService;

  const mockTrainersService = {
    getAvailability: jest.fn(),
    getMissions: jest.fn(),
    findOne: jest.fn(),
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
    service = module.get<TrainersService>(TrainersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAvailability", () => {
    it("should call service", async () => {
      await controller.getAvailability("1", "2023-01");
      expect(service.getAvailability).toHaveBeenCalledWith("1", "2023-01");
    });
  });

  describe("getMissions", () => {
    it("should call service", async () => {
      await controller.getMissions("1");
      expect(service.getMissions).toHaveBeenCalledWith("1");
    });
  });

  describe("findOnePublic", () => {
    it("should return filtered public info", async () => {
      mockTrainersService.findOne.mockResolvedValue({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        bio: "Bio",
        avatarUrl: "url",
        email: "secret@email.com",
        userId: "u1",
      });

      const result = await controller.findOnePublic("1");

      expect(result).toEqual({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        bio: "Bio",
        avatarUrl: "url",
      });
      // Ensure sensitive data is NOT present
      expect((result as unknown as { email?: string }).email).toBeUndefined();
    });
  });

  describe("findOne", () => {
    it("should return trainer for ADMIN", async () => {
      mockTrainersService.findOne.mockResolvedValue({
        id: "1",
        userId: "u2",
        user: { password: "123" },
      });
      const result = (await controller.findOne("1", {
        user: { role: "ADMIN", userId: "u1" },
      })) as unknown as { user: { password?: string } };
      expect(result.user.password).toBeUndefined();
    });

    it("should return trainer for Owner", async () => {
      mockTrainersService.findOne.mockResolvedValue({
        id: "1",
        userId: "u1",
        user: {},
      });
      await controller.findOne("1", {
        user: { role: "TRAINER", userId: "u1" },
      });
    });

    it("should deny others", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u2" });
      await expect(
        controller.findOne("1", { user: { role: "TRAINER", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("updateProfile", () => {
    it("should allow Owner", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u1" });
      mockTrainersService.update.mockResolvedValue({});
      await controller.updateProfile(
        "1",
        { firstName: "A" },
        { user: { role: "TRAINER", userId: "u1" } },
      );
      expect(service.update).toHaveBeenCalled();
    });

    it("should deny others", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u2" });
      await expect(
        controller.updateProfile(
          "1",
          {},
          { user: { role: "TRAINER", userId: "u1" } },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("uploadAvatar", () => {
    it("should throw if file missing", async () => {
      await expect(controller.uploadAvatar("1", undefined, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should allow Owner", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u1" });
      mockTrainersService.updateAvatar.mockResolvedValue({});
      const file = { filename: "av.jpg" } as Express.Multer.File;
      await controller.uploadAvatar("1", file, {
        user: { role: "TRAINER", userId: "u1" },
      });
      expect(service.updateAvatar).toHaveBeenCalled();
    });

    it("should deny others", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u2" });
      const file = { filename: "av.jpg" } as Express.Multer.File;
      await expect(
        controller.uploadAvatar("1", file, {
          user: { role: "TRAINER", userId: "u1" },
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getCalendarUrl", () => {
    it("should allow Owner", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u1" });
      mockTrainersService.ensureCalendarToken.mockResolvedValue("tok");
      const req = {
        user: { userId: "u1" },
        protocol: "http",
        get: () => "localhost",
      };

      const res = await controller.getCalendarUrl("1", req);
      expect(res.url).toContain("/calendars/tok/events.ics");
    });

    it("should deny others", async () => {
      mockTrainersService.findOne.mockResolvedValue({ id: "1", userId: "u2" });
      const req = { user: { role: "TRAINER", userId: "u1" } };
      await expect(controller.getCalendarUrl("1", req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";
import { ForbiddenException, BadRequestException } from "@nestjs/common";

jest.mock("../common/file-upload.utils", () => ({
  ...jest.requireActual("../common/file-upload.utils"),
  removeFile: jest.fn(),
}));
import { removeFile } from "../common/file-upload.utils";

describe("SessionsController", () => {
  let controller: SessionsController;
  let service: SessionsService;

  const mockSessionsService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updateProof: jest.fn(),
    adminUpdate: jest.fn(),
    getAdminStats: jest.fn(),
    getBillingPreview: jest.fn(),
    billSession: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get<SessionsService>(SessionsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should allow ADMIN and parse dates and status", async () => {
      await controller.findAll(
        { user: { role: "ADMIN" } },
        "2023-01-01",
        "2023-01-02",
        "PENDING",
      );
      expect(service.findAll).toHaveBeenCalledWith(
        new Date("2023-01-01"),
        new Date("2023-01-02"),
        "PENDING",
        undefined,
      );
    });

    it("should allow ADMIN and handle filters", async () => {
      await controller.findAll(
        { user: { role: "ADMIN" } },
        undefined,
        undefined,
        undefined,
        "NO_TRAINER",
      );
      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        "NO_TRAINER",
      );
    });

    it("should allow ADMIN and handle missing dates and filters", async () => {
      await controller.findAll({ user: { role: "ADMIN" } });
      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.findAll({ user: { role: "CLIENT" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findOne", () => {
    it("should allow ADMIN", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      await controller.findOne("1", { user: { role: "ADMIN" } });
      expect(service.findOne).toHaveBeenCalledWith("1");
    });

    it("should allow TRAINER if owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u1" },
      });
      await controller.findOne("1", {
        user: { role: "TRAINER", userId: "u1" },
      });
      expect(service.findOne).toHaveBeenCalledWith("1");
    });

    it("should deny TRAINER if not owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u2" },
      });
      await expect(
        controller.findOne("1", { user: { role: "TRAINER", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow CLIENT if owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        client: { userId: "u1" },
      });
      await controller.findOne("1", { user: { role: "CLIENT", userId: "u1" } });
      expect(service.findOne).toHaveBeenCalledWith("1");
    });

    it("should deny CLIENT if not owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        client: { userId: "u2" },
      });
      await expect(
        controller.findOne("1", { user: { role: "CLIENT", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny unknown role", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      await expect(
        controller.findOne("1", { user: { role: "UNKNOWN" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("uploadProof", () => {
    it("should throw BadRequest if file missing", async () => {
      await expect(controller.uploadProof("1", undefined, {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should allow ADMIN", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      mockSessionsService.updateProof.mockResolvedValue({});
      const file = { filename: "test.jpg" } as Express.Multer.File;

      await controller.uploadProof("1", file, { user: { role: "ADMIN" } });
      expect(service.updateProof).toHaveBeenCalledWith(
        "1",
        "/files/proofs/test.jpg",
      );
    });

    it("should allow TRAINER if owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u1" },
      });
      mockSessionsService.updateProof.mockResolvedValue({});
      const file = { filename: "test.jpg" } as Express.Multer.File;

      await controller.uploadProof("1", file, {
        user: { role: "TRAINER", userId: "u1" },
      });
      expect(service.updateProof).toHaveBeenCalledWith(
        "1",
        "/files/proofs/test.jpg",
      );
    });

    it("should deny TRAINER if not owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u2" },
      });
      const file = { filename: "test.jpg" } as Express.Multer.File;

      await expect(
        controller.uploadProof("1", file, {
          user: { role: "TRAINER", userId: "u1" },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny CLIENT", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      const file = { filename: "test.jpg" } as Express.Multer.File;

      await expect(
        controller.uploadProof("1", file, { user: { role: "CLIENT" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should delete file if authorization fails", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u2" },
      });
      const file = {
        filename: "test.jpg",
        path: "/tmp/test.jpg",
      } as Express.Multer.File;

      await expect(
        controller.uploadProof("1", file, {
          user: { role: "TRAINER", userId: "u1" },
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(removeFile).toHaveBeenCalledWith("/tmp/test.jpg");
    });
  });

  describe("update", () => {
    it("should deny CLIENT if session < 7 days away", async () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 2); // 2 days away
      mockSessionsService.findOne.mockResolvedValue({
        date: nearFuture.toISOString(),
        client: { userId: "u1" },
        isLogisticsOpen: false,
      });

      await expect(
        controller.update("1", {}, { user: { role: "CLIENT", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny CLIENT if session IS EXACTLY 7 days away", async () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 7); // 7 days away
      mockSessionsService.findOne.mockResolvedValue({
        date: nearFuture.toISOString(),
        client: { userId: "u1" },
        isLogisticsOpen: false,
      });

      await expect(
        controller.update("1", {}, { user: { role: "CLIENT", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow CLIENT if session < 7 days away BUT unlocked", async () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 2); // 2 days away
      mockSessionsService.findOne.mockResolvedValue({
        date: nearFuture.toISOString(),
        client: { userId: "u1" },
        isLogisticsOpen: true,
      });
      mockSessionsService.update.mockResolvedValue({});

      await controller.update(
        "1",
        {},
        { user: { role: "CLIENT", userId: "u1" } },
      );
      expect(service.update).toHaveBeenCalled();
    });

    it("should allow CLIENT if session > 7 days away", async () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 10); // 10 days away
      mockSessionsService.findOne.mockResolvedValue({
        date: farFuture.toISOString(),
        client: { userId: "u1" },
      });
      mockSessionsService.update.mockResolvedValue({});

      await controller.update(
        "1",
        {},
        { user: { role: "CLIENT", userId: "u1" } },
      );
      expect(service.update).toHaveBeenCalled();
    });

    it("should deny CLIENT if not owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        client: { userId: "u2" },
      });

      await expect(
        controller.update("1", {}, { user: { role: "CLIENT", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should deny TRAINER if not owner", async () => {
      mockSessionsService.findOne.mockResolvedValue({
        trainer: { userId: "u2" },
      });

      await expect(
        controller.update("1", {}, { user: { role: "TRAINER", userId: "u1" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow ADMIN", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      mockSessionsService.update.mockResolvedValue({});
      await controller.update("1", {}, { user: { role: "ADMIN" } });
      expect(service.update).toHaveBeenCalled();
    });

    it("should deny unknown role", async () => {
      mockSessionsService.findOne.mockResolvedValue({});
      await expect(
        controller.update("1", {}, { user: { role: "UNKNOWN" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("adminUpdate", () => {
    it("should deny non-ADMIN", async () => {
      await expect(
        controller.adminUpdate("1", {}, { user: { role: "CLIENT" } }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow ADMIN", async () => {
      mockSessionsService.adminUpdate.mockResolvedValue({});
      await controller.adminUpdate("1", {}, { user: { role: "ADMIN" } });
      expect(service.adminUpdate).toHaveBeenCalled();
    });
  });

  describe("getAdminStats", () => {
    it("should allow ADMIN", async () => {
      mockSessionsService.getAdminStats = jest.fn().mockResolvedValue({});
      await controller.getAdminStats({ user: { role: "ADMIN" } });
      expect(service.getAdminStats).toHaveBeenCalled();
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.getAdminStats({ user: { role: "CLIENT" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("getBillingPreview", () => {
    it("should allow ADMIN", async () => {
      mockSessionsService.getBillingPreview.mockResolvedValue({});
      await controller.getBillingPreview("1", { user: { role: "ADMIN" } });
      expect(service.getBillingPreview).toHaveBeenCalledWith("1");
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.getBillingPreview("1", { user: { role: "CLIENT" } }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("billSession", () => {
    it("should allow ADMIN", async () => {
      mockSessionsService.billSession.mockResolvedValue({});
      const dto = {
        basePrice: 100,
        optionsFee: 0,
        optionsDetails: [],
        distanceFee: 0,
        adminAdjustment: 0,
        finalPrice: 100,
      };
      await controller.billSession("1", dto, { user: { role: "ADMIN" } });
      expect(service.billSession).toHaveBeenCalledWith("1", dto);
    });

    it("should deny non-ADMIN", async () => {
      await expect(
        controller.billSession(
          "1",
          {
            basePrice: 100,
            optionsFee: 0,
            optionsDetails: [],
            distanceFee: 0,
            adminAdjustment: 0,
            finalPrice: 100,
          },
          { user: { role: "CLIENT" } },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

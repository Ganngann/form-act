import { Test, TestingModule } from "@nestjs/testing";
import { TrainersService } from "./trainers.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { BadRequestException } from "@nestjs/common";

describe("TrainersService", () => {
  let service: TrainersService;

  const mockPrismaService = {
    formateur: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockAuthService = {
    hashPassword: jest.fn().mockResolvedValue("hashed"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<TrainersService>(TrainersService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return data and total with search", async () => {
      mockPrismaService.formateur.findMany.mockResolvedValue([]);
      mockPrismaService.formateur.count.mockResolvedValue(0);
      const result = await service.findAll(0, 10, "test");
      expect(result).toEqual({ data: [], total: 0 });
      expect(mockPrismaService.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { firstName: { contains: "test" } },
              { lastName: { contains: "test" } },
              { email: { contains: "test" } },
            ]),
          }),
        }),
      );
    });

    it("should return data and total without search", async () => {
      mockPrismaService.formateur.findMany.mockResolvedValue([]);
      mockPrismaService.formateur.count.mockResolvedValue(0);
      const result = await service.findAll(0, 10);
      expect(result).toEqual({ data: [], total: 0 });
      expect(mockPrismaService.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it("should return data and total with empty search string", async () => {
      mockPrismaService.formateur.findMany.mockResolvedValue([]);
      mockPrismaService.formateur.count.mockResolvedValue(0);
      const result = await service.findAll(0, 10, "");
      expect(result).toEqual({ data: [], total: 0 });
      expect(mockPrismaService.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it("should use default skip and take", async () => {
      mockPrismaService.formateur.findMany.mockResolvedValue([]);
      mockPrismaService.formateur.count.mockResolvedValue(0);
      await service.findAll();
      expect(mockPrismaService.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a trainer", async () => {
      const trainer = { id: "1" };
      mockPrismaService.formateur.findUnique.mockResolvedValue(trainer);
      expect(await service.findOne("1")).toEqual(trainer);
    });

    it("should throw if not found", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      await expect(service.findOne("1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("create", () => {
    it("should create trainer and user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: "u1" });
      mockPrismaService.formateur.create.mockResolvedValue({ id: "t1" });

      await service.create({ firstName: "A", lastName: "B", email: "a@b.com" });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.formateur.create).toHaveBeenCalled();
    });

    it("should create trainer with predilection and expertise zones", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: "u1" });
      mockPrismaService.formateur.create.mockResolvedValue({ id: "t1" });

      const dto = {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        predilectionZones: ["z1"],
        expertiseZones: ["z2", "z1"], // z1 is in predilection, so it should be filtered out from expertise
      };

      await service.create(dto);

      expect(mockPrismaService.formateur.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          predilectionZones: { connect: [{ id: "z1" }] },
          expertiseZones: { connect: [{ id: "z2" }] },
        }),
      });
    });

    it("should create trainer with expertise zones but no predilection zones", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: "u1" });
      mockPrismaService.formateur.create.mockResolvedValue({ id: "t1" });

      const dto = {
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        expertiseZones: ["z2"],
      };

      await service.create(dto);

      expect(mockPrismaService.formateur.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expertiseZones: { connect: [{ id: "z2" }] },
        }),
      });
    });

    it("should throw if user exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: "u1" });
      await expect(
        service.create({ firstName: "A", lastName: "B", email: "a@b.com" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw if trainer exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.formateur.findUnique.mockResolvedValue({ id: "t1" });
      await expect(
        service.create({ firstName: "A", lastName: "B", email: "a@b.com" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("update", () => {
    it("should update trainer without zones", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [],
        userId: "u1",
        firstName: "Old",
        lastName: "Name",
      });
      mockPrismaService.formateur.update.mockResolvedValue({ id: "t1" });
      // Call update with NO zones to trigger skipped if blocks
      await service.update("t1", { firstName: "B", email: "b@b.com" });
      expect(mockPrismaService.formateur.update).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it("should update zones", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [{ id: "z1" }],
        userId: "u1",
      });
      await service.update("t1", {
        predilectionZones: ["z2"],
        expertiseZones: ["z3"],
        email: "c@c.com",
      });
      expect(mockPrismaService.formateur.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            predilectionZones: { set: [{ id: "z2" }] },
            expertiseZones: { set: [{ id: "z3" }] },
          }),
        }),
      );
    });

    it("should update expertise zones filtering predilection zones", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [{ id: "z1" }],
        userId: "u1",
      });
      // predilectionZones provided, so it uses provided list for filtering
      await service.update("t1", {
        predilectionZones: ["z1"],
        expertiseZones: ["z1", "z2"], // z1 should be filtered out
        email: "d@d.com",
      });
      expect(mockPrismaService.formateur.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expertiseZones: { set: [{ id: "z2" }] },
          }),
        }),
      );
    });

    it("should update expertise zones filtering EXISTING predilection zones", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [{ id: "z1" }],
        userId: "u1",
      });
      // predilectionZones NOT provided, so it uses existing list for filtering
      await service.update("t1", {
        expertiseZones: ["z1", "z2"], // z1 should be filtered out
        email: "e@e.com",
      });
      expect(mockPrismaService.formateur.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expertiseZones: { set: [{ id: "z2" }] },
          }),
        }),
      );
    });

    it("should throw if not found", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      await expect(service.update("t1", {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should not update user if trainer has no userId", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [],
        userId: null,
      });
      mockPrismaService.formateur.update.mockResolvedValue({ id: "t1" });

      await service.update("t1", { firstName: "B" });
      expect(mockPrismaService.formateur.update).toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it("should not update user if trainer userId is undefined", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        predilectionZones: [],
        // userId undefined
      });
      mockPrismaService.formateur.update.mockResolvedValue({ id: "t1" });

      await service.update("t1", { firstName: "B" });
      expect(mockPrismaService.formateur.update).toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove trainer", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        id: "t1",
        userId: "u1",
      });
      mockPrismaService.session.count.mockResolvedValue(0);
      await service.remove("t1");
      expect(mockPrismaService.formateur.delete).toHaveBeenCalled();
      expect(mockPrismaService.user.delete).toHaveBeenCalled();
    });

    it("should throw if sessions exist", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({ id: "t1" });
      mockPrismaService.session.count.mockResolvedValue(1);
      await expect(service.remove("t1")).rejects.toThrow(BadRequestException);
    });

    it("should throw if trainer not found", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      await expect(service.remove("t1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getAvailability", () => {
    it("should query range if month provided", async () => {
      await service.getAvailability("t1", "2023-01");
      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.any(Object),
          }),
        }),
      );
    });

    it("should query today onwards if no month", async () => {
      await service.getAvailability("t1");
      expect(mockPrismaService.session.findMany).toHaveBeenCalled();
    });

    it("should handle invalid month string gracefully", async () => {
      await service.getAvailability("t1", "invalid-month");
      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainerId: "t1" }, // No date key or default logic dependent on impl
        }),
      );
    });

    it("should handle partially invalid month string", async () => {
      await service.getAvailability("t1", "2023-invalid");
      // Should fall through to no date filter or default filter, depending on implementation detail.
      // In the code: if (!isNaN(year) && !isNaN(monthNum))
      // So it skips the if block, and thus `where.date` is not set from month logic.
      // Wait, the code says:
      /*
        if (month) {
            const [year, monthNum] = month.split("-").map(Number);
            if (!isNaN(year) && !isNaN(monthNum)) {
                ...
            }
        } else {
            ...
        }
       */
      // So if month is provided but invalid, it enters `if (month)` but fails the `!isNaN` check.
      // Thus `where.date` is NOT set.
      // This matches the "invalid-month" case.
      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trainerId: "t1" },
        }),
      );
    });
  });

  describe("getMissions", () => {
    it("should return missions", async () => {
      await service.getMissions("t1");
      expect(mockPrismaService.session.findMany).toHaveBeenCalled();
    });
  });

  describe("updateAvatar", () => {
    it("should update avatar", async () => {
      await service.updateAvatar("t1", "url");
      expect(mockPrismaService.formateur.update).toHaveBeenCalled();
    });
  });

  describe("ensureCalendarToken", () => {
    it("should return existing token", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        calendarToken: "tok",
      });
      expect(await service.ensureCalendarToken("t1")).toBe("tok");
    });

    it("should generate new token", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue({
        calendarToken: null,
      });
      await service.ensureCalendarToken("t1");
      expect(mockPrismaService.formateur.update).toHaveBeenCalled();
    });

    it("should throw if trainer not found", async () => {
      mockPrismaService.formateur.findUnique.mockResolvedValue(null);
      await expect(service.ensureCalendarToken("t1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

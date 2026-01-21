import { Test, TestingModule } from "@nestjs/testing";
import { TrainersService } from "./trainers.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "../auth/auth.service";
import { BadRequestException } from "@nestjs/common";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";
import { Formateur, Session } from "@prisma/client";

describe("TrainersService", () => {
  let service: TrainersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainersService,
        {
          provide: PrismaService,
          useValue: {
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
              count: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue("hashed_password"),
          },
        },
      ],
    }).compile();

    service = module.get<TrainersService>(TrainersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated trainers", async () => {
      const mockTrainers = [{ id: "1", firstName: "John" }] as Formateur[];
      const mockCount = 1;
      jest.spyOn(prisma.formateur, "findMany").mockResolvedValue(mockTrainers);
      jest.spyOn(prisma.formateur, "count").mockResolvedValue(mockCount);

      const result = await service.findAll();
      expect(result).toEqual({ data: mockTrainers, total: mockCount });
    });

    it("should filter by search", async () => {
      const mockTrainers = [{ id: "1", firstName: "John" }] as Formateur[];
      const mockCount = 1;
      jest.spyOn(prisma.formateur, "findMany").mockResolvedValue(mockTrainers);
      jest.spyOn(prisma.formateur, "count").mockResolvedValue(mockCount);

      await service.findAll(0, 10, "John");
      expect(prisma.formateur.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([{ firstName: { contains: "John" } }]),
          }),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a trainer", async () => {
      const mockTrainer = { id: "1", firstName: "John" } as Formateur;
      jest.spyOn(prisma.formateur, "findUnique").mockResolvedValue(mockTrainer);

      const result = await service.findOne("1");
      expect(result).toEqual(mockTrainer);
    });

    it("should throw BadRequestException if trainer not found", async () => {
      jest.spyOn(prisma.formateur, "findUnique").mockResolvedValue(null);
      await expect(service.findOne("1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("create", () => {
    const mockDto: CreateTrainerDto = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    it("should throw if user exists", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          user: { findUnique: jest.fn().mockResolvedValue({ id: "1" }) },
          formateur: { findUnique: jest.fn() },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      await expect(service.create(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw if trainer exists", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          user: { findUnique: jest.fn().mockResolvedValue(null) },
          formateur: { findUnique: jest.fn().mockResolvedValue({ id: "1" }) },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      await expect(service.create(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should create trainer", async () => {
      const mockTrainer = { id: "1", ...mockDto };
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: "u1" }),
          },
          formateur: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockTrainer),
          },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });

      const result = await service.create(mockDto);
      expect(result).toEqual(mockTrainer);
    });
  });

  describe("update", () => {
    const mockDto: UpdateTrainerDto = {
      firstName: "Jane",
      email: "jane@example.com",
      predilectionZones: ["z1"],
      expertiseZones: ["z2"],
    };

    it("should throw if trainer not found", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          formateur: { findUnique: jest.fn().mockResolvedValue(null) },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      await expect(service.update("1", mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should update trainer", async () => {
      const mockTrainer = {
        id: "1",
        userId: "u1",
        predilectionZones: [],
        expertiseZones: [],
      };
      const updatedTrainer = { ...mockTrainer, firstName: "Jane" };

      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          formateur: {
            findUnique: jest.fn().mockResolvedValue(mockTrainer),
            update: jest.fn().mockResolvedValue(updatedTrainer),
          },
          user: { update: jest.fn() },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });

      const result = await service.update("1", mockDto);
      expect(result).toEqual(updatedTrainer);
    });
  });

  describe("remove", () => {
    it("should throw if trainer not found", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          formateur: { findUnique: jest.fn().mockResolvedValue(null) },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
    });

    it("should throw if trainer has sessions", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          formateur: { findUnique: jest.fn().mockResolvedValue({ id: "1" }) },
          session: { count: jest.fn().mockResolvedValue(1) },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
    });

    it("should remove trainer", async () => {
      jest.spyOn(prisma, "$transaction").mockImplementation(async (cb) => {
        const tx = {
          formateur: {
            findUnique: jest.fn().mockResolvedValue({ id: "1", userId: "u1" }),
            delete: jest.fn(),
          },
          session: { count: jest.fn().mockResolvedValue(0) },
          user: { delete: jest.fn() },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return cb(tx as any);
      });
      const result = await service.remove("1");
      expect(result).toEqual({ success: true });
    });
  });

  describe("getAvailability", () => {
    it("should return availability for a specific month", async () => {
      const mockSessions = [{ id: "1" }] as Session[];
      jest.spyOn(prisma.session, "findMany").mockResolvedValue(mockSessions);

      const result = await service.getAvailability("1", "2023-01");
      expect(result).toEqual(mockSessions);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it("should return availability from today if no month provided", async () => {
      const mockSessions = [{ id: "1" }] as Session[];
      jest.spyOn(prisma.session, "findMany").mockResolvedValue(mockSessions);

      const result = await service.getAvailability("1");
      expect(result).toEqual(mockSessions);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe("getMissions", () => {
    it("should return missions", async () => {
      const mockSessions = [{ id: "1" }] as Session[];
      jest.spyOn(prisma.session, "findMany").mockResolvedValue(mockSessions);

      const result = await service.getMissions("1");
      expect(result).toEqual(mockSessions);
      expect(prisma.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            trainerId: "1",
            date: expect.objectContaining({ gte: expect.any(Date) }),
          }),
        }),
      );
    });
  });

  describe("updateAvatar", () => {
    it("should update avatar", async () => {
      const mockTrainer = { id: "1", avatarUrl: "url" } as Formateur;
      jest.spyOn(prisma.formateur, "update").mockResolvedValue(mockTrainer);

      const result = await service.updateAvatar("1", "url");
      expect(result).toEqual(mockTrainer);
    });
  });
});

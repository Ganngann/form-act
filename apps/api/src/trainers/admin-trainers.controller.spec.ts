import { Test, TestingModule } from "@nestjs/testing";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";
import { UpdateTrainerDto } from "./dto/update-trainer.dto";

describe("AdminTrainersController", () => {
  let controller: AdminTrainersController;
  let service: TrainersService;

  const mockTrainersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTrainersController],
      providers: [
        {
          provide: TrainersService,
          useValue: mockTrainersService,
        },
      ],
    }).compile();

    controller = module.get<AdminTrainersController>(AdminTrainersController);
    service = module.get<TrainersService>(TrainersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should call findAll with correct params", async () => {
      await controller.findAll("10", "20", "query");
      expect(service.findAll).toHaveBeenCalledWith(10, 20, "query");
    });

    it("should use defaults if params missing", async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalledWith(0, 10, undefined);
    });
  });

  describe("findOne", () => {
    it("should call findOne", async () => {
      await controller.findOne("1");
      expect(service.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("create", () => {
    it("should call create", async () => {
      const dto: CreateTrainerDto = {
        firstName: "John",
        lastName: "Doe",
        email: "j@d.com",
      };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("should call update", async () => {
      const dto: UpdateTrainerDto = { firstName: "Jane" };
      await controller.update("1", dto);
      expect(service.update).toHaveBeenCalledWith("1", dto);
    });
  });

  describe("remove", () => {
    it("should call remove", async () => {
      await controller.remove("1");
      expect(service.remove).toHaveBeenCalledWith("1");
    });
  });
});

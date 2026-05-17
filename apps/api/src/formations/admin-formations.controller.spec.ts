import { Test, TestingModule } from "@nestjs/testing";
import { AdminFormationsController } from "./admin-formations.controller";
import { FormationsService } from "./formations.service";
import { CreateFormationDto } from "./dto/create-formation.dto";
import { UpdateFormationDto } from "./dto/update-formation.dto";

describe("AdminFormationsController", () => {
  let controller: AdminFormationsController;
  let service: FormationsService;

  const mockFormationsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminFormationsController],
      providers: [
        {
          provide: FormationsService,
          useValue: mockFormationsService,
        },
      ],
    }).compile();

    controller = module.get<AdminFormationsController>(
      AdminFormationsController,
    );
    service = module.get<FormationsService>(FormationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return formations", async () => {
      const formations = [{ id: "1", title: "Formation 1" }];
      mockFormationsService.findAll.mockResolvedValue(formations);

      const result = await controller.findAll();

      expect(result).toEqual(formations);
      expect(service.findAll).toHaveBeenCalledWith(undefined, undefined, true);
    });
  });

  describe("create", () => {
    it("should create a formation", async () => {
      const createFormationDto: CreateFormationDto = {
        title: "New Formation",
        categoryId: "cat1",
        videoUrl: "http://example.com/video.mp4",
        isPaid: false,
        duration: 120,
      } as any;
      const createdFormation = { id: "1", ...createFormationDto };
      mockFormationsService.create.mockResolvedValue(createdFormation);

      const result = await controller.create(createFormationDto);

      expect(result).toEqual(createdFormation);
      expect(service.create).toHaveBeenCalledWith(createFormationDto);
    });
  });

  describe("update", () => {
    it("should update a formation", async () => {
      const updateFormationDto: UpdateFormationDto = { title: "Updated" };
      const updatedFormation = { id: "1", title: "Updated" };
      mockFormationsService.update.mockResolvedValue(updatedFormation);

      const result = await controller.update("1", updateFormationDto);

      expect(result).toEqual(updatedFormation);
      expect(service.update).toHaveBeenCalledWith("1", updateFormationDto);
    });
  });

  describe("remove", () => {
    it("should remove a formation", async () => {
      const removedFormation = { id: "1", title: "Removed" };
      mockFormationsService.remove.mockResolvedValue(removedFormation);

      const result = await controller.remove("1");

      expect(result).toEqual(removedFormation);
      expect(service.remove).toHaveBeenCalledWith("1");
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

describe("AdminTrainersController Security", () => {
  let reflector: Reflector;

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
        Reflector,
      ],
    }).compile();

    reflector = module.get<Reflector>(Reflector);
  });

  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThanOrEqual(2);

    const hasRolesGuard = guards.some((guard) => guard === RolesGuard);
    expect(hasRolesGuard).toBe(true);
  });

  it("should have Roles('ADMIN') applied", () => {
    const roles = reflector.get<string[]>(ROLES_KEY, AdminTrainersController);
    expect(roles).toEqual(["ADMIN"]);
  });
});

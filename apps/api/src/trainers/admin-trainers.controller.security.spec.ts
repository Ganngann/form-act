import { Test, TestingModule } from "@nestjs/testing";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { ROLES_KEY } from "../auth/roles.decorator";

describe("AdminTrainersController Security", () => {
  let controller: AdminTrainersController;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTrainersController],
      providers: [
        {
          provide: TrainersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AdminTrainersController>(AdminTrainersController);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be protected with guards", () => {
    const guards = reflector.get<any[]>('__guards__', AdminTrainersController);
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it("should have ADMIN role restriction", () => {
    const roles = reflector.get<string[]>(ROLES_KEY, AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toContain("ADMIN");
  });
});

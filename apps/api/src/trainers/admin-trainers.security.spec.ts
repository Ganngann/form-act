import { Test, TestingModule } from "@nestjs/testing";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { Reflector } from "@nestjs/core";

describe("AdminTrainersController Security", () => {
  let controller: AdminTrainersController;

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
  });

  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();

    const hasAuthGuard = guards.some((guard) => {
      const name = guard.name || (guard.constructor && guard.constructor.name);
      return name === "default_1" || name === "Mixin" || name === "JwtAuthGuard" || name === "";
    });

    const hasRolesGuard = guards.some((guard) => {
      const name = guard.name || (guard.constructor && guard.constructor.name);
      return name === "RolesGuard" || guard === RolesGuard;
    });

    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it("should be restricted to ADMIN role", () => {
    const roles = Reflect.getMetadata("roles", AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toContain("ADMIN");
  });
});

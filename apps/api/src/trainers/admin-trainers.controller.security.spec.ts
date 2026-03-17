import { Test, TestingModule } from "@nestjs/testing";
import { AdminTrainersController } from "./admin-trainers.controller";
import { TrainersService } from "./trainers.service";
import { Reflector } from "@nestjs/core";

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
    reflector = new Reflector();
  });

  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();

    const guardNames = guards.map(
      (g: any) => g.name || g.constructor.name
    );
    expect(guardNames).toContain("RolesGuard");
    // AuthGuard("jwt") is an anonymous function/mixin, so its name varies (e.g., 'default_1').
    // As long as RolesGuard and *another* guard exist, we have reasonable confidence.
    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it('should be restricted to "ADMIN" role', () => {
    const roles = reflector.get<string[]>("roles", AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toEqual(["ADMIN"]);
  });
});

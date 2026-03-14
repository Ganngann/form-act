import { Test, TestingModule } from "@nestjs/testing";
import { AdminFormationsController } from "./admin-formations.controller";
import { FormationsService } from "./formations.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { Reflector } from "@nestjs/core";

describe("AdminFormationsController Security", () => {
  let controller: AdminFormationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminFormationsController],
      providers: [
        {
          provide: FormationsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AdminFormationsController>(AdminFormationsController);
  });

  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = Reflect.getMetadata("__guards__", AdminFormationsController);
    expect(guards).toBeDefined();

    // Check if guards exist
    const hasAuthGuard = guards.some(
      (guard) =>
        guard.name === "default_1" ||
        (guard.constructor && guard.constructor.name === "default_1")
    );
    const hasRolesGuard = guards.some(
      (guard) => guard === RolesGuard || guard.name === "RolesGuard"
    );

    expect(hasAuthGuard).toBeTruthy();
    expect(hasRolesGuard).toBeTruthy();
  });

  it('should be restricted to ADMIN role', () => {
    const roles = Reflect.getMetadata('roles', AdminFormationsController);
    expect(roles).toBeDefined();
    expect(roles).toContain('ADMIN');
  });
});

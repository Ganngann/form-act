import { Reflector } from "@nestjs/core";
import { AdminTrainersController } from "./admin-trainers.controller";
import { RolesGuard } from "../auth/roles.guard";
import { AuthGuard } from "@nestjs/passport";

describe("AdminTrainersController Security", () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = reflector.get("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThanOrEqual(2);

    // Verify AuthGuard('jwt') is present
    // It's a dynamically generated class by NestJS, name matches `AuthGuard("jwt").name` but in tests it can also be `default_1` or a hash
    const AuthGuardClass = AuthGuard("jwt");
    const hasAuthGuard = guards.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (guard: any) =>
        guard.name === "default_1" ||
        guard.constructor.name === "default_1" ||
        guard.name === AuthGuardClass.name,
    );
    expect(hasAuthGuard).toBeTruthy();

    // Verify RolesGuard is present
    const hasRolesGuard = guards.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (guard: any) => guard === RolesGuard || guard.name === "RolesGuard",
    );
    expect(hasRolesGuard).toBeTruthy();
  });

  it("should require ADMIN role", () => {
    const roles = reflector.get("roles", AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toContain("ADMIN");
  });
});

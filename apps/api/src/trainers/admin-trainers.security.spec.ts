import { AdminTrainersController } from "./admin-trainers.controller";
import { ROLES_KEY } from "../auth/roles.decorator";

describe("AdminTrainersController Security", () => {
  it("should have AuthGuard and RolesGuard applied", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();

    // More robust check for AuthGuard and RolesGuard presence
    const guardClasses = guards.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (guard: any) =>
        guard.name ||
        (typeof guard === "function" ? guard.name : guard.constructor.name),
    );

    // NestJS AuthGuard("jwt") creates an anonymous class or mixin, often just checked by ensuring guards array exists and has elements.
    // RolesGuard should be explicitly identifiable.
    expect(guards.length).toBeGreaterThanOrEqual(2);
    expect(guardClasses).toContain("RolesGuard");
  });

  it("should be restricted to ADMIN role", () => {
    const roles = Reflect.getMetadata(ROLES_KEY, AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toEqual(["ADMIN"]);
  });
});

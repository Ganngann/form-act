import { AdminTrainersController } from "./admin-trainers.controller";

describe("AdminTrainersController Security", () => {
  it("should be secured with JWT and Roles guards", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController);
    expect(guards).toBeDefined();
    const guardNames = guards.map(
      (g: { name?: string; constructor: { name: string } }) =>
        g.name || (typeof g === "function" ? g.name : g.constructor.name),
    );
    expect(guardNames).toContain("RolesGuard");
    // We check for the AuthGuard which is an anonymous class returned by AuthGuard('jwt')
    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it("should be restricted to ADMIN role", () => {
    const roles = Reflect.getMetadata("roles", AdminTrainersController);
    expect(roles).toEqual(["ADMIN"]);
  });
});

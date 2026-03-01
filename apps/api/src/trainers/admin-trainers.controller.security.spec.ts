import { AdminTrainersController } from "./admin-trainers.controller";
import { RolesGuard } from "../auth/roles.guard";

describe("AdminTrainersController Security", () => {
  it("should be secured with JWT and Roles guards", () => {
    const guards = Reflect.getMetadata("__guards__", AdminTrainersController) as Array<any>;
    expect(guards).toBeDefined();

    // The guards array will contain instances or classes.
    // AuthGuard("jwt") returns a mixin class, so we check the name or prototype
    const hasAuthGuard = guards.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (guard: any) =>
        guard.name === "JwtAuthGuard" ||
        guard.prototype?.canActivate ||
        guard.name === "MixinAuthGuard",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasRolesGuard = guards.some((guard: any) => guard === RolesGuard);

    expect(hasAuthGuard).toBeTruthy();
    expect(hasRolesGuard).toBeTruthy();
  });

  it("should be restricted to ADMIN role", () => {
    const roles = Reflect.getMetadata("roles", AdminTrainersController);
    expect(roles).toBeDefined();
    expect(roles).toEqual(["ADMIN"]);
  });
});

import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ROLES_KEY } from "./roles.decorator";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    let context: ExecutionContext;
    let getRequestMock: jest.Mock;

    beforeEach(() => {
      getRequestMock = jest.fn();
      context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: getRequestMock,
        }),
      } as unknown as ExecutionContext;
    });

    it("should return true if no roles are required", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it("should return true if user has required role", () => {
      const roles = ["ADMIN"];
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);
      getRequestMock.mockReturnValue({ user: { role: "ADMIN" } });

      expect(guard.canActivate(context)).toBe(true);
    });

    it("should return false if user has different role", () => {
      const roles = ["ADMIN"];
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);
      getRequestMock.mockReturnValue({ user: { role: "USER" } });

      expect(guard.canActivate(context)).toBe(false);
    });

    it("should return false if user object is missing", () => {
      const roles = ["ADMIN"];
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);
      getRequestMock.mockReturnValue({});

      expect(guard.canActivate(context)).toBe(false);
    });

    it("should return false if role property is missing on user", () => {
      const roles = ["ADMIN"];
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(roles);
      getRequestMock.mockReturnValue({ user: {} });

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});

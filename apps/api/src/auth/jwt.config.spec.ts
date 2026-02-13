import { getJwtSecret } from "./jwt.config";

describe("getJwtSecret", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return JWT_SECRET if defined", () => {
    process.env.JWT_SECRET = "test-secret";
    expect(getJwtSecret()).toBe("test-secret");
  });

  it("should return default secret if JWT_SECRET is undefined and NODE_ENV is not production", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "development";
    // Spy on console.warn
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    expect(getJwtSecret()).toBe("super-secret-key");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should not warn in test environment", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "test";
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    expect(getJwtSecret()).toBe("super-secret-key");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should throw error if JWT_SECRET is undefined and NODE_ENV is production", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "production";
    expect(() => getJwtSecret()).toThrow(
      "JWT_SECRET environment variable is not defined in production.",
    );
  });
});

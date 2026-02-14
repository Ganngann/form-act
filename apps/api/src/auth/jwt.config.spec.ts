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
    process.env.JWT_SECRET = "custom-secret";
    expect(getJwtSecret()).toBe("custom-secret");
  });

  it("should return test secret if JWT_SECRET is undefined and NODE_ENV is test", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "test";
    expect(getJwtSecret()).toBe("test-secret");
  });

  it("should throw error if JWT_SECRET is undefined and NODE_ENV is development", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "development";
    expect(() => getJwtSecret()).toThrow(
      "JWT_SECRET environment variable is not defined.",
    );
  });

  it("should throw error if JWT_SECRET is undefined and NODE_ENV is production", () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "production";
    expect(() => getJwtSecret()).toThrow(
      "JWT_SECRET environment variable is not defined.",
    );
  });
});

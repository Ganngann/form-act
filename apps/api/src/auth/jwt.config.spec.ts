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

  it("should throw error if JWT_SECRET is undefined", () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow("JWT_SECRET is not defined");
  });
});

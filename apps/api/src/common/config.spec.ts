import { getFrontendUrl } from "./config";

describe("getFrontendUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return FRONTEND_URL if defined", () => {
    process.env.FRONTEND_URL = "http://example.com";
    expect(getFrontendUrl()).toBe("http://example.com");
  });

  it("should return default URL and warn if FRONTEND_URL is undefined and NODE_ENV is development", () => {
    delete process.env.FRONTEND_URL;
    process.env.NODE_ENV = "development";
    // Spy on console.warn
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    expect(getFrontendUrl()).toBe("http://localhost:3000");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("WARNING: FRONTEND_URL is not defined"),
    );
    consoleSpy.mockRestore();
  });

  it("should return default URL and not warn in test environment", () => {
    delete process.env.FRONTEND_URL;
    process.env.NODE_ENV = "test";
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    expect(getFrontendUrl()).toBe("http://localhost:3000");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should throw error if FRONTEND_URL is undefined and NODE_ENV is production", () => {
    delete process.env.FRONTEND_URL;
    process.env.NODE_ENV = "production";
    expect(() => getFrontendUrl()).toThrow(
      "FRONTEND_URL environment variable is not defined in production.",
    );
  });
});

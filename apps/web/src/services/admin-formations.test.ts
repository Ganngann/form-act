import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { adminFormationsService } from "./admin-formations";
import { API_URL } from "@/lib/config";

// Mock API_URL if needed, but since it's a constant, we can just use it in assertions.
// If we wanted to change it, we'd mock the module.

describe("adminFormationsService", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSuccess = (data: any) => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });
  };

  const mockError = (status: number, message: string) => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Error",
      json: () => Promise.resolve({ message }),
    });
  };

  const mockNetworkError = () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
  };

  describe("getFormations", () => {
    it("should fetch formations successfully", async () => {
      const mockData = [{ id: "1", title: "Test Formation" }];
      mockSuccess(mockData);

      const result = await adminFormationsService.getFormations();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/admin/formations`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          credentials: "include",
        }),
      );
    });

    it("should handle API errors", async () => {
      mockError(400, "Bad Request");

      await expect(adminFormationsService.getFormations()).rejects.toThrow(
        "Bad Request",
      );
    });
  });

  describe("getCategories", () => {
    it("should fetch categories successfully", async () => {
      const mockData = [{ id: "1", name: "Category" }];
      mockSuccess(mockData);

      const result = await adminFormationsService.getCategories();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/categories`,
        expect.anything(),
      );
    });
  });

  describe("createFormation", () => {
    it("should create formation successfully", async () => {
      const mockData = { id: "1", title: "New Formation" };
      const inputData = { title: "New Formation", description: "Desc" } as any;
      mockSuccess(mockData);

      const result = await adminFormationsService.createFormation(inputData);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/admin/formations`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(inputData),
        }),
      );
    });
  });

  describe("updateFormation", () => {
    it("should update formation successfully", async () => {
      const mockData = { id: "1", title: "Updated" };
      const inputData = { title: "Updated" } as any;
      mockSuccess(mockData);

      const result = await adminFormationsService.updateFormation(
        "1",
        inputData,
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/admin/formations/1`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(inputData),
        }),
      );
    });
  });

  describe("deleteFormation", () => {
    it("should delete formation successfully", async () => {
      mockSuccess({});

      await adminFormationsService.deleteFormation("1");

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/admin/formations/1`,
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });
});

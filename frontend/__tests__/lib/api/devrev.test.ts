/**
 * DevRev API Client Tests
 *
 * Tests for DevRev API integration including:
 * - Session token generation
 * - Configuration management
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPlugSessionToken,
  getDevRevConfig,
  updateDevRevConfig,
  deleteDevRevConfig,
} from "@/lib/api/devrev";
import apiClient from "@/lib/api/client";

// Mock axios client
vi.mock("@/lib/api/client");

const mockedApiClient = vi.mocked(apiClient);

describe("DevRev API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPlugSessionToken", () => {
    it("should successfully get session token", async () => {
      const mockResponse = {
        data: {
          session_token: "SESSION_TOKEN_123",
          app_id: "APP_ID_123",
          revuser_id: "don:identity:user:test",
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await getPlugSessionToken();

      expect(result).toEqual(mockResponse.data);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/api/v1/devrev/session-token",
        null,
        expect.objectContaining({
          params: { force_refresh: false },
        })
      );
    });

    it("should throw error when session token generation fails", async () => {
      const mockError = {
        response: {
          data: {
            detail: "DevRev設定が見つかりません",
          },
        },
      };

      mockedApiClient.post.mockRejectedValueOnce(mockError);

      await expect(getPlugSessionToken()).rejects.toThrow(
        "DevRev設定が見つかりません"
      );
    });
  });

  describe("getDevRevConfig", () => {
    it("should successfully get DevRev config", async () => {
      const mockConfig = {
        data: {
          mode: "personal",
          app_id: "APP_ID_123",
          has_aat: true,
          revuser_id: "don:identity:user:test",
          session_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockedApiClient.get.mockResolvedValueOnce(mockConfig);

      const result = await getDevRevConfig();

      expect(result).toEqual(mockConfig.data);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/api/v1/devrev/config");
    });

    it("should throw error on failure", async () => {
      const mockError = {
        response: {
          data: {
            detail: "Config not found",
          },
        },
      };

      mockedApiClient.get.mockRejectedValueOnce(mockError);

      await expect(getDevRevConfig()).rejects.toThrow("Config not found");
    });
  });

  describe("updateDevRevConfig", () => {
    it("should successfully update DevRev config", async () => {
      const configData = {
        app_id: "NEW_APP_ID",
        application_access_token: "NEW_AAT",
        use_personal_config: true,
      };

      const mockResponse = {
        data: {
          mode: "personal",
          app_id: "NEW_APP_ID",
          has_aat: true,
          revuser_id: null,
          session_token_expires_at: null,
        },
      };

      mockedApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await updateDevRevConfig(configData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/api/v1/devrev/config",
        configData
      );
    });

    it("should throw error on validation failure", async () => {
      const invalidConfig = {
        app_id: "",
        application_access_token: "AAT",
      };

      const mockError = {
        response: {
          data: {
            detail: "Validation Error",
          },
        },
      };

      mockedApiClient.put.mockRejectedValueOnce(mockError);

      await expect(updateDevRevConfig(invalidConfig)).rejects.toThrow(
        "Validation Error"
      );
    });
  });

  describe("deleteDevRevConfig", () => {
    it("should successfully delete DevRev config", async () => {
      mockedApiClient.delete.mockResolvedValueOnce({});

      await expect(deleteDevRevConfig()).resolves.toBeUndefined();
      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        "/api/v1/devrev/config"
      );
    });

    it("should throw error when deletion fails", async () => {
      const mockError = {
        response: {
          data: {
            detail: "Server Error",
          },
        },
      };

      mockedApiClient.delete.mockRejectedValueOnce(mockError);

      await expect(deleteDevRevConfig()).rejects.toThrow("Server Error");
    });
  });

  describe("Error handling", () => {
    it("should handle network errors", async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getPlugSessionToken()).rejects.toThrow();
    });

    it("should handle errors without response data", async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error("Unknown error"));

      await expect(getDevRevConfig()).rejects.toThrow("DevRev設定の取得に失敗しました");
    });
  });
});

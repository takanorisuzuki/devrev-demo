/**
 * PLuG SDK Provider Tests
 *
 * Tests for PLuG SDK initialization and provider including:
 * - SDK loading
 * - Initialization with session token
 * - Error handling
 * - Cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { PlugSDKProvider } from "@/components/devrev/plug-sdk-provider";

// Mock the auth store
vi.mock("@/lib/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

// Mock the DevRev API
vi.mock("@/lib/api/devrev", () => ({
  getPlugSessionToken: vi.fn(),
}));

import { useAuthStore } from "@/lib/stores/auth";
import { getPlugSessionToken } from "@/lib/api/devrev";

describe("PlugSDKProvider", () => {
  let mockPlugSDK: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock PLuG SDK
    mockPlugSDK = {
      init: vi.fn(),
      destroy: vi.fn(),
    };

    (window as any).plugSDK = mockPlugSDK;
  });

  afterEach(() => {
    // Clean up
    delete (window as any).plugSDK;
  });

  describe("SDK Initialization", () => {
    it("should initialize PLuG SDK for authenticated user", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      render(<PlugSDKProvider />);

      await waitFor(
        () => {
          expect(getPlugSessionToken).toHaveBeenCalled();
          expect(mockPlugSDK.init).toHaveBeenCalledWith(
            expect.objectContaining({
              app_id: "APP_ID_123",
              session_token: "SESSION_TOKEN_123",
              user_info: expect.objectContaining({
                id: 1,
                email: "test@example.com",
                display_name: "Test User",
              }),
            })
          );
        },
        { timeout: 3000 }
      );
    });

    it("should not initialize for unauthenticated user", async () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(getPlugSessionToken).not.toHaveBeenCalled();
        expect(mockPlugSDK.init).not.toHaveBeenCalled();
      });
    });

    it("should retry if SDK is not loaded yet", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      // SDK not available initially
      delete (window as any).plugSDK;

      render(<PlugSDKProvider />);

      // Wait a bit, then make SDK available
      setTimeout(() => {
        (window as any).plugSDK = mockPlugSDK;
      }, 500);

      await waitFor(
        () => {
          expect(mockPlugSDK.init).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it("should include custom theme in initialization", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(mockPlugSDK.init).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: expect.objectContaining({
              primaryColor: "#0ea5e9",
            }),
          })
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle session token fetch error gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockRejectedValue(
        new Error("Session token fetch failed")
      );

      render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Failed to initialize PLuG SDK"),
          expect.any(Error)
        );
        expect(mockPlugSDK.init).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("should handle SDK initialization error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      mockPlugSDK.init.mockImplementation(() => {
        throw new Error("SDK init failed");
      });

      render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Failed to initialize PLuG SDK"),
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Cleanup", () => {
    it("should call destroy on unmount if available", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      const { unmount } = render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(mockPlugSDK.init).toHaveBeenCalled();
      });

      unmount();

      expect(mockPlugSDK.destroy).toHaveBeenCalled();
    });

    it("should not error if destroy is not available", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      // SDK without destroy method
      delete mockPlugSDK.destroy;

      const { unmount } = render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(mockPlugSDK.init).toHaveBeenCalled();
      });

      // Should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Rendering", () => {
    it("should render nothing (null)", () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { container } = render(<PlugSDKProvider />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Environment configuration", () => {
    it("should use development debug mode in dev environment", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const mockUser = {
        id: 1,
        email: "test@example.com",
        full_name: "Test User",
      };

      const mockSessionData = {
        session_token: "SESSION_TOKEN_123",
        app_id: "APP_ID_123",
        revuser_id: "don:identity:user:test",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      (getPlugSessionToken as any).mockResolvedValue(mockSessionData);

      render(<PlugSDKProvider />);

      await waitFor(() => {
        expect(mockPlugSDK.init).toHaveBeenCalledWith(
          expect.objectContaining({
            debug: true,
          })
        );
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});

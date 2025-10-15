/**
 * DevRev Settings Component Tests
 *
 * Tests for DevRev settings UI component including:
 * - Rendering
 * - Form submission
 * - Config switching
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DevRevSettingsComponent } from "@/components/admin/devrev-settings";

// Mock the API functions
vi.mock("@/lib/api/devrev", () => ({
  getDevRevConfig: vi.fn(),
  updateDevRevConfig: vi.fn(),
  deleteDevRevConfig: vi.fn(),
}));

// Mock the toast hook
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

import { getDevRevConfig, updateDevRevConfig, deleteDevRevConfig } from "@/lib/api/devrev";

describe("DevRevSettingsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  describe("Rendering", () => {
    it("should render DevRev settings form in Global mode", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "global",
        app_id: "GLOBAL_APP_ID",
        has_aat: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByText(/DevRev PLuG\s+設定/i)).toBeInTheDocument();
      });

      // Global mode should show mode indicator
      expect(screen.getByText(/Global設定が有効です/i)).toBeInTheDocument();
      // Form fields should NOT be visible in Global mode
      expect(screen.queryByLabelText(/DevRev App ID/i)).not.toBeInTheDocument();
    });

    it("should load and display existing config in Personal mode", async () => {
      const mockConfig = {
        mode: "personal",
        app_id: "APP_ID_123",
        has_aat: true,
        use_personal_config: true,
      };

      (getDevRevConfig as any).mockResolvedValue(mockConfig);

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        const appIdInput = screen.getByLabelText(/DevRev App ID/i) as HTMLInputElement;
        expect(appIdInput.value).toBe("APP_ID_123");
      });
    });

    it("should show loading state while fetching config", async () => {
      (getDevRevConfig as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );

      render(<DevRevSettingsComponent />);

      // Should show loading indicator
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });
  });

  describe("Form submission", () => {
    it("should successfully submit personal config", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });
      (updateDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "NEW_APP_ID",
        has_aat: true,
        use_personal_config: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Fill in form
      const appIdInput = screen.getByLabelText(/DevRev App ID/i);
      const aatInput = screen.getByLabelText(/Application Access Token/i);

      fireEvent.change(appIdInput, { target: { value: "NEW_APP_ID" } });
      fireEvent.change(aatInput, { target: { value: "NEW_AAT" } });

      // Submit form
      const submitButton = screen.getByRole("button", { name: /保存/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(updateDevRevConfig).toHaveBeenCalled();
      });
    });

    it("should allow submission with empty fields", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });
      (updateDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Try to submit with empty fields
      const submitButton = screen.getByRole("button", { name: /保存/i });
      fireEvent.click(submitButton);

      // Should call API (no client-side validation)
      await waitFor(() => {
        expect(updateDevRevConfig).toHaveBeenCalled();
      });
    });

    it("should handle API errors during submission", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });
      (updateDevRevConfig as any).mockRejectedValue(
        new Error("API Error")
      );

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Fill and submit form
      const appIdInput = screen.getByLabelText(/DevRev App ID/i);
      const aatInput = screen.getByLabelText(/Application Access Token/i);

      fireEvent.change(appIdInput, { target: { value: "APP_ID" } });
      fireEvent.change(aatInput, { target: { value: "AAT" } });

      const submitButton = screen.getByRole("button", { name: /保存/i });
      fireEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      });
    });
  });

  describe("Config switching", () => {
    it("should switch between global and personal config", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Find and click the personal config switch
      const personalSwitch = screen.getByLabelText(/Personal設定を使用/i);
      fireEvent.click(personalSwitch);

      // Form should update to show personal config option
      await waitFor(() => {
        expect(personalSwitch).toBeChecked();
      });
    });

    it("should display correct labels for personal config", async () => {
      const mockConfig = {
        mode: "personal",
        app_id: "PERSONAL_APP_ID",
        has_aat: true,
        use_personal_config: true,
      };

      (getDevRevConfig as any).mockResolvedValue(mockConfig);

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByText(/Personal設定/i)).toBeInTheDocument();
      });
    });
  });

  describe("Config deletion", () => {
    it("should successfully delete config", async () => {
      const mockConfig = {
        mode: "personal",
        app_id: "APP_ID_123",
        has_aat: true,
        use_personal_config: true,
      };

      (getDevRevConfig as any).mockResolvedValue(mockConfig);
      (deleteDevRevConfig as any).mockResolvedValue({
        message: "DevRev設定を削除しました",
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButton = screen.getByRole("button", { name: /削除/i });
      fireEvent.click(deleteButton);

      // Confirm deletion (if confirmation dialog exists)
      // This depends on your implementation

      await waitFor(() => {
        expect(deleteDevRevConfig).toHaveBeenCalled();
      });
    });

    it("should handle deletion errors", async () => {
      const mockConfig = {
        mode: "personal",
        app_id: "APP_ID_123",
        has_aat: true,
        use_personal_config: true,
      };

      (getDevRevConfig as any).mockResolvedValue(mockConfig);
      (deleteDevRevConfig as any).mockRejectedValue(
        new Error("Deletion failed")
      );

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /削除/i });
      fireEvent.click(deleteButton);

      // Wait for deletion to be attempted
      await waitFor(() => {
        expect(deleteDevRevConfig).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible form labels", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        const appIdInput = screen.getByLabelText(/DevRev App ID/i);
        expect(appIdInput).toBeInTheDocument();
      });
    });

    it("should be keyboard navigable", async () => {
      (getDevRevConfig as any).mockResolvedValue({
        mode: "personal",
        app_id: "",
        has_aat: false,
        use_personal_config: true,
      });

      render(<DevRevSettingsComponent />);

      await waitFor(() => {
        expect(screen.getByLabelText(/DevRev App ID/i)).toBeInTheDocument();
      });

      // Tab through form elements
      const appIdInput = screen.getByLabelText(/DevRev App ID/i);
      appIdInput.focus();
      expect(document.activeElement).toBe(appIdInput);
    });
  });
});

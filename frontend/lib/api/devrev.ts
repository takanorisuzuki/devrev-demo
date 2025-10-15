import apiClient from "./client";

// DevRev設定の型定義
export interface DevRevConfig {
  mode: "personal" | "global";
  app_id: string | null;
  has_aat: boolean;
  revuser_id: string | null;
  session_token_expires_at: string | null;
}

// DevRev設定更新リクエストの型定義
export interface DevRevConfigUpdateRequest {
  app_id?: string;
  application_access_token?: string;
  use_personal_config?: boolean;
}

// Session Tokenレスポンスの型定義
export interface SessionTokenResponse {
  session_token: string;
  revuser_id: string;
  expires_at: string;
  app_id: string | null;
}

/**
 * Session Token生成API
 *
 * @param forceRefresh - 強制的に新しいトークンを生成するか
 * @returns Session Token情報
 */
export const createSessionToken = async (
  forceRefresh: boolean = false,
): Promise<SessionTokenResponse> => {
  try {
    const response = await apiClient.post<SessionTokenResponse>(
      "/api/v1/devrev/session-token",
      null,
      {
        params: { force_refresh: forceRefresh },
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        "Session Tokenの生成に失敗しました。DevRev設定を確認してください。",
    );
  }
};

/**
 * DevRev設定取得API
 *
 * @returns 現在のDevRev設定
 */
export const getDevRevConfig = async (): Promise<DevRevConfig> => {
  try {
    const response = await apiClient.get<DevRevConfig>(
      "/api/v1/devrev/config",
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "DevRev設定の取得に失敗しました",
    );
  }
};

/**
 * DevRev設定更新API
 *
 * @param updateData - 更新するDevRev設定
 * @returns 更新後のDevRev設定
 */
export const updateDevRevConfig = async (
  updateData: DevRevConfigUpdateRequest,
): Promise<DevRevConfig> => {
  try {
    const response = await apiClient.put<DevRevConfig>(
      "/api/v1/devrev/config",
      updateData,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "DevRev設定の更新に失敗しました",
    );
  }
};

/**
 * DevRev設定削除API
 *
 * @returns void
 */
export const deleteDevRevConfig = async (): Promise<void> => {
  try {
    await apiClient.delete("/api/v1/devrev/config");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "DevRev設定の削除に失敗しました",
    );
  }
};

/**
 * PLuG SDK初期化用のSession Token取得（キャッシュ活用）
 *
 * @returns Session Token情報（キャッシュから取得または新規生成）
 */
export const getPlugSessionToken = async (): Promise<SessionTokenResponse> => {
  // キャッシュから取得を試みる（force_refresh=false）
  return await createSessionToken(false);
};
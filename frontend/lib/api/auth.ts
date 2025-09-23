import apiClient, { ApiError } from "./client";
import { AuthToken, User } from "@/lib/stores/auth";

// ログインリクエストの型定義
export interface LoginRequest {
  email: string; // JSON形式ログインでは 'email' フィールドを使用
  password: string;
}

// ユーザー登録リクエストの型定義
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role?: "customer" | "admin" | "staff";
}

// ログイン API
export const loginApi = async (
  credentials: LoginRequest,
): Promise<AuthToken> => {
  try {
    // JSON形式でリクエスト送信（バックエンドのUserLoginスキーマ対応）
    const response = await apiClient.post<AuthToken>(
      "/api/v1/auth/login",
      {
        email: credentials.email,
        password: credentials.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Login API Error:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    throw new Error(
      error.response?.data?.detail || error.message || "ログインに失敗しました",
    );
  }
};

// ユーザー登録 API
export const registerApi = async (userData: RegisterRequest): Promise<User> => {
  try {
    const response = await apiClient.post<User>(
      "/api/v1/auth/register",
      userData,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "ユーザー登録に失敗しました",
    );
  }
};

// ユーザー情報取得 API
export const getCurrentUserApi = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>("/api/v1/auth/me");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "ユーザー情報の取得に失敗しました",
    );
  }
};

// パスワードリセット要求 API
export const requestPasswordResetApi = async (
  email: string,
): Promise<{ message: string; email: string }> => {
  try {
    const response = await apiClient.post("/api/v1/auth/password-reset", {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "パスワードリセットの送信に失敗しました",
    );
  }
};

// パスワードリセット確定 API
export const confirmPasswordResetApi = async (
  token: string,
  newPassword: string,
): Promise<{ message: string; email: string }> => {
  try {
    const response = await apiClient.post(
      "/api/v1/auth/password-reset/confirm",
      {
        token,
        new_password: newPassword,
      },
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "パスワードリセットの確定に失敗しました",
    );
  }
};

// ユーザー情報更新 API（未実装のプレースホルダー）
export const updateUserProfileApi = async (
  userData: Partial<User>,
): Promise<User> => {
  try {
    const response = await apiClient.put<User>("/api/v1/auth/me", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "ユーザー情報の更新に失敗しました",
    );
  }
};

import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/lib/stores/auth";
import {
  parseAxiosError,
  handleAuthenticationError,
  logError,
} from "@/lib/utils/error-handler";

// API Base URL - 環境変数から取得、デフォルトはlocalhost:8000（ブラウザアクセス用）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// DEBUG: APIベースURL確認
if (typeof window !== "undefined") {
  console.log("Frontend API Base URL:", API_BASE_URL);
}

// Axios インスタンス作成
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - JWT トークンを自動的に追加
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Zustand store から token を取得
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - 統一エラーハンドリング
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // エラーを解析
    const errorInfo = parseAxiosError(error);

    // エラーログ出力
    logError(errorInfo, "API Request");

    // 認証エラーの場合は自動ログアウト処理
    handleAuthenticationError(errorInfo);

    return Promise.reject(error);
  },
);

// API レスポンス型定義
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// APIエラーのユーティリティ関数
export const getApiErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return "エラーが発生しました。もう一度お試しください。";
};

export default apiClient;

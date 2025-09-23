import { AxiosError } from 'axios';
import { useAuthStore } from '@/lib/stores/auth';

// エラータイプ定義
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// エラー情報インターフェース
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  statusCode?: number;
  details?: any;
  timestamp: string;
}

// エラーメッセージマッピング
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: 'ネットワーク接続に問題があります。インターネット接続を確認してください。',
  [ErrorType.AUTHENTICATION]: '認証に失敗しました。ログインし直してください。',
  [ErrorType.AUTHORIZATION]: 'この操作を実行する権限がありません。',
  [ErrorType.VALIDATION]: '入力内容に問題があります。確認してください。',
  [ErrorType.SERVER]: 'サーバーでエラーが発生しました。しばらく時間をおいてから再試行してください。',
  [ErrorType.UNKNOWN]: '予期しないエラーが発生しました。',
};

// Axiosエラーを解析してErrorInfoに変換
export function parseAxiosError(error: AxiosError): ErrorInfo {
  const timestamp = new Date().toISOString();
  
  // ネットワークエラー
  if (!error.response) {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES[ErrorType.NETWORK],
      timestamp,
      details: error.message,
    };
  }

  const statusCode = error.response.status;
  const responseData = error.response.data as any;

  // 認証エラー (401)
  if (statusCode === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: responseData?.detail || ERROR_MESSAGES[ErrorType.AUTHENTICATION],
      statusCode,
      timestamp,
      details: responseData,
    };
  }

  // 認可エラー (403)
  if (statusCode === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: responseData?.detail || ERROR_MESSAGES[ErrorType.AUTHORIZATION],
      statusCode,
      timestamp,
      details: responseData,
    };
  }

  // バリデーションエラー (400, 422)
  if (statusCode === 400 || statusCode === 422) {
    return {
      type: ErrorType.VALIDATION,
      message: responseData?.detail || ERROR_MESSAGES[ErrorType.VALIDATION],
      statusCode,
      timestamp,
      details: responseData,
    };
  }

  // サーバーエラー (500-599)
  if (statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: ERROR_MESSAGES[ErrorType.SERVER],
      statusCode,
      timestamp,
      details: responseData,
    };
  }

  // その他のエラー
  return {
    type: ErrorType.UNKNOWN,
    message: responseData?.detail || ERROR_MESSAGES[ErrorType.UNKNOWN],
    statusCode,
    timestamp,
    details: responseData,
  };
}

// エラーハンドリング関数
export function handleError(error: any): ErrorInfo {
  if (error instanceof AxiosError) {
    return parseAxiosError(error);
  }

  // その他のエラー
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || ERROR_MESSAGES[ErrorType.UNKNOWN],
    timestamp: new Date().toISOString(),
    details: error,
  };
}

// 認証エラー時の自動ログアウト処理
export function handleAuthenticationError(errorInfo: ErrorInfo) {
  if (errorInfo.type === ErrorType.AUTHENTICATION) {
    const { logout } = useAuthStore.getState();
    logout();
    
    // 現在のページがログインページでない場合のみリダイレクト
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }
}

// エラーログ出力
export function logError(errorInfo: ErrorInfo, context?: string) {
  const logData = {
    ...errorInfo,
    context: context || 'Unknown',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
  };

  console.error('Application Error:', logData);
  
  // 本番環境では外部ログサービスに送信
  if (process.env.NODE_ENV === 'production') {
    // TODO: 外部ログサービス（Sentry等）への送信
    // sendToLogService(logData);
  }
}

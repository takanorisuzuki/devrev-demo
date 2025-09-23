"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  ErrorInfo,
  handleError,
  handleAuthenticationError,
  logError,
} from "@/lib/utils/error-handler";
import ErrorBanner from "@/components/ui/error-banner";

interface ErrorContextType {
  showError: (error: any, context?: string) => void;
  clearError: () => void;
  currentError: ErrorInfo | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);

  const showError = useCallback((error: any, context?: string) => {
    const errorInfo = handleError(error);

    // エラーログ出力
    logError(errorInfo, context);

    // 認証エラーの場合は自動ログアウト処理
    handleAuthenticationError(errorInfo);

    // エラーを表示
    setCurrentError(errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError, currentError }}>
      {children}
      <ErrorBanner
        error={currentError}
        onDismiss={clearError}
        autoDismiss={currentError?.type !== "AUTHENTICATION"}
        autoDismissDelay={5000}
      />
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

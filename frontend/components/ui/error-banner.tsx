"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Wifi, Shield, AlertTriangle, Server, HelpCircle } from "lucide-react";
import { ErrorInfo, ErrorType } from "@/lib/utils/error-handler";

interface ErrorBannerProps {
  error: ErrorInfo | null;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export default function ErrorBanner({
  error,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoDismiss && error.type !== ErrorType.AUTHENTICATION) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300); // アニメーション完了後にコールバック実行
        }, autoDismissDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoDismiss, autoDismissDelay, onDismiss]);

  if (!error || !isVisible) {
    return null;
  }

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return <Wifi className="h-5 w-5" />;
      case ErrorType.AUTHENTICATION:
        return <Shield className="h-5 w-5" />;
      case ErrorType.AUTHORIZATION:
        return <AlertTriangle className="h-5 w-5" />;
      case ErrorType.VALIDATION:
        return <AlertCircle className="h-5 w-5" />;
      case ErrorType.SERVER:
        return <Server className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getErrorStyles = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return {
          container: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-600",
          text: "text-yellow-800",
          button: "text-yellow-600 hover:text-yellow-800",
        };
      case ErrorType.AUTHENTICATION:
        return {
          container: "bg-red-50 border-red-200",
          icon: "text-red-600",
          text: "text-red-800",
          button: "text-red-600 hover:text-red-800",
        };
      case ErrorType.AUTHORIZATION:
        return {
          container: "bg-orange-50 border-orange-200",
          icon: "text-orange-600",
          text: "text-orange-800",
          button: "text-orange-600 hover:text-orange-800",
        };
      case ErrorType.VALIDATION:
        return {
          container: "bg-blue-50 border-blue-200",
          icon: "text-blue-600",
          text: "text-blue-800",
          button: "text-blue-600 hover:text-blue-800",
        };
      case ErrorType.SERVER:
        return {
          container: "bg-red-50 border-red-200",
          icon: "text-red-600",
          text: "text-red-800",
          button: "text-red-600 hover:text-red-800",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200",
          icon: "text-gray-600",
          text: "text-gray-800",
          button: "text-gray-600 hover:text-gray-800",
        };
    }
  };

  const styles = getErrorStyles(error.type);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className={`border-b ${styles.container}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className={styles.icon}>
                {getErrorIcon(error.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {error.message}
                </p>
                {error.statusCode && (
                  <p className={`text-xs ${styles.text} opacity-75`}>
                    エラーコード: {error.statusCode}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {error.type === ErrorType.AUTHENTICATION && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className={`text-sm font-medium ${styles.button} hover:underline`}
                >
                  ログイン
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className={`p-1 rounded-md hover:bg-black hover:bg-opacity-10 ${styles.button}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

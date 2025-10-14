"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { getPlugSessionToken } from "@/lib/api/devrev";

/**
 * DevRev PLuG SDK Provider
 *
 * このコンポーネントはDevRev PLuG SDKを初期化し、
 * チャットウィジェットをページに表示します。
 */
export function PlugSDKProvider() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // 未認証の場合はPLuGを表示しない
    if (!isAuthenticated || !user) {
      return;
    }

    // PLuG SDKを初期化
    const initializePlugSDK = async () => {
      try {
        // Session Tokenを取得
        const sessionData = await getPlugSessionToken();

        // PLuG SDKがロードされているかチェック
        if (typeof window === "undefined" || !(window as any).plugSDK) {
          console.warn("PLuG SDK is not loaded yet. Retrying...");
          // SDKがまだロードされていない場合は、少し待ってリトライ
          setTimeout(initializePlugSDK, 1000);
          return;
        }

        const plugSDK = (window as any).plugSDK;

        // PLuG SDK初期化
        plugSDK.init({
          app_id: sessionData.app_id,
          session_token: sessionData.session_token,
          user_info: {
            id: user.id,
            email: user.email,
            display_name: user.full_name,
          },
          // ウィジェットの位置設定
          position: "bottom-right",
          // カスタムスタイル（オプション）
          theme: {
            primaryColor: "#0ea5e9", // DriveRevブランドカラー
          },
          // デバッグモード（開発環境のみ）
          debug: process.env.NODE_ENV === "development",
        });

        console.log("✅ PLuG SDK initialized successfully", {
          app_id: sessionData.app_id,
          revuser_id: sessionData.revuser_id,
        });
      } catch (error) {
        console.error("❌ Failed to initialize PLuG SDK:", error);
        // エラーが発生してもアプリケーションの動作を妨げない
      }
    };

    // PLuG SDK初期化を実行
    initializePlugSDK();

    // クリーンアップ（オプション）
    return () => {
      // PLuG SDKをクリーンアップ（必要に応じて）
      if (typeof window !== "undefined" && (window as any).plugSDK) {
        // SDKにdestroyメソッドがあれば呼び出す
        const plugSDK = (window as any).plugSDK;
        if (typeof plugSDK.destroy === "function") {
          plugSDK.destroy();
        }
      }
    };
  }, [isAuthenticated, user]);

  // このコンポーネントは何もレンダリングしない
  return null;
}

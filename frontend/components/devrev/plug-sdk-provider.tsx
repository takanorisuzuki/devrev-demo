"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { getPlugSessionToken } from "@/lib/api/devrev";

/**
 * DevRev PLuG SDK Provider (セキュア版)
 *
 * セキュリティ:
 * - AAT は一切 Frontend に露出させない
 * - 未認証: Backend経由で匿名Session Token取得
 * - 認証済み: Backend経由でパーソナルSession Token取得
 *
 * このコンポーネントはDevRev PLuG SDKを初期化し、
 * チャットウィジェットをページに表示します。
 */
export function PlugSDKProvider() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const initializePlugSDK = async () => {
      try {
        // PLuG SDKがロードされているかチェック
        if (typeof window === "undefined" || !(window as any).plugSDK) {
          console.warn("PLuG SDK is not loaded yet. Retrying...");
          setTimeout(initializePlugSDK, 1000);
          return;
        }

        const plugSDK = (window as any).plugSDK;
        let config;

        if (isAuthenticated && user) {
          // 🔐 認証済み: Personal Session Token (Backend経由)
          const sessionData = await getPlugSessionToken();
          config = {
            app_id: sessionData.app_id,
            session_token: sessionData.session_token,
            user_info: {
              id: user.id,
              email: user.email,
              display_name: user.full_name,
            },
            position: "bottom-right",
            theme: { primaryColor: "#0ea5e9" },
            debug: process.env.NODE_ENV === "development",
          };
          console.log("✅ PLuG SDK initialized (Personal)", {
            app_id: sessionData.app_id,
            revuser_id: sessionData.revuser_id,
          });
        } else {
          // 🌐 未認証: Anonymous Session Token (Backend経由)
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/devrev/anonymous-session`
          );
          if (!response.ok) {
            throw new Error("Failed to get anonymous session");
          }
          const sessionData = await response.json();

          config = {
            app_id: sessionData.app_id,
            session_token: sessionData.session_token,
            position: "bottom-right",
            theme: { primaryColor: "#0ea5e9" },
            debug: process.env.NODE_ENV === "development",
          };
          console.log("✅ PLuG SDK initialized (Anonymous)");
        }

        // PLuG SDK初期化
        plugSDK.init(config);
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

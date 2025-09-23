/**
 * オフライン状態を監視するフック
 */

import { useState, useEffect } from "react";

interface OfflineState {
  isOffline: boolean;
  wasOffline: boolean;
}

export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // 初期状態を設定
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(false);
    };

    // イベントリスナーを追加
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOffline, wasOffline };
}

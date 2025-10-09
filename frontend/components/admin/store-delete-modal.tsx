"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { StoreDetail } from "@/lib/types/store";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth";
import { adminStoreApi } from "@/lib/api/admin-stores";

interface StoreDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreDetail | null;
  onStoreDeleted: () => void;
}

export function StoreDeleteModal({
  open,
  onOpenChange,
  store,
  onStoreDeleted,
}: StoreDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleDelete = async () => {
    if (!store) return;

    if (!token) {
      addToast({
        type: "error",
        title: "認証エラー",
        message: "認証トークンが見つかりません",
      });
      return;
    }

    try {
      setIsLoading(true);

      // adminStoreApi.deleteStore関数でAPI呼び出しと認証が処理されます
      const result = await adminStoreApi.deleteStore(store.id);

      addToast({
        type: "success",
        title: "店舗削除完了",
        message: "店舗が正常に削除されました",
      });

      onStoreDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("店舗削除エラー:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "店舗の削除に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            店舗削除の確認
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* メッセージ */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            以下の店舗を削除しますか？この操作は取り消せません。
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-red-800 mb-2">削除対象店舗</h4>
            <div className="space-y-1 text-sm text-red-700">
              <p>
                <strong>店舗名:</strong> {store.name}
              </p>
              <p>
                <strong>店舗コード:</strong> {store.code}
              </p>
              <p>
                <strong>住所:</strong> {store.prefecture} {store.city}{" "}
                {store.address_line1}
              </p>
              <p>
                <strong>店舗ID:</strong> {store.id}
              </p>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意:</strong>{" "}
              店舗を削除すると、その店舗の車両や予約履歴も影響を受ける可能性があります。
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-4 py-2"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                削除中...
              </>
            ) : (
              "削除する"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

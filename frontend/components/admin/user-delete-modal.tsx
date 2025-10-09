"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth";
import { adminApi } from "@/lib/api/admin";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface UserDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserDeleted: () => void;
}

export function UserDeleteModal({
  open,
  onOpenChange,
  user,
  onUserDeleted,
}: UserDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // adminApi.deleteUser関数でAPI呼び出しと認証が処理されます
      await adminApi.deleteUser(user.id);

      addToast({
        type: "success",
        title: "ユーザー削除完了",
        message: `${user.full_name} さんを正常に削除しました`,
      });

      onOpenChange(false);
      onUserDeleted();
    } catch (error) {
      console.error("User deletion error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error
            ? error.message
            : "ユーザーの削除に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              ユーザー削除確認
            </h3>
          </div>
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
            この操作は取り消すことができません。本当に削除しますか？
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-red-800 mb-2">削除対象ユーザー</h4>
            <div className="space-y-1 text-sm text-red-700">
              <p>
                <strong>名前:</strong> {user.full_name}
              </p>
              <p>
                <strong>メール:</strong> {user.email}
              </p>
              <p>
                <strong>役割:</strong>{" "}
                {user.role === "admin" ? "管理者" : "顧客"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意:</strong>{" "}
              ユーザーを削除すると、そのユーザーの予約履歴や関連データも影響を受ける可能性があります。
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                削除中...
              </>
            ) : (
              "削除"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

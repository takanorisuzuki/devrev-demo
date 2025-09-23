"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth";

// シンプルなフォームデータ型
interface UserEditFormData {
  phone_number: string;
  role: "admin" | "customer";
  is_active: boolean;
  is_verified: boolean;
}

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

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdated: () => void;
}

export function UserEditModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: UserEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserEditFormData>({
    phone_number: user?.phone_number || "",
    role: (user?.role as "admin" | "customer") || "customer",
    is_active: user?.is_active ?? true,
    is_verified: user?.is_verified ?? false,
  });
  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  // ユーザーデータが変更されたときにフォームを更新
  useEffect(() => {
    if (user) {
      setFormData({
        phone_number: user.phone_number || "",
        role: user.role as "admin" | "customer",
        is_active: user.is_active,
        is_verified: user.is_verified,
      });
    }
  }, [user]);

  const handleInputChange = (
    field: keyof UserEditFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/admin/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        let errorMessage = "ユーザーの更新に失敗しました";
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail?.message || errorMessage;
        } catch (jsonError) {
          // JSONでない場合はテキストをそのまま使用
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();

      addToast({
        type: "success",
        title: "ユーザー更新完了",
        message: `${updatedUser.full_name} さんの情報を正常に更新しました`,
      });

      onOpenChange(false);
      onUserUpdated();
    } catch (error) {
      console.error("User update error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error
            ? error.message
            : "ユーザーの更新に失敗しました",
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
          <h3 className="text-lg font-semibold text-gray-900">
            ユーザー情報編集
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <Input value={user.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">
              メールアドレスは変更できません
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名
            </label>
            <Input
              value={user?.full_name || ""}
              disabled
              className="bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <Input
              placeholder="090-1234-5678"
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              役割 *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) =>
                handleInputChange(
                  "role",
                  e.target.value as "admin" | "customer",
                )
              }
            >
              <option value="customer">顧客</option>
              <option value="admin">管理者</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  handleInputChange("is_active", e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                アクティブ
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_verified"
                checked={formData.is_verified}
                onChange={(e) =>
                  handleInputChange("is_verified", e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="is_verified" className="text-sm text-gray-700">
                認証済み
              </label>
            </div>
          </div>

          {/* フッター */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              更新
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

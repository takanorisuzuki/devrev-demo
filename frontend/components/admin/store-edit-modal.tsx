"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminStoreUpdateRequest } from "@/lib/api/admin-stores";
import { StoreDetail } from "@/lib/types/store";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/stores/auth";
import { adminStoreApi } from "@/lib/api/admin-stores";

interface StoreEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreDetail | null;
  onStoreUpdated: () => void;
}

export function StoreEditModal({
  open,
  onOpenChange,
  store,
  onStoreUpdated,
}: StoreEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdminStoreUpdateRequest>({});
  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  // 店舗データが変更されたときにフォームを更新
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        code: store.code,
        prefecture: store.prefecture,
        city: store.city,
        address_line1: store.address_line1,
        address_line2: store.address_line2 || "",
        postal_code: store.postal_code || "",
        phone: store.phone || "",
        email: store.email || "",
        latitude: store.latitude
          ? parseFloat(store.latitude.toString())
          : undefined,
        longitude: store.longitude
          ? parseFloat(store.longitude.toString())
          : undefined,
        is_airport: store.is_airport,
        is_station: store.is_station,
        is_active: store.is_active,
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // 必須フィールドのバリデーション
      if (
        !formData.name ||
        !formData.code ||
        !formData.prefecture ||
        !formData.city ||
        !formData.address_line1
      ) {
        addToast({
          type: "error",
          title: "入力エラー",
          message: "必須フィールドを入力してください",
        });
        return;
      }

      // adminStoreApi.updateStore関数でAPI呼び出しと認証が処理されます
      const updatedStore = await adminStoreApi.updateStore(store.id, formData);

      addToast({
        type: "success",
        title: "店舗更新完了",
        message: "店舗が正常に更新されました",
      });

      onStoreUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("店舗更新エラー:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "店舗の更新に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof AdminStoreUpdateRequest,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open || !store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">店舗編集</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">店舗名 *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="例: 東京駅店"
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">店舗コード *</Label>
                <Input
                  id="code"
                  value={formData.code || ""}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="例: TKY001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="prefecture">都道府県 *</Label>
                <Input
                  id="prefecture"
                  value={formData.prefecture || ""}
                  onChange={(e) =>
                    handleInputChange("prefecture", e.target.value)
                  }
                  placeholder="例: 東京都"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">市区町村 *</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="例: 千代田区"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address_line1">住所1 *</Label>
              <Input
                id="address_line1"
                value={formData.address_line1 || ""}
                onChange={(e) =>
                  handleInputChange("address_line1", e.target.value)
                }
                placeholder="例: 東京都千代田区丸の内1-9-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="address_line2">住所2</Label>
              <Input
                id="address_line2"
                value={formData.address_line2 || ""}
                onChange={(e) =>
                  handleInputChange("address_line2", e.target.value)
                }
                placeholder="例: テストビル1F"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ""}
                  onChange={(e) =>
                    handleInputChange("postal_code", e.target.value)
                  }
                  placeholder="例: 100-0005"
                />
              </div>

              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="例: 03-1234-5678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="例: tokyo@driverev.jp"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">緯度</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.00000001"
                  value={formData.latitude || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "latitude",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="例: 35.68120000"
                />
              </div>

              <div>
                <Label htmlFor="longitude">経度</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.00000001"
                  value={formData.longitude || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "longitude",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="例: 139.76710000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_airport"
                  checked={formData.is_airport || false}
                  onChange={(e) =>
                    handleInputChange("is_airport", e.target.checked)
                  }
                  className="mr-2"
                />
                <label htmlFor="is_airport" className="text-sm text-gray-700">
                  空港店舗
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_station"
                  checked={formData.is_station || false}
                  onChange={(e) =>
                    handleInputChange("is_station", e.target.checked)
                  }
                  className="mr-2"
                />
                <label htmlFor="is_station" className="text-sm text-gray-700">
                  駅店舗
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  営業中
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

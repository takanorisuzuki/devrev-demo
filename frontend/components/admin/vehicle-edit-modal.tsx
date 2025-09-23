"use client";

import { useState, useEffect } from "react";
import { X, Car, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Vehicle } from "@/lib/types/vehicle";
import {
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/lib/types/vehicle";
import { useAuthStore } from "@/lib/stores/auth";

// シンプルなフォームデータ型
interface VehicleEditFormData {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  category: string;
  class_type: string;
  transmission: string;
  fuel_type: string;
  daily_rate: number;
  is_available: boolean;
  is_smoking_allowed: boolean;
  image_filename: string;
}

interface VehicleEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onVehicleUpdated: () => void;
}

export function VehicleEditModal({
  open,
  onOpenChange,
  vehicle,
  onVehicleUpdated,
}: VehicleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleEditFormData>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    license_plate: "",
    category: "",
    class_type: "",
    transmission: "",
    fuel_type: "",
    daily_rate: 0,
    is_available: true,
    is_smoking_allowed: false,
    image_filename: "",
  });

  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  // 車両データが変更されたときにフォームを更新
  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        license_plate: vehicle.license_plate || "",
        category: vehicle.category,
        class_type: vehicle.class_type || "",
        transmission: vehicle.transmission || "",
        fuel_type: vehicle.fuel_type || "",
        daily_rate: vehicle.daily_rate,
        is_available: vehicle.is_available,
        is_smoking_allowed: vehicle.is_smoking_allowed,
        image_filename: vehicle.image_filename || "",
      });
    }
  }, [vehicle]);

  const handleInputChange = (
    field: keyof VehicleEditFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    setIsLoading(true);

    try {
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/vehicles/${vehicle.id}`,
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
        let errorMessage = "車両の更新に失敗しました";
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail?.message || errorMessage;
        } catch (jsonError) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedVehicle = await response.json();

      addToast({
        type: "success",
        title: "車両更新完了",
        message: `${updatedVehicle.make} ${updatedVehicle.model} を正常に更新しました`,
      });

      onOpenChange(false);
      onVehicleUpdated();
    } catch (error) {
      console.error("Vehicle update error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "車両の更新に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle || !open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Car className="h-5 w-5" />
            車両情報編集
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メーカー
              </label>
              <Input
                placeholder="Toyota"
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                モデル
              </label>
              <Input
                placeholder="Camry"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年式
              </label>
              <Input
                type="number"
                placeholder="2023"
                value={formData.year}
                onChange={(e) =>
                  handleInputChange("year", parseInt(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                色
              </label>
              <Input
                placeholder="白"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ナンバープレート
            </label>
            <Input
              placeholder="品川 500 あ 1234"
              value={formData.license_plate}
              onChange={(e) =>
                handleInputChange("license_plate", e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="">カテゴリを選択</option>
                {Object.entries(VEHICLE_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                クラスタイプ
              </label>
              <Input
                placeholder="セダン"
                value={formData.class_type}
                onChange={(e) =>
                  handleInputChange("class_type", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トランスミッション
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.transmission}
                onChange={(e) =>
                  handleInputChange("transmission", e.target.value)
                }
              >
                <option value="">トランスミッションを選択</option>
                {Object.entries(TRANSMISSIONS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                燃料タイプ
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.fuel_type}
                onChange={(e) => handleInputChange("fuel_type", e.target.value)}
              >
                <option value="">燃料タイプを選択</option>
                {Object.entries(FUEL_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日額料金（円）
            </label>
            <Input
              type="number"
              placeholder="8000"
              value={formData.daily_rate}
              onChange={(e) =>
                handleInputChange("daily_rate", parseFloat(e.target.value))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) =>
                  handleInputChange("is_available", e.target.checked)
                }
                className="rounded border-gray-300"
              />
              <label
                htmlFor="is_available"
                className="text-sm font-medium text-gray-700"
              >
                利用可能
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_smoking_allowed"
              checked={formData.is_smoking_allowed}
              onChange={(e) =>
                handleInputChange("is_smoking_allowed", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <label
              htmlFor="is_smoking_allowed"
              className="text-sm font-medium text-gray-700"
            >
              喫煙許可
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              画像ファイル名
            </label>
            <Input
              placeholder="toyota_camry.jpg"
              value={formData.image_filename}
              onChange={(e) =>
                handleInputChange("image_filename", e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
  );
}

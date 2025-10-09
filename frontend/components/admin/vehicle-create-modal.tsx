"use client";

import { useState } from "react";
import { X, Car, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { VehicleCreate } from "@/lib/types/vehicle";
import {
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
  TRANSMISSIONS,
} from "@/lib/types/vehicle";
import { useAuthStore } from "@/lib/stores/auth";
import { createVehicle } from "@/lib/api/admin-vehicles";

// シンプルなフォームデータ型
interface VehicleCreateFormData {
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
}

interface VehicleCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleCreated: () => void;
}

export function VehicleCreateModal({
  open,
  onOpenChange,
  onVehicleCreated,
}: VehicleCreateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleCreateFormData>({
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
  });

  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleInputChange = (
    field: keyof VehicleCreateFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // createVehicle関数でAPI呼び出しと認証が処理されます
      const newVehicle = await createVehicle(formData as VehicleCreate);

      addToast({
        type: "success",
        title: "車両作成完了",
        message: `${newVehicle.make} ${newVehicle.model} を正常に作成しました`,
      });

      setFormData({
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
      });
      onOpenChange(false);
      onVehicleCreated();
    } catch (error) {
      console.error("Vehicle creation error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "車両の作成に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Car className="h-5 w-5" />
            新規車両登録
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
                メーカー *
              </label>
              <Input
                placeholder="Toyota"
                value={formData.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                モデル *
              </label>
              <Input
                placeholder="Camry"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年式 *
              </label>
              <Input
                type="number"
                placeholder="2023"
                value={formData.year}
                onChange={(e) =>
                  handleInputChange("year", parseInt(e.target.value))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                色 *
              </label>
              <Input
                placeholder="白"
                value={formData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ナンバープレート *
            </label>
            <Input
              placeholder="品川 500 あ 1234"
              value={formData.license_plate}
              onChange={(e) =>
                handleInputChange("license_plate", e.target.value)
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
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
                クラスタイプ *
              </label>
              <Input
                placeholder="セダン"
                value={formData.class_type}
                onChange={(e) =>
                  handleInputChange("class_type", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                トランスミッション *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.transmission}
                onChange={(e) =>
                  handleInputChange("transmission", e.target.value)
                }
                required
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
                燃料タイプ *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.fuel_type}
                onChange={(e) => handleInputChange("fuel_type", e.target.value)}
                required
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
              日額料金（円） *
            </label>
            <Input
              type="number"
              placeholder="8000"
              value={formData.daily_rate}
              onChange={(e) =>
                handleInputChange("daily_rate", parseFloat(e.target.value))
              }
              required
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
                  作成中...
                </>
              ) : (
                "車両を作成"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

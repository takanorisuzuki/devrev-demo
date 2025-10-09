"use client";

import { useState } from "react";
import { AlertTriangle, Car, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Vehicle } from "@/lib/types/vehicle";
import { useAuthStore } from "@/lib/stores/auth";
import { deleteVehicle } from "@/lib/api/admin-vehicles";

interface VehicleDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onVehicleDeleted: () => void;
}

export function VehicleDeleteModal({
  open,
  onOpenChange,
  vehicle,
  onVehicleDeleted,
}: VehicleDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  const handleDelete = async () => {
    if (!vehicle) return;

    setIsLoading(true);
    try {
      // deleteVehicle関数でAPI呼び出しと認証が処理されます
      await deleteVehicle(vehicle.id);

      addToast({
        type: "success",
        title: "車両削除完了",
        message: `${vehicle.make} ${vehicle.model} を正常に削除しました`,
      });

      onOpenChange(false);
      onVehicleDeleted();
    } catch (error) {
      console.error("Vehicle deletion error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "車両の削除に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle || !open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            車両削除の確認
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Car className="h-8 w-8 text-gray-600" />
            <div>
              <div className="font-medium">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-sm text-gray-600">
                {vehicle.year}年式 • {vehicle.category}
              </div>
              <div className="text-sm text-gray-600">
                日額料金:{" "}
                {new Intl.NumberFormat("ja-JP", {
                  style: "currency",
                  currency: "JPY",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(vehicle.daily_rate)}
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">削除について</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>この車両は論理削除されます（完全には削除されません）</li>
                  <li>利用可能状態が「無効」に設定されます</li>
                  <li>既存の予約には影響しません</li>
                  <li>必要に応じて後で復元可能です</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  削除中...
                </>
              ) : (
                "削除"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  VehicleListResponse,
  VEHICLE_CATEGORIES,
  FUEL_TYPES,
} from "@/lib/types/vehicle";

interface VehicleCardProps {
  vehicle: VehicleListResponse;
  onSelect?: (vehicleId: string) => void;
  showDetails?: boolean;
  className?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onSelect,
  showDetails = true,
  className = "",
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "compact":
      case "standard":
        return "🚗";
      case "suv":
      case "electric_suv":
        return "🚙";
      case "premium":
        return "💎";
      case "sports":
        return "🏎️";
      case "electric":
        return "⚡";
      case "convertible":
        return "🏖️";
      case "exotic":
        return "🔥";
      case "van":
        return "🚐";
      default:
        return "🚗";
    }
  };

  const getAvailabilityStatus = () => {
    return vehicle.is_available ? "利用可能" : "貸出中";
  };

  const getAvailabilityColor = () => {
    return vehicle.is_available
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryName = (category: string) => {
    return (
      VEHICLE_CATEGORIES[category as keyof typeof VEHICLE_CATEGORIES] ||
      category
    );
  };

  const handleCardClick = () => {
    if (onSelect && vehicle.is_available) {
      onSelect(vehicle.id);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 
        border border-gray-200 overflow-hidden cursor-pointer
        ${!vehicle.is_available ? "opacity-70" : ""}
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* 車両画像エリア */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
        {vehicle.image_filename ? (
          <img
            src={`/assets/images/cars/${vehicle.image_filename}`}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 画像が見つからない場合はアイコンにフォールバック
              e.currentTarget.style.display = "none";
              const fallbackElement = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div className={`text-6xl ${vehicle.image_filename ? "hidden" : ""}`}>
          {getCategoryIcon(vehicle.category)}
        </div>

        {/* 利用可能状況バッジ */}
        <div
          className={`
          absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
          ${getAvailabilityColor()}
        `}
        >
          {getAvailabilityStatus()}
        </div>

        {/* デモサイト要件: 禁煙/喫煙、オートマ/マニュアル表示 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
            {vehicle.is_smoking_allowed ? "🚭 喫煙可" : "🚭 禁煙"}
          </div>
          <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
            {vehicle.transmission === "manual"
              ? "⚙️ マニュアル"
              : "⚙️ オートマ"}
          </div>
        </div>
      </div>

      {/* 車両情報 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-gray-600">
              {getCategoryName(vehicle.category)}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            {/* 価格 */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">料金</span>
              <div className="text-right">
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(vehicle.daily_rate)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/日</span>
              </div>
            </div>

            {/* デモサイト要件: 乗り捨て料金表示 */}
            {vehicle.daily_rate && (
              <div className="text-xs text-gray-500 mb-2">
                乗り捨て: +5,000円
              </div>
            )}

            {/* 予約ボタン */}
            <button
              className={`
                w-full py-2 px-4 rounded-md font-medium text-sm transition-colors
                ${
                  vehicle.is_available
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
              disabled={!vehicle.is_available}
              onClick={(e) => {
                e.stopPropagation();
                if (vehicle.is_available && onSelect) {
                  onSelect(vehicle.id);
                }
              }}
            >
              {vehicle.is_available ? "予約する" : "利用不可"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;

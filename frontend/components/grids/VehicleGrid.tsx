"use client";

import React from "react";
import VehicleCard from "@/components/cards/VehicleCard";
import { useVehicles, useVehicleSearch } from "@/lib/hooks/useVehicles";
import { VehicleListResponse, VehicleSearchParams } from "@/lib/types/vehicle";

interface VehicleGridProps {
  searchParams?: VehicleSearchParams;
  onVehicleSelect?: (vehicleId: string) => void;
  maxItems?: number;
  showLoadMore?: boolean;
  className?: string;
}

const VehicleGrid: React.FC<VehicleGridProps> = ({
  searchParams,
  onVehicleSelect,
  maxItems,
  showLoadMore = false,
  className = "",
}) => {
  const { vehicles, loading, error, refetch } = useVehicles({
    searchParams,
    autoFetch: true,
  });

  const displayVehicles = maxItems ? vehicles.slice(0, maxItems) : vehicles;

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* スケルトンローディング */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="flex justify-between items-center mb-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            車両データの取得に失敗しました
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (displayVehicles.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a5 5 0 1110 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            車両が見つかりません
          </h3>
          <p className="text-gray-600">
            条件に合う車両がありません。検索条件を変更してお試しください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 結果サマリー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          利用可能な車両 ({vehicles.length}台)
        </h2>
        {maxItems && vehicles.length > maxItems && (
          <span className="text-sm text-gray-600">
            {maxItems}台 / 全{vehicles.length}台表示
          </span>
        )}
      </div>

      {/* 車両グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onSelect={onVehicleSelect}
            showDetails={true}
          />
        ))}
      </div>

      {/* もっと見る */}
      {showLoadMore && maxItems && vehicles.length > maxItems && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              /* TODO: ページネーション実装 */
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            さらに車両を見る
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleGrid;

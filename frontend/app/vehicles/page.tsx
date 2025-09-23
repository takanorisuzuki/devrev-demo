"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Filter, Car, MapPin, Calendar, Clock } from "lucide-react";
import { useVehicles } from "@/lib/hooks/useVehicles";
import { useStores } from "@/lib/hooks/useStores";
import { formatJSTDate, formatJSTTime } from "@/lib/utils/time-management";

function VehiclesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles();
  const { stores, loading: storesLoading } = useStores();

  // URLパラメータから検索条件を取得
  const pickupLocation = searchParams.get("pickup_location") || "";
  const returnLocation = searchParams.get("return_location") || "";
  const pickupDate = searchParams.get("pickup_date") || "";
  const returnDate = searchParams.get("return_date") || "";
  const pickupTime = searchParams.get("pickup_time") || "";
  const returnTime = searchParams.get("return_time") || "";

  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    make: "",
    minPrice: "",
    maxPrice: "",
  });

  // 店舗名を取得する関数
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.name || "店舗";
  };

  // 車両画像URLを構築する関数
  const getVehicleImageUrl = (vehicle: any) => {
    if (vehicle.image_url) {
      return vehicle.image_url;
    }
    if (vehicle.image_filename) {
      return `/assets/images/cars/${vehicle.image_filename}`;
    }
    return null;
  };

  // フィルタリングされた車両を取得
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filters.category && vehicle.category !== filters.category) return false;
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.minPrice && vehicle.daily_rate < parseInt(filters.minPrice))
      return false;
    if (filters.maxPrice && vehicle.daily_rate > parseInt(filters.maxPrice))
      return false;
    return vehicle.is_available;
  });

  // 車両選択
  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  // 予約に進む
  const handleReserve = () => {
    if (selectedVehicle) {
      const reservationParams = new URLSearchParams({
        pickup_location: pickupLocation,
        return_location: returnLocation,
        pickup_date: pickupDate,
        return_date: returnDate,
        pickup_time: pickupTime,
        return_time: returnTime,
      });

      router.push(
        `/vehicles/${selectedVehicle.id}/reserve?${reservationParams.toString()}`,
      );
    }
  };

  // 検索条件の表示（hydrationエラー回避のためクライアントサイドのみ）
  const [formattedPickupDateTime, setFormattedPickupDateTime] = useState("");
  const [formattedReturnDateTime, setFormattedReturnDateTime] = useState("");

  useEffect(() => {
    const formatDateTime = (date: string, time: string) => {
      if (!date || !time) return "";
      const dateTime = new Date(`${date}T${time}`);
      return `${formatJSTDate(dateTime)} ${formatJSTTime(dateTime)}`;
    };

    setFormattedPickupDateTime(formatDateTime(pickupDate, pickupTime));
    setFormattedReturnDateTime(formatDateTime(returnDate, returnTime));
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>戻る</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">車両検索結果</h1>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>フィルター</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索条件表示 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">検索条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                受取: {getStoreName(pickupLocation)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                返却: {getStoreName(returnLocation)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                受取: {formattedPickupDateTime}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                返却: {formattedReturnDateTime}
              </span>
            </div>
          </div>
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              フィルター
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  <option value="compact">コンパクト</option>
                  <option value="standard">スタンダード</option>
                  <option value="luxury">ラグジュアリー</option>
                  <option value="suv">SUV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メーカー
                </label>
                <select
                  value={filters.make}
                  onChange={(e) =>
                    setFilters({ ...filters, make: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  <option value="Toyota">トヨタ</option>
                  <option value="Honda">ホンダ</option>
                  <option value="BMW">BMW</option>
                  <option value="Porsche">ポルシェ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低価格
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最高価格
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  placeholder="50000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 車両一覧 */}
        {vehiclesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">車両データを読み込み中...</p>
          </div>
        ) : vehiclesError ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              車両データの読み込みに失敗しました
            </h3>
            <p className="text-gray-600 mb-4">{vehiclesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              条件に合う車両が見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更して再度お試しください。
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              フィルターを調整
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                  selectedVehicle?.id === vehicle.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleSelectVehicle(vehicle)}
              >
                <div className="p-6">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    {getVehicleImageUrl(vehicle) ? (
                      <img
                        src={getVehicleImageUrl(vehicle)}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Car className="h-16 w-16 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {vehicle.category}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat("ja-JP", {
                          style: "currency",
                          currency: "JPY",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(vehicle.daily_rate)}
                        /日
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="capitalize">{vehicle.transmission}</span>
                      <span>
                        {vehicle.is_smoking_allowed ? "喫煙可" : "禁煙"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{getStoreName(vehicle.store_id)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 予約ボタン */}
        {selectedVehicle && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={handleReserve}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Car className="h-5 w-5" />
              <span>この車両を予約する</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VehiclesPageContent />
    </Suspense>
  );
}

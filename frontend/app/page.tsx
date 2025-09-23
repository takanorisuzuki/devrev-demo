"use client";

import React, { useState } from "react";
import { Search, Car, MapPin, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStores } from "../lib/hooks/useStores";
import {
  getDefaultSearchConditions,
  calculateReturnDateTimeFromPickup,
  validateSearchConditions,
} from "../lib/utils/time-management";
import ErrorBanner from "@/components/ui/error-banner";
import { ErrorType } from "@/lib/utils/error-handler";

export default function HomePage() {
  const router = useRouter();
  const { stores, loading: storesLoading } = useStores();

  // デフォルト値の計算（統一された時間管理ユーティリティを使用）
  const defaultValues = getDefaultSearchConditions();

  const [searchForm, setSearchForm] = useState({
    pickupLocation: "", // デフォルトは空（店舗データ読み込み後に設定）
    returnLocation: "", // デフォルトは空（店舗データ読み込み後に設定）
    pickupDate: defaultValues.pickupDate,
    returnDate: defaultValues.returnDate,
    pickupTime: defaultValues.pickupTime,
    returnTime: defaultValues.returnTime,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // 店舗データが読み込まれたらデフォルト店舗を設定
  React.useEffect(() => {
    if (stores.length > 0 && !searchForm.pickupLocation) {
      const tokyoStationStore = stores.find(
        (store) => store.name === "東京駅店",
      );
      const defaultStoreId = tokyoStationStore?.id || stores[0].id;

      setSearchForm((prev) => ({
        ...prev,
        pickupLocation: defaultStoreId,
        returnLocation: defaultStoreId,
      }));
    }
  }, [stores, searchForm.pickupLocation]);

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // 受取店舗を変更した場合、返却店舗も同じ店舗にする
      if (field === "pickupLocation" && value) {
        newForm.returnLocation = value;
      }

      // 受付日時を変更した場合、返却日時を自動計算（統一された時間管理ユーティリティを使用）
      if (field === "pickupDate" || field === "pickupTime") {
        const pickupDate = field === "pickupDate" ? value : prev.pickupDate;
        const pickupTime = field === "pickupTime" ? value : prev.pickupTime;

        if (pickupDate && pickupTime) {
          const { returnDate, returnTime } = calculateReturnDateTimeFromPickup(
            pickupDate,
            pickupTime,
          );

          newForm.returnDate = returnDate;
          newForm.returnTime = returnTime;
        }
      }

      return newForm;
    });
  };

  const handleSearch = () => {
    // エラーをクリア
    setValidationError(null);

    // 統一された時間管理ユーティリティでバリデーション
    const validation = validateSearchConditions(
      searchForm.pickupDate,
      searchForm.pickupTime,
      searchForm.returnDate,
      searchForm.returnTime,
    );

    if (!validation.isValid) {
      setValidationError(validation.errorMessage || "Validation error");
      return;
    }

    // 検索パラメータを構築
    const searchParams = new URLSearchParams();
    if (searchForm.pickupLocation)
      searchParams.set("pickup_location", searchForm.pickupLocation);
    if (searchForm.returnLocation)
      searchParams.set("return_location", searchForm.returnLocation);
    if (searchForm.pickupDate)
      searchParams.set("pickup_date", searchForm.pickupDate);
    if (searchForm.returnDate)
      searchParams.set("return_date", searchForm.returnDate);
    if (searchForm.pickupTime)
      searchParams.set("pickup_time", searchForm.pickupTime);
    if (searchForm.returnTime)
      searchParams.set("return_time", searchForm.returnTime);

    // 車両検索ページに遷移
    const url = `/vehicles${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            理想のドライブ体験を
            <br />
            <span className="text-blue-600">あなたの手で</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            簡単・安心・迅速なレンタカー予約サービス
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            車両を検索
          </h3>

          {/* バリデーションエラー表示 */}
          {validationError && (
            <ErrorBanner
              error={{
                type: ErrorType.VALIDATION,
                message: validationError,
                timestamp: new Date().toISOString(),
              }}
              onDismiss={() => setValidationError(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* 受取店舗 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                受取店舗
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.pickupLocation}
                onChange={(e) =>
                  handleInputChange("pickupLocation", e.target.value)
                }
                disabled={storesLoading}
              >
                <option value="">
                  {storesLoading ? "読み込み中..." : "店舗を選択"}
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 返却店舗 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                返却店舗
                {searchForm.pickupLocation &&
                  searchForm.returnLocation &&
                  searchForm.pickupLocation !== searchForm.returnLocation && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      乗り捨て +5,000円
                    </span>
                  )}
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.returnLocation}
                onChange={(e) =>
                  handleInputChange("returnLocation", e.target.value)
                }
                disabled={storesLoading}
              >
                <option value="">
                  {storesLoading ? "読み込み中..." : "店舗を選択"}
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 受取日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                受取日
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.pickupDate}
                onChange={(e) =>
                  handleInputChange("pickupDate", e.target.value)
                }
              />
            </div>

            {/* 受取時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                受取時間
              </label>
              <input
                type="time"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.pickupTime}
                onChange={(e) =>
                  handleInputChange("pickupTime", e.target.value)
                }
              />
            </div>

            {/* 返却日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                返却日
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.returnDate}
                onChange={(e) =>
                  handleInputChange("returnDate", e.target.value)
                }
              />
            </div>

            {/* 返却時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                返却時間
              </label>
              <input
                type="time"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchForm.returnTime}
                onChange={(e) =>
                  handleInputChange("returnTime", e.target.value)
                }
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            車両を検索
          </button>
        </div>

        {/* デモサイト説明 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            デモサイトの使い方
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                1. 車両検索
              </h4>
              <p className="text-gray-600">
                日時・場所・車種で条件を指定して車両を検索します
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                2. 車両選択
              </h4>
              <p className="text-gray-600">
                検索結果から希望の車両を選択して予約ボタンをクリック
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                3. 予約完了
              </h4>
              <p className="text-gray-600">
                ログイン後、オプション選択・料金確認して予約を確定
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="w-6 h-6 text-blue-400" />
              <h5 className="text-xl font-bold">DriveRev</h5>
            </div>
            <p className="text-gray-400 mb-4">
              デモサイト - 日本のプレミアムレンタカーサービス
            </p>
            <div className="text-sm text-gray-500">
              <p>
                📞 03-6234-5678 | 📧 support@driverev.jp | 🕒 24時間サポート
              </p>
              <p className="mt-2">&copy; 2025 DriveRev. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

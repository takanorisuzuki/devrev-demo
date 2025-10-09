"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import {
  getDefaultPickupDateTime,
  getDefaultReturnDateTime,
  calculateRentalDurationHours,
  calculateRentalDurationDays,
} from "../../../../lib/utils/time-management";
import { useAuthStore } from "@/lib/stores/auth";
import { reservationApi } from "@/lib/api/reservations";
import { getVehicle } from "@/lib/api/vehicles";
import { useStores } from "@/lib/hooks/useStores";

// 実際のAPIから車両と店舗データを取得

interface ReservationForm {
  pickup_datetime: string;
  return_datetime: string;
  pickup_store_id: string;
  return_store_id: string;
  child_seat: boolean;
  car_insurance: boolean;
  one_way_fee: boolean;
  special_requests: string;
}

export default function DemoReservePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = params.id as string;
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const { stores, loading: storesLoading } = useStores();

  const [vehicle, setVehicle] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // デフォルト値を計算（統一された時間管理ユーティリティを使用）
  const defaultPickup = getDefaultPickupDateTime();
  const defaultReturn = getDefaultReturnDateTime(defaultPickup);

  const [form, setForm] = useState<ReservationForm>({
    pickup_datetime: defaultPickup.toISOString().slice(0, 16),
    return_datetime: defaultReturn.toISOString().slice(0, 16),
    pickup_store_id: "", // デフォルトは空（店舗データ読み込み後に設定）
    return_store_id: "", // デフォルトは空（店舗データ読み込み後に設定）
    child_seat: false,
    car_insurance: false,
    one_way_fee: false,
    special_requests: "",
  });

  const [priceQuote, setPriceQuote] = useState({
    duration_hours: 0,
    duration_days: 0,
    subtotal: 0,
    child_seat_fee: 0,
    car_insurance_fee: 0,
    one_way_fee: 0,
    tax_amount: 0,
    total_amount: 0,
  });

  // 認証チェック
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      // ログイン画面に遷移（現在のページをリダイレクト先として設定）
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [hasHydrated, isAuthenticated, router]);

  // 店舗データが読み込まれたらデフォルト店舗を設定
  useEffect(() => {
    if (stores.length > 0 && !form.pickup_store_id) {
      const tokyoStationStore = stores.find(
        (store) => store.name === "東京駅店",
      );
      const defaultStoreId = tokyoStationStore?.id || stores[0].id;

      setForm((prev) => ({
        ...prev,
        pickup_store_id: defaultStoreId,
        return_store_id: defaultStoreId,
      }));
    }
  }, [stores, form.pickup_store_id]);

  // 車両情報の取得（バックエンドAPI）
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        console.log("車両ID:", vehicleId);
        const data = await getVehicle(vehicleId);
        console.log("車両データ:", data);
        setVehicle(data);
      } catch (error: any) {
        console.error("車両データの取得中にエラーが発生しました:", error);
        setVehicle(null);
        // エラーメッセージを設定（ユーザーに表示）
        if (error.response?.status === 404) {
          console.error(`車両ID "${vehicleId}" が見つかりません`);
        }
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  // 検索条件から初期値を設定
  useEffect(() => {
    const pickupDate = searchParams.get("pickup_date");
    const pickupTime = searchParams.get("pickup_time");
    const returnDate = searchParams.get("return_date");
    const returnTime = searchParams.get("return_time");
    const pickupLocation = searchParams.get("pickup_location");
    const returnLocation = searchParams.get("return_location");

    if (pickupDate && pickupTime && returnDate && returnTime) {
      setForm((prev) => ({
        ...prev,
        pickup_datetime: `${pickupDate}T${pickupTime}`,
        return_datetime: `${returnDate}T${returnTime}`,
        pickup_store_id: pickupLocation || "",
        return_store_id: returnLocation || "",
        one_way_fee: pickupLocation !== returnLocation,
      }));
    }
    // 車両優先パターンでは、初期状態でデフォルト値が既に設定されている
  }, [searchParams]);

  // 料金計算（統一された時間管理ユーティリティを使用）
  useEffect(() => {
    if (!form.pickup_datetime || !form.return_datetime) return;

    const pickup = new Date(form.pickup_datetime);
    const returnTime = new Date(form.return_datetime);
    const durationHours = calculateRentalDurationHours(pickup, returnTime);
    const durationDays = calculateRentalDurationDays(pickup, returnTime);

    if (!vehicle) return;

    const baseSubtotal = vehicle.daily_rate * durationDays;
    const childSeatFee = form.child_seat ? 1000 * durationDays : 0;
    const carInsuranceFee = form.car_insurance ? 2000 * durationDays : 0;
    const oneWayFee = form.one_way_fee ? 5000 : 0;

    const optionsTotal = childSeatFee + carInsuranceFee + oneWayFee;
    const newSubtotal = baseSubtotal + optionsTotal;
    const taxAmount = Math.floor(newSubtotal * 0.1);
    const totalAmount = newSubtotal + taxAmount;

    setPriceQuote({
      duration_hours: durationHours,
      duration_days: durationDays,
      subtotal: newSubtotal,
      child_seat_fee: childSeatFee,
      car_insurance_fee: carInsuranceFee,
      one_way_fee: oneWayFee,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    });
  }, [form, vehicle]);

  const handleInputChange = (field: keyof ReservationForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleReserve = async () => {
    // 認証状態をチェック
    if (!isAuthenticated || !user) {
      console.error("認証されていません");
      return;
    }

    try {
      // 実際のAPI呼び出しで予約を作成
      const reservationData = {
        vehicle_id: vehicleId,
        pickup_store_id: form.pickup_store_id,
        return_store_id: form.return_store_id,
        pickup_datetime: form.pickup_datetime,
        return_datetime: form.return_datetime,
        options: {
          child_seat: form.child_seat,
          car_insurance: form.car_insurance,
          one_way_fee: form.one_way_fee,
          special_requests: form.special_requests,
        },
      };

      console.log("予約データを送信中:", reservationData);
      const newReservation =
        await reservationApi.createReservation(reservationData);
      console.log("予約作成成功:", newReservation);

      // 予約完了画面に遷移
      router.push(`/reservations/${newReservation.id}`);
    } catch (error: any) {
      console.error("予約作成エラー:", error);
      setErrorMessage(error.message || "予約の作成に失敗しました");
      setShowErrorModal(true);
    }
  };

  // 認証チェック中
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はログインページにリダイレクト（useEffectで処理）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">ログインページにリダイレクト中...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            車両が見つかりません
          </h2>
          <p className="text-gray-600 mb-4">
            車両ID "{vehicleId}" に対応する車両情報が存在しません。
          </p>
          <button
            onClick={() => router.push("/vehicles")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            車両一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const pickupStore = stores.find((store) => store.id === form.pickup_store_id);
  const returnStore = stores.find((store) => store.id === form.return_store_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              車両一覧に戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-900">予約確認</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 車両情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Car className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">選択した車両</h2>
            </div>

            <div className="space-y-4">
              <img
                src={`/assets/images/cars/${vehicle.image_filename}`}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded-md"
              />

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-gray-600 capitalize">{vehicle.category}</p>
                <p className="text-lg font-semibold text-blue-600 mt-2">
                  {formatPrice(vehicle.daily_rate)}/日
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.is_smoking_allowed
                      ? "bg-orange-100 text-orange-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {vehicle.is_smoking_allowed ? "🚭 喫煙可" : "🚭 禁煙"}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                  {vehicle.transmission === "manual"
                    ? "⚙️ マニュアル"
                    : "⚙️ オートマ"}
                </span>
              </div>
            </div>
          </div>

          {/* 予約フォーム */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">予約詳細</h2>
            </div>

            <div className="space-y-4">
              {/* 日時選択 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 受取日時 */}
                  <div>
                    <div className="font-medium text-gray-700 mb-2">受取</div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          日付
                        </label>
                        <input
                          type="date"
                          value={
                            form.pickup_datetime
                              ? form.pickup_datetime.split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const time = form.pickup_datetime
                              ? form.pickup_datetime.split("T")[1]
                              : "10:00";
                            handleInputChange(
                              "pickup_datetime",
                              `${e.target.value}T${time}`,
                            );
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          時間
                        </label>
                        <input
                          type="time"
                          value={
                            form.pickup_datetime
                              ? form.pickup_datetime.split("T")[1]
                              : ""
                          }
                          onChange={(e) => {
                            const date = form.pickup_datetime
                              ? form.pickup_datetime.split("T")[0]
                              : "";
                            handleInputChange(
                              "pickup_datetime",
                              `${date}T${e.target.value}`,
                            );
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          店舗
                        </label>
                        <select
                          value={form.pickup_store_id}
                          onChange={(e) =>
                            handleInputChange("pickup_store_id", e.target.value)
                          }
                          disabled={storesLoading}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                  </div>

                  {/* 返却日時 */}
                  <div>
                    <div className="font-medium text-gray-700 mb-2">返却</div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          日付
                        </label>
                        <input
                          type="date"
                          value={
                            form.return_datetime
                              ? form.return_datetime.split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const time = form.return_datetime
                              ? form.return_datetime.split("T")[1]
                              : "14:00";
                            handleInputChange(
                              "return_datetime",
                              `${e.target.value}T${time}`,
                            );
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          時間
                        </label>
                        <input
                          type="time"
                          value={
                            form.return_datetime
                              ? form.return_datetime.split("T")[1]
                              : ""
                          }
                          onChange={(e) => {
                            const date = form.return_datetime
                              ? form.return_datetime.split("T")[0]
                              : "";
                            handleInputChange(
                              "return_datetime",
                              `${date}T${e.target.value}`,
                            );
                          }}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          店舗
                        </label>
                        <select
                          value={form.return_store_id}
                          onChange={(e) => {
                            handleInputChange(
                              "return_store_id",
                              e.target.value,
                            );
                            handleInputChange(
                              "one_way_fee",
                              form.pickup_store_id !== e.target.value,
                            );
                          }}
                          disabled={storesLoading}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                  </div>
                </div>
                {form.one_way_fee && (
                  <div className="mt-2 text-orange-600 text-sm font-medium">
                    ⚠️ 乗り捨てレンタル
                  </div>
                )}
              </div>

              {/* オプション選択 */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  オプション選択
                </h3>

                <div className="space-y-3">
                  {/* チャイルドシート */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        チャイルドシート
                      </label>
                      <p className="text-xs text-gray-500">1,000円/日</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.child_seat}
                      onChange={(e) =>
                        handleInputChange("child_seat", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* 自動車保険 */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        自動車保険
                      </label>
                      <p className="text-xs text-gray-500">2,000円/日</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.car_insurance}
                      onChange={(e) =>
                        handleInputChange("car_insurance", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* 乗り捨てオプション */}
                  {form.pickup_store_id !== form.return_store_id && (
                    <div className="flex items-center justify-between p-3 border border-orange-200 rounded-md bg-orange-50">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          乗り捨てオプション
                        </label>
                        <p className="text-xs text-gray-500">5,000円</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.one_way_fee}
                        onChange={(e) =>
                          handleInputChange("one_way_fee", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 特別要望 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特別要望（任意）
                </label>
                <textarea
                  value={form.special_requests}
                  onChange={(e) =>
                    handleInputChange("special_requests", e.target.value)
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：禁煙車希望、カーナビ必須など"
                />
              </div>

              {/* 料金表示 */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">料金詳細</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>レンタル期間</span>
                    <span>
                      {priceQuote.duration_days}日 ({priceQuote.duration_hours}
                      時間)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>基本料金</span>
                    <span>
                      {formatPrice(
                        vehicle.daily_rate * priceQuote.duration_days,
                      )}
                    </span>
                  </div>

                  {/* オプション料金表示 */}
                  {form.child_seat && (
                    <div className="flex justify-between text-green-600">
                      <span>チャイルドシート</span>
                      <span>{formatPrice(priceQuote.child_seat_fee)}</span>
                    </div>
                  )}
                  {form.car_insurance && (
                    <div className="flex justify-between text-green-600">
                      <span>自動車保険</span>
                      <span>{formatPrice(priceQuote.car_insurance_fee)}</span>
                    </div>
                  )}
                  {form.one_way_fee && (
                    <div className="flex justify-between text-orange-600">
                      <span>乗り捨てオプション</span>
                      <span>{formatPrice(priceQuote.one_way_fee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>消費税</span>
                    <span>{formatPrice(priceQuote.tax_amount)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>合計金額</span>
                    <span className="text-lg text-blue-600">
                      {formatPrice(priceQuote.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 予約確定ボタン */}
              <button
                onClick={handleReserve}
                disabled={!form.pickup_datetime || !form.return_datetime}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                予約を確定する
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* エラーモーダル */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  予約エラー
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {errorMessage}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

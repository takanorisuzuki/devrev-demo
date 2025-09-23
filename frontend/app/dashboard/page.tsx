"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import {
  formatJSTTime,
  formatJSTDate,
  calculateRentalDurationDays,
} from "@/lib/utils/time-management";
import { useReservations } from "@/lib/hooks/useReservations";
import { reservationApi } from "@/lib/api/reservations";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";
import ErrorBanner from "@/components/ui/error-banner";
import { ErrorType } from "@/lib/utils/error-handler";

// 車両画像URLを構築する関数
const getVehicleImageUrl = (vehicle: any) => {
  if (vehicle?.image_url) {
    return vehicle.image_url;
  }
  if (vehicle?.image_filename) {
    return `/assets/images/cars/${vehicle.image_filename}`;
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, isAuthenticated, hasHydrated } = useAuthStore();
  const { reservations, loading, error, refetch } = useReservations();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // 認証チェック
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      // ログイン画面に遷移（現在のページをリダイレクト先として設定）
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // 管理者の場合は管理者ダッシュボードにリダイレクト
    if (hasHydrated && isAuthenticated && user?.role === "admin") {
      console.log(
        "Admin user accessing customer dashboard, redirecting to admin dashboard",
      );
      router.push("/admin/dashboard");
      return;
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // 予約キャンセル確認
  const handleCancelReservation = (reservationId: string) => {
    setCancelReservationId(reservationId);
    setShowCancelModal(true);
  };

  // キャンセル実行
  const executeCancelReservation = async () => {
    if (!cancelReservationId) return;

    setIsCancelling(true);
    setCancelError(null);
    try {
      await reservationApi.cancelReservation(
        cancelReservationId,
        "ユーザーによるキャンセル",
      );
      // 予約データを再取得
      refetch();
      setShowCancelModal(false);
      setCancelReservationId(null);
      // 成功通知
      addToast({
        type: "success",
        title: "予約をキャンセルしました",
        message: "予約のキャンセルが完了しました。",
      });
    } catch (error: any) {
      console.error("予約キャンセルエラー:", error);
      setCancelError(`予約のキャンセルに失敗しました: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // キャンセルモーダルを閉じる
  const closeCancelModal = () => {
    if (isCancelling) return; // 処理中は閉じられない
    setShowCancelModal(false);
    setCancelReservationId(null);
    setCancelError(null);
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

  // 未認証の場合はログインページにリダイレクト
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

  // 予約データのフィルタリング
  const currentReservations = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "pending",
  );
  const historyReservations = reservations.filter(
    (r) => r.status === "completed" || r.status === "cancelled",
  );

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: formatJSTDate(date),
      time: formatJSTTime(date),
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "確定";
      case "pending":
        return "保留中";
      case "completed":
        return "完了";
      case "cancelled":
        return "キャンセル";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("current")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "current"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                現在の予約 ({currentReservations.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                予約履歴 ({historyReservations.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 予約一覧 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">予約データを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              データの読み込みに失敗しました
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "current" ? (
              currentReservations.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    現在の予約はありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    新しい予約を作成して、素敵なドライブをお楽しみください。
                  </p>
                  <button
                    onClick={() => router.push("/vehicles")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>車両を検索</span>
                  </button>
                </div>
              ) : (
                currentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          {getVehicleImageUrl(reservation.vehicle) ? (
                            <img
                              src={getVehicleImageUrl(reservation.vehicle)}
                              alt={`${reservation.vehicle?.make || ""} ${reservation.vehicle?.model || ""}`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <Car className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(reservation.status)}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                reservation.status,
                              )}`}
                            >
                              {getStatusText(reservation.status)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {reservation.vehicle?.make}{" "}
                            {reservation.vehicle?.model}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                受取:{" "}
                                {
                                  formatDateTime(reservation.pickup_datetime)
                                    .date
                                }{" "}
                                {
                                  formatDateTime(reservation.pickup_datetime)
                                    .time
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                返却:{" "}
                                {
                                  formatDateTime(reservation.return_datetime)
                                    .date
                                }{" "}
                                {
                                  formatDateTime(reservation.return_datetime)
                                    .time
                                }
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                受取: {reservation.pickup_store?.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                返却: {reservation.return_store?.name}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              期間:{" "}
                              {calculateRentalDurationDays(
                                new Date(reservation.pickup_datetime),
                                new Date(reservation.return_datetime),
                              )}
                              日
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {new Intl.NumberFormat("ja-JP", {
                                style: "currency",
                                currency: "JPY",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(Number(reservation.total_amount))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {/* 詳細を見るボタン - すべての予約に表示 */}
                        <button
                          onClick={() =>
                            router.push(`/reservations/${reservation.id}`)
                          }
                          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          <span>詳細を見る</span>
                        </button>

                        {/* 支払いボタン - 未払いかつキャンセル済みでない場合のみ表示 */}
                        {(reservation.payment_status === "pending" ||
                          reservation.payment_status === null) &&
                          reservation.status !== "cancelled" && (
                            <button
                              onClick={() =>
                                router.push(`/reservations/${reservation.id}`)
                              }
                              className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>支払い</span>
                            </button>
                          )}

                        {/* 支払い済み表示 - キャンセル済みでない場合のみ表示 */}
                        {reservation.payment_status === "completed" &&
                          reservation.status !== "cancelled" && (
                            <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                              <CreditCard className="h-4 w-4" />
                              <span>支払い済み</span>
                            </div>
                          )}

                        {/* キャンセルボタン */}
                        {(reservation.status === "confirmed" ||
                          reservation.status === "pending") && (
                          <button
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                            className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-sm">キャンセル</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : historyReservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  予約履歴はありません
                </h3>
                <p className="text-gray-600">
                  過去の予約履歴がここに表示されます。
                </p>
              </div>
            ) : (
              historyReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        {getVehicleImageUrl(reservation.vehicle) ? (
                          <img
                            src={getVehicleImageUrl(reservation.vehicle)}
                            alt={`${reservation.vehicle?.make || ""} ${reservation.vehicle?.model || ""}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Car className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(reservation.status)}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              reservation.status,
                            )}`}
                          >
                            {getStatusText(reservation.status)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {reservation.vehicle?.make}{" "}
                          {reservation.vehicle?.model}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              受取:{" "}
                              {formatDateTime(reservation.pickup_datetime).date}{" "}
                              {formatDateTime(reservation.pickup_datetime).time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              返却:{" "}
                              {formatDateTime(reservation.return_datetime).date}{" "}
                              {formatDateTime(reservation.return_datetime).time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>受取: {reservation.pickup_store?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>返却: {reservation.return_store?.name}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            期間:{" "}
                            {calculateRentalDurationDays(
                              new Date(reservation.pickup_datetime),
                              new Date(reservation.return_datetime),
                            )}
                            日
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Intl.NumberFormat("ja-JP", {
                              style: "currency",
                              currency: "JPY",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(Number(reservation.total_amount))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {/* 詳細を見るボタン - 履歴の予約にも表示 */}
                      <button
                        onClick={() =>
                          router.push(`/reservations/${reservation.id}`)
                        }
                        className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                      >
                        <span>詳細を見る</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* エラーバナー */}
      {cancelError && (
        <ErrorBanner
          error={{
            type: ErrorType.SERVER,
            message: cancelError,
            timestamp: new Date().toISOString(),
          }}
          onDismiss={() => setCancelError(null)}
        />
      )}

      {/* キャンセル確認モーダル */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={closeCancelModal}
        onConfirm={executeCancelReservation}
        title="予約キャンセル"
        message="この予約をキャンセルしますか？この操作は取り消せません。"
        confirmText="キャンセルする"
        cancelText="やめる"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}

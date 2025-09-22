"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CreditCard,
  User,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useReservation } from "@/lib/hooks/useReservations";
import { useAuthStore } from "@/lib/stores/auth";
import PaymentForm from "@/components/forms/payment-form";
import PaymentSuccessModal from "@/components/payment-success-modal";
import { formatJSTTime, formatJSTDate } from "@/lib/utils/time-management";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;
  const { isAuthenticated, hasHydrated, user } = useAuthStore();
  const { addToast } = useToast();

  const {
    reservation,
    loading,
    error,
    cancelReservation,
    refetch,
    updatePaymentStatus,
  } = useReservation(reservationId);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId: string;
    amount: number;
  } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      console.log('Admin user accessing customer reservation page, redirecting to admin dashboard');
      router.push("/admin/dashboard");
      return;
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${formatJSTDate(date)} ${formatJSTTime(date)}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: "予約中", color: "bg-yellow-100 text-yellow-800" },
      confirmed: { text: "確定", color: "bg-green-100 text-green-800" },
      active: { text: "利用中", color: "bg-blue-100 text-blue-800" },
      completed: { text: "完了", color: "bg-gray-100 text-gray-800" },
      cancelled: { text: "キャンセル", color: "bg-red-100 text-red-800" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: "未払い", color: "bg-yellow-100 text-yellow-800" },
      completed: { text: "支払済み", color: "bg-green-100 text-green-800" },
      paid: { text: "支払済み", color: "bg-green-100 text-green-800" },
      failed: { text: "支払い失敗", color: "bg-red-100 text-red-800" },
      refunded: { text: "返金済み", color: "bg-gray-100 text-gray-800" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleCancelReservation = () => {
    setShowCancelModal(true);
  };

  const executeCancelReservation = async () => {
    if (!reservation) return;

    const success = await cancelReservation(
      reservation.id,
      "ユーザーによるキャンセル"
    );
    if (success) {
      addToast({
        type: "success",
        title: "予約をキャンセルしました",
        message: "予約のキャンセルが完了しました。",
      });
      setShowCancelModal(false);
      router.push("/reservations");
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    console.log("=== handlePaymentSuccess 開始 ===");
    console.log("Payment successful:", paymentId);
    console.log("現在の reservation:", reservation);

    // 支払いモーダルを閉じる
    console.log("支払いモーダルを閉じます");
    setShowPaymentForm(false);
    setPaymentError(null);

    // 決済成功データを保存
    console.log("決済成功データを保存します");
    setPaymentSuccessData({
      paymentId,
      amount: reservation?.total_amount || 0,
    });

    // 決済完了モーダルを表示
    console.log("決済完了モーダルを表示します");
    setShowPaymentSuccessModal(true);

    // 支払いステータスを直接更新（即座に反映）
    console.log("支払いステータスを直接更新します");
    updatePaymentStatus("completed", "card", paymentId);

    // 予約データを再取得して最新の支払い状態を反映
    if (refetch) {
      console.log("予約データを再取得します");
      await refetch();
      console.log("予約データ再取得完了");
    }
    console.log("=== handlePaymentSuccess 完了 ===");
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handlePaymentSuccessModalClose = () => {
    setShowPaymentSuccessModal(false);
    setPaymentSuccessData(null);
  };

  // 過去の予約かどうかを判定する関数
  const isPastReservation = (reservation: any) => {
    const now = new Date();
    const returnDate = new Date(reservation.return_datetime);
    return returnDate < now;
  };

  // 将来の予約かどうかを判定する関数
  const isFutureReservation = (reservation: any) => {
    const now = new Date();
    const pickupDate = new Date(reservation.pickup_datetime);
    return pickupDate > now;
  };

  // 認証チェック中
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合はリダイレクト中表示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-lg">
            ログインページにリダイレクト中...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  戻る
                </button>
                <h1 className="text-2xl font-bold text-gray-900">予約詳細</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  戻る
                </button>
                <h1 className="text-2xl font-bold text-gray-900">予約詳細</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">
              {error || "予約が見つかりません"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                戻る
              </button>
              <h1 className="text-2xl font-bold text-gray-900">予約詳細</h1>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム - 予約情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 予約ヘッダー */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {reservation.vehicle
                      ? `${reservation.vehicle.make} ${reservation.vehicle.model}`
                      : "車両情報取得中"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    予約番号: {reservation.confirmation_number}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(reservation.status)}
                  {reservation.status !== "cancelled" &&
                    getPaymentStatusBadge(reservation.payment_status)}
                </div>
              </div>

              {/* 車両画像 */}
              {reservation.vehicle?.image_filename && (
                <div className="mb-4">
                  <img
                    src={`/assets/images/cars/${reservation.vehicle.image_filename}`}
                    alt={`${reservation.vehicle.make} ${reservation.vehicle.model}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* 日時情報 */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                レンタル期間
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      借り出し
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(reservation.pickup_datetime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">返却</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(reservation.return_datetime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 店舗情報 */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                店舗情報
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      借り出し店舗
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservation.pickup_store?.name || "店舗情報取得中"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservation.pickup_store?.address || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      返却店舗
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservation.return_store?.name || "店舗情報取得中"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservation.return_store?.address || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 特別要望 */}
            {reservation.special_requests && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  特別要望
                </h3>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {reservation.special_requests}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 右カラム - 料金・アクション */}
          <div className="space-y-6">
            {/* 料金詳細 */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                料金詳細
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">基本料金</span>
                  <span className="text-sm font-medium">
                    {formatPrice(reservation.total_amount)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>合計金額</span>
                  <span className="text-lg text-blue-600">
                    {formatPrice(reservation.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                アクション
              </h3>
              <div className="space-y-3">
                {/* 支払いボタン - 未払いかつ過去の予約でなく、キャンセル済みでない場合のみ表示 */}
                {(reservation.payment_status === "pending" ||
                  reservation.payment_status === null) &&
                  !isPastReservation(reservation) &&
                  reservation.status !== "cancelled" && (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      支払いを行う
                    </button>
                  )}

                {/* 支払い済みの場合の情報表示 - 過去の予約でなく、キャンセル済みでない場合のみ表示 */}
                {reservation.payment_status === "completed" &&
                  !isPastReservation(reservation) &&
                  reservation.status !== "cancelled" && (
                    <div className="space-y-2">
                      <div className="w-full bg-green-50 border border-green-200 text-green-800 py-2 px-4 rounded-md text-center">
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        支払い済み
                      </div>
                      <button
                        onClick={() => router.push("/payments/history")}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        支払い履歴を確認
                      </button>
                    </div>
                  )}

                {/* キャンセル済み予約の情報表示 */}
                {reservation.status === "cancelled" && (
                  <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 py-2 px-4 rounded-md text-center">
                    この予約はキャンセルされました
                  </div>
                )}

                {/* キャンセルボタン - 将来の予約かつ支払い済みの場合のみ表示 */}
                {(reservation.status === "confirmed" ||
                  reservation.status === "pending") &&
                  isFutureReservation(reservation) &&
                  reservation.payment_status === "completed" && (
                    <button
                      onClick={handleCancelReservation}
                      className="w-full border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 py-2 px-4"
                    >
                      予約をキャンセル
                    </button>
                  )}

                {/* 予約一覧に戻る */}
                <button
                  onClick={() => router.push("/reservations")}
                  className="w-full border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 py-2 px-4"
                >
                  予約一覧に戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 支払いフォーム */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">支払い</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{paymentError}</p>
                </div>
              )}

              <PaymentForm
                reservationId={reservation.id}
                amount={reservation.total_amount}
                currency="JPY"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => setShowPaymentForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* キャンセル確認モーダル */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={executeCancelReservation}
        title="予約キャンセル"
        message="この予約をキャンセルしますか？この操作は取り消せません。"
        confirmText="キャンセルする"
        cancelText="やめる"
        variant="danger"
      />

      {/* 決済完了モーダル */}
      {showPaymentSuccessModal && paymentSuccessData && reservation && (
        <PaymentSuccessModal
          isOpen={showPaymentSuccessModal}
          onClose={handlePaymentSuccessModalClose}
          paymentId={paymentSuccessData.paymentId}
          reservationNumber={reservation.confirmation_number}
          amount={paymentSuccessData.amount}
          vehicleName={
            reservation.vehicle
              ? `${reservation.vehicle.make} ${reservation.vehicle.model}`
              : "車両情報取得中"
          }
          pickupDateTime={reservation.pickup_datetime}
          returnDateTime={reservation.return_datetime}
          pickupStore={reservation.pickup_store?.name || "店舗情報取得中"}
          returnStore={reservation.return_store?.name || "店舗情報取得中"}
        />
      )}
    </div>
  );
}

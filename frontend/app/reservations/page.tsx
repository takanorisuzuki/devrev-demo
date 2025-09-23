"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Car, MapPin, CreditCard, Filter } from "lucide-react";
import { useReservations } from "@/lib/hooks/useReservations";
import { useReservation } from "@/lib/hooks/useReservations";
import { Reservation } from "@/lib/api/reservations";
import { useAuthStore } from "@/lib/stores/auth";
import { formatJSTTime, formatJSTDate } from "@/lib/utils/time-management";
import ReservationDetailModal from "@/components/reservation-detail-modal";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";

export default function ReservationsPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user } = useAuthStore();
  const { addToast } = useToast();

  // ステータスフィルタ
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  // 予約詳細モーダル
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // キャンセル確認モーダル
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState<string | null>(
    null,
  );

  // 認証チェック
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login?redirect=/reservations");
      return;
    }

    // 管理者の場合は管理者ダッシュボードにリダイレクト
    if (hasHydrated && isAuthenticated && user?.role === "admin") {
      console.log(
        "Admin user accessing customer reservations page, redirecting to admin dashboard",
      );
      router.push("/admin/dashboard");
      return;
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // 実API統合（認証済みの場合のみ）
  const { reservations, loading, error, fetchReservations, cancelReservation } =
    useReservations({
      status: statusFilter as any,
    });

  // 選択された予約の詳細取得
  const { reservation: selectedReservation, loading: detailLoading } =
    useReservation(selectedReservationId);

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

  // キャンセル処理
  const handleCancelReservation = (id: string) => {
    setCancelReservationId(id);
    setShowCancelModal(true);
  };

  const executeCancelReservation = async () => {
    if (!cancelReservationId) return;

    const success = await cancelReservation(
      cancelReservationId,
      "ユーザーによるキャンセル",
    );
    if (success) {
      addToast({
        type: "success",
        title: "予約をキャンセルしました",
        message: "予約のキャンセルが完了しました。",
      });
      setShowCancelModal(false);
      setCancelReservationId(null);
      // 予約一覧を再取得
      fetchReservations({ status: statusFilter as any });
    }
  };

  // ステータス変更時にデータを再取得
  const handleStatusFilterChange = (status: string | undefined) => {
    setStatusFilter(status);
    fetchReservations({ status: status as any });
  };

  // 予約詳細を表示
  const handleViewDetail = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservationId(null);
  };

  // 決済成功時の処理
  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful:", paymentId);
    // 予約一覧を再取得
    fetchReservations({ status: statusFilter as any });
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
              <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
                <p className="text-gray-600 mt-1">
                  ご利用いただいている予約の確認・管理
                </p>
              </div>

              {/* ステータスフィルタ */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter || "all"}
                  onChange={(e) =>
                    handleStatusFilterChange(
                      e.target.value === "all" ? undefined : e.target.value,
                    )
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">すべて</option>
                  <option value="pending">予約中</option>
                  <option value="confirmed">確定</option>
                  <option value="active">利用中</option>
                  <option value="completed">完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              予約がありません
            </h3>
            <p className="text-gray-600">
              新しい予約を作成するには、車両検索ページからお選びください。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 予約一覧 */}
            <div className="grid gap-6">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-lg shadow border border-gray-200"
                >
                  <div className="p-6">
                    {/* ヘッダー */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.vehicle
                            ? `${reservation.vehicle.make} ${reservation.vehicle.model}`
                            : "車両情報取得中"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          予約番号: {reservation.confirmation_number}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(reservation.status)}
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(reservation.total_amount)}
                        </p>
                      </div>
                    </div>

                    {/* 詳細情報 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 日時情報 */}
                      <div className="space-y-3">
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
                            <p className="text-sm font-medium text-gray-900">
                              返却
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(reservation.return_datetime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 店舗情報 */}
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              借り出し店舗
                            </p>
                            <p className="text-sm text-gray-600">
                              {reservation.pickup_store?.name ||
                                "店舗情報取得中"}
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
                              {reservation.return_store?.name ||
                                "店舗情報取得中"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewDetail(reservation.id)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        詳細を見る
                      </button>
                      {(reservation.status === "confirmed" ||
                        reservation.status === "pending") && (
                        <button
                          onClick={() =>
                            handleCancelReservation(reservation.id)
                          }
                          className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          キャンセル
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* キャンセル確認モーダル */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReservationId(null);
        }}
        onConfirm={executeCancelReservation}
        title="予約キャンセル"
        message="この予約をキャンセルしますか？この操作は取り消せません。"
        confirmText="キャンセルする"
        cancelText="やめる"
        variant="danger"
      />

      {/* 予約詳細モーダル */}
      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCancel={handleCancelReservation}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Car,
  CreditCard,
  User,
  FileText,
} from "lucide-react";
import { 
  formatJSTTime, 
  formatJSTDate, 
  calculateRentalDurationDays 
} from "@/lib/utils/time-management";
import { Reservation } from "@/lib/api/reservations";
import PaymentForm from "./forms/payment-form";

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onPaymentSuccess?: (paymentId: string) => void;
}

export default function ReservationDetailModal({
  reservation,
  isOpen,
  onClose,
  onCancel,
  onPaymentSuccess,
}: ReservationDetailModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen || !reservation) return null;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${formatJSTDate(date)} ${formatJSTTime(date)}`;
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "¥0";
    }
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

  const calculateDuration = () => {
    const pickup = new Date(reservation.pickup_datetime);
    const returnDate = new Date(reservation.return_datetime);
    return calculateRentalDurationDays(pickup, returnDate);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">予約詳細</h2>
              {getStatusBadge(reservation.status)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="p-6 space-y-8">
            {/* 予約基本情報 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  予約情報
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">予約番号</p>
                  <p className="text-lg font-mono text-gray-900">
                    {reservation.confirmation_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">予約日時</p>
                  <p className="text-lg text-gray-900">
                    {formatDateTime(reservation.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">利用期間</p>
                  <p className="text-lg text-gray-900">
                    {calculateDuration()}日間
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">予約者ID</p>
                  <p className="text-lg text-gray-900">
                    {reservation.customer_id}
                  </p>
                </div>
              </div>
            </div>

            {/* 車両情報 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  車両情報
                </h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  {reservation.vehicle?.image_url && (
                    <img
                      src={reservation.vehicle.image_url}
                      alt={`${reservation.vehicle.make} ${reservation.vehicle.model}`}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {reservation.vehicle
                        ? `${reservation.vehicle.make} ${reservation.vehicle.model}`
                        : "車両情報取得中"}
                    </h4>
                    {reservation.vehicle && (
                      <p className="text-gray-600 mb-1">
                        カテゴリー: {reservation.vehicle.category}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      車両ID: {reservation.vehicle_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 日時・場所情報 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  利用日時・場所
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 借り出し */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">借り出し</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-green-600">日時</p>
                      <p className="text-lg font-medium text-green-900">
                        {formatDateTime(reservation.pickup_datetime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">店舗</p>
                      <p className="font-medium text-green-900">
                        {reservation.pickup_store?.name || "店舗情報取得中"}
                      </p>
                      <p className="text-sm text-green-700">
                        {reservation.pickup_store?.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 返却 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">返却</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">日時</p>
                      <p className="text-lg font-medium text-blue-900">
                        {formatDateTime(reservation.return_datetime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">店舗</p>
                      <p className="font-medium text-blue-900">
                        {reservation.return_store?.name || "店舗情報取得中"}
                      </p>
                      <p className="text-sm text-blue-700">
                        {reservation.return_store?.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 料金情報 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  料金詳細
                </h3>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">基本料金</span>
                    <span className="text-gray-900">
                      {formatPrice(
                        reservation.total_amount - reservation.tax_amount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">消費税</span>
                    <span className="text-gray-900">
                      {formatPrice(reservation.tax_amount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        合計金額
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(reservation.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* オプション */}
            {reservation.options &&
              Object.keys(reservation.options).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    追加オプション
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {Object.entries(reservation.options).map(([key, value]) => {
                        const optionLabels: Record<string, string> = {
                          gps: "カーナビ",
                          insurance: "任意保険",
                          child_seat: "チャイルドシート"
                        };
                        const label = optionLabels[key] || key;
                        const status = value ? "あり" : "なし";
                        const statusColor = value ? "text-green-600" : "text-gray-500";
                        
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-gray-700">{label}</span>
                            <span className={`font-medium ${statusColor}`}>
                              {status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* 決済フォーム */}
          {showPaymentForm && (
            <div className="border-t border-gray-200 px-6 py-4">
              <PaymentForm
                reservationId={reservation.id}
                amount={reservation.total_amount}
                currency="JPY"
                onSuccess={(paymentId) => {
                  setShowPaymentForm(false);
                  setPaymentError(null);
                  onPaymentSuccess?.(paymentId);
                  onClose();
                }}
                onError={(error) => {
                  setPaymentError(error);
                }}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setPaymentError(null);
                }}
              />
              {paymentError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                閉じる
              </button>

              {/* 決済ボタン */}
              {(reservation.status === "confirmed" ||
                reservation.status === "pending") &&
                !reservation.payment_status &&
                !showPaymentForm && (
                  <button
                    onClick={() => setShowPaymentForm(true)}
                    className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    決済する
                  </button>
                )}

              {/* キャンセルボタン */}
              {(reservation.status === "confirmed" ||
                reservation.status === "pending") &&
                onCancel && (
                  <button
                    onClick={() => {
                      onCancel(reservation.id);
                      onClose();
                    }}
                    className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    予約をキャンセル
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

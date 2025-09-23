"use client";

import React from "react";
import { CheckCircle, CreditCard, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  reservationNumber: string;
  amount: number;
  vehicleName: string;
  pickupDateTime: string;
  returnDateTime: string;
  pickupStore: string;
  returnStore: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  paymentId,
  reservationNumber,
  amount,
  vehicleName,
  pickupDateTime,
  returnDateTime,
  pickupStore,
  returnStore,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString("ja-JP")} ${date.toLocaleTimeString(
      "ja-JP",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              決済完了
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              お支払いが正常に完了しました
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 決済情報 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">決済情報</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">決済ID:</span>
                  <span className="font-mono text-green-800">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">予約番号:</span>
                  <span className="font-mono text-green-800">
                    {reservationNumber}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-green-700">決済金額:</span>
                  <span className="text-green-800">{formatPrice(amount)}</span>
                </div>
              </div>
            </div>

            {/* 予約詳細 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">予約詳細</h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="w-4 h-4 text-gray-400 mt-0.5 mr-2">🚗</div>
                  <div>
                    <span className="text-gray-600">車両:</span>
                    <span className="ml-2 font-medium">{vehicleName}</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-600">借り出し:</span>
                    <span className="ml-2">
                      {formatDateTime(pickupDateTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-600">返却:</span>
                    <span className="ml-2">
                      {formatDateTime(returnDateTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-600">店舗:</span>
                    <span className="ml-2">{pickupStore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                予約詳細に戻る
              </Button>
              <Button
                onClick={() => (window.location.href = "/reservations")}
                variant="outline"
                className="flex-1"
              >
                予約一覧へ
              </Button>
            </div>

            {/* 注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-800">
                <strong>ご注意:</strong> 決済完了メールが送信されました。
                予約当日は身分証明書をお忘れなくご持参ください。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

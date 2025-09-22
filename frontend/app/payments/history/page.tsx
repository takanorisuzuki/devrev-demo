"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Calendar, Car, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { getPaymentHistoryApi, PaymentHistoryItem } from "@/lib/api/payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatJSTDate } from "@/lib/utils/time-management";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user } = useAuthStore();
  
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login?redirect=/payments/history");
      return;
    }

    // 管理者の場合は管理者ダッシュボードにリダイレクト
    if (hasHydrated && isAuthenticated && user?.role === "admin") {
      console.log('Admin user accessing customer payment history page, redirecting to admin dashboard');
      router.push("/admin/dashboard");
      return;
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // 決済履歴取得
  const fetchPaymentHistory = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPaymentHistoryApi(pageNum, 20);
      
      if (append) {
        setPayments(prev => [...prev, ...response.payments]);
      } else {
        setPayments(response.payments);
      }
      
      setTotal(response.total);
      setHasMore(response.payments.length === 20);
      setPage(pageNum);
    } catch (err: any) {
      console.error("Payment History Error:", err);
      setError(err.message || "決済履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentHistory(1, false);
    }
  }, [isAuthenticated]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchPaymentHistory(page + 1, true);
    }
  };

  const handleRefresh = () => {
    fetchPaymentHistory(1, false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", text: "完了" },
      failed: { color: "bg-red-100 text-red-800", text: "失敗" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "処理中" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = "JPY") => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatJSTDate(date);
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
          <p className="text-gray-700 text-lg">ログインページにリダイレクト中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">決済履歴</h1>
                  <p className="text-sm text-gray-600">過去の決済履歴を確認できます</p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && payments.length === 0 ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  再試行
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  決済履歴がありません
                </h3>
                <p className="text-gray-600 mb-4">
                  まだ決済履歴がありません。予約を作成して決済を行うと、ここに履歴が表示されます。
                </p>
                <Button onClick={() => router.push("/reservations")}>
                  予約一覧を見る
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.payment_id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {payment.vehicle_name || "車両情報なし"}
                        </h3>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>決済ID: {payment.payment_id}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(payment.created_at)}</span>
                        </div>
                        
                        {payment.pickup_date && (
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>受取: {formatJSTDate(new Date(payment.pickup_date))}</span>
                          </div>
                        )}
                        
                        {payment.return_date && (
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>返却: {formatJSTDate(new Date(payment.return_date))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.payment_method}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "読み込み中..." : "さらに読み込む"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  RefreshCw,
  ArrowLeft,
  Filter,
  Search,
  DollarSign,
  Calendar,
  Car,
  User,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useAuthStore, useIsAdmin } from "@/lib/stores/auth";
import { formatJSTDate } from "@/lib/utils/time-management";
import {
  getAdminPaymentHistoryApi,
  processRefundApi,
  PaymentHistoryItem,
  RefundRequest,
} from "@/lib/api/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { refundSchema, RefundFormData } from "@/lib/validations/payments";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const isAdmin = useIsAdmin();

  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRefundForm, setShowRefundForm] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);

  // 認証チェック
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login?redirect=/admin/payments");
    } else if (hasHydrated && !isAdmin) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isAdmin, router]);

  // 決済履歴取得
  const fetchPaymentHistory = async (
    pageNum: number = 1,
    append: boolean = false,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const skip = (pageNum - 1) * 20;
      const response = await getAdminPaymentHistoryApi(skip, 20);

      if (append) {
        setPayments((prev) => [...prev, ...response.payments]);
      } else {
        setPayments(response.payments);
      }

      setTotal(response.total_count);
      setHasMore(response.payments.length === 20);
      setPage(pageNum);
    } catch (err: any) {
      console.error("Admin Payment History Error:", err);
      setError(err.message || "決済履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchPaymentHistory(1, false);
    }
  }, [isAuthenticated, isAdmin]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchPaymentHistory(page + 1, true);
    }
  };

  const handleRefresh = () => {
    fetchPaymentHistory(1, false);
  };

  const handleRefund = async (
    paymentId: string,
    refundData: RefundFormData,
  ) => {
    setRefundLoading(paymentId);
    try {
      await processRefundApi(paymentId, {
        ...refundData,
        reason: refundData.reason || "Admin refund",
      } as any);
      setShowRefundForm(null);
      // 決済履歴を再取得
      fetchPaymentHistory(1, false);
    } catch (err: any) {
      console.error("Refund Error:", err);
      setError(err.message || "返金処理に失敗しました");
    } finally {
      setRefundLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", text: "完了" },
      failed: { color: "bg-red-100 text-red-800", text: "失敗" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "処理中" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
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

  // 未認証または管理者でない場合はリダイレクト中表示
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-lg">
            適切なページにリダイレクト中...
          </p>
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    管理者決済管理
                  </h1>
                  <p className="text-sm text-gray-600">
                    全決済履歴の確認と返金処理
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="決済ID、予約IDで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  更新
                </Button>
              </div>
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
                  まだ決済履歴がありません。顧客が予約を決済すると、ここに履歴が表示されます。
                </p>
                <Button onClick={() => router.push("/admin/dashboard")}>
                  管理者ダッシュボードに戻る
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

                      {/* 顧客情報 */}
                      {payment.customer_name && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {payment.customer_name}
                            </span>
                          </div>
                          <div className="text-sm text-blue-700">
                            {payment.customer_email} (ID: {payment.customer_id})
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>決済ID: {payment.payment_id}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(payment.created_at)}</span>
                        </div>

                        {payment.store_name && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>店舗: {payment.store_name}</span>
                          </div>
                        )}

                        {payment.pickup_datetime && (
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>
                              受取:{" "}
                              {formatJSTDate(new Date(payment.pickup_datetime))}
                            </span>
                          </div>
                        )}

                        {payment.return_datetime && (
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>
                              返却:{" "}
                              {formatJSTDate(new Date(payment.return_datetime))}
                            </span>
                          </div>
                        )}

                        {payment.failure_reason && (
                          <div className="col-span-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 font-medium">
                                失敗理由: {payment.failure_reason}
                              </span>
                            </div>
                            {payment.failure_code && (
                              <div className="ml-6 text-sm text-red-500">
                                エラーコード: {payment.failure_code}
                              </div>
                            )}
                            {payment.failure_details && (
                              <div className="ml-6 text-sm text-red-600 bg-red-50 p-2 rounded">
                                {payment.failure_details}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.payment_method}
                      </div>
                      {payment.payment_status === "completed" && (
                        <Button
                          onClick={() => setShowRefundForm(payment.payment_id)}
                          variant="outline"
                          size="sm"
                          disabled={refundLoading === payment.payment_id}
                        >
                          {refundLoading === payment.payment_id
                            ? "処理中..."
                            : "返金"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 返金フォーム */}
                  {showRefundForm === payment.payment_id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <RefundForm
                        paymentId={payment.payment_id}
                        amount={payment.amount}
                        onSubmit={(refundData) =>
                          handleRefund(payment.payment_id, refundData)
                        }
                        onCancel={() => setShowRefundForm(null)}
                        loading={refundLoading === payment.payment_id}
                      />
                    </div>
                  )}
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

// 返金フォームコンポーネント
interface RefundFormProps {
  paymentId: string;
  amount: number;
  onSubmit: (data: RefundFormData) => void;
  onCancel: () => void;
  loading: boolean;
}

function RefundForm({
  paymentId,
  amount,
  onSubmit,
  onCancel,
  loading,
}: RefundFormProps) {
  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: "",
      amount: amount,
    },
  });

  const handleSubmit = (data: RefundFormData) => {
    onSubmit(data);
  };

  const formatCurrency = (amount: number, currency: string = "JPY") => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-lg font-medium text-gray-900 mb-4">返金処理</h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>返金理由</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="返金理由を入力してください"
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>返金金額</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max={amount}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-600">
                  最大返金金額: {formatCurrency(amount)}
                </p>
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "返金処理中..." : "返金を実行"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

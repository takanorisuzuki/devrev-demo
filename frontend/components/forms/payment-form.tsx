"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Eye, EyeOff, AlertCircle } from "lucide-react";

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
// Select components are not available, using native select instead
import { paymentSchema, PaymentFormData } from "@/lib/validations/payments";
import { cardInfoSchema, CardInfoFormData } from "@/lib/validations/payments";
import { processPaymentApi, generateIdempotencyKey } from "@/lib/api/payments";
import { useError } from "@/lib/contexts/error-context";

// テスト用カード情報
const TEST_CARDS = [
  {
    name: "成功",
    number: "4000000000000001",
    expiryMonth: "12",
    expiryYear: "2025",
    cvv: "123",
    holderName: "TARO YAMADA",
    description: "決済が成功するカード",
  },
  {
    name: "失敗",
    number: "4000000000000002",
    expiryMonth: "12",
    expiryYear: "2025",
    cvv: "123",
    holderName: "TARO YAMADA",
    description: "決済が失敗するカード",
  },
  {
    name: "拒否",
    number: "4000000000000003",
    expiryMonth: "12",
    expiryYear: "2025",
    cvv: "123",
    holderName: "TARO YAMADA",
    description: "決済が拒否されるカード",
  },
];

interface PaymentFormProps {
  reservationId: string;
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({
  reservationId,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const { showError } = useError();

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: "card",
      amount: amount,
      currency: currency,
    },
  });

  const cardForm = useForm<CardInfoFormData>({
    resolver: zodResolver(cardInfoSchema),
    defaultValues: {
      card_number: "",
      expiry_month: "",
      expiry_year: "",
      cvv: "",
      cardholder_name: "",
    },
  });

  const paymentMethod = paymentForm.watch("payment_method");

  const onSubmit = async (data: PaymentFormData) => {
    console.log("=== 決済フォーム送信開始 ===");
    console.log("PaymentFormData:", data);
    console.log("ReservationId:", reservationId);
    console.log("Amount:", amount);
    console.log("Currency:", currency);
    console.log("onSuccess callback:", typeof onSuccess);
    console.log("onError callback:", typeof onError);

    setIsLoading(true);
    onError("");

    // 実際の決済APIを呼び出すように戻す
    console.log("実際の決済APIを呼び出します");

    try {
      let cardToken = "tok_success"; // デフォルトは成功トークン

      // カード決済の場合、カード情報を検証
      if (data.payment_method === "card") {
        // カード情報のバリデーションを実行
        const cardValidation = await cardForm.trigger();
        if (!cardValidation) {
          console.error("カード情報のバリデーションエラー");
          onError("カード情報を正しく入力してください");
          setIsLoading(false);
          return;
        }

        const cardData = cardForm.getValues();
        console.log("カード情報:", cardData);

        // モック検証：特定のカード番号で失敗をシミュレート
        if (cardData.card_number === "4000000000000002") {
          cardToken = "tok_failed_card";
        } else if (cardData.card_number === "4000000000000003") {
          cardToken = "tok_declined_card";
        }
      }

      const idempotencyKey = generateIdempotencyKey();
      console.log("決済API呼び出し:", {
        reservationId,
        paymentData: {
          ...data,
          card_token: data.payment_method === "card" ? cardToken : undefined,
        },
        idempotencyKey,
      });

      const response = await processPaymentApi(
        reservationId,
        {
          ...data,
          payment_method: data.payment_method || "card",
          amount: data.amount || 0,
          card_token: data.payment_method === "card" ? cardToken : undefined,
        } as any,
        idempotencyKey,
      );

      console.log("決済成功:", response);
      console.log("onSuccess を呼び出します:", response.payment_id);
      onSuccess(response.payment_id);
      console.log("onSuccess 呼び出し完了");
    } catch (err: any) {
      console.error("Payment Error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      const errorMessage =
        err.response?.data?.detail || err.message || "決済処理に失敗しました";
      onError(errorMessage);
      showError(err, "Payment");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = "JPY") => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // テスト用カード情報を入力する関数
  const fillTestCard = (testCard: (typeof TEST_CARDS)[0]) => {
    cardForm.setValue("card_number", testCard.number);
    cardForm.setValue("expiry_month", testCard.expiryMonth);
    cardForm.setValue("expiry_year", testCard.expiryYear);
    cardForm.setValue("cvv", testCard.cvv);
    cardForm.setValue("cardholder_name", testCard.holderName);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>決済情報</span>
          </CardTitle>
          <CardDescription>
            予約の決済を行います。決済金額: {formatCurrency(amount, currency)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={paymentForm.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>決済方法</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="card">クレジットカード</option>
                        <option value="cash">現金</option>
                        <option value="bank_transfer">銀行振込</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentMethod === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">カード情報</CardTitle>
                    <CardDescription>
                      テスト用のカード情報を入力してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        テスト用カード情報（ワンクリック入力）
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {TEST_CARDS.map((testCard) => (
                          <button
                            key={testCard.name}
                            type="button"
                            onClick={() => fillTestCard(testCard)}
                            className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                              testCard.name === "成功"
                                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                : testCard.name === "失敗"
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                  : "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                            }`}
                            title={testCard.description}
                          >
                            {testCard.name}: {testCard.number}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Form {...cardForm}>
                      <FormField
                        control={cardForm.control}
                        name="card_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>カード番号</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showCardNumber ? "text" : "password"}
                                  placeholder="1234567890123456"
                                  maxLength={16}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowCardNumber(!showCardNumber)
                                  }
                                >
                                  {showCardNumber ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={cardForm.control}
                          name="expiry_month"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>有効期限（月）</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MM"
                                  maxLength={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={cardForm.control}
                          name="expiry_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>有効期限（年）</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="YYYY"
                                  maxLength={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={cardForm.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showCVV ? "text" : "password"}
                                    placeholder="123"
                                    maxLength={4}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowCVV(!showCVV)}
                                  >
                                    {showCVV ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={cardForm.control}
                          name="cardholder_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>カード名義</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="TARO YAMADA" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">テスト用カード情報</p>
                    <ul className="space-y-1">
                      <li>• 成功: 4000000000000001</li>
                      <li>• 失敗: 4000000000000002</li>
                      <li>• 拒否: 4000000000000003</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  onClick={(e) => {
                    console.log("=== 決済確定ボタンクリック ===");
                    console.log("Event:", e);
                    console.log("Form valid:", paymentForm.formState.isValid);
                    console.log("Form errors:", paymentForm.formState.errors);
                    console.log("Form values:", paymentForm.getValues());

                    // フォームの送信を強制実行
                    e.preventDefault();
                    const formData = paymentForm.getValues();
                    console.log("手動でonSubmitを呼び出します");
                    onSubmit(formData);
                  }}
                >
                  {isLoading ? "決済処理中..." : "決済を確定"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

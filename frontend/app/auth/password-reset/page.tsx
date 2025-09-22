"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

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
import { passwordResetSchema, PasswordResetFormData } from "@/lib/validations/auth";
import { requestPasswordResetApi } from "@/lib/api/auth";

export default function PasswordResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordResetApi(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(err.message || "パスワードリセットの送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="mt-2 text-2xl font-bold text-gray-900">
                メールを送信しました
              </CardTitle>
              <CardDescription>
                パスワードリセット用のメールを送信しました。
                <br />
                メール内のリンクをクリックして、新しいパスワードを設定してください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>メールが届かない場合は、以下をご確認ください：</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>迷惑メールフォルダを確認してください</li>
                  <li>メールアドレスが正しいか確認してください</li>
                  <li>数分待ってから再度お試しください</li>
                </ul>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  別のメールアドレスで再送信
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  ログインページに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
                className="p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  パスワードリセット
                </CardTitle>
                <CardDescription>
                  登録されているメールアドレスを入力してください。
                  パスワードリセット用のリンクを送信します。
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@driverev.jp"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "送信中..." : "リセット用メールを送信"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                パスワードを覚えている場合は{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ログインページ
                </Link>
                に戻ってください
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

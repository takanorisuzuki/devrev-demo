"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, LogIn, User, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { loginApi } from "@/lib/api/auth";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // リダイレクト処理の共通関数
  const handleRedirect = (loginData: any) => {
    const redirectTo = searchParams.get("redirect");

    if (redirectTo) {
      // リダイレクトパラメータがある場合はそのページに移動
      router.push(redirectTo);
    } else {
      // リダイレクトパラメータがない場合はユーザーの役割に応じてダッシュボードにリダイレクト
      if (loginData.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // バックエンドAPIを使用した実際の認証
      const loginData = await loginApi(form);

      // Zustandストアにログイン情報を保存
      login(loginData);

      // リダイレクト処理
      handleRedirect(loginData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // バックエンドAPIを使用した実際の認証
      const loginData = await loginApi({
        email,
        password,
      });

      // Zustandストアにログイン情報を保存
      login(loginData);

      // リダイレクト処理
      handleRedirect(loginData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">DriveRev</h1>
          </div>
          <p className="text-sm text-gray-600">
            デモサイト - レンタカー予約サービス
          </p>
        </div>

        {/* デモサイト要件: テストアカウント情報表示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-3">
            🧪 デモ用テストアカウント
          </h3>
          <div className="space-y-2 text-xs text-blue-700">
            <div className="flex justify-between items-center">
              <span>
                <strong>管理者:</strong> admin@driverev.jp
              </span>
              <button
                onClick={() => quickLogin("admin@driverev.jp", "AdminPass123!")}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                クイックログイン
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>
                <strong>顧客1:</strong> customer1@example.com
              </span>
              <button
                onClick={() =>
                  quickLogin("customer1@example.com", "Customer123!")
                }
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                クイックログイン
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span>
                <strong>顧客2:</strong> customer2@example.com
              </span>
              <button
                onClick={() =>
                  quickLogin("customer2@example.com", "Customer456!")
                }
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                クイックログイン
              </button>
            </div>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <LogIn className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
            <p className="text-gray-600 mt-1">
              メールアドレスとパスワードを入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      ログインエラー
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                メールアドレス
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@driverev.jp"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                パスワード
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを入力"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  ログイン
                </>
              )}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{" "}
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                新規登録
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              パスワードを忘れた方は{" "}
              <button className="text-blue-600 hover:text-blue-800">
                パスワードリセット
              </button>
            </p>
          </div>
        </div>

        {/* デモサイト説明 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
            デモサイトについて
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• このサイトはデモンストレーション用です</p>
            <p>• 上記のテストアカウントでログインできます</p>
            <p>• 実際の予約・決済は行われません</p>
            <p>• 管理者アカウントで管理機能を体験できます</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

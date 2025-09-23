"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, LogOut, User } from "lucide-react";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useAuthStore } from "@/lib/stores/auth";
import { getDefaultSearchConditions } from "@/lib/utils/time-management";
import { useStores } from "@/lib/hooks/useStores";

export default function Navigation() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { stores } = useStores();

  // デバッグログ: 認証状態の変化を追跡
  React.useEffect(() => {
    console.log("Navigation Auth State:", {
      isAuthenticated,
      userEmail: user?.email,
      userRole: user?.role,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-8 h-8 text-driverev-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              <Link href="/">DriveRev</Link>
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              ホーム
            </Link>
            <button
              onClick={() => {
                // 統一された時間管理ユーティリティでデフォルト検索条件を設定
                const defaultConditions = getDefaultSearchConditions();

                // 東京駅店をデフォルト店舗として使用
                const tokyoStationStore = stores.find(
                  (store) => store.name === "東京駅店",
                );
                const defaultStoreId =
                  tokyoStationStore?.id ||
                  (stores.length > 0 ? stores[0].id : "");

                const searchParams = new URLSearchParams({
                  pickup_location: defaultStoreId,
                  return_location: defaultStoreId,
                  pickup_date: defaultConditions.pickupDate,
                  return_date: defaultConditions.returnDate,
                  pickup_time: defaultConditions.pickupTime,
                  return_time: defaultConditions.returnTime,
                });

                router.push(`/vehicles?${searchParams.toString()}`);
              }}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              車両検索
            </button>
            {/* 予約管理は認証済みユーザーのみ表示 */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                マイページ
              </Link>
            )}
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              お問い合わせ
            </a>

            {/* 言語切り替え */}
            <LanguageSwitcher />

            {/* 認証状態による条件分岐 */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={
                    user.role === "admin" ? "/admin/dashboard" : "/dashboard"
                  }
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block text-center"
              >
                ログイン
              </Link>
            )}
          </nav>

          {/* モバイル用メニューボタン (今後実装) */}
          <button className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            メニュー
          </button>
        </div>
      </div>
    </header>
  );
}

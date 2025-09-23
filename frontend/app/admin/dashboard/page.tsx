"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Car,
  Calendar,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  CreditCard,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCreateModal } from "@/components/admin/user-create-modal";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { UserDeleteModal } from "@/components/admin/user-delete-modal";
import { VehicleEditModal } from "@/components/admin/vehicle-edit-modal";
import { VehicleDeleteModal } from "@/components/admin/vehicle-delete-modal";
import { VehicleQuickRegistrationModal } from "@/components/admin/vehicle-quick-registration-modal";
import { StoreCreateModal } from "@/components/admin/store-create-modal";
import { StoreEditModal } from "@/components/admin/store-edit-modal";
import { StoreDeleteModal } from "@/components/admin/store-delete-modal";
import { SystemSettingsComponent } from "@/components/admin/system-settings";
import { useAuthStore, useIsAdmin } from "@/lib/stores/auth";
import { useToast } from "@/components/ui/toast";
import {
  reservationApi,
  GetAdminReservationsParams,
} from "@/lib/api/reservations";
import { adminApi, AdminStats } from "@/lib/api/admin";
import { formatJSTDate } from "@/lib/utils/time-management";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout, isLoading, token, hasHydrated } =
    useAuthStore();
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ認証チェックを実行
    if (typeof window === "undefined") {
      return;
    }

    // ハイドレーションが完了するまで待機
    if (!hasHydrated) {
      console.log("Waiting for hydration to complete...");
      return;
    }

    console.log("Admin Dashboard Auth Check:", {
      isAuthenticated,
      userEmail: user?.email,
      userRole: user?.role,
      hasToken: !!token,
      isLoading,
      hasHydrated,
    });

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    // 管理者でない場合は顧客ダッシュボードにリダイレクト
    if (user?.role !== "admin") {
      console.log("Not admin role, redirecting to customer dashboard");
      router.push("/dashboard");
      return;
    }

    console.log("Admin authentication successful");
  }, [isAuthenticated, user, hasHydrated]);

  // 統計データの取得
  useEffect(() => {
    if (!isAuthenticated || !user || !token || !isAdmin) {
      return;
    }

    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await adminApi.getStats();
        setStats(statsData);
      } catch (error) {
        console.error("統計データの取得に失敗しました:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated, user, token, isAdmin]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // デバッグ情報を出力
  console.log("Admin Dashboard Debug:", {
    isLoading,
    isAuthenticated,
    user: user?.email,
    role: user?.role,
  });

  // ハイドレーション中またはローディング中は表示
  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">
            {!hasHydrated ? "認証状態を確認中..." : "読み込み中..."}
          </p>
        </div>
      </div>
    );
  }

  // 認証されていない場合は何も表示しない（リダイレクト処理中）
  if (!isAuthenticated || !user || !token) {
    return null;
  }

  // 管理者でない場合は何も表示しない（リダイレクト処理中）
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 text-lg">管理者権限が必要です...</p>
          <p className="text-gray-500 text-sm mt-2">
            role: {user?.role || "null"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">管理メニュー</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  <SidebarButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    icon={BarChart3}
                  >
                    概要・統計
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "users"}
                    onClick={() => setActiveTab("users")}
                    icon={Users}
                  >
                    ユーザー管理
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "vehicles"}
                    onClick={() => setActiveTab("vehicles")}
                    icon={Car}
                  >
                    車両管理
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "reservations"}
                    onClick={() => setActiveTab("reservations")}
                    icon={Calendar}
                  >
                    予約管理
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "payments"}
                    onClick={() => setActiveTab("payments")}
                    icon={CreditCard}
                  >
                    決済管理
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "stores"}
                    onClick={() => setActiveTab("stores")}
                    icon={MapPin}
                  >
                    店舗管理
                  </SidebarButton>

                  <SidebarButton
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                    icon={Settings}
                  >
                    システム設定
                  </SidebarButton>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <OverviewContent stats={stats} statsLoading={statsLoading} />
            )}
            {activeTab === "users" && <UsersContent />}
            {activeTab === "vehicles" && <VehiclesContent />}
            {activeTab === "reservations" && <ReservationsContent />}
            {activeTab === "payments" && <PaymentsContent />}
            {activeTab === "stores" && <StoresContent />}
            {activeTab === "settings" && <SettingsContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

// サイドバーボタンコンポーネント
function SidebarButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2 text-sm font-medium text-left ${
        active
          ? "bg-green-50 text-green-700 border-r-2 border-green-700"
          : "text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon className="mr-3 h-4 w-4" />
      {children}
    </button>
  );
}

// 概要コンテンツ
function OverviewContent({
  stats,
  statsLoading,
}: {
  stats: AdminStats | null;
  statsLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">管理ダッシュボード</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="総ユーザー数"
          value={
            statsLoading
              ? "読み込み中..."
              : stats?.total_users?.toString() || "0"
          }
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="利用可能車両数"
          value={
            statsLoading
              ? "読み込み中..."
              : stats?.total_vehicles?.toString() || "0"
          }
          icon={Car}
          color="green"
        />
        <StatsCard
          title="今月の予約数"
          value={
            statsLoading
              ? "読み込み中..."
              : stats?.monthly_reservations?.toString() || "0"
          }
          icon={Calendar}
          color="orange"
        />
        <StatsCard
          title="総店舗数"
          value={
            statsLoading
              ? "読み込み中..."
              : stats?.total_stores?.toString() || "0"
          }
          icon={MapPin}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statsLoading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : stats?.recent_activities?.length ? (
              stats.recent_activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 pb-3 border-b last:border-b-0"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time_ago}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">アクティビティがありません</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ユーザー管理コンテンツ
function UsersContent() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);

      // Zustandストアからトークンを取得
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const response = await fetch(
        "http://localhost:8000/api/v1/admin/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("ユーザー一覧の取得に失敗しました");
      }

      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersError(
        error instanceof Error
          ? error.message
          : "ユーザー一覧の取得に失敗しました",
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = () => {
    // ユーザー一覧を再読み込み
    fetchUsers();
    setIsCreateModalOpen(false);
  };

  const handleUserUpdated = () => {
    // ユーザー一覧を再読み込み
    fetchUsers();
    setIsEditModalOpen(false);
  };

  const handleUserDeleted = () => {
    // ユーザー一覧を再読み込み
    fetchUsers();
    setIsDeleteModalOpen(false);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <Button
          className="flex items-center space-x-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span>新規ユーザー</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input placeholder="ユーザー名、メールアドレスで検索..." />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>フィルター</span>
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>登録済みのユーザーを管理できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役割
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      読み込み中...
                    </td>
                  </tr>
                ) : usersError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-red-500"
                    >
                      {usersError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      ユーザーが見つかりません
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "admin" ? "管理者" : "顧客"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.is_active ? "アクティブ" : "無効"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          削除
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 新規ユーザー作成モーダル */}
      <UserCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* ユーザー編集モーダル */}
      <UserEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* ユーザー削除モーダル */}
      <UserDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        user={selectedUser}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}

// 車両管理コンテンツ
function VehiclesContent() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuickRegistrationModal, setShowQuickRegistrationModal] =
    useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set(),
  );
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    make: "",
    is_available: "",
  });

  // 車両一覧を取得
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log("車両一覧を取得中...");

      // 管理者用APIを使用して車両データを取得（削除済み含む）
      const { getAdminVehicles } = await import("@/lib/api/vehicles");
      const data = await getAdminVehicles();

      console.log("取得した車両データ:", data);
      console.log("車両データ数:", data.length);
      setVehicles(data);
      console.log("vehicles state 更新後:", data);
    } catch (error) {
      console.error("車両一覧の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("VehiclesContent useEffect 実行");
    fetchVehicles();
  }, []);

  const handleVehicleCreated = async () => {
    await fetchVehicles(); // 一覧を再取得
  };

  const handleVehicleUpdated = async () => {
    await fetchVehicles(); // 一覧を再取得
  };

  const handleVehicleDeleted = async () => {
    await fetchVehicles(); // 一覧を再取得
  };

  // 一括削除のハンドラー
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      let successCount = 0;
      let errorCount = 0;

      // 選択された車両を順次削除
      for (const vehicleId of selectedVehicles) {
        try {
          const response = await fetch(
            `http://localhost:8000/api/v1/vehicles/${vehicleId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error(`車両ID ${vehicleId} の削除に失敗しました`);
          }
          successCount++;
        } catch (error) {
          console.error(`車両ID ${vehicleId} の削除エラー:`, error);
          errorCount++;
        }
      }

      // 選択状態をクリア
      setSelectedVehicles(new Set());
      setShowBulkDeleteModal(false);

      // 一覧を再取得
      await fetchVehicles();

      // 結果をトーストで表示
      if (errorCount === 0) {
        addToast({
          type: "success",
          title: "一括削除完了",
          message: `${successCount}台の車両を正常に削除しました`,
        });
      } else {
        addToast({
          type: "warning",
          title: "一部削除失敗",
          message: `${successCount}台削除成功、${errorCount}台削除失敗`,
        });
      }
    } catch (error) {
      console.error("一括削除に失敗しました:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "一括削除に失敗しました",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // チェックボックスのハンドラー
  const handleVehicleSelect = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  // 全選択/全解除のハンドラー
  const handleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map((v) => v.id)));
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filters.category && vehicle.category !== filters.category) return false;
    if (
      filters.make &&
      !vehicle.make.toLowerCase().includes(filters.make.toLowerCase())
    )
      return false;
    if (
      filters.is_available !== "" &&
      vehicle.is_available.toString() !== filters.is_available
    )
      return false;
    return true;
  });

  console.log("レンダリング時 - vehicles:", vehicles);
  console.log("レンダリング時 - filteredVehicles:", filteredVehicles);
  console.log("レンダリング時 - loading:", loading);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">車両管理</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQuickRegistrationModal(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600"
          >
            <Plus className="h-4 w-4" />
            クイック登録
          </Button>
          {selectedVehicles.size > 0 && (
            <Button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            >
              一括削除 ({selectedVehicles.size}台)
            </Button>
          )}
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">検索・フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">すべて</option>
                <option value="compact">コンパクト</option>
                <option value="standard">スタンダード</option>
                <option value="suv">SUV</option>
                <option value="premium">プレミアム</option>
                <option value="sports">スポーツ</option>
                <option value="electric">電気自動車</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メーカー
              </label>
              <Input
                placeholder="メーカー名で検索"
                value={filters.make}
                onChange={(e) =>
                  setFilters({ ...filters, make: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                利用可能
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.is_available}
                onChange={(e) =>
                  setFilters({ ...filters, is_available: e.target.value })
                }
              >
                <option value="">すべて</option>
                <option value="true">利用可能</option>
                <option value="false">利用不可</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 車両一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>車両一覧 ({filteredVehicles.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">車両データがありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedVehicles.size === filteredVehicles.length &&
                          filteredVehicles.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車両情報
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日額料金
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVehicles.has(vehicle.id)}
                          onChange={() => handleVehicleSelect(vehicle.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Car className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.year}年式
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {vehicle.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat("ja-JP", {
                          style: "currency",
                          currency: "JPY",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(parseFloat(vehicle.daily_rate))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {vehicle.is_available ? "利用可能" : "利用不可"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowEditModal(true);
                            }}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowDeleteModal(true);
                            }}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* モーダル */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                一括削除の確認
              </h3>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isBulkDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* メッセージ */}
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                選択された {selectedVehicles.size}{" "}
                台の車両を削除しますか？この操作は取り消せません。
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-800 mb-2">削除対象車両</h4>
                <div className="space-y-1 text-sm text-red-700">
                  <p>
                    <strong>選択台数:</strong> {selectedVehicles.size}台
                  </p>
                  <p>
                    <strong>対象車両ID:</strong>{" "}
                    {Array.from(selectedVehicles).join(", ")}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>注意:</strong>{" "}
                  車両を削除すると、その車両の予約履歴や関連データも影響を受ける可能性があります。
                </p>
              </div>
            </div>

            {/* フッター */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    削除中...
                  </>
                ) : (
                  "削除する"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <VehicleEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        vehicle={selectedVehicle}
        onVehicleUpdated={handleVehicleUpdated}
      />

      <VehicleDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        vehicle={selectedVehicle}
        onVehicleDeleted={handleVehicleDeleted}
      />

      <VehicleQuickRegistrationModal
        open={showQuickRegistrationModal}
        onOpenChange={setShowQuickRegistrationModal}
        onVehicleCreated={handleVehicleCreated}
      />
    </div>
  );
}

function ReservationsContent() {
  const { user, isAuthenticated } = useAuthStore();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    customer_email: "",
    vehicle_id: "",
  });

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      // デバッグ情報を出力
      console.log("Admin Dashboard - Loading reservations...");
      console.log("Auth state:", {
        isAuthenticated,
        user: user?.email,
        role: user?.role,
      });

      // 管理者用予約APIを呼び出し
      const params: GetAdminReservationsParams = {};
      if (filters.status) params.status = filters.status as any;
      if (filters.customer_email)
        params.customer_email = filters.customer_email;
      if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;

      console.log("API params:", params);
      const data = await reservationApi.getAdminReservations(params);
      console.log("API response:", data);
      setReservations(data);
    } catch (err) {
      console.error("Error loading reservations:", err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatJSTDate(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">エラーが発生しました</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={loadReservations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
        <div className="flex gap-2">
          <Button onClick={loadReservations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
        </div>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="pending">待機中</option>
                <option value="confirmed">確認済み</option>
                <option value="active">アクティブ</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                顧客メール
              </label>
              <Input
                placeholder="メールアドレスで検索"
                value={filters.customer_email}
                onChange={(e) =>
                  setFilters({ ...filters, customer_email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車両ID
              </label>
              <Input
                placeholder="車両IDで検索"
                value={filters.vehicle_id}
                onChange={(e) =>
                  setFilters({ ...filters, vehicle_id: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 予約一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>全予約一覧 ({reservations.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">予約データがありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      確認番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客情報
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車両
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.confirmation_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.customer ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.customer.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.customer.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {reservation.customer.phone_number}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.vehicle ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.vehicle.make}{" "}
                              {reservation.vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reservation.vehicle.category}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(reservation.pickup_datetime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          〜 {formatDate(reservation.return_datetime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(reservation.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(reservation.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StoresContent() {
  const [stores, setStores] = useState<any[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [filters, setFilters] = useState({
    prefecture: "",
    city: "",
    is_airport: "",
    is_station: "",
    is_active: "",
  });
  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  // 店舗一覧を取得
  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      setStoresError(null);

      const params: any = {};
      if (filters.prefecture) params.prefecture = filters.prefecture;
      if (filters.city) params.city = filters.city;
      if (filters.is_airport !== "")
        params.is_airport = filters.is_airport === "true";
      if (filters.is_station !== "")
        params.is_station = filters.is_station === "true";
      if (filters.is_active !== "")
        params.is_active = filters.is_active === "true";

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });

      const url = `http://localhost:8000/api/v1/admin/stores${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "店舗一覧の取得に失敗しました");
      }

      const data = await response.json();
      setStores(data.stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStoresError(
        error instanceof Error ? error.message : "店舗一覧の取得に失敗しました",
      );
    } finally {
      setStoresLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    if (token) {
      fetchStores();
    }
  }, [token]);

  // フィルター変更時の再読み込み
  useEffect(() => {
    if (token) {
      fetchStores();
    }
  }, [filters, token]);

  const handleCreateStore = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStore = (store: any) => {
    setSelectedStore(store);
    setIsEditModalOpen(true);
  };

  const handleDeleteStore = (store: any) => {
    setSelectedStore(store);
    setIsDeleteModalOpen(true);
  };

  const handleStoreCreated = () => {
    setIsCreateModalOpen(false);
    fetchStores();
  };

  const handleStoreUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedStore(null);
    fetchStores();
  };

  const handleStoreDeleted = () => {
    setIsDeleteModalOpen(false);
    setSelectedStore(null);
    fetchStores();
  };

  const filteredStores = stores;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">店舗管理</h1>
        <Button onClick={handleCreateStore} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新規店舗
        </Button>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            検索・フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="都道府県で検索"
                value={filters.prefecture}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    prefecture: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Input
                placeholder="市区町村で検索"
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, city: e.target.value }))
                }
              />
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.is_airport}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_airport: e.target.value,
                  }))
                }
              >
                <option value="">すべて</option>
                <option value="true">空港店舗のみ</option>
                <option value="false">空港店舗以外</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.is_station}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_station: e.target.value,
                  }))
                }
              >
                <option value="">すべて</option>
                <option value="true">駅店舗のみ</option>
                <option value="false">駅店舗以外</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.is_active}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, is_active: e.target.value }))
                }
              >
                <option value="">すべて</option>
                <option value="true">営業中のみ</option>
                <option value="false">休業中のみ</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 店舗一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>店舗一覧 ({filteredStores.length}件)</CardTitle>
          <CardDescription>登録済みの店舗を管理できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    店舗情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storesLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      読み込み中...
                    </td>
                  </tr>
                ) : storesError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-red-500"
                    >
                      {storesError}
                    </td>
                  </tr>
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      店舗が見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {store.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            コード: {store.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {store.prefecture} {store.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.address_line1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {store.phone || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {store.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {store.is_airport && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              空港店舗
                            </span>
                          )}
                          {store.is_station && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              駅店舗
                            </span>
                          )}
                          {!store.is_airport && !store.is_station && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              一般店舗
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            store.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {store.is_active ? "営業中" : "休業中"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStore(store)}
                          >
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStore(store)}
                            className="text-red-600 hover:text-red-700"
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* モーダル */}
      <StoreCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onStoreCreated={handleStoreCreated}
      />

      <StoreEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        store={selectedStore}
        onStoreUpdated={handleStoreUpdated}
      />

      <StoreDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        store={selectedStore}
        onStoreDeleted={handleStoreDeleted}
      />
    </div>
  );
}

function SettingsContent() {
  return <SystemSettingsComponent />;
}

// 統計カードコンポーネント
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div
            className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 決済管理コンテンツ
function PaymentsContent() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">決済管理</h2>
        <Button onClick={() => router.push("/admin/payments")}>
          詳細管理画面へ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="今日の決済"
          value="¥125,000"
          icon={CreditCard}
          color="green"
        />
        <StatsCard
          title="今月の決済"
          value="¥2,450,000"
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="成功率"
          value="98.5%"
          icon={BarChart3}
          color="green"
        />
        <StatsCard
          title="返金件数"
          value="3件"
          icon={RefreshCw}
          color="orange"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近の決済</CardTitle>
          <CardDescription>最新の決済履歴を表示しています</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">トヨタ プリウス</p>
                <p className="text-sm text-gray-600">決済ID: pay_1234567890</p>
              </div>
              <div className="text-right">
                <p className="font-bold">¥15,000</p>
                <p className="text-sm text-green-600">完了</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">ホンダ フィット</p>
                <p className="text-sm text-gray-600">決済ID: pay_0987654321</p>
              </div>
              <div className="text-right">
                <p className="font-bold">¥12,000</p>
                <p className="text-sm text-green-600">完了</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// サンプルデータ
const recentActivities = [
  { action: "新しいユーザーが登録しました: 田中 太郎", time: "5分前" },
  { action: "トヨタ プリウスが予約されました", time: "15分前" },
  { action: "渋谷店に新しい車両が追加されました", time: "1時間前" },
  { action: "システム設定が更新されました", time: "2時間前" },
  { action: "月次レポートが生成されました", time: "1日前" },
];

const sampleUsers = [
  {
    name: "System Administrator",
    email: "admin@driverev.jp",
    role: "admin",
    status: "active",
    createdAt: "2025-09-01",
  },
  {
    name: "田中 太郎",
    email: "customer1@example.com",
    role: "customer",
    status: "active",
    createdAt: "2025-09-02",
  },
  {
    name: "佐藤 花子",
    email: "customer2@example.com",
    role: "customer",
    status: "active",
    createdAt: "2025-09-03",
  },
];

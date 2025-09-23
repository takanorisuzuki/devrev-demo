import React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  role: "customer" | "admin" | "staff";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: User;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;

  // Actions
  login: (tokenData: AuthToken) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      // Actions
      login: (tokenData: AuthToken) => {
        set({
          user: tokenData.user,
          token: tokenData.access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ hasHydrated: hydrated });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Auth store rehydration error:", error);
          return;
        }
        if (state) {
          console.log("Auth store rehydrated:", {
            user: state.user?.email,
            role: state.user?.role,
            isAuthenticated: state.isAuthenticated,
            hasToken: !!state.token,
          });
          // ハイドレーション完了をマーク
          state.setHasHydrated(true);
          // ローディング状態をクリア
          state.setLoading(false);
        }
      },
    },
  ),
);

// ハイドレーション完了を監視するフック
export const useAuthHydration = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  React.useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      // ZustandのhasHydrated状態を監視
      if (hasHydrated) {
        setIsHydrated(true);
      } else {
        // フォールバック: 短いタイムアウトでハイドレーション完了を待つ
        const timer = setTimeout(() => {
          setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [hasHydrated]);

  return isHydrated;
};

// Utility functions for role checking
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === "admin";
};

export const useIsCustomer = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === "customer";
};

export const useIsStaff = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === "staff";
};

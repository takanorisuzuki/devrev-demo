/**
 * 店舗選択コンポーネント
 * 実際のAPIデータを使用した店舗プルダウン
 */

"use client";

import React from "react";
import { Store } from "@/lib/types/store";
import { useStores } from "@/lib/hooks/useStores";

interface StoreSelectorProps {
  value: string;
  onChange: (storeId: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showPrefecture?: boolean;
  showStoreType?: boolean;
}

export default function StoreSelector({
  value,
  onChange,
  placeholder = "店舗を選択",
  label,
  className = "",
  disabled = false,
  showPrefecture = true,
  showStoreType = true,
}: StoreSelectorProps) {
  const { stores, loading, error } = useStores();

  const formatStoreName = (store: Store) => {
    let name = store.name;

    if (showPrefecture && store.prefecture !== "東京都") {
      name = `${store.prefecture} ${name}`;
    }

    if (showStoreType) {
      const types = [];
      if (store.is_airport) types.push("✈️");
      if (store.is_station) types.push("🚃");
      if (types.length > 0) {
        name = `${types.join("")} ${name}`;
      }
    }

    return name;
  };

  // 店舗を地域・タイプ別にグループ化
  const groupedStores = stores.reduce(
    (groups, store) => {
      const prefecture = store.prefecture;
      if (!groups[prefecture]) {
        groups[prefecture] = [];
      }
      groups[prefecture].push(store);
      return groups;
    },
    {} as Record<string, Store[]>,
  );

  if (error) {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="w-full p-3 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm">
          店舗データの読み込みに失敗しました
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <select
        className={`w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="">{loading ? "読み込み中..." : placeholder}</option>

        {Object.entries(groupedStores).map(([prefecture, prefectureStores]) => (
          <optgroup key={prefecture} label={prefecture}>
            {prefectureStores.map((store) => (
              <option key={store.id} value={store.id}>
                {formatStoreName(store)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}

/**
 * シンプルな店舗選択（グループ化なし）
 */
export function SimpleStoreSelector({
  value,
  onChange,
  placeholder = "店舗を選択",
  label,
  className = "",
  disabled = false,
}: Omit<StoreSelectorProps, "showPrefecture" | "showStoreType">) {
  const { stores, loading, error } = useStores();

  if (error) {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="w-full p-3 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm">
          店舗データの読み込みに失敗しました
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <select
        className={`w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="">{loading ? "読み込み中..." : placeholder}</option>

        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}

/**
 * 店舗データ取得のReact Hook
 */

import { useState, useEffect } from "react";
import { Store } from "../types/store";
import { getActiveStores, getStoresByPrefecture } from "../api/stores";

/**
 * 営業中店舗一覧を取得するhook
 */
export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getActiveStores();
        setStores(data);
      } catch (err) {
        setError("店舗データの取得に失敗しました");
        console.error("useStores error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
}

/**
 * 都道府県別店舗を取得するhook
 */
export function useStoresByPrefecture(prefecture?: string) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prefecture) {
      setStores([]);
      return;
    }

    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStoresByPrefecture(prefecture);
        setStores(data);
      } catch (err) {
        setError("店舗データの取得に失敗しました");
        console.error("useStoresByPrefecture error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [prefecture]);

  return { stores, loading, error };
}

/**
 * 店舗検索用hook
 */
export function useStoreSearch() {
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初回読み込み
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getActiveStores();
        setAllStores(data);
        setFilteredStores(data);
      } catch (err) {
        setError("店舗データの取得に失敗しました");
        console.error("useStoreSearch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // フィルタリング関数
  const filterStores = (
    searchTerm: string,
    filterAirport?: boolean,
    filterStation?: boolean,
  ) => {
    let filtered = allStores;

    // テキスト検索
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(term) ||
          store.prefecture.toLowerCase().includes(term) ||
          store.city.toLowerCase().includes(term),
      );
    }

    // 空港フィルタ
    if (filterAirport !== undefined) {
      filtered = filtered.filter((store) => store.is_airport === filterAirport);
    }

    // 駅フィルタ
    if (filterStation !== undefined) {
      filtered = filtered.filter((store) => store.is_station === filterStation);
    }

    setFilteredStores(filtered);
  };

  return {
    allStores,
    filteredStores,
    loading,
    error,
    filterStores,
  };
}

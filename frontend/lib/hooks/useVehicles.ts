/**
 * useVehicles React Hook
 * 車両データの取得・状態管理
 */

import { useState, useEffect } from "react";
import { getVehicles, searchVehicles } from "@/lib/api/vehicles";
import { VehicleListResponse, VehicleSearchParams } from "@/lib/types/vehicle";

interface UseVehiclesResult {
  vehicles: VehicleListResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseVehiclesOptions {
  searchParams?: VehicleSearchParams;
  autoFetch?: boolean;
}

/**
 * 車両一覧データを管理するHook
 */
export function useVehicles(options: UseVehiclesOptions = {}): UseVehiclesResult {
  const { searchParams, autoFetch = true } = options;
  
  const [vehicles, setVehicles] = useState<VehicleListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getVehicles(searchParams);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "車両データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchVehicles();
    }
  }, [JSON.stringify(searchParams), autoFetch]);

  const refetch = () => {
    fetchVehicles();
  };

  return { vehicles, loading, error, refetch };
}

/**
 * 車両検索用Hook
 */
export function useVehicleSearch() {
  const [vehicles, setVehicles] = useState<VehicleListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchVehiclesByParams = async (
    category?: string,
    make?: string,
    fuelType?: string,
    minPrice?: number,
    maxPrice?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await searchVehicles(category, make, fuelType, minPrice, maxPrice);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "車両検索に失敗しました。");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setVehicles([]);
    setError(null);
  };

  return { 
    vehicles, 
    loading, 
    error, 
    searchVehicles: searchVehiclesByParams, 
    clearResults 
  };
}

/**
 * カテゴリ別車両取得Hook
 */
export function useVehiclesByCategory(category: string | null) {
  const searchParams = category ? { category, is_available: true } : undefined;
  
  return useVehicles({ 
    searchParams,
    autoFetch: !!category 
  });
}

/**
 * 価格帯別車両取得Hook  
 */
export function useVehiclesByPriceRange(minPrice?: number, maxPrice?: number) {
  const searchParams = (minPrice !== undefined || maxPrice !== undefined) 
    ? { min_price: minPrice, max_price: maxPrice, is_available: true }
    : undefined;
    
  return useVehicles({ 
    searchParams,
    autoFetch: !!(minPrice !== undefined || maxPrice !== undefined)
  });
}

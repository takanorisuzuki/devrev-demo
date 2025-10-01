// 車両関連APIクライアント
// バックエンドAPI統合用

import { apiClient } from "./client";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  daily_rate: number;
  is_available: boolean;
  image_filename: string;
  transmission: string;
  is_smoking_allowed: boolean;
  store: {
    id: string;
    name: string;
    address: string;
  };
}

export interface AvailableVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  daily_rate: number;
  image_filename: string;
  transmission: string;
  is_smoking_allowed: boolean;
  store_id: string;
  store_name: string;
  store_address: string;
}

export interface AvailabilitySearchRequest {
  start_date: string;
  end_date: string;
  store_id?: string;
  category?: string;
  make?: string;
  fuel_type?: string;
  min_price?: number;
  max_price?: number;
}

export interface AvailabilitySearchResponse {
  available_vehicles: AvailableVehicle[];
  total_count: number;
  search_criteria: AvailabilitySearchRequest;
  search_period_days: number;
}

// 車両一覧取得
export async function getVehicles(params?: {
  category?: string;
  make?: string;
  fuel_type?: string;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
  skip?: number;
  limit?: number;
}): Promise<Vehicle[]> {
  try {
    const response = await apiClient.get("/api/v1/vehicles/", { params });
    return response.data;
  } catch (error) {
    console.error("車両一覧取得エラー:", error);
    throw error;
  }
}

// 空車検索
export async function searchAvailableVehicles(
  searchRequest: AvailabilitySearchRequest,
): Promise<AvailabilitySearchResponse> {
  try {
    const response = await apiClient.post("/api/v1/vehicles/availability", searchRequest);
    return response.data;
  } catch (error) {
    console.error("空車検索エラー:", error);
    throw error;
  }
}

// 特定車両の詳細取得
export async function getVehicleById(vehicleId: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error("車両詳細取得エラー:", error);
    throw error;
  }
}

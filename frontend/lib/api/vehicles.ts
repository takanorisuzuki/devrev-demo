/**
 * Vehicle API クライアント
 * バックエンドのVehicle APIと通信
 */

import { apiClient } from "./client";
import {
  VehicleListResponse,
  Vehicle,
  VehicleSearchParams,
  VehicleCreate,
} from "../types/vehicle";

/**
 * 車両一覧を取得（一般ユーザー用 - 利用可能な車両のみ）
 */
export async function getVehicles(
  params?: VehicleSearchParams,
): Promise<VehicleListResponse[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/vehicles/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    console.log("Vehicle API Request URL:", url); // DEBUG

    const response = await apiClient.get(url);

    console.log("Vehicle API Response:", response.data); // DEBUG
    return response.data;
  } catch (error) {
    console.error("車両一覧の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 管理者用車両一覧を取得（全ての車両を表示）
 */
export async function getAdminVehicles(
  params?: VehicleSearchParams,
): Promise<VehicleListResponse[]> {
  try {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    // 管理者用は全ての車両を取得（利用可能・不可問わず表示）

    const url = `/api/v1/vehicles/${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    console.log("Admin Vehicle API Request URL:", url); // DEBUG
    const response = await apiClient.get(url);
    console.log("Admin Vehicle API Response:", response.data); // DEBUG
    return response.data;
  } catch (error) {
    console.error("管理者車両一覧の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 車両詳細を取得
 */
export async function getVehicle(vehicleId: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`車両詳細の取得に失敗しました (ID: ${vehicleId}):`, error);
    throw error;
  }
}

/**
 * 利用可能な車両一覧を取得（プルダウン用）
 */
export async function getAvailableVehicles(): Promise<VehicleListResponse[]> {
  return getVehicles({ is_available: true });
}

/**
 * カテゴリ別車両一覧を取得
 */
export async function getVehiclesByCategory(
  category: string,
): Promise<VehicleListResponse[]> {
  return getVehicles({ category, is_available: true });
}

/**
 * メーカー別車両一覧を取得
 */
export async function getVehiclesByMake(
  make: string,
): Promise<VehicleListResponse[]> {
  return getVehicles({ make, is_available: true });
}

/**
 * 価格帯別車両一覧を取得
 */
export async function getVehiclesByPriceRange(
  minPrice: number,
  maxPrice: number,
): Promise<VehicleListResponse[]> {
  return getVehicles({
    min_price: minPrice,
    max_price: maxPrice,
    is_available: true,
  });
}

/**
 * 車両検索（複数条件）
 */
export async function searchVehicles(
  category?: string,
  make?: string,
  fuelType?: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<VehicleListResponse[]> {
  return getVehicles({
    category,
    make,
    fuel_type: fuelType,
    min_price: minPrice,
    max_price: maxPrice,
    is_available: true,
  });
}

/**
 * 車両作成（管理者用）
 */
export async function createVehicle(
  vehicleData: VehicleCreate,
): Promise<Vehicle> {
  try {
    const response = await apiClient.post("/api/v1/vehicles/", vehicleData);
    return response.data;
  } catch (error) {
    console.error("車両の作成に失敗しました:", error);
    throw error;
  }
}

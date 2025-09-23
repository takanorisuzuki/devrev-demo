/**
 * 管理者車両管理APIクライアント
 * バックエンドの管理者専用Vehicle APIと通信
 */

import { apiClient } from './client';
import { 
  Vehicle, 
  VehicleCreate,
  VehicleUpdate,
  VehicleSearchParams
} from '../types/vehicle';

/**
 * 管理者用車両作成
 */
export async function createVehicle(vehicleData: VehicleCreate): Promise<Vehicle> {
  try {
    const response = await apiClient.post('/api/v1/vehicles/', vehicleData);
    return response.data;
  } catch (error) {
    console.error('車両作成に失敗しました:', error);
    throw error;
  }
}

/**
 * 管理者用車両更新
 */
export async function updateVehicle(vehicleId: string, vehicleData: VehicleUpdate): Promise<Vehicle> {
  try {
    const response = await apiClient.put(`/api/v1/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`車両更新に失敗しました (ID: ${vehicleId}):`, error);
    throw error;
  }
}

/**
 * 管理者用車両削除（論理削除）
 */
export async function deleteVehicle(vehicleId: string): Promise<{ message: string; vehicle_id: string; deleted_by: string }> {
  try {
    const response = await apiClient.delete(`/api/v1/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`車両削除に失敗しました (ID: ${vehicleId}):`, error);
    throw error;
  }
}

/**
 * 管理者用車両一覧取得（全車両、フィルタリング可能）
 */
export async function getAdminVehicles(params?: VehicleSearchParams): Promise<Vehicle[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/vehicles/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('管理者車両一覧の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 管理者用車両詳細取得
 */
export async function getAdminVehicle(vehicleId: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`管理者車両詳細の取得に失敗しました (ID: ${vehicleId}):`, error);
    throw error;
  }
}

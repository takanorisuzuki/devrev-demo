/**
 * 店舗API クライアント
 */

import { apiClient } from './client';
import { Store, StoreDetail, StoreSearchParams } from '../types/store';

/**
 * 店舗一覧を取得
 */
export async function getStores(params?: StoreSearchParams): Promise<Store[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/v1/stores${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log('API Request URL:', url); // DEBUG
    
    const response = await apiClient.get(url);
    
    console.log('API Response:', response.data); // DEBUG
    return response.data;
  } catch (error) {
    console.error('店舗一覧の取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 店舗詳細を取得
 */
export async function getStore(storeId: string): Promise<StoreDetail> {
  try {
    const response = await apiClient.get(`/api/v1/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(`店舗詳細の取得に失敗しました (ID: ${storeId}):`, error);
    throw error;
  }
}

/**
 * 営業中の店舗一覧を取得（プルダウン用）
 */
export async function getActiveStores(): Promise<Store[]> {
  return getStores({ is_active: true, limit: 100 });
}

/**
 * 都道府県別の店舗一覧を取得
 */
export async function getStoresByPrefecture(prefecture: string): Promise<Store[]> {
  return getStores({ prefecture, is_active: true });
}

/**
 * 空港店舗一覧を取得
 */
export async function getAirportStores(): Promise<Store[]> {
  return getStores({ is_airport: true, is_active: true });
}

/**
 * 駅店舗一覧を取得
 */
export async function getStationStores(): Promise<Store[]> {
  return getStores({ is_station: true, is_active: true });
}

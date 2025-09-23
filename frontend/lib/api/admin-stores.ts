/**
 * 管理者用店舗管理API
 */

import { Store, StoreDetail } from "@/lib/types/store";
import { apiClient } from "./client";

export interface AdminStoreListResponse {
  stores: Store[];
  total: number;
  pagination: {
    skip: number;
    limit: number;
    has_more: boolean;
  };
}

export interface AdminStoreCreateRequest {
  name: string;
  code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  is_airport: boolean;
  is_station: boolean;
  is_active: boolean;
}

export interface AdminStoreUpdateRequest {
  name?: string;
  code?: string;
  prefecture?: string;
  city?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  is_airport?: boolean;
  is_station?: boolean;
  is_active?: boolean;
}

export interface AdminStoreDeleteResponse {
  message: string;
  store_id: string;
}

class AdminStoreApi {
  private baseUrl = "/api/v1/admin/stores";

  async getStores(params?: {
    skip?: number;
    limit?: number;
    prefecture?: string;
    city?: string;
    is_airport?: boolean;
    is_station?: boolean;
    is_active?: boolean;
  }): Promise<AdminStoreListResponse> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  async getStore(storeId: string): Promise<StoreDetail> {
    const response = await apiClient.get(`${this.baseUrl}/${storeId}`);
    return response.data;
  }

  async createStore(storeData: AdminStoreCreateRequest): Promise<StoreDetail> {
    const response = await apiClient.post(this.baseUrl, storeData);
    return response.data;
  }

  async updateStore(
    storeId: string,
    storeData: AdminStoreUpdateRequest,
  ): Promise<StoreDetail> {
    const response = await apiClient.put(
      `${this.baseUrl}/${storeId}`,
      storeData,
    );
    return response.data;
  }

  async deleteStore(storeId: string): Promise<AdminStoreDeleteResponse> {
    const response = await apiClient.delete(`${this.baseUrl}/${storeId}`);
    return response.data;
  }
}

export const adminStoreApi = new AdminStoreApi();

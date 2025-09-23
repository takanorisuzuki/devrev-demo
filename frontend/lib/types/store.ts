/**
 * 店舗関連の型定義
 */

export interface Store {
  id: string;
  name: string;
  code: string;
  prefecture: string;
  city: string;
  is_airport: boolean;
  is_station: boolean;
  is_active: boolean;
}

export interface StoreDetail extends Store {
  address_line1: string;
  address_line2?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSearchParams {
  skip?: number;
  limit?: number;
  prefecture?: string;
  city?: string;
  is_airport?: boolean;
  is_station?: boolean;
  is_active?: boolean;
}

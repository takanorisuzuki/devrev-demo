/**
 * Vehicle関連の型定義
 * バックエンドのPydanticスキーマと対応
 */

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate?: string;
  category: string;
  class_type?: string;
  transmission?: string;
  fuel_type?: string;
  daily_rate: number;
  is_available: boolean;
  image_filename?: string;
  image_url?: string;
  is_smoking_allowed?: boolean;
  store_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleListResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  daily_rate: number;
  is_available: boolean;
  image_filename?: string;
  image_url?: string;
  transmission?: string;
  is_smoking_allowed?: boolean;
  store_id?: string;
}

export interface VehicleSearchParams {
  category?: string;
  make?: string;
  fuel_type?: string;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
  skip?: number;
  limit?: number;
}

export interface VehicleCreate {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  category: string;
  class_type: string;
  transmission: string;
  fuel_type: string;
  daily_rate: number;
  image_filename?: string;
}

export interface VehicleUpdate {
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  category?: string;
  class_type?: string;
  transmission?: string;
  fuel_type?: string;
  daily_rate?: number;
  is_available?: boolean;
  is_smoking_allowed?: boolean;
  image_filename?: string;
}

// 車両カテゴリの定数
export const VEHICLE_CATEGORIES = {
  compact: "コンパクト",
  standard: "スタンダード", 
  suv: "SUV",
  premium: "プレミアム",
  sports: "スポーツ",
  electric: "電気自動車",
  electric_suv: "電気SUV",
  convertible: "コンバーチブル",
  exotic: "エキゾチック",
  van: "バン・商用車"
} as const;

// 燃料タイプの定数
export const FUEL_TYPES = {
  gasoline: "ガソリン",
  electric: "電気",
  hybrid: "ハイブリッド",
  diesel: "ディーゼル"
} as const;

// トランスミッション
export const TRANSMISSIONS = {
  automatic: "オートマチック",
  manual: "マニュアル",
  cvt: "CVT"
} as const;

export type VehicleCategory = keyof typeof VEHICLE_CATEGORIES;
export type FuelType = keyof typeof FUEL_TYPES;
export type Transmission = keyof typeof TRANSMISSIONS;

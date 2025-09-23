// 車両関連APIクライアント
// バックエンドAPI統合用

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

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
  const searchParams = new URLSearchParams();
  
  if (params?.category) searchParams.set('category', params.category);
  if (params?.make) searchParams.set('make', params.make);
  if (params?.fuel_type) searchParams.set('fuel_type', params.fuel_type);
  if (params?.is_available !== undefined) searchParams.set('is_available', params.is_available.toString());
  if (params?.min_price !== undefined) searchParams.set('min_price', params.min_price.toString());
  if (params?.max_price !== undefined) searchParams.set('max_price', params.max_price.toString());
  if (params?.skip !== undefined) searchParams.set('skip', params.skip.toString());
  if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());

  const url = `${API_BASE_URL}/vehicles/?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('車両一覧取得エラー:', error);
    throw error;
  }
}

// 空車検索
export async function searchAvailableVehicles(searchRequest: AvailabilitySearchRequest): Promise<AvailabilitySearchResponse> {
  const url = `${API_BASE_URL}/vehicles/availability`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('空車検索エラー:', error);
    throw error;
  }
}

// 特定車両の詳細取得
export async function getVehicleById(vehicleId: string): Promise<Vehicle> {
  const url = `${API_BASE_URL}/vehicles/${vehicleId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('車両詳細取得エラー:', error);
    throw error;
  }
}

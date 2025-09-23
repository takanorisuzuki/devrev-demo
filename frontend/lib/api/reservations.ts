import { apiClient, getApiErrorMessage } from './client'

// 予約データ型定義
export interface Reservation {
  id: string
  confirmation_number: string
  customer_id: string
  vehicle_id: string
  pickup_store_id: string
  return_store_id: string
  pickup_datetime: string
  return_datetime: string
  total_amount: number
  tax_amount: number
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  payment_status?: 'pending' | 'completed' | 'failed'
  payment_method?: string
  payment_reference?: string
  options?: Record<string, any>
  special_requests?: string
  created_at: string
  updated_at: string
  
  // 関連データ (populated fields)
  vehicle?: {
    id: string
    make: string
    model: string
    category: string
    image_url?: string
    image_filename?: string
  }
  pickup_store?: {
    id: string
    name: string
    address: string
  }
  return_store?: {
    id: string
    name: string
    address: string
  }
  // 管理者用：顧客情報
  customer?: {
    id: string
    email: string
    full_name: string
    phone_number: string
    role: string
  }
}

// 予約一覧取得パラメータ
export interface GetReservationsParams {
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  limit?: number
  offset?: number
}

// 管理者用予約一覧取得パラメータ
export interface GetAdminReservationsParams {
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  customer_email?: string
  vehicle_id?: string
  limit?: number
  skip?: number
}

// 予約API関数
export const reservationApi = {
  // 予約一覧取得
  async getReservations(params?: GetReservationsParams): Promise<Reservation[]> {
    try {
      const response = await apiClient.get('/api/v1/reservations/', {
        params
      })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 予約詳細取得
  async getReservation(id: string): Promise<Reservation> {
    try {
      const response = await apiClient.get(`/api/v1/reservations/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 予約キャンセル
  async cancelReservation(id: string, reason?: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/reservations/${id}`, {
        data: reason ? { cancellation_reason: reason } : undefined
      })
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 予約作成（既存の実装参照用）
  async createReservation(reservationData: {
    vehicle_id: string
    pickup_store_id: string
    return_store_id: string
    pickup_datetime: string
    return_datetime: string
    options?: Record<string, any>
  }): Promise<Reservation> {
    try {
      const response = await apiClient.post('/api/v1/reservations/', reservationData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 料金見積もり（既存の実装参照用）
  async getReservationQuote(quoteData: {
    vehicle_id: string
    pickup_datetime: string
    return_datetime: string
    options?: Record<string, any>
  }) {
    try {
      const response = await apiClient.post('/api/v1/reservations/quote', quoteData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 管理者用：全予約一覧取得
  async getAdminReservations(params?: GetAdminReservationsParams): Promise<Reservation[]> {
    try {
      const response = await apiClient.get('/api/v1/admin/reservations/', {
        params
      })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // 管理者用：予約ステータス更新
  async updateReservationStatus(reservationId: string, status: string, reason?: string): Promise<Reservation> {
    try {
      const response = await apiClient.put(`/api/v1/admin/reservations/${reservationId}/status`, {
        status,
        reason
      })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }
}

export default reservationApi
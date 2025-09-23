import apiClient, { ApiError } from './client'

// 決済リクエストの型定義
export interface PaymentRequest {
  payment_method: 'card' | 'cash' | 'bank_transfer'
  card_token?: string
  amount: number
  currency: string
}

// 決済レスポンスの型定義
export interface PaymentResponse {
  payment_id: string
  payment_status: 'completed' | 'failed' | 'pending'
  transaction_id?: string
  amount: number
  currency: string
  created_at: string
  failure_reason?: string
}

// 決済履歴の型定義
export interface PaymentHistoryItem {
  payment_id: string
  reservation_id: string
  amount: number
  currency: string
  payment_method: string
  payment_status: string
  created_at: string
  vehicle_name?: string
  pickup_date?: string
  return_date?: string
  // 管理者用決済履歴に必要な顧客・予約情報
  customer_name?: string
  customer_email?: string
  customer_id?: string
  store_name?: string
  pickup_datetime?: string
  return_datetime?: string
  failure_reason?: string
  failure_code?: string
  failure_details?: string
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[]
  total: number
  page: number
  limit: number
}

// 返金リクエストの型定義
export interface RefundRequest {
  reason: string
  amount?: number
}

// 返金レスポンスの型定義
export interface RefundResponse {
  refund_id: string
  payment_id: string
  amount: number
  currency: string
  status: 'completed' | 'failed' | 'pending'
  reason: string
  created_at: string
}

// 管理者用決済履歴の型定義
export interface AdminPaymentStats {
  total_payments: number
  total_amount: number
  successful_payments: number
  failed_payments: number
  refunded_amount: number
}

export interface AdminPaymentHistoryResponse {
  payments: PaymentHistoryItem[]
  payment_stats: AdminPaymentStats
  total_count: number
}

// 決済処理 API
export const processPaymentApi = async (
  reservationId: string,
  paymentData: PaymentRequest,
  idempotencyKey?: string
): Promise<PaymentResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    const response = await apiClient.post<PaymentResponse>(
      `/api/v1/payments/reservations/${reservationId}/payment`,
      paymentData,
      { headers }
    )
    
    return response.data
  } catch (error: any) {
    console.error('Payment API Error:', error)
    throw new Error(error.response?.data?.detail || '決済処理に失敗しました')
  }
}

// 顧客用決済履歴取得 API
export const getPaymentHistoryApi = async (
  page: number = 1,
  limit: number = 20
): Promise<PaymentHistoryResponse> => {
  try {
    const response = await apiClient.get<PaymentHistoryResponse>(
      `/api/v1/payments/history?page=${page}&limit=${limit}`
    )
    return response.data
  } catch (error: any) {
    console.error('Payment History API Error:', error)
    throw new Error(error.response?.data?.detail || '決済履歴の取得に失敗しました')
  }
}

// 管理者用決済履歴取得 API
export const getAdminPaymentHistoryApi = async (
  skip: number = 0,
  limit: number = 100
): Promise<AdminPaymentHistoryResponse> => {
  try {
    const response = await apiClient.get<AdminPaymentHistoryResponse>(
      `/api/v1/payments/admin?skip=${skip}&limit=${limit}`
    )
    return response.data
  } catch (error: any) {
    console.error('Admin Payment History API Error:', error)
    throw new Error(error.response?.data?.detail || '管理者決済履歴の取得に失敗しました')
  }
}

// 返金処理 API
export const processRefundApi = async (
  paymentId: string,
  refundData: RefundRequest,
  idempotencyKey?: string
): Promise<RefundResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    const response = await apiClient.post<RefundResponse>(
      `/api/v1/payments/admin/${paymentId}/refund`,
      refundData,
      { headers }
    )
    
    return response.data
  } catch (error: any) {
    console.error('Refund API Error:', error)
    throw new Error(error.response?.data?.detail || '返金処理に失敗しました')
  }
}

// 冪等性キー生成ユーティリティ
export const generateIdempotencyKey = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `payment_${timestamp}_${random}`
}

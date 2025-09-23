import { apiClient } from './client'

export interface AdminStats {
  total_users: number
  total_vehicles: number
  monthly_reservations: number
  total_stores: number
  recent_activities: Array<{
    type: string
    message: string
    timestamp: string
    time_ago: string
  }>
}

export interface User {
  id: string
  email: string
  full_name: string
  phone_number?: string
  role: 'admin' | 'customer' | 'staff'
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserCreateData {
  email: string
  full_name: string
  phone_number?: string
  password: string
  role: 'admin' | 'customer' | 'staff'
  is_active: boolean
  is_verified: boolean
}

export interface UserUpdateData {
  phone_number?: string
  role?: 'admin' | 'customer' | 'staff'
  is_active?: boolean
  is_verified?: boolean
}

export const adminApi = {
  // 管理者用統計情報取得
  async getStats(): Promise<AdminStats> {
    try {
      const response = await apiClient.get('/api/v1/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // ユーザー一覧取得
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/v1/admin/users/')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // ユーザー作成
  async createUser(userData: UserCreateData): Promise<User> {
    try {
      const response = await apiClient.post('/api/v1/admin/users/', userData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // ユーザー更新
  async updateUser(userId: string, userData: UserUpdateData): Promise<User> {
    try {
      const response = await apiClient.put(`/api/v1/admin/users/${userId}`, userData)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  },

  // ユーザー削除
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/admin/users/${userId}`)
    } catch (error) {
      throw new Error(getApiErrorMessage(error))
    }
  }
}

function getApiErrorMessage(error: any): string {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.message) {
    return error.message
  }
  return 'エラーが発生しました'
}

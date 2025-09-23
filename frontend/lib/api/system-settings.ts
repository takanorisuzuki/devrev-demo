import apiClient from './client'

// システム設定の型定義
export interface SystemSettings {
  id: string
  app_name: string
  app_version: string
  environment: string
  maintenance_mode: boolean
  maintenance_message?: string
  business_hours?: BusinessHours
}

export interface BusinessHours {
  start_time: string
  end_time: string
  timezone: string
}

export interface SystemSettingsUpdate {
  app_name?: string
  app_version?: string
  environment?: string
  maintenance_mode?: boolean
  maintenance_message?: string
  business_hours?: BusinessHours
}

// システム設定取得API
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await apiClient.get<SystemSettings>('/api/v1/admin/system-settings')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'システム設定の取得に失敗しました')
  }
}

// システム設定更新API
export const updateSystemSettings = async (data: SystemSettingsUpdate): Promise<SystemSettings> => {
  try {
    const response = await apiClient.put<SystemSettings>('/api/v1/admin/system-settings', data)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'システム設定の更新に失敗しました')
  }
}

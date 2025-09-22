"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  getSystemSettings,
  updateSystemSettings,
  SystemSettings,
  SystemSettingsUpdate,
} from "@/lib/api/system-settings";
import { Loader2, Save, RefreshCw } from "lucide-react";

export function SystemSettingsComponent() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SystemSettingsUpdate>({});
  const { addToast } = useToast();

  // システム設定を取得
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      setSettings(data);
      setFormData({
        app_name: data.app_name,
        app_version: data.app_version,
        environment: data.environment,
        maintenance_mode: data.maintenance_mode,
        maintenance_message: data.maintenance_message || "",
        business_hours: data.business_hours || {
          start_time: "09:00",
          end_time: "18:00",
          timezone: "Asia/Tokyo",
        },
      });
    } catch (error: any) {
      addToast({
        type: "error",
        title: "エラー",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 設定を保存
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedSettings = await updateSystemSettings(formData);
      setSettings(updatedSettings);
      addToast({
        type: "success",
        title: "成功",
        message: "システム設定を更新しました",
      });
    } catch (error: any) {
      addToast({
        type: "error",
        title: "エラー",
        message: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // フォームデータの更新
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 営業時間の更新
  const updateBusinessHours = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">設定を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">システム設定</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            保存
          </Button>
        </div>
      </div>

      {/* 基本設定 */}
      <Card>
        <CardHeader>
          <CardTitle>基本設定</CardTitle>
          <CardDescription>
            アプリケーションの基本情報を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app_name">アプリケーション名</Label>
              <Input
                id="app_name"
                value={formData.app_name || ""}
                onChange={(e) => updateFormData("app_name", e.target.value)}
                placeholder="DriveRev"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_version">バージョン</Label>
              <Input
                id="app_version"
                value={formData.app_version || ""}
                onChange={(e) => updateFormData("app_version", e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="environment">環境</Label>
            <Input
              id="environment"
              value={formData.environment || ""}
              onChange={(e) => updateFormData("environment", e.target.value)}
              placeholder="production"
            />
            <p className="text-sm text-gray-500">
              development, staging, production のいずれか
            </p>
          </div>
        </CardContent>
      </Card>

      {/* メンテナンス設定 */}
      <Card>
        <CardHeader>
          <CardTitle>メンテナンス設定</CardTitle>
          <CardDescription>システムメンテナンスモードの設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenance_mode">メンテナンスモード</Label>
            <Input
              id="maintenance_mode"
              type="checkbox"
              checked={formData.maintenance_mode || false}
              onChange={(e) =>
                updateFormData("maintenance_mode", e.target.checked)
              }
            />
            <p className="text-sm text-gray-500">
              チェックを入れるとメンテナンスモードが有効になります
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance_message">メンテナンスメッセージ</Label>
            <Textarea
              id="maintenance_message"
              value={formData.maintenance_message || ""}
              onChange={(e) =>
                updateFormData("maintenance_message", e.target.value)
              }
              placeholder="システムメンテナンス中です。しばらくお待ちください。"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 営業時間設定 */}
      <Card>
        <CardHeader>
          <CardTitle>営業時間設定</CardTitle>
          <CardDescription>全店舗共通の営業時間を設定します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">開始時間</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.business_hours?.start_time || "09:00"}
                onChange={(e) =>
                  updateBusinessHours("start_time", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">終了時間</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.business_hours?.end_time || "18:00"}
                onChange={(e) =>
                  updateBusinessHours("end_time", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">タイムゾーン</Label>
              <Input
                id="timezone"
                value={formData.business_hours?.timezone || "Asia/Tokyo"}
                onChange={(e) =>
                  updateBusinessHours("timezone", e.target.value)
                }
                placeholder="Asia/Tokyo"
              />
              <p className="text-sm text-gray-500">Asia/Tokyo, UTC など</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

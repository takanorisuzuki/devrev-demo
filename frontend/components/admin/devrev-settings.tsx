"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  getDevRevConfig,
  updateDevRevConfig,
  deleteDevRevConfig,
  createSessionToken,
  DevRevConfig,
  DevRevConfigUpdateRequest,
} from "@/lib/api/devrev";
import { Loader2, Save, RefreshCw, Trash2, TestTube } from "lucide-react";

export function DevRevSettingsComponent() {
  const [config, setConfig] = useState<DevRevConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<DevRevConfigUpdateRequest>({});
  const { addToast } = useToast();

  // DevRev設定を取得
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await getDevRevConfig();
      setConfig(data);
      // Personal設定の場合のみフォームに反映（Global設定は環境変数なので編集不可）
      if (data.mode === "personal") {
        setFormData({
          app_id: data.app_id || "",
          use_personal_config: true,
        });
      }
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
    fetchConfig();
  }, []);

  // 設定を保存
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedConfig = await updateDevRevConfig(formData);
      setConfig(updatedConfig);
      addToast({
        type: "success",
        title: "成功",
        message: "DevRev設定を更新しました",
      });
      // 更新後、設定を再取得
      await fetchConfig();
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

  // 設定を削除（Personal設定のみ）
  const handleDelete = async () => {
    if (!confirm("DevRev設定を削除してもよろしいですか？")) {
      return;
    }

    try {
      setDeleting(true);
      await deleteDevRevConfig();
      setConfig(null);
      setFormData({});
      addToast({
        type: "success",
        title: "成功",
        message: "DevRev設定を削除しました",
      });
      // 削除後、設定を再取得（Global設定にフォールバック）
      await fetchConfig();
    } catch (error: any) {
      addToast({
        type: "error",
        title: "エラー",
        message: error.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Session Token生成テスト
  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const sessionTokenData = await createSessionToken(true); // 強制的に新規生成
      addToast({
        type: "success",
        title: "接続成功",
        message: `Session Tokenを生成しました。RevUser ID: ${sessionTokenData.revuser_id}`,
      });
    } catch (error: any) {
      addToast({
        type: "error",
        title: "接続エラー",
        message: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  // フォームデータの更新
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Personal設定を有効/無効にする
  const togglePersonalConfig = async (enabled: boolean) => {
    try {
      setSaving(true);
      if (!enabled) {
        // Personal設定を無効にする場合、設定を削除
        await deleteDevRevConfig();
        addToast({
          type: "success",
          title: "成功",
          message: "Global設定に切り替えました",
        });
      } else {
        // Personal設定を有効にする場合
        setFormData((prev) => ({
          ...prev,
          use_personal_config: true,
        }));
      }
      await fetchConfig();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">設定を読み込み中...</span>
      </div>
    );
  }

  const isPersonalMode = config?.mode === "personal";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">DevRev PLuG 設定</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConfig} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          {isPersonalMode && (
            <>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                接続テスト
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                削除
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 現在の設定モード表示 */}
      <Card>
        <CardHeader>
          <CardTitle>現在の設定モード</CardTitle>
          <CardDescription>
            {isPersonalMode
              ? "Personal設定が有効です。自分のDevRev組織を使用しています。"
              : "Global設定が有効です。共有DevRev設定を使用しています。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">
                モード:{" "}
                <span
                  className={`${isPersonalMode ? "text-blue-600" : "text-gray-600"}`}
                >
                  {isPersonalMode ? "Personal" : "Global"}
                </span>
              </p>
              {config?.app_id && (
                <p className="text-sm text-gray-500">
                  App ID: {config.app_id}
                </p>
              )}
              {config?.revuser_id && (
                <p className="text-sm text-gray-500">
                  RevUser ID: {config.revuser_id}
                </p>
              )}
              {config?.session_token_expires_at && (
                <p className="text-sm text-gray-500">
                  Session有効期限:{" "}
                  {new Date(config.session_token_expires_at).toLocaleString(
                    "ja-JP",
                  )}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal設定 */}
      <Card>
        <CardHeader>
          <CardTitle>Personal設定</CardTitle>
          <CardDescription>
            自分のDevRev組織を使用する場合は、ここで設定してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="use_personal"
              checked={isPersonalMode}
              onCheckedChange={togglePersonalConfig}
              disabled={saving}
            />
            <Label htmlFor="use_personal">
              Personal設定を使用する（自分のDevRev組織）
            </Label>
          </div>

          {isPersonalMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="app_id">DevRev App ID</Label>
                <Input
                  id="app_id"
                  value={formData.app_id || ""}
                  onChange={(e) => updateFormData("app_id", e.target.value)}
                  placeholder="don:identity:dvrv-us-1:devo/xxxxx:custom_type_instance/1"
                />
                <p className="text-sm text-gray-500">
                  DevRev PLuG アプリケーションのApp IDを入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aat">Application Access Token (AAT)</Label>
                <Input
                  id="aat"
                  type="password"
                  value={formData.application_access_token || ""}
                  onChange={(e) =>
                    updateFormData("application_access_token", e.target.value)
                  }
                  placeholder="eyJ... または drt_..."
                />
                <p className="text-sm text-gray-500">
                  DevRev
                  APIにアクセスするためのトークンを入力してください（安全に保存されます）
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Personal設定を保存
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 使い方ガイド */}
      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Global設定（デフォルト）</h3>
            <p className="text-sm text-gray-600">
              運営側が用意した共有DevRev設定を使用します。ゲストユーザーや、自分のDevRev組織を持っていない方向けです。
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Personal設定</h3>
            <p className="text-sm text-gray-600">
              自分のDevRev
              Trial組織を使用します。カスタマイズしたPLuG、Workflow、Knowledge
              BaseをDriveRevで直接テストできます。
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-2">
              <li>DevRev コンソールでPLuG Chatアプリを作成</li>
              <li>App IDとApplication Access Token (AAT)を取得</li>
              <li>上記フォームに入力して保存</li>
              <li>接続テストで動作確認</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState } from "react";
import { X, Car, Loader2, Search, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { VehicleCreate } from "@/lib/types/vehicle";
import {
  VEHICLE_TEMPLATES,
  TEMPLATES_BY_CATEGORY,
  TEMPLATES_BY_MAKE,
  VehicleTemplate,
} from "@/lib/data/vehicle-templates";
import { useAuthStore } from "@/lib/stores/auth";
import { createVehicle } from "@/lib/api/admin-vehicles";

interface VehicleQuickRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleCreated: () => void;
}

export function VehicleQuickRegistrationModal({
  open,
  onOpenChange,
  onVehicleCreated,
}: VehicleQuickRegistrationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<VehicleTemplate | null>(null);
  const [customData, setCustomData] = useState({
    license_plate: "",
    daily_rate: 0,
  });

  const { addToast } = useToast();
  const token = useAuthStore((state) => state.token);

  // フィルタリングされたテンプレート
  const filteredTemplates = VEHICLE_TEMPLATES.filter((template) => {
    const matchesSearch =
      !searchTerm ||
      template.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || template.category === selectedCategory;
    const matchesMake = !selectedMake || template.make === selectedMake;

    return matchesSearch && matchesCategory && matchesMake;
  });

  const handleTemplateSelect = (template: VehicleTemplate) => {
    setSelectedTemplate(template);
    setCustomData({
      license_plate: template.license_plate,
      daily_rate: template.daily_rate,
    });
  };

  const handleQuickRegister = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);

    try {
      if (!token) {
        throw new Error("認証トークンが見つかりません");
      }

      const vehicleData: VehicleCreate = {
        make: selectedTemplate.make,
        model: selectedTemplate.model,
        year: selectedTemplate.year,
        color: selectedTemplate.color,
        license_plate: customData.license_plate,
        category: selectedTemplate.category,
        class_type: selectedTemplate.class_type,
        transmission: selectedTemplate.transmission,
        fuel_type: selectedTemplate.fuel_type,
        daily_rate: customData.daily_rate,
        image_filename: selectedTemplate.image_filename,
      };

      // createVehicle関数でAPI呼び出しと認証が処理されます
      const newVehicle = await createVehicle(vehicleData);

      addToast({
        type: "success",
        title: "クイック登録完了",
        message: `${newVehicle.make} ${newVehicle.model} を正常に登録しました`,
      });

      // リセット
      setSelectedTemplate(null);
      setSearchTerm("");
      setSelectedCategory("");
      setSelectedMake("");
      setCustomData({ license_plate: "", daily_rate: 0 });

      onOpenChange(false);
      onVehicleCreated();
    } catch (error) {
      console.error("Quick vehicle registration error:", error);
      addToast({
        type: "error",
        title: "エラー",
        message:
          error instanceof Error ? error.message : "車両の登録に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            クイック車両登録
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 検索・フィルター */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車種検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="メーカー名やモデル名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="compact">コンパクト</option>
                  <option value="standard">スタンダード</option>
                  <option value="suv">SUV</option>
                  <option value="premium">プレミアム</option>
                  <option value="sports">スポーツ</option>
                  <option value="electric">電気自動車</option>
                  <option value="electric_suv">電気SUV</option>
                  <option value="van">バン</option>
                  <option value="exotic">エキゾチック</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メーカー
                </label>
                <select
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                >
                  <option value="">すべて</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Porsche">Porsche</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Ford">Ford</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Audi">Audi</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Cadillac">Cadillac</option>
                  <option value="Buick">Buick</option>
                  <option value="Chrysler">Chrysler</option>
                  <option value="Ferrari">Ferrari</option>
                  <option value="Lotus">Lotus</option>
                  <option value="Opel">Opel</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* テンプレート選択 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                車種テンプレート ({filteredTemplates.length}件)
              </h4>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                        <Car className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {template.make} {template.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.year}年式 • {template.category} •{" "}
                          {new Intl.NumberFormat("ja-JP", {
                            style: "currency",
                            currency: "JPY",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(template.daily_rate)}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 選択されたテンプレートの詳細とカスタマイズ */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                車両詳細
              </h4>

              {selectedTemplate ? (
                <div className="space-y-4">
                  {/* テンプレート情報表示 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Car className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {selectedTemplate.make} {selectedTemplate.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedTemplate.year}年式 • {selectedTemplate.color}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">カテゴリ:</span>{" "}
                        {selectedTemplate.category}
                      </div>
                      <div>
                        <span className="font-medium">クラス:</span>{" "}
                        {selectedTemplate.class_type}
                      </div>
                      <div>
                        <span className="font-medium">トランスミッション:</span>{" "}
                        {selectedTemplate.transmission}
                      </div>
                      <div>
                        <span className="font-medium">燃料:</span>{" "}
                        {selectedTemplate.fuel_type}
                      </div>
                    </div>
                  </div>

                  {/* カスタマイズ可能な項目 */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ナンバープレート
                      </label>
                      <Input
                        value={customData.license_plate}
                        onChange={(e) =>
                          setCustomData({
                            ...customData,
                            license_plate: e.target.value,
                          })
                        }
                        placeholder="品川 500 あ 1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        日額料金（円）
                      </label>
                      <Input
                        type="number"
                        value={customData.daily_rate}
                        onChange={(e) =>
                          setCustomData({
                            ...customData,
                            daily_rate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="8000"
                      />
                    </div>
                  </div>

                  {/* 登録ボタン */}
                  <div className="pt-4">
                    <Button
                      onClick={handleQuickRegister}
                      disabled={
                        isLoading ||
                        !customData.license_plate ||
                        customData.daily_rate <= 0
                      }
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          登録中...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          クイック登録
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>左側から車種テンプレートを選択してください</p>
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

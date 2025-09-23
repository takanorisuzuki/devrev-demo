/**
 * 車両テンプレートデータ
 * 管理者が車両を素早く登録するためのプリセットデータ
 */

export interface VehicleTemplate {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  color: string;
  category: string;
  class_type: string;
  transmission: string;
  fuel_type: string;
  daily_rate: number;
  license_plate?: string;
  image_filename?: string;
  description?: string;
}

// 車両テンプレートデータ
export const VEHICLE_TEMPLATES: VehicleTemplate[] = [
  // コンパクトカー
  {
    id: "template-compact-1",
    name: "トヨタ ヤリス",
    make: "トヨタ",
    model: "ヤリス",
    year: 2023,
    color: "白",
    category: "compact",
    class_type: "economy",
    transmission: "CVT",
    fuel_type: "gasoline",
    daily_rate: 4500,
    image_filename: "toyota-yaris.jpg",
    description: "燃費が良くて運転しやすいコンパクトカー",
  },
  {
    id: "template-compact-2",
    name: "ホンダ フィット",
    make: "ホンダ",
    model: "フィット",
    year: 2023,
    color: "青",
    category: "compact",
    class_type: "economy",
    transmission: "CVT",
    fuel_type: "gasoline",
    daily_rate: 4800,
    image_filename: "honda-fit.jpg",
    description: "室内が広く使いやすいコンパクトカー",
  },
  // SUV
  {
    id: "template-suv-1",
    name: "トヨタ RAV4",
    make: "トヨタ",
    model: "RAV4",
    year: 2023,
    color: "黒",
    category: "suv",
    class_type: "standard",
    transmission: "CVT",
    fuel_type: "gasoline",
    daily_rate: 8500,
    image_filename: "toyota-rav4.jpg",
    description: "人気のミドルサイズSUV",
  },
  // プレミアム
  {
    id: "template-premium-1",
    name: "レクサス ES",
    make: "レクサス",
    model: "ES",
    year: 2023,
    color: "グレー",
    category: "premium",
    class_type: "luxury",
    transmission: "CVT",
    fuel_type: "gasoline",
    daily_rate: 15000,
    image_filename: "lexus-es.jpg",
    description: "ラグジュアリーセダン",
  },
  // 電気自動車
  {
    id: "template-electric-1",
    name: "日産 リーフ",
    make: "日産",
    model: "リーフ",
    year: 2023,
    color: "白",
    category: "electric",
    class_type: "eco",
    transmission: "CVT",
    fuel_type: "electric",
    daily_rate: 7500,
    image_filename: "nissan-leaf.jpg",
    description: "人気の電気自動車",
  },
];

// カテゴリ別テンプレート
export const TEMPLATES_BY_CATEGORY = {
  compact: VEHICLE_TEMPLATES.filter((t) => t.category === "compact"),
  suv: VEHICLE_TEMPLATES.filter((t) => t.category === "suv"),
  premium: VEHICLE_TEMPLATES.filter((t) => t.category === "premium"),
  sports: VEHICLE_TEMPLATES.filter((t) => t.category === "sports"),
  electric: VEHICLE_TEMPLATES.filter((t) => t.category === "electric"),
};

// メーカー別テンプレート
export const TEMPLATES_BY_MAKE = {
  トヨタ: VEHICLE_TEMPLATES.filter((t) => t.make === "トヨタ"),
  ホンダ: VEHICLE_TEMPLATES.filter((t) => t.make === "ホンダ"),
  日産: VEHICLE_TEMPLATES.filter((t) => t.make === "日産"),
  レクサス: VEHICLE_TEMPLATES.filter((t) => t.make === "レクサス"),
};

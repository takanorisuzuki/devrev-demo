// デモ用車両データ - バックエンドAPI統合用
export interface DemoVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  daily_rate: number;
  image_filename: string;
  is_available: boolean;
  transmission: string;
  is_smoking_allowed: boolean;
  store: {
    name: string;
    location: string;
  };
}

export const DEMO_VEHICLES: DemoVehicle[] = [
  {
    id: "vehicle-1",
    make: "Toyota",
    model: "Camry",
    year: 2023,
    category: "standard",
    daily_rate: 8000,
    image_filename: "toyota_camry.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "東京駅店", location: "東京都千代田区" },
  },
  {
    id: "vehicle-2",
    make: "Honda",
    model: "Civic",
    year: 2023,
    category: "compact",
    daily_rate: 6000,
    image_filename: "honda_civic.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "新宿店", location: "東京都新宿区" },
  },
  {
    id: "vehicle-3",
    make: "BMW",
    model: "3 Series",
    year: 2023,
    category: "premium",
    daily_rate: 15000,
    image_filename: "bmw_3_series.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "渋谷店", location: "東京都渋谷区" },
  },
  {
    id: "vehicle-4",
    make: "Porsche",
    model: "911",
    year: 2023,
    category: "sports",
    daily_rate: 25000,
    image_filename: "porsche_911.jpg",
    is_available: true,
    transmission: "manual",
    is_smoking_allowed: false,
    store: { name: "横浜店", location: "神奈川県横浜市" },
  },
  {
    id: "vehicle-5",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    category: "electric",
    daily_rate: 12000,
    image_filename: "tesla_model3.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "大阪店", location: "大阪府大阪市" },
  },
  {
    id: "vehicle-6",
    make: "Toyota",
    model: "RAV4",
    year: 2023,
    category: "suv",
    daily_rate: 10000,
    image_filename: "toyota_rav4.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "東京駅店", location: "東京都千代田区" },
  },
  {
    id: "vehicle-7",
    make: "Ford",
    model: "Mustang",
    year: 2023,
    category: "sports",
    daily_rate: 20000,
    image_filename: "ford_mustang_convertible.jpg",
    is_available: true,
    transmission: "manual",
    is_smoking_allowed: true,
    store: { name: "新宿店", location: "東京都新宿区" },
  },
  {
    id: "vehicle-8",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    category: "premium",
    daily_rate: 18000,
    image_filename: "mercedes_cclass.jpg",
    is_available: true,
    transmission: "automatic",
    is_smoking_allowed: false,
    store: { name: "渋谷店", location: "東京都渋谷区" },
  },
];

// デモ用店舗データ
export interface DemoStore {
  id: string;
  name: string;
  location: string;
}

export const DEMO_STORES: DemoStore[] = [
  { id: "store-1", name: "東京駅店", location: "東京都千代田区" },
  { id: "store-2", name: "新宿店", location: "東京都新宿区" },
  { id: "store-3", name: "渋谷店", location: "東京都渋谷区" },
  { id: "store-4", name: "横浜店", location: "神奈川県横浜市" },
  { id: "store-5", name: "大阪店", location: "大阪府大阪市" },
];

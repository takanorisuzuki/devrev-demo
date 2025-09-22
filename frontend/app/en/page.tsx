"use client";

import React, { useState } from "react";
import { Search, Car, Shield, Clock, DollarSign } from "lucide-react";
import StoreSelector from "@/components/forms/StoreSelector";
import { useI18n } from "@/lib/hooks/useI18n";

export default function EnglishHomePage() {
  const { t } = useI18n();
  const [searchForm, setSearchForm] = useState({
    pickupLocation: "",
    returnLocation: "",
    pickupDate: "",
    returnDate: "",
    pickupTime: "10:00",
    returnTime: "18:00",
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    console.log("Search executed:", searchForm);
    
    // Build search parameters
    const searchParams = new URLSearchParams();
    if (searchForm.pickupLocation) searchParams.set("pickup_location", searchForm.pickupLocation);
    if (searchForm.returnLocation) searchParams.set("return_location", searchForm.returnLocation);
    if (searchForm.pickupDate) searchParams.set("pickup_date", searchForm.pickupDate);
    if (searchForm.returnDate) searchParams.set("return_date", searchForm.returnDate);
    if (searchForm.pickupTime) searchParams.set("pickup_time", searchForm.pickupTime);
    if (searchForm.returnTime) searchParams.set("return_time", searchForm.returnTime);
    
    // Navigate to vehicle search page
    const url = `/en/vehicles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.location.href = url;
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-driverev-500" />,
      title: t('home.features.quality.title'),
      description: t('home.features.quality.description'),
    },
    {
      icon: <Clock className="w-8 h-8 text-driverev-500" />,
      title: t('home.features.convenience.title'),
      description: t('home.features.convenience.description'),
    },
    {
      icon: <Car className="w-8 h-8 text-driverev-500" />,
      title: t('home.features.support.title'),
      description: t('home.features.support.description'),
    },
    {
      icon: <DollarSign className="w-8 h-8 text-driverev-500" />,
      title: t('home.features.price.title'),
      description: t('home.features.price.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 fade-in-up">
            {t('home.title')}
          </h2>
          <p className="text-xl md:text-2xl mb-12 fade-in-up-delay-1 opacity-90">
            {t('home.subtitle')}
          </p>

          {/* Search Form */}
          <div className="glass-effect p-8 rounded-xl max-w-4xl mx-auto fade-in-up-delay-2">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              {t('home.searchTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <StoreSelector
                  label={t('home.pickupLocation')}
                  value={searchForm.pickupLocation}
                  onChange={(storeId) =>
                    handleInputChange("pickupLocation", storeId)
                  }
                  placeholder="Select Store"
                  showStoreType={true}
                />
              </div>

              <div>
                <StoreSelector
                  label={t('home.returnLocation')}
                  value={searchForm.returnLocation}
                  onChange={(storeId) =>
                    handleInputChange("returnLocation", storeId)
                  }
                  placeholder="Select Store"
                  showStoreType={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('home.pickupDate')}
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
                  value={searchForm.pickupDate}
                  onChange={(e) =>
                    handleInputChange("pickupDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('home.returnDate')}
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
                  value={searchForm.returnDate}
                  onChange={(e) =>
                    handleInputChange("returnDate", e.target.value)
                  }
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="bg-driverev-500 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-driverev-600 transition-colors flex items-center justify-center mx-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              {t('home.searchButton')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-16 text-gray-900">
            {t('home.whyChooseUs')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-8 rounded-lg text-center card-hover fade-in-up-delay-${index + 1}`}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-6 h-6 text-driverev-500" />
                <h5 className="text-xl font-bold">DriveRev</h5>
              </div>
              <p className="text-gray-400">
                Your premium car rental service in Japan, providing the perfect driving experience.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Services</h6>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Vehicle Search
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Reservation Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Customer Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Contact</h6>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@driverev.jp</li>
                <li>Phone: +81-3-1234-5678</li>
                <li>Address: Tokyo, Japan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DriveRev. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

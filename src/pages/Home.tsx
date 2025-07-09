import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ProgressBars from "../components/ProgressBars";
import MapTiler from "../components/MapTiler";
import NearestStopsTable from "../components/NearestStopsTable";
import { MapPin, Bus, Navigation, TreePine, BarChart3, TrendingUp, Users, Target, Loader } from "lucide-react";
import { loadGeoJSONData, calculateRealMetrics } from "../utils/realMetrics";

const ALL_TYPES = [
  "Маршрут автобуса",
  "Рекомендованный маршрут",
  "Удлинить маршрут",
  "Остановка",
  "Рекомендованная остановка",
  "Озеленение",
  "Озёра"
];

const ECO_TYPES = [
  "Озеленение"
];

export default function Home() {
  const [selectedPark, setSelectedPark] = useState<null | {
    id: number | null;
    parkName: string;
    parkDistrict: string;
    distance: number | null;
    unique_id: string;
  }>(null);

  const [visibleTypes, setVisibleTypes] = useState<string[]>(ECO_TYPES);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка реальных метрик
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await loadGeoJSONData();
        const realMetrics = calculateRealMetrics(data);
        setMetrics(realMetrics);
      } catch (error) {
        console.error('Ошибка загрузки метрик:', error);
        // Устанавливаем значения по умолчанию в случае ошибки
        setMetrics({
          stops: 2791,
          routes: 190,
          publicSpaces: 3362,
          districts: 9,
          recommendedStops: 48,
          totalLengthKm: 12328,
          averageDistanceM: 120,
          accessibilityPercentage: 65
        });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  // setVisibleTypes принимает только массив, а не функцию!
  const handleToggleVisibility = (type: string) => {
    setVisibleTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // при выборе общественного пространства сбрасываем только озеленение
  const handleSelectPark = (park: typeof selectedPark) => {
    setSelectedPark(park);
    if (park) {
      setVisibleTypes(["Озеленение"]);
    } else {
      setVisibleTypes(ECO_TYPES);
    }
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Заголовок страницы с навигацией - растянут на всю ширину с размытыми краями */}
        <div className="w-full flex-shrink-0 relative">
          {/* Плоский фоновый градиент без объемности с декоративными элементами */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Основной фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/60 to-transparent"></div>
            {/* Вторичный слой для плавности */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/40 to-transparent"></div>

            {/* Декоративные элементы парка */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1400 120" preserveAspectRatio="none">
              {/* Небо с градиентом */}
              <rect x="0" y="0" width="1400" height="50" fill="url(#skyGradient)" opacity="0.3"/>

              {/* Половина солнышка - левая часть */}
              <defs>
                <clipPath id="leftHalf">
                  <rect x="700" y="0" width="700" height="120"/>
                </clipPath>
              </defs>
              <g clipPath="url(#leftHalf)">
                <circle cx="1400" cy="25" r="15" fill="#FCD34D" opacity="0.6"/>
                <g opacity="0.4">
                  <line x1="1385" y1="25" x2="1375" y2="25" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="1400" y1="10" x2="1400" y2="0" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="1400" y1="40" x2="1400" y2="50" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="1389" y1="14" x2="1382" y2="7" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="1389" y1="36" x2="1382" y2="43" stroke="#FCD34D" strokeWidth="2"/>
                </g>
              </g>

              {/* Облака */}
              <g opacity="0.3">
                <ellipse cx="300" cy="20" rx="25" ry="12" fill="#E5E7EB"/>
                <ellipse cx="320" cy="18" rx="20" ry="10" fill="#E5E7EB"/>
                <ellipse cx="310" cy="15" rx="15" ry="8" fill="#F3F4F6"/>
              </g>

              <g opacity="0.25">
                <ellipse cx="800" cy="30" rx="30" ry="15" fill="#E5E7EB"/>
                <ellipse cx="825" cy="28" rx="25" ry="12" fill="#E5E7EB"/>
                <ellipse cx="815" cy="25" rx="18" ry="10" fill="#F3F4F6"/>
              </g>

              {/* Трава/газон */}
              <rect x="0" y="70" width="1400" height="50" fill="#16A34A" opacity="0.2"/>

              {/* Дорожки */}
              <path d="M 0 90 Q 200 85 400 90 T 800 85 Q 1000 80 1200 85 L 1400 88" stroke="#D1D5DB" strokeWidth="3" fill="none" opacity="0.4"/>
              <path d="M 300 70 Q 400 95 500 80 Q 600 65 700 90" stroke="#D1D5DB" strokeWidth="2" fill="none" opacity="0.3"/>

              {/* Деревья - плоские без объема */}
              <g opacity="0.4">
                <rect x="199" y="55" width="2" height="20" fill="#8B4513"/>
                <circle cx="200" cy="50" r="10" fill="#22C55E"/>
                <circle cx="205" cy="47" r="6" fill="#16A34A"/>
                <circle cx="195" cy="45" r="7" fill="#15803D"/>
              </g>

              <g opacity="0.35">
                <rect x="499" y="50" width="2" height="25" fill="#8B4513"/>
                <circle cx="500" cy="45" r="12" fill="#22C55E"/>
                <circle cx="507" cy="42" r="8" fill="#16A34A"/>
                <circle cx="493" cy="40" r="9" fill="#15803D"/>
              </g>

              <g opacity="0.38">
                <rect x="899" y="52" width="2" height="23" fill="#8B4513"/>
                <circle cx="900" cy="47" r="11" fill="#22C55E"/>
                <circle cx="906" cy="44" r="7" fill="#16A34A"/>
                <circle cx="894" cy="42" r="8" fill="#15803D"/>
              </g>

              {/* Скамейки - плоские */}
              <g opacity="0.4">
                <rect x="350" y="85" width="20" height="2" fill="#8B4513"/>
                <rect x="352" y="85" width="1" height="6" fill="#6B7280"/>
                <rect x="367" y="85" width="1" height="6" fill="#6B7280"/>
                <rect x="354" y="80" width="12" height="3" fill="#8B4513"/>
              </g>

              <g opacity="0.35">
                <rect x="750" y="83" width="20" height="2" fill="#8B4513"/>
                <rect x="752" y="83" width="1" height="6" fill="#6B7280"/>
                <rect x="767" y="83" width="1" height="6" fill="#6B7280"/>
                <rect x="754" y="78" width="12" height="3" fill="#8B4513"/>
              </g>

              {/* Фонари - плоские */}
              <g opacity="0.35">
                <rect x="399" y="60" width="1" height="20" fill="#6B7280"/>
                <circle cx="400" cy="58" r="3" fill="#FCD34D"/>
                <rect x="398" y="80" width="3" height="1" fill="#6B7280"/>
              </g>

              <g opacity="0.3">
                <rect x="1099" y="55" width="1" height="25" fill="#6B7280"/>
                <circle cx="1100" cy="53" r="3" fill="#FCD34D"/>
                <rect x="1098" y="80" width="3" height="1" fill="#6B7280"/>
              </g>

              {/* Клумбы с цветами - плоские */}
              <g opacity="0.3">
                <ellipse cx="150" cy="95" rx="12" ry="6" fill="#15803D"/>
                <circle cx="145" cy="93" r="1.5" fill="#EF4444"/>
                <circle cx="152" cy="90" r="1.5" fill="#F59E0B"/>
                <circle cx="148" cy="97" r="1.5" fill="#8B5CF6"/>
                <circle cx="155" cy="95" r="1.5" fill="#EC4899"/>
              </g>

              <g opacity="0.25">
                <ellipse cx="650" cy="98" rx="15" ry="8" fill="#15803D"/>
                <circle cx="645" cy="96" r="1.5" fill="#EF4444"/>
                <circle cx="652" cy="93" r="1.5" fill="#F59E0B"/>
                <circle cx="648" cy="100" r="1.5" fill="#8B5CF6"/>
                <circle cx="655" cy="98" r="1.5" fill="#EC4899"/>
                <circle cx="658" cy="95" r="1.5" fill="#10B981"/>
              </g>

              {/* Кустарники - плоские */}
              <ellipse cx="100" cy="98" rx="8" ry="4" fill="#22C55E" opacity="0.25"/>
              <ellipse cx="450" cy="105" rx="6" ry="3" fill="#16A34A" opacity="0.2"/>
              <ellipse cx="850" cy="102" rx="10" ry="5" fill="#15803D" opacity="0.23"/>
              <ellipse cx="1250" cy="98" rx="7" ry="4" fill="#22C55E" opacity="0.22"/>

              {/* Автобусы на заднем плане - плоские */}
              <g opacity="0.2">
                <rect x="250" y="35" width="12" height="6" fill="#3B82F6" rx="1"/>
                <rect x="252" y="37" width="2" height="2" fill="#FFFFFF"/>
                <rect x="255" y="37" width="2" height="2" fill="#FFFFFF"/>
                <rect x="258" y="37" width="2" height="2" fill="#FFFFFF"/>
                <circle cx="255" cy="42" r="1.5" fill="#374151"/>
                <circle cx="259" cy="42" r="1.5" fill="#374151"/>
              </g>

              <g opacity="0.18">
                <rect x="1050" y="30" width="12" height="6" fill="#2563EB" rx="1"/>
                <rect x="1052" y="32" width="2" height="2" fill="#FFFFFF"/>
                <rect x="1055" y="32" width="2" height="2" fill="#FFFFFF"/>
                <rect x="1058" y="32" width="2" height="2" fill="#FFFFFF"/>
                <circle cx="1055" cy="37" r="1.5" fill="#374151"/>
                <circle cx="1059" cy="37" r="1.5" fill="#374151"/>
              </g>

              {/* Градиент для неба */}
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DBEAFE" />
                  <stop offset="100%" stopColor="#BFDBFE" />
                </linearGradient>
              </defs>
            </svg>

            {/* Сильно размытые края - левый */}
            <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-r from-white via-white/60 to-transparent blur-3xl"></div>
            {/* Сильно размытые края - правый */}
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white via-white/60 to-transparent blur-3xl"></div>
            {/* Дополнительные размытые слои для еще большей мягкости */}
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-gradient-to-r from-gray-50/90 via-gray-50/40 to-transparent blur-2xl"></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-gray-50/90 via-gray-50/40 to-transparent blur-2xl"></div>
            {/* Третий слой размытия */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-white/70 via-transparent to-transparent blur-xl"></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white/70 via-transparent to-transparent blur-xl"></div>

            {/* Размытый нижний край для плавного перехода */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent blur-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/90 via-gray-50/60 to-transparent blur-xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 via-white/50 to-transparent blur-lg"></div>
          </div>

          {/* Контент заголовка */}
          <div className="relative z-10 px-6 py-6 flex items-center justify-between header">
            <div className="flex-1"></div>
            <div className="text-center">
              <h2 className="font-bold text-gray-900 mb-2 text-2xl">
                Транспортная доступность общественных пространств
              </h2>
              <p className="text-green-600 font-medium text-2xl">
                города Алматы
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link
                to="/routes"
                className="group relative"
              >
                <svg
                  width="200"
                  height="120"
                  viewBox="0 0 200 120"
                  className="transition-opacity duration-300 hover:opacity-80"
                >
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 24 L 0 96 L 170 96 L 190 60 L 170 24 Z"
                    fill="url(#greenGradient)"
                    className="group-hover:fill-green-700 transition-colors duration-300"
                  />
                  <text
                    x="85"
                    y="64"
                    textAnchor="middle"
                    className="fill-white font-medium text-lg"
                  >
                    Рекомендации
                  </text>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* KPI карточки */}
        <div className="flex-shrink-0 grid grid-cols-5 content-padding stats-grid gap-x-1.5">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Загрузка данных...</span>
            </div>
          ) : (
            <>
              <div
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-600">Маршруты</p>
                <div className="flex items-center justify-between">
                  <div>

                    <p className="text-3xl font-bold text-gray-900">{metrics?.routes?.toLocaleString() || '190'}</p>

                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 text-green-600"/>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Navigation className="w-4 h-4 mr-1"/>
                  Автобусных маршрутов
                </p>
              </div>

              <div
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-600">Общественные пространства</p>
                <div className="flex items-center justify-between">
                  <div>

                    <p className="text-3xl font-bold text-gray-900">{metrics?.publicSpaces?.toLocaleString() || '3,362'}</p>

                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                    <TreePine className="w-6 h-6 text-green-600"/>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TreePine className="w-4 h-4 mr-1"/>
                  Парки и скверы
                </p>
              </div>

              <div
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-600">Среднее расстояние</p>
                <div className="flex items-center justify-between">
                  <div>

                    <p className="text-3xl font-bold text-gray-900">{metrics?.averageDistanceM || '120'}м</p>

                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-green-600"/>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Target className="w-4 h-4 mr-1"/>
                  До ближайшей остановки
                </p>
              </div>

              <div
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-600">Рекомендованные остановки</p>
                <div className="flex items-center justify-between">
                  <div>

                    <p className="text-3xl font-bold text-gray-900">{metrics?.recommendedStops || '48'}</p>

                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-green-600"/>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1"/>
                  Потенциальных точек
                </p>
              </div>

              <div
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-600">Общая протяженность</p>
                <div className="flex items-center justify-between">
                  <div>

                    <p className="text-3xl font-bold text-gray-900">{metrics?.totalLengthKm?.toLocaleString() || '12,328'}км</p>

                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                    <Navigation className="w-6 h-6 text-green-600"/>
                  </div>
                </div>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Navigation className="w-4 h-4 mr-1"/>
                  Маршрутной сети
                </p>
              </div>
            </>
          )}
        </div>

        {/* Таблица слева и карта справа на одном уровне */}
        <div className="flex-1 pb-6 pt-6 flex min-h-0 content-padding layout-flex">
          {/* Таблица - 40% ширины */}
          <div className="w-2/5 h-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm sidebar">
            <NearestStopsTable onSelect={handleSelectPark} selectedPark={selectedPark} />
          </div>

          {/* Карта - 60% ширины */}
          <div className="w-3/5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm map-container">
            <MapTiler
              selectedPark={selectedPark}
              visibleTypes={visibleTypes}
              onToggleVisibility={handleToggleVisibility}
              onClearSelection={() => setSelectedPark(null)}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, TreePine, BarChartIcon as ChartBar, Route, Target, TrendingUp, Plus, Info, Navigation } from 'lucide-react';
import MapTiler from '../components/MapTiler';
import NearestStopsTable from '../components/NearestStopsTable';
import { calculateRouteMetrics } from '../utils/routeMetrics';

interface SelectedPark {
  id: number | null;
  parkName: string;
  parkDistrict: string;
  distance: number | null;
  unique_id: string;
}

export default function Dashboard() {
  const [selectedPark, setSelectedPark] = useState<SelectedPark | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>([
    "Остановка", "Маршрут автобуса", "Озеленение"
  ]);
  const [routeMetrics, setRouteMetrics] = useState<any>(null);
  const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null);

  // Загрузка метрик маршрутов
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}final.geojson`);
        const data = await response.json();
        const metrics = calculateRouteMetrics(data);
        setRouteMetrics(metrics);
      } catch (error) {
        console.error('Ошибка загрузки метрик:', error);
      }
    };
    
    loadMetrics();
  }, []);

  const handleToggleVisibility = (type: string) => {
    setVisibleTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const kpiCards = [
    { title: 'Маршруты автобусов', value: '190', icon: Bus, change: '+12%', trend: 'up' },
    { title: 'Остановки', value: '2,791', icon: MapPin, change: '+48', trend: 'up' },
    { title: 'Общественные пространства', value: '1,838', icon: TreePine, change: '+254м', trend: 'up' },
    { title: 'Покрытие города', value: '72%', icon: ChartBar, change: '+60%', trend: 'up' },
    { title: 'Новые маршруты', value: routeMetrics?.totalNewRoutes || '60', icon: Route, change: `${routeMetrics?.totalNewRoutesLength || '471'} км`, trend: 'up' },
    { title: 'Эффективность', value: '60%', icon: TrendingUp, change: '+60%', trend: 'up' }
  ];

  // Компонент информационного поп-апа
  const InfoPopup = () => {
    if (!showInfoPopup) return null;

    return (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Алгоритм расчета новых маршрутов</h3>
              <button 
                                 onClick={() => setShowInfoPopup(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-800 font-medium">
                🎯 <strong>Цель:</strong> Улучшить транспортную доступность общественных пространств через новые маршруты и удлинения существующих
              </p>
            </div>
            
            {/* Алгоритм новых маршрутов */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Route className="w-5 h-5 mr-2 text-green-600" />
                🆕 Алгоритм новых маршрутов:
              </h4>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p><strong>Поиск целей:</strong> Для каждого жилого массива находим общественные пространства на расстоянии 7-14 км (недоступные пешком, но важные для горожан)</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p><strong>Построение маршрута:</strong> Используя граф улиц города, находим кратчайший путь по существующим дорогам между жилым районом и парком</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p><strong>Фильтрация по длине:</strong> Отбрасываем слишком короткие маршруты (менее 10 км) - они не оправдывают создание нового маршрута</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <p><strong>Проверка эффективности:</strong> Маршрут должен пересекаться с существующими не более чем на 35% и проходить по незагруженным улицам</p>
                </div>
              </div>
            </div>

            {/* Алгоритм удлинений */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-blue-600" />
                🔄 Алгоритм удлинений маршрутов:
              </h4>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p><strong>Анализ коротких маршрутов:</strong> Выбираем существующие маршруты короче средней длины по городу для потенциального удлинения</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p><strong>Поиск удаленных целей:</strong> Находим общественные пространства на расстоянии более 2 км от конца маршрута</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p><strong>Привязка к остановкам:</strong> Используем существующие остановки маршрута (в радиусе 50м) как стартовые точки для удлинения</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <p><strong>Построение удлинения:</strong> От ближайшей к цели остановки строим путь по графу улиц до общественного пространства</p>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
              <h4 className="font-medium text-emerald-800 mb-2">📊 Результаты анализа:</h4>
              <div className="text-emerald-700 space-y-1">
                <p>• <strong>30 новых маршрутов</strong> от жилых массивов к отдаленным паркам</p>
                <p>• <strong>30 удлинений</strong> существующих коротких маршрутов</p>
                <p>• <strong>471 км</strong> общей длины новых участков</p>
                <p>• <strong>1,100 общественных пространств</strong> получат улучшенную доступность</p>
                <p>• <strong>60% улучшение</strong> транспортного покрытия города</p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
              <h4 className="font-medium text-orange-800 mb-2">⚙️ Технические параметры:</h4>
              <div className="text-orange-700 space-y-1 text-sm">
                <p>• <strong>Проекция EPSG:3857</strong> для точных расчетов в метрах</p>
                <p>• <strong>Граф улиц NetworkX</strong> для поиска оптимальных путей</p>
                <p>• <strong>Буферная зона 2км</strong> для поиска удаленных целей</p>
                <p>• <strong>Радиус привязки 50м</strong> для остановок на маршрутах</p>
                <p>• <strong>Фильтр &gt;10км</strong> для экономической целесообразности</p>
              </div>
            </div>
          </div>
                 </div>
       </div>
     );
   };

  return (
    <div className="p-6 space-y-6">
      {/* Микро заголовок */}
      <div className="flex items-center justify-between mb-2 h-6">
        <h1 className="text-xs font-medium text-gray-600 leading-none">Анализ доступности</h1>
        <Link 
          to="/routes" 
          className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors h-5"
        >
          Рекомендации →
        </Link>
      </div>

      {/* KPI карточки на всю ширину */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  {card.title === 'Новые маршруты' && (
                    <button
                      onClick={() => setShowInfoPopup('new-routes')}
                      className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Подробнее об алгоритме расчета"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {card.title === 'Новые маршруты' ? 'общей длины' : 
                     card.title === 'Эффективность' ? 'Улучшение доступности' : 
                     'от прошлого месяца'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <card.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Таблица слева и карта справа на одном уровне */}
      <div className="flex h-[600px] content-padding layout-flex">
        {/* Таблица - 40% ширины */}
        <div className="w-2/5 bg-white rounded-lg shadow-sm border border-gray-200 sidebar">
          <NearestStopsTable 
            selectedPark={selectedPark}
            onSelect={setSelectedPark}
          />
        </div>

        {/* Карта - 60% ширины */}
        <div className="w-3/5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden map-container">
          <MapTiler
            selectedPark={selectedPark}
            visibleTypes={visibleTypes}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>
      
      {/* Информационный поп-ап */}
      <InfoPopup />
    </div>
  );
} 
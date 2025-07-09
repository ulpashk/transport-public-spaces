import React from 'react';
import {
  MapPin,
  Navigation,
  Route,
  Trees,
  Waves,
  Circle,
  Map as MapIcon,
  ArrowUp
} from 'lucide-react';

interface LegendItem {
  type: string;
  color: string;
  count: number;
  visible: boolean;
}

interface MapLegendProps {
  items: LegendItem[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const MapLegend: React.FC<MapLegendProps> = ({ items, position = 'bottom-left' }) => {

  // Определяем иконки для разных типов объектов
  const getIcon = (type: string) => {
    const iconProps = {
      size: 16,
      strokeWidth: 2,
    };

    switch (type) {
      case "Остановка":
        return <MapPin {...iconProps} />;
      case "Рекомендованная остановка":
        return <Navigation {...iconProps} />;
      case "Маршрут автобуса":
        return <Route {...iconProps} />;
      case "Рекомендованный маршрут":
        return <ArrowUp {...iconProps} />;
      case "Удлинить маршрут":
        return <MapIcon {...iconProps} />;
      case "Озеленение":
        return <Trees {...iconProps} />;
      case "Озёра":
        return <Waves {...iconProps} />;
      case "Реки":
        return <Waves {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  // Получаем полное название
  const getFullName = (type: string) => {
    switch (type) {
      case "Маршрут автобуса":
        return "Автобусные маршруты";
      case "Рекомендованный маршрут":
        return "Рекомендованные маршруты";
      case "Удлинить маршрут":
        return "Удлинения маршрутов";
      case "Остановка":
        return "Остановки";
      case "Рекомендованная остановка":
        return "Рекомендованные остановки";
      case "Озеленение":
        return "Общественные пространства";
      case "Озёра":
        return "Озёра";
      case "Реки":
        return "Реки";
      default:
        return type;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'bottom-4 left-4';
    }
  };

  // Показываем только видимые слои
  const visibleItems = items.filter(item => item.visible);

  if (visibleItems.length === 0) return null;

  return (
    <div className={`absolute ${getPositionClasses()} z-40`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
        <div className="text-sm font-semibold text-gray-800 mb-2">Легенда карты</div>
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              {/* Иконка */}
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ color: item.color }}
              >
                {getIcon(item.type)}
              </div>

              {/* Название и количество */}
              <div className="flex-1 min-w-0">
                <div className={'legend_item'}>
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {getFullName(item.type)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.count.toLocaleString()}
                  </div>
                </div>

              </div>

              {/* Цветовой индикатор */}
              <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{backgroundColor: item.color}}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapLegend;

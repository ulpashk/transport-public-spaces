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

interface LegendOverlayProps {
  items: LegendItem[];
  onToggleVisibility: (type: string) => void;
}

const LegendOverlay: React.FC<LegendOverlayProps> = ({
  items,
  onToggleVisibility
}) => {

  // Определяем иконки для разных типов объектов
  const getIcon = (type: string, color: string) => {
    const iconProps = {
      size: 18,
      strokeWidth: 2.5,
      style: {
        color: color + ' !important',
        fill: 'currentColor',
        stroke: 'currentColor'
      }
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

  // Сокращаем длинные названия
  const getShortName = (type: string) => {
    switch (type) {
      case "Маршрут автобуса":
        return "Автобус";
      case "Рекомендованный маршрут":
        return "Рек. маршрут";
      case "Удлинить маршрут":
        return "Рек. Удлинения";
      case "Остановка":
        return "Остановка";
      case "Рекомендованная остановка":
        return "Рек. остановка";
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

  return (
    <div className="bg-white rounded-t-lg shadow-sm border border-gray-100 border-b-0 overflow-hidden">
      <div className="flex w-full wrapper_button">
        {items.map((item, index) => (
          <button
            key={item.type}
            onClick={() => onToggleVisibility(item.type)}
            className={`
              flex-1 relative group transition-all duration-200 ease-in-out hover:scale-105 active:scale-95
              ${item.visible 
                ? 'shadow-sm hover:shadow-md' 
                : 'opacity-90 hover:opacity-100 border-2 border-gray-300'
              }
              flex flex-col justify-center items-center py-3 px-1
              cursor-pointer border-r border-gray-200 last:border-r-0
              ${!item.visible ? 'mx-1 rounded-lg' : ''}
              min-w-0 w-full
            `}
            style={{
              backgroundColor: item.visible ? item.color : '#ffffff',
              color: item.visible ? '#00000080' : item.color,
              outline: 'none'
            }}
            title={`${item.type} (${item.count})`}
          >
            {/* Иконка */}
            <div
              className="flex items-center justify-center leading-none mb-2"
              style={{
                color: item.visible ? 'white !important' : item.color + ' !important',
                fill: item.visible ? 'white' : item.color,
                stroke: item.visible ? 'white' : item.color
              }}
            >
              <div
                style={{
                  color: item.visible ? 'white !important' : item.color + ' !important',
                  fill: item.visible ? 'white !important' : item.color + ' !important',
                  stroke: item.visible ? 'white !important' : item.color + ' !important'
                }}
              >
                {getIcon(item.type, item.visible ? 'white' : item.color)}
              </div>
            </div>

            {/* Название без цифр */}
            <div
              className="text-xs font-semibold text-center leading-tight"
              style={{
                color: item.visible ? 'white !important' : '#1f2937 !important'
              }}
            >
              {getShortName(item.type)}
            </div>

            {/* Активный индикатор */}
            {item.visible && (
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)'
                }}
              ></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegendOverlay;

// Helper function for generating legend colors - должно соответствовать цветам в MapTiler
export const generateLegendColors = () => {
  return {
    'Маршрут автобуса': '#3B82F6',
    'Рекомендованный маршрут': '#10B981',
    'Удлинить маршрут': '#F59E0B',
    'Остановка': '#EF4444',
    'Рекомендованная остановка': '#8B5CF6',
    'Озеленение': '#22C55E',
    'Реки': '#0EA5E9'
  };
};

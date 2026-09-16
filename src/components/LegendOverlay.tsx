import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Route,
  Trees,
  Circle,
  Map as MapIcon,
  ArrowUp,
  Layers,
  ChevronDown,
  Check
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

const typeStyles: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  "Маршрут автобуса": { bg: "bg-[#eef4ff]", border: "border-[#c1d3ff]", text: "text-[#236FFF]", iconBg: "bg-[#c1d3ff]" },
  "Рекомендованный маршрут": { bg: "bg-[#fff4ed]", border: "border-[#ffdbca]", text: "text-[#ea580c]", iconBg: "bg-[#ffdbca]" },
  "Удлинить маршрут": { bg: "bg-[#f5f3ff]", border: "border-[#ddd6fe]", text: "text-[#7c3aed]", iconBg: "bg-[#ddd6fe]" },
  "Остановка": { bg: "bg-[#fdf2f2]", border: "border-[#fbd5d5]", text: "text-[#e02424]", iconBg: "bg-[#fbd5d5]" },
  "Рекомендованная остановка": { bg: "bg-[#f0f9ff]", border: "border-[#bae6fd]", text: "text-[#0284c7]", iconBg: "bg-[#bae6fd]" },
  "Озеленение": { bg: "bg-[#e7f6f2]", border: "border-[#b9e5d8]", text: "text-[#059669]", iconBg: "bg-[#b9e5d8]" },
  "Реки": { bg: "bg-[#f0f9ff]", border: "border-[#bae6fd]", text: "text-[#0EA5E9]", iconBg: "bg-[#bae6fd]" },
  "Озёра": { bg: "bg-[#f0f9ff]", border: "border-[#bae6fd]", text: "text-[#0EA5E9]", iconBg: "bg-[#bae6fd]" },
};

const LegendOverlay: React.FC<LegendOverlayProps> = ({ items, onToggleVisibility }) => {

  const getIcon = (type: string) => {
    const style = typeStyles[type] || typeStyles["Озеленение"];
    const iconProps = { size: 16, className: style.text.replace('text-', 'text-') };

    switch (type) {
      case "Остановка": return <MapPin {...iconProps} />;
      case "Рекомендованная остановка": return <Navigation {...iconProps} />;
      case "Маршрут автобуса": return <Route {...iconProps} />;
      case "Рекомендованный маршрут": return <ArrowUp {...iconProps} />;
      case "Удлинить маршрут": return <MapIcon {...iconProps} />;
      case "Озеленение": return <Trees {...iconProps} />;
      default: return <Circle {...iconProps} />;
    }
  };

  const getShortName = (type: string) => {
    switch (type) {
      case "Маршрут автобуса": return "Автобус";
      case "Рекомендованный маршрут": return "Рек. маршрут";
      case "Удлинить маршрут": return "Рек. Удлинения";
      case "Рекомендованная остановка": return "Рек. транспорт";
      case "Озеленение": return "Общественные пространства";
      default: return type;
    }
  };

  const renderLabel = (type: string) => {
    const name = getShortName(type);
    if (name === "Общественные пространства") {
      return (
        <span className="leading-tight text-center">
          Общественные<br/>пространства
        </span>
      );
    }
    return <span>{name}</span>;
  };

  return (
    <div className="p-2 bg-white grid grid-cols-6 gap-2 w-full">
      {items.map((item) => {
        const isSelected = item.visible;
        const style = typeStyles[item.type] || typeStyles["Озеленение"];
        
        return (
          <button
            key={item.type}
            onClick={() => onToggleVisibility(item.type)}
            className={`
              flex items-center justify-center gap-1.5 py-1 px-1 rounded-lg border text-[10px] font-bold uppercase transition-all duration-200 h-[60px] ${style.text}
              ${isSelected 
                ? `${style.bg} ${style.border}`
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className={isSelected ? "text-inherit" : style.text}>
              {getIcon(item.type)}
            </div>
            
            <div className="text-center leading-tight">
               {renderLabel(item.type)}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default LegendOverlay;

export const generateLegendColors = () => ({
    'Маршрут автобуса': '#236FFF',
    'Рекомендованный маршрут': '#ea580c',
    'Удлинить маршрут': '#7c3aed',
    'Остановка': '#e02424',
    'Рекомендованная остановка': '#0284c7',
    'Озеленение': '#059669',
    'Реки': '#0EA5E9'
});
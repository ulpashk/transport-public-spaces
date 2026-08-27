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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string, active: boolean) => {
    const style = typeStyles[type] || typeStyles["Озеленение"];
    const iconProps = { size: 14, className: active ? style.text : "text-gray-400" };

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
      case "Рекомендованная остановка": return "Рек. остановка";
      case "Удлинить маршрут": return "Рек. Удлинения";
      case "Озеленение": return "Общ. пространства";
      default: return type;
    }
  };

  const activeCount = items.filter(i => i.visible).length;

  return (
    <div className="p-2.5 bg-white relative z-[100]" ref={dropdownRef}>
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-200 shadow-sm
            ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-gray-50'}
          `}
        >
          <Layers size={16} className={isOpen ? "text-blue-600" : "text-gray-500"} />
          <span className="text-xs font-bold uppercase tracking-tight">Слои</span>
          
          <div className="bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ml-0.5 shadow-sm">
            {activeCount}
          </div>
          
          <ChevronDown size={14} className={`transition-transform duration-200 opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 space-y-1 animate-in fade-in zoom-in duration-150 origin-top-left">
            <div className="px-3 py-2 border-b border-gray-50 mb-1">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 Видимость объектов
               </p>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {items.map((item) => {
                const style = typeStyles[item.type] || typeStyles["Озеленение"];
                
                return (
                  <button
                    key={item.type}
                    onClick={() => onToggleVisibility(item.type)}
                    className={`
                      w-full flex items-center justify-between p-2 rounded-xl transition-all duration-150 group
                      ${item.visible ? `${style.bg} border border-transparent` : 'bg-transparent hover:bg-gray-50 border border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${item.visible ? style.iconBg : 'bg-gray-100'}`}>
                        {getIcon(item.type, item.visible)}
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className={`text-[11px] font-bold uppercase tracking-wide ${item.visible ? style.text : 'text-gray-500'}`}>
                          {getShortName(item.type)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {item.count} объектов
                        </span>
                      </div>
                    </div>

                    {item.visible && (
                      <div className={`${style.text} mr-1`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegendOverlay;

export const generateLegendColors = () => {
  return {
    'Маршрут автобуса': '#236FFF',
    'Рекомендованный маршрут': '#ea580c',
    'Удлинить маршрут': '#7c3aed',
    'Остановка': '#e02424',
    'Рекомендованная остановка': '#0284c7',
    'Озеленение': '#059669',
    'Реки': '#0EA5E9'
  };
};
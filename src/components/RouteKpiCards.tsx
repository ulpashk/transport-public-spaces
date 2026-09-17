import React from "react";
import { Route, Target, TrendingUp, Info, MapPin, Bus } from "lucide-react";

interface RouteKpiCardsProps {
  routes: any[];
  metrics: any;
  onInfoClick: (type: string) => void;
}

export default function RouteKpiCards({ routes, metrics, onInfoClick }: RouteKpiCardsProps) {
  const hoverClasses = "transition-all duration-300 hover:shadow-md cursor-default";

  const KpiCard = ({ title, value, unit, subtext, icon: Icon, infoType }: any) => (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 h-24 ${hoverClasses}`}>
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f6f2] flex items-center justify-center">
        <Icon size={22} className="text-[#059669]" />
      </div>

      <div className="flex flex-col justify-center flex-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-gray-500">{title}</p>
          <button 
            onClick={() => onInfoClick(infoType)}
            className="text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <Info size={14} />
          </button>
        </div>
        
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-[#1e293b]">{value}</p>
          {unit && <span className="text-sm font-bold text-[#1e293b]">{unit}</span>}
        </div>
        
        <div className="flex items-center text-[10px] font-semibold text-gray-500 mt-0.5">
          {subtext}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <KpiCard 
        title="Новые остановки" 
        value={routes.filter(r => r.type === "Рекомендованный маршрут").length} 
        unit="" 
        subtext="Рекомендуемых" 
        icon={MapPin} 
        infoType="new-routes"
      />
      <KpiCard 
        title="У гробя"
        value={routes.filter(r => r.type === "Удлинить маршрут").length} 
        unit="" 
        subtext="Существующих маршрутов" 
        icon={Route} 
        infoType="extensions"
      />
      <KpiCard 
        title="Охват окружающей среды" 
        value={metrics?.spacesServedByNewSolutions || '0'} 
        unit="" 
        subtext="Обслуживаемых объектов"
        icon={Target} 
        infoType="coverage"
      />
      <KpiCard 
        title="Общий препарат" 
        value={metrics?.totalNewRoutesLength || '0'} 
        unit="км" 
        subtext="Новых маршрутов" 
        icon={Bus} 
        infoType="total-length"
      />
      <KpiCard 
        title="Яртоц" 
        value={`+${metrics?.improvementPercentage || '0'}%`} 
        unit="" 
        subtext="Улучшение доступности" 
        icon={TrendingUp} 
        infoType="efficiency"
      />
    </>
  );
}
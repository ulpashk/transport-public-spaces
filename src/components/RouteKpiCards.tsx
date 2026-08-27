import { Route, Navigation, TreePine, Target, TrendingUp, Info } from "lucide-react";

interface RouteKpiCardsProps {
  routes: any[];
  metrics: any;
  onInfoClick: (type: string) => void;
}

export default function RouteKpiCards({ routes, metrics, onInfoClick }: RouteKpiCardsProps) {
  const hoverClasses = "transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default";

  return (
    <>
      <div className={`bg-[#eef4ff] p-3 rounded-xl shadow-sm border border-[#c1d3ff] flex flex-col justify-between h-28 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Новые маршруты</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => onInfoClick('new-routes')} className="text-[#c1d3ff] hover:text-[#236FFF] transition-colors">
              <Info size={14} />
            </button>
            <div className="bg-[#c1d3ff] p-1.5 rounded-lg text-[#236FFF]">
              <Route size={16} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {routes.filter(r => r.type === "Рекомендованный маршрут").length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Рекомендовано</p>
        </div>
      </div>

      <div className={`bg-[#f0f4ff] p-3 rounded-xl shadow-sm border border-[#d1d5db] flex flex-col justify-between h-28 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Удлинения</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => onInfoClick('extensions')} className="text-gray-300 hover:text-indigo-600 transition-colors">
              <Info size={14} />
            </button>
            <div className="bg-gray-200 p-1.5 rounded-lg text-indigo-600">
              <Navigation size={16} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">
            {routes.filter(r => r.type === "Удлинить маршрут").length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Существующих линий</p>
        </div>
      </div>

      <div className={`bg-[#e7f6f2] p-3 rounded-xl shadow-sm border border-[#b9e5d8] flex flex-col justify-between h-28 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Охват объектов</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => onInfoClick('coverage')} className="text-[#b9e5d8] hover:text-[#059669] transition-colors">
              <Info size={14} />
            </button>
            <div className="bg-[#b9e5d8] p-1.5 rounded-lg text-[#059669]">
              <TreePine size={16} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.spacesServedByNewSolutions || '730'}</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">С улучшенной связью</p>
        </div>
      </div>

      <div className={`bg-[#f5f3ff] p-3 rounded-xl shadow-sm border border-[#ddd6fe] flex flex-col justify-between h-28 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Общая длина</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => onInfoClick('total-length')} className="text-[#ddd6fe] hover:text-[#7c3aed] transition-colors">
              <Info size={14} />
            </button>
            <div className="bg-[#ddd6fe] p-1.5 rounded-lg text-[#7c3aed]">
              <Target size={16} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.totalNewRoutesLength || '0'} км</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Новых маршрутов</p>
        </div>
      </div>

      <div className={`bg-[#fff4ed] p-3 rounded-xl shadow-sm border border-[#ffdbca] flex flex-col justify-between h-28 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Эффективность</p>
          <div className="flex gap-2 items-center">
            <button onClick={() => onInfoClick('efficiency')} className="text-[#ffdbca] hover:text-[#ea580c] transition-colors">
              <Info size={14} />
            </button>
            <div className="bg-[#ffdbca] p-1.5 rounded-lg text-[#ea580c]">
              <TrendingUp size={16} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">+{metrics?.improvementPercentage || '0'}%</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Рост доступности</p>
        </div>
      </div>
    </>
  );
}
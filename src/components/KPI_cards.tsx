import { Navigation, TreePine, Target, TrendingUp, Route } from "lucide-react";

export default function KPI_cards({ metrics }: { metrics: any }) {
  const hoverClasses = "transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default";

  return (
    <>
      <div className={`bg-[#eef4ff] p-3 rounded-xl shadow-sm border border-[#c1d3ff] flex flex-col justify-between h-24 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Маршруты</p>
          <div className="bg-[#c1d3ff] p-1.5 rounded-lg text-[#236FFF]">
            <Navigation size={16} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.routes || '0'}</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Автобусных линий</p>
        </div>
      </div>

      <div className={`bg-[#e7f6f2] p-3 rounded-xl shadow-sm border border-[#b9e5d8] flex flex-col justify-between h-24 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Общ. пространства</p>
          <div className="bg-[#b9e5d8] p-1.5 rounded-lg text-[#059669]">
            <TreePine size={16} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.publicSpaces || '0'}</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Парки и зоны</p>
        </div>
      </div>

      <div className={`bg-[#fff4ed] p-3 rounded-xl shadow-sm border border-[#ffdbca] flex flex-col justify-between h-24 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Ср. расстояние</p>
          <div className="bg-[#ffdbca] p-1.5 rounded-lg text-[#ea580c]">
            <Target size={16} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.averageDistanceM || '0'} м</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">До остановки</p>
        </div>
      </div>

      <div className={`bg-[#fdf2f2] p-3 rounded-xl shadow-sm border border-[#fbd5d5] flex flex-col justify-between h-24 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Рек. остановки</p>
          <div className="bg-[#fbd5d5] p-1.5 rounded-lg text-[#e02424]">
            <TrendingUp size={16} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.recommendedStops || '0'}</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Новых точек</p>
        </div>
      </div>

      <div className={`bg-[#f0f9ff] p-3 rounded-xl shadow-sm border border-[#bae6fd] flex flex-col justify-between h-24 ${hoverClasses}`}>
        <div className="flex justify-between items-start">
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Протяженность</p>
          <div className="bg-[#bae6fd] p-1.5 rounded-lg text-[#0284c7]">
            <Route size={16} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{metrics?.totalLengthKm || '0'} км</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">Маршрутной сети</p>
        </div>
      </div>
    </>
  );
}
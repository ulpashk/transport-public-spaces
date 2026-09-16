import { Bus, TreePine, Target, MapPin, Network, ArrowUp, ArrowDown } from "lucide-react";

export default function KPI_cards({ metrics }: { metrics: any }) {
  const hoverClasses = "transition-all duration-300 hover:shadow-md cursor-default";

  const data = [
    { title: "Маршруты", value: metrics?.routes || '0', unit: "", subtext: "Автобусных маршрутов", icon: Bus, trend: "up" },
    { title: "Общественные пространства", value: metrics?.publicSpaces || '0', unit: "", subtext: "Парки и скверы", icon: TreePine, trend: "up" },
    { title: "Среднее расстояние", value: metrics?.averageDistanceM || '0', unit: "м", subtext: "До ближайшей остановки", icon: Target, trend: "down" },
    { title: "Рекомендуемые остановки", value: metrics?.recommendedStops || '0', unit: "", subtext: "Потенциальные точки", icon: MapPin, trend: "up" },
    { title: "Общая протяженность", value: metrics?.totalLengthKm || '0', unit: "км", subtext: "Маршрутной сети", icon: Network, trend: "up" },
  ];

  return (
    <>
      {data.map((item, idx) => (
        <div key={idx} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 h-24 ${hoverClasses}`}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#e7f6f2] flex items-center justify-center">
            <item.icon size={22} className="text-[#059669]" />
          </div>
          
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold text-gray-500">{item.title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-[#1e293b]">{item.value}</p>
              {item.unit && <span className="text-sm font-bold text-[#1e293b]">{item.unit}</span>}
            </div>
            <div className={`flex items-center text-[10px] font-bold mt-0.5 ${item.trend === 'up' ? 'text-green-600' : 'text-green-600'}`}>
              {item.trend === 'up' ? <ArrowUp size={10} className="mr-1" /> : <ArrowDown size={10} className="mr-1" />}
              {item.subtext}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
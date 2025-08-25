// src/pages/Stats.tsx
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import { MapPin, Download } from "lucide-react";

export default function Stats() {
  const [counts, setCounts] = useState<{ type: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}final.geojson`)
      .then(res => res.json())
      .then(data => {
        const tally: Record<string, number> = {};
        data.features.forEach((f: any) => {
          tally[f.properties.type] = (tally[f.properties.type] || 0) + 1;
        });
        setCounts(Object.entries(tally).map(([type, count]) => ({ type, count })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#F59E0B", "#329ea8", "#EF4444", "#8B5CF6", "#06B6D4"];

  // формируем данные для PieChart
  const pieData = counts.map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }));

  // пример временной серии
  const timeSeries = [
    { month: "Янв", value: 210 },
    { month: "Фев", value: 218 },
    { month: "Мар", value: 225 },
    { month: "Апр", value: 230 },
    { month: "Май", value: 234 },
    { month: "Июн", value: 234 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Export */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Статистика и аналитика</h1>
              <p className="text-gray-600 mt-1">Детальный анализ транспортной системы Алматы</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
            <Download className="w-5 h-5" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
        {/* BarChart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Распределение объектов</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={counts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="type" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60}/>
                <YAxis tick={{ fontSize: 12 }}/>
                <Tooltip/>
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PieChart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Структура транспорта</h2>
          </div>
          <div className="p-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ percent }) => `${(percent*100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full px-4">
              {pieData.map((e,i)=>(
                <div key={i} className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{backgroundColor:e.color}}/>
                  <span className="text-sm text-gray-700 truncate">{e.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LineChart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Динамика развития</h2>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top:20,right:30,left:20,bottom:5 }}>
                <XAxis dataKey="month" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip/>
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

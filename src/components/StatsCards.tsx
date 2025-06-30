// src/components/StatsCards.tsx
import React, { useEffect, useState } from 'react';

interface Park {
  name: string;
  district: string;
}

export default function StatsCards() {
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/final.geojson')
      .then(res => res.json())
      .then(data => {
        const parksOnly = data.features
          .filter((f: any) => f.properties.type === 'Озеленение')
          .map((f: any) => ({
            name: f.properties.name || 'Без названия',
            district: f.properties.district || 'Неизвестно',
          }));
        setParks(parksOnly);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Общественные пространства (Озеленение)</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Район
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-auto">
          {parks.map((park, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {park.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {park.district}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Search, MapPin, Navigation, Eye } from "lucide-react";
import { getDisplayName } from "../utils/displayName";

type Row = {
  id: number | null;
  parkName: string;
  parkDistrict: string;
  distance: number | null;
  unique_id: string;
};

type SortKey = keyof Row;
type SortOrder = "asc" | "desc";

type NearestStopsTableProps = {
  onSelect: (row: Row | null) => void;
  selectedPark: Row | null;
};

export default function NearestStopsTable({ onSelect, selectedPark }: NearestStopsTableProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("distance");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [loading, setLoading] = useState(true);
  const [startIdx, setStartIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [pageInput, setPageInput] = useState("");

  const rowsPerPage = 10;

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}final.geojson`)
      .then(res => res.json())
      .then(data => {
        const greens = data.features.filter(
          (f: any) => f.properties.type === "Озеленение" && 
          f.properties.distance_to_stop !== null && 
          !isNaN(parseInt(f.properties.distance_to_stop)) &&
          parseInt(f.properties.distance_to_stop) <= 750
        );
        const table: Row[] = greens.map((park: any, index: number) => {
          // Создаем надежный unique_id на основе исходных данных или индекса
          let uniqueId = park.properties.unique_id;
          if (!uniqueId) {
            // Если нет unique_id, создаем на основе id или индекса
            uniqueId = park.properties.id ? `park_id_${park.properties.id}` : `park_index_${index}`;
          }
          
          return {
            id: park.properties.id ?? null,
            parkName: getDisplayName(park.properties.name),
            parkDistrict: park.properties.district || "Неизвестно", 
            distance: park.properties.distance_to_stop ?? null,
            unique_id: uniqueId,
          };
        });
        setRows(table);
        setLoading(false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

    const filteredRows = search 
    ? rows.filter(row => 
        row.parkName.toLowerCase().includes(search.toLowerCase()) ||
        (row.id !== null && row.id.toString().includes(search))
      )
    : rows;

  const sortedRows = [...filteredRows].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (sortKey === "distance") {
      valA = typeof valA === "number" ? valA : Number(valA);
      valB = typeof valB === "number" ? valB : Number(valB);
    } else {
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
    }
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const visibleRows = sortedRows.slice(startIdx, startIdx + rowsPerPage);
  const pageCount = Math.ceil(sortedRows.length / rowsPerPage);
  const currentPage = Math.floor(startIdx / rowsPerPage) + 1;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(order => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setStartIdx(0);
  }

  function handlePrev() {
    setStartIdx(idx => Math.max(0, idx - rowsPerPage));
  }

  function handleNext() {
    setStartIdx(idx => Math.min(sortedRows.length - rowsPerPage, idx + rowsPerPage));
  }

  function handlePageInput() {
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= pageCount) {
      setStartIdx((pageNum - 1) * rowsPerPage);
      setPageInput("");
    }
  }

  useEffect(() => {
    setStartIdx(0);
  }, [search]);

  // Функция для получения цвета индикатора расстояния
  const getDistanceColor = (distance: number | null) => {
    if (distance === null) return "bg-gray-400";
    if (distance <= 200) return "bg-green-500";
    if (distance <= 500) return "bg-yellow-500";
    if (distance <= 1000) return "bg-orange-500";
    return "bg-red-500";
  };

  // Функция для получения текста статуса
  const getDistanceStatus = (distance: number | null) => {
    if (distance === null) return "Неизвестно";
    if (distance <= 200) return "Отлично";
    if (distance <= 500) return "Хорошо";
    if (distance <= 1000) return "Удовлетворительно";
    return "Плохо";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Загрузка данных...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Заголовок с градиентом */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Ближайшие остановки к общественным пространствам</h2>
            </div>
            <p className="text-green-100 mt-2 text-sm">
              Анализ транспортной доступности {sortedRows.length} общественных пространств города
            </p>
          </div>
          
          {/* Поиск с иконкой */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
                                placeholder="Поиск по названию или ID..."
              className="pl-10 pr-4 py-2.5 w-full sm:w-72 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Таблица с улучшенным дизайном */}
      <div className="overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th 
                  className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center space-x-2">
                    <span>ID</span>
                    <div className="text-gray-400 text-lg">
                      {sortKey === "id" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                    </div>
                  </div>
                </th>
                <th 
                  className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                  onClick={() => handleSort("parkName")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Название общественного пространства</span>
                    <div className="text-gray-400 text-lg">
                      {sortKey === "parkName" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                    </div>
                  </div>
                </th>
                <th 
                  className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                  onClick={() => handleSort("parkDistrict")}
                >
                  <div className="flex items-center space-x-2">
                    <span>Район</span>
                    <div className="text-gray-400 text-lg">
                      {sortKey === "parkDistrict" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                    </div>
                  </div>
                </th>
                <th 
                  className="group cursor-pointer px-6 py-4 text-center font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                  onClick={() => handleSort("distance")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Транспортная доступность</span>
                    <div className="text-gray-400 text-lg">
                      {sortKey === "distance" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {visibleRows.map((row, idx) => {
                const isSelected = selectedPark && row.unique_id === selectedPark.unique_id;
                return (
                  <tr
                    key={idx}
                    className={`group cursor-pointer transition-all duration-200 border-b border-gray-100 hover:shadow-md ${
                      isSelected 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 shadow-inner border-green-200" 
                        : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50"
                    }`}
                    onClick={() => onSelect(row)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {row.id ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getDistanceColor(row.distance)} shadow-lg`}></div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 text-base">
                            {row.parkName}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {getDistanceStatus(row.distance)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Navigation className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 font-semibold text-base">{row.parkDistrict}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white ${getDistanceColor(row.distance)} shadow-lg`}>
                          {row.distance ? `${row.distance} м` : "Неизвестно"}
                        </div>
                        {isSelected && (
                          <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                            <Eye className="w-4 h-4" />
                            <span>Активен</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Красивая навигация */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={startIdx === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            ← Назад
          </button>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
              <span>Стр. {currentPage} из {pageCount}</span>
              <span className="text-gray-400">•</span>
              <span>{sortedRows.length} объектов</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 font-medium">Стр.:</span>
              <input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePageInput()}
                placeholder={`1-${pageCount}`}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                min="1"
                max={pageCount}
              />
              <button
                onClick={handlePageInput}
                disabled={!pageInput}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
              >
                →
              </button>
            </div>
          </div>
          
          <button
            onClick={handleNext}
            disabled={startIdx + rowsPerPage >= sortedRows.length}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { RouteData } from "../pages/RecommendedRoutes";

type SortKey = keyof RouteData;
type SortOrder = "asc" | "desc";

type RoutesTableProps = {
  onSelect: (route: RouteData | null) => void;
  selectedRoute: RouteData | null;
  routes: RouteData[];
  loading: boolean;
  error: string | null;
};

export default function RoutesTable({ onSelect, selectedRoute, routes, loading, error }: RoutesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [startIdx, setStartIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [pageInput, setPageInput] = useState("");

  const rowsPerPage = 10;

  const filteredRoutes = search
    ? routes.filter(route =>
        route.name.toLowerCase().includes(search.toLowerCase()) ||
        (route.uniqueId !== null && route.uniqueId.toString().includes(search))
      )
    : routes;

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (sortKey === "length" || sortKey === "publicSpaces") {
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

  const visibleRoutes = sortedRoutes.slice(startIdx, startIdx + rowsPerPage);
  const pageCount = Math.ceil(sortedRoutes.length / rowsPerPage);
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
    setStartIdx(idx => Math.min(sortedRoutes.length - rowsPerPage, idx + rowsPerPage));
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

  const getRouteTypeColor = (type: string) => {
    if (type === "Рекомендованный маршрут") return "bg-green-500";
    if (type === "Удлинить маршрут") return "bg-green-500";
    return "bg-gray-400";
  };

  const getRouteTypeStatus = (type: string) => {
    if (type === "Рекомендованный маршрут") return "Новый";
    if (type === "Удлинить маршрут") return "Удлинение";
    return "Обычный";
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Ошибка загрузки</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (type: string) => {
    if (type === "Рекомендованный маршрут") return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Новый" };
    return { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", label: "Удлинение" };
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="bg-white flex flex-col h-full border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Рекомендованные маршруты</h2>
          <p className="text-[11px] text-gray-500 tracking-tight">Анализ {sortedRoutes.length} маршрутов для улучшения доступности</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Поиск..."
            className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 bg-[#F9FAFB]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-gray-200">
            <tr>
              <th onClick={() => handleSort("uniqueId")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                ID
              </th>
              <th onClick={() => handleSort("name")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                Название маршрута
              </th>
              <th onClick={() => handleSort("district")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                Район
              </th>
              <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Тип</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {visibleRoutes.map((route) => {
              const isSelected = selectedRoute && route.id === selectedRoute.id;
              const status = getStatusBadge(route.type);
              return (
                <tr
                  key={route.id}
                  onClick={() => onSelect(isSelected ? null : route)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? "bg-blue-50/50" : ""}`}
                >
                  <td className="p-4 text-xs font-medium text-blue-600">{route.uniqueId ?? '—'}</td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">{route.name}</div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase">{route.length} км • {route.publicSpaces} объектов</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{route.district}</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status.dot}`}></span>
                      {status.label}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-[#F9FAFB]">
        <div className="text-xs text-gray-500 font-medium">Стр. {currentPage} из {pageCount}</div>
        <div className="flex gap-2">
          <button onClick={handlePrev} disabled={startIdx === 0} className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Назад</button>
          <button onClick={handleNext} disabled={startIdx + rowsPerPage >= sortedRoutes.length} className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Вперед</button>
        </div>
      </div>
    </div>
  );
}
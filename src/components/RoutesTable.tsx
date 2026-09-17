import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const [isEditingPage, setIsEditingPage] = useState<number | null>(null);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setStartIdx((page - 1) * rowsPerPage);
    }
  };

  const handleEllipsisClick = (pagePosition: 'left' | 'right') => {
    setIsEditingPage(pagePosition === 'left' ? currentPage - 2 : currentPage + 2);
  };

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

  useEffect(() => {
    setStartIdx(0);
  }, [search]);

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
    <div className="bg-white h-full flex flex-col border-l border-gray-200">
      <div className="p-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="text-white">
          <h2 className="text-m font-bold">Рекомендованные маршруты</h2>
          <p className="text-[11px] text-emerald-100 tracking-tight opacity-90">Анализ {sortedRoutes.length} маршрутов для улучшения доступности</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" size={14} />
          <input
            type="text"
            placeholder="Поиск по названию или ID..."
            className="pl-9 pr-4 py-2 text-xs border border-emerald-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 w-64 bg-emerald-800/40 text-white placeholder-emerald-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="text-[12px] text-gray-400 sticky top-0 z-10 bg-white">
            <tr>
              <th onClick={() => handleSort("uniqueId")} className="p-4 font-bold cursor-pointer">
                ID
              </th>
              <th onClick={() => handleSort("name")} className="p-4 font-bold cursor-pointer">
                Название маршрута
              </th>
              <th onClick={() => handleSort("district")} className="p-4 font-bold cursor-pointer">
                Тип
              </th>
              <th className="p-4 font-bold">Действие</th>
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
        <div className="text-xs text-gray-500 font-medium">
          Показано {startIdx + 1}–{Math.min(startIdx + rowsPerPage, sortedRoutes.length)} из {sortedRoutes.length}
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrev} 
            disabled={currentPage === 1}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft size={16}/>
          </button>

          <button
            onClick={() => goToPage(1)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === 1 ? 'bg-[#059669] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            1
          </button>

          {currentPage > 3 && (
            isEditingPage === currentPage - 2 ? (
              <input 
                type="number" autoFocus
                className="w-10 h-8 text-center text-xs border border-emerald-500 rounded-lg outline-none"
                onBlur={(e) => { setIsEditingPage(null); goToPage(parseInt(e.target.value)); }}
                onKeyDown={(e) => { if(e.key === 'Enter') { setIsEditingPage(null); goToPage(parseInt(e.currentTarget.value)); }}}
              />
            ) : (
              <span className="px-2 text-gray-400 cursor-pointer hover:text-emerald-600" onClick={() => handleEllipsisClick('left')}>...</span>
            )
          )}

          {currentPage !== 1 && currentPage !== pageCount && (
            <button className="w-8 h-8 rounded-lg text-xs font-bold bg-[#059669] text-white shadow-md">
              {currentPage}
            </button>
          )}

          {currentPage < pageCount - 2 && (
            isEditingPage === currentPage + 2 ? (
              <input 
                type="number" autoFocus
                className="w-10 h-8 text-center text-xs border border-emerald-500 rounded-lg outline-none"
                onBlur={(e) => { setIsEditingPage(null); goToPage(parseInt(e.target.value)); }}
                onKeyDown={(e) => { if(e.key === 'Enter') { setIsEditingPage(null); goToPage(parseInt(e.currentTarget.value)); }}}
              />
            ) : (
              <span className="px-2 text-gray-400 cursor-pointer hover:text-emerald-600" onClick={() => handleEllipsisClick('right')}>...</span>
            )
          )}

          {pageCount > 1 && (
            <button
              onClick={() => goToPage(pageCount)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageCount ? 'bg-[#059669] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {pageCount}
            </button>
          )}

          <button 
            onClick={handleNext} 
            disabled={currentPage === pageCount}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}
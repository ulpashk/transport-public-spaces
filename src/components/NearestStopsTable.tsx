import React, { useEffect, useState } from "react";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
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
  const [filter, setFilter] = useState("Все");

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.parkName.toLowerCase().includes(search.toLowerCase()) || 
                          (row.id?.toString().includes(search));
    
    if (filter === "Все") return matchesSearch;
    if (filter === "0-300 м") return matchesSearch && row.distance !== null && row.distance <= 300;
    if (filter === "300-600 м") return matchesSearch && row.distance !== null && row.distance > 300 && row.distance <= 600;
    if (filter === "600+ м") return matchesSearch && row.distance !== null && row.distance > 600;
    return matchesSearch;
  });

  const rowsPerPage = 10;
  const [isEditingPage, setIsEditingPage] = useState<number | null>(null);

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
          let uniqueId = park.properties.unique_id;
          if (!uniqueId) {
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

  function handlePrev() { setStartIdx(idx => Math.max(0, idx - rowsPerPage)); }
  function handleNext() { setStartIdx(idx => Math.min(sortedRows.length - rowsPerPage, idx + rowsPerPage)); }

  useEffect(() => { setStartIdx(0); }, [search]);

  const getFilterColor = (label: string) => {
    switch (label) {
      case "0-300 м": return "bg-emerald-500";
      case "300-600 м": return "bg-yellow-500";
      case "600+ м": return "bg-red-500";
      default: return "";
    }
  };

  const getDistanceColor = (dist: number | null) => {
    if (dist === null) return "bg-gray-400";
    if (dist <= 300) return "bg-emerald-500";
    if (dist <= 600) return "bg-yellow-500";
    return "bg-red-500";
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setStartIdx((page - 1) * rowsPerPage);
    }
  };

  const handleEllipsisClick = (pagePosition: 'left' | 'right') => {
    setIsEditingPage(pagePosition === 'left' ? currentPage - 2 : currentPage + 2);
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="bg-white h-full flex flex-col border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="text-white">
          <h2 className="text-m font-bold">Общественные пространства</h2>
          <p className="text-[11px] text-emerald-100 tracking-tight opacity-90">
            Анализ {sortedRows.length} пространств и их доступности
          </p>
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

      <div className="flex gap-2 p-2 border-b border-gray-100 overflow-x-auto">
        {["Все", "0-300 м", "300-600 м", "600+ м"].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg border ${filter === f ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'bg-gray-50 border-gray-200'}`}
          >
            {f !== "Все" && <div className={`w-2 h-2 rounded-full ${getFilterColor(f)}`} />}
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="text-[12px] text-gray-400 sticky top-0 z-10 bg-white">
            <tr>
              <th className="p-2 font-bold">ID</th>
              <th className="p-2 font-bold">Общественное пространство</th>
              <th className="p-2 font-bold">Район</th>
              <th className="p-2 font-bold">Расстояние до остановки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleRows.map((row) => {
              const isSelected = selectedPark?.unique_id === row.unique_id;
              return (
                <tr 
                  key={row.unique_id} 
                  onClick={() => onSelect(isSelected ? null : row)}
                  className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="p-2 text-blue-600 font-bold text-xs">{row.id}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getDistanceColor(row.distance)}`}></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{row.parkName}</div>
                        <div className="text-[11px] text-gray-400">Парк/Сквер</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-gray-600">{row.parkDistrict}</td>
                  <td className="p-2 text-xs font-bold text-gray-800">{row.distance} м</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="text-gray-500 font-medium">
          Показано {startIdx + 1}–{Math.min(startIdx + rowsPerPage, sortedRows.length)} из {sortedRows.length}
        </span>
        
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
                type="number" 
                autoFocus
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
                type="number" 
                autoFocus
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
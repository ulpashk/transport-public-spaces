import React, { useEffect, useState } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
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

  function handlePrev() { setStartIdx(idx => Math.max(0, idx - rowsPerPage)); }
  function handleNext() { setStartIdx(idx => Math.min(sortedRows.length - rowsPerPage, idx + rowsPerPage)); }

  function handlePageInput() {
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= pageCount) {
      setStartIdx((pageNum - 1) * rowsPerPage);
      setPageInput("");
    }
  }

  useEffect(() => { setStartIdx(0); }, [search]);

  const getStatusBadge = (distance: number | null) => {
    if (distance === null) return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", label: "Неизвестно" };
    if (distance <= 200) return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: "Отлично" };
    if (distance <= 500) return { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", label: "Хорошо" };
    if (distance <= 1000) return { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", label: "Удовлетворительно" };
    return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Плохо" };
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown size={14} className="ml-2 opacity-20" />;
    return sortOrder === "asc" ? <ChevronUp size={14} className="ml-2 text-blue-600" /> : <ChevronDown size={14} className="ml-2 text-blue-600" />;
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="bg-white h-full flex flex-col border border-gray-200">
      
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div>
           <h2 className="text-sm font-bold text-gray-800">Ближайшие остановки к общественным пространствам</h2>
           <p className="text-[11px] text-gray-500 tracking-tight">Анализ доступности {sortedRows.length} объектов</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Поиск по названию или ID..."
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
              <th onClick={() => handleSort("id")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100 w-24">
                <div className="flex items-center">ID {renderSortIcon("id")}</div>
              </th>
              <th onClick={() => handleSort("parkName")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                <div className="flex items-center">Название {renderSortIcon("parkName")}</div>
              </th>
              <th onClick={() => handleSort("parkDistrict")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                <div className="flex items-center">Район {renderSortIcon("parkDistrict")}</div>
              </th>
              <th onClick={() => handleSort("distance")} className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer border-r border-gray-100">
                <div className="flex items-center">Доступность {renderSortIcon("distance")}</div>
              </th>
              <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {visibleRows.map((row) => {
              const isSelected = selectedPark && row.unique_id === selectedPark.unique_id;
              const status = getStatusBadge(row.distance);
              return (
                <tr
                  key={row.unique_id}
                  onClick={() => onSelect(isSelected ? null : row)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? "bg-blue-50/50" : ""}`}
                >
                  <td className="p-4 text-xs font-medium text-blue-600">{row.id ?? '—'}</td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-900">{row.parkName}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{row.parkDistrict}</td>
                  <td className="p-4 text-sm font-bold text-gray-700">{row.distance ? `${row.distance} м` : "—"}</td>
                  <td className="p-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${status.bg} ${status.text} border-transparent shadow-sm`}>
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
          Стр. {currentPage} из {pageCount} • {sortedRows.length} объектов
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Перейти:</span>
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePageInput()}
              className="w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={startIdx === 0}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Назад
            </button>
            <button
              onClick={handleNext}
              disabled={startIdx + rowsPerPage >= sortedRows.length}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Header from "../components/Header";
import MapTiler from "../components/MapTiler";
import NearestStopsTable from "../components/NearestStopsTable";
import { Loader } from "lucide-react";
import { loadGeoJSONData, calculateRealMetrics } from "../utils/realMetrics";
import KPI_cards from "../components/KPI_cards";

const ECO_TYPES = [
  "Озеленение"
];

export default function Home() {
  const [selectedPark, setSelectedPark] = useState<any>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(["Озеленение"]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await loadGeoJSONData();
        const realMetrics = calculateRealMetrics(data);
        setMetrics(realMetrics);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const handleToggleVisibility = (type: string) => {
    setVisibleTypes((prev) => prev.includes(type) 
      ? prev.filter(t => t !== type) 
      : [...prev, type]);
  };

  const handleSelectPark = (park: typeof selectedPark) => {
    setSelectedPark(park);
    if (park) {
      setVisibleTypes(["Озеленение"]);
    } else {
      setVisibleTypes(ECO_TYPES);
    }
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-[#F9FAFB] overflow-hidden">
        <Header />
        <div className="grid grid-cols-5 gap-4 px-6 py-6 flex-shrink-0">
          {loading ? (
            <div className="col-span-5 h-24 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
               <Loader className="animate-spin text-blue-500 mr-2" /> Загрузка...
            </div>
          ) : (
            <KPI_cards metrics={metrics} />
          )}
        </div>

        <div className="flex-1 flex px-6 pb-6 gap-6 min-h-0">
          <div className="w-[60%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <MapTiler
              selectedPark={selectedPark}
              visibleTypes={visibleTypes}
              onToggleVisibility={handleToggleVisibility}
              onClearSelection={() => handleSelectPark(null)}
            />
          </div>

          <div className="w-[40%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <NearestStopsTable onSelect={handleSelectPark} selectedPark={selectedPark} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
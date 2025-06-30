import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import type { Feature as GeoJSONFeature, Geometry } from "geojson";
import "leaflet/dist/leaflet.css";
import { getColorByType } from "../utils/colors";
import FloatingControls from "./FloatingControls";
import LegendOverlay, { generateLegendColors } from "./LegendOverlay";
import { Loader } from "lucide-react";

type FeatureType = GeoJSONFeature<
  Geometry,
  {
    type: string;
    id: number;
    name: string;
    district?: string;
    nearest_stop_ids?: number[];
    nearest_rec_stop_ids?: number[];
    nearby_route_ids?: number[];
    nearby_rec_route_ids?: number[];
    nearby_ext_route_ids?: number[];
  }
>;

type SelectedPark = {
  parkName: string;
  parkDistrict: string;
  unique_id?: string;
};

interface MapProps {
  selectedPark?: SelectedPark | null;
  visibleTypes: string[];
  onToggleVisibility: (type: string) => void;
}

function SetMapRef({ setMap }: { setMap: (m: LeafletMap) => void }) {
  const map = useMap();
  React.useEffect(() => setMap(map), [map, setMap]);
  return null;
}

export default function Map({ selectedPark, visibleTypes, onToggleVisibility }: MapProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [features, setFeatures] = useState<FeatureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/final.geojson")
      .then(res => res.json())
      .then(data => setFeatures(data.features as FeatureType[]))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Поиск выбранного парка
  const selectedParkFeature = useMemo(() => {
    if (!selectedPark) return null;
    return features.find(
      f =>
        f.properties.type === "Озеленение" &&
        f.properties.name === selectedPark.parkName &&
        f.properties.district === selectedPark.parkDistrict
    );
  }, [features, selectedPark]);

  // Фичи рядом с парком, по id
  const stopsNearby = useMemo(() => {
    if (!selectedParkFeature || !visibleTypes.includes("Остановка")) return [];
    const stopIds = (selectedParkFeature.properties.nearest_stop_ids ?? []).concat(
      selectedParkFeature.properties.nearest_rec_stop_ids ?? []
    );
    return features.filter(
      f => f.properties.type.includes("Остановка") && stopIds.includes(f.properties.id)
    );
  }, [features, selectedParkFeature, visibleTypes]);

  const routesNearby = useMemo(() => {
    if (!selectedParkFeature) return [];
    let ids: number[] = [];
    if (visibleTypes.includes("Маршрут автобуса"))
      ids = ids.concat(selectedParkFeature.properties.nearby_route_ids ?? []);
    if (visibleTypes.includes("Рекомендованный маршрут"))
      ids = ids.concat(selectedParkFeature.properties.nearby_rec_route_ids ?? []);
    if (visibleTypes.includes("Удлинить маршрут"))
      ids = ids.concat(selectedParkFeature.properties.nearby_ext_route_ids ?? []);
    // Уникализировать ids
    ids = Array.from(new Set(ids));
    return features.filter(
      f =>
        ["Маршрут автобуса", "Рекомендованный маршрут", "Удлинить маршрут"].includes(f.properties.type) &&
        ids.includes(f.properties.id)
    );
  }, [features, selectedParkFeature, visibleTypes]);

  const showSelectedPark = selectedParkFeature && visibleTypes.includes("Озеленение");

  // Обычный режим
  const points = useMemo(
    () =>
      features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          f.geometry.type === "Point"
      ),
    [features, visibleTypes]
  );
  const lines = useMemo(
    () =>
      features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          (f.geometry.type === "LineString" ||
            f.geometry.type === "MultiLineString")
      ),
    [features, visibleTypes]
  );
  const polygons = useMemo(
    () =>
      features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          (f.geometry.type === "Polygon" ||
            f.geometry.type === "MultiPolygon")
      ),
    [features, visibleTypes]
  );

  const legendItems = useMemo(
    () =>
      Object.entries(generateLegendColors()).map(([type, color]) => ({
        type,
        color,
        count: features.filter(f => f.properties.type === type).length,
        visible: visibleTypes.includes(type),
      })),
    [features, visibleTypes]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Loader className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-600">Ошибка: {error}</div>;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer center={[43.2389, 76.8897]} zoom={12} className="w-full h-full">
        <SetMapRef setMap={setMap} />
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />

        {/* Если выбран парк, показываем только его и объекты вокруг */}
        {selectedPark && (
          <>
            {showSelectedPark && (
              <GeoJSON
                data={selectedParkFeature!}
                style={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  weight: 4,
                  opacity: 1,
                  fillOpacity: 0.5,
                }}
              />
            )}
            {stopsNearby.map((f, i) => (
              <GeoJSON
                key={"stop" + f.properties.id}
                data={f}
                pointToLayer={(_, latlng) =>
                  L.circleMarker(latlng, {
                    radius: 9,
                    fillColor: f.properties.type === "Остановка" ? "#ef4444" : "#22d3ee", // red / cyan
                    color: "#fff",
                    weight: 2,
                    fillOpacity: 1,
                  })
                }
              />
            ))}
            {routesNearby.map((route, i) => (
              <GeoJSON
                key={"route" + route.properties.id}
                data={route}
                style={{
                  color:
                    route.properties.type === "Маршрут автобуса"
                      ? "#818cf8"
                      : route.properties.type === "Рекомендованный маршрут"
                      ? "#22c55e"
                      : "#f59e42", // оранж
                  weight: 6,
                  opacity: 0.8,
                  dashArray: "8 4",
                }}
              />
            ))}
          </>
        )}

        {/* Обычный режим */}
        {!selectedPark && (
          <>
            {points.map((f, i) => (
              <GeoJSON
                key={"pt" + i}
                data={f}
                pointToLayer={(_, latlng) =>
                  L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: getColorByType(f.properties.type),
                    color: "#fff",
                    weight: 1,
                    fillOpacity: 1,
                  })
                }
              />
            ))}
            {lines.map((f, i) => (
              <GeoJSON
                key={"ln" + i}
                data={f}
                style={{
                  color: getColorByType(f.properties.type),
                  weight: 4,
                  opacity: 1,
                }}
              />
            ))}
            {polygons.map((f, i) => (
              <GeoJSON
                key={"pl" + i}
                data={f}
                style={{
                  color: getColorByType(f.properties.type),
                  fillColor: getColorByType(f.properties.type),
                  weight: 2,
                  opacity: 0.7,
                  fillOpacity: 0.35,
                }}
              />
            ))}
          </>
        )}
      </MapContainer>
      <FloatingControls
        onZoomIn={() => map?.zoomIn()}
        onZoomOut={() => map?.zoomOut()}
        onRecenter={() => map?.setView([43.2389, 76.8897], 12)}
        onMyLocation={() =>
          navigator.geolocation?.getCurrentPosition(pos => map?.setView([pos.coords.latitude, pos.coords.longitude], 15))
        }
      />
      <LegendOverlay
        items={legendItems.filter(item => item.type !== "Реки")}
        onToggleVisibility={onToggleVisibility}
      />
    </div>
  );
}

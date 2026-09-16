import React, { useState, useEffect, useMemo, useRef } from "react";
import Map, { MapRef, Source, Layer, Popup } from "react-map-gl/maplibre";
import type { Feature as GeoJSONFeature, Geometry } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";
import FloatingControls from "./FloatingControls";
import LegendOverlay, { generateLegendColors } from "./LegendOverlay";
import MapLegend from "./MapLegend";
import { Loader } from "lucide-react";
import { getDisplayName } from "../utils/displayName";

function validatePolygonCoordinates(geometry: any): boolean {
  if (!geometry || !geometry.coordinates) return false;

  if (geometry.type === "Polygon") {
    return Array.isArray(geometry.coordinates) &&
           geometry.coordinates.length > 0 &&
           Array.isArray(geometry.coordinates[0]) &&
           geometry.coordinates[0].length >= 4;
  } else if (geometry.type === "MultiPolygon") {
    return Array.isArray(geometry.coordinates) &&
           geometry.coordinates.length > 0 &&
           geometry.coordinates.every((polygon: any) =>
             Array.isArray(polygon) &&
             polygon.length > 0 &&
             Array.isArray(polygon[0]) &&
             polygon[0].length >= 4
           );
  }

  return false;
}

function createPopupContent(feature: FeatureType): React.ReactNode {
  const props = feature.properties;

  const getIcon = (type: string) => {
    switch (type) {
      case "Остановка":
      case "Рекомендованная остановка":
        return "🚏";
      case "Маршрут автобуса":
      case "Рекомендованный маршрут":
      case "Удлинить маршрут":
        return "🚌";
      case "Озеленение":
        return "🌳";
      case "Озёра":
        return "💧";
      case "Реки":
        return "🏊";
      default:
        return "📍";
    }
  };

  const icon = getIcon(props.type);
  const title = getDisplayName(props.name);
  const district = props.district || "Неизвестен";

  return (
    <div className="min-w-[220px] max-w-[280px] p-4">
      <div className="flex items-start space-x-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">{title}</h3>
          {props.id !== undefined && props.id !== null && (
            <p className="text-xs text-blue-600 font-mono mb-1">ID: {props.id}</p>
          )}
          <p className="text-sm text-green-600 font-medium mb-2">{props.type}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Район:</span> {district}
          </p>
        </div>
      </div>
    </div>
  );
}

type FeatureType = GeoJSONFeature<
  Geometry,
  {
    type: string;
    id: number;
    name: string;
    district?: string;
    unique_id?: string;
    nearest_stop_ids?: number[];
    nearest_rec_stop_ids?: number[];
    nearby_route_ids?: number[];
    nearby_rec_route_ids?: number[];
    nearby_ext_route_ids?: number[];
  }
>;

type SelectedPark = {
  id: number | null;
  parkName: string;
  parkDistrict: string;
  distance: number | null;
  unique_id: string;
};

type SelectedRoute = {
  routeName: string;
  routeType: string;
  routeDistrict: string;
  uniqueId?: number | null;
};

interface MapProps {
  selectedPark?: SelectedPark | null;
  selectedRoute?: SelectedRoute | null;
  visibleTypes: string[];
  onToggleVisibility: (type: string) => void;
  hideLegend?: boolean;
  allowedLegendTypes?: string[];
  showAllForLegendTypes?: boolean;
  onClearSelection?: () => void;
}

export default function MapTiler({ selectedPark, selectedRoute, visibleTypes, onToggleVisibility, hideLegend = false, allowedLegendTypes, showAllForLegendTypes = false, onClearSelection }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [features, setFeatures] = useState<FeatureType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [mapKey, setMapKey] = useState(0);
  const [is3D, setIs3D] = useState(false);
  const [popupInfo, setPopupInfo] = useState<{
    feature: FeatureType;
    latitude: number;
    longitude: number;
  } | null>(null);

  const extractRouteNumber = (routeName: string): string | null => {
    const match = routeName.match(/\d+/);
    return match ? match[0] : null;
  };

  const MAPTILER_KEY = "h9AWBEaI4SyKaLbniSna";

  const mapStyles = [
    `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
    `https://api.maptiler.com/maps/basic/style.json?key=${MAPTILER_KEY}`,
    `https://api.maptiler.com/maps/bright/style.json?key=${MAPTILER_KEY}`,
    {
      version: 8 as const,
      sources: {
        "osm": {
          type: "raster" as const,
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors"
        }
      },
      layers: [
        {
          id: "osm",
          type: "raster" as const,
          source: "osm"
        }
      ]
    }
  ];

  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const mapStyle = mapStyles[currentStyleIndex];

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}final.geojson`)
      .then(res => res.json())
      .then(data => {
        const excludedIds = [51, 42, 29, 3, 5];

        const filteredFeatures = data.features.filter((feature: any) => {
          const isRoute = ["Рекомендованный маршрут", "Удлинить маршрут", "Маршрут автобуса"].includes(feature.properties.type);
          if (isRoute && excludedIds.includes(feature.properties.id)) {
            return false;
          }
          return true;
        });

        setFeatures(filteredFeatures as FeatureType[]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedParkFeature = useMemo(() => {
    if (!selectedPark) {
      return null;
    }

    if (selectedPark.unique_id) {
      let found = features.find(
        f =>
          f.properties.type === "Озеленение" &&
          f.properties.unique_id === selectedPark.unique_id
      );
      if (found) return found;

      if (selectedPark.unique_id.startsWith('park_id_')) {
        const parkId = parseInt(selectedPark.unique_id.replace('park_id_', ''));
        found = features.find(
          f =>
            f.properties.type === "Озеленение" &&
            f.properties.id === parkId
        );
        if (found) return found;
      }

      if (selectedPark.unique_id.startsWith('park_index_')) {
        const parkIndex = parseInt(selectedPark.unique_id.replace('park_index_', ''));
        const greensOnly = features.filter(f => f.properties.type === "Озеленение");
        if (parkIndex >= 0 && parkIndex < greensOnly.length) {
          return greensOnly[parkIndex];
        }
      }
    }

    if (selectedPark.parkName && selectedPark.parkName !== "Без названия") {
      let found = features.find(
        f =>
          f.properties.type === "Озеленение" &&
          f.properties.name === selectedPark.parkName &&
          f.properties.district === selectedPark.parkDistrict
      );

      if (!found) {
        found = features.find(
          f =>
            f.properties.type === "Озеленение" &&
            f.properties.name === selectedPark.parkName
        );
      }

      return found;
    }

    return null;
  }, [features, selectedPark]);

  const selectedRouteFeature = useMemo(() => {
    if (!selectedRoute) {
      return null;
    }

    if (selectedRoute.uniqueId !== null && selectedRoute.uniqueId !== undefined) {
      const found = features.find(
        f => f.properties.id === selectedRoute.uniqueId
      );
      if (found) return found;
    }

    let found = features.find(
      f =>
        f.properties.type === selectedRoute.routeType &&
        f.properties.name === selectedRoute.routeName
    );

    if (!found) {
      found = features.find(
        f =>
          f.properties.type === selectedRoute.routeType &&
          f.properties.district === selectedRoute.routeDistrict
      );
    }

    return found;
  }, [features, selectedRoute]);

  const stopsNearby = useMemo(() => {
    if (selectedParkFeature && visibleTypes.includes("Остановка")) {
      const stopIds = (selectedParkFeature.properties.nearest_stop_ids ?? []).concat(
        selectedParkFeature.properties.nearest_rec_stop_ids ?? []
      );
      return features.filter(
        f => f.properties.type.includes("Остановка") && stopIds.includes(f.properties.id)
      );
    }

    if (selectedRouteFeature) {
      const stopIds = (selectedRouteFeature.properties.nearest_stop_ids ?? []).concat(
        selectedRouteFeature.properties.nearest_rec_stop_ids ?? []
      );
      return features.filter(
        f => f.properties.type.includes("Остановка") && stopIds.includes(f.properties.id)
      );
    }

    return [];
  }, [features, selectedParkFeature, selectedRouteFeature, visibleTypes]);

  const routesNearby = useMemo(() => {
    if (selectedParkFeature) {
      let ids: number[] = [];
      if (visibleTypes.includes("Маршрут автобуса"))
        ids = ids.concat(selectedParkFeature.properties.nearby_route_ids ?? []);
      if (visibleTypes.includes("Рекомендованный маршрут"))
        ids = ids.concat(selectedParkFeature.properties.nearby_rec_route_ids ?? []);
      if (visibleTypes.includes("Удлинить маршрут"))
        ids = ids.concat(selectedParkFeature.properties.nearby_ext_route_ids ?? []);
      ids = Array.from(new Set(ids));
      return features.filter(
        f =>
          ["Маршрут автобуса", "Рекомендованный маршрут", "Удлинить маршрут"].includes(f.properties.type) &&
          ids.includes(f.properties.id)
      );
    }

    if (selectedRouteFeature) {
      let routesToShow = [selectedRouteFeature];

      if (selectedRouteFeature.properties.type === "Удлинить маршрут") {
        const extensionRouteNumber = extractRouteNumber(selectedRouteFeature.properties.name);

        if (extensionRouteNumber) {
          const originalRoutes = features.filter(f => {
            if (f.properties.type !== "Маршрут автобуса") return false;
            const originalRouteNumber = extractRouteNumber(f.properties.name);
            return originalRouteNumber === extensionRouteNumber;
          });
          routesToShow = routesToShow.concat(originalRoutes);
        }
      }

      if (selectedRouteFeature.properties.type === "Рекомендованный маршрут") {
        const recommendedRouteNumber = extractRouteNumber(selectedRouteFeature.properties.name);

        if (recommendedRouteNumber) {
          const relatedRoutes = features.filter(f => {
            if (!["Маршрут автобуса", "Удлинить маршрут"].includes(f.properties.type)) return false;
            const routeNumber = extractRouteNumber(f.properties.name);
            return routeNumber === recommendedRouteNumber;
          });
          routesToShow = routesToShow.concat(relatedRoutes);
        }
      }

      return routesToShow;
    }

    return [];
  }, [features, selectedParkFeature, selectedRouteFeature, visibleTypes]);

  const parksNearby = useMemo(() => {
    if (!selectedRouteFeature) return [];

    return features.filter(f =>
      f.properties.type === "Озеленение" &&
      (f.properties.nearby_route_ids?.includes(selectedRouteFeature.properties.id) ||
       f.properties.nearby_rec_route_ids?.includes(selectedRouteFeature.properties.id) ||
       f.properties.nearby_ext_route_ids?.includes(selectedRouteFeature.properties.id))
    );
  }, [features, selectedRouteFeature]);

  const showSelectedPark = selectedParkFeature;
  const showSelectedRoute = selectedRouteFeature;

  const points = useMemo(
    () => {
      if (selectedRouteFeature) {
        if (showAllForLegendTypes && allowedLegendTypes) {
          const allLegendPoints = features.filter(f =>
            f.geometry.type === "Point" &&
            allowedLegendTypes.includes(f.properties.type) &&
            visibleTypes.includes(f.properties.type)
          );
          return allLegendPoints;
        }
        return stopsNearby.filter(f =>
          f.geometry.type === "Point" &&
          visibleTypes.includes(f.properties.type)
        );
      }

      if (selectedParkFeature) {
        return stopsNearby.filter(f =>
          f.geometry.type === "Point" &&
          visibleTypes.includes(f.properties.type)
        );
      }

      return features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          f.geometry.type === "Point"
      );
    },
    [features, visibleTypes, selectedRouteFeature, selectedParkFeature, stopsNearby, showAllForLegendTypes, allowedLegendTypes]
  );

  const lines = useMemo(
    () => {
      if (selectedRouteFeature) {
        return routesNearby.filter(f =>
          f.geometry.type === "LineString" || f.geometry.type === "MultiLineString"
        );
      }

      if (selectedParkFeature) {
        return routesNearby.filter(f =>
          (f.geometry.type === "LineString" || f.geometry.type === "MultiLineString") &&
          visibleTypes.includes(f.properties.type)
        );
      }

      if (showAllForLegendTypes && allowedLegendTypes) {
        return [];
      }

      return features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          (f.geometry.type === "LineString" ||
            f.geometry.type === "MultiLineString")
      );
    },
    [features, visibleTypes, selectedRouteFeature, selectedParkFeature, routesNearby, showAllForLegendTypes, allowedLegendTypes]
  );

  const polygons = useMemo(
    () => {
      if (selectedRouteFeature) {
        if (showAllForLegendTypes && allowedLegendTypes) {
          return features.filter(f =>
            (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
            allowedLegendTypes.includes(f.properties.type) &&
            visibleTypes.includes(f.properties.type)
          );
        }
        return parksNearby.filter(f =>
          (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
          visibleTypes.includes(f.properties.type)
        );
      }

      if (selectedParkFeature) {
        return [selectedParkFeature].filter(f =>
          (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
          visibleTypes.includes(f.properties.type)
        );
      }

      return features.filter(
        f =>
          visibleTypes.includes(f.properties.type) &&
          (f.geometry.type === "Polygon" ||
            f.geometry.type === "MultiPolygon")
      );
    },
    [features, visibleTypes, selectedRouteFeature, selectedParkFeature, parksNearby, showAllForLegendTypes, allowedLegendTypes]
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

  const getRouteStartPoint = (routeFeature: FeatureType): [number, number] | null => {
    const geometry = routeFeature.geometry;

    if (geometry.type === "LineString") {
      return geometry.coordinates[0] as [number, number];
    } else if (geometry.type === "MultiLineString") {
      if (geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
        return geometry.coordinates[0][0] as [number, number];
      }
    }

    return null;
  };

  const calculateBounds = (mainFeature: FeatureType, relatedFeatures: FeatureType[] = []) => {
    let allCoords: [number, number][] = [];

    const extractCoords = (geometry: any) => {
      if (geometry.type === "Point") {
        return [geometry.coordinates as [number, number]];
      } else if (geometry.type === "LineString") {
        return geometry.coordinates as [number, number][];
      } else if (geometry.type === "MultiLineString") {
        return geometry.coordinates.flat() as [number, number][];
      } else if (geometry.type === "Polygon") {
        return geometry.coordinates[0] as [number, number][];
      } else if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.map((polygon: any) => polygon[0]).flat() as [number, number][];
      }
      return [];
    };

    allCoords = allCoords.concat(extractCoords(mainFeature.geometry));

    relatedFeatures.forEach(feature => {
      allCoords = allCoords.concat(extractCoords(feature.geometry));
    });

    if (allCoords.length === 0) return null;

    const lngs = allCoords.map(coord => coord[0]);
    const lats = allCoords.map(coord => coord[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lngPadding = Math.max((maxLng - minLng) * 0.3, 0.008);
    const latPadding = Math.max((maxLat - minLat) * 0.3, 0.008); 

    return {
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
      bounds: [
        [minLng - lngPadding, minLat - latPadding],
        [maxLng + lngPadding, maxLat + latPadding]
      ] as [[number, number], [number, number]]
    };
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapRef.current) return;

      if (selectedParkFeature) {
        const bounds = calculateBounds(selectedParkFeature, stopsNearby);

        if (bounds) {
          mapRef.current.fitBounds(bounds.bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 13,
            duration: 1000,
          });
        }
      } else if (selectedRouteFeature) {
        const startPoint = getRouteStartPoint(selectedRouteFeature);

        if (startPoint) {
          mapRef.current.flyTo({
            center: startPoint,
            zoom: 15,
            duration: 1000,
          });
        }
      } else {
        mapRef.current.flyTo({
          center: [76.8897, 43.2389],
          zoom: 12,
          duration: 1000,
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    selectedPark,
    selectedParkFeature,
    selectedRoute,
    selectedRouteFeature,
    stopsNearby,
    parksNearby,
  ]);

  const toggle3D = () => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const visibility = is3D ? "none" : "visible";
    setIs3D(!is3D);

    if (map.getLayer("3d-buildings")) {
      map.setLayoutProperty("3d-buildings", "visibility", visibility);
    }

    mapRef.current.easeTo({
      pitch: is3D ? 0 : 60,
      bearing: is3D ? 0 : -20,
      zoom: is3D ? 12.8 : 16.5,
      duration: 800,
    });
  };

  const getGeoJSONData = (featuresList: FeatureType[]) => ({
    type: "FeatureCollection" as const,
    features: featuresList
  });

  // Обработчик клика по карте
  const onMapClick = (event: any) => {
    const feature = event.features && event.features[0];
    if (feature) {
      // Получаем координаты клика
      const { lng, lat } = event.lngLat;

      setPopupInfo({
        feature: feature as FeatureType,
        longitude: lng,
        latitude: lat
      });
    } else {
      setPopupInfo(null);
    }
  };

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
    <div className="w-full h-full flex flex-col block_with_map">
      {!hideLegend && (
        <div className="flex-shrink-0 w-full z-20"> 
          <LegendOverlay
            items={legendItems.filter(item => {
              if (allowedLegendTypes) {
                return allowedLegendTypes.includes(item.type);
              }
              return item.type !== "Реки";
            })}
            onToggleVisibility={onToggleVisibility}
          />
        </div>
      )}

      <div className="relative flex-1 rounded-b-lg overflow-hidden">
        <Map
          // key={mapKey}
          ref={mapRef}
          mapStyle={mapStyle}
          initialViewState={{
            longitude: 76.8897,
            latitude: 43.2389,
            zoom: 12
          }}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          interactiveLayerIds={[
            'points-layer',
            'lines-layer',
            'polygons-layer',
            'selected-park-layer',
            'stops-nearby-layer',
            'routes-nearby-layer'
          ]}
          onClick={onMapClick}
          onError={(e) => {
            console.error('Map component error:', e);
            if (currentStyleIndex < mapStyles.length - 1) {
              setCurrentStyleIndex(prev => prev + 1);
            }
          }}
          onLoad={() => {
            const map = mapRef.current?.getMap();
            if (map) {
              map.on('styleimagemissing', (e) => {
                console.warn('Missing image:', e.id);
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;
                const context = canvas.getContext('2d');
                if (context) {
                  context.fillStyle = 'rgba(0,0,0,0)';
                  context.fillRect(0, 0, 64, 64);
                }
                const imageData = context.getImageData(0, 0, 64, 64);
                map.addImage(e.id, imageData);
              });

              map.on('error', (e) => {
                console.error('Map error:', e);
                if (currentStyleIndex < mapStyles.length - 1) {
                  setCurrentStyleIndex(prev => prev + 1);
                }
              });

              map.on('styledata', () => {
                try {
                  if (!map.getLayer("3d-buildings")) {
                    const sources = map.getStyle().sources;

                    let buildingSource = null;
                    if (sources['openmaptiles']) {
                      buildingSource = 'openmaptiles';
                    } else if (sources['maptiler_planet']) {
                      buildingSource = 'maptiler_planet';
                    } else if (sources['composite']) {
                      buildingSource = 'composite';
                    }

                    if (buildingSource) {
                      map.addLayer({
                        id: "3d-buildings",
                        source: buildingSource,
                        "source-layer": "building",
                        type: "fill-extrusion",
                        minzoom: 15,
                        paint: {
                          "fill-extrusion-color": "#aaa",
                          "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["case",
                              ["has", "render_height"],
                              ["*", 3.5, ["to-number", ["get", "render_height"]]],
                              ["has", "height"],
                              ["*", 3.5, ["to-number", ["get", "height"]]],
                              10
                            ]
                          ],
                          "fill-extrusion-base": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            15,
                            0,
                            15.05,
                            ["case",
                              ["has", "render_min_height"],
                              ["*", 3.5, ["to-number", ["get", "render_min_height"]]],
                              ["has", "min_height"],
                              ["*", 3.5, ["to-number", ["get", "min_height"]]],
                              0
                            ]
                          ],
                          "fill-extrusion-opacity": 0.6
                        },
                        layout: {
                          visibility: "none"
                        }
                      });
                    } else {
                      console.warn("No suitable building source found for 3D buildings");
                    }
                  }
                } catch (error) {
                  console.error("Error adding 3D buildings:", error);
                }
              });
            }
          }}
        >

          {!selectedPark && polygons.length > 0 && (
            <Source
              id="polygons"
              type="geojson"
              data={getGeoJSONData(polygons.filter(f => validatePolygonCoordinates(f.geometry)))}
            >
              <Layer
                id="polygons-layer"
                type="fill"
                paint={{
                  "fill-color": [
                    "case",
                    ["==", ["get", "type"], "Озеленение"],
                    "#22C55E",
                    ["==", ["get", "type"], "Озёра"],
                    "#06B6D4",
                    ["==", ["get", "type"], "Реки"],
                    "#0EA5E9",
                    "#6B7280"
                  ],
                  "fill-opacity": 0.4
                }}
              />
              <Layer
                id="polygons-outline"
                type="line"
                paint={{
                  "line-color": [
                    "case",
                    ["==", ["get", "type"], "Озеленение"],
                    "#22C55E",
                    ["==", ["get", "type"], "Озёра"],
                    "#06B6D4",
                    ["==", ["get", "type"], "Реки"],
                    "#0EA5E9",
                    "#6B7280"
                  ],
                  "line-width": 2,
                  "line-opacity": 0.8
                }}
              />
            </Source>
          )}

          {selectedPark && showSelectedPark && (
            <Source
              id="selected-park"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: [selectedParkFeature!]
              }}
            >
              <Layer
                id="selected-park-layer"
                type="fill"
                paint={{
                  "fill-color": "#ef4444",
                  "fill-opacity": 0.7
                }}
              />
              <Layer
                id="selected-park-outline"
                type="line"
                paint={{
                  "line-color": "#dc2626",
                  "line-width": 6,
                  "line-dasharray": [2, 1]
                }}
              />
            </Source>
          )}

          {!selectedPark && lines.length > 0 && (
            <Source
              id="lines"
              type="geojson"
              data={getGeoJSONData(lines)}
            >
              <Layer
                id="lines-layer"
                type="line"
                paint={{
                  "line-color": [
                    "case",
                    ["==", ["get", "type"], "Маршрут автобуса"],
                    "#3B82F6",
                    ["==", ["get", "type"], "Рекомендованный маршрут"],
                    "#F59E0B",
                    ["==", ["get", "type"], "Удлинить маршрут"],
                    "#329ea8",
                    "#6B7280"
                  ],
                  "line-width": 4,
                  "line-opacity": 1
                }}
              />
            </Source>
          )}

          {selectedPark && routesNearby.length > 0 && (
            <Source
              id="routes-nearby"
              type="geojson"
              data={getGeoJSONData(routesNearby)}
            >
              <Layer
                id="routes-nearby-layer"
                type="line"
                paint={{
                  "line-color": [
                    "case",
                    ["==", ["get", "type"], "Маршрут автобуса"],
                    "#818cf8",
                    ["==", ["get", "type"], "Рекомендованный маршрут"],
                    "#F59E0B",
                    ["==", ["get", "type"], "Удлинить маршрут"],
                    "#329ea8",
                    "#f59e42"
                  ],
                  "line-width": 6,
                  "line-opacity": 0.8,
                  "line-dasharray": [2, 1]
                }}
              />
            </Source>
          )}

          {!selectedPark && points.length > 0 && (
            <Source
              id="points"
              type="geojson"
              data={getGeoJSONData(points)}
            >
              <Layer
                id="points-layer"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": [
                    "case",
                    ["==", ["get", "type"], "Остановка"],
                    "#EF4444",
                    ["==", ["get", "type"], "Рекомендованная остановка"],
                    "#8B5CF6",
                    "#6B7280"
                  ],
                  "circle-stroke-color": "#fff",
                  "circle-stroke-width": 1
                }}
              />
            </Source>
          )}

          {selectedPark && stopsNearby.length > 0 && (
            <Source
              id="stops-nearby"
              type="geojson"
              data={getGeoJSONData(stopsNearby)}
            >
              <Layer
                id="stops-nearby-layer"
                type="circle"
                paint={{
                  "circle-radius": 9,
                  "circle-color": [
                    "case",
                    ["==", ["get", "type"], "Остановка"],
                    "#ef4444",
                    "#22d3ee"
                  ],
                  "circle-stroke-color": "#fff",
                  "circle-stroke-width": 2
                }}
              />
            </Source>
          )}

          {popupInfo && (
            <Popup
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              onClose={() => setPopupInfo(null)}
              closeButton={true}
              closeOnClick={false}
              maxWidth="400px"
              className="map-popup"
            >
              {createPopupContent(popupInfo.feature)}
            </Popup>
          )}
        </Map>

        <FloatingControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onRecenter={() => mapRef.current?.flyTo({ center: [76.8897, 43.2389], zoom: 12 })}
          onMyLocation={() =>
            navigator.geolocation?.getCurrentPosition(pos =>
              mapRef.current?.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 15
              })
            )
          }
        />

        {/* Кнопка сброса выбора */}
        {/* {(selectedPark || selectedRoute) && onClearSelection && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClearSelection();
            }}
            className="absolute top-4 right-4 z-50 p-3 bg-white text-gray-700 rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            title="Сбросить выбор"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-tight">Сбросить</span>
          </button>
        )} */}

        <button
          onClick={toggle3D}
          className={`absolute bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
            is3D 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          title={is3D ? "Выключить 3D" : "Включить 3D"}
        >
          <span className="text-lg font-bold">3D</span>
        </button>

        <MapLegend
          items={legendItems.filter(item => {
            if (allowedLegendTypes) {
              return allowedLegendTypes.includes(item.type);
            }
            return item.type !== "Реки";
          })}
          position="bottom-left"
        />
      </div>
    </div>
  );
}

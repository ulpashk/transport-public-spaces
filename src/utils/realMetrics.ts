// Утилиты для вычисления реальных метрик из GeoJSON данных

interface GeoJSONFeature {
  properties: {
    type: string;
    district?: string;
    Shape__Length?: number;
    nearby_route_ids?: string[];
    nearby_rec_route_ids?: string[];
    nearby_ext_route_ids?: string[];
    [key: string]: any;
  };
  geometry: any;
}

interface GeoJSONData {
  features: GeoJSONFeature[];
}

export async function loadGeoJSONData(): Promise<GeoJSONData> {
  const response = await fetch(import.meta.env.BASE_URL + 'final.geojson');
  if (!response.ok) throw new Error('Ошибка загрузки GeoJSON');
  return response.json();
}

export function calculateRealMetrics(data: GeoJSONData) {
  const features = data.features;

  // ID маршрутов для исключения из расчетов
  const excludedIds = [51, 42, 29, 3, 5];

  // Подсчет объектов по типам, исключая удаленные маршруты
  const stops = features.filter(f => f.properties.type === "Остановка");
  const routes = features.filter(f => f.properties.type === "Маршрут автобуса");
  const publicSpaces = features.filter(f =>
    f.properties.type === "Озеленение" &&
    f.properties.distance_to_stop !== null &&
    !isNaN(parseInt(f.properties.distance_to_stop)) &&
    parseInt(f.properties.distance_to_stop) <= 750
  );
  const recommendedStops = features.filter(f =>
    f.properties.type === "Рекомендованная остановка" &&
    !excludedIds.includes(f.properties.id)
  );

  // Уникальные районы
  const districts = new Set(
    features
      .map(f => f.properties.district)
      .filter(d => d && d.trim() !== "")
  );

  // Функция расчета длины по координатам
  function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function calculateGeometryLength(geometry: any): number {
    if (!geometry || !geometry.coordinates) return 0;

    if (geometry.type === 'LineString') {
      let length = 0;
      for (let i = 0; i < geometry.coordinates.length - 1; i++) {
        const [lon1, lat1] = geometry.coordinates[i];
        const [lon2, lat2] = geometry.coordinates[i + 1];
        length += haversineDistance(lat1, lon1, lat2, lon2);
      }
      return length;
    }

    if (geometry.type === 'MultiLineString') {
      return geometry.coordinates.reduce((total: number, lineCoords: number[][]) => {
        let lineLength = 0;
        for (let i = 0; i < lineCoords.length - 1; i++) {
          const [lon1, lat1] = lineCoords[i];
          const [lon2, lat2] = lineCoords[i + 1];
          lineLength += haversineDistance(lat1, lon1, lat2, lon2);
        }
        return total + lineLength;
      }, 0);
    }

    return 0;
  }

  // Общая протяженность автобусных маршрутов (рассчитанная по координатам)
  const totalLength = routes.reduce((sum, route) => {
    return sum + calculateGeometryLength(route.geometry);
  }, 0) * 1000; // конвертируем в метры

  // Вычисление среднего расстояния до остановок на основе реальных данных
  // Все publicSpaces уже отфильтрованы по расстоянию ≤750 метров
  const publicSpacesWithDistance = publicSpaces;

  const totalDistance = publicSpacesWithDistance.reduce((sum, space) =>
    sum + parseInt(space.properties.distance_to_stop), 0
  );

  const averageDistance = publicSpacesWithDistance.length > 0
    ? Math.round(totalDistance / publicSpacesWithDistance.length)
    : 0;

  // Доступность общественных пространств
  // Считаем, сколько общественных пространств имеют связанные маршруты (исключая удаленные)
  const accessibleSpaces = publicSpaces.filter(space => {
    const props = space.properties;

    // Фильтруем исключенные ID из рекомендованных и удлиненных маршрутов
    const validRecRoutes = (props.nearby_rec_route_ids || []).filter(
      (id: any) => !excludedIds.includes(Number(id))
    );
    const validExtRoutes = (props.nearby_ext_route_ids || []).filter(
      (id: any) => !excludedIds.includes(Number(id))
    );

    return (props.nearby_route_ids && props.nearby_route_ids.length > 0) ||
           validRecRoutes.length > 0 ||
           validExtRoutes.length > 0;
  });

  const accessibilityPercentage = Math.round((accessibleSpaces.length / publicSpaces.length) * 100);

  return {
    stops: stops.length,
    routes: routes.length,
    publicSpaces: publicSpaces.length,
    districts: districts.size,
    recommendedStops: recommendedStops.length,
    totalLengthKm: Math.round(totalLength / 1000), // конвертируем в км
    averageDistanceM: averageDistance,
    accessibilityPercentage
  };
}

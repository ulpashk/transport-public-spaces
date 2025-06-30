export function getColorByType(type: string): string {
  switch (type) {
    case "Маршрут автобуса": return "#3B82F6";
    case "Рекомендованный маршрут": return "#DC2626";
    case "Удлинить маршрут": return "#F59E0B";
    case "Остановка": return "#EF4444";
    case "Рекомендованная остановка": return "#8B5CF6";
    case "Озеленение": return "#10B981";
    case "Озёра": return "#3B82F6";
    case "Реки": return "#3B82F6";
    default: return "#6B7280";
  }
}
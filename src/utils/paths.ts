/**
 * Утилиты для работы с путями к ресурсам
 */

/**
 * Получает полный путь к ресурсу с учетом base path из vite config
 * @param resourcePath - относительный путь к ресурсу
 * @returns полный путь с учетом base path
 */
export function getResourcePath(resourcePath: string): string {
  // Получаем base path из vite config (устанавливается в import.meta.env.BASE_URL)
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Убираем ведущий слеш из resourcePath если он есть
  const cleanResourcePath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
  
  // Объединяем base path и путь к ресурсу
  return `${basePath}${cleanResourcePath}`;
}

/**
 * Загружает GeoJSON файл с правильным путем
 * @returns Promise с данными GeoJSON
 */
export async function loadGeoJSON() {
  const path = getResourcePath('final.geojson');
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные по пути: ${path}`);
  }
  return response.json();
} 
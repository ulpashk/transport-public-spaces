/**
 * Утилита для обработки отображения названий объектов
 */

export function getDisplayName(name: string | undefined | null): string {
  if (!name || name === "nan" || name === "null" || name === "undefined") {
    return "Нет названия";
  }
  return name;
} 
// Глобальные декларации типов для решения проблем с TypeScript

// Игнорируем отсутствующие типы для этих библиотек
declare module 'mapbox__point-geometry';
declare module 'supercluster';

// Дополнительные типы для Vite
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // добавьте другие переменные окружения по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 
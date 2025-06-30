const fs = require('fs');

// Читаем данные
const data = JSON.parse(fs.readFileSync('public/final.geojson', 'utf8'));

console.log('=== ДО УДАЛЕНИЯ ===');
console.log('Всего объектов в файле:', data.features.length);

// Статистика до удаления
const beforeStats = {
  extensions: data.features.filter(f => f.properties.type === 'Удлинить маршрут').length,
  newRoutes: data.features.filter(f => f.properties.type === 'Рекомендованный маршрут').length,
  parks: data.features.filter(f => f.properties.type === 'Озеленение').length,
  stops: data.features.filter(f => f.properties.type === 'Остановка').length,
  routes: data.features.filter(f => f.properties.type === 'Маршрут автобуса').length
};

console.log('Удлинения:', beforeStats.extensions);
console.log('Новые маршруты:', beforeStats.newRoutes);
console.log('Парки:', beforeStats.parks);
console.log('Остановки:', beforeStats.stops);
console.log('Обычные маршруты:', beforeStats.routes);

// Считаем длины до удаления
const extensionsBefore = data.features.filter(f => f.properties.type === 'Удлинить маршрут');
const newRoutesBefore = data.features.filter(f => f.properties.type === 'Рекомендованный маршрут');

const extLengthBefore = extensionsBefore.reduce((sum, ext) => sum + parseFloat(ext.properties.length_m || 0), 0) / 1000;
const newRoutesLength = newRoutesBefore.reduce((sum, route) => sum + parseFloat(route.properties.length_m || 0), 0) / 1000;

console.log('Длина удлинений до удаления:', extLengthBefore.toFixed(1), 'км');
console.log('Длина новых маршрутов:', newRoutesLength.toFixed(1), 'км');
console.log('Общая длина до удаления:', (extLengthBefore + newRoutesLength).toFixed(1), 'км');

// Удаляем все удлинения с нулевым охватом
const filteredFeatures = data.features.filter(feature => {
  if (feature.properties.type === 'Удлинить маршрут') {
    // Проверяем, есть ли связанные объекты
    const hasParks = feature.properties.nearby_route_ids && feature.properties.nearby_route_ids !== "";
    const hasRecRoutes = feature.properties.nearby_rec_route_ids && feature.properties.nearby_rec_route_ids !== "";
    const hasExtRoutes = feature.properties.nearby_ext_route_ids && feature.properties.nearby_ext_route_ids !== "";
    
    // Оставляем только удлинения с объектами
    return hasParks || hasRecRoutes || hasExtRoutes;
  }
  return true; // Оставляем все остальные объекты
});

// Обновляем данные
data.features = filteredFeatures;

console.log('\n=== ПОСЛЕ УДАЛЕНИЯ ===');
console.log('Всего объектов в файле:', data.features.length);

// Статистика после удаления
const afterStats = {
  extensions: data.features.filter(f => f.properties.type === 'Удлинить маршрут').length,
  newRoutes: data.features.filter(f => f.properties.type === 'Рекомендованный маршрут').length,
  parks: data.features.filter(f => f.properties.type === 'Озеленение').length,
  stops: data.features.filter(f => f.properties.type === 'Остановка').length,
  routes: data.features.filter(f => f.properties.type === 'Маршрут автобуса').length
};

console.log('Удлинения:', afterStats.extensions);
console.log('Новые маршруты:', afterStats.newRoutes);
console.log('Парки:', afterStats.parks);
console.log('Остановки:', afterStats.stops);
console.log('Обычные маршруты:', afterStats.routes);

// Считаем длины после удаления
const extensionsAfter = data.features.filter(f => f.properties.type === 'Удлинить маршрут');
const extLengthAfter = extensionsAfter.reduce((sum, ext) => sum + parseFloat(ext.properties.length_m || 0), 0) / 1000;

console.log('Длина удлинений после удаления:', extLengthAfter.toFixed(1), 'км');
console.log('Длина новых маршрутов:', newRoutesLength.toFixed(1), 'км');
console.log('Общая длина после удаления:', (extLengthAfter + newRoutesLength).toFixed(1), 'км');

console.log('\n=== ИЗМЕНЕНИЯ ===');
console.log('Удалено удлинений:', beforeStats.extensions - afterStats.extensions);
console.log('Сэкономлено километров:', (extLengthBefore - extLengthAfter).toFixed(1), 'км');

// Пересчитываем охват парков
const allParks = data.features.filter(f => f.properties.type === 'Озеленение');
const parksWithNewRoutes = new Set();

// Добавляем парки от новых маршрутов
data.features.filter(f => f.properties.type === 'Рекомендованный маршрут').forEach(route => {
  if (route.properties.nearby_route_ids) {
    route.properties.nearby_route_ids.split(',').forEach(id => parksWithNewRoutes.add(id.trim()));
  }
});

// Добавляем парки от оставшихся удлинений
data.features.filter(f => f.properties.type === 'Удлинить маршрут').forEach(ext => {
  if (ext.properties.nearby_route_ids) {
    ext.properties.nearby_route_ids.split(',').forEach(id => parksWithNewRoutes.add(id.trim()));
  }
});

console.log('\n=== НОВЫЕ МЕТРИКИ ===');
console.log('Всего парков в городе:', allParks.length);
console.log('Парков с улучшенной доступностью:', parksWithNewRoutes.size);
console.log('Процент улучшения:', ((parksWithNewRoutes.size / allParks.length) * 100).toFixed(0) + '%');
console.log('Новых маршрутов:', afterStats.newRoutes);
console.log('Удлинений:', afterStats.extensions);
console.log('Общая длина новых решений:', (extLengthAfter + newRoutesLength).toFixed(0), 'км');

// Сохраняем обновленный файл
fs.writeFileSync('public/final.geojson', JSON.stringify(data, null, 2));
console.log('\n✅ Файл public/final.geojson обновлен!'); 
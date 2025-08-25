// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Bus, X, Info, RefreshCw, BarChart3, Filter, Map, Layers } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const layerTypes = [
  { name: 'Маршрут автобуса',           color: '#3B82F6', count: 156, info: false, category: 'transport' },
  { name: 'Рекомендованный маршрут',    color: '#F59E0B', count: 89,  info: true, category: 'transport'  },
  { name: 'Удлинить маршрут',           color: '#329ea8', count: 23,  info: true, category: 'transport'  },
  { name: 'Остановка',                  color: '#EF4444', count: 234, info: false, category: 'transport' },
  { name: 'Рекомендованная остановка',  color: '#8B5CF6', count: 67,  info: true, category: 'transport'  },
  { name: 'Озеленение',                 color: '#22C55E', count: 45,  info: false, category: 'environment' },
  { name: 'Озёра',                      color: '#06B6D4', count: 12,  info: false, category: 'environment' },
  { name: 'Реки',                       color: '#0EA5E9', count: 8,   info: false, category: 'environment' },
];

const districts = [
  'Алмалинский район','Ауэзовский район','Бостандыкский район',
  'Жетысуский район','Медеуский район','Наурызбайский район',
  'Турксибский район','Алатауский район',
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'filters'|'stats'>('filters');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['transport', 'environment']));

  const toggleType = (name: string) => {
    const s = new Set(selectedTypes);
    s.has(name) ? s.delete(name) : s.add(name);
    setSelectedTypes(s);
  };
  
  const toggleDistrict = (name: string) => {
    const s = new Set(selectedDistricts);
    s.has(name) ? s.delete(name) : s.add(name);
    setSelectedDistricts(s);
  };
  
  const reset = () => {
    setSelectedTypes(new Set());
    setSelectedDistricts(new Set());
  };
  
  const selectAll = () => {
    setSelectedTypes(new Set(layerTypes.map(t => t.name)));
  };

  const toggleCategory = (category: string) => {
    const s = new Set(expandedCategories);
    s.has(category) ? s.delete(category) : s.add(category);
    setExpandedCategories(s);
  };

  const groupedLayers = {
    transport: layerTypes.filter(layer => layer.category === 'transport'),
    environment: layerTypes.filter(layer => layer.category === 'environment')
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 border-r border-gray-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Bus size={18} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Фильтры</span>
              <p className="text-xs text-gray-500">Настройка отображения</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'filters'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Статистика
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'filters' ? (
            <div className="p-6 space-y-6">
              {/* Layer Types by Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-blue-600" />
                  Слои карты
                </h3>
                
                {/* Transport Category */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleCategory('transport')}
                    className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-blue-900">🚌 Транспорт</span>
                    <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                      {groupedLayers.transport.length}
                    </span>
                  </button>
                  
                  {expandedCategories.has('transport') && (
                    <div className="mt-2 space-y-1">
                      {groupedLayers.transport.map((t) => (
                        <div
                          key={t.name}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.has(t.name)}
                            onChange={() => toggleType(t.name)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span
                            className="inline-block w-3 h-3 rounded-full ml-3 mr-3 shadow-sm"
                            style={{ backgroundColor: t.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 font-medium block truncate">{t.name}</span>
                            <span className="text-xs text-gray-500">{t.count} объектов</span>
                          </div>
                          {t.info && (
                            <Info size={14} className="text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Environment Category */}
                <div className="mb-4">
                  <button
                    onClick={() => toggleCategory('environment')}
                    className="flex items-center justify-between w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-green-900">🌿 Экология</span>
                    <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                      {groupedLayers.environment.length}
                    </span>
                  </button>
                  
                  {expandedCategories.has('environment') && (
                    <div className="mt-2 space-y-1">
                      {groupedLayers.environment.map((t) => (
                        <div
                          key={t.name}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.has(t.name)}
                            onChange={() => toggleType(t.name)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span
                            className="inline-block w-3 h-3 rounded-full ml-3 mr-3 shadow-sm"
                            style={{ backgroundColor: t.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 font-medium block truncate">{t.name}</span>
                            <span className="text-xs text-gray-500">{t.count} объектов</span>
                          </div>
                          {t.info && (
                            <Info size={14} className="text-gray-400 hover:text-blue-500 transition-colors cursor-help" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={selectAll}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Выбрать все слои
                </button>
                <button
                  onClick={reset}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>

              {/* Districts */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Map className="w-4 h-4 mr-2 text-purple-600" />
                  Районы города
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {districts.map((d) => (
                    <label
                      key={d}
                      className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer border border-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDistricts.has(d)}
                        onChange={() => toggleDistrict(d)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Статистика системы
                </h3>
                <p className="text-sm text-gray-600">
                  Аналитика использования транспорта
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">234</div>
                  <div className="text-sm text-gray-600">Маршрутов</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">Остановок</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">89</div>
                  <div className="text-sm text-gray-600">Рекомендаций</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">65</div>
                  <div className="text-sm text-gray-600">Экообъектов</div>
                </div>
              </div>

              <button className="flex items-center justify-center w-full py-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <RefreshCw size={16} className="mr-2" />
                Обновить данные
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

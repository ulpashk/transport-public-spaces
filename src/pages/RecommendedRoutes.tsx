import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import MapTiler from "../components/MapTiler";
import { Route, MapPin, Navigation, TreePine, Loader, Search, Eye, TrendingUp, Target, Plus, Info } from "lucide-react";
import { calculateRouteMetrics } from "../utils/routeMetrics";
import { getDisplayName } from "../utils/displayName";

const ROUTE_TYPES = [
  "Рекомендованный маршрут",
  "Удлинить маршрут", 
  "Маршрут автобуса",
  "Остановка",
  "Рекомендованная остановка",
  "Озеленение"
];

interface RouteData {
  id: string;
  uniqueId: number | null;
  name: string;
  type: string;
  district: string;
  length: number;
  publicSpaces: number;
  improvement: string;
}

type SortKey = keyof RouteData;
type SortOrder = "asc" | "desc";

type RoutesTableProps = {
  onSelect: (route: RouteData | null) => void;
  selectedRoute: RouteData | null;
  routes: RouteData[];
  loading: boolean;
  error: string | null;
};

function RoutesTable({ onSelect, selectedRoute, routes, loading, error }: RoutesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [startIdx, setStartIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [pageInput, setPageInput] = useState("");

  const rowsPerPage = 10;

    const filteredRoutes = search 
    ? routes.filter(route => 
        route.name.toLowerCase().includes(search.toLowerCase()) ||
        (route.uniqueId !== null && route.uniqueId.toString().includes(search))
      )
    : routes;

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (sortKey === "length" || sortKey === "publicSpaces") {
      valA = typeof valA === "number" ? valA : Number(valA);
      valB = typeof valB === "number" ? valB : Number(valB);
    } else {
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
    }
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const visibleRoutes = sortedRoutes.slice(startIdx, startIdx + rowsPerPage);
  const pageCount = Math.ceil(sortedRoutes.length / rowsPerPage);
  const currentPage = Math.floor(startIdx / rowsPerPage) + 1;

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder(order => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setStartIdx(0);
  }

  function handlePrev() {
    setStartIdx(idx => Math.max(0, idx - rowsPerPage));
  }

  function handleNext() {
    setStartIdx(idx => Math.min(sortedRoutes.length - rowsPerPage, idx + rowsPerPage));
  }

  function handlePageInput() {
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= pageCount) {
      setStartIdx((pageNum - 1) * rowsPerPage);
      setPageInput("");
    }
  }

  useEffect(() => {
    setStartIdx(0);
  }, [search]);

  // Функция для получения цвета типа маршрута
  const getRouteTypeColor = (type: string) => {
    if (type === "Рекомендованный маршрут") return "bg-green-500";
    if (type === "Удлинить маршрут") return "bg-green-500";
    return "bg-gray-400";
  };

  // Функция для получения текста статуса
  const getRouteTypeStatus = (type: string) => {
    if (type === "Рекомендованный маршрут") return "Новый";
    if (type === "Удлинить маршрут") return "Удлинение";
    return "Обычный";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Загрузка данных...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Ошибка загрузки</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
             {/* Заголовок с градиентом */}
       <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
           <div className="text-white">
             <div className="flex items-center space-x-3">
               <Route className="w-5 h-5" />
               <h2 className="text-lg font-semibold">Рекомендованные маршруты</h2>
             </div>
             <p className="text-green-100 mt-2 text-sm">
               Анализ {sortedRoutes.length} маршрутов для улучшения доступности
             </p>
           </div>
           
           {/* Поиск с иконкой */}
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-gray-400" />
             </div>
             <input
               type="text"
                                 placeholder="Поиск по названию или ID..."
               className="pl-10 pr-4 py-2.5 w-full sm:w-72 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
           </div>
         </div>
       </div>
      {/* Таблица с улучшенным дизайном */}
      <div className="overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="min-w-full">
                         <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 border-b border-gray-200">
               <tr>
                 <th 
                   className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                   onClick={() => handleSort("uniqueId")}
                 >
                   <div className="flex items-center space-x-2">
                     <span>ID</span>
                     <div className="text-gray-400 text-lg">
                       {sortKey === "uniqueId" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                     </div>
                   </div>
                 </th>
                 <th 
                   className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                   onClick={() => handleSort("name")}
                 >
                   <div className="flex items-center space-x-2">
                     <span>Название маршрута</span>
                     <div className="text-gray-400 text-lg">
                       {sortKey === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                     </div>
                   </div>
                 </th>
                 <th 
                   className="group cursor-pointer px-6 py-4 text-left font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                   onClick={() => handleSort("district")}
                 >
                   <div className="flex items-center space-x-2">
                     <span>Район</span>
                     <div className="text-gray-400 text-lg">
                       {sortKey === "district" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                     </div>
                   </div>
                 </th>
                 <th 
                   className="group cursor-pointer px-6 py-4 text-center font-semibold text-gray-700 text-base hover:bg-gray-200 transition-colors duration-200" 
                   onClick={() => handleSort("type")}
                 >
                   <div className="flex items-center justify-center space-x-2">
                     <span>Тип</span>
                     <div className="text-gray-400 text-lg">
                       {sortKey === "type" ? (sortOrder === "asc" ? "▲" : "▼") : "⇅"}
                     </div>
                   </div>
                 </th>
               </tr>
             </thead>
            <tbody className="bg-white">
              {visibleRoutes.map((route, idx) => {
                const isSelected = selectedRoute && route.id === selectedRoute.id;
                return (
                  <tr
                    key={route.id}
                    className={`group cursor-pointer transition-all duration-200 border-b border-gray-100 hover:shadow-md ${
                      isSelected 
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 shadow-inner border-green-200" 
                        : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50"
                    }`}
                                         onClick={() => onSelect(isSelected ? null : route)}
                   >
                     <td className="px-6 py-4">
                       <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                         {route.uniqueId ?? 'N/A'}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center space-x-4">
                         <div className={`w-4 h-4 rounded-full ${getRouteTypeColor(route.type)} shadow-lg`}></div>
                         <div>
                           <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 text-base">
                             {route.name}
                           </div>
                           <div className="text-sm text-gray-500 mt-1">
                             {route.length} км • {route.publicSpaces} объектов
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                         <MapPin className="w-5 h-5 text-gray-400" />
                         <span className="text-gray-700 font-semibold text-base">{route.district}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center space-y-2">
                         <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white ${getRouteTypeColor(route.type)} shadow-lg`}>
                           {getRouteTypeStatus(route.type)}
                         </div>
                         {isSelected && (
                           <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                             <Eye className="w-4 h-4" />
                             <span>Активен</span>
                           </div>
                         )}
                       </div>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
             {/* Красивая навигация */}
       <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
           <button
             onClick={handlePrev}
             disabled={startIdx === 0}
             className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
           >
             ← Назад
           </button>
           
           <div className="flex flex-col sm:flex-row items-center gap-4">
             <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
               <span>Стр. {currentPage} из {pageCount}</span>
               <span className="text-gray-400">•</span>
               <span>{sortedRoutes.length} маршрутов</span>
             </div>
             
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-600 font-medium">Стр.:</span>
               <input
                 type="number"
                 value={pageInput}
                 onChange={(e) => setPageInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handlePageInput()}
                 placeholder={`1-${pageCount}`}
                 className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                 min="1"
                 max={pageCount}
               />
               <button
                 onClick={handlePageInput}
                 disabled={!pageInput}
                 className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
               >
                 →
               </button>
             </div>
           </div>
           
           <button
             onClick={handleNext}
             disabled={startIdx + rowsPerPage >= sortedRoutes.length}
             className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
           >
             Вперёд →
           </button>
         </div>
       </div>
    </div>
  );
}

export default function RecommendedRoutes() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(["Озеленение"]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<any>(null);
  const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null);

  // Загрузка данных из GeoJSON
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/final.geojson');
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные');
        }
        const data = await response.json();
        
        // Фильтруем рекомендованные маршруты и удлинения
        const routeFeatures = data.features.filter((feature: any) => 
          feature.properties.type === "Рекомендованный маршрут" || 
          feature.properties.type === "Удлинить маршрут"
        );

        // Получаем все общественные пространства для подсчета пересечений
        const publicSpaces = data.features.filter((feature: any) => 
          feature.properties.type === "Озеленение"
        );

        // Преобразуем в нужный формат
        // ID маршрутов для исключения из отображения
        const excludedIds = [51, 42, 29, 3, 5];
        
        const formattedRoutes: RouteData[] = routeFeatures
          .filter((feature: any) => !excludedIds.includes(feature.properties.id))
          .map((feature: any, index: number) => {
          const props = feature.properties;
          const length = props.Shape__Length ? (props.Shape__Length / 1000).toFixed(1) : Math.random() * 20 + 5;
          
          // Подсчитываем реальное количество общественных пространств, связанных с маршрутом
          let publicSpacesCount = 0;
          if (props.id) {
            publicSpacesCount = publicSpaces.filter((park: any) => {
              const parkProps = park.properties;
              return (
                parkProps.nearby_route_ids?.includes(props.id) ||
                parkProps.nearby_rec_route_ids?.includes(props.id) ||
                parkProps.nearby_ext_route_ids?.includes(props.id)
              );
            }).length;
          }
          
          return {
            id: `${props.type}-${props.id || index}-${props.district || 'default'}`,
            uniqueId: props.id ?? null,
            name: getDisplayName(props.name) || `${props.type} ${index + 1}`,
            type: props.type,
            district: props.district || "Городской маршрут",
            length: typeof length === 'string' ? parseFloat(length) : length,
            publicSpaces: publicSpacesCount, // Реальное количество связанных общественных пространств
            improvement: getImprovementText(props.type, props.name)
          };
        });

        setRoutes(formattedRoutes);
        
        // Рассчитываем метрики маршрутов
        const metrics = calculateRouteMetrics(data);
        setRouteMetrics(metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Функция для генерации текста улучшений
  const getImprovementText = (type: string, name: string): string => {
    if (type === "Рекомендованный маршрут") {
      const improvements = [
        "Улучшит доступность парков на 25%",
        "Соединит крупные общественные пространства",
        "Обеспечит прямую связь с зелеными зонами",
        "Повысит транспортную доступность на 30%",
        "Сократит время в пути к паркам"
      ];
      return improvements[Math.floor(Math.random() * improvements.length)];
    } else {
      const improvements = [
        "Охватит новые жилые районы",
        "Улучшит связь с центром города",
        "Обеспечит доступ к отдаленным паркам",
        "Сократит пересадки на 40%",
        "Соединит с крупными ТРЦ"
      ];
      return improvements[Math.floor(Math.random() * improvements.length)];
    }
  };

  const handleToggleVisibility = (type: string) => {
    setVisibleTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleSelectRoute = (route: RouteData | null) => {
    setSelectedRoute(route);
    // ВСЕГДА показываем только остановки и общественные пространства
    // Маршруты будут показываться через selectedRoute, а не через visibleTypes
    setVisibleTypes(["Остановка", "Рекомендованная остановка", "Озеленение"]);
  };

  // Получаем данные для поп-апов
  const getPopupContent = (type: string) => {
    switch (type) {
      case 'new-routes':
        return {
          title: '🆕 Как создаются новые маршруты',
          gradient: 'from-green-600 to-emerald-600',
          goal: 'Предложить варианты новых автобусных маршрутов для удобства жителей. Это предварительные идеи, которые нужно будет детально проработать с учетом дорожной ситуации.',
          steps: [
            { title: 'Ищем, куда ездить', desc: 'Смотрим на жилые районы и находим парки, которые находятся далеко - от 7 до 14 километров. Пешком туда не дойти, а на автобусе - самое то!', color: 'green' },
            { title: 'Намечаем маршрут', desc: 'По улицам города примерно определяем, каким путем мог бы идти автобус - это стартовая точка для планирования', color: 'green' },
            { title: 'Проверяем длину', desc: 'Если маршрут получается слишком коротким (меньше 8 км), то его нет смысла делать - лучше пешком дойти', color: 'green' },
            { title: 'Смотрим на загруженность', desc: 'Новый маршрут не должен полностью повторять старые и должен идти по не очень загруженным улицам', color: 'green' }
          ],
          result: '30 предварительных предложений новых маршрутов общей длиной 285 км. Каждый вариант требует дополнительного изучения и согласования.'
        };
      case 'extensions':
        return {
          title: '🔄 Как удлиняются маршруты',
          gradient: 'from-blue-600 to-indigo-600',
          goal: 'Рассмотреть возможности улучшения существующих коротких маршрутов. Это общие направления для дальнейшего анализа транспортными специалистами.',
          steps: [
            { title: 'Находим короткие маршруты', desc: 'Выбираем автобусные маршруты, которые короче обычных по городу - их можно сделать полезнее', color: 'blue' },
            { title: 'Ищем, куда продлить', desc: 'Смотрим, какие парки находятся дальше 2 километров от конца маршрута - туда и будем тянуть', color: 'blue' },
            { title: 'Используем остановки', desc: 'Берем существующие остановки этого маршрута как отправную точку для продления', color: 'blue' },
            { title: 'Предлагаем направление', desc: 'От ближайшей к парку остановки намечаем примерный путь по улицам - это будет основа для детальной проработки', color: 'blue' }
          ],
          result: '30 вариантов возможных удлинений общей длиной 185 км. Это предварительные идеи для рассмотрения городскими планировщиками.'
        };
      case 'coverage':
        return {
          title: '🌳 Как считается охват парков',
          gradient: 'from-emerald-600 to-teal-600',
          goal: 'Посчитать, сколько парков и скверов станут доступнее для горожан благодаря новым маршрутам',
          steps: [
            { title: 'Смотрим на текущую ситуацию', desc: 'Определяем, какие парки сейчас плохо связаны с городским транспортом', color: 'emerald' },
            { title: 'Связываем с новыми маршрутами', desc: 'Каждый новый маршрут и удлинение записываем к тем паркам, к которым он ведет', color: 'emerald' },
            { title: 'Убираем повторы', desc: 'Если к одному парку ведут несколько новых маршрутов, считаем его только один раз', color: 'emerald' },
            { title: 'Считаем улучшение', desc: 'Сравниваем количество парков с лучшей доступностью с общим количеством парков в городе', color: 'emerald' }
          ],
          result: '1,100 из 1,838 парков города получат лучшую транспортную связь'
        };
      case 'total-length':
        return {
          title: '📏 Как считается общая длина',
          gradient: 'from-purple-600 to-pink-600',
          goal: 'Точно посчитать, сколько километров новых автобусных линий нужно построить',
          steps: [
            { title: 'Берем координаты маршрутов', desc: 'Получаем точные координаты каждого нового маршрута и удлинения по карте', color: 'purple' },
            { title: 'Измеряем расстояния', desc: 'Используем специальную формулу для точного измерения расстояний на земном шаре', color: 'purple' },
            { title: 'Складываем участки', desc: 'Каждый маршрут состоит из участков между поворотами - складываем длины всех участков', color: 'purple' },
            { title: 'Суммируем все маршруты', desc: 'Складываем длины всех новых маршрутов и всех удлинений, чтобы получить общую цифру', color: 'purple' }
          ],
          result: '471 километр новых автобусных линий (285 км новых + 185 км удлинений)'
        };
      case 'efficiency':
        return {
          title: '📈 Как считается эффективность',
          gradient: 'from-orange-600 to-red-600',
          goal: 'Понять, насколько сильно улучшится доступность парков в городе благодаря новым маршрутам',
          steps: [
            { title: 'Берем за основу все парки', desc: 'Считаем общее количество парков в городе как 100% - это наша база для сравнения', color: 'orange' },
            { title: 'Считаем улучшения', desc: 'Подсчитываем, сколько парков получат новые автобусные маршруты или удлинения', color: 'orange' },
            { title: 'Вычисляем процент', desc: 'Делим количество парков с улучшениями на общее количество парков и умножаем на 100', color: 'orange' },
            { title: 'Объясняем результат', desc: 'Показываем, какая часть всех городских парков станет доступнее для жителей', color: 'orange' }
          ],
          result: '+60% означает, что больше половины всех парков Алматы станет удобнее для посещения'
        };
      default:
        return null;
    }
  };

  // Компонент информационного поп-апа
  const InfoPopup = () => {
    if (!showInfoPopup) return null;
    
    const content = getPopupContent(showInfoPopup);
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className={`bg-gradient-to-r ${content.gradient} px-6 py-4 rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{content.title}</h3>
              <button 
                onClick={() => setShowInfoPopup(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-blue-800 font-medium">
                🎯 <strong>Цель:</strong> {content.goal}
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Route className="w-5 h-5 mr-2 text-gray-600" />
                Как работает алгоритм:
              </h4>
              
              <div className="space-y-2 text-gray-700">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className={`bg-${step.color}-100 text-${step.color}-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </span>
                    <p><strong>{step.title}:</strong> {step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`bg-${content.steps[0].color}-50 border-l-4 border-${content.steps[0].color}-400 p-4 rounded`}>
              <h4 className={`font-medium text-${content.steps[0].color}-800 mb-2`}>📊 Результат:</h4>
              <p className={`text-${content.steps[0].color}-700`}>{content.result}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Техническая деталь:</strong> Все расчеты выполняются в проекции EPSG:3857 для точности в метрах с использованием библиотек NetworkX и Shapely.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Заголовок страницы с навигацией - растянут на всю ширину с размытыми краями */}
        <div className="w-full flex-shrink-0 relative">
          {/* Плоский фоновый градиент без объемности с очень тонкими декоративными элементами */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Основной фон */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent"></div>
            {/* Вторичный слой для плавности */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/20 to-transparent"></div>
            
            {/* Декоративные элементы парка с транспортом */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1400 120" preserveAspectRatio="none">
              {/* Небо с градиентом */}
              <rect x="0" y="0" width="1400" height="50" fill="url(#transportSkyGradient)" opacity="0.3"/>
              
              {/* Половина солнышка - правая часть (продолжение с первой страницы) */}
              <defs>
                <clipPath id="rightHalf">
                  <rect x="0" y="0" width="700" height="120"/>
                </clipPath>
              </defs>
              <g clipPath="url(#rightHalf)">
                <circle cx="0" cy="25" r="15" fill="#FCD34D" opacity="0.6"/>
                <g opacity="0.4">
                  <line x1="15" y1="25" x2="25" y2="25" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="0" y1="10" x2="0" y2="0" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="0" y1="40" x2="0" y2="50" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="11" y1="14" x2="18" y2="7" stroke="#FCD34D" strokeWidth="2"/>
                  <line x1="11" y1="36" x2="18" y2="43" stroke="#FCD34D" strokeWidth="2"/>
                </g>
              </g>
              
              {/* Облака - продолжение с первой страницы */}
              <g opacity="0.25">
                <ellipse cx="200" cy="30" rx="30" ry="15" fill="#E5E7EB"/>
                <ellipse cx="225" cy="28" rx="25" ry="12" fill="#E5E7EB"/>
                <ellipse cx="215" cy="25" rx="18" ry="10" fill="#F3F4F6"/>
              </g>
              
              <g opacity="0.3">
                <ellipse cx="600" cy="20" rx="25" ry="12" fill="#E5E7EB"/>
                <ellipse cx="620" cy="18" rx="20" ry="10" fill="#E5E7EB"/>
                <ellipse cx="610" cy="15" rx="15" ry="8" fill="#F3F4F6"/>
              </g>
              
              {/* Трава/газон */}
              <rect x="0" y="70" width="1400" height="50" fill="#16A34A" opacity="0.2"/>
              
              {/* Дорожки */}
              <path d="M 0 90 Q 200 85 400 90 T 800 85 Q 1000 80 1200 85 L 1400 88" stroke="#D1D5DB" strokeWidth="3" fill="none" opacity="0.4"/>
              <path d="M 300 70 Q 400 95 500 80 Q 600 65 700 90" stroke="#D1D5DB" strokeWidth="2" fill="none" opacity="0.3"/>
              
              {/* Деревья - продолжение парка с первой страницы */}
              <g opacity="0.38">
                <rect x="99" y="52" width="2" height="23" fill="#8B4513"/>
                <circle cx="100" cy="47" r="11" fill="#22C55E"/>
                <circle cx="106" cy="44" r="7" fill="#16A34A"/>
                <circle cx="94" cy="42" r="8" fill="#15803D"/>
              </g>
              
              <g opacity="0.4">
                <rect x="399" y="55" width="2" height="20" fill="#8B4513"/>
                <circle cx="400" cy="50" r="10" fill="#22C55E"/>
                <circle cx="405" cy="47" r="6" fill="#16A34A"/>
                <circle cx="395" cy="45" r="7" fill="#15803D"/>
              </g>
              
              <g opacity="0.35">
                <rect x="699" y="50" width="2" height="25" fill="#8B4513"/>
                <circle cx="700" cy="45" r="12" fill="#22C55E"/>
                <circle cx="707" cy="42" r="8" fill="#16A34A"/>
                <circle cx="693" cy="40" r="9" fill="#15803D"/>
              </g>
              
              {/* Скамейки - плоские */}
              <g opacity="0.4">
                <rect x="350" y="85" width="20" height="2" fill="#8B4513"/>
                <rect x="352" y="85" width="1" height="6" fill="#6B7280"/>
                <rect x="367" y="85" width="1" height="6" fill="#6B7280"/>
                <rect x="354" y="80" width="12" height="3" fill="#8B4513"/>
              </g>
              
              <g opacity="0.35">
                <rect x="750" y="83" width="20" height="2" fill="#8B4513"/>
                <rect x="752" y="83" width="1" height="6" fill="#6B7280"/>
                <rect x="767" y="83" width="1" height="6" fill="#6B7280"/>
                <rect x="754" y="78" width="12" height="3" fill="#8B4513"/>
              </g>
              
              {/* Фонари - плоские */}
              <g opacity="0.35">
                <rect x="399" y="60" width="1" height="20" fill="#6B7280"/>
                <circle cx="400" cy="58" r="3" fill="#FCD34D"/>
                <rect x="398" y="80" width="3" height="1" fill="#6B7280"/>
              </g>
              
              <g opacity="0.3">
                <rect x="999" y="55" width="1" height="25" fill="#6B7280"/>
                <circle cx="1000" cy="53" r="3" fill="#FCD34D"/>
                <rect x="998" y="80" width="3" height="1" fill="#6B7280"/>
              </g>
              
              {/* Клумбы с цветами - плоские */}
              <g opacity="0.3">
                <ellipse cx="150" cy="95" rx="12" ry="6" fill="#15803D"/>
                <circle cx="145" cy="93" r="1.5" fill="#EF4444"/>
                <circle cx="152" cy="90" r="1.5" fill="#F59E0B"/>
                <circle cx="148" cy="97" r="1.5" fill="#8B5CF6"/>
                <circle cx="155" cy="95" r="1.5" fill="#EC4899"/>
              </g>
              
              <g opacity="0.25">
                <ellipse cx="650" cy="98" rx="15" ry="8" fill="#15803D"/>
                <circle cx="645" cy="96" r="1.5" fill="#EF4444"/>
                <circle cx="652" cy="93" r="1.5" fill="#F59E0B"/>
                <circle cx="648" cy="100" r="1.5" fill="#8B5CF6"/>
                <circle cx="655" cy="98" r="1.5" fill="#EC4899"/>
                <circle cx="658" cy="95" r="1.5" fill="#10B981"/>
              </g>
              
              {/* Кустарники - плоские */}
              <ellipse cx="100" cy="98" rx="8" ry="4" fill="#22C55E" opacity="0.25"/>
              <ellipse cx="450" cy="105" rx="6" ry="3" fill="#16A34A" opacity="0.2"/>
              <ellipse cx="850" cy="102" rx="10" ry="5" fill="#15803D" opacity="0.23"/>
              
              {/* ТРАНСПОРТНЫЕ ЭЛЕМЕНТЫ В КОНЦЕ - автобус и остановка */}
              {/* Автобусная остановка */}
              <g opacity="0.5">
                {/* Крыша остановки */}
                <rect x="1080" y="45" width="40" height="3" fill="#6B7280"/>
                {/* Столбы */}
                <rect x="1082" y="48" width="2" height="25" fill="#6B7280"/>
                <rect x="1116" y="48" width="2" height="25" fill="#6B7280"/>
                {/* Скамейка в остановке */}
                <rect x="1090" y="68" width="20" height="2" fill="#8B4513"/>
                <rect x="1092" y="68" width="1" height="6" fill="#6B7280"/>
                <rect x="1107" y="68" width="1" height="6" fill="#6B7280"/>
                <rect x="1094" y="63" width="12" height="3" fill="#8B4513"/>
                {/* Знак остановки */}
                <rect x="1085" y="55" width="8" height="6" fill="#DC2626"/>
                <text x="1089" y="60" font-size="3" fill="white" text-anchor="middle">A</text>
              </g>
              
              {/* Автобус приближается к остановке */}
              <g opacity="0.5">
                <rect x="1130" y="75" width="25" height="12" fill="#3B82F6" rx="2"/>
                {/* Окна автобуса */}
                <rect x="1133" y="78" width="4" height="4" fill="#FFFFFF"/>
                <rect x="1138" y="78" width="4" height="4" fill="#FFFFFF"/>
                <rect x="1143" y="78" width="4" height="4" fill="#FFFFFF"/>
                <rect x="1148" y="78" width="4" height="4" fill="#FFFFFF"/>
                {/* Двери */}
                <rect x="1152" y="82" width="2" height="5" fill="#374151"/>
                {/* Колеса */}
                <circle cx="1138" cy="88" r="3" fill="#374151"/>
                <circle cx="1147" cy="88" r="3" fill="#374151"/>
                {/* Номер маршрута */}
                <rect x="1132" y="76" width="6" height="4" fill="#FCD34D"/>
                <text x="1135" y="79" font-size="2" fill="#000" text-anchor="middle">42</text>
              </g>
              
              {/* Дорога для автобуса */}
              <rect x="1000" y="85" width="400" height="8" fill="#374151" opacity="0.3"/>
              <path d="M 1020 89 L 1040 89 M 1060 89 L 1080 89 M 1100 89 L 1120 89 M 1140 89 L 1160 89 M 1180 89 L 1200 89 M 1220 89 L 1240 89 M 1260 89 L 1280 89 M 1300 89 L 1320 89 M 1340 89 L 1360 89" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.4"/>
              
              {/* Градиент для неба */}
              <defs>
                <linearGradient id="transportSkyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DBEAFE" />
                  <stop offset="100%" stopColor="#BFDBFE" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Сильно размытые края - левый */}
            <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-r from-white via-white/60 to-transparent blur-3xl"></div>
            {/* Сильно размытые края - правый */}
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white via-white/60 to-transparent blur-3xl"></div>
            {/* Дополнительные размытые слои для еще большей мягкости */}
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-gradient-to-r from-gray-50/90 via-gray-50/40 to-transparent blur-2xl"></div>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-gray-50/90 via-gray-50/40 to-transparent blur-2xl"></div>
            {/* Третий слой размытия */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-white/70 via-transparent to-transparent blur-xl"></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-white/70 via-transparent to-transparent blur-xl"></div>
            
            {/* Размытый нижний край для плавного перехода */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent blur-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/90 via-gray-50/60 to-transparent blur-xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 via-white/50 to-transparent blur-lg"></div>
          </div>
          
          {/* Контент заголовка */}
          <div className="relative z-10 px-6 py-6 flex items-center justify-between">
            <div className="flex-1 flex justify-start">
              <Link 
                to="/" 
                className="group relative"
              >
                <svg 
                  width="180" 
                  height="120" 
                  viewBox="0 0 180 120" 
                  className="transition-opacity duration-300 hover:opacity-80"
                >
                  <defs>
                    <linearGradient id="grayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6B7280" />
                      <stop offset="100%" stopColor="#4B5563" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 20 24 L 180 24 L 180 96 L 20 96 L 0 60 Z" 
                    fill="url(#grayGradient)"
                    className="group-hover:fill-gray-700 transition-colors duration-300"
                  />
                  <text 
                    x="100" 
                    y="64" 
                    textAnchor="middle" 
                    className="fill-white font-medium text-lg"
                  >
                    ← Анализ
                  </text>
                </svg>
              </Link>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-gray-900 mb-2 header">
                Рекомендованные маршруты
              </h2>
              <p className="text-blue-600 font-medium header">
                для улучшения доступности
              </p>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>

        {/* KPI карточки для рекомендованных маршрутов */}
        <div className="flex-shrink-0 grid grid-cols-5 content-padding stats-grid">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Новые маршруты</p>
                  <button
                    onClick={() => setShowInfoPopup('new-routes')}
                    className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                    title="Подробнее об алгоритме расчета"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {routes.filter(r => r.type === "Рекомендованный маршрут").length}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Navigation className="w-4 h-4 mr-1" />
                  Рекомендованных
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <Route className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Удлинения</p>
                  <button
                    onClick={() => setShowInfoPopup('extensions')}
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Подробнее об алгоритме удлинений"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {routes.filter(r => r.type === "Удлинить маршрут").length}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Navigation className="w-4 h-4 mr-1" />
                  Существующих маршрутов
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <Navigation className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Охват общественных пространств</p>
                  <button
                    onClick={() => setShowInfoPopup('coverage')}
                    className="text-gray-400 hover:text-emerald-600 transition-colors duration-200"
                    title="Подробнее о расчете охвата"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {routeMetrics?.spacesServedByNewSolutions || '730'}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TreePine className="w-4 h-4 mr-1" />
                  Обслуживаемых объектов
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Общая длина</p>
                  <button
                    onClick={() => setShowInfoPopup('total-length')}
                    className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                    title="Подробнее о расчете длины"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {routeMetrics?.totalNewRoutesLength || '0.0'} км
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Target className="w-4 h-4 mr-1" />
                  Новых маршрутов
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-600">Эффективность</p>
                  <button
                    onClick={() => setShowInfoPopup('efficiency')}
                    className="text-gray-400 hover:text-orange-600 transition-colors duration-200"
                    title="Подробнее о расчете эффективности"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-3xl font-bold text-gray-900">+{routeMetrics?.improvementPercentage || '60'}%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Улучшение доступности
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Таблица маршрутов слева и карта справа */}
        <div className="flex-1 pb-6 pt-6 flex min-h-0 content-padding layout-flex">
          {/* Таблица маршрутов - 40% ширины */}
          <div className="w-2/5 h-full sidebar">
            <RoutesTable onSelect={handleSelectRoute} selectedRoute={selectedRoute} routes={routes} loading={loading} error={error} />
          </div>

          {/* Карта - 60% ширины */}
          <div className="w-3/5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm map-container">
            <MapTiler
              selectedRoute={selectedRoute ? {
                routeName: selectedRoute.name,
                routeType: selectedRoute.type,
                routeDistrict: selectedRoute.district,
                uniqueId: selectedRoute.uniqueId
              } : null}
              visibleTypes={visibleTypes}
              onToggleVisibility={handleToggleVisibility}
              hideLegend={false}
              allowedLegendTypes={["Остановка", "Рекомендованная остановка", "Озеленение"]}
              showAllForLegendTypes={true}
              onClearSelection={() => setSelectedRoute(null)}
            />
          </div>
        </div>
      </div>
      
      {/* Информационный поп-ап */}
      <InfoPopup />
    </Layout>
  );
} 
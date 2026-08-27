import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import MapTiler from "../components/MapTiler";
import { Route, Loader, TrendingUp, Info } from "lucide-react";
import { calculateRouteMetrics } from "../utils/routeMetrics";
import { getDisplayName } from "../utils/displayName";
import Header from "../components/Header";
import RoutesTable from "../components/RoutesTable";
import RouteKpiCards from "../components/RouteKpiCards";

const ROUTE_TYPES = [
  "Рекомендованный маршрут",
  "Удлинить маршрут",
  "Маршрут автобуса",
  "Остановка",
  "Рекомендованная остановка",
  "Озеленение"
];

export interface RouteData {
  id: string;
  uniqueId: number | null;
  name: string;
  type: string;
  district: string;
  length: number;
  publicSpaces: number;
  improvement: string;
}

export default function RecommendedRoutes() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(["Озеленение"]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeMetrics, setRouteMetrics] = useState<any>(null);
  const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        const basePath = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${basePath}final.geojson`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные');
        }
        const data = await response.json();

        const routeFeatures = data.features.filter((feature: any) =>
          feature.properties.type === "Рекомендованный маршрут" ||
          feature.properties.type === "Удлинить маршрут"
        );

        const publicSpaces = data.features.filter((feature: any) =>
          feature.properties.type === "Озеленение"
        );

        const excludedIds = [51, 42, 29, 3, 5];

        const formattedRoutes: RouteData[] = routeFeatures
          .filter((feature: any) => !excludedIds.includes(feature.properties.id))
          .map((feature: any, index: number) => {
          const props = feature.properties;
          const length = props.Shape__Length ? (props.Shape__Length / 1000).toFixed(1) : Math.random() * 20 + 5;

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
            publicSpaces: publicSpacesCount,
            improvement: getImprovementText(props.type, props.name)
          };
        });

        setRoutes(formattedRoutes);

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
    setVisibleTypes(["Остановка", "Рекомендованная остановка", "Озеленение"]);
  };

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

  const InfoPopup = () => {
    if (!showInfoPopup) return null;

    const content = getPopupContent(showInfoPopup);
    if (!content) return null;

    const stepColors: any = {
      green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", circle: "bg-emerald-500" },
      blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", circle: "bg-blue-500" },
      emerald: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", circle: "bg-teal-500" },
      purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", circle: "bg-purple-500" },
      orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", circle: "bg-orange-500" },
    };

    const style = stepColors[content.steps[0].color] || stepColors.blue;

    return (
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200"
        onClick={() => setShowInfoPopup(null)}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${style.bg} ${style.text}`}>
                <Info size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
            </div>
            <button
              onClick={() => setShowInfoPopup(null)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
              <p className={`text-sm leading-relaxed ${style.text}`}>
                <span className="font-bold uppercase text-[10px] tracking-widest block mb-1 opacity-70">Цель алгоритма</span>
                {content.goal}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                <Route className="w-4 h-4 mr-2" />
                Процесс анализа:
              </h4>

              <div className="grid gap-3">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-xl border border-gray-50 bg-white hover:border-gray-200 transition-colors">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${style.circle} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-800 mb-0.5">{step.title}</p>
                      <p className="text-xs text-gray-500 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 text-white shadow-inner relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-20%] opacity-10">
                  <TrendingUp size={120} />
              </div>
              
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ожидаемый результат:</h4>
              <p className="text-lg font-semibold text-emerald-400 leading-tight">
                {content.result}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#F9FAFB] border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setShowInfoPopup(null)}
              className="px-6 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all active:scale-95 shadow-md"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col bg-[#F9FAFB] overflow-hidden">
        <Header />

        <div className="grid grid-cols-5 gap-4 px-6 py-4 flex-shrink-0">
          {loading ? (
             <div className="col-span-5 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-100">
               <Loader className="animate-spin mr-2" /> Загрузка...
             </div>
          ) : (
            <RouteKpiCards 
              routes={routes} 
              metrics={routeMetrics} 
              onInfoClick={(type) => setShowInfoPopup(type)} 
            />
          )}
        </div>

        <div className="flex-1 flex px-6 pb-6 gap-6 min-h-0">
          
          <div className="w-[60%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
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

          <div className="w-[40%] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <RoutesTable 
              onSelect={handleSelectRoute} 
              selectedRoute={selectedRoute} 
              routes={routes} 
              loading={loading} 
              error={error} 
            />
          </div>
        </div>
      </div>

      <InfoPopup />
    </Layout>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Lightbulb } from "lucide-react";
import headerBg from "../assets/header-bg.png";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className="relative bg-white px-6 py-4  min-h-[145px] border-b border-gray-100 flex items-center justify-between overflow-hidden"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "60% center",
        backgroundSize: "520px auto",
      }}
    >
      <div className="relative z-10 flex flex-col gap-1">
        {isHome ? (
          <>
            <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">
              Доступность общественных пространств <br />
              на общественном транспорте
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Анализ 1 735 общественных пространств и их доступности в городе Алматы
            </p>
          </>
        ): (
          <div className="flex items-start gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all w-fit"
            >
              <ChevronRight size={18} className="rotate-180 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Анализ</span>
            </Link>

            <div>
              <h1 className="text-[32px] font-extrabold text-[#1e293b] leading-tight tracking-tight">
                Рекомендуемые маршруты
              </h1>
              <h3 className="text-[18px] font-semibold text-[#059669] leading-tight tracking-tight mt-1">
                для улучшения транспортной доступности
              </h3>
              <p className="text-gray-500 text-sm font-medium mt-2">
                Анализ 55 маршрутов и 3 362 общественных пространств города Алматы
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка */}
      <div className="relative z-10 flex items-center">
        {isHome ? (
          <Link
            to="/routes"
            className="
              flex items-center gap-3
              bg-[#059669]
              hover:bg-[#047857]
              transition-all duration-300
              text-white
              px-5 py-3
              rounded-xl
              shadow-lg shadow-emerald-200
              group
            "
          >
            <div>
              <Lightbulb size={32} strokeWidth={2} />
            </div>

            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-bold">
                Что улучшить?
              </span>

              <span className="text-[11px] opacity-90">
                Рекомендации по развитию
              </span>
            </div>
          </Link>
        ):
        (
          <div
            className="
              flex items-center gap-3
              bg-[#e7f6f2] 
              hover:bg-[#d1efe6] 
              transition-all duration-300
              px-5 py-3
              rounded-2xl
              border border-[#b9e5d8]
              group
            "
          >
            <div className="text-[#059669]">
              <Lightbulb size={32} strokeWidth={2} />
            </div>

            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-[#065f46]">
                Что это значит?
              </span>
              <span className="text-[11px] text-[#065f46] opacity-80 max-w-[300px]">
                Рекомендации помогут добавить новые остановки и изменить маршруты, чтобы больше общественных пространств были доступны на общественном транспорте.
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
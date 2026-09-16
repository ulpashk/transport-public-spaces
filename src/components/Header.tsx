import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import headerBg from "../assets/header-bg.png";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className="relative bg-white px-8 py-5 min-h-[145px] border-b border-gray-100 flex items-center justify-between overflow-hidden"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "520px auto",
      }}
    >
      {/* Текст */}
      <div className="relative z-10 flex flex-col gap-1">
        <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight">
          Доступность общественных пространств <br />
          на общественном транспорте
        </h1>

        <p className="text-gray-500 text-sm font-medium mt-1">
          Анализ 1 735 общественных пространств и их доступности в городе Алматы
        </p>
      </div>

      {/* Кнопка */}
      <div className="relative z-10 flex items-center">
        {isHome && (
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
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm font-bold">
                Что улучшить?
              </span>

              <span className="text-[11px] opacity-90">
                Рекомендации по развитию
              </span>
            </div>

            <div className="bg-white/20 p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
              <ChevronRight
                size={18}
                className="text-white"
              />
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { to: "/", label: "Главная" },
    { to: "/routes", label: "Рекомендации" },
  ];

  return (
    <header
      className={`pl-4 pr-4 sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md border-b-2 border-[#c1d3ff]"
          : "bg-white border-b border-[#e8e8e8]"
      }`}
    >
      <div className="flex h-14 w-full justify-between items-center px-2">
        {/* Левая часть: Название проекта */}
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[#1b1b1b] truncate">
              Транспортная доступность общественных пространств
            </h1>
          </div>
        </div>

        {/* Правая часть: Навигация */}
        <div className="flex items-center gap-3">
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive(item.to)
                    ? "bg-[#236FFF] text-white"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Мобильное меню (иконка) */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Выпадающее меню для мобильных устройств */}
      {mobileMenu && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-[#c1d3ff] shadow-lg p-4 flex flex-col gap-2">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenu(false)}
              className={`px-4 py-2 rounded-md text-sm font-semibold ${
                isActive(item.to) ? "bg-[#ebf1ff] text-[#236FFF]" : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
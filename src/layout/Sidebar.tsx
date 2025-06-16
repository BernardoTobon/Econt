"use client";

import Link from "next/link";
import React, { useState } from "react";
import { SideBarInfo } from "../constants/SidebarInfo";
import { usePathname } from "next/navigation";

type SideBarProps = {
  children?: React.ReactNode;
};

type SideBarLinkType = {
  href: string;
  label: string;
};

type SideBarInfoType = {
  section: string;
  label: string;
  icon: React.ReactNode;
  links: SideBarLinkType[];
  href?: string;
};

export const SideBar: React.FC<SideBarProps> = ({ children }) => {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle del sidebar principal
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Cerrar sidebar al hacer clic fuera
  React.useEffect(() => {
    if (!isSidebarOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar-overlay');
      const toggleButton = document.getElementById('sidebar-toggle');

      if (sidebar && !sidebar.contains(e.target as Node) &&
        toggleButton && !toggleButton.contains(e.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSidebarOpen]);

  const toggleSection = (section: string) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // Ocultar sidebar en login, signup, recovery y página principal
  const hideSidebar = pathname === "/login" || pathname === "/signup" || pathname === "/recovery" || pathname === "/";

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-white font-poppins">
      {/* Botón Hamburger Menu - Esquina Superior Izquierda */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105"
        aria-label="Toggle Menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          {/* Icono Hamburger animado */}
          <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white mt-1 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-white mt-1 transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
        </div>
      </button>      <div
        id="sidebar-overlay"
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-green-700 via-green-800 to-green-950 text-white z-40 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ width: '320px' }}
      >
        {/* Header del Sidebar - Fijo */}
        <div className="p-6 border-b border-green-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 ml-12">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  alt="E-cont logo"
                  src="/E-cont 1.png"
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-300">ContaWeb</h2>
                <p className="text-sm text-green-400">Sistema de Gestión</p>
              </div>
            </div>
          </div>
        </div>        {/* Contenido del menú - Scrolleable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          <nav className="space-y-2">
            {SideBarInfo.map((item: SideBarInfoType) => (
              <div key={item.section} className="mb-2">
                {/* Item principal del menú */}
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-green-700 rounded-lg transition-colors duration-200"
                  onClick={() => toggleSection(item.section)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center text-green-300">
                      {item.icon}
                    </div>
                    <span className="text-lg font-medium">{item.label}</span>
                  </div>
                  {item.links.length > 0 && (
                    <div className="text-green-400">
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${openSections[item.section] ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Submenu expandible */}
                {item.links.length > 0 && openSections[item.section] && (
                  <div className="mt-2 ml-6 space-y-1 animate-slideDown">
                    {item.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={() => setIsSidebarOpen(false)} // Cerrar sidebar al navegar
                        className="block p-2 text-gray-200 hover:text-white hover:bg-green-600 rounded-md transition-colors duration-200 text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{link.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Enlaces directos sin submenu */}
                {item.href && !item.links.length && (
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)} // Cerrar sidebar al navegar
                    className="block mt-2 ml-6 p-2 text-gray-200 hover:text-white hover:bg-green-600 rounded-md transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer del Sidebar - Fijo */}
        <div className="p-4 border-t border-green-600 flex-shrink-0">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
              <img
                alt="E-cont logo"
                src="/E-cont 1.png"
                className="object-contain w-full h-full opacity-80"
              />
            </div>
            <p className="text-xs text-green-400">© 2025 ContaWeb</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  );
};

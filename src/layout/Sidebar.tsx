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

  // Sidebar expand/collapse handler para desktop
  const handleSidebarHover = (open: boolean) => {
    if (window.innerWidth >= 640) {
      setIsSidebarOpen(open);
    }
  };

  // Sidebar touch/click handler para dispositivos táctiles y desktop
  const handleSidebarClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (window.innerWidth < 640) {
      setIsSidebarOpen((prev) => !prev);
      e.stopPropagation();
    }
  };

  // Cerrar sidebar al tocar fuera en dispositivos táctiles
  React.useEffect(() => {
    if (!isSidebarOpen || window.innerWidth >= 640) return;
    const handleTouchOutside = (e: TouchEvent) => {
      const sidebar = document.getElementById('sidebar-main');
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('touchstart', handleTouchOutside, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouchOutside);
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
    <div className={`flex h-screen font-poppins`}>
      {/* Sidebar visible siempre que no sea login, signup o recovery */}
      <div
        id="sidebar-main"
        className={`flex flex-col items-center justify-between rounded-lg h-full fixed bg-gradient-to-b from-green-700 via-green-800 to-green-950 p-4 text-white overflow-hidden z-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-80" : "w-24"}`}
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => handleSidebarHover(false)}
        onClick={handleSidebarClick}
        style={{ touchAction: 'manipulation', top: 0, left: 0 }}
      >
        <div className="flex-1 flex flex-col justify-start w-full">
          <ul className="space-y-4 w-full">
            {SideBarInfo.map((item: SideBarInfoType) => (
              <li key={item.section}>
                <div
                  className={`flex justify-between items-center p-2 cursor-pointer hover:bg-green-700 rounded-md ${isSidebarOpen ? "" : "w-12"}`}
                  onClick={() => toggleSection(item.section)}
                >
                  <span className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    {isSidebarOpen && (
                      <span className="text-lg">
                        {item.label}
                      </span>
                    )}
                  </span>
                  {item.links.length > 0 && isSidebarOpen && (
                    <span>
                      {openSections[item.section] ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                {item.links.length > 0 && openSections[item.section] && isSidebarOpen && (
                  <ul className="pl-6 space-y-1">
                    {item.links.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-gray-200 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {item.href && !item.links.length && isSidebarOpen && (
                  <Link
                    href={item.href}
                    className="text-gray-200 hover:text-white block mt-2"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full flex flex-col items-center pb-4">
          <div className="w-20 h-20 flex items-center justify-center">
            <img
              alt="E-cont logo"
              src="/E-cont 1.png"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>
      <div
        className="transition-all duration-300 flex-1 p-0 bg-white"
        style={{ minHeight: '100vh', marginLeft: 0 }}
      >
        {children}
      </div>
    </div>
  );
};

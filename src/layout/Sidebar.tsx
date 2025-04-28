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

  // Ocultar sidebar en login, signup, recovery y página principal
  const hideSidebar = pathname === "/login" || pathname === "/signup" || pathname === "/recovery" || pathname === "/";
  if (hideSidebar) {
    return <>{children}</>;
  }

  const toggleSection = (section: string) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className={`flex h-screen font-poppins`}>
      {/* Sidebar visible siempre que no sea login, signup o recovery */}
      <div className="flex justify-center rounded-lg group w-16 hover:w-64 transition-all duration-300 ease-in-out h-full fixed bg-gradient-to-b from-green-700 via-green-800 to-green-950 p-4 text-white overflow-hidden z-10">
        <ul className="space-y-4">
          {SideBarInfo.map((item: SideBarInfoType) => (
            <li key={item.section}>
              <div
                className="flex justify-between items-center p-2 cursor-pointer hover:bg-green-700 rounded-md"
                onClick={() => toggleSection(item.section)}
              >
                <span className="flex items-center space-x-3">
                  <span>{item.icon}</span>
                  <span className="text-lg hidden group-hover:block">
                    {item.label}
                  </span>
                </span>
                {item.links.length > 0 && (
                  <span className="hidden group-hover:block">
                    {openSections[item.section] ? "▲" : "▼"}
                  </span>
                )}
              </div>
              {item.links.length > 0 && openSections[item.section] && (
                <ul className="pl-6 space-y-1 hidden group-hover:block">
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
              {item.href && !item.links.length && (
                <Link
                  href={item.href}
                  className="text-gray-200 hover:text-white block mt-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          <li>
            <div className="flex justify-between items-center p-2 rounded-md">
              <span className="flex items-center">
                <span className="w-12">
                  <div className="pt-96 lg:pt-72">
                    <img
                      alt="E-cont logo"
                      src="/E-cont 1.png"
                      className="group-hover:hidden"
                    />
                  </div>
                </span>
                <span className="hidden group-hover:block">
                  <div className="pt-80">
                    <img alt="E-cont" src="/E-cont 1.png" />
                  </div>
                </span>
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div className="ml-16 group-hover:ml-64 transition-all duration-300 flex-1 p-6 bg-white">
        {children}
      </div>
    </div>
  );
};

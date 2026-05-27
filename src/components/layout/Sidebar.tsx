"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/types";
import { SIDEBAR_ITEMS } from "@/utils/sidebarItems";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user: userData, depot, isLoadingSession } = useSession();

  if (!userData || userData.role === "pelanggan") return null;

  const role = userData.role as Role;
  const items = SIDEBAR_ITEMS[role] || [];

  const getSidebarTitle = () => {
    if (role === "admin") return "Admin";
    if (isLoadingSession) return "Memuat...";
    if (depot?.name) return depot.name;
    return "Depot POS";
  };

  return (
    <aside
      className={`bg-white shadow-xl h-screen fixed top-0 left-0 flex flex-col font-poppins z-50 transition-transform md:transition-all duration-300 ease-in-out ${
        isCollapsed ? "md:w-20" : "md:w-64"
      } w-64 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-blue-600 font-montserrat transition-opacity duration-300">
            {getSidebarTitle()}
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:block p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Tombol Close Mobile */}
        <button 
          onClick={() => setIsMobileOpen?.(false)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 transition-opacity">
            Menu Utama
          </p>
        )}

        {items.map((item) => {
          const isRootPath = item.path === `/${role}`;
          const isActive = isRootPath 
            ? pathname === item.path
            : pathname === item.path || pathname.startsWith(`${item.path}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsMobileOpen?.(false)} 
              title={isCollapsed ? item.title : ""}
              className={`flex items-center px-3 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
              } ${isCollapsed ? "md:justify-center" : ""}`}
            >
              <span className={isCollapsed ? "md:mr-0 mr-3" : "mr-3"}>
                <Icon size={20} />
              </span>
              <span className={`truncate ${isCollapsed ? "md:hidden" : ""}`}>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

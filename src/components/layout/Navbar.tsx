"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon, MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { SIDEBAR_ITEMS } from "@/utils/sidebarItems"; 
import { useSession } from "@/contexts/SessionContext";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { logout } = useAuth();
  const { user: userData } = useSession();
  const pathname = usePathname();

  let pageTitle = "Dashboard";
  if (userData && userData.role !== "pelanggan") {
    const items = SIDEBAR_ITEMS[userData.role] || [];

    const matchedItem = [...items]
      .sort((a, b) => b.path.length - a.path.length)
      .find(
        (item) =>
          pathname === item.path || pathname.startsWith(`${item.path}/`),
      );

    if (matchedItem) {
      pageTitle = matchedItem.title;
    }
  }

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 font-poppins">
      <div className="flex items-center gap-3 md:gap-0">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MenuIcon size={24} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 font-montserrat tracking-tight line-clamp-1">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
            <UserIcon size={16} className="md:w-4.5 md:h-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-semibold text-gray-800 leading-tight">
              {userData?.full_name || "-"}
            </span>
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
              {userData?.role || "-"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

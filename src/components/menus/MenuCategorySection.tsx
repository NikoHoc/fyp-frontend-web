"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, UtensilsCrossed } from "lucide-react";
import { Menu, Category, DepotMenuResponse } from "@/types";
import MenuCard from "@/components/menus/MenuCard";

interface MenuCategorySectionProps {
  menus: DepotMenuResponse[];
  categories: Category[];
  onMenuItemClick: (menu: Menu) => void;
  isLoading?: boolean;
}

export default function MenuCategorySection({
  menus,
  categories,
  onMenuItemClick,
  isLoading = false,
}: MenuCategorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId && !searchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId, searchQuery]);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      if (searchQuery) {
        return menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return Number(menu.categories?.id) === Number(activeCategoryId);
    });
  }, [menus, activeCategoryId, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Cari menu..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) setActiveCategoryId(null);
          }}
        />
      </div>

      {!searchQuery && categories.length > 0 && (
        <div className="p-2 space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Kategori
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  setSearchQuery("");
                }}
                className={`px-6 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all border-2 ${
                  activeCategoryId === cat.id
                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                    : "bg-white border-gray-100 text-gray-500 hover:border-blue-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-2 flex-1 flex flex-col space-y-4 overflow-hidden">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Daftar Menu
        </h2>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          ) : filteredMenus.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {filteredMenus.map((menu) => (
                <div key={menu.id} className="relative">
                  <div className={!menu.is_available ? "opacity-50 pointer-events-none select-none" : undefined}>
                    <MenuCard
                      menu={menu}
                      onClick={() => onMenuItemClick(menu)}
                    />
                  </div>
                  {!menu.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10 z-10">
                      <span className="bg-gray-800/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Tidak Tersedia
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <UtensilsCrossed size={64} className="mb-4" />
              <p className="text-center font-medium">
                {searchQuery
                  ? "Menu tidak ditemukan"
                  : "Pilih kategori untuk melihat menu"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
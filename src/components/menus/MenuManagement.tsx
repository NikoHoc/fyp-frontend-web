"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, CheckCircle2, XCircle, Info } from "lucide-react";
import toast from "react-hot-toast";

import { useDepots } from "@/hooks/useDepot";
import { DepotMenuResponse, Category } from "@/types";
import { formatRupiah } from "@/utils/format";
import { useSession } from "@/contexts/SessionContext";

export default function MenuManagement() {
  const { user, isLoadingSession } = useSession();
  const { getDepotMenus, updateMenuStatus } = useDepots();

  const [localMenus, setLocalMenus] = useState<DepotMenuResponse[]>([]);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.depot_id) return;
      try {
        const depotId = Number(user.depot_id);
        const data: DepotMenuResponse[] = await getDepotMenus(depotId);
        if (!data || data.length === 0) return;

        setLocalMenus(data);

        const uniqueCats: Category[] = [];
        const seenIds = new Set();

        data.forEach((menu) => {
          if (menu.categories && !seenIds.has(menu.categories.id)) {
            seenIds.add(menu.categories.id);
            uniqueCats.push(menu.categories);
          }
        });
        setLocalCategories(uniqueCats);
        if (uniqueCats.length > 0) setActiveCategoryId(uniqueCats[0].id);
      } catch (error) {
        console.error("Gagal load menu", error);
      }
    };
    if (!isLoadingSession) loadData();
  }, [user, isLoadingSession, getDepotMenus]);

  const handleToggleStatus = async (menuId: number, currentStatus: boolean) => {
    if (!user?.depot_id) return;
    try {
      const nextStatus = !currentStatus;
      setLocalMenus((prev) =>
        prev.map((m) =>
          m.id === menuId ? { ...m, is_available: nextStatus } : m
        )
      );

      await updateMenuStatus(Number(user.depot_id), menuId, nextStatus);
      toast.success(
        `Status menu diubah menjadi ${nextStatus ? "Tersedia" : "Habis"}`
      );
    } catch (error) {
      setLocalMenus((prev) =>
        prev.map((m) =>
          m.id === menuId ? { ...m, is_available: currentStatus } : m
        )
      );
    }
  };

  const filteredMenus = useMemo(() => {
    return localMenus.filter((menu) => {
      if (searchQuery) {
        return menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return Number(menu.categories?.id) === Number(activeCategoryId);
    });
  }, [localMenus, activeCategoryId, searchQuery]);

  if (isLoadingSession) return <div className="p-6">Loading data...</div>;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur ketersediaan menu (Habis/Tersedia) secara real-time.
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>

      {!searchQuery && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Kategori
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {localCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategoryId === cat.id
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col space-y-4 overflow-hidden">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Daftar Menu
        </h2>
        
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={menu.image_url || "/images/placeholder-menu.png"}
                    alt={menu.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">
                    {menu.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-amber-600">
                      {formatRupiah(menu.price)}
                    </span>
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {menu.categories?.name}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 italic">
                  {menu.description || "Tidak ada deskripsi menu."}
                </div>

                <button
                  onClick={() => handleToggleStatus(menu.id, menu.is_available)}
                  className={`cursor-pointer w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    menu.is_available
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100"
                  }`}
                >
                  {menu.is_available ? (
                    <>
                      <CheckCircle2 size={16} /> Tersedia
                    </>
                  ) : (
                    <>
                      <XCircle size={16} /> Habis / Kosong
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {filteredMenus.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <Info size={40} className="mb-2" />
              <p className="font-medium">Tidak ada menu yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
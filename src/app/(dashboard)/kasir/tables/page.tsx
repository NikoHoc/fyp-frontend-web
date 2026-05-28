"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, Search, Dices } from "lucide-react";
import { useTables } from "@/hooks/useTables";
import { Table } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import toast from "react-hot-toast";

export default function KasirTablesPage() {
  const {
    tables,
    isLoading,
    fetchTables,
    updateTable,
  } = useTables();
  const { user, isLoadingSession } = useSession();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchTables(user.depot_id);
    }
  }, [isLoadingSession, user, fetchTables]);

  const handleToggleStatus = async (table: Table) => {
    if (!user?.depot_id) return;

    const nextStatus = !table.is_active;

    try {
      const isSuccess = await updateTable(table.id, user.depot_id, {
        is_active: nextStatus,
      });

      if (isSuccess) {
        toast.success(
          `Meja ${table.table_number} kini ${nextStatus ? "Siap Digunakan" : "Dinonaktifkan"}`,
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status meja:", error);
    }
  };

  const filteredTables = useMemo(() => {
    if (!tables) return [];
    return tables.filter((table) =>
      table.table_number.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tables, searchQuery]);

  if (!user?.depot_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Akses Ditolak</h2>
        <p>Akun ini tidak terikat pada cabang (Depot) manapun.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-800">
              Manajemen Meja Depot
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Pantau denah meja serta kelola status ketersediaan meja untuk dine-in
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
              <Dices size={20} className="text-orange-500" /> Daftar Meja Depot
            </h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Menampilkan total: {tables.length} meja 
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nomor meja.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50/60 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-sm font-bold text-gray-400">
              Memuat barisan meja...
            </p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={32} className="text-gray-300" />
            <p className="text-sm font-medium italic">
              {searchQuery
                ? "Meja yang Anda cari tidak ditemukan."
                : "Belum ada data meja di depot ini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-150">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-20">
                    No
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                    Nomor / Nama Meja
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center w-40">
                    Status Aktif
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTables.map((table, index) => (
                  <tr
                    key={table.id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-700">
                      Meja {table.table_number}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span
                          className={`text-xs font-black uppercase tracking-wider ${table.is_active ? "text-green-600" : "text-gray-400"}`}
                        >
                          {table.is_active ? "Ready" : "Off"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(table)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            table.is_active ? "bg-green-500" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              table.is_active
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
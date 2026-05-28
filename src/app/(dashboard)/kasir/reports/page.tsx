"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSettlement } from "@/hooks/useSettlement";
import { formatDateFull, getTodayStr, getFirstDayOfMonthStr } from "@/utils/format";
import { useSession } from "@/contexts/SessionContext";
import SettlementHistoryTable from "@/components/settlements/SettlementHistoryTable";


export default function ReportsPage() {
  const { settlements, isLoading, fetchSettlements } = useSettlement();
  const { user, isLoadingSession } = useSession();

  const [startDate, setStartDate] = useState(getFirstDayOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());
  const [activeShortcut, setActiveShortcut] = useState<"bulan_ini" | "semua" | "custom">("bulan_ini");

  const endOfToday = `${getTodayStr()}T23:59:59.999Z`;

  useEffect(() => {
    if (!isLoadingSession && user?.depot_id) {
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    }
  }, [isLoadingSession, user?.depot_id, fetchSettlements, endOfToday]);

  const handleApplyFilter = () => {
    if (!user?.depot_id) return;
    setActiveShortcut("custom");
    const adjustedEndDate = endDate ? `${endDate}T23:59:59.999Z` : "";
    fetchSettlements(user.depot_id, startDate, adjustedEndDate);
  };

  const handleFilterShortcut = (type: "bulan_ini" | "semua") => {
    if (!user?.depot_id) return;
    setActiveShortcut(type);

    if (type === "bulan_ini") {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(getTodayStr());
      fetchSettlements(user.depot_id, getFirstDayOfMonthStr(), endOfToday);
    } else if (type === "semua") {
      setStartDate("");
      setEndDate("");
      fetchSettlements(user.depot_id); 
    }
  };

  if (isLoadingSession) {
    return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Mempersiapkan Laporan Keuangan...</div>;
  }
  
  return (
    <div className="h-full flex flex-col mx-auto space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Riwayat Settlement Kasir</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {activeShortcut === "semua" 
              ? "Menampilkan semua riwayat settlement yang tercatat." 
              : `Menampilkan data periode: ${startDate ? formatDateFull(startDate) : '-'} s/d ${endDate ? formatDateFull(endDate) : '-'}`
            }
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start lg:self-auto">
            <button
              onClick={() => handleFilterShortcut("bulan_ini")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "bulan_ini" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => handleFilterShortcut("semua")}
              className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeShortcut === "semua" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Semua
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cursor-pointer px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-blue-500"
            />
            <button
              onClick={handleApplyFilter}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 px-4 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 text-xs font-black w-full sm:w-auto justify-center"
              title="Terapkan Filter"
            >
              <Filter size={18} />Tampilkan
            </button>
          </div>
        </div>
      </div>

      <SettlementHistoryTable 
        data={settlements}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
        detailPathPrefix="/kasir/reports/settlement"
        role='kasir'
      />
    </div>
  );
}
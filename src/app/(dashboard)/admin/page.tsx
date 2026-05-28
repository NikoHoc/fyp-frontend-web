"use client";

import { useEffect } from "react";
import { Store, Users, UtensilsCrossed, Smartphone, Shield, LayoutGrid, ScrollText } from "lucide-react";
import Link from "next/link";
import { useDepots } from "@/hooks/useDepot";
import { useEmployees } from "@/hooks/useEmployees";
import { useMenus } from "@/hooks/useMenus";
import { useCustomers } from "@/hooks/useCustomers";

export default function AdminDashboard() {
  const { depots, fetchDepots } = useDepots();
  const { employees, fetchEmployees } = useEmployees();
  const { menus, fetchMenus } = useMenus();
  const { customers, fetchCustomers } = useCustomers();

  useEffect(() => {
    fetchDepots();
    fetchEmployees();
    fetchMenus();
    fetchCustomers();
  }, [fetchDepots, fetchEmployees, fetchMenus, fetchCustomers]);

  const activeDepots = depots.filter(d => d.is_open).length;

  return (
    <div className="h-full flex flex-col mx-auto space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
          Pusat Kendali Sistem (Pusat) 🚀
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">
          Pantau dan kelola master data untuk seluruh jaringan cabang Depot XYZ.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:border-blue-200 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Store size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jaringan Cabang</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-gray-800">{depots.length}</span>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md whitespace-nowrap">{activeDepots} Beroperasi</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:border-purple-200 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sumber Daya Manusia</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-gray-800">{employees.length}</span>
              <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Pegawai Terdaftar</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:border-emerald-200 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Smartphone size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pelanggan</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-gray-800">{customers.length}</span>
              <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Pengguna Aplikasi</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:border-orange-200 transition-colors">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><UtensilsCrossed size={24} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Katalog Master Menu</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-gray-800">{menus.length}</span>
              <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">Item Tersedia</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS (2 Kolom di HP, 4 di Desktop) */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-sm md:text-base font-black text-gray-800 mb-4 flex items-center gap-2"><LayoutGrid size={18} className="text-blue-500"/> Akses Cepat Master Data</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href="/admin/depots" className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-2 md:gap-3">
            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Store size={18} className="text-gray-700"/></span>
            <span className="text-xs md:text-sm font-bold text-gray-800">Manajemen Cabang</span>
          </Link>
          <Link href="/admin/employees" className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-2 md:gap-3">
            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Shield size={18} className="text-gray-700"/></span>
            <span className="text-xs md:text-sm font-bold text-gray-800">Manajemen Pegawai</span>
          </Link>
          <Link href="/admin/menus" className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-2 md:gap-3">
            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><UtensilsCrossed size={18} className="text-gray-700"/></span>
            <span className="text-xs md:text-sm font-bold text-gray-800">Master Menu & Kategori</span>
          </Link>
          <Link href="/admin/transactions" className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group flex flex-col gap-2 md:gap-3">
            <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><ScrollText size={18} className="text-gray-700"/></span>
            <span className="text-xs md:text-sm font-bold text-gray-800">Analitik & Pendapatan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
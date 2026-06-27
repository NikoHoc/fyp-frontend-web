"use client";

import { LayoutGrid, Soup } from "lucide-react";
import { Table, Transaction, TransactionItem } from "@/types";

interface TableListProps {
  tables: Table[];
  activeTransactions: Transaction[];
  isDepotOpen: boolean;
  role: "owner" | "kasir" | "pelayan";
  onTableClick: (tableId: number) => void;
  onManageTables?: () => void;
}

export default function TableList({
  tables,
  activeTransactions,
  isDepotOpen,
  role,
  onTableClick,
  onManageTables,
}: TableListProps) {
  const activeTables = tables.filter((table) => {
    const hasActiveTx = activeTransactions.some((t) => t.table_id === table.id);
    return table.is_active || hasActiveTx;
  });

  const isOwnerOrCashier = role === "owner" || role === "kasir";

  if (tables.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <LayoutGrid size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Belum ada meja</h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Tambahkan meja terlebih dahulu untuk mulai menerima pesanan makan di tempat.
        </p>
        {isOwnerOrCashier && (
          <button
            onClick={onManageTables}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            Kelola Meja
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {activeTables.map((table) => {
        const activeTx = activeTransactions.find((t) => t.table_id === table.id);
        const hasTransaction = !!activeTx; 

        let statusText = "Kosong";
        let statusSubtext = "";
        let colorClasses = {
          card: "bg-white border-gray-100 hover:border-green-400 hover:shadow-md",
          icon: "bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-600",
          text: "text-green-600",
          topBar: "bg-green-400",
        };

        if (hasTransaction) {
          const totalItems = activeTx.transaction_items?.reduce((acc: number, item: TransactionItem) => acc + item.quantity, 0) || 0;
          statusSubtext = `${totalItems} porsi`;

          const isFullyPaid = activeTx.payment_status === "paid";
          const hasPayments = activeTx.transaction_payments && activeTx.transaction_payments.length > 0;

          if (isFullyPaid) {
            statusText = "Lunas";
            colorClasses = {
              card: "bg-blue-50/50 border-blue-200 shadow-md shadow-blue-100/50 hover:bg-blue-100",
              icon: "bg-blue-200 text-blue-800",
              text: "text-blue-700",
              topBar: "bg-blue-500",
            };
          } else if (hasPayments) {
            statusText = "Bayar Sebagian";
            colorClasses = {
              card: "bg-purple-50/50 border-purple-200 shadow-md shadow-purple-100/50 hover:bg-purple-100",
              icon: "bg-purple-200 text-purple-800",
              text: "text-purple-700",
              topBar: "bg-purple-500",
            };
          } else {
            statusText = "Belum Bayar";
            colorClasses = {
              card: "bg-yellow-50/50 border-yellow-200 shadow-md shadow-yellow-100/50 hover:bg-yellow-100",
              icon: "bg-yellow-200 text-yellow-800",
              text: "text-yellow-700",
              topBar: "bg-yellow-400",
            };
          }
        }

        return (
          <button
            key={table.id}
            onClick={() => onTableClick(table.id)}
            disabled={!isDepotOpen}  
            className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 ${colorClasses.card} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${colorClasses.icon}`}
            >
              <Soup size={28} />
            </div>
            <span className="text-lg font-black text-gray-800 leading-none mb-2">
              {table.table_number}
            </span>
            <div className="flex flex-col items-center">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                  hasTransaction
                    ? `bg-white/60 border-${colorClasses.text.split("-")[1]}-200 ${colorClasses.text}`
                    : `bg-transparent border-transparent ${colorClasses.text}`
                }`}
              >
                {statusText}
              </span>
              {hasTransaction && (
                <span className="text-[10px] text-gray-500 font-medium mt-1">
                  {statusSubtext}
                </span>
              )}
            </div>
            <div
              className={`absolute top-0 inset-x-0 h-1.5 rounded-t-xl ${colorClasses.topBar}`}
            />
          </button>
        );
      })}
    </div>
  );
}
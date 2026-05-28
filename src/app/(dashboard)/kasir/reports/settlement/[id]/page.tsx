"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSettlement } from "@/hooks/useSettlement";
import DailySummaryCards from "@/components/settlements/DailySummaryCards";
import PaymentBreakdownTable from "@/components/settlements/PaymentBreakdownTable";
import DailyTransactionTable from "@/components/settlements/DailyTransactionTable";
import { formatDateFull } from "@/utils/format";
import ReportTransactionModal from "@/components/settlements/ReportTransactionModal";
import ReportSettlementPrintModal from "@/components/settlements/ReportSettlementPrintModal";
import { useSession } from "@/contexts/SessionContext"

export default function SettlementDetailPage() {
  const { id } = useParams();
  const { settlementDetail, isLoading, fetchSettlementDetail } = useSettlement();
  const { depot, isLoadingSession } = useSession();
  const [selectedTxId, setSelectedTxId] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchSettlementDetail(id as string);
  }, [id, fetchSettlementDetail]);

  if (isLoadingSession || isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          {isLoadingSession ? "Memuat Sesi Kasir..." : "Mengambil data detail settlement..."}
        </p>
      </div>
    );
  }

  const { settlement, summary, transactions, expenses } =
    settlementDetail || {};

  return (
    <div className="h-full flex flex-col mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/kasir/reports"
            className="cursor-pointer p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-800">
              Detail Settlement
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Laporan tanggal:{" "}
              {formatDateFull(settlement?.settlement_date || "")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPrintModalOpen(true)}
          className="cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
        >
          <Printer size={20} />
          Cetak Laporan
        </button>
      </div>

      <DailySummaryCards summary={summary ?? null} transactions={transactions || []} role='kasir'/>
      
      <PaymentBreakdownTable summary={summary ?? null} />

      <DailyTransactionTable
        transactions={transactions || []}
        onViewReceipt={(id) => setSelectedTxId(id)}
      />

      <ReportTransactionModal
        isOpen={!!selectedTxId}
        onClose={() => setSelectedTxId("")}
        transactionId={selectedTxId}
        depot={depot}
      />

      <ReportSettlementPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        settlement={settlement ?? null}
        summary={summary ?? null}
        expenses={expenses ?? []}
        depot={depot}
        role="kasir"
      />
    </div>
  );
}

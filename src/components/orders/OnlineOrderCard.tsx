import { useState, useEffect } from "react";
import { useTransaction } from "@/hooks/useTransaction";
import { Transaction, TransactionItem } from "@/types";
import { formatRupiah, formatDateTime } from "@/utils/format";
import {
  User,
  Phone,
  Store,
  Bike,
  RefreshCw,
  Printer,
  Check,
  CheckCircle,
} from "lucide-react";

interface Props {
  transaction: Transaction;
  role: "kasir" | "owner" | "pelayan";
  onAction: (
    action: "accept" | "reject" | "ready" | "complete",
    t: Transaction,
  ) => void;
  onPrintNota?: (t: Transaction) => void;
  onPrintChecker?: (t: Transaction) => void;
}

export default function OnlineOrderCard({
  transaction,
  role,
  onAction,
  onPrintNota,
  onPrintChecker,
}: Props) {
  const { fetchTransactionById } = useTransaction();
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTransactionById(transaction.id).then((data) => {
      if (isMounted && data?.transaction_items)
        setItems(data.transaction_items);
      if (isMounted) setIsLoadingItems(false);
    });
    return () => {
      isMounted = false;
    };
  }, [transaction.id, fetchTransactionById]);

  return (
    <div
      className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden ${
        transaction.order_status === "pending"
          ? "border-amber-200"
          : transaction.order_status === "confirmed"
            ? "border-blue-200"
            : transaction.order_status === "ready"
              ? "border-green-400 bg-green-50/10"
              : "border-green-200"
      }`}
    >
      {/* HEADER KARTU */}
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-b border-gray-100">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
          #{transaction.id.split("-")[0]}
        </span>
        <span className="text-[10px] font-bold text-gray-500">
          {formatDateTime(transaction.created_at)}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* PROFIL PELANGGAN */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-black text-gray-800 text-base flex items-center gap-2">
              <User size={16} className="text-gray-400" />{" "}
              {transaction.customer_name || "Pelanggan Online"}
            </h3>
            <p className="text-xs text-gray-500 font-bold flex items-center gap-2 mt-1">
              <Phone size={12} className="text-gray-400" />{" "}
              {transaction.customer_phone || "Tidak ada no. HP"}
            </p>
          </div>
        </div>

        {/* STATUS BADGES */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase">
            {transaction.pickup_method === "self_courier" ? (
              <Bike size={10} />
            ) : (
              <Store size={10} />
            )}
            {transaction.pickup_method === "self_courier"
              ? "Kurir Sendiri"
              : "Ambil Sendiri"}
          </span>
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
              transaction.order_status === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : transaction.order_status === "confirmed"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {transaction.order_status === "cooking"
              ? "DIMASAK"
              : transaction.order_status === "ready"
                ? "SIAP AMBIL"
                : transaction.order_status}
          </span>
          <span
            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
              transaction.payment_status === "paid"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {transaction.payment_status}
          </span>
        </div>

        {/* DETAIL ITEM PESANAN */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100 flex-1">
          {isLoadingItems ? (
            <div className="flex justify-center py-2">
              <RefreshCw className="animate-spin text-gray-400" size={16} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-2 text-xs text-gray-400 font-bold">
              Detail item kosong / tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-sm"
                >
                  <div className="flex-1 mr-2">
                    <span className="font-bold text-gray-700">
                      {item.quantity}x {item.menus?.name}{" "}
                      {item.is_half_portion ? (
                        <span className="text-xs text-gray-400">(1/2)</span>
                      ) : (
                        ""
                      )}
                    </span>
                    {item.note && (
                      <p className="text-[10px] font-medium text-orange-600 bg-orange-50 inline-block px-1.5 py-0.5 rounded mt-0.5 border border-orange-100">
                        Catatan: {item.note}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-gray-600 text-xs">
                    {formatRupiah(item.price_at_time * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RINCIAN STRUK TAGIHAN */}
        <div className="mb-4 space-y-1 border-b border-gray-100 pb-3">
          <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
            <span>Subtotal</span>
            <span>{formatRupiah(transaction.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
            <span>Pajak PB1 (10%)</span>
            <span>{formatRupiah(transaction.tax_amount || 0)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 mt-1">
            <span className="font-black text-gray-800 text-sm">
              Total Tagihan
            </span>
            <span className="text-base font-black text-red-600">
              {formatRupiah(transaction.grand_total)}
            </span>
          </div>
        </div>

        {/* LOGIKA TOMBOL BERDASARKAN STATUS DAN PERAN */}
        <div className="mt-auto">
          {/* 1. Kasir Belum Konfirmasi */}
          {transaction.order_status === "pending" &&
            (role === "kasir" || role === "owner") && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAction("reject", transaction)}
                  className="flex-1 py-2 bg-white border border-red-200 text-red-600 font-black rounded-xl hover:bg-red-50 text-xs transition-colors"
                >
                  Tolak
                </button>
                <button
                  onClick={() => onAction("accept", transaction)}
                  className="flex-1 py-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 text-xs transition-colors"
                >
                  Terima
                </button>
              </div>
            )}

          {/* 2. Sudah Diterima Tapi Belum Bayar */}
          {transaction.order_status === "confirmed" &&
            transaction.payment_status === "unpaid" && (
              <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-black text-xs rounded-xl border border-blue-100">
                Menunggu Pembayaran Pelanggan
              </div>
            )}

          {/* 3. Sudah Bayar & Sedang Dimasak */}
          {transaction.order_status === "cooking" &&
            transaction.payment_status === "paid" && (
              <div className="flex gap-2">
                {(role === "kasir" || role === "owner") && (
                  <button
                    onClick={() => onPrintNota?.(transaction)}
                    className="py-2 px-3 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Printer size={14} /> Nota
                  </button>
                )}
                {role === "pelayan" && (
                  <button
                    onClick={() => onPrintChecker?.(transaction)}
                    className="py-2 px-3 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Printer size={14} /> Checker
                  </button>
                )}

                <button
                  onClick={() => onAction("ready", transaction)}
                  className="flex-1 py-2 bg-amber-500 text-white font-black text-xs rounded-xl hover:bg-amber-600 flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Pesanan Siap
                </button>
              </div>
            )}

          {transaction.order_status === "ready" &&
            transaction.payment_status === "paid" && (
              <div className="flex gap-2">
                {(role === "kasir" || role === "owner") && (
                  <button
                    onClick={() => onPrintNota?.(transaction)}
                    className="py-2 px-3 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Printer size={14} /> Nota
                  </button>
                )}
                <button
                  onClick={() => onAction("complete", transaction)}
                  className="flex-1 py-2 bg-green-600 text-white font-black text-xs rounded-xl hover:bg-green-700 flex items-center justify-center gap-1"
                >
                  <CheckCircle size={14} /> Selesaikan Pesanan
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

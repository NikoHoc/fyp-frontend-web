"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useTransaction } from "@/hooks/useTransaction";
import { supabaseRealtime } from "@/config/supabaseClient";
import { Transaction } from "@/types";
import OnlineOrderCard from "@/components/orders/OnlineOrderCard";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";
import ReportTransactionModal from "@/components/settlements/ReportTransactionModal";

export default function KasirOwnerOnlineTransactions() {
  const { user, depot } = useSession();
  const { fetchAllTransactions, acceptOnlineOrder, rejectOnlineOrder, updateTransactionStatus } = useTransaction();
  
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reason, setReason] = useState("");

  const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
  const [selectedNotaId, setSelectedNotaId] = useState("");
  
  const loadOrders = async () => {
    if (!user?.depot_id) return;
    const data = await fetchAllTransactions(user.depot_id, 'active');
    setOrders(data.filter(t => t.type === 'online'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    const channel = supabaseRealtime
      .channel('online_orders_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `depot_id=eq.${user?.depot_id}` }, loadOrders)
      .subscribe();
    return () => { supabaseRealtime.removeChannel(channel); };
  }, [user?.depot_id]);

  const handleAction = async (action: 'accept' | 'reject' | 'ready' | 'complete', tx: Transaction) => {
    setSelectedTx(tx);
    if (action === 'accept') setIsAcceptModalOpen(true);
    if (action === 'reject') setIsRejectModalOpen(true);
    
    if (action === 'ready') {
      await updateTransactionStatus(tx.id, { order_status: 'ready' });
      toast.success("Pesanan selesai dimasak! Dipindahkan ke antrean penyerahan.");
      loadOrders();
    }
    
    if (action === 'complete') {
      await updateTransactionStatus(tx.id, { order_status: 'completed' });
      toast.success("Transaksi ditutup! Berhasil diselesaikan.");
      loadOrders();
    }
  };

  const handlePrintNota = (tx: Transaction) => {
    setSelectedNotaId(tx.id);
    setIsNotaModalOpen(true);
  };
  
  const unfulfilledOrders = orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed');
  const activeKitchenOrders = orders.filter(o => o.order_status === 'cooking' || o.order_status === 'ready');

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER LAYOUT */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Pesanan Online Masuk</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manajemen workflow otomatisasi pesanan kurir & self-pickup</p>
        </div>
        <button onClick={loadOrders} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-100 shrink-0 cursor-pointer">
          Refresh Data
        </button>
      </div>

      {/* SECTION 1: ANTRIAN MASUK & BELUM BAYAR */}
      <div className="space-y-4 mb-10">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-amber-500 rounded-full"></div>
          1. Antrean Konfirmasi & Pembayaran ({unfulfilledOrders.length})
        </h3>
        {unfulfilledOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unfulfilledOrders.map(o => <OnlineOrderCard key={o.id} transaction={o} role="owner" onAction={handleAction} />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400 shadow-sm">
             <ShoppingBag size={48} className="mb-4 opacity-20" />
             <p className="font-bold">Tidak ada antrean pesanan baru.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: DAPUR AKTIF (SUDAH BAYAR & SIAP SAJI) */}
      <div className="space-y-4">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
          2. Dapur Aktif & Siap Disajikan ({activeKitchenOrders.length})
        </h3>
        {activeKitchenOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeKitchenOrders.map(o => <OnlineOrderCard key={o.id} transaction={o} role="owner" onAction={handleAction} onPrintNota={handlePrintNota} />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400 shadow-sm">
             <p className="font-bold">Belum ada pesanan lunas yang masuk ke dapur.</p>
          </div>
        )}
      </div>

      {/* MODAL TERIMA */}
      <Modal isOpen={isAcceptModalOpen} onClose={() => setIsAcceptModalOpen(false)} title="Konfirmasi Terima">
        <p className="text-gray-600 mb-4">Pastikan ketersediaan stok bahan di dapur. Token invoice Midtrans akan di-generate otomatis untuk penagihan pelanggan.</p>
        <button onClick={async () => {
          await acceptOnlineOrder(selectedTx!.id);
          toast.success("Pesanan dikonfirmasi! Invoice tagihan berhasil dikirim.");
          setIsAcceptModalOpen(false);
          loadOrders();
        }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
          Ya, Terima Pesanan
        </button>
      </Modal>

      {/* MODAL TOLAK */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Alasan Penolakan">
        <textarea onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-200 p-4 rounded-xl bg-gray-50 focus:border-red-500 outline-none min-h-[100px]" placeholder="Sebutkan alasan penolakan secara jelas..." />
        <button onClick={async () => {
          await rejectOnlineOrder(selectedTx!.id, reason);
          toast.success("Pesanan berhasil ditolak.");
          setIsRejectModalOpen(false);
          loadOrders();
        }} className="w-full mt-4 py-3 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-colors">
          Tolak Pesanan
        </button>
      </Modal>

      <ReportTransactionModal 
        isOpen={isNotaModalOpen} 
        onClose={() => setIsNotaModalOpen(false)} 
        transactionId={selectedNotaId} 
        depot={depot}
      />
    </div>
  );
}
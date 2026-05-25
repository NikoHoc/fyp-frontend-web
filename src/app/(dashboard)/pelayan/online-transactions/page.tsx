"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useTransaction } from "@/hooks/useTransaction";
import { supabaseRealtime } from "@/config/supabaseClient";
import { Transaction } from "@/types";
import OnlineOrderCard from "@/components/orders/OnlineOrderCard";
import toast from "react-hot-toast";

export default function PelayanOnlineTransactions() {
  const { user } = useSession();
  const { fetchAllTransactions, updateTransactionStatus } = useTransaction();
  
  const [orders, setOrders] = useState<Transaction[]>([]);

  const loadOrders = async () => {
    if (!user?.depot_id) return;
    const data = await fetchAllTransactions(user.depot_id, 'active');
    // Pelayan HANYA melihat pesanan yang sudah lunas dan sedang diproses/selesai masak
    setOrders(data.filter(t => t.type === 'online' && (t.order_status === 'cooking' || t.order_status === 'ready') && t.payment_status === 'paid'));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    const channel = supabaseRealtime
      .channel('online_orders_sync_pelayan')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `depot_id=eq.${user?.depot_id}` }, loadOrders)
      .subscribe();
    return () => { supabaseRealtime.removeChannel(channel); };
  }, [user?.depot_id]);

  const handleAction = async (action: 'accept' | 'reject' | 'ready' | 'complete', tx: Transaction) => {
    if (action === 'ready') {
      await updateTransactionStatus(tx.id, { order_status: 'ready' });
      toast.success("Pesanan selesai dimasak! Siap diserahkan.");
      loadOrders();
    }
    
    if (action === 'complete') {
      await updateTransactionStatus(tx.id, { order_status: 'completed' });
      toast.success("Penyerahan berhasil! Transaksi ditutup.");
      loadOrders();
    }
  };

  const handlePrintChecker = (tx: Transaction) => {
    toast.success(`Membuka Modal Checker Dapur untuk #${tx.id.split('-')[0]}`);
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Dapur: Pesanan Online</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Daftar pesanan lunas yang siap dimasak & diserahkan</p>
        </div>
        <button onClick={loadOrders} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-blue-100 shrink-0 cursor-pointer">
          Refresh Data
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm uppercase tracking-widest">
          <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
          Dapur Aktif & Penyerahan ({orders.length})
        </h3>
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map(o => (
              <OnlineOrderCard 
                key={o.id} 
                transaction={o} 
                role="pelayan" 
                onAction={handleAction} 
                onPrintChecker={handlePrintChecker} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400 shadow-sm">
             <p className="font-bold">Dapur kosong. Belum ada pesanan online yang lunas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
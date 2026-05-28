"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useTransaction } from "@/hooks/useTransaction";
import { supabaseRealtime } from "@/config/supabaseClient";
import { CartItem, Menu, Transaction, TransactionItem } from "@/types";
import OnlineOrderCard from "@/components/orders/OnlineOrderCard";
import toast from "react-hot-toast";
import { Soup } from "lucide-react";
import CheckoutOrderModal from "@/components/orders/waiter/CheckoutOrderModal";

export default function PelayanOnlineTransactions() {
  const { user } = useSession();
  const { fetchAllTransactions, updateTransactionStatus } = useTransaction();
  
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [isCheckerModalOpen, setIsCheckerModalOpen] = useState(false);
  const [checkerCartItems, setCheckerCartItems] = useState<CartItem[]>([]);
  const [selectedCheckerId, setSelectedCheckerId] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  const loadOrders = async () => {
    if (!user?.depot_id) return;
    const data = await fetchAllTransactions(user.depot_id, 'active');

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
    const mappedItems = tx.transaction_items?.map((item: TransactionItem) => ({
      id: item.id,
      unique_id: item.id.toString(),
      menu_id: item.menu_id,
      quantity: item.quantity,
      is_half_portion: item.is_half_portion,
      note: item.note || "",
      is_saved: true,
      batch_number: item.batch_number,
      quantity_paid: item.quantity_paid || 0,
      price_at_time: item.price_at_time,
      created_at: item.created_at,
      serve_status: item.serve_status || 'cooking',
      menu: {
        ...item.menus,
        id: item.menu_id,
        price: item.price_at_time,
        half_price: item.price_at_time,
      } as Menu,
    })) || [];

    setCheckerCartItems(mappedItems);
    setSelectedCheckerId(`${tx.id.split('-')[0].toUpperCase()}`);
    setSelectedCustomerName(tx.customer_name || "Pelanggan Online");
    setIsCheckerModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Dapur: Pesanan Online</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Daftar pesanan lunas yang siap dimasak & diserahkan</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
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
             <Soup size={48} className="mb-4 opacity-20" />
             <p className="font-bold">Belum Ada Pesanan Online</p>
          </div>
        )}
      </div>
      <CheckoutOrderModal 
        isOpen={isCheckerModalOpen}
        onClose={() => setIsCheckerModalOpen(false)}
        cartItems={checkerCartItems}
        tableId={selectedCheckerId}
        customerName={selectedCustomerName}
        orderType="online"
      />
    </div>
  );
}
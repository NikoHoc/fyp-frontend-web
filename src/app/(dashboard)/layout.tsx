"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "@/contexts/SessionContext";
import GlobalRealtimeNotification from "@/components/notifications/GlobalRealtimeNotification";

function RouteErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      toast.error("Akses ditolak: Anda tidak memiliki izin ke halaman tersebut!");
      router.replace(window.location.pathname); 
    }
  }, [searchParams, router]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <RouteErrorHandler />
      </Suspense>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
        <div 
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <Navbar />
          <GlobalRealtimeNotification />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
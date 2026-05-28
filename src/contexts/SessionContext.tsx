"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, Depot } from "@/types";
import { useDepots } from "@/hooks/useDepot";

interface SessionContextType {
  user: User | null;
  depot: Depot | null;
  isLoadingSession: boolean;
  refetchSession: () => Promise<void>; 
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  depot: null,
  isLoadingSession: true,
  refetchSession: async () => {}, 
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [depot, setDepot] = useState<Depot | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [isMounted, setIsMounted] = useState(false);

  const { fetchDepotById } = useDepots();

  const initSession = async () => {
    setIsLoadingSession(true);
    try {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);

        if (parsedUser.depot_id) {
          const depotData = await fetchDepotById(parsedUser.depot_id);
          setDepot(depotData);
        }
      }
    } catch (error) {
      console.error("Gagal inisialisasi sesi:", error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan Aplikasi...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ user, depot, isLoadingSession, refetchSession: initSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-poppins">
      <div className="relative flex flex-col items-center text-center">
        <span className="text-[10rem] sm:text-[14rem] font-black text-gray-100 select-none leading-none -mb-8 sm:-mb-12">
          404
        </span>

        <div className="relative z-10 flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-800">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-sm font-medium">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
            Kamu akan diarahkan kembali dalam{" "}
            <span className="font-black text-blue-600">{countdown}</span> detik.
          </p>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              ← Kembali
            </button>
            <Link href="/">
              <button className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200">
                Ke Beranda
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
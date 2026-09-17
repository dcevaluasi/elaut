"use client";

import React from "react";
import Link from "next/link";
import { Anchor, ArrowLeft, Activity, ShieldCheck, Ship } from "lucide-react";

export default function AkpClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* AKP Portal Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Ship className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
                    E-LAUT <span className="text-blue-600">AKP</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terintegrasi AKAPI
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Sistem Sertifikasi Awak Kapal Perikanan
                </span>
              </div>
            </div>
          </div>

          {/* Right Portal Stats / Quick Navigation */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 text-xs text-slate-500 border-r border-slate-200 pr-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Validasi Resmi KKP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Live Data</span>
              </div>
            </div>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all px-3 py-2 rounded-lg shadow-sm hover:shadow"
            >
              <Anchor className="w-3.5 h-3.5" />
              <span>Portal Utama</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area with Smooth Fade-in */}
      <main className="flex-1 w-full transition-opacity duration-300">
        {children}
      </main>
    </div>
  );
}


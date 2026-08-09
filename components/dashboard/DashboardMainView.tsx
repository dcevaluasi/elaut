"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, BookOpen } from "lucide-react";
import { TbBuildingEstate, TbChartPie } from "react-icons/tb";
import { SummaryPelatihan } from "@/components/dashboard";
import DashboardInstruktur from "@/components/dashboard/DashboardInstruktur";
import DashboardModul from "@/components/dashboard/DashboardModul";
import SummaryKinerja from "@/components/dashboard/SummaryKinerja";
import DashboardP2MKP from "@/components/dashboard/DashboardP2MKP";

export default function DashboardMainView() {
  const [access, setAccess] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setAccess(Cookies.get("Access") || "");
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const isSuperAdmin = access?.includes("superAdmin");
  const hasViewP2MKP = access?.includes("viewP2MKP");
  const hasViewPelatihan = access?.includes("viewPelatihan");
  const hasViewModul = access?.includes("viewModul");

  // Check if access is ONLY viewP2MKP
  const isOnlyViewP2MKP = hasViewP2MKP && !isSuperAdmin && !hasViewPelatihan && !hasViewModul;

  if (isOnlyViewP2MKP) {
    return <DashboardP2MKP />;
  }

  // Determine initial default tab
  let defaultTab = "pelatihan";
  if (hasViewP2MKP && !hasViewPelatihan && !isSuperAdmin) {
    defaultTab = "p2mkp";
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full mb-2">
      <div className="flex justify-center">
        <TabsList className="bg-white/80 backdrop-blur-2xl border border-white/50 h-auto p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
          {(isSuperAdmin || hasViewPelatihan || (!hasViewP2MKP && !hasViewModul)) && (
            <TabsTrigger
              value="pelatihan"
              className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/30 text-slate-500 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-blue-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-100/50 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-sm tracking-tight">Pelatihan</span>
              </div>
              <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Realisasi & PNPB</span>
            </TabsTrigger>
          )}

          {(isSuperAdmin || (!hasViewP2MKP && !hasViewModul)) && (
            <TabsTrigger
              value="instruktur"
              className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-violet-500/30 text-slate-500 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-violet-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-violet-100/50 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-sm tracking-tight">SDM Pelatih</span>
              </div>
              <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Instruktur & WI</span>
            </TabsTrigger>
          )}

          {(isSuperAdmin || hasViewModul) && (
            <TabsTrigger
              value="modul"
              className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30 text-slate-500 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-emerald-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100/50 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm tracking-tight">Perangkat</span>
              </div>
              <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Modul Pelatihan</span>
            </TabsTrigger>
          )}

          {(isSuperAdmin || hasViewP2MKP) && (
            <TabsTrigger
              value="p2mkp"
              className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30 text-slate-500 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-emerald-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100/50 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                  <TbBuildingEstate className="w-4 h-4" />
                </div>
                <span className="text-sm tracking-tight">P2MKP</span>
              </div>
              <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Penetapan & Klasifikasi</span>
            </TabsTrigger>
          )}

          {(isSuperAdmin || (!hasViewP2MKP && !hasViewModul)) && (
            <TabsTrigger
              value="kinerja"
              className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/30 text-slate-500 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-amber-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-100/50 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                  <TbChartPie className="w-4 h-4" />
                </div>
                <span className="text-sm tracking-tight">Kinerja</span>
              </div>
              <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Indikator Kinerja</span>
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <div className="mt-2 outline-none border-none">
        <TabsContent value="pelatihan" className="space-y-4 outline-none border-none">
          <SummaryPelatihan />
        </TabsContent>

        <TabsContent value="instruktur" className="space-y-4 outline-none border-none">
          <DashboardInstruktur />
        </TabsContent>

        <TabsContent value="modul" className="space-y-4 outline-none border-none">
          <DashboardModul />
        </TabsContent>

        <TabsContent value="p2mkp" className="space-y-4 outline-none border-none">
          <DashboardP2MKP />
        </TabsContent>

        <TabsContent value="kinerja" className="space-y-4 outline-none border-none">
          <SummaryKinerja />
        </TabsContent>
      </div>
    </Tabs>
  );
}

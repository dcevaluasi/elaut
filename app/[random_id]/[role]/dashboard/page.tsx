import React from "react";
import { SummaryPelatihan } from "@/components/dashboard";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { LucideLayoutDashboard, BarChart3, Users, BookOpen } from "lucide-react";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardInstruktur from "@/components/dashboard/DashboardInstruktur";
import DashboardModul from "@/components/dashboard/DashboardModul";
import SummaryKinerja from "@/components/dashboard/SummaryKinerja";
import { TbChartPie } from "react-icons/tb";

export const metadata: Metadata = {
  title: "Dashboard - Elektronik Layanan Pelatihan Utama Terpadu",
};

export default function Page() {
  return (
    <LayoutAdminElaut>
      <HeaderPageLayoutAdminElaut
        title="Dashboard"
        description="Monitoring capaian/Realisasi penyelenggaraan pelatihan dan status pelaksanaan!"
        icon={<LucideLayoutDashboard className="text-3xl" />}
      />

      <div className="space-y-10 py-4">
        <Tabs defaultValue="pelatihan" className="w-full mb-2">
          <div className="flex justify-center">
            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 h-auto p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
              <TabsTrigger
                value="pelatihan"
                className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-blue-600 dark:hover:text-blue-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-tight">Pelatihan</span>
                </div>
                <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Realisasi & PNPB</span>
              </TabsTrigger>

              <TabsTrigger
                value="instruktur"
                className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-violet-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-violet-600 dark:hover:text-violet-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-violet-100/50 dark:bg-violet-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-tight">SDM Pelatih</span>
                </div>
                <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Instruktur & WI</span>
              </TabsTrigger>

              <TabsTrigger
                value="modul"
                className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-tight">Perangkat</span>
                </div>
                <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Modul Pelatihan</span>
              </TabsTrigger>

              <TabsTrigger
                value="kinerja"
                className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-amber-600 dark:hover:text-amber-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-100/50 dark:bg-amber-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                    <TbChartPie className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-tight">Kinerja</span>
                </div>
                <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Indikator Kinerja</span>
              </TabsTrigger>
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

            <TabsContent value="kinerja" className="space-y-4 outline-none border-none">
              <SummaryKinerja />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </LayoutAdminElaut>
  );
}

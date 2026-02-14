import React from "react";
import { SummaryPelatihan } from "@/components/dashboard";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { LucideLayoutDashboard, BarChart3, Users, BookOpen } from "lucide-react";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardInstruktur from "@/components/dashboard/DashboardInstruktur";
import DashboardModul from "@/components/dashboard/DashboardModul";

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

      <div className="space-y-6">
        <Tabs defaultValue="pelatihan" className="w-full space-y-8">
          <div className="w-full">
            <TabsList className="w-full h-auto bg-white/60 dark:bg-slate-950/60 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800 p-2 flex flex-col md:flex-row rounded-3xl gap-2 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 ring-4 ring-white/50 dark:ring-slate-900/20">
              <TabsTrigger
                value="pelatihan"
                className="flex-1 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-3 group ring-0 outline-none hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <div className="p-2 bg-white/20 rounded-xl group-data-[state=active]:bg-white/20 group-hover:bg-white/50 transition-colors">
                  <BarChart3 className="w-5 h-5 group-data-[state=active]:scale-110 transition-transform" />
                </div>
                Pelatihan
              </TabsTrigger>
              <TabsTrigger
                value="instruktur"
                className="flex-1 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-3 group ring-0 outline-none hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <div className="p-2 bg-white/20 rounded-xl group-data-[state=active]:bg-white/20 group-hover:bg-white/50 transition-colors">
                  <Users className="w-5 h-5 group-data-[state=active]:scale-110 transition-transform" />
                </div>
                Instruktur
              </TabsTrigger>
              <TabsTrigger
                value="modul"
                className="flex-1 rounded-2xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-3 group ring-0 outline-none hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <div className="p-2 bg-white/20 rounded-xl group-data-[state=active]:bg-white/20 group-hover:bg-white/50 transition-colors">
                  <BookOpen className="w-5 h-5 group-data-[state=active]:scale-110 transition-transform" />
                </div>
                Perangkat Pelatihan
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pelatihan" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <SummaryPelatihan />
          </TabsContent>

          <TabsContent value="instruktur" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <DashboardInstruktur />
          </TabsContent>

          <TabsContent value="modul" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <DashboardModul />
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdminElaut>
  );
}

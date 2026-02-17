'use client'


import React, { useEffect } from "react";
import StatsModulPelatihan from "./Dashboard/Modul/StatsModulPelatihan";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { HashLoader } from "react-spinners";
import { Library, Layers, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardModul() {
    const { data, loading, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Modul");

    useEffect(() => {
        fetchModulPelatihan();
    }, [fetchModulPelatihan]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <HashLoader color="#338CF5" size={60} />
                    <p className="text-sm font-medium text-slate-600 animate-pulse">Loading data modul...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-md">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Perangkat Pelatihan</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monitoring distribusi modul dan materi pelatihan terpusat!</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-emerald-600/10 rounded-2xl border border-emerald-600/20">
                        <Library className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Library className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Total Modul</p>
                                <h4 className="text-3xl font-black tracking-tighter">{data.length}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-100/60 uppercase tracking-tighter">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Koleksi Modul Pelatihan</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-violet-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-purple-100 text-xs font-bold uppercase tracking-widest opacity-80">Total File Materi Modul</p>
                                <h4 className="text-3xl font-black tracking-tighter">{data.reduce((acc, m) => acc + (m.ModulPelatihan?.length || 0), 0)}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-100/60 uppercase tracking-tighter">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>File tersimpan & terarsip</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-80">Modul Disahkan</p>
                                <h4 className="text-3xl font-black tracking-tighter">{stats.verified["Verified"] || 0}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-100/60 uppercase tracking-tighter">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Telah melalui proses verifikasi</span>
                        </div>
                    </div>
                </div>
            </div>

            <StatsModulPelatihan data={data} stats={stats} />
        </div>
    );
}

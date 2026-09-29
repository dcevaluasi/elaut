'use client'

import React, { useEffect } from "react";
import StatsInstruktur from "./Pelatihan/StatsInstruktur";
import TableSebaranPelatih from "./Pelatihan/TableSebaranPelatih";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { HashLoader } from "react-spinners";
import { Users, UserPlus, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardInstruktur() {
    const { instrukturs, unitKerjas, loading, fetchInstrukturData, stats } = useFetchDataInstruktur({ balaiOnly: true });

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <HashLoader color="#338CF5" size={60} />
                    <p className="text-sm font-medium text-slate-600 animate-pulse">Loading data instruktur...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/50 shadow-sm transition-all duration-500 hover:shadow-md">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">SDM Pelatih</h2>
                    <p className="text-sm font-medium text-slate-500">Monitoring data instruktur dan widyaiswara aktif!</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Total Tenaga Pelatih</p>
                                <h4 className="text-3xl font-black tracking-tighter">{instrukturs.length}</h4>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: "Instruktur", value: stats.kategori.instruktur },
                                { label: "Widyaiswara", value: stats.kategori.widyaiswara },
                                { label: "Pelatih non Instruktur", value: stats.kategori.nonInstruktur },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl bg-white/10 border border-white/15 px-3 py-2">
                                    <p className="text-[10px] font-bold uppercase tracking-wider leading-tight text-blue-100/80">{item.label}</p>
                                    <p className="text-xl font-black tracking-tighter">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        {stats.kategori.belumDiisi > 0 && (
                            <p className="mt-2 text-[11px] font-semibold text-blue-100/70">
                                + {stats.kategori.belumDiisi} pelatih belum dikategorikan
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-violet-200 group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-purple-100 text-xs font-bold uppercase tracking-widest opacity-80">Sertifikasi ToT</p>
                                <h4 className="text-3xl font-black tracking-tighter">{stats.tot}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-100/60 uppercase tracking-tighter">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{((stats.tot / (instrukturs.length || 1)) * 100).toFixed(1)}% Kompetensi diakui</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200 group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-80">SDM Aktif</p>
                                <h4 className="text-3xl font-black tracking-tighter">{stats.status.Active || 0}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-100/60 uppercase tracking-tighter">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Siap penugasan pelatihan</span>
                        </div>
                    </div>
                </div>
            </div>

            <TableSebaranPelatih data={instrukturs} unitKerjas={unitKerjas} />

            <StatsInstruktur data={instrukturs} stats={stats} />
        </div>
    );
}

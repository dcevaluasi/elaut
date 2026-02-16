"use client";

import React, { useMemo } from "react";
import { File, Layers, TrendingUp, CheckCircle, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const COLORS_CLUSTERS = ["#3B82F6", "#0EA5E9", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F97316", "#EF4444"];
const COLORS_STATUS = ["#10B981", "#EF4444"]; // Green, Red
const COLORS_YEARS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"];

export default function StatsModulPelatihan({ data, stats }: { data: any[]; stats: any }) {
    // Metrics
    const totalModul = data.reduce((acc, m) => acc + m.ModulPelatihan.length, 0);
    const totalMateri = data.length;

    // Chart Data Transforms
    const clusterData = useMemo(() => {
        const allClusters = Object.entries(stats.bidang)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);

        const top5 = allClusters.slice(0, 5);
        const others = allClusters.slice(5).reduce((acc, curr) => acc + curr.value, 0);

        if (others > 0) {
            return [...top5, { name: "Lainnya", value: others }];
        }
        return top5;
    }, [stats.bidang]);

    const fullClusterList = useMemo(() => {
        return Object.entries(stats.bidang)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);
    }, [stats.bidang]);


    const yearData = useMemo(() => {
        return Object.entries(stats.tahun)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Chronological
    }, [stats.tahun]);

    const statusData = useMemo(() => {
        const verified = data.filter(d => d.IsVerified === "Verified").length;
        const notVerified = data.length - verified;
        return [
            { name: "Disahkan", value: verified },
            { name: "Belum Disahkan", value: notVerified }
        ].filter(d => d.value > 0);
    }, [data]);


    const formatTooltip = (value: any, name: any) => {
        return [<span className="font-bold text-xs">{value}</span>, <span className="text-slate-500 text-[10px] uppercase tracking-wider">{name}</span>];
    };

    return (
        <div className="space-y-6">
            {/* --- Metric Card Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl transition-all duration-500 hover:shadow-blue-500/10">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                <File className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Inventori</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Aktif</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider opacity-80">Total Modul</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black tracking-tighter">{totalMateri}</span>
                                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Judul</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl transition-all duration-500 hover:shadow-violet-500/10">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-purple-100 uppercase tracking-widest opacity-80">Repositori</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Terunggah</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-purple-100 uppercase tracking-wider opacity-80">Total Materi</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black tracking-tighter">{totalModul}</span>
                                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-tighter">File</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Main Chart Row 1: Trends & Status --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Year Trends (66%) */}
                <Card className="md:col-span-8 shadow-sm border border-slate-200 bg-white rounded-2xl flex flex-col relative overflow-hidden group">
                    <CardHeader className="pb-2 border-b border-slate-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Tren Tahunan
                                </CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-wider font-medium text-slate-400">Frekuensi penyusunan modul per tahun</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 px-6">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                        formatter={formatTooltip}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {yearData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_YEARS[index % COLORS_YEARS.length]} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status (33%) */}
                <Card className="md:col-span-4 shadow-sm border border-slate-200 bg-white rounded-2xl flex flex-col relative overflow-hidden group">
                    <CardHeader className="pb-2 border-b border-slate-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    Status Verifikasi
                                </CardTitle>
                                <CardDescription className="text-[10px] uppercase tracking-wider font-medium text-slate-400">Tingkat pengesahan modul</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[220px] flex flex-col justify-center px-6">
                        <div className="h-[140px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                                        formatter={formatTooltip}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-xl font-black text-slate-800 tracking-tighter">{totalMateri}</span>
                                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest leading-none">Total</p>
                                </div>
                            </div>
                        </div>
                        {/* Summary Status Text */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="flex flex-col p-2 bg-emerald-50 rounded-xl border border-emerald-100 items-center justify-center">
                                <p className="text-lg font-black text-emerald-600 leading-tight">{statusData.find(s => s.name === "Disahkan")?.value || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-emerald-500 tracking-wider">Disahkan</p>
                            </div>
                            <div className="flex flex-col p-2 bg-rose-50 rounded-xl border border-rose-100 items-center justify-center">
                                <p className="text-lg font-black text-rose-600 leading-tight">{statusData.find(s => s.name.includes("Belum"))?.value || 0}</p>
                                <p className="text-[8px] font-bold uppercase text-rose-500 tracking-wider">Belum</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Main Chart Row 2: Clusters --- */}
            <Card className="shadow-sm border border-slate-200 bg-white rounded-2xl overflow-hidden group">
                <CardHeader className="border-b border-slate-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                                <PieIcon className="w-4 h-4 text-amber-500" />
                                Distribusi Rumpun Pelatihan
                            </CardTitle>
                            <CardDescription className="text-[10px] uppercase tracking-wider font-medium text-slate-400">Breakdown materi berdasarkan klaster keilmuan</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Donut Chart Section */}
                        <div className="lg:col-span-1 h-[240px] relative border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={clusterData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="white"
                                        strokeWidth={4}
                                    >
                                        {clusterData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_CLUSTERS[index % COLORS_CLUSTERS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: 'none', border: '1px solid #f1f5f9' }}
                                        formatter={formatTooltip}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -ml-4">
                                <div className="text-center">
                                    <span className="text-2xl font-black text-slate-800 tracking-tighter">{totalMateri}</span>
                                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Materi</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed List Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Semua Rumpun</h4>
                                <div className="flex-1 h-px bg-slate-50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                {fullClusterList.map((item, index) => (
                                    <div key={item.name} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                        <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[11px] font-bold text-slate-600 truncate" title={item.name}>
                                                    {item.name}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${(item.value / (fullClusterList[0]?.value || 1)) * 100}%`,
                                                        backgroundColor: COLORS_CLUSTERS[index % COLORS_CLUSTERS.length]
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}

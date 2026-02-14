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


    const formatTooltip = (value: any, name: any, props: any) => {
        return [<span className="font-semibold">{value}</span>, <span className="text-gray-500 capitalize">{name}</span>];
    };

    return (
        <div className="space-y-6">
            {/* --- Metric Card Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Modul</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-800">{totalMateri}</span>
                                <span className="text-xs text-slate-500">Judul</span>
                            </div>
                            <p className="text-xs text-slate-400">Modul pelatihan terdaftar</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <File className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Total Materi</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-800">{totalModul}</span>
                                <span className="text-xs text-slate-500">File</span>
                            </div>
                            <p className="text-xs text-slate-400">Dokumen materi diunggah</p>
                        </div>
                        <div className="p-3 bg-violet-100 rounded-full">
                            <Layers className="h-6 w-6 text-violet-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* --- Main Chart Row 1: Trends & Status --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Year Trends (66%) */}
                <Card className="md:col-span-8 shadow-sm border border-slate-200 bg-white rounded-xl flex flex-col">
                    <CardHeader className="pb-2 border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                    Tren Tahunan
                                </CardTitle>
                                <CardDescription>Frekuensi penyusunan modul per tahun</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {yearData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_YEARS[index % COLORS_YEARS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status (33%) */}
                <Card className="md:col-span-4 shadow-sm border border-slate-200 bg-white rounded-xl flex flex-col">
                    <CardHeader className="pb-2 border-b border-slate-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-slate-400" />
                                    Status
                                </CardTitle>
                                <CardDescription>Verifikasi modul</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[280px] flex flex-col justify-center">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        formatter={formatTooltip}
                                    />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Summary Status Text */}
                        <div className="text-center mt-4 grid grid-cols-2 divide-x divide-slate-100">
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">{statusData.find(s => s.name === "Disahkan")?.value || 0}</p>
                                <p className="text-[10px] uppercase text-slate-400 tracking-wider">Disahkan</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-500">{statusData.find(s => s.name.includes("Belum"))?.value || 0}</p>
                                <p className="text-[10px] uppercase text-slate-400 tracking-wider">Belum</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Main Chart Row 2: Clusters --- */}
            <Card className="shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <PieIcon className="w-5 h-5 text-slate-400" />
                                Distribusi Klaster Pelatihan
                            </CardTitle>
                            <CardDescription>Breakdown materi berdasarkan rumpun keilmuan</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Donut Chart Section */}
                        <div className="lg:col-span-1 h-[280px] relative border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={clusterData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="white"
                                        strokeWidth={2}
                                    >
                                        {clusterData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_CLUSTERS[index % COLORS_CLUSTERS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontSize: '0.85rem' }}
                                        formatter={formatTooltip}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center -ml-5 justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-4xl font-bold text-slate-800">{totalMateri}</span>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Total</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed List Section */}
                        <div className="lg:col-span-2">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Detail Semua Rumpun</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {fullClusterList.map((item, index) => (
                                    <div key={item.name} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-xs font-bold text-slate-600 group-hover:bg-white group-hover:shadow-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-700 truncate" title={item.name}>
                                                    {item.name}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-500">{item.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
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

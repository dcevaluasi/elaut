"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Instruktur } from "@/types/instruktur";
import { CountStats } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import {
    TbUserCheck,
    TbCertificate,
    TbChartPie,
    TbSchool,
    TbBriefcase,
} from "react-icons/tb";
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

const COLORS_ROLE = ["#F59E0B", "#EF4444", "#3B82F6"];
const COLORS_STATUS = ["#10B981", "#6B7280", "#F59E0B", "#EF4444"];
const COLORS_EDUCATION = ["#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"];

type StatsInstrukturProps = {
    data: Instruktur[];
    stats: CountStats;
};

export default function StatsInstruktur({ data, stats }: StatsInstrukturProps) {
    // Transform data for charts
    const pendidikanData = useMemo(() => {
        const grouped = data.reduce((acc, curr) => {
            const edu = curr.pendidikkan_terakhir || "N/A";
            if (!acc[edu]) {
                acc[edu] = { name: edu, Instruktur: 0, Widyaiswara: 0, Lainnya: 0 };
            }

            const jabatan = (curr.jenjang_jabatan || "").toLowerCase();
            if (jabatan.includes("instruktur")) {
                acc[edu].Instruktur++;
            } else if (jabatan.includes("widyaiswara")) {
                acc[edu].Widyaiswara++;
            } else {
                acc[edu].Lainnya++;
            }
            return acc;
        }, {} as Record<string, { name: string; Instruktur: number; Widyaiswara: number; Lainnya: number }>);

        return Object.values(grouped).sort((a, b) =>
            (b.Instruktur + b.Widyaiswara + b.Lainnya) - (a.Instruktur + a.Widyaiswara + a.Lainnya)
        );
    }, [data]);

    const statusData = useMemo(() => {
        return Object.entries(stats.status)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [stats.status]);

    const keahlianData = useMemo(() => {
        return Object.entries(stats.bidangKeahlian)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [stats.bidangKeahlian]);

    const jabatanData = useMemo(() => {
        return Object.entries(stats.jenjangJabatan)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [stats.jenjangJabatan]);

    const roleCompositionData = useMemo(() => {
        let instrukturCount = 0;
        let widyaiswaraCount = 0;
        let othersCount = 0;

        data.forEach((d) => {
            const jabatan = (d.jenjang_jabatan || "").toLowerCase();
            if (jabatan.includes("instruktur")) {
                instrukturCount++;
            } else if (jabatan.includes("widyaiswara")) {
                widyaiswaraCount++;
            } else {
                othersCount++;
            }
        });

        return [
            { name: "Instruktur", value: instrukturCount },
            { name: "Widyaiswara", value: widyaiswaraCount },
            { name: "Lainnya", value: othersCount },
        ].filter((d) => d.value > 0);
    }, [data]);

    const formatTooltip = (value: any, name: any, props: any) => {
        return [<span className="font-bold text-slate-800">{value}</span>, <span className="text-slate-500 capitalize text-xs">{name}</span>];
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* --- Summary Row --- */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-none bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-800/50 rounded-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TbUserCheck className="w-24 h-24 text-blue-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <div className="space-y-1">
                            <CardTitle className="text-xs font-black text-blue-600 uppercase tracking-widest">Total Instruktur</CardTitle>
                            <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terdaftar Aktif</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-4xl font-black text-slate-800 dark:text-white">{data.length}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-none bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-slate-800/50 rounded-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TbCertificate className="w-24 h-24 text-emerald-600" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <div className="space-y-1">
                            <CardTitle className="text-xs font-black text-emerald-600 uppercase tracking-widest">Bersertifikat ToT</CardTitle>
                            <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training of Trainer</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="flex items-baseline gap-2">
                            <div className="text-4xl font-black text-slate-800 dark:text-white">{stats.tot}</div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                {((stats.tot / (data.length || 1)) * 100).toFixed(1)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- Charts Row 1 --- */}
            <Card className="md:col-span-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-none bg-white dark:bg-slate-900 rounded-3xl flex flex-col">
                <CardHeader className="pb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TbChartPie size={18} /></span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Komposisi</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Jabatan Fungsional</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roleCompositionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roleCompositionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_ROLE[index % COLORS_ROLE.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                                formatter={formatTooltip}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600', opacity: 0.7 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 mt-4">
                        <div className="text-center">
                            <span className="text-3xl font-black text-slate-700 dark:text-white">{data.length}</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-none bg-white dark:bg-slate-900 rounded-3xl flex flex-col">
                <CardHeader className="pb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TbUserCheck size={18} /></span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Kepegawaian</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600', opacity: 0.7 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="md:col-span-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-none bg-white dark:bg-slate-900 rounded-3xl flex flex-col">
                <CardHeader className="pb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-violet-50 text-violet-600 rounded-lg"><TbBriefcase size={18} /></span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Top 5</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Bidang Keahlian</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[250px]">
                    <div className="space-y-5 pt-4">
                        {keahlianData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div className="w-8 text-center text-xs font-black text-slate-300">#{index + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{item.name}</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 rounded-full">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-violet-500 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(item.value / (keahlianData[0]?.value || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Education Level (Stacked) */}
            <Card className="md:col-span-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-none bg-white dark:bg-slate-900 rounded-3xl">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TbSchool size={18} /></span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Analisis</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Distribusi Pendidikan</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pendidikanData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, paddingBottom: '20px' }} />
                            <Bar dataKey="Instruktur" stackId="a" fill={COLORS_ROLE[0]} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Widyaiswara" stackId="a" fill={COLORS_ROLE[1]} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Lainnya" stackId="a" fill={COLORS_ROLE[2]} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Job Levels */}
            <Card className="md:col-span-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-none bg-white dark:bg-slate-900 rounded-3xl">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-2 bg-orange-50 text-orange-600 rounded-lg"><TbBriefcase size={18} /></span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Jabatan</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 dark:text-white">Jenjang Jabatan</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={jabatanData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={130}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]}>
                                {jabatanData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_EDUCATION[index % COLORS_EDUCATION.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

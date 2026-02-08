"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CountStats, useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Instruktur } from "@/types/instruktur";
import {
    TbSearch,
    TbFilter,
    TbDotsVertical,
    TbUserCheck,
    TbCertificate,
    TbChartPie,
    TbSchool,
    TbBriefcase,
    TbBuildingSkyscraper,
    TbMail,
    TbPhone,
    TbId,
    TbUser
} from "react-icons/tb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { findNameUnitKerjaById } from "@/utils/unitkerja";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import AddInstrukturAction from "@/commons/actions/instruktur/AddInstrukturAction";
import UpdateInstrukturAction from "@/commons/actions/instruktur/UpdateInstrukturAction";
import DeleteInstrukturAction from "@/commons/actions/instruktur/DeleteInstrukturAction";
import { motion, AnimatePresence } from "framer-motion";

const COLORS_ROLE = ["#F59E0B", "#EF4444", "#3B82F6"];
const COLORS_STATUS = ["#10B981", "#6B7280", "#F59E0B", "#EF4444"];
const COLORS_EDUCATION = ["#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"];

const TableDataPelatih = () => {
    const { instrukturs, loading, fetchInstrukturData, stats } = useFetchDataInstruktur();
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-end mb-4">
                <Button
                    variant="outline"
                    onClick={() => setShowCharts(!showCharts)}
                    className="flex items-center gap-2 rounded-xl border-dashed"
                >
                    <TbChartPie className="text-lg" />
                    {showCharts ? "Hide Charts" : "Show Charts"}
                </Button>
            </div>

            <AnimatePresence>
                {showCharts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <StatsCards data={instrukturs} stats={stats} />
                    </motion.div>
                )}
            </AnimatePresence>
            <InstrukturTable data={instrukturs} fetchData={fetchInstrukturData} />
        </div>
    );
};

type Props = {
    data: Instruktur[];
    fetchData: any;
};

function StatsCards({ data, stats }: { data: Instruktur[]; stats: CountStats }) {
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

function InstrukturTable({ data, fetchData }: Props) {
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();
    useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    const [search, setSearch] = useState("");
    const [filterKeahlian, setFilterKeahlian] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPendidikan, setFilterPendidikan] = useState("");
    const [filterJabatan, setFilterJabatan] = useState("");
    const [filterUnitKerja, setFilterUnitKerja] = useState("");

    const bidangKeahlianOptions = useMemo(() => [...new Set(data.map((d) => d.bidang_keahlian).filter(Boolean))], [data]);
    const statusOptions = useMemo(() => [...new Set(data.map((d) => d.status).filter(Boolean))], [data]);
    const pendidikanOptions = useMemo(() => [...new Set(data.map((d) => d.pendidikkan_terakhir).filter(Boolean))], [data]);
    const jabatanOptions = useMemo(() => [...new Set(data.map((d) => d.jenjang_jabatan).filter(Boolean))], [data]);
    const unitKerjaOptions = unitKerjas;

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const matchesSearch =
                !search ||
                Object.values(row).some((val) => String(val).toLowerCase().includes(search.toLowerCase()));
            const matchesKeahlian = !filterKeahlian || row.bidang_keahlian === filterKeahlian;
            const matchesStatus = !filterStatus || row.status === filterStatus;
            const matchesPendidikan = !filterPendidikan || row.pendidikkan_terakhir === filterPendidikan;
            const matchesJabatan = !filterJabatan || row.jenjang_jabatan === filterJabatan;
            const matchesUnitKerja = !filterUnitKerja || row.id_lemdik.toString() === filterUnitKerja;

            return (
                matchesSearch &&
                matchesKeahlian &&
                matchesStatus &&
                matchesPendidikan &&
                matchesJabatan &&
                matchesUnitKerja
            );
        });
    }, [data, search, filterKeahlian, filterStatus, filterPendidikan, filterJabatan, filterUnitKerja]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const clearFilters = () => {
        setFilterKeahlian("");
        setFilterStatus("");
        setFilterPendidikan("");
        setFilterJabatan("");
        setFilterUnitKerja("");
        setSearch("");
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Daftar Instruktur</h3>
                    <p className="text-sm font-medium text-slate-500">Kelola data instruktur dan pelatih secara terpusat.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 w-full sm:w-64 h-12 bg-white dark:bg-slate-900 border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
                        />
                    </div>
                    <FilterDropdown
                        filterKeahlian={filterKeahlian}
                        setFilterKeahlian={setFilterKeahlian}
                        bidangKeahlianOptions={bidangKeahlianOptions}
                        filterJabatan={filterJabatan}
                        setFilterJabatan={setFilterJabatan}
                        jabatanOptions={jabatanOptions}
                        filterPendidikan={filterPendidikan}
                        setFilterPendidikan={setFilterPendidikan}
                        pendidikanOptions={pendidikanOptions}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        statusOptions={statusOptions}
                        filterUnitKerja={filterUnitKerja}
                        setFilterUnitKerja={setFilterUnitKerja}
                        unitKerjaOptions={unitKerjaOptions}
                        clearFilters={clearFilters}
                        hasActiveFilters={!!(filterKeahlian || filterJabatan || filterPendidikan || filterStatus || filterUnitKerja)}
                    />
                    <AddInstrukturAction onSuccess={fetchData} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden border border-slate-100 dark:border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-5 font-black text-center w-16 sticky left-0 bg-slate-50/80 dark:bg-slate-900 backdrop-blur-md z-10">No</th>
                                <th className="px-6 py-5 font-black text-center sticky left-16 bg-slate-50/80 dark:bg-slate-900 backdrop-blur-md z-10">Aksi</th>
                                <th className="px-6 py-5 font-black">Instruktur</th>
                                <th className="px-6 py-5 font-black">Unit Kerja</th>
                                <th className="px-6 py-5 font-black">Kompetensi</th>
                                <th className="px-6 py-5 font-black">Pendidikan</th>
                                <th className="px-6 py-5 font-black">Status</th>
                                <th className="px-6 py-5 font-black">Berkas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => {
                                    const { name: nameUnitKerja } = findNameUnitKerjaById(unitKerjas, row.id_lemdik.toString());
                                    return (
                                        <tr key={row.IdInstruktur} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-4 font-bold text-center text-slate-400 sticky left-0 bg-white group-hover:bg-slate-50/80 dark:bg-slate-900 dark:group-hover:bg-slate-800 transition-colors">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 sticky left-16 bg-white group-hover:bg-slate-50/80 dark:bg-slate-900 dark:group-hover:bg-slate-800 transition-colors z-10 text-center">
                                                <div className="flex items-center justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-200/50">
                                                                <TbDotsVertical className="h-5 w-5 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 z-[9999]">
                                                            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Actions</DropdownMenuLabel>
                                                            <div className="space-y-1">
                                                                <UpdateInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                                <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                            </div>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 dark:text-white text-base">{row.nama}</span>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                            <TbId size={14} className="text-slate-400" /> {row.nip || "No NIP"}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                            <TbPhone size={14} className="text-slate-400" /> {row.no_telpon}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 line-clamp-2 text-sm" title={nameUnitKerja}>
                                                        <TbBuildingSkyscraper className="inline mr-1 text-slate-400 mb-0.5" />
                                                        {nameUnitKerja}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 w-fit px-2 py-0.5 rounded-full">
                                                        {row.eselon_1 || "Eselon -"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <Badge variant="secondary" className="font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-2.5 py-1">
                                                        {row.bidang_keahlian || "-"}
                                                    </Badge>
                                                    {row.jenjang_jabatan && (
                                                        <div className="text-xs font-semibold text-slate-500 px-1">
                                                            {row.jenjang_jabatan}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-black text-xs">
                                                        <TbSchool />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{row.pendidikkan_terakhir}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                    ${row.status === "Active" || row.status === "Aktif" || row.status === "PNS" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20" : ""}
                                                    ${row.status === "Non Aktif" || row.status === "No Active" ? "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20" : ""}
                                                    ${row.status === "Tugas Belajar" ? "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20" : ""}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === "Active" || row.status === "Aktif" || row.status === "PNS" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {row.management_of_training ? (
                                                        <a href={row.management_of_training} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all" title="MOT">
                                                            <TbCertificate size={18} />
                                                        </a>
                                                    ) : <span className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><TbCertificate size={18} /></span>}

                                                    {row.link_data_dukung_sertifikat ? (
                                                        <a href={row.link_data_dukung_sertifikat} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all" title="Sertifikat">
                                                            <TbBriefcase size={18} />
                                                        </a>
                                                    ) : <span className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><TbBriefcase size={18} /></span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-slate-50 p-6 mb-4">
                                                <TbSearch className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Tidak ada instruktur ditemukan</p>
                                            <p className="text-sm font-medium text-slate-400 mt-1 max-w-xs mx-auto mb-6">Coba sesuaikan kata kunci pencarian atau filter anda.</p>
                                            <Button variant="outline" className="rounded-xl border-dashed" onClick={clearFilters}>
                                                Reset Filter
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-50/50 dark:bg-slate-900 px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Showing <span className="text-slate-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-slate-800 dark:text-white">{filteredData.length}</span>
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all text-sm"
                        >
                            ←
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`
                                            h-10 w-10 rounded-xl font-black text-xs transition-all flex items-center justify-center
                                            ${currentPage === pageNum
                                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                                                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                                        `}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold transition-all text-sm"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FilterDropdown({
    filterKeahlian,
    setFilterKeahlian,
    bidangKeahlianOptions,
    filterJabatan,
    setFilterJabatan,
    jabatanOptions,
    filterPendidikan,
    setFilterPendidikan,
    pendidikanOptions,
    filterStatus,
    setFilterStatus,
    statusOptions,
    filterUnitKerja,
    setFilterUnitKerja,
    unitKerjaOptions,
    clearFilters,
    hasActiveFilters
}: any) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button className={`
                    h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all
                    ${hasActiveFilters
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 border border-transparent"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800 shadow-sm"}
                `}>
                    <TbFilter className="text-lg" />
                    Filters
                    {hasActiveFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-6 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-none bg-white/95 backdrop-blur-xl z-[9999]" align="end">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Filter Data</h4>
                    {hasActiveFilters && (
                        <button
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                            onClick={clearFilters}
                        >
                            Reset All
                        </button>
                    )}
                </div>

                <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unit Kerja</label>
                        <Select value={filterUnitKerja} onValueChange={setFilterUnitKerja}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                                <SelectValue placeholder="All Units" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl">
                                <SelectItem value="all" className="font-bold text-xs">All Units</SelectItem>
                                {unitKerjaOptions.map((opt: UnitKerja) => (
                                    <SelectItem key={opt.id_unit_kerja} value={opt.id_unit_kerja.toString()} className="font-medium text-xs">
                                        {opt.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Keahlian</label>
                        <Select value={filterKeahlian} onValueChange={setFilterKeahlian}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                                <SelectValue placeholder="All Expertise" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl max-h-60">
                                <SelectItem value="all" className="font-bold text-xs">All Expertise</SelectItem>
                                {bidangKeahlianOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt} className="font-medium text-xs">
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jabatan</label>
                        <Select value={filterJabatan} onValueChange={setFilterJabatan}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                                <SelectValue placeholder="All Positions" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl">
                                <SelectItem value="all" className="font-bold text-xs">All Positions</SelectItem>
                                {jabatanOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt} className="font-medium text-xs">
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pendidikan</label>
                            <Select value={filterPendidikan} onValueChange={setFilterPendidikan}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="all" className="font-bold text-xs">All</SelectItem>
                                    {pendidikanOptions.map((opt: any) => (
                                        <SelectItem key={opt} value={opt} className="font-medium text-xs">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold text-xs focus:ring-2 focus:ring-blue-500/10">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="all" className="font-bold text-xs">All</SelectItem>
                                    {statusOptions.map((opt: any) => (
                                        <SelectItem key={opt} value={opt} className="font-medium text-xs">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TableDataPelatih;

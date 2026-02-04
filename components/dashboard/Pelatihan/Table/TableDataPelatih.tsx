"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CountStats, useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Instruktur } from "@/types/instruktur";
import { Input } from "@/components/ui/input";
import { truncateText } from "@/utils";
import {
    FileBadge,
    Search,
    Users,
    Filter,
    MoreVertical
} from "lucide-react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

const TableDataPelatih = () => {
    const { instrukturs, loading, error, fetchInstrukturData, stats } = useFetchDataInstruktur();

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    return (
        <div className="space-y-8 pb-10">
            <StatsCards data={instrukturs} stats={stats} />
            <InstrukturTable data={instrukturs} fetchData={fetchInstrukturData} />
        </div>
    );
};

type Props = {
    data: Instruktur[];
    fetchData: any;
};

const COLORS_ROLE = ["#F59E0B", "#EF4444", "#3B82F6"]; // Amber, Red, Blue (Tailwind colors)
const COLORS_STATUS = ["#10B981", "#6B7280", "#F59E0B", "#EF4444"]; // Green, Gray, Amber, Red
const COLORS_EDUCATION = ["#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"]; // Violets to Cyans

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

        // Sort by total count
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
            .slice(0, 5); // Top 5
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
        return [<span className="font-semibold">{value}</span>, <span className="text-gray-500 capitalize">{name}</span>];
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* --- Summary Row --- */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Instruktur */}
                <Card className="shadow-none border border-slate-100 bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Instruktur</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-800">{data.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Terdaftar aktif</p>
                    </CardContent>
                </Card>

                {/* Total ToT */}
                <Card className="shadow-none border border-slate-100 bg-white rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Bersertifikat ToT</CardTitle>
                        <FileBadge className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-extrabold text-slate-800">{stats.tot}</div>
                            <span className="text-sm text-green-600 font-medium">
                                ({((stats.tot / (data.length || 1)) * 100).toFixed(1)}%)
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Training of Trainer</p>
                    </CardContent>
                </Card>
                {/* Placeholder for more summary stats if needed */}
                <div className="hidden lg:block lg:col-span-2"></div>
            </div>

            {/* --- Charts Row 1: Donut Charts --- */}

            {/* Role Composition */}
            <Card className="md:col-span-4 shadow-none border border-slate-100 bg-white rounded-2xl flex flex-col">
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold text-slate-800">Komposisi Jabatan</CardTitle>
                    <CardDescription>Ratio Instruktur vs Widyaiswara</CardDescription>
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
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                itemStyle={{ color: '#1e293b', fontSize: '0.85rem' }}
                                formatter={formatTooltip}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex -mt-5 items-center justify-center pointer-events-none pb-8">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-slate-700">{data.length}</span>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="md:col-span-4 shadow-none border border-slate-100 bg-white rounded-2xl flex flex-col">
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold text-slate-800">Status Kepegawaian</CardTitle>
                    <CardDescription>Distribusi status aktif</CardDescription>
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
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                itemStyle={{ color: '#1e293b', fontSize: '0.85rem' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Expertise */}
            <Card className="md:col-span-4 shadow-none border border-slate-100 bg-white rounded-2xl flex flex-col">
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold text-slate-800">Top Keahlian</CardTitle>
                    <CardDescription>Bidang yang paling dominan</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-[250px]">
                    <div className="space-y-4 pt-4">
                        {keahlianData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div className="w-8 text-center text-sm font-bold text-slate-400">#{index + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-slate-700 line-clamp-1">{item.name}</span>
                                        <span className="text-xs font-semibold text-slate-500">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${(item.value / (keahlianData[0]?.value || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* --- Charts Row 2: Detailed Bars --- */}

            {/* Education Level (Stacked) */}
            <Card className="md:col-span-8 shadow-none border border-slate-100 bg-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Distribusi Pendidikan</CardTitle>
                    <CardDescription>Sebaran pendidikan per jabatan</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pendidikanData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7, paddingBottom: '20px' }} />
                            <Bar dataKey="Instruktur" stackId="a" fill={COLORS_ROLE[0]} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Widyaiswara" stackId="a" fill={COLORS_ROLE[1]} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Lainnya" stackId="a" fill={COLORS_ROLE[2]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Job Levels */}
            <Card className="md:col-span-4 shadow-none border border-slate-100 bg-white rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Jenjang Jabatan</CardTitle>
                    <CardDescription>Top 5 jabatan fungsional</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={jabatanData} margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={130}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                cursor={{ fill: '#f8fafc' }}
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
    const itemsPerPage = 10;
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
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-800">Daftar Instruktur</CardTitle>
                        <CardDescription>
                            Kelola data instruktur dan pelatih secara terpusat.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Cari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-64 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">No</th>
                            <th className="px-6 py-3 font-semibold text-gray-900 sticky left-12 bg-gray-50 z-10 text-center">Aksi</th>
                            <th className="px-6 py-3 font-semibold text-gray-900 sticky left-32 bg-gray-50 z-10">Instruktur</th>
                            <th className="px-6 py-3 font-semibold text-gray-900">Satuan Kerja</th>
                            <th className="px-6 py-3 font-semibold text-gray-900">Keahlian</th>
                            <th className="px-6 py-3 font-semibold text-gray-900">Pendidikan</th>
                            <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-3 font-semibold text-gray-900">Sertifikasi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => {
                                const { name: nameUnitKerja } = findNameUnitKerjaById(unitKerjas, row.id_lemdik.toString());
                                return (
                                    <tr key={row.IdInstruktur} className="bg-white hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium sticky left-0 bg-white group-hover:bg-blue-50/50">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 sticky left-12 bg-white group-hover:bg-blue-50/50 z-10 w-20 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <div className="p-1 px-2 space-y-1 w-full">
                                                            <UpdateInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                            <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 sticky left-32 bg-white group-hover:bg-blue-50/50 z-10 min-w-[250px]">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{row.nama}</span>
                                                <span className="text-xs text-gray-500">{row.nip}</span>
                                                <span className="text-xs text-gray-500 mt-1">{row.email}</span>
                                                <span className="text-xs text-blue-600 mt-0.5">{row.no_telpon}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 line-clamp-1" title={nameUnitKerja}>{nameUnitKerja}</span>
                                                <span className="text-xs text-gray-500 line-clamp-1">{row.eselon_1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                {row.bidang_keahlian || "-"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{row.pendidikkan_terakhir}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`
                                                    ${row.status === "Aktif" || row.status === "PNS" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                                                    ${row.status === "Non Aktif" ? "bg-red-100 text-red-700 hover:bg-red-200" : ""}
                                                    font-normal border-0
                                                `}
                                            >
                                                {row.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {row.management_of_training && (
                                                    <a href={row.management_of_training} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                        <FileBadge className="w-3 h-3" /> MOT
                                                    </a>
                                                )}
                                                {row.link_data_dukung_sertifikat && (
                                                    <a href={row.link_data_dukung_sertifikat} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                        <FileBadge className="w-3 h-3" /> Sertifikat
                                                    </a>
                                                )}
                                                {!row.management_of_training && !row.link_data_dukung_sertifikat && (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <div className="rounded-full bg-gray-100 p-3 mb-3">
                                            <Search className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-base font-medium text-gray-900">Tidak ada instruktur ditemukan</p>
                                        <p className="text-sm text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter anda.</p>
                                        <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
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
            <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari{" "}
                    <span className="font-medium">{filteredData.length}</span> hasil
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        {"<"}
                    </Button>
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
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="h-8 w-8 p-0 text-xs"
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        {">"}
                    </Button>
                </div>
            </div>
        </Card>
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
                <Button variant="outline" className={`gap-2 ${hasActiveFilters ? "border-blue-500 bg-blue-50 text-blue-700" : ""}`}>
                    <Filter className="w-4 h-4" />
                    Filter
                    {hasActiveFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4" align="end">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold leading-none">Filter Data</h4>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-red-500 hover:text-red-600 hover:bg-transparent"
                            onClick={clearFilters}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Unit Kerja</label>
                        <Select value={filterUnitKerja} onValueChange={setFilterUnitKerja}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Semua Unit Kerja" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Unit Kerja</SelectItem>
                                {unitKerjaOptions.map((opt: UnitKerja) => (
                                    <SelectItem key={opt.id_unit_kerja} value={opt.id_unit_kerja.toString()}>
                                        {opt.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Bidang Keahlian</label>
                        <Select value={filterKeahlian} onValueChange={setFilterKeahlian}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Semua Bidang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Bidang</SelectItem>
                                {bidangKeahlianOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Jabatan</label>
                        <Select value={filterJabatan} onValueChange={setFilterJabatan}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Semua Jabatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jabatan</SelectItem>
                                {jabatanOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Pendidikan</label>
                            <Select value={filterPendidikan} onValueChange={setFilterPendidikan}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Semua" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {pendidikanOptions.map((opt: any) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500">Status</label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Semua" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {statusOptions.map((opt: any) => (
                                        <SelectItem key={opt} value={opt}>
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

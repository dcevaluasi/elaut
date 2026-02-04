"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Book, Calendar, CheckCircle, File, Layers, SlidersHorizontal, XCircle, TrendingUp, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { TbBook } from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import Cookies from "js-cookie";
import { findNameUnitKerjaById, findUnitKerjaById } from "@/utils/unitkerja";
import { UnitKerja } from "@/types/master";
import AddModulAction from "@/commons/actions/modul/AddModulAction";
import UpdateModulAction from "@/commons/actions/modul/UpdateModulAction";
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

export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Modul");

    const idUnitKerja = Cookies.get('IDUnitKerja')
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    const [filterBidang, setFilterBidang] = useState("")
    const [filterTahun, setFilterTahun] = useState("")
    const [filterProdusen, setFilterProdusen] = useState("")
    const [filterVerified, setFilterVerified] = useState("")

    const bidangOptions = [...new Set(data.map(d => d.BidangMateriPelatihan).filter(Boolean))]
    const tahunOptions = [...new Set(data.map(d => d.Tahun).filter(Boolean))]
    const produsenOptions = unitKerjas
    const verifiedOptions = [...new Set(data.map(d => d.IsVerified).filter(Boolean))]

    const clearFilters = () => {
        setFilterBidang("")
        setFilterTahun("")
        setFilterProdusen("")
        setFilterVerified("")
    }
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const matchesSearch = !searchQuery || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
            const matchesBidang = !filterBidang || row.BidangMateriPelatihan === filterBidang
            const matchesTahun = !filterTahun || row.Tahun === filterTahun
            const matchesProdusen = !filterProdusen || row.DeskripsiMateriPelatihan === filterProdusen.toString()
            const matchesVerified = !filterVerified || row.IsVerified === filterVerified

            return matchesSearch && matchesBidang && matchesTahun && matchesProdusen && matchesVerified
        }).sort((a, b) => {
            const yearA = parseInt(a.Tahun, 10) || 0;
            const yearB = parseInt(b.Tahun, 10) || 0;
            return yearB - yearA; // descending
        });
    }, [data, searchQuery, filterBidang, filterTahun, filterProdusen, filterVerified]);

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (loading && loadingUnitKerja)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error && errorUnitKerja)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-8 pb-10">
            <StatsCards data={data} stats={stats} />

            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Daftar Modul Pelatihan</CardTitle>
                            <CardDescription className="text-slate-500">
                                Kelola data modul dan materi pelatihan yang tersedia.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Cari modul..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-3 w-full sm:w-64 bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm rounded-lg"
                                />
                            </div>

                            <FilterDropdown
                                filterBidang={filterBidang}
                                setFilterBidang={setFilterBidang}
                                bidangOptions={bidangOptions}
                                filterTahun={filterTahun}
                                setFilterTahun={setFilterTahun}
                                tahunOptions={tahunOptions}
                                filterProdusen={filterProdusen}
                                setFilterProdusen={setFilterProdusen}
                                produsenOptions={produsenOptions}
                                filterVerified={filterVerified}
                                setFilterVerified={setFilterVerified}
                                verifiedOptions={verifiedOptions}
                                clearFilters={clearFilters}
                                hasActiveFilters={!!(filterBidang || filterTahun || filterProdusen || filterVerified)}
                            />

                            {
                                Cookies.get('Access')?.includes('superAdmin') && <AddModulAction onSuccess={fetchModulPelatihan} />
                            }
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold w-16 text-center">No</th>
                                <th className="px-6 py-3 font-semibold w-32 text-center">Aksi</th>
                                <th className="px-6 py-3 font-semibold">Modul</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-center">Materi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => {
                                    const { isMatch, name } = findUnitKerjaById(unitKerjas, idUnitKerja)
                                    const { name: nameUK } = findNameUnitKerjaById(unitKerjas, row.DeskripsiMateriPelatihan)
                                    return (
                                        <tr key={row.IdMateriPelatihan} className="bg-white hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-center font-medium text-slate-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(isMatch && row.DeskripsiMateriPelatihan == idUnitKerja) && <UpdateModulAction onSuccess={fetchModulPelatihan} materiPelatihan={row} />}
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => (window.location.href = `/admin/lemdiklat/master/modul/${row.IdMateriPelatihan}`)}
                                                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-indigo-500 text-indigo-500 hover:text-white hover:bg-indigo-500"
                                                        title="Detail Modul"
                                                    >
                                                        <TbBook className="h-4 w-4" /> Lihat Detail
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-semibold text-slate-800 line-clamp-2 leading-tight" title={row.NamaMateriPelatihan}>{row.NamaMateriPelatihan}</span>
                                                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{row.BidangMateriPelatihan}</span>
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{row.Tahun}</span>
                                                    </div>
                                                    <span className="text-[11px] text-slate-400">Produsen: {isMatch && row.DeskripsiMateriPelatihan == idUnitKerja ? name : nameUK}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {row.IsVerified === "Verified" ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Disahkan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-100 text-red-700 border border-red-200">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Belum Disahkan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 font-semibold text-slate-700 bg-slate-100 rounded-md text-xs border border-slate-200">
                                                    {row.ModulPelatihan.length}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                        Tidak ada data modul ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-slate-200"
                        >
                            {"<"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-slate-200"
                        >
                            {">"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function StatsCards({ data, stats }: { data: any[]; stats: any }) {
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

function FilterDropdown({
    filterBidang,
    setFilterBidang,
    bidangOptions,
    filterTahun,
    setFilterTahun,
    tahunOptions,
    filterProdusen,
    setFilterProdusen,
    produsenOptions,
    filterVerified,
    setFilterVerified,
    verifiedOptions,
    clearFilters,
    hasActiveFilters
}: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`gap-2 text-sm ${hasActiveFilters ? "border-blue-500 bg-blue-50 text-blue-700" : "bg-white border-slate-200"}`}>
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                    {hasActiveFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-4 space-y-4" align="end">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm leading-none">Filter Data</h4>
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

                {/* Bidang */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Rumpun Pelatihan</label>
                    <Select value={filterBidang} onValueChange={setFilterBidang}>
                        <SelectTrigger className="h-8 text-xs w-full">
                            <SelectValue placeholder="Semua Rumpun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Rumpun</SelectItem>
                            {bidangOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Tahun */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Tahun</label>
                        <Select value={filterTahun} onValueChange={setFilterTahun}>
                            <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {tahunOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Pengesahan */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">Status</label>
                        <Select value={filterVerified} onValueChange={setFilterVerified}>
                            <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                {verifiedOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Produsen */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Produsen</label>
                    <Select value={filterProdusen} onValueChange={setFilterProdusen}>
                        <SelectTrigger className="h-8 text-xs w-full">
                            <SelectValue placeholder="Semua Produsen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Produsen</SelectItem>
                            {produsenOptions.map((opt: UnitKerja) => (
                                <SelectItem key={opt.id_unit_kerja} value={opt.id_unit_kerja.toString()}>
                                    {opt.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
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
import StatsModulPelatihan from "./StatsModulPelatihan";

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
            <StatsModulPelatihan data={data} stats={stats} />

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
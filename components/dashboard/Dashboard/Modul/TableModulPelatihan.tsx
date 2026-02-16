"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Book, Calendar, CheckCircle, File, Layers, SlidersHorizontal, XCircle, TrendingUp, PieChart as PieIcon, BarChart3, Folder, FolderOpen, ChevronRight, ChevronDown, Monitor, Database, Shield, Zap, Search, MoreHorizontal, ExternalLink, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import Cookies from "js-cookie";
import { findNameUnitKerjaById, findUnitKerjaById } from "@/utils/unitkerja";
import { UnitKerja } from "@/types/master";
import AddModulAction from "@/commons/actions/modul/AddModulAction";
import UpdateModulAction from "@/commons/actions/modul/UpdateModulAction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TbBook } from "react-icons/tb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StatsModulPelatihan from "./StatsModulPelatihan";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { ArrowUpRight, Settings } from "lucide-react";

export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Modul");

    const idUnitKerja = Cookies.get('IDUnitKerja')
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
    const pathname = usePathname();

    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    const [filterBidang, setFilterBidang] = useState("")
    const [filterTahun, setFilterTahun] = useState("")
    const [filterProdusen, setFilterProdusen] = useState("")
    const [filterVerified, setFilterVerified] = useState("")

    const bidangOptions = [...new Set(data.map(d => d.BidangMateriPelatihan).filter(Boolean))]
    const tahunOptions = Array.from(new Set(data.map(d => d.Tahun).filter(Boolean))).sort((a, b) => parseInt(b) - parseInt(a));
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
            const matchesSearch = !searchQuery ||
                row.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                row.BidangMateriPelatihan?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesBidang = !filterBidang || filterBidang === "all" || row.BidangMateriPelatihan === filterBidang
            const matchesTahun = !filterTahun || filterTahun === "all" || row.Tahun === filterTahun
            const matchesProdusen = !filterProdusen || filterProdusen === "all" || row.DeskripsiMateriPelatihan === filterProdusen.toString()
            const matchesVerified = !filterVerified || filterVerified === "all" || row.IsVerified === filterVerified

            return matchesSearch && matchesBidang && matchesTahun && matchesProdusen && matchesVerified
        }).sort((a, b) => {
            const yearA = parseInt(a.Tahun, 10) || 0;
            const yearB = parseInt(b.Tahun, 10) || 0;
            return yearB - yearA;
        });
    }, [data, searchQuery, filterBidang, filterTahun, filterProdusen, filterVerified]);

    const groupedData = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};
        filteredData.forEach(item => {
            const year = item.Tahun || "Lainnya";
            const cluster = item.BidangMateriPelatihan || "Lainnya";
            if (!groups[year]) groups[year] = {};
            if (!groups[year][cluster]) groups[year][cluster] = [];
            groups[year][cluster].push(item);
        });
        return groups;
    }, [filteredData]);

    if (loading && loadingUnitKerja)
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Sinkronisasi Data Modul...</p>
            </div>
        );

    return (
        <div className="space-y-6 pb-10">
            <StatsModulPelatihan data={data} stats={stats} />

            <div className="flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
                        <Input
                            type="text"
                            placeholder="Cari judul modul atau rumpun..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-full border-none bg-slate-50/50 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/20 transition-all font-medium text-xs"
                        />
                    </div>

                    <div className="flex gap-2 items-center w-full md:w-auto">
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

                        {Cookies.get('Access')?.includes('superAdmin') && (
                            <AddModulAction onSuccess={fetchModulPelatihan} />
                        )}
                    </div>
                </div>

                {/* Folder View */}
                <div className="space-y-4">
                    {Object.keys(groupedData).length > 0 ? (
                        Object.keys(groupedData)
                            .sort((a, b) => parseInt(b) - parseInt(a))
                            .map((year) => (
                                <YearFolder key={year} year={year} clusters={groupedData[year]} unitKerjas={unitKerjas} idUnitKerja={idUnitKerja!} fetchModulPelatihan={fetchModulPelatihan} encryptValue={(v: string) => v} />
                            ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-3xl opacity-50">
                            <Folder className="w-12 h-12 text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada data modul ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function YearFolder({ year, clusters, unitKerjas, idUnitKerja, fetchModulPelatihan }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const totalModuls = Object.values(clusters).reduce((acc: number, items: any) => acc + items.length, 0);

    return (
        <div className="group/year">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-md ${isOpen ? "ring-2 ring-blue-500/10 border-blue-200 shadow-sm" : ""}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover/year:bg-blue-100"}`}>
                        <Folder className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">TAHUN {year}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Object.keys(clusters).length} Rumpun Pelatihan • {totalModuls} Materi</p>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 ml-6 space-y-3 border-l-2 border-slate-100 pl-6"
                    >
                        {Object.keys(clusters).map((cluster) => (
                            <ClusterFolder key={cluster} cluster={cluster} modules={clusters[cluster]} unitKerjas={unitKerjas} idUnitKerja={idUnitKerja} fetchModulPelatihan={fetchModulPelatihan} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ClusterFolder({ cluster, modules, unitKerjas, idUnitKerja, fetchModulPelatihan }: any) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="group/cluster">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-xl transition-all hover:bg-white hover:border-slate-200 ${isOpen ? "bg-white border-slate-200 shadow-sm" : ""}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600"}`}>
                        <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{cluster}</h4>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{modules.length} Dokumen Pendukung</p>
                    </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                            {modules.map((modul: any) => (
                                <ModulCard key={modul.IdMateriPelatihan} modul={modul} unitKerjas={unitKerjas} idUnitKerja={idUnitKerja} fetchModulPelatihan={fetchModulPelatihan} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ModulCard({ modul, unitKerjas, idUnitKerja, fetchModulPelatihan }: any) {
    const { isMatch, name: unitKerjaName } = findUnitKerjaById(unitKerjas, idUnitKerja)
    const { name: nameUK } = findNameUnitKerjaById(unitKerjas, modul.DeskripsiMateriPelatihan)

    return (
        <div className="group/card relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover/card:bg-blue-500/10 transition-colors" />

            <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl group-hover/card:scale-110 transition-transform">
                        <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {modul.IsVerified === "Verified" ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                                    <RiVerifiedBadgeFill className="w-2.5 h-2.5 mr-1" />
                                    Disahkan
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-slate-200 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                                    <XCircle className="w-2.5 h-2.5 mr-1" />
                                    Draf
                                </Badge>
                            )}
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 line-clamp-2 leading-snug group-hover/card:text-blue-600 transition-colors" title={modul.NamaMateriPelatihan}>
                            {modul.NamaMateriPelatihan}
                        </h5>
                    </div>
                </div>

                <div className="flex gap-1">
                    {(isMatch && modul.DeskripsiMateriPelatihan == idUnitKerja) && (
                        <UpdateModulAction onSuccess={fetchModulPelatihan} materiPelatihan={modul} />
                    )}
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <Monitor className="w-3 h-3" />
                        Produsen: <span className="text-slate-600">{isMatch && modul.DeskripsiMateriPelatihan == idUnitKerja ? unitKerjaName : nameUK}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <Database className="w-3 h-3" />
                        Lampiran: <span className="text-blue-600">{modul.ModulPelatihan.length} Berkas</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {modul.IdMateriPelatihan}</span>
                    <Link
                        href={`/admin/lemdiklat/master/modul/${modul.IdMateriPelatihan}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        Buka Folder
                        <ArrowUpRight size={12} />
                    </Link>
                </div>
            </div>
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
                <Button variant="outline" className={`h-10 px-4 gap-2 text-xs font-bold rounded-xl ${hasActiveFilters ? "border-blue-500 bg-blue-50 text-blue-700" : "bg-white border-slate-200 shadow-sm"}`}>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filter
                    {hasActiveFilters && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-4 space-y-4 rounded-2xl shadow-xl border-slate-100" align="end">
                <div className="flex items-center justify-between border-b pb-2 border-slate-50">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Filter Data</h4>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-transparent uppercase tracking-wider"
                            onClick={clearFilters}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {/* Bidang */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rumpun Pelatihan</label>
                    <Select value={filterBidang} onValueChange={setFilterBidang}>
                        <SelectTrigger className="h-9 text-xs w-full bg-slate-50 border-none rounded-lg font-medium">
                            <SelectValue placeholder="Semua Rumpun" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="all" className="text-xs">Semua Rumpun</SelectItem>
                            {bidangOptions.map((opt: any) => (
                                <SelectItem key={opt} value={opt} className="text-xs">
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Tahun */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun</label>
                        <Select value={filterTahun} onValueChange={setFilterTahun}>
                            <SelectTrigger className="h-9 text-xs w-full bg-slate-50 border-none rounded-lg font-medium">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all" className="text-xs">Semua</SelectItem>
                                {tahunOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt} className="text-xs">
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Pengesahan */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                        <Select value={filterVerified} onValueChange={setFilterVerified}>
                            <SelectTrigger className="h-9 text-xs w-full bg-slate-50 border-none rounded-lg font-medium">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all" className="text-xs">Semua</SelectItem>
                                {verifiedOptions.map((opt: any) => (
                                    <SelectItem key={opt} value={opt} className="text-xs">
                                        {opt === "Verified" ? "Disahkan" : "Belum Disahkan"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Produsen */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produsen</label>
                    <Select value={filterProdusen} onValueChange={setFilterProdusen}>
                        <SelectTrigger className="h-9 text-xs w-full bg-slate-50 border-none rounded-lg font-medium">
                            <SelectValue placeholder="Semua Produsen" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="all" className="text-xs">Semua Produsen</SelectItem>
                            {produsenOptions.map((opt: UnitKerja) => (
                                <SelectItem key={opt.id_unit_kerja} value={opt.id_unit_kerja.toString()} className="text-xs">
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
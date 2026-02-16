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
import StatsInstruktur from "../StatsInstruktur";

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

            <AnimatePresence>
                {showCharts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <StatsInstruktur data={instrukturs} stats={stats} />
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
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const sortedAndPaginatedData = useMemo(() => {
        return [...filteredData]
            .sort((a, b) => a.nama.localeCompare(b.nama))
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredData, currentPage]);

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
            {/* Premium Header & Search Bar */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-all duration-500">
                            <TbUserCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">DATA INSTRUKTUR</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kelola & pantau data instruktur serta pelatih Anda</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative group">
                            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari instruktur..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 w-full sm:w-64 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium"
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
            </div >

            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="w-16 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No</th>
                                <th className="w-24 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Instruktur</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Kerja & Jabatan</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kompetensi</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pendidikan</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Berkas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedAndPaginatedData.length > 0 ? (
                                sortedAndPaginatedData.map((row, index) => {
                                    const { name: nameUnitKerja } = findNameUnitKerjaById(unitKerjas, row.id_lemdik.toString());
                                    return (
                                        <tr key={row.IdInstruktur} className="hover:bg-slate-50/50 transition-colors group/row">
                                            <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                                                                <TbDotsVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-xl p-2 z-[9999] bg-white/95 backdrop-blur-xl">
                                                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Opsi Tindakan</DropdownMenuLabel>
                                                            <div className="space-y-1">
                                                                <UpdateInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                                <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} />
                                                            </div>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[13px] font-black text-slate-700 leading-tight group-hover/row:text-blue-600 transition-colors">{row.nama}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <TbId size={12} className="text-slate-300" /> {row.nip || "-"}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                            <TbPhone size={12} className="text-slate-300" /> {row.no_telpon}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 max-w-[240px]">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-start gap-2">
                                                        <TbBuildingSkyscraper className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-[11px] font-bold text-slate-600 leading-snug line-clamp-2" title={nameUnitKerja}>
                                                            {nameUnitKerja}
                                                        </span>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit">
                                                        {row.jenjang_jabatan || "Umum"}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-black px-2.5 py-1 rounded-lg">
                                                    {row.bidang_keahlian || "-"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                                                        <TbSchool className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-slate-700">{row.pendidikkan_terakhir}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                                    ${row.status === "Active" || row.status === "Aktif" || row.status === "PNS" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : ""}
                                                    ${row.status === "Non Aktif" || row.status === "No Active" ? "bg-rose-50 text-rose-600 border border-rose-100" : ""}
                                                    ${row.status === "Tugas Belajar" ? "bg-amber-50 text-amber-600 border border-amber-100" : ""}
                                                `}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === "Active" || row.status === "Aktif" || row.status === "PNS" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    {row.management_of_training ? (
                                                        <a href={row.management_of_training} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="MOT">
                                                            <TbCertificate className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center">
                                                            <TbCertificate className="w-4 h-4" />
                                                        </div>
                                                    )}

                                                    {row.link_data_dukung_sertifikat ? (
                                                        <a href={row.link_data_dukung_sertifikat} target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Sertifikat">
                                                            <TbBriefcase className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center">
                                                            <TbBriefcase className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <TbUser size={48} className="text-slate-200 mb-3" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada data instruktur ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 p-6 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Halaman <span className="text-blue-600">{currentPage}</span> Dari <span className="text-slate-600">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                        >
                            Berikutnya
                        </Button>
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

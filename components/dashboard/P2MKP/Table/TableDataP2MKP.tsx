"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, MapPin, Search, ChevronLeft, ChevronRight,
    Settings, ShieldCheck, Activity, Briefcase,
    TrendingUp, Award, Phone, Mail, FileText, ScrollText, Download, X
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DialogSertifikatP2MKP, { DialogSertifikatP2MKPHandle } from "@/components/sertifikat/dialogSertifikatP2MKP";
import { P2MKP } from "@/types/p2mkp";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";

const TableDataP2MKP = () => {
    const { data: p2mkpData, loading, error, fetchP2MKPData } = useFetchDataP2MKP();
    const { data: penetapanData } = useFetchDataPengajuanPenetapan();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Sertifikat dialog state
    const [selectedP2MKP, setSelectedP2MKP] = useState<P2MKP | null>(null);
    const [isSertifikatOpen, setIsSertifikatOpen] = useState(false);
    const certRef = useRef<DialogSertifikatP2MKPHandle>(null);

    // Strict Filtering: Only show "Telah Ditetapkan"
    const filteredData = useMemo(() => {
        if (!p2mkpData) return [];
        return p2mkpData.filter((row) => {
            const matchesStatus = (row.status || "").toLowerCase() === "approved";
            const matchesSearch = !searchQuery || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesStatus && matchesSearch;
        });
    }, [p2mkpData, searchQuery]);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = filteredData.length;
        const totalProvinsi = new Set(filteredData.map(p => p.provinsi)).size;
        const totalKota = new Set(filteredData.map(p => p.kota)).size;
        return { total, totalProvinsi, totalKota };
    }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return (
        <div className="py-32 w-full items-center flex flex-col justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse text-center">Menarik Data Lembaga...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center bg-rose-50 rounded-3xl border border-rose-100 mx-auto max-w-2xl my-10">
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-rose-900 mb-2 uppercase italic tracking-tight">Koneksi Database Terputus</h3>
            <p className="text-rose-600 font-medium mb-6 text-sm">{error}</p>
            <Button variant="outline" onClick={() => fetchP2MKPData()} className="border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                Coba Sinkronisasi Ulang
            </Button>
        </div>
    );

    return (
        <>
            <div className="space-y-8 pb-10 mt-10">
                {/* 1. Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl transition-all duration-500 hover:shadow-blue-500/10">
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <Building2 className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Klasifikasi</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-wider">Telah Ditetapkan</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider opacity-80">Total P2MKP</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-white tracking-tighter">{stats.total}</span>
                                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Lembaga</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl transition-all duration-500 hover:shadow-emerald-500/10">
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider opacity-80">Cakupan Wilayah</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-white tracking-tighter">{stats.totalKota}</span>
                                    <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-tighter">Kota / Kab</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <TrendingUp className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pertumbuhan</h4>
                            <p className="text-[9px] font-bold text-blue-500 uppercase">Aktif Berjalan</p>
                        </div>
                    </Card>

                    <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <Award className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kualitas Pelatihan</h4>
                            <p className="text-[9px] font-bold text-amber-500 uppercase">Terverifikasi Pusat</p>
                        </div>
                    </Card>
                </div>

                {/* 2. Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 transition-colors group-focus-within:text-blue-500" />
                        <Input
                            type="text"
                            placeholder="Cari nama lembaga, NIB, atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 w-full border-none bg-slate-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-bold text-sm"
                        />
                    </div>
                    <Button
                        onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/create`}
                        className="h-12 px-8 gap-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                    >
                        <Building2 className="w-4 h-4" />
                        Tambah P2MKP Baru
                    </Button>
                </div>

                {/* 3. Main Table */}
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center w-20">UID</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-left">Lembaga P2MKP</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Penanggung Jawab</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right w-44">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {paginatedData.map((row, index) => (
                                        <motion.tr
                                            key={row.IdPpmkp || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.5, delay: index * 0.04 }}
                                            className="group/row relative hover:bg-slate-50 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500"
                                        >
                                            <td className="px-6 py-6 text-center">
                                                <span className="text-[11px] font-bold text-slate-300 group-hover/row:text-blue-600 transition-colors">
                                                    {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                                                </span>
                                            </td>

                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-blue-500 tracking-tighter px-2 py-0.5 bg-blue-50 rounded border border-blue-100 uppercase">
                                                                NIB-{row.nib?.slice(0, 8) || "N/A"}
                                                            </span>
                                                            <div className="h-px bg-slate-100 flex-grow group-hover/row:bg-blue-200 transition-all" />
                                                        </div>
                                                        <h3 className="text-[15px] font-black text-slate-800 uppercase tracking-tight group-hover/row:translate-x-1 transition-transform">
                                                            {row.nama_ppmkp || row.nama_Ppmkp}
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={12} className="text-slate-400 group-hover/row:text-blue-500" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                                {row.kota}, {row.provinsi}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Briefcase size={12} className="text-slate-400 group-hover/row:text-emerald-500" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                                {row.status_kepemilikan}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 text-center text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 group-hover/row:border-blue-100 transition-all">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-[9px] font-black text-white">
                                                            {row.nama_penanggung_jawab?.charAt(0).toUpperCase() || "P"}
                                                        </div>
                                                        <div className="flex flex-col text-left">
                                                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-wider leading-none mb-0.5">Penanggung Jawab</span>
                                                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{row.nama_penanggung_jawab || "Anonim"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                                        <div className="flex items-center gap-1">
                                                            <Phone size={10} className="text-slate-400" />
                                                            <span className="text-[9px] font-bold text-slate-500">{row.no_telp || "-"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Mail size={10} className="text-slate-400" />
                                                            <span className="text-[9px] font-bold text-slate-500 truncate max-w-[80px]">{row.email || "-"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 text-center">
                                                <div className="flex justify-center flex-col items-center gap-1.5">
                                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                                                        {row.status}
                                                    </div>
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Resmi Terdaftar</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-6 text-right">
                                                <div className="flex flex-col gap-2 items-end">
                                                    <button
                                                        onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/${row.IdPpmkp}`}
                                                        className="group/btn relative text-center w-full overflow-hidden flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Settings size={12} className="group-hover:rotate-90 transition-transform" />
                                                        <span className="tracking-wider text-[9px]">KELOLA</span>
                                                    </button>
                                                    <P2MKPCertificateAction p2mkp={row as unknown as P2MKP} />

                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative flex items-center justify-center p-8 bg-slate-100 rounded-[40px] mb-6 border-2 border-dashed border-slate-200"
                            >
                                <ShieldCheck className="w-12 h-12 text-slate-300" />
                                <div className="absolute inset-0 bg-blue-500/5 blur-3xl animate-pulse" />
                            </motion.div>
                            <h4 className="text-slate-900 text-lg font-black uppercase tracking-widest mb-2 italic">Zero Records Found</h4>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-60 max-w-xs text-center leading-relaxed">
                                Tidak ditemukan lembaga dengan status <span className="text-blue-600 tracking-normal">'Telah Ditetapkan'</span> atau kriteria pencarian saat ini.
                            </p>
                        </div>
                    )}
                </div>

                {/* 4. Digital Pagination */}
                {filteredData.length > 0 && (
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white/40 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200/50 shadow-sm">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Fleet Management telemetry</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Showing <span className="text-slate-900">{paginatedData.length}</span> of <span className="text-slate-900">{filteredData.length}</span> Lembaga Terdaftar
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-2 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1.5 px-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                            : "text-slate-400 hover:bg-slate-50"
                                            }`}
                                    >
                                        {(i + 1).toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
};

export default TableDataP2MKP;

"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, MapPin, Search, ChevronLeft, ChevronRight,
    Settings, ShieldCheck, Activity, Briefcase,
    TrendingUp, Award, Phone, Mail, X, Filter, RotateCcw,
    Layers, CheckCircle2, Globe, Tag
} from "lucide-react";
import { Loader2 } from "lucide-react";
import DialogSertifikatP2MKP, { DialogSertifikatP2MKPHandle } from "@/components/sertifikat/dialogSertifikatP2MKP";
import { P2MKP } from "@/types/p2mkp";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";
import Swal from "sweetalert2";
import { TbCertificate } from "react-icons/tb";

const TableDataP2MKP = () => {
    const { data: p2mkpData, loading, error, fetchP2MKPData } = useFetchDataP2MKP();
    const { data: penetapanData } = useFetchDataPengajuanPenetapan();
    const pathname = usePathname();

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatusKepemilikan, setSelectedStatusKepemilikan] = useState("all");
    const [selectedProvinsi, setSelectedProvinsi] = useState("all");
    const [selectedKota, setSelectedKota] = useState("all");
    const [selectedKlasifikasi, setSelectedKlasifikasi] = useState("all");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Certificate dialog state
    const [selectedP2MKP, setSelectedP2MKP] = useState<P2MKP | null>(null);
    const [isSertifikatOpen, setIsSertifikatOpen] = useState(false);
    const certRef = useRef<DialogSertifikatP2MKPHandle>(null);

    // Extract dynamic dropdown options from fetched data
    const optionsStatusKepemilikan = useMemo(() => {
        if (!p2mkpData) return [];
        const set = new Set<string>();
        p2mkpData.forEach((item) => {
            if (item.status_kepemilikan) {
                set.add(item.status_kepemilikan.trim());
            }
        });
        return Array.from(set).sort();
    }, [p2mkpData]);

    const optionsProvinsi = useMemo(() => {
        if (!p2mkpData) return [];
        const set = new Set<string>();
        p2mkpData.forEach((item) => {
            if (item.provinsi) {
                set.add(item.provinsi.trim());
            }
        });
        return Array.from(set).sort();
    }, [p2mkpData]);

    const optionsKota = useMemo(() => {
        if (!p2mkpData) return [];
        const set = new Set<string>();
        p2mkpData.forEach((item) => {
            if (selectedProvinsi !== "all" && selectedProvinsi) {
                if (item.provinsi?.toLowerCase() === selectedProvinsi.toLowerCase() && item.kota) {
                    set.add(item.kota.trim());
                }
            } else if (item.kota) {
                set.add(item.kota.trim());
            }
        });
        return Array.from(set).sort();
    }, [p2mkpData, selectedProvinsi]);

    const optionsKlasifikasi = useMemo(() => {
        if (!p2mkpData) return [];
        const set = new Set<string>();
        p2mkpData.forEach((item) => {
            const val = (item as any).klasifikasi || item.klasiikasi;
            if (val) {
                set.add(val.trim());
            }
        });
        return Array.from(set).sort();
    }, [p2mkpData]);

    // Handle province change (resets city filter)
    const handleProvinsiChange = (val: string) => {
        setSelectedProvinsi(val);
        setSelectedKota("all");
        setCurrentPage(1);
    };

    // Main Filtering Logic
    const filteredData = useMemo(() => {
        if (!p2mkpData) return [];
        return p2mkpData.filter((row) => {
            const matchesStatus = (row.status || "").toLowerCase() === "approved";

            const rowKlasifikasi = (row as any).klasifikasi || row.klasiikasi || "";
            const rowNama = row.nama_ppmkp || row.nama_Ppmkp || "";

            const matchesSearch = !searchQuery || [
                rowNama,
                row.nib,
                row.nama_penanggung_jawab,
                row.provinsi,
                row.kota,
                row.alamat,
                row.status_kepemilikan,
                rowKlasifikasi
            ].some((val) => String(val || "").toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesKepemilikan = selectedStatusKepemilikan === "all" || !selectedStatusKepemilikan
                || (row.status_kepemilikan || "").toLowerCase() === selectedStatusKepemilikan.toLowerCase();

            const matchesProvinsi = selectedProvinsi === "all" || !selectedProvinsi
                || (row.provinsi || "").toLowerCase() === selectedProvinsi.toLowerCase();

            const matchesKota = selectedKota === "all" || !selectedKota
                || (row.kota || "").toLowerCase() === selectedKota.toLowerCase();

            const matchesKlasifikasi = selectedKlasifikasi === "all" || !selectedKlasifikasi
                || rowKlasifikasi.toLowerCase() === selectedKlasifikasi.toLowerCase();

            return matchesStatus && matchesSearch && matchesKepemilikan && matchesProvinsi && matchesKota && matchesKlasifikasi;
        });
    }, [p2mkpData, searchQuery, selectedStatusKepemilikan, selectedProvinsi, selectedKota, selectedKlasifikasi]);

    // Active filters indicator check
    const hasActiveFilters = searchQuery !== "" ||
        selectedStatusKepemilikan !== "all" ||
        selectedProvinsi !== "all" ||
        selectedKota !== "all" ||
        selectedKlasifikasi !== "all";

    const activeFilterCount = [
        searchQuery !== "",
        selectedStatusKepemilikan !== "all",
        selectedProvinsi !== "all",
        selectedKota !== "all",
        selectedKlasifikasi !== "all"
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedStatusKepemilikan("all");
        setSelectedProvinsi("all");
        setSelectedKota("all");
        setSelectedKlasifikasi("all");
        setCurrentPage(1);
    };

    // Stats Calculation
    const stats = useMemo(() => {
        const totalApprovedAll = (p2mkpData || []).filter(p => (p.status || "").toLowerCase() === "approved").length;
        const totalFiltered = filteredData.length;
        const totalProvinsi = new Set(filteredData.map(p => p.provinsi).filter(Boolean)).size;
        const totalKota = new Set(filteredData.map(p => p.kota).filter(Boolean)).size;
        return { totalApprovedAll, totalFiltered, totalProvinsi, totalKota };
    }, [p2mkpData, filteredData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Helper for klasifikasi badges
    const getKlasifikasiBadge = (klasifikasi?: string) => {
        if (!klasifikasi) return <span className="text-[10px] text-slate-400 italic font-medium">Belum ditetapkan</span>;
        const lower = klasifikasi.toLowerCase();
        if (lower.includes("mula")) {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/80 inline-flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    {klasifikasi}
                </span>
            );
        }
        if (lower.includes("madya")) {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {klasifikasi}
                </span>
            );
        }
        if (lower.includes("utama")) {
            return (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200/80 inline-flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    {klasifikasi}
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                {klasifikasi}
            </span>
        );
    };

    if (loading) return (
        <div className="py-32 w-full items-center flex flex-col justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse text-center">Menarik Data Lembaga P2MKP...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center bg-rose-50 rounded-3xl border border-rose-100 mx-auto max-w-2xl my-10 shadow-sm">
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
            <div className="space-y-8 pb-10 mt-6">
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
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider opacity-80">Total P2MKP Terdaftar</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white tracking-tighter">{stats.totalFiltered}</span>
                                    {hasActiveFilters && (
                                        <span className="text-[10px] font-bold text-blue-200 opacity-90">
                                            (dari {stats.totalApprovedAll})
                                        </span>
                                    )}
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
                                <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">
                                    {stats.totalProvinsi} Provinsi
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider opacity-80">Cakupan Wilayah</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-white tracking-tighter">{stats.totalKota}</span>
                                    <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-tighter">Kabupaten / Kota</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl transition-all duration-500 hover:shadow-purple-500/10">
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <Layers className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-[9px] font-bold text-purple-100 uppercase tracking-widest opacity-80">Klasifikasi</span>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-purple-100 uppercase tracking-wider opacity-80">Variasi Klasifikasi</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-white tracking-tighter">{optionsKlasifikasi.length}</span>
                                    <span className="text-[10px] font-bold text-purple-200 uppercase tracking-tighter">Tingkatan</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl transition-all duration-500">
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                        <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <Filter className="h-5 w-5 text-amber-400" />
                                </div>
                                {hasActiveFilters && (
                                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[9px] font-bold rounded-full border border-amber-400/30">
                                        {activeFilterCount} Filter Aktif
                                    </span>
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Pencarian</p>
                                <p className="text-sm font-bold text-white truncate">
                                    {hasActiveFilters ? "Hasil Terfilter" : "Menampilkan Semua Data"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. Interactive Filter Bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    {/* Top Row: Search & Add Button */}
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
                            <Input
                                type="text"
                                placeholder="Cari nama lembaga, NIB, penanggung jawab, atau alamat..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-12 pr-10 h-12 w-full border border-slate-200 bg-slate-50/50 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all font-semibold text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {
                            Cookies.get('Access')?.includes('superAdmin') && <Button
                                onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/create`}
                                className="h-12 px-6 gap-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 shrink-0 w-full md:w-auto"
                            >
                                <Building2 className="w-4 h-4" />
                                Tambah P2MKP Baru
                            </Button>
                        }

                    </div>

                    {/* Bottom Row: Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
                        {/* Filter Status Kepemilikan */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                Status Kepemilikan
                            </label>
                            <Select
                                value={selectedStatusKepemilikan}
                                onValueChange={(val) => {
                                    setSelectedStatusKepemilikan(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50/80 border-slate-200 font-bold text-xs">
                                    <SelectValue placeholder="Semua Kepemilikan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="font-bold text-xs">Semua Kepemilikan</SelectItem>
                                    {optionsStatusKepemilikan.map((opt) => (
                                        <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Klasifikasi */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-slate-400" />
                                Klasifikasi
                            </label>
                            <Select
                                value={selectedKlasifikasi}
                                onValueChange={(val) => {
                                    setSelectedKlasifikasi(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50/80 border-slate-200 font-bold text-xs">
                                    <SelectValue placeholder="Semua Klasifikasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="font-bold text-xs">Semua Klasifikasi</SelectItem>
                                    {optionsKlasifikasi.map((opt) => (
                                        <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Provinsi */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Globe className="w-3 h-3 text-slate-400" />
                                Provinsi
                            </label>
                            <Select
                                value={selectedProvinsi}
                                onValueChange={handleProvinsiChange}
                            >
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50/80 border-slate-200 font-bold text-xs">
                                    <SelectValue placeholder="Semua Provinsi" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    <SelectItem value="all" className="font-bold text-xs">Semua Provinsi</SelectItem>
                                    {optionsProvinsi.map((opt) => (
                                        <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filter Kota / Kabupaten */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                Kota / Kabupaten
                            </label>
                            <Select
                                value={selectedKota}
                                onValueChange={(val) => {
                                    setSelectedKota(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-10 rounded-xl bg-slate-50/80 border-slate-200 font-bold text-xs">
                                    <SelectValue placeholder="Semua Kota/Kab" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    <SelectItem value="all" className="font-bold text-xs">Semua Kota / Kab</SelectItem>
                                    {optionsKota.map((opt) => (
                                        <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filter Chips & Reset */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                                Filter Aktif:
                            </span>

                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-[11px] font-bold">
                                    Cari: "{searchQuery}"
                                    <button onClick={() => setSearchQuery("")} className="hover:text-blue-900 ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}

                            {selectedStatusKepemilikan !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-[11px] font-bold">
                                    Kepemilikan: {selectedStatusKepemilikan}
                                    <button onClick={() => setSelectedStatusKepemilikan("all")} className="hover:text-emerald-900 ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}

                            {selectedKlasifikasi !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 text-[11px] font-bold">
                                    Klasifikasi: {selectedKlasifikasi}
                                    <button onClick={() => setSelectedKlasifikasi("all")} className="hover:text-purple-900 ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}

                            {selectedProvinsi !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-[11px] font-bold">
                                    Provinsi: {selectedProvinsi}
                                    <button onClick={() => setSelectedProvinsi("all")} className="hover:text-amber-950 ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}

                            {selectedKota !== "all" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 text-[11px] font-bold">
                                    Kota: {selectedKota}
                                    <button onClick={() => setSelectedKota("all")} className="hover:text-indigo-900 ml-1">
                                        <X size={12} />
                                    </button>
                                </span>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-7 px-2.5 text-[10px] font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg uppercase tracking-wider ml-auto gap-1"
                            >
                                <RotateCcw size={12} />
                                Reset Filter
                            </Button>
                        </div>
                    )}
                </div>

                {/* 3. Main Data Table */}
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center w-16">NO</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Lembaga P2MKP & Lokasi</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Klasifikasi & Kepemilikan</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Penanggung Jawab</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center w-44">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {paginatedData.map((row, index) => {
                                        const globalIndex = startIndex + index + 1;
                                        const namaLembaga = row.nama_ppmkp || row.nama_Ppmkp || "P2MKP Tanpa Nama";
                                        const klasifikasiValue = (row as any).klasifikasi || row.klasiikasi;

                                        // Find correlated approved penetapan from the system
                                        const approvedPenetapan = (penetapanData || []).find(
                                            (p) => String(p.id_Ppmkp) === String(row.IdPpmkp) && p.status?.toLowerCase() === "approved"
                                        );

                                        const handleCertificateClick = () => {
                                            if (!approvedPenetapan) {
                                                Swal.fire({
                                                    icon: "warning",
                                                    title: "Sertifikat Tidak Tersedia",
                                                    html: `<p style="font-size:14px;color:#475569">Pengajuan Penetapan P2MKP untuk lembaga ini <strong>tidak melalui sistem</strong>. Sertifikat hanya dapat diakses jika penetapan diproses melalui sistem ELAUT.</p>`,
                                                    confirmButtonColor: "#1e40af",
                                                    confirmButtonText: "Mengerti",
                                                    background: "#ffffff",
                                                    customClass: { container: "z-[999999999]" },
                                                });
                                            }
                                        };

                                        return (
                                            <motion.tr
                                                key={row.IdPpmkp || index}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                                className="group/row hover:bg-slate-50/90 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-600"
                                            >
                                                {/* NO */}
                                                <td className="px-6 py-5 text-center align-top">
                                                    <span className="text-xs font-black text-slate-400 group-hover/row:text-blue-600 transition-colors">
                                                        {globalIndex.toString().padStart(2, '0')}
                                                    </span>
                                                </td>

                                                {/* Lembaga P2MKP & Lokasi */}
                                                <td className="px-6 py-5 align-top">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-extrabold text-blue-600 tracking-tight px-2 py-0.5 bg-blue-50 rounded-md border border-blue-100 uppercase">
                                                                NIB: {row.nib || "N/A"}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover/row:text-blue-900 transition-colors leading-snug">
                                                            {namaLembaga}
                                                        </h3>
                                                        <div className="flex items-start gap-1.5 text-slate-500 mt-0.5">
                                                            <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5 group-hover/row:text-blue-500 transition-colors" />
                                                            <div className="flex flex-col text-[11px]">
                                                                <span className="font-semibold text-slate-600 leading-tight">
                                                                    {row.alamat || "Alamat tidak dicantumkan"}
                                                                </span>
                                                                <span className="font-bold text-slate-400 uppercase tracking-tight text-[10px] mt-0.5">
                                                                    {row.kota || "-"}, {row.provinsi || "-"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Klasifikasi & Kepemilikan */}
                                                <td className="px-6 py-5 align-top">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Klasifikasi:</span>
                                                            {getKlasifikasiBadge(klasifikasiValue)}
                                                        </div>

                                                        <div className="pt-1">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kepemilikan:</span>
                                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                                                                <Briefcase size={11} className="text-slate-500" />
                                                                {row.status_kepemilikan || "Perorangan"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Penanggung Jawab */}
                                                <td className="px-6 py-5 align-top">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[11px] font-black text-white shadow-sm shrink-0">
                                                                {row.nama_penanggung_jawab?.charAt(0).toUpperCase() || "P"}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider leading-none mb-0.5">Penanggung Jawab</span>
                                                                <span className="text-xs font-bold text-slate-800 leading-tight">
                                                                    {row.nama_penanggung_jawab || "Anonim"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-1 pl-9 text-[10px] text-slate-500 font-medium">
                                                            {row.no_telp && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone size={11} className="text-slate-400 shrink-0" />
                                                                    <span className="font-semibold text-slate-600">{row.no_telp}</span>
                                                                </div>
                                                            )}
                                                            {row.email && (
                                                                <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                                                                    <Mail size={11} className="text-slate-400 shrink-0" />
                                                                    <span className="truncate text-slate-600" title={row.email}>{row.email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Penetapan */}
                                                <td className="px-6 py-5 text-center align-top">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                                                            <CheckCircle2 size={12} className="text-emerald-600" />
                                                            {row.status || "APPROVED"}
                                                        </span>
                                                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            Telah Ditetapkan
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-6 py-5 text-right align-top">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <button
                                                            onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/${row.IdPpmkp}`}
                                                            className="group/btn relative text-center w-full overflow-hidden flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black shadow-sm hover:shadow-md transition-all"
                                                        >
                                                            <Settings size={12} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                                                            <span className="tracking-wider">KELOLA</span>
                                                        </button>

                                                        {approvedPenetapan ? (
                                                            <P2MKPCertificateAction p2mkp={approvedPenetapan as unknown as P2MKP} />
                                                        ) : (
                                                            <button
                                                                onClick={handleCertificateClick}
                                                                className="group/cert relative w-full text-center overflow-hidden flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 text-slate-500 rounded-xl text-[10px] font-black shadow-sm cursor-pointer hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 hover:border-amber-200 transition-all"
                                                                title="Penetapan tidak melalui sistem — klik untuk info"
                                                            >
                                                                <TbCertificate className="w-4 h-4" />
                                                                <span className="tracking-wider">SERTIFIKAT</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Empty Filtered State */}
                    {filteredData.length === 0 && (
                        <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative flex items-center justify-center p-6 bg-slate-100 rounded-3xl mb-4 border border-slate-200"
                            >
                                <Filter className="w-10 h-10 text-slate-400" />
                            </motion.div>
                            <h4 className="text-slate-800 text-base font-black uppercase tracking-wider mb-1">
                                Tidak Ada Data P2MKP Ditemukan
                            </h4>
                            <p className="text-slate-500 text-xs font-semibold max-w-sm mb-6 leading-relaxed">
                                Tidak ditemukan lembaga P2MKP yang cocok dengan kriteria filter atau pencarian Anda.
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    onClick={handleResetFilters}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] uppercase tracking-wider rounded-xl px-5 h-10 shadow-md gap-2"
                                >
                                    <RotateCcw size={14} />
                                    Reset Semua Filter
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Enhanced Pagination Controls */}
                {filteredData.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        {/* Total Count Telemetry */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <span>Menampilkan</span>
                                <span className="font-black text-slate-900 px-2 py-0.5 bg-slate-100 rounded-md">
                                    {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)}
                                </span>
                                <span>dari</span>
                                <span className="font-black text-blue-600">{filteredData.length}</span>
                                <span>Lembaga</span>
                            </div>

                            {/* Items Per Page Selector */}
                            <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
                                <span className="text-[11px] font-bold text-slate-400">Tampilkan:</span>
                                <Select
                                    value={String(itemsPerPage)}
                                    onValueChange={(val) => {
                                        setItemsPerPage(Number(val));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-16 text-xs font-bold rounded-lg border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8">8</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Page Buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Prev
                            </Button>

                            <div className="flex items-center gap-1 px-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, idx, arr) => {
                                        const prev = arr[idx - 1];
                                        const showEllipsis = prev && p - prev > 1;

                                        return (
                                            <React.Fragment key={p}>
                                                {showEllipsis && (
                                                    <span className="px-1 text-slate-400 text-xs font-bold">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === p
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                        : "text-slate-600 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TableDataP2MKP;


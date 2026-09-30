"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TbSchool, TbSettings, TbCertificate, TbListDetails } from "react-icons/tb";
import { usePathname, useRouter } from "next/navigation";
import { decryptValue } from "@/lib/utils";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PelatihanDetail from "./PelatihanDetail";
import STTPLDetail from "./STTPLDetail";
import { motion, AnimatePresence } from "framer-motion";
import { getStatusInfo } from "@/utils/text";
import {
    ChevronLeft,
    School,
    Settings,
    ShieldCheck,
    Lock,
    Info,
    Check,
    ArrowRight,
    Save,
    Loader2,
    Search,
    Sparkles,
    Building2,
    Calendar,
    Users,
    Layers,
    X,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import axios from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface StatusOptionItem {
    value: string;
    category: "ALL" | "Penyelenggaraan" | "STTPL" | "Kabalai" | "Kapus" | "Kabadan";
    categoryLabel: string;
    code: string;
    description: string;
}

const ALL_STATUS_CATEGORIES: StatusOptionItem[] = [
    // Penyelenggaraan
    { value: "0", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "0", description: "Draft Awal Pelatihan" },
    { value: "0.1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "0.1", description: "Pengisian Peserta Pelatihan" },
    { value: "1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1", description: "Pengajuan Verifikasi Lemdiklat" },
    { value: "1.1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.1", description: "Verifikasi Berkas Lemdiklat" },
    { value: "1.2", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.2", description: "Revisi Berkas Lemdiklat" },
    { value: "1.25", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.25", description: "Verifikasi Ulang Lemdiklat" },
    { value: "2", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "2", description: "Pelatihan Disetujui" },
    { value: "3", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "3", description: "Pelatihan Berlangsung" },
    { value: "4", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "4", description: "Pelatihan Selesai" },
    { value: "5", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "5", description: "Pelaporan Penyelenggaraan" },

    // STTPL Verifikator
    { value: "6", category: "STTPL", categoryLabel: "Verifikasi STTPL", code: "6", description: "Pengajuan Verifikasi e-STTPL Pusat" },
    { value: "7", category: "STTPL", categoryLabel: "Verifikasi STTPL", code: "7", description: "Verifikasi e-STTPL Disetujui Pusat" },

    // Kabalai
    { value: "7A", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7A", description: "Draf Penandatanganan Kabalai" },
    { value: "7B", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7B", description: "Proses TTD BSrE Kabalai" },
    { value: "7C", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7C", description: "Selesai TTD Kabalai" },
    { value: "7D", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7D", description: "Revisi Penandatanganan Kabalai" },

    // Kapus
    { value: "8", category: "Kapus", categoryLabel: "TTD Kapus", code: "8", description: "Usulan Penandatanganan Kapus" },
    { value: "9", category: "Kapus", categoryLabel: "TTD Kapus", code: "9", description: "Proses TTD BSrE Kapus" },
    { value: "10", category: "Kapus", categoryLabel: "TTD Kapus", code: "10", description: "Selesai TTD Kapus" },
    { value: "11", category: "Kapus", categoryLabel: "TTD Kapus", code: "11", description: "Revisi Penandatanganan Kapus" },

    // Kabadan
    { value: "12", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "12", description: "Usulan Penandatanganan Kabadan" },
    { value: "13", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "13", description: "Proses TTD BSrE Kabadan" },
    { value: "14", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "14", description: "Selesai TTD Kabadan" },
    { value: "15", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "15", description: "Revisi Penandatanganan Kabadan" },
];

const ManagePelatihan = () => {
    const router = useRouter();
    const paths = usePathname().split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);
    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
    const [activeTab, setActiveTab] = useState('1');

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        const accessCookie = Cookies.get('Access');
        if (accessCookie && accessCookie.includes('superAdmin')) {
            setIsSuperAdmin(true);
        }
    }, []);

    useEffect(() => {
        if (dataPelatihan) {
            setActiveTab((parseInt(dataPelatihan?.StatusPenerbitan) >= 5) ? '2' : '1');
            setSelectedStatus(dataPelatihan.StatusPenerbitan || "0");
        }
    }, [dataPelatihan]);

    const filteredStatusList = useMemo(() => {
        return ALL_STATUS_CATEGORIES.filter((item) => {
            const matchesCategory =
                activeCategoryFilter === "ALL" || item.category === activeCategoryFilter;

            const info = getStatusInfo(item.value);
            const matchesSearch =
                searchQuery.trim() === "" ||
                item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                info.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [activeCategoryFilter, searchQuery]);

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;
        try {
            setIsUpdatingStatus(true);
            const formData = new FormData();
            formData.append("StatusPenerbitan", selectedStatus);

            await axios.put(
                `${elautBaseUrl}/lemdik/updatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Status penerbitan pelatihan berhasil diperbarui.",
            });

            setOpenStatusModal(false);
            if (refetchDetailPelatihan) {
                refetchDetailPelatihan();
            }
        } catch (err) {
            console.error("Error updating status penerbitan:", err);
            Toast.fire({
                icon: "error",
                title: "Gagal Update",
                text: "Terjadi kesalahan saat memperbarui status pelatihan.",
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (loadingDataPelatihan) {
        return (
            <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                    <HashLoader color="#2563eb" size={65} />
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight">Memuat Data Pelatihan...</p>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Menghubungkan Ke Core Server ELAUT</p>
                </div>
            </div>
        );
    }

    if (!dataPelatihan) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/40 rounded-[2rem] flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900 shadow-xl shadow-rose-500/10">
                    <Info className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Data Pelatihan Tidak Ditemukan</h3>
                    <p className="text-slate-500 font-medium max-w-md mx-auto text-sm">Informasi pelatihan ini tidak tersedia atau ID yang dimasukkan tidak valid.</p>
                </div>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider gap-2.5 hover:-translate-x-1 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" /> Kembali Ke Daftar Pelatihan
                </Button>
            </div>
        );
    }

    const { label, color, icon } = getStatusInfo(dataPelatihan.StatusPenerbitan);
    const selectedInfo = getStatusInfo(selectedStatus);
    const totalPeserta = dataPelatihan.UserPelatihan?.length || 0;

    return (
        <section className="pb-10 flex flex-col gap-6 w-full mx-auto">
            {/* Top Navigation & Status Control Bar */}
            <div className="sticky top-16 z-40 py-2 backdrop-blur-md bg-slate-50/60 dark:bg-slate-950/60 rounded-2xl transition-all">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-2">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left w-fit"
                    >
                        <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase leading-none">Kembali</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dashboard Utama</span>
                        </div>
                    </button>

                    {/* Status Pill & Super Admin Switch */}
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 px-3 rounded-2xl shadow-sm flex-wrap justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden md:inline">Status:</span>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${color} text-white shadow-sm`}>
                                {React.cloneElement(icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
                                <span> {label}</span>
                            </div>
                        </div>

                        {/* Super Admin Status Change Button */}
                        {isSuperAdmin && (
                            <Dialog open={openStatusModal} onOpenChange={setOpenStatusModal}>
                                <DialogTrigger asChild>
                                    <button
                                        className="group/admin flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-900/60 shadow-sm"
                                        title="Ubah Status Penerbitan (Super Admin)"
                                    >
                                        <TbSettings className="w-4 h-4 group-hover/admin:rotate-90 transition-transform duration-500" />
                                        <span>Ubah Status</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] md:w-full max-w-3xl rounded-[2.5rem] bg-white dark:bg-slate-900 border-white dark:border-slate-800 shadow-2xl p-0 overflow-hidden z-[99999]">
                                    <div className="p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20 shrink-0">
                                                    <TbSettings />
                                                </div>
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-[9px] uppercase tracking-widest mb-1">
                                                        <Sparkles className="w-3 h-3" /> Control Panel Super Admin
                                                    </div>
                                                    <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                        Kelola Status Penerbitan Pelatihan
                                                    </DialogTitle>
                                                    <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                                        Pilih tahapan alur penerbitan baru secara langsung di bawah ini.
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current vs Selected Stage Bar */}
                                    <div className="px-6 md:px-8 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saat Ini</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none font-mono text-xs px-2 py-0.5">
                                                        {dataPelatihan.StatusPenerbitan || "0"}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mx-1" />

                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Target Baru</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-600 text-white border-none font-mono text-xs px-2 py-0.5 shadow-sm">
                                                        {selectedStatus}
                                                    </Badge>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedInfo.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filter & Selection List */}
                                    <div className="p-6 md:p-8 space-y-4 max-h-[55vh] overflow-y-auto">
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                type="text"
                                                placeholder="Cari status (contoh: Signed, Kabalai, Kapus, 7A)..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Category Filter Pills */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                            {[
                                                { key: "ALL", label: "Semua Stage (25)" },
                                                { key: "Penyelenggaraan", label: "Penyelenggaraan (0-5)" },
                                                { key: "STTPL", label: "Verifikasi STTPL (6-7)" },
                                                { key: "Kabalai", label: "TTD Kabalai (7A-7D)" },
                                                { key: "Kapus", label: "TTD Kapus (8-11)" },
                                                { key: "Kabadan", label: "TTD Kabadan (12-15)" },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.key}
                                                    type="button"
                                                    onClick={() => setActiveCategoryFilter(cat.key)}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${activeCategoryFilter === cat.key
                                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Status Cards Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            {filteredStatusList.length === 0 ? (
                                                <div className="col-span-full py-10 text-center text-slate-400 text-xs font-bold">
                                                    Tidak ada status yang cocok dengan kata kunci pencarian.
                                                </div>
                                            ) : (
                                                filteredStatusList.map((item) => {
                                                    const info = getStatusInfo(item.value);
                                                    const isSelected = selectedStatus === item.value;
                                                    return (
                                                        <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() => setSelectedStatus(item.value)}
                                                            className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all relative ${isSelected
                                                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/20 shadow-md"
                                                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50"
                                                                }`}
                                                        >
                                                            <div className="space-y-1 min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge className={`font-mono text-[10px] px-2 py-0 border-none ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>

                                                                    </Badge>
                                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                                        {item.categoryLabel}
                                                                    </span>
                                                                </div>

                                                                <p className={`text-xs font-bold ${isSelected ? "text-blue-950 dark:text-blue-200 font-black" : "text-slate-800 dark:text-slate-200"}`}>
                                                                    {info.label}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                                                    {item.description}
                                                                </p>
                                                            </div>

                                                            <div className="shrink-0 pt-0.5">
                                                                {isSelected ? (
                                                                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter className="p-6 md:p-8 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-xs font-medium text-slate-400 w-full sm:w-auto">
                                            Stage terpilih: <span className="font-bold text-slate-900 dark:text-white">{selectedStatus} - {selectedInfo.label}</span>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setOpenStatusModal(false)}
                                                disabled={isUpdatingStatus}
                                                className="h-11 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-wider"
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                onClick={handleUpdateStatus}
                                                disabled={isUpdatingStatus}
                                                className="h-11 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                                            >
                                                {isUpdatingStatus ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        <span>Simpan Perubahan</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Pelatihan Hero Card */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative overflow-hidden w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-[2.5rem] p-6 md:p-8">
                    {/* Decorative Background Accents */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[60px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-5">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 shrink-0 transform group-hover:scale-105 transition-transform">
                                <School className="w-8 h-8 md:w-10 md:h-10" />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-none text-[10px] font-black tracking-widest px-3 py-1 uppercase">
                                        {dataPelatihan.PenyelenggaraPelatihan || "LEMDIKLAT KKP"}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-slate-200 dark:border-slate-800">
                                        ID: {idPelatihan}
                                    </Badge>
                                </div>

                                <h1 className="font-black text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {dataPelatihan.NamaPelatihan}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                        <span>{dataPelatihan.PenyelenggaraPelatihan || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>{totalPeserta} Peserta Terdaftar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepped Tab Hub */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex flex-col gap-6"
            >
                <div className="flex justify-center w-full">
                    <TabsList className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 h-auto p-2 rounded-[2.5rem] shadow-lg flex flex-col sm:flex-row items-center gap-2 w-full">
                        <TabsTrigger
                            value="1"
                            className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-500 font-bold transition-all flex items-center justify-center gap-3 group outline-none"
                        >
                            <div className="w-7 h-7 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-slate-800 group-data-[state=active]:bg-white/20 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-white transition-all font-black text-xs">
                                01
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs tracking-tight font-black uppercase leading-none">Penyelenggaraan</span>
                                <span className="text-[9px] font-medium opacity-70 group-data-[state=active]:opacity-90">Administrasi & Peserta</span>
                            </div>
                        </TabsTrigger>

                        <TabsTrigger
                            value="2"
                            disabled={parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == ""}
                            className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-slate-500 font-bold transition-all flex items-center justify-center gap-3 group outline-none disabled:opacity-40 disabled:grayscale"
                        >
                            <div className="w-7 h-7 flex items-center justify-center rounded-xl bg-indigo-100 dark:bg-slate-800 group-data-[state=active]:bg-white/20 text-indigo-600 dark:text-indigo-400 group-data-[state=active]:text-white transition-all font-black text-xs">
                                02
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs tracking-tight font-black uppercase leading-none">Penerbitan e-STTPL</span>
                                <span className="text-[9px] font-medium opacity-70 group-data-[state=active]:opacity-90">Sertifikat Digital & TTD</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="relative w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <TabsContent value="1" className="mt-0 focus-visible:outline-none w-full">
                                <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                            </TabsContent>

                            <TabsContent value="2" className="mt-0 focus-visible:outline-none w-full">
                                {parseInt(dataPelatihan?.StatusPenerbitan) < 5 ? (
                                    <div className="relative py-12 md:py-16 px-6 md:px-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-6 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-[2.5rem] shadow-sm text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
                                            <Lock className="w-8 h-8" />
                                        </div>

                                        <div className="space-y-2">
                                            <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                                Modul Sertifikasi Belum Terbuka
                                            </Badge>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Selesaikan Administrasi Penyelenggaraan</h3>
                                            <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-md mx-auto">
                                                Penerbitan e-STTPL memerlukan status pelatihan minimal mencapai <span className="font-bold text-slate-800 dark:text-slate-200">Stage 5 (Pelaporan Penyelenggaraan)</span>.
                                            </p>
                                        </div>

                                        <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                                            <span>Selesaikan Tahap 01 Penyelenggaraan Dahulu</span>
                                        </div>
                                    </div>
                                ) : (
                                    <STTPLDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                                )}
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Tabs>
        </section>
    );
}

export default ManagePelatihan;

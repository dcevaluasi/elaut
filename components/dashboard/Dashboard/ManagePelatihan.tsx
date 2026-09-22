"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TbSchool, TbArrowLeft, TbAward, TbSettings, TbSearch } from "react-icons/tb";
import { usePathname, useRouter } from "next/navigation";
import {
    decryptValue,
} from "@/lib/utils";
import { useFetchDataPelatihanMasyarakatDetail } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarkatDetail";
import { HashLoader } from "react-spinners";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PelatihanDetail from "./PelatihanDetail";
import { MdLock, MdOutlineVerifiedUser } from "react-icons/md";
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
    Layers
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
}

const ALL_STATUS_CATEGORIES: StatusOptionItem[] = [
    // Penyelenggaraan
    { value: "0", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "0" },
    { value: "0.1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "0.1" },
    { value: "1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1" },
    { value: "1.1", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.1" },
    { value: "1.2", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.2" },
    { value: "1.25", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "1.25" },
    { value: "2", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "2" },
    { value: "3", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "3" },
    { value: "4", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "4" },
    { value: "5", category: "Penyelenggaraan", categoryLabel: "Penyelenggaraan", code: "5" },

    // STTPL Verifikator
    { value: "6", category: "STTPL", categoryLabel: "Verifikasi STTPL", code: "6" },
    { value: "7", category: "STTPL", categoryLabel: "Verifikasi STTPL", code: "7" },

    // Kabalai
    { value: "7A", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7A" },
    { value: "7B", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7B" },
    { value: "7C", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7C" },
    { value: "7D", category: "Kabalai", categoryLabel: "TTD Kabalai", code: "7D" },

    // Kapus
    { value: "8", category: "Kapus", categoryLabel: "TTD Kapus", code: "8" },
    { value: "9", category: "Kapus", categoryLabel: "TTD Kapus", code: "9" },
    { value: "10", category: "Kapus", categoryLabel: "TTD Kapus", code: "10" },
    { value: "11", category: "Kapus", categoryLabel: "TTD Kapus", code: "11" },

    // Kabadan
    { value: "12", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "12" },
    { value: "13", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "13" },
    { value: "14", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "14" },
    { value: "15", category: "Kabadan", categoryLabel: "TTD Kabadan", code: "15" },
];

const ManagePelatihan = () => {
    const router = useRouter();
    const paths = usePathname().split("/");
    const idPelatihan = decryptValue(paths[paths.length - 1]);
    const { data: dataPelatihan, loading: loadingDataPelatihan, error, refetch: refetchDetailPelatihan } = useFetchDataPelatihanMasyarakatDetail(idPelatihan);
    const [activeTab, setActiveTab] = React.useState('1');

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

    React.useEffect(() => {
        if (dataPelatihan) {
            setActiveTab((parseInt(dataPelatihan?.StatusPenerbitan) >= 5) ? '2' : '1');
            setSelectedStatus(dataPelatihan.StatusPenerbitan || "0");
        }
    }, [dataPelatihan]);

    // Filter status list by Category and Search query
    const filteredStatusList = useMemo(() => {
        return ALL_STATUS_CATEGORIES.filter((item) => {
            const matchesCategory =
                activeCategoryFilter === "ALL" || item.category === activeCategoryFilter;

            const info = getStatusInfo(item.value);
            const matchesSearch =
                searchQuery.trim() === "" ||
                item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
                info.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

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
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                    <HashLoader color="#2563eb" size={65} />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-slate-800 font-black text-lg tracking-tight">Loading ...</p>
                    <p className="text-slate-500 text-sm font-medium animate-pulse tracking-widest">Memuat detail pelatihan</p>
                </div>
            </div>
        );
    }

    if (!dataPelatihan) {
        return (
            <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 border border-rose-100 shadow-xl shadow-rose-500/10">
                    <Info className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800">Data Hilang dari Orbit</h3>
                    <p className="text-slate-500 font-medium max-w-md mx-auto italic">Data pelatihan tidak ditemukan atau terjadi gangguan pada koordinat sistem.</p>
                </div>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="h-12 px-8 rounded-2xl border-slate-200 font-bold uppercase tracking-wider gap-3 hover:-translate-x-1 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" /> Kembali Ke Hub
                </Button>
            </div>
        );
    }

    const { label, color, icon } = getStatusInfo(dataPelatihan.StatusPenerbitan);
    const selectedInfo = getStatusInfo(selectedStatus);

    return (
        <section className="pb-6 flex flex-col gap-6 w-full">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-none sticky top-16 z-50 py-1">
                <div className="pointer-events-auto">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-xl border border-white rounded-xl shadow-lg shadow-slate-200/50 hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 transform active:scale-95"
                    >
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronLeft className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-[10px] font-black text-slate-700 tracking-wider group-hover:text-blue-600 transition-colors uppercase">KEMBALI KE HUB</span>
                    </button>
                </div>

                <div className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-white rounded-full shadow-lg shadow-slate-200/50 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color === "bg-blue-600" || color === "bg-blue-500" ? "#2563eb" : color === "bg-emerald-600" ? "#10b981" : "#f59e0b" }} />
                        <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Status Berjalan</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200" />
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${color} shadow-md shadow-blue-500/10 text-white`}>
                        {React.cloneElement(icon as React.ReactElement, { className: "w-3 h-3" })}
                        {label}
                    </div>

                    {/* Super Admin Status Change Button & User-Friendly Dialog */}
                    {isSuperAdmin && (
                        <>
                            <div className="w-px h-3 bg-slate-200" />
                            <Dialog open={openStatusModal} onOpenChange={setOpenStatusModal}>
                                <DialogTrigger asChild>
                                    <button
                                        className="group/admin flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white transition-all duration-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/20 shadow-sm"
                                        title="Ubah Status Penerbitan (Super Admin)"
                                    >
                                        <TbSettings className="w-4 h-4 group-hover/admin:rotate-90 transition-transform duration-500" />
                                        <span>Ubah Status (Super Admin)</span>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] md:w-full max-w-3xl rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white dark:border-slate-800 shadow-2xl p-0 overflow-hidden z-[99999999]">
                                    <div className="p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20 shrink-0">
                                                    <TbSettings />
                                                </div>
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-black text-[9px] uppercase tracking-widest mb-1">
                                                        <Sparkles className="w-3 h-3" /> Super Admin Control
                                                    </div>
                                                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                        Pilih Status Penerbitan Pelatihan
                                                    </DialogTitle>
                                                    <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                                        Pilih tahapan alur penerbitan baru secara langsung dari daftar kategori visual di bawah.
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current vs Target Preview Header */}
                                    <div className="px-6 md:px-8 py-4 bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saat Ini</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-slate-200 text-slate-800 border-none font-mono text-xs px-2 py-0.5">
                                                        {dataPelatihan.StatusPenerbitan || "0"}
                                                    </Badge>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />

                                            <div className="space-y-0.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Pilihan Baru</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-600 text-white border-none font-mono text-xs px-2 py-0.5 shadow-sm">
                                                        {selectedStatus}
                                                    </Badge>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedInfo.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search & Category Filter */}
                                    <div className="p-6 md:p-8 space-y-5 max-h-[60vh] overflow-y-auto">
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <Input
                                                    type="text"
                                                    placeholder="Cari status (contoh: Signed, Kabalai, Kapus, 7A)..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
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
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                                                        activeCategoryFilter === cat.key
                                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Status Option Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                            {filteredStatusList.length === 0 ? (
                                                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold">
                                                    Tidak ada status yang sesuai pencarian.
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
                                                            className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all relative overflow-hidden ${
                                                                isSelected
                                                                    ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-md scale-[1.02]"
                                                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50"
                                                            }`}
                                                        >
                                                            <div className="space-y-1 min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge className={`font-mono text-[10px] px-2 py-0 border-none ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                                        {item.value}
                                                                    </Badge>
                                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                                        {item.categoryLabel}
                                                                    </span>
                                                                </div>

                                                                <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-900 dark:text-blue-200 font-black" : "text-slate-800 dark:text-slate-200"}`}>
                                                                    {info.label}
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

                                    <DialogFooter className="p-6 md:p-8 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between gap-4">
                                        <div className="text-xs font-medium text-slate-400">
                                            Status terpilih: <span className="font-bold text-slate-900 dark:text-white">{selectedStatus} - {selectedInfo.label}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
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
                        </>
                    )}
                </div>
            </div>

            {/* Premium Page Header */}
            <div className="relative group -mt-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-700" />
                <div className="relative overflow-hidden w-full h-auto bg-white/60 backdrop-blur-2xl border border-white shadow-lg rounded-[2.5rem] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[60px] pointer-events-none" />

                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center relative z-10 w-full">
                        <div className="relative">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl lg:text-4xl shadow-xl shadow-blue-500/30 relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                                <School size={40} className="relative z-20" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
                            </div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center text-blue-600 border border-slate-100 z-20">
                                <Settings className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-slate-200" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dataPelatihan.PenyelenggaraPelatihan}</span>
                            </div>

                            <h1 className="font-black text-2xl md:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight max-w-4xl">
                                {dataPelatihan.NamaPelatihan}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hub Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex flex-col gap-6"
            >
                <div className="flex justify-center">
                    <TabsList className="bg-white/80 backdrop-blur-2xl border border-white/50 h-auto p-1.5 rounded-[2rem] shadow-xl flex flex-wrap md:flex-nowrap items-center gap-2 w-full mx-auto">
                        <TabsTrigger
                            value="1"
                            className="flex-1 rounded-[1.5rem] py-2.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 text-slate-500 font-bold transition-all duration-300 flex flex-col items-center group ring-0 outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-100/50 group-data-[state=active]:bg-white/20 transition-all font-black text-[10px]">
                                    01
                                </div>
                                <span className="text-sm tracking-tight font-black uppercase">Penyelenggaraan</span>
                            </div>
                        </TabsTrigger>

                        <TabsTrigger
                            value="2"
                            disabled={parseInt(dataPelatihan?.StatusPenerbitan) < 5 || dataPelatihan?.StatusPenerbitan == ""}
                            className="flex-1 rounded-[1.5rem] py-2.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 text-slate-500 font-bold transition-all duration-300 flex flex-col items-center group ring-0 outline-none disabled:opacity-40 disabled:grayscale"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-indigo-100/50 group-data-[state=active]:bg-white/20 transition-all font-black text-[10px]">
                                    02
                                </div>
                                <span className="text-sm tracking-tight font-black uppercase">Sertifikasi</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="relative w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -30 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full"
                        >
                            <TabsContent value="1" className="mt-0 focus-visible:outline-none w-full">
                                <PelatihanDetail data={dataPelatihan!} fetchData={refetchDetailPelatihan} />
                            </TabsContent>

                            <TabsContent value="2" className="mt-0 focus-visible:outline-none w-full">
                                {parseInt(dataPelatihan?.StatusPenerbitan) < 5 ? (
                                    <div className="group relative py-12 md:py-20 px-6 md:px-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 md:gap-8 bg-white/40 backdrop-blur-xl border border-dashed border-slate-300 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-500 hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-200/50">
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent rounded-[2.5rem] md:rounded-[3rem] -z-10" />

                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-400/20 blur-3xl rounded-full scale-150 group-hover:bg-slate-400/30 transition-all duration-500" />
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border border-slate-100 relative z-10 overflow-hidden group-hover:rotate-6 transition-transform duration-500">
                                                <Lock className='w-10 h-10 md:w-12 md:h-12 text-slate-300 group-hover:text-amber-500 transition-colors duration-500' />
                                                <div className="absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 bg-slate-50 -mr-4 -mt-4 md:-mr-6 md:-mt-6 rounded-full" />
                                            </div>
                                        </div>

                                        <div className="text-center space-y-3 md:space-y-4 relative z-10 max-w-sm">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full mb-1">
                                                <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-600" />
                                                <span className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest">Akses Dibatasi</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Tahap Terkunci</h3>
                                            <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed px-4">
                                                Modul penerbitan sertifikat digital belum dapat diakses. Selesaikan administrasi penyelenggaraan dan ajukan
                                                <span className="text-slate-800 font-black mx-1 uppercase">Verifikasi STTPL</span> kepada administrator pusat.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 mt-2 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                                            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-slate-100">
                                                <Info className="w-4 md:w-5 h-4 md:h-5 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Proses menunggu verifikasi</span>
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

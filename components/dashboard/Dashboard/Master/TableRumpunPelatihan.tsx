"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Cookies from "js-cookie";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { elautBaseUrl } from "@/constants/urls";
import ManageRumpunPelatihanAction from "@/commons/actions/master/rumpun-pelatihan/ManageRumpunPelatihanAction";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";
import {
    TbShieldCheck, TbShip, TbSettings, TbFish, TbLeaf, TbGlobe,
    TbAnchor, TbBuildingFactory, TbUsersGroup, TbEngine, TbBook,
    TbActivity, TbSearch, TbLayersDifference,
} from "react-icons/tb";
import { Search, Sparkles, X, RefreshCw, Trash2, Layers, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
    AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Toast from "@/commons/Toast";

const rumpunIcons: Record<string, JSX.Element> = {
    "Sistem Jaminan Mutu": <TbShieldCheck size={18} className="text-blue-600" />,
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": <TbShip size={18} className="text-indigo-600" />,
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": <TbSettings size={18} className="text-emerald-600" />,
    "Budi Daya": <TbFish size={18} className="text-cyan-600" />,
    "Pengolahan dan Pemasaran": <TbBuildingFactory size={18} className="text-rose-600" />,
    "Konservasi dan Kemitigasian": <TbLeaf size={18} className="text-emerald-600" />,
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)": <TbGlobe size={18} className="text-teal-600" />,
    "Pengawasan dan Kepelabuhan Perikanan": <TbAnchor size={18} className="text-sky-600" />,
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)": <TbUsersGroup size={18} className="text-amber-600" />,
    "Permesinan dan Mekanisasi": <TbEngine size={18} className="text-violet-600" />,
};

const rumpunColors: Record<string, { dot: string; badge: string; badgeText: string }> = {
    "Sistem Jaminan Mutu":                             { dot: "bg-blue-500",    badge: "bg-blue-50 border-blue-200",    badgeText: "text-blue-700" },
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": { dot: "bg-indigo-500",  badge: "bg-indigo-50 border-indigo-200", badgeText: "text-indigo-700" },
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": { dot: "bg-emerald-500", badge: "bg-emerald-50 border-emerald-200", badgeText: "text-emerald-700" },
    "Budi Daya":                                       { dot: "bg-cyan-500",    badge: "bg-cyan-50 border-cyan-200",    badgeText: "text-cyan-700" },
    "Pengolahan dan Pemasaran":                        { dot: "bg-rose-500",    badge: "bg-rose-50 border-rose-200",    badgeText: "text-rose-700" },
    "Konservasi dan Kemitigasian":                     { dot: "bg-green-500",   badge: "bg-green-50 border-green-200",  badgeText: "text-green-700" },
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)": { dot: "bg-teal-500", badge: "bg-teal-50 border-teal-200", badgeText: "text-teal-700" },
    "Pengawasan dan Kepelabuhan Perikanan":            { dot: "bg-sky-500",     badge: "bg-sky-50 border-sky-200",      badgeText: "text-sky-700" },
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)": { dot: "bg-amber-500", badge: "bg-amber-50 border-amber-200", badgeText: "text-amber-700" },
    "Permesinan dan Mekanisasi":                       { dot: "bg-violet-500",  badge: "bg-violet-50 border-violet-200", badgeText: "text-violet-700" },
};

const defaultColor = { dot: "bg-slate-400", badge: "bg-slate-50 border-slate-200", badgeText: "text-slate-600" };

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch { return dateStr; }
}

type SortKey = "id" | "name" | "programs" | "created" | "updated";
type SortDir = "asc" | "desc";

export default function TableRumpunPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const { data, loading, error, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
        setCurrentPage(1);
    };

    const filteredSortedData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        const query = (searchQuery ?? "").toLowerCase();
        const filtered = data.filter(row =>
            !query || Object.values(row).some(val => {
                if (val == null || typeof val === "object") return false;
                return String(val).toLowerCase().includes(query);
            })
        );
        return [...filtered].sort((a, b) => {
            let va: any, vb: any;
            if (sortKey === "id")       { va = a.id_rumpun_pelatihan; vb = b.id_rumpun_pelatihan; }
            else if (sortKey === "name")    { va = a.name ?? ""; vb = b.name ?? ""; }
            else if (sortKey === "programs"){ va = a.programs?.length ?? 0; vb = b.programs?.length ?? 0; }
            else if (sortKey === "created") { va = a.created ?? ""; vb = b.created ?? ""; }
            else if (sortKey === "updated") { va = a.updated ?? ""; vb = b.updated ?? ""; }
            if (va < vb) return sortDir === "asc" ? -1 : 1;
            if (va > vb) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [data, searchQuery, sortKey, sortDir]);

    const totalPages = Math.ceil(filteredSortedData.length / itemsPerPage);
    const paginatedData = filteredSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = async (id: number, name: string) => {
        try {
            const res = await fetch(`${elautBaseUrl}/rumpun_pelatihan/delete_rumpun_pelatihan?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal");
            fetchRumpunPelatihan();
            Toast.fire({ icon: "success", title: "Berhasil!", text: `Klaster "${name}" berhasil dihapus.` });
        } catch {
            Toast.fire({ icon: "error", title: "Gagal!", text: "Gagal menghapus klaster pelatihan." });
        }
    };

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="inline-flex flex-col ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${sortKey === col && sortDir === "asc" ? "opacity-100 text-indigo-500" : "opacity-30"}`} />
            <ChevronDown className={`w-2.5 h-2.5 ${sortKey === col && sortDir === "desc" ? "opacity-100 text-indigo-500" : "opacity-30"}`} />
        </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                    <HashLoader color="#4f46e5" size={55} />
                </div>
                <div className="space-y-1">
                    <p className="text-slate-900 dark:text-white font-black text-base tracking-tight">Memuat Data Klaster Pelatihan...</p>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Sinkronisasi Database ELAUT</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3">
                    <TbActivity className="animate-pulse w-5 h-5 shrink-0" />
                    <span>Gagal memuat data: {error}</span>
                </div>
                <Button onClick={() => fetchRumpunPelatihan()} variant="outline" className="rounded-xl gap-2">
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-16 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full -mr-24 -mt-24 blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                            <TbLayersDifference className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border-none text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                                    <Sparkles className="w-3 h-3 mr-1 inline" /> Master Data
                                </Badge>
                                <span className="text-xs font-bold text-slate-400">• {filteredSortedData.length} Klaster</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                Klaster Pelatihan
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Kelola rumpun / klaster kategorisasi program pelatihan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Cari nama klaster..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="pl-10 pr-9 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {Cookies.get('Access')?.includes('superAdmin') && (
                            <ManageRumpunPelatihanAction onSuccess={fetchRumpunPelatihan} />
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
                                <th
                                    className="group px-6 py-4 text-left cursor-pointer select-none"
                                    onClick={() => handleSort("id")}
                                >
                                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                        No <SortIcon col="id" />
                                    </span>
                                </th>
                                <th
                                    className="group px-6 py-4 text-left cursor-pointer select-none"
                                    onClick={() => handleSort("name")}
                                >
                                    <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                        Nama Klaster <SortIcon col="name" />
                                    </span>
                                </th>
                                <th
                                    className="group px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => handleSort("programs")}
                                >
                                    <span className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Layers className="w-3 h-3 mr-1" /> Program <SortIcon col="programs" />
                                    </span>
                                </th>
                                <th
                                    className="group px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => handleSort("created")}
                                >
                                    <span className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                        <Calendar className="w-3 h-3 mr-1" /> Dibuat <SortIcon col="created" />
                                    </span>
                                </th>
                                <th
                                    className="group px-6 py-4 text-center cursor-pointer select-none"
                                    onClick={() => handleSort("updated")}
                                >
                                    <span className="flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                        Diperbarui <SortIcon col="updated" />
                                    </span>
                                </th>
                                {Cookies.get('Access')?.includes('superAdmin') && (
                                    <th className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedData.length > 0 ? paginatedData.map((row: any, idx: number) => {
                                    const color = rumpunColors[row.name] ?? defaultColor;
                                    const icon = rumpunIcons[row.name] ?? <TbBook size={18} className="text-slate-500" />;

                                    return (
                                        <motion.tr
                                            key={row.id_rumpun_pelatihan}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group border-b border-slate-50 dark:border-slate-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all duration-200"
                                        >
                                            {/* No */}
                                            <td className="px-6 py-4 align-middle">
                                                <span className="text-[11px] font-black text-slate-400 tabular-nums">
                                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                                </span>
                                            </td>

                                            {/* Name */}
                                            <td className="px-6 py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color.badge} border`}>
                                                        {icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                                                            {row.name}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            ID: {row.id_rumpun_pelatihan}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Programs count */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <Badge className={`${color.badge} ${color.badgeText} border text-xs font-black px-3 py-1 rounded-xl`}>
                                                    {row.programs?.length ?? 0} program
                                                </Badge>
                                            </td>

                                            {/* Created */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <span className="text-xs font-semibold text-slate-500">{formatDate(row.created)}</span>
                                            </td>

                                            {/* Updated */}
                                            <td className="px-6 py-4 align-middle text-center">
                                                <span className="text-xs font-semibold text-slate-500">{formatDate(row.updated)}</span>
                                            </td>

                                            {/* Actions */}
                                            {Cookies.get('Access')?.includes('superAdmin') && (
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <ManageRumpunPelatihanAction
                                                            onSuccess={fetchRumpunPelatihan}
                                                            initialData={row}
                                                        />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    title="Hapus Klaster"
                                                                    className="w-9 h-9 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="bg-white/90 backdrop-blur-2xl border-white rounded-[2.5rem] p-8 max-w-md shadow-2xl">
                                                                <AlertDialogHeader className="space-y-3">
                                                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
                                                                        <Trash2 className="w-6 h-6" />
                                                                    </div>
                                                                    <AlertDialogTitle className="font-black text-xl text-slate-900 tracking-tight">
                                                                        Hapus Klaster Pelatihan
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-xs font-medium text-slate-500">
                                                                        Apakah Anda yakin ingin menghapus klaster{" "}
                                                                        <span className="font-black text-slate-900">{row.name}</span>?{" "}
                                                                        Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi{" "}
                                                                        <span className="font-black text-rose-600">{row.programs?.length ?? 0} program</span> terkait.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="mt-6 gap-2">
                                                                    <AlertDialogCancel className="h-11 rounded-xl border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                                                        Batal
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(row.id_rumpun_pelatihan, row.name)}
                                                                        className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20"
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                                    <TbSearch className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Klaster Tidak Ditemukan</p>
                                                    <p className="text-xs text-slate-400 font-medium">Coba ubah kata kunci pencarian.</p>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="rounded-xl text-xs font-bold mt-1">
                                                    Reset Pencarian
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                        <p className="text-xs font-bold text-slate-500">
                            Halaman <span className="text-slate-900 dark:text-white">{currentPage}</span> dari{" "}
                            <span className="text-slate-900 dark:text-white">{totalPages}</span>
                            <span className="text-slate-400 ml-2">({filteredSortedData.length} total)</span>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-4 rounded-xl border-slate-200 text-xs font-bold disabled:opacity-40"
                            >
                                ← Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-4 rounded-xl border-slate-200 text-xs font-bold disabled:opacity-40"
                            >
                                Next →
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

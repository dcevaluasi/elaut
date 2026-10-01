"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";
import DeleteProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/DeleteProgramPelatihanAction";
import { findNameRumpunPelatihanById } from "@/utils/programs";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    TbShieldCheck,
    TbShip,
    TbSettings,
    TbFish,
    TbLeaf,
    TbGlobe,
    TbAnchor,
    TbBuildingFactory,
    TbUsersGroup,
    TbEngine,
    TbBook,
    TbActivity,
    TbSearch,
    TbFilter
} from "react-icons/tb";
import { ProgramPelatihan } from "@/types/program";
import { generatedDescriptionCertificateFull } from "@/utils/certificates";
import { canManageProgram, canManageProgramUPT } from "@/utils/permissions";
import { HashLoader } from "react-spinners";
import { Search, BookOpen, ChevronDown, Sparkles, X, FileText, RefreshCw } from "lucide-react";

const rumpunIcons: Record<string, JSX.Element> = {
    "Sistem Jaminan Mutu": <TbShieldCheck size={22} className="text-blue-600 dark:text-blue-400" />,
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": <TbShip size={22} className="text-indigo-600 dark:text-indigo-400" />,
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": <TbSettings size={22} className="text-emerald-600 dark:text-emerald-400" />,
    "Budi Daya": <TbFish size={22} className="text-cyan-600 dark:text-cyan-400" />,
    "Pengolahan dan Pemasaran": <TbBuildingFactory size={22} className="text-rose-600 dark:text-rose-400" />,
    "Konservasi dan Kemitigasian": <TbLeaf size={22} className="text-emerald-600 dark:text-emerald-400" />,
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)":
        <TbGlobe size={22} className="text-teal-600 dark:text-teal-400" />,
    "Pengawasan dan Kepelabuhan Perikanan": <TbAnchor size={22} className="text-sky-600 dark:text-sky-400" />,
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)":
        <TbUsersGroup size={22} className="text-amber-600 dark:text-amber-400" />,
    "Permesinan dan Mekanisasi": <TbEngine size={22} className="text-violet-600 dark:text-violet-400" />,
    default: <TbBook size={22} className="text-slate-500" />,
};

export default function TableProgramPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchProgramPelatihan } = useFetchDataProgramPelatihan();
    const { data: dataRumpunPelatihan } = useFetchDataRumpunPelatihan();

    const [openRumpun, setOpenRumpun] = useState<string | null>(null);
    const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>("ALL");
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    const { groupedData, totalCount } = useMemo(() => {
        if (!Array.isArray(data)) return { groupedData: {}, totalCount: 0 };

        const query = (searchQuery ?? "").toLowerCase();
        const filtered = data.filter((row) => {
            const matchesSearch = !query ||
                Object.values(row).some((val) => {
                    if (val == null) return false;
                    if (typeof val === "object") return false;
                    return String(val).toLowerCase().includes(query);
                });

            const rumpunName = findNameRumpunPelatihanById(
                dataRumpunPelatihan,
                row.id_rumpun_pelatihan.toString()
            )?.name || "Lainnya";

            const matchesClusterFilter = selectedClusterFilter === "ALL" || rumpunName === selectedClusterFilter;

            return matchesSearch && matchesClusterFilter;
        });

        const grouped = filtered.reduce((acc, row) => {
            const rumpunName = findNameRumpunPelatihanById(
                dataRumpunPelatihan,
                row.id_rumpun_pelatihan.toString()
            )?.name || "Lainnya";

            if (!acc[rumpunName]) acc[rumpunName] = [];
            acc[rumpunName].push(row);
            return acc;
        }, {} as Record<string, ProgramPelatihan[]>);

        return { groupedData: grouped, totalCount: filtered.length };
    }, [data, dataRumpunPelatihan, searchQuery, selectedClusterFilter]);

    const allClusterNames = useMemo(() => {
        if (!Array.isArray(dataRumpunPelatihan)) return [];
        return dataRumpunPelatihan.map((r: any) => r.name);
    }, [dataRumpunPelatihan]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                    <HashLoader color="#2563eb" size={55} />
                </div>
                <div className="space-y-1">
                    <p className="text-slate-900 dark:text-white font-black text-base tracking-tight">Memuat Data Program Pelatihan...</p>
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
                <Button onClick={() => fetchProgramPelatihan()} variant="outline" className="rounded-xl gap-2">
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <TbBook className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-none text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                                    <Sparkles className="w-3 h-3 mr-1 inline" /> Master Data
                                </Badge>
                                <span className="text-xs font-bold text-slate-400">• Total {totalCount} Program</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                Program Pelatihan
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Kelola struktur kurikulum, rumpun pelatihan, dan deskripsi sertifikasi digital.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1 sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Cari kode / nama program..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-9 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} />
                    </div>
                </div>

                {allClusterNames.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 mr-1">
                            <TbFilter className="w-4 h-4" />
                            <span>Rumpun:</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedClusterFilter("ALL")}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${selectedClusterFilter === "ALL"
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                        >
                            Semua Rumpun
                        </button>
                        {allClusterNames.map((name: string) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setSelectedClusterFilter(name)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${selectedClusterFilter === name
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {Object.entries(groupedData).map(([rumpunName, programs], idx) => {
                    const isOpen = openRumpun === rumpunName || searchQuery.trim() !== "" || selectedClusterFilter !== "ALL";

                    return (
                        <motion.div
                            key={rumpunName}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
                        >
                            <button
                                type="button"
                                className={`w-full flex items-center justify-between p-5 md:p-6 text-left transition-all ${isOpen
                                        ? "bg-blue-50/40 dark:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800"
                                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                                    }`}
                                onClick={() => setOpenRumpun(openRumpun === rumpunName ? null : rumpunName)}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        {rumpunIcons[rumpunName] || rumpunIcons.default}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white truncate uppercase tracking-tight">
                                            {rumpunName}
                                        </h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                            {programs.length} Program Pelatihan
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                    <Badge variant="outline" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900 hidden sm:inline-flex">
                                        {programs.length} Program
                                    </Badge>
                                    <div className={`p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 md:p-6 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
                                            {programs.map((row: ProgramPelatihan) => (
                                                <div key={row.id_program_pelatihan} className="space-y-2">
                                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md">
                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border-none font-mono text-[10px] px-2 py-0.5 uppercase font-bold">
                                                                    {row.abbrv_name || "PROG"}
                                                                </Badge>
                                                                <span className="text-[10px] font-bold text-slate-400">ID: {row.id_program_pelatihan}</span>
                                                            </div>

                                                            <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase leading-snug">
                                                                {row.name_indo}
                                                            </h4>
                                                            {row.name_english && (
                                                                <p className="text-xs font-semibold text-slate-400 italic">
                                                                    {row.name_english}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                            <Link
                                                                href={`/admin/lemdiklat/master/program-pelatihan/materi/${encodeURIComponent(row.name_indo)}`}
                                                                target="_blank"
                                                                className="h-9 px-3.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-200 dark:border-blue-900"
                                                            >
                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                <span>Materi</span>
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenRowId(openRowId === row.id_program_pelatihan ? null : row.id_program_pelatihan)}
                                                                className={`h-9 px-3.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${openRowId === row.id_program_pelatihan
                                                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900"
                                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                                                    }`}
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Deskripsi</span>
                                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openRowId === row.id_program_pelatihan ? "rotate-180" : ""}`} />
                                                            </button>

                                                            {(canManageProgram(rumpunName) || canManageProgramUPT(rumpunName)) && (
                                                                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                                                                    <ManageProgramPelatihanAction
                                                                        onSuccess={fetchProgramPelatihan}
                                                                        initialData={row}
                                                                    />
                                                                    <DeleteProgramPelatihanAction
                                                                        program={row}
                                                                        onSuccess={fetchProgramPelatihan}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {openRowId === row.id_program_pelatihan && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 text-xs border border-slate-800">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-1.5">
                                                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">STTPL HEADER (INDONESIA)</span>
                                                                            <p className="text-xs leading-relaxed text-slate-300 font-medium">
                                                                                {generatedDescriptionCertificateFull(row.description).desc_indo || "-"}
                                                                            </p>
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">STTPL HEADER (ENGLISH)</span>
                                                                            <p className="text-xs leading-relaxed text-slate-400 italic font-serif">
                                                                                {generatedDescriptionCertificateFull(row.description).desc_eng || "-"}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {(generatedDescriptionCertificateFull(row.description).body_indo || generatedDescriptionCertificateFull(row.description).body_eng) && (
                                                                        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {generatedDescriptionCertificateFull(row.description).body_indo && (
                                                                                <div className="space-y-1.5">
                                                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">CURRICULUM BODY (INDONESIA)</span>
                                                                                    <p className="text-xs leading-relaxed text-slate-300 font-medium">
                                                                                        {generatedDescriptionCertificateFull(row.description).body_indo}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {generatedDescriptionCertificateFull(row.description).body_eng && (
                                                                                <div className="space-y-1.5">
                                                                                    <span className="text-[10px] font-black text-emerald-400/70 uppercase tracking-widest block">CURRICULUM BODY (ENGLISH)</span>
                                                                                    <p className="text-xs leading-relaxed text-slate-400 italic font-serif">
                                                                                        {generatedDescriptionCertificateFull(row.description).body_eng}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {Object.keys(groupedData).length === 0 && (
                <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <TbSearch className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Program Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-400 font-medium">Coba ubah kata kunci pencarian atau filter rumpun pelatihan.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedClusterFilter("ALL");
                        }}
                        className="rounded-xl text-xs font-bold"
                    >
                        Reset Filter
                    </Button>
                </div>
            )}
        </div>
    );
}

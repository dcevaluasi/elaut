"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";
import DeleteProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/DeleteProgramPelatihanAction";
import { FiBookOpen, FiChevronDown, FiSearch } from "react-icons/fi";
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
    TbTrash,
    TbSearch,
} from "react-icons/tb";
import { ProgramPelatihan } from "@/types/program";
import { generatedDescriptionCertificateFull } from "@/utils/certificates";
import { canManageProgram, canManageProgramUPT } from "@/utils/permissions";
import { HashLoader } from "react-spinners";

const rumpunIcons: Record<string, JSX.Element> = {
    "Sistem Jaminan Mutu": <TbShieldCheck size={20} className="text-blue-500" />,
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": <TbShip size={20} className="text-indigo-500" />,
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": <TbSettings size={20} className="text-emerald-500" />,
    "Budi Daya": <TbFish size={20} className="text-cyan-500" />,
    "Pengolahan dan Pemasaran": <TbBuildingFactory size={20} className="text-rose-500" />,
    "Konservasi dan Kemitigasian": <TbLeaf size={20} className="text-green-600" />,
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)":
        <TbGlobe size={20} className="text-teal-500" />,
    "Pengawasan dan Kepelabuhan Perikanan": <TbAnchor size={20} className="text-sky-600" />,
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)":
        <TbUsersGroup size={20} className="text-orange-500" />,
    "Permesinan dan Mekanisasi": <TbEngine size={20} className="text-violet-500" />,
    default: <TbBook size={20} className="text-gray-400" />,
};

export default function TableProgramPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchProgramPelatihan } = useFetchDataProgramPelatihan();
    const { data: dataRumpunPelatihan } = useFetchDataRumpunPelatihan();

    const [openRumpun, setOpenRumpun] = useState<string | null>(null);

    const groupedData = useMemo(() => {
        if (!Array.isArray(data)) return {};

        const query = (searchQuery ?? "").toLowerCase();
        const filtered = data.filter((row) =>
            !query ||
            Object.values(row).some((val) => {
                if (val == null) return false;
                if (typeof val === "object") return false;
                return String(val).toLowerCase().includes(query);
            })
        );

        return filtered.reduce((acc, row) => {
            const rumpunName = findNameRumpunPelatihanById(
                dataRumpunPelatihan,
                row.id_rumpun_pelatihan.toString()
            )?.name || "Lainnya";

            if (!acc[rumpunName]) acc[rumpunName] = [];
            acc[rumpunName].push(row);
            return acc;
        }, {} as Record<string, any[]>);
    }, [data, dataRumpunPelatihan, searchQuery]);

    const [openRowId, setOpenRowId] = useState<number | null>(null);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <HashLoader color="#3b82f6" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Program Vault...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                <TbActivity className="animate-pulse" />
                Error: {error}
            </div>
            <Button onClick={() => fetchProgramPelatihan()} variant="outline" className="mt-4 rounded-xl">Retry Connection</Button>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm mt-8">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <TbBook size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Program Pelatihan</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manajemen data program pelatihan serta materi atau struktur kurikulum</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Cari program pelatihan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50/50 dark:bg-white/5 font-bold text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} />
                </div>
            </div>

            {/* List of Clusters */}
            <div className="grid grid-cols-1 gap-6">
                {Object.entries(groupedData).map(([rumpunName, programs], idx) => (
                    <motion.div
                        key={rumpunName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
                    >
                        {/* Rumpun Accordion Header */}
                        <button
                            className={`w-full flex items-center justify-between px-6 py-5 transition-all ${openRumpun === rumpunName ? "bg-blue-500/5" : "hover:bg-gray-50/50 dark:hover:bg-white/5"}`}
                            onClick={() => setOpenRumpun(openRumpun === rumpunName ? null : rumpunName)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${openRumpun === rumpunName ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-gray-50 text-slate-400"}`}>
                                    {rumpunIcons[rumpunName] || rumpunIcons.default}
                                </div>
                                <div className="text-left">
                                    <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{rumpunName}</span>
                                    <span className="text-[10px] font-black text-blue-500/60 dark:text-blue-400/60 uppercase tracking-widest">{programs.length} Specialized Programs</span>
                                </div>
                            </div>
                            <div className={`transition-transform duration-500 ${openRumpun === rumpunName ? "rotate-180" : ""}`}>
                                <FiChevronDown className="text-slate-300" size={20} />
                            </div>
                        </button>

                        {/* Program Expansion Area */}
                        <AnimatePresence>
                            {openRumpun === rumpunName && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/5"
                                >
                                    <div className="p-4 md:p-6 space-y-4">
                                        {programs.map((row: ProgramPelatihan, pIdx) => (
                                            <div key={row.id_program_pelatihan} className="relative group/row">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all">

                                                    {/* Program Info */}
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{row.abbrv_name || "N/A"}</span>
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{row.name_indo}</h3>
                                                        <p className="text-[11px] font-medium text-slate-400 italic font-serif tracking-wide">{row.name_english}</p>
                                                    </div>

                                                    {/* Control Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

                                                        <Link
                                                            href={`/admin/lemdiklat/master/program-pelatihan/materi/${row.name_indo}`}
                                                            target="_blank"
                                                            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all text-xs font-black uppercase tracking-widest group/link"
                                                        >
                                                            <FiBookOpen className="group-hover/link:translate-y-[-1px] transition-transform" />
                                                            Materi
                                                        </Link>

                                                        <button
                                                            onClick={() => setOpenRowId(openRowId === row.id_program_pelatihan ? null : row.id_program_pelatihan)}
                                                            className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${openRowId === row.id_program_pelatihan ? "bg-slate-900 text-white border-slate-900" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 hover:border-slate-400"}`}
                                                        >
                                                            Description
                                                            <FiChevronDown className={`transition-transform duration-300 ${openRowId === row.id_program_pelatihan ? "rotate-180" : ""}`} />
                                                        </button>

                                                        {(canManageProgram(rumpunName) || canManageProgramUPT(rumpunName)) && (
                                                            <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-white/5">
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

                                                {/* Meta Description Dropdown */}
                                                <AnimatePresence>
                                                    {openRowId === row.id_program_pelatihan && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden mt-2"
                                                        >
                                                            <div className="mx-4 p-6 bg-slate-900 rounded-2xl text-white/90 space-y-6 shadow-2xl border border-white/5 relative">
                                                                <div className="absolute top-0 right-0 p-4">
                                                                    <TbActivity className="text-white/20 animate-pulse" size={40} />
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div className="space-y-4">
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-2">STTPL HEADER (IND)</span>
                                                                            <p className="text-xs leading-relaxed font-medium text-white/70">{generatedDescriptionCertificateFull(row.description).desc_indo}</p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">STTPL HEADER (ENG)</span>
                                                                            <p className="text-xs leading-relaxed italic text-white/50">{generatedDescriptionCertificateFull(row.description).desc_eng}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4 pt-4 md:pt-0 md:pl-8 md:border-l md:border-white/10">
                                                                        {generatedDescriptionCertificateFull(row.description).body_indo && (
                                                                            <div className="space-y-1">
                                                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-2">CURRICULUM BODY (IND)</span>
                                                                                <p className="text-xs leading-relaxed font-medium text-white/70">{generatedDescriptionCertificateFull(row.description).body_indo}</p>
                                                                            </div>
                                                                        )}
                                                                        {generatedDescriptionCertificateFull(row.description).body_eng && (
                                                                            <div className="space-y-1">
                                                                                <span className="text-[10px] font-black text-emerald-400/50 uppercase tracking-[0.2em] block mb-2">CURRICULUM BODY (ENG)</span>
                                                                                <p className="text-xs leading-relaxed italic text-white/50">{generatedDescriptionCertificateFull(row.description).body_eng}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
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
                ))}
            </div>

            {Object.keys(groupedData).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                    <TbSearch size={48} className="text-gray-300" />
                    <div className="text-center">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Programs Found</p>
                        <p className="text-xs font-medium text-slate-300 mt-1">Try adjusting your search sequence or adding a new program.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

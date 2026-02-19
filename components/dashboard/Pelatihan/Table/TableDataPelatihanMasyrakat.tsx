
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiInformationFill, RiVerifiedBadgeFill } from "react-icons/ri";
import { PelatihanMasyarakat } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
    Users,
    BookOpen,
    Calendar,
    MapPin,
    Tag,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Settings,
    Activity,
    ShieldCheck,
    Globe2,
} from "lucide-react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { getStatusInfo } from "@/utils/text";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { motion, AnimatePresence } from "framer-motion";

const VerifikatorName = ({ id }: { id: string | number }) => {
    const { adminPusatData, loading } = useFetchDataPusatById(id);

    if (loading) return (
        <div className="flex items-center gap-2 mt-2 px-2.5 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest">Sinkronisasi</span>
        </div>
    );

    if (!adminPusatData) return null;

    return (
        <div className="group/verif relative flex items-center gap-2.5 mt-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-white/5 transition-all duration-500 hover:shadow-sm">
            <div className="relative">
                <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center text-[9px] font-black text-white shadow-md ring-2 ring-white dark:ring-slate-950">
                    {adminPusatData.Nama.charAt(0).toUpperCase()}
                </div>
            </div>
            <div className="flex flex-col text-left">
                <span className="text-[8px] font-bold text-blue-500/70 uppercase tracking-wider leading-none mb-0.5">Verifikator Resmi</span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px] leading-tight">
                    {adminPusatData.Nama}
                </span>
            </div>
            <RiVerifiedBadgeFill className="text-blue-500 w-3 h-3 ml-0.5" />
        </div >
    );
};

interface TableDataPelatihanMasyarakatProps {
    data: PelatihanMasyarakat[];
    generateTanggalPelatihan: (date: string) => string;
    encryptValue: (val: string) => string;
}

const TableDataPelatihanMasyarakat: React.FC<TableDataPelatihanMasyarakatProps> = ({
    data,
    generateTanggalPelatihan,
    encryptValue,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = data
        .sort((a, b) => {
            const aStatus = String(a.StatusPenerbitan);
            const bStatus = String(b.StatusPenerbitan);
            if (aStatus === "1") return -1;
            if (bStatus === "1") return 1;
            return 0;
        })
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="relative group/table container-fluid">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 blur-3xl opacity-0 group-hover/table:opacity-100 transition-opacity duration-1000 -z-10" />

                <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-700">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01]">
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center w-20">UID</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left">Pelatihan / Institusi</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Metrik & Klasifikasi</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Verifikator</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right w-44">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/[0.02]">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {paginatedData.map((pelatihan: PelatihanMasyarakat, index: number) => {
                                        const { label, color, icon } = getStatusInfo(String(pelatihan.StatusPenerbitan));

                                        return (
                                            <motion.tr
                                                key={pelatihan.IdPelatihan}
                                                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                                transition={{ duration: 0.5, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
                                                className="group/row relative hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all duration-500 border-l-4 border-l-transparent hover:border-l-blue-500"
                                            >
                                                <td className="px-6 py-6 text-center">
                                                    <span className="text-[11px] font-bold text-slate-300 dark:text-slate-700 group-hover/row:text-blue-600 transition-colors">
                                                        {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="text-[10px] font-black text-blue-500/80 tracking-tighter shrink-0 py-0.5 px-2 bg-blue-500/5 rounded-md border border-blue-500/10 uppercase">
                                                                    ID-{pelatihan.KodePelatihan.slice(0, 5)}
                                                                </span>
                                                                <div className="h-px bg-slate-200 dark:bg-white/5 flex-grow group-hover/row:bg-blue-500/20 transition-all duration-700" />
                                                            </div>
                                                            <h3 className="text-[15px] font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight group-hover/row:translate-x-2 transition-transform duration-500">
                                                                {pelatihan.NamaPelatihan}
                                                            </h3>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                                                            <div className="flex items-center gap-2 group/meta">
                                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/row:text-blue-500 transition-colors">
                                                                    <Calendar size={12} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                                    {pelatihan.TanggalMulaiPelatihan ? generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan) : "PENDING"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 group-hover/row:text-emerald-500 transition-colors">
                                                                    <MapPin size={12} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate max-w-[180px]">
                                                                    {pelatihan.LokasiPelatihan || "DIGITAL HUB"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 group-hover/row:border-blue-500/20 transition-all">
                                                                <Globe2 size={10} className="text-blue-400" />
                                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
                                                                    {pelatihan.PenyelenggaraPelatihan}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <div className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black rounded-full border border-indigo-500/20 uppercase tracking-tighter">
                                                                {pelatihan.JenisProgram}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <div className="relative group/users">
                                                                <div className="absolute -inset-1 bg-emerald-500/20 blur opacity-0 group-hover/row:opacity-100 transition-opacity rounded-full" />
                                                                <div className="relative flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                                                    <Users size={12} className="text-emerald-500" />
                                                                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">{pelatihan.UserPelatihan?.length ?? 0}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 ml-1">KAPASITAS</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-center">
                                                    <div className="inline-flex flex-col items-center min-w-[120px]">
                                                        {pelatihan.VerifikatorPelatihan ? (
                                                            <VerifikatorName id={pelatihan.VerifikatorPelatihan} />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1.5 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                                                                    <Activity size={18} className="text-slate-400" />
                                                                </div>
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Belum Ditentukan</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-center min-w-[180px]">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`
                                                            group/status relative flex items-center gap-2.5 px-4 py-2 rounded-xl shadow-sm border
                                                            ${color} transition-all duration-500
                                                        `}>
                                                            <span>{icon}</span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                                                            <div className="ml-1 w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {(Cookies.get('Access')?.includes('isSigning') || Cookies.get('Access')?.includes('verifyPelaksanaan') || Cookies.get('Access')?.includes('supervisePelaksanaan')) && (
                                                            <Link
                                                                href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(pelatihan.IdPelatihan.toString())}`}
                                                                className="group/btn relative overflow-hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-lg transition-all"
                                                            >
                                                                <span className="tracking-wider text-[9px]">TINJAU DETAIL</span>
                                                                <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                            </Link>
                                                        )}

                                                        {Cookies.get('Access')?.includes('createPelatihan') && (
                                                            <Link
                                                                href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(pelatihan.IdPelatihan.toString())}`}
                                                                className="group/btn relative overflow-hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-md hover:shadow-lg transition-all"
                                                            >
                                                                <Settings size={12} className="group-hover:rotate-90 transition-transform" />
                                                                <span className="tracking-wider text-[9px]">KELOLA</span>
                                                            </Link>
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

                    {paginatedData.length === 0 && (
                        <div className="py-32 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01]">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative flex items-center justify-center p-8 bg-slate-100 dark:bg-white/5 rounded-[40px] mb-6 border-2 border-dashed border-slate-200 dark:border-white/10"
                            >
                                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                <div className="absolute inset-0 bg-blue-500/5 blur-3xl animate-pulse" />
                            </motion.div>
                            <h4 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-widest mb-2">Zero Records Found</h4>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">System Ready. Please modify active filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Futuristic Digital Pagination */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 px-8 py-4">
                <div className="flex flex-col items-center lg:items-start space-y-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">System Telemetry</span>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-black/5 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Visible</span>
                            <span className="text-xs font-black text-blue-500 leading-none">{Math.min(paginatedData.length, itemsPerPage)} Units</span>
                        </div>
                        <div className="w-px h-6 bg-slate-300 dark:bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Database</span>
                            <span className="text-xs font-black dark:text-white leading-none">{data.length} Total</span>
                        </div>
                    </div>
                </div>

                <div className="relative group/pagi flex items-center gap-4 p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[30px] shadow-2xl shadow-black/5">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 transition-all hover:-translate-x-1"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2 px-2 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`
                                    min-w-[44px] h-[44px] rounded-[18px] text-[12px] font-black transition-all duration-500 transform
                                    ${currentPage === i + 1
                                        ? "bg-blue-600 text-white shadow-[0_8px_20px_-4px_rgba(37,99,235,0.4)] scale-110 z-10"
                                        : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-400"
                                    }
                                `}
                            >
                                {(i + 1).toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-black/5 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-20 transition-all hover:translate-x-1"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableDataPelatihanMasyarakat;

'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, CalendarDays, BookOpen, Clock, CheckCircle2, ArrowUpRight } from "lucide-react"
import { PelatihanMasyarakat } from "@/types/product"
import React from "react"
import { parseIndonesianDate } from "@/utils/time"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { encryptValue } from "@/lib/utils"

interface MetricsSummaryPelatihanProps {
    data: PelatihanMasyarakat[];
    tahun: string;
}

const MetricsSummaryPelatihan: React.FC<MetricsSummaryPelatihanProps> = ({ data, tahun }) => {
    const pathname = usePathname()
    const adminBase = pathname.includes('pusat') ? 'pusat' : 'lemdiklat'

    // ================== Filter ==================
    const filteredData = React.useMemo(() => {
        return data.filter((item: PelatihanMasyarakat) => {
            if (!item.TanggalMulaiPelatihan) return false;
            let d = new Date(item.TanggalMulaiPelatihan);
            if (isNaN(d.getTime())) {
                d = parseIndonesianDate(item.TanggalMulaiPelatihan) as Date;
            }
            if (!d || isNaN(d.getTime())) return false;
            const itemTahun = String(d.getFullYear());
            if (tahun && itemTahun !== tahun) return false;
            return true;
        });
    }, [data, tahun]);

    // ================== Metrics ==================
    const now = new Date();

    const ongoingData = filteredData.filter((item) => {
        if (!item.TanggalMulaiPelatihan || !item.TanggalBerakhirPelatihan) return false;
        const start = new Date(item.TanggalMulaiPelatihan);
        const end = new Date(item.TanggalBerakhirPelatihan);
        return start <= now && end >= now && item?.StatusPenerbitan == "4";
    });

    const upcomingData = filteredData.filter((item) => {
        if (!item.TanggalMulaiPelatihan) return false;
        const start = new Date(item.TanggalMulaiPelatihan);
        return start > now && item?.StatusPenerbitan == "4";
    });

    const completedData = filteredData.filter((item) => {
        if (!item.TanggalBerakhirPelatihan) return false;
        const end = new Date(item.TanggalBerakhirPelatihan);
        const isClosed = parseInt(item?.StatusPenerbitan) >= 5;
        return end < now && isClosed;
    });

    const pendingData = filteredData.filter((item) => {
        return ["7A", "7B", "8", "10", "12", "14"].includes(item?.StatusPenerbitan);
    });

    // ================== Ongoing list with progress ==================
    const ongoingTrainings = React.useMemo(() => {
        return ongoingData.map((item) => {
            let startStr = item.TanggalMulaiPelatihan || "";
            let endStr = item.TanggalBerakhirPelatihan || "";

            if (startStr.includes(" - ")) {
                const parts = startStr.split(" - ").map((s: string) => s.trim());
                startStr = parts[0];
                endStr = parts[1];
            }

            const normalizeDate = (d: Date) => {
                const nd = new Date(d);
                nd.setHours(0, 0, 0, 0);
                return nd;
            };

            const startDate = normalizeDate(new Date(startStr));
            const endDate = normalizeDate(new Date(endStr));
            const today = normalizeDate(new Date());
            let progress = 0;

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
                const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                if (today < startDate) progress = 0;
                else if (today > endDate) progress = 100;
                else progress = Math.round((daysPassed / totalDays) * 100);
            }

            return {
                id: item.IdPelatihan,
                code: item.KodePelatihan,
                title: item.NamaPelatihan,
                lokasi: item.LokasiPelatihan ?? "-",
                penyelenggara: item.PenyelenggaraPelatihan ?? "-",
                participants: item.UserPelatihan?.length ?? 0,
                progress,
            };
        }).sort((a, b) => b.participants - a.participants);
    }, [ongoingData]);

    return (
        <div className="flex flex-col gap-4 w-full h-full">

            {/* ── Metric cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
                {/* Akan Berlangsung */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5 hover:border-teal-200 transition-colors group">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Akan Datang</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-0.5">{upcomingData.length}</p>
                    </div>
                </div>

                {/* Sedang Berlangsung */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5 hover:border-blue-200 transition-colors group">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Berlangsung</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-0.5">{ongoingData.length}</p>
                    </div>
                </div>

                {/* Telah Selesai */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5 hover:border-emerald-200 transition-colors group">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selesai</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-0.5">{completedData.length}</p>
                    </div>
                </div>

                {/* Pending STTPL */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5 hover:border-amber-200 transition-colors group">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending STTPL</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-0.5">{pendingData.length}</p>
                    </div>
                </div>
            </div>

            {/* ── Ongoing trainings list ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-blue-500 rounded-full" />
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">Pelatihan Berlangsung</h4>
                    </div>
                    {ongoingTrainings.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                            {ongoingTrainings.length} aktif
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-auto max-h-[340px] custom-scrollbar">
                    {ongoingTrainings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                                <CalendarDays className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Tidak ada pelatihan aktif</p>
                            <p className="text-xs text-slate-400 mt-1">Pelatihan yang sedang berjalan akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {ongoingTrainings.map((training) => (
                                <div key={training.id} className="px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                                    {/* Title + link */}
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <Link
                                            href={`/admin/${adminBase}/pelatihan/detail/${training.code}/${encryptValue(training.id.toString())}`}
                                            className="text-sm font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors flex-1"
                                        >
                                            {training.title}
                                        </Link>
                                        <Link
                                            href={`/admin/${adminBase}/pelatihan/detail/${training.code}/${encryptValue(training.id.toString())}`}
                                            className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2.5">
                                        <span className="truncate">{training.lokasi}</span>
                                        <span className="text-slate-300">·</span>
                                        <span className="flex items-center gap-1 flex-shrink-0">
                                            <Users className="w-3 h-3" />
                                            {training.participants}
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Progress value={training.progress} className="h-1.5" />
                                        </div>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${training.progress >= 80
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : training.progress >= 40
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                                            }`}>
                                            {training.progress}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetricsSummaryPelatihan;

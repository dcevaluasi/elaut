'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, CalendarDays, BookOpen, Clock } from "lucide-react"
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
    const totalTrainings = filteredData.length;

    const totalParticipants = filteredData.reduce(
        (sum, item) => sum + (item.JumlahPeserta ?? 0),
        0
    );

    const now = new Date();

    // Sedang berlangsung
    const ongoingData = filteredData.filter((item) => {
        if (!item.TanggalMulaiPelatihan || !item.TanggalBerakhirPelatihan) return false;
        const start = new Date(item.TanggalMulaiPelatihan);
        const end = new Date(item.TanggalBerakhirPelatihan);
        return start <= now && end >= now && item?.StatusPenerbitan == "4";
    });

    // Akan berlangsung (belum mulai)
    const upcomingData = filteredData.filter((item) => {
        if (!item.TanggalMulaiPelatihan) return false;
        const start = new Date(item.TanggalMulaiPelatihan);
        return start > now && item?.StatusPenerbitan == "4";
    });

    // Telah selesai
    const completedData = filteredData.filter((item) => {
        if (!item.TanggalBerakhirPelatihan) return false;
        const end = new Date(item.TanggalBerakhirPelatihan);
        const isClosed = parseInt(item?.StatusPenerbitan) >= 5

        return end < now && isClosed;
    });

    // Pending STTPL
    const pendingData = filteredData.filter((item) => {
        const isPending = ["7A", "7B", "8", "10", "12", "14"].includes(item?.StatusPenerbitan);

        return isPending;
    });


    const metrics = [
        { title: "Akan Berlangsung", value: upcomingData.length, icon: CalendarDays, color: 'teal' },
        { title: "Sedang Berlangsung", value: ongoingData.length, icon: BookOpen, color: 'blue' },
        { title: "Telah Selesai", value: completedData.length, icon: Users, color: 'indigo' },
        { title: "Pending STTPL", value: pendingData.length, icon: Clock, color: 'amber' },
    ];


    const ongoingTrainings = ongoingData.map((item, idx) => {
        // Handle combined date string like "2025-07-23 - 2025-07-30"
        let startStr = item.TanggalMulaiPelatihan || "";
        let endStr = item.TanggalBerakhirPelatihan || "";

        // If TanggalMulaiPelatihan actually contains both dates (e.g. "2025-07-23 - 2025-07-30")
        if (startStr.includes(" - ")) {
            const parts = startStr.split(" - ").map((s: string) => s.trim());
            startStr = parts[0];
            endStr = parts[1];
        }

        // Validate
        const isValidDate = (d: Date) => !isNaN(d.getTime());
        let progress = 0;

        const normalizeDate = (d: Date) => {
            const nd = new Date(d);
            nd.setHours(0, 0, 0, 0);
            return nd;
        };

        const startDate = normalizeDate(new Date(startStr));
        const endDate = normalizeDate(new Date(endStr));
        const today = normalizeDate(new Date());

        if (isValidDate(startDate) && isValidDate(endDate)) {
            const totalDays = Math.max(
                1,
                Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            const daysPassed = Math.floor(
                (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (today < startDate) progress = 0;
            else if (today > endDate) progress = 100;
            else progress = Math.round((daysPassed / totalDays) * 100);
        }

        return {
            id: item.IdPelatihan,
            code: item.KodePelatihan,
            title: item.NamaPelatihan,
            batch: item.LokasiPelatihan ?? "-",
            penyelenggara: item.PenyelenggaraPelatihan ?? "-",
            participants: item.UserPelatihan?.length ?? 0,
            progress,
            status: "Berlangsung",
        };
    }).sort((a, b) => b.participants - a.participants);





    return (
        <div className="flex flex-col gap-4 w-full h-full">
            {metrics.map((item) => (
                <Card key={item.title} className={`shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:border-${item.color}-200 transition-colors group`}>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.title}</p>
                            <div className="text-2xl font-black text-slate-800 dark:text-white flex items-baseline gap-1">
                                {item.value}
                                <span className="text-xs font-medium text-slate-400">Total</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Ongoing Training Snippet */}
            <Card className="shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex-1 flex flex-col">
                <CardHeader className="p-5 pb-2 border-b border-slate-50 dark:border-slate-800">
                    <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">Pelatihan Berlangsung</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto max-h-[300px] custom-scrollbar">
                    {ongoingTrainings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                            <CalendarDays className="h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-500">
                                Tidak ada pelatihan aktif saat ini
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {ongoingTrainings.map((training) => (
                                <div key={training.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <Link href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${training.code}/${encryptValue(training.id.toString())}`} className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            {training.title}
                                        </Link>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                        <span>{training.batch}</span>
                                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{training.progress}%</span>
                                    </div>
                                    <Progress value={training.progress} className="h-1.5" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MetricsSummaryPelatihan;

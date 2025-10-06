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

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        const today = new Date();

        // Validate
        const isValidDate = (d: Date) => !isNaN(d.getTime());
        let progress = 0;

        if (isValidDate(startDate) && isValidDate(endDate)) {
            const totalDays = Math.max(
                1,
                Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            );

            const daysPassed = Math.ceil(
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
    });




    return (
        <div className="gap-5 flex w-full">
            {/* Metrics */}
            <div className="flex flex-col gap-5">
                {metrics.map((item) => (
                    <Card key={item.title} className="shadow-sm border rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold text-${item.color}-500`}>{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Ongoing Training List */}
            <Card className="shadow-sm border rounded-2xl flex-1">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ongoing Trainings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {ongoingTrainings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6  rounded-xl border border-dashed border-gray-300 text-center">
                            <CalendarDays className="h-10 w-10 text-blue-500 mb-3" />
                            <p className="text-base font-medium text-gray-700 leading-none mb-1">
                                Tidak ada pelatihan yang sedang berlangsung
                            </p>
                            <p className="text-sm text-gray-500">
                                Nantikan jadwal pelatihan terbaru tahun ini 🚀
                            </p>
                        </div>
                    ) : (
                        ongoingTrainings.map((training) => (
                            <div
                                key={training.id}
                                className="space-y-2 border-b last:border-0 pb-4 last:pb-0"
                            >
                                <div className="flex items-center justify-between">
                                    <Link href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${training.code}/${encryptValue(
                                        training.id.toString()
                                    )}`} className="font-medium text-base">{training.title}</Link>
                                    <Badge variant="secondary">{training.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{training.batch}</p>
                                <p className="text-sm text-muted-foreground">{training.penyelenggara}</p>
                                <Progress value={training.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {training.participants} participants • {training.progress}% pelaksanaan
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MetricsSummaryPelatihan;

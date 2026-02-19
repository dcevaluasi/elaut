"use client";

import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import TablePenetapanP2MKP from "@/components/dashboard/P2MKP/Table/TablePenetapanP2MKP";
import { TbGavel, TbFileCheck, TbClock, TbAlertTriangle } from "react-icons/tb";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { useMemo } from "react";

export default function Page() {
    const { data: pengajuanData } = useFetchDataPengajuanPenetapan();

    const stats = useMemo(() => {
        if (!pengajuanData) return { total: 0, approved: 0, pending: 0, revision: 0 };
        return {
            total: pengajuanData.length,
            approved: pengajuanData.filter(d => d.status?.toLowerCase() === "disetujui").length,
            pending: pengajuanData.filter(d => d.status?.toLowerCase() === "pending" || d.status?.toLowerCase() === "diajukan").length,
            revision: pengajuanData.filter(d => d.status?.toLowerCase() === "perbaikan").length,
        };
    }, [pengajuanData]);

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col gap-8 pb-10">
                {/* Page Header */}
                <HeaderPageLayoutAdminElaut
                    title="Penetapan P2MKP"
                    description="Kelola dan cetak sertifikat penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) yang telah diverifikasi."
                    icon={<TbGavel className="text-2xl text-white" />}
                />

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-0">
                    <StatCard
                        title="Total Pengajuan"
                        value={stats.total}
                        icon={<TbGavel className="text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        title="Disetujui"
                        value={stats.approved}
                        icon={<TbFileCheck className="text-emerald-600" />}
                        color="bg-emerald-50"
                    />
                    <StatCard
                        title="Menunggu"
                        value={stats.pending}
                        icon={<TbClock className="text-amber-600" />}
                        color="bg-amber-50"
                    />
                    <StatCard
                        title="Perbaikan"
                        value={stats.revision}
                        icon={<TbAlertTriangle className="text-rose-600" />}
                        color="bg-rose-50"
                    />
                </div>

                {/* Data Table Area */}
                <article className="w-full">
                    <TablePenetapanP2MKP />
                </article>
            </section>
        </LayoutAdminElaut>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className={`p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02] bg-white/40 backdrop-blur-sm`}>
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl shadow-inner`}>
                {icon}
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
                <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
        </div>
    );
}

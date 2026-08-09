"use client";

import React, { useMemo } from "react";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { motion } from "framer-motion";
import {
    Building2, MapPin, CheckCircle2, Clock, AlertCircle,
    TrendingUp, Award, Layers, Briefcase, ShieldCheck,
    Users, Globe, BarChart3, FileText, Activity,
    ArrowUpRight, Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HashLoader } from "react-spinners";

const DashboardP2MKP = () => {
    const { data: p2mkpData, loading: loadingP2MKP } = useFetchDataP2MKP();
    const { data: penetapanData, loading: loadingPenetapan } = useFetchDataPengajuanPenetapan();

    const loading = loadingP2MKP || loadingPenetapan;

    // ── Core Statistics ───────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const p2mkp = p2mkpData.filter(d => (d.status || "").toLowerCase() === "approved") || [];
        const penetapan = penetapanData || [];

        const totalP2MKP = p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").length;
        const approvedP2MKP = p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").length;
        const totalPengajuan = penetapan.filter(d => !!(d.id_Ppmkp || d.nama_Ppmkp)).length;
        const approvedPenetapan = penetapan.filter(d => d.status?.toLowerCase() === "approved").length;
        const pendingPenetapan = penetapan.filter(d => !d.status || d.status === "" || d.status?.toLowerCase() === "diajukan" || d.status?.toLowerCase() === "pending").length;
        const revisionPenetapan = penetapan.filter(d => d.status?.toLowerCase() === "perbaikan").length;

        // Breakdown by klasifikasi (Approved only)
        const klasifikasiBreakdown: Record<string, number> = {};
        p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").forEach(d => {
            const k = (d as any).klasifikasi || d.klasiikasi || "Belum Ditetapkan";
            klasifikasiBreakdown[k] = (klasifikasiBreakdown[k] || 0) + 1;
        });

        // Breakdown by kepemilikan (Approved only)
        const kepemilikanBreakdown: Record<string, number> = {};
        p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").forEach(d => {
            const k = d.status_kepemilikan || "Tidak Diketahui";
            kepemilikanBreakdown[k] = (kepemilikanBreakdown[k] || 0) + 1;
        });

        // Top 5 Provinsi by jumlah approved P2MKP
        const provinsiCount: Record<string, number> = {};
        p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").forEach(d => {
            if (d.provinsi) {
                provinsiCount[d.provinsi] = (provinsiCount[d.provinsi] || 0) + 1;
            }
        });
        const topProvinsi = Object.entries(provinsiCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Top 5 Kota
        const kotaCount: Record<string, number> = {};
        p2mkp.filter(d => (d.status || "").toLowerCase() === "approved").forEach(d => {
            if (d.kota) {
                kotaCount[d.kota] = (kotaCount[d.kota] || 0) + 1;
            }
        });
        const topKota = Object.entries(kotaCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const totalProvinsi = Object.keys(provinsiCount).length;
        const totalKota = Object.keys(kotaCount).length;

        // LPK vs Non-LPK
        const lpkCount = p2mkp.filter(d => d.is_lpk === "Ya").length;
        const nonLpkCount = p2mkp.filter(d => d.is_lpk !== "Ya").length;

        // Penetration rate
        const penetrationRate = totalP2MKP > 0 ? Math.round((approvedP2MKP / totalP2MKP) * 100) : 0;
        const approvalRatePenetapan = totalPengajuan > 0 ? Math.round((approvedPenetapan / totalPengajuan) * 100) : 0;

        return {
            totalP2MKP, approvedP2MKP, totalPengajuan,
            approvedPenetapan, pendingPenetapan, revisionPenetapan,
            klasifikasiBreakdown, kepemilikanBreakdown,
            topProvinsi, topKota,
            totalProvinsi, totalKota,
            lpkCount, nonLpkCount,
            penetrationRate, approvalRatePenetapan,
        };
    }, [p2mkpData, penetapanData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    if (loading) return (
        <div className="py-32 w-full flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <HashLoader color="#3b82f6" size={56} />
                <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">
                Memuat Data P2MKP Dashboard...
            </p>
        </div>
    );

    const klassColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
        mula: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
        madya: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
        utama: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
    };

    const getKlasifikasiColor = (k: string) => {
        const lower = k.toLowerCase();
        for (const [key, val] of Object.entries(klassColors)) {
            if (lower.includes(key)) return val;
        }
        return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-12"
        >
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/50 shadow-sm transition-all duration-500 hover:shadow-md">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter">P2MKP</h2>
                    <p className="text-sm font-medium text-slate-500">Monitoring data penetapan dan klasifikasi P2MKP</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* ── Hero KPI Cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total P2MKP */}
                <motion.div variants={cardVariants}>
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-none rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow duration-500">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full blur-xl" />
                        <CardContent className="p-5 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="flex items-center gap-1 text-[9px] font-black text-blue-200 uppercase tracking-wider">
                                    <Activity className="w-3 h-3" /> Terdaftar
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Total Lembaga P2MKP</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">{stats.totalP2MKP}</span>
                                    <span className="text-[11px] font-bold text-blue-200">Lembaga</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/15">
                                    <span className="text-[10px] font-bold text-blue-200 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                        {stats.approvedP2MKP} telah ditetapkan
                                        <span className="ml-auto text-emerald-300 font-black">{stats.penetrationRate}%</span>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pengajuan Penetapan */}
                <motion.div variants={cardVariants}>
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 border-none rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow duration-500">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-5 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-100 uppercase tracking-wider">
                                    <Zap className="w-3 h-3" /> Penetapan
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-1">Total Pengajuan</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">{stats.totalPengajuan}</span>
                                    <span className="text-[11px] font-bold text-emerald-100">Pengajuan</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/15">
                                    <span className="text-[10px] font-bold text-emerald-100 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                        {stats.approvedPenetapan} disetujui
                                        <span className="ml-auto text-white font-black">{stats.approvalRatePenetapan}%</span>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Cakupan Wilayah */}
                <motion.div variants={cardVariants}>
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 border-none rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow duration-500">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                        <CardContent className="p-5 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <span className="flex items-center gap-1 text-[9px] font-black text-amber-100 uppercase tracking-wider">
                                    <MapPin className="w-3 h-3" /> Wilayah
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mb-1">Cakupan Wilayah</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">{stats.totalProvinsi}</span>
                                    <span className="text-[11px] font-bold text-amber-100">Provinsi</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/15">
                                    <span className="text-[10px] font-bold text-amber-100 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-white" />
                                        {stats.totalKota} Kota / Kabupaten
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Menunggu Review */}
                <motion.div variants={cardVariants}>
                    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-none rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-500">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                        <CardContent className="p-5 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <Activity className="w-3 h-3" /> Status
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Review & Perbaikan</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">{stats.pendingPenetapan}</span>
                                    <span className="text-[11px] font-bold text-slate-400">Menunggu</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                        {stats.revisionPenetapan} perlu perbaikan
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── Main Content Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Penetapan Status Breakdown */}
                <motion.div variants={cardVariants} className="lg:col-span-1">
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                                    <BarChart3 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Status Penetapan</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distribusi status pengajuan</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-4">
                            {[
                                { label: "Disetujui", value: stats.approvedPenetapan, color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
                                { label: "Menunggu Review", value: stats.pendingPenetapan, color: "bg-amber-400", light: "bg-amber-50", text: "text-amber-700", icon: <Clock className="w-4 h-4 text-amber-500" /> },
                                { label: "Perlu Perbaikan", value: stats.revisionPenetapan, color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-700", icon: <AlertCircle className="w-4 h-4 text-rose-500" /> },
                            ].map((item) => {
                                const pct = stats.totalPengajuan > 0 ? (item.value / stats.totalPengajuan) * 100 : 0;
                                return (
                                    <div key={item.label} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className={`flex items-center gap-2 px-2.5 py-1 ${item.light} rounded-lg border border-transparent`}>
                                                {item.icon}
                                                <span className={`text-[11px] font-black ${item.text} uppercase tracking-wider`}>{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-800">{item.value}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{pct.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                className={`h-full ${item.color} rounded-full`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* LPK vs Non-LPK */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Klasifikasi LPK</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100/80 text-center">
                                        <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <span className="text-2xl font-black text-blue-700">{stats.lpkCount}</span>
                                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider mt-0.5">LPK</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <Briefcase className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                                        <span className="text-2xl font-black text-slate-700">{stats.nonLpkCount}</span>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Non-LPK</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* CENTER + RIGHT: Klasifikasi & Kepemilikan */}
                <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
                    {/* Klasifikasi Breakdown */}
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20">
                                    <Layers className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Distribusi Klasifikasi</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkatan lembaga P2MKP ditetapkan</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {Object.entries(stats.klasifikasiBreakdown).length === 0 ? (
                                    <p className="text-slate-400 text-sm font-medium col-span-3 text-center py-6">Belum ada data klasifikasi</p>
                                ) : (
                                    Object.entries(stats.klasifikasiBreakdown)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([k, count]) => {
                                            const color = getKlasifikasiColor(k);
                                            const pct = stats.totalP2MKP > 0 ? Math.round((count / stats.totalP2MKP) * 100) : 0;
                                            return (
                                                <div key={k} className={`p-4 rounded-2xl border ${color.bg} ${color.border} flex flex-col gap-2`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${color.dot} animate-pulse`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${color.text}`}>{k}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className={`text-3xl font-black ${color.text}`}>{count}</span>
                                                        <span className={`text-[10px] font-bold ${color.text} opacity-60`}>Lembaga</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                                                            className={`h-full ${color.dot} rounded-full`}
                                                        />
                                                    </div>
                                                    <span className={`text-[9px] font-black ${color.text} opacity-60 uppercase tracking-widest`}>{pct}% dari total</span>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kepemilikan Breakdown */}
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                                    <Briefcase className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Status Kepemilikan</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis badan usaha lembaga</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(stats.kepemilikanBreakdown).length === 0 ? (
                                    <p className="text-slate-400 text-sm font-medium col-span-4 text-center py-6">Belum ada data kepemilikan</p>
                                ) : (
                                    Object.entries(stats.kepemilikanBreakdown)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([k, count], i) => {
                                            const colors = [
                                                "from-blue-600 to-indigo-700 shadow-blue-500/20",
                                                "from-emerald-500 to-teal-600 shadow-emerald-500/20",
                                                "from-purple-600 to-violet-700 shadow-purple-500/20",
                                                "from-amber-500 to-orange-600 shadow-amber-500/20",
                                            ];
                                            return (
                                                <div key={k} className={`p-4 bg-gradient-to-br ${colors[i % colors.length]} rounded-2xl text-center shadow-lg`}>
                                                    <span className="text-2xl font-black text-white">{count}</span>
                                                    <p className="text-[9px] font-black text-white/80 uppercase tracking-wider mt-1 leading-tight">{k}</p>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── Geographic Coverage ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Provinsi */}
                <motion.div variants={cardVariants}>
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20">
                                        <Globe className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Top 5 Provinsi</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berdasarkan jumlah P2MKP ditetapkan</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">{stats.totalProvinsi} Prov</span>
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-3">
                            {stats.topProvinsi.length === 0 ? (
                                <p className="text-slate-400 text-sm font-medium text-center py-6">Belum ada data wilayah</p>
                            ) : (
                                stats.topProvinsi.map(([prov, count], idx) => {
                                    const maxVal = stats.topProvinsi[0]?.[1] || 1;
                                    const pct = (count / maxVal) * 100;
                                    return (
                                        <div key={prov} className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{prov}</span>
                                                    <span className="text-xs font-black text-slate-900">{count}</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Kota */}
                <motion.div variants={cardVariants}>
                    <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
                        <div className="p-5 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Top 5 Kota / Kabupaten</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berdasarkan jumlah P2MKP ditetapkan</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider">{stats.totalKota} Kota</span>
                            </div>
                        </div>
                        <CardContent className="p-5 space-y-3">
                            {stats.topKota.length === 0 ? (
                                <p className="text-slate-400 text-sm font-medium text-center py-6">Belum ada data kota</p>
                            ) : (
                                stats.topKota.map(([kota, count], idx) => {
                                    const maxVal = stats.topKota[0]?.[1] || 1;
                                    const pct = (count / maxVal) * 100;
                                    return (
                                        <div key={kota} className="flex items-center gap-3">
                                            <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{kota}</span>
                                                    <span className="text-xs font-black text-slate-900">{count}</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ── Approval Rate Summary Banner ─────────────────────────────── */}
            <motion.div variants={cardVariants}>
                <Card className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-none rounded-2xl shadow-xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-7 h-7 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Ringkasan Sistem</p>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">
                                        Tingkat Penetapan Lembaga P2MKP
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                                        Dari total <span className="text-white font-bold">{stats.totalP2MKP}</span> lembaga terdaftar, sebanyak <span className="text-emerald-400 font-bold">{stats.approvedP2MKP}</span> telah memperoleh status penetapan resmi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-center">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="#1e3a5f" strokeWidth="8" />
                                            <motion.circle
                                                cx="40" cy="40" r="32"
                                                fill="none" stroke="#3b82f6" strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 32}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - stats.penetrationRate / 100) }}
                                                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-black text-white">{stats.penetrationRate}%</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Rate Penetapan</p>
                                </div>
                                <div className="text-center">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="#1a3a2a" strokeWidth="8" />
                                            <motion.circle
                                                cx="40" cy="40" r="32"
                                                fill="none" stroke="#10b981" strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 32}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - stats.approvalRatePenetapan / 100) }}
                                                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-black text-white">{stats.approvalRatePenetapan}%</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Rate Approval</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default DashboardP2MKP;

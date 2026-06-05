"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText,
    FiDownload,
    FiExternalLink,
    FiX,
    FiBarChart2,
    FiCheckCircle,
    FiCalendar,
    FiMonitor,
    FiWifi,
} from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import Footer from "@/components/ui/footer";

const reports = [
    {
        id: "offline",
        title: "Laporan Tindak Lanjut Hasil SKM Offline",
        subtitle: "Semester I Tahun 2026",
        description:
            "Laporan komprehensif hasil Survei Kepuasan Masyarakat (SKM) yang dilakukan secara luring (offline) pada periode Semester I Tahun 2026 di lingkungan BPPSDM Kelautan dan Perikanan.",
        file: "/files/hasil-surveys/offlinetw12026.pdf",
        type: "Offline",
        semester: "Semester I",
        tahun: "2026",
        icon: <FiMonitor size={28} />,
        color: "from-blue-600/25 to-indigo-600/20",
        borderColor: "border-blue-500/30",
        badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/25",
        glowColor: "from-blue-500/20 to-indigo-500/20",
        accentLine: "from-blue-500 to-indigo-500",
    },
    {
        id: "online",
        title: "Laporan Tindak Lanjut Hasil SKM Online",
        subtitle: "Semester I Tahun 2026",
        description:
            "Laporan komprehensif hasil Survei Kepuasan Masyarakat (SKM) yang dilakukan secara daring (online) pada periode Semester I Tahun 2026 di lingkungan BPPSDM Kelautan dan Perikanan.",
        file: "/files/hasil-surveys/onlinetw12026.pdf",
        type: "Online",
        semester: "Semester I",
        tahun: "2026",
        icon: <FiWifi size={28} />,
        color: "from-emerald-600/25 to-teal-600/20",
        borderColor: "border-emerald-500/30",
        badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        glowColor: "from-emerald-500/20 to-teal-500/20",
        accentLine: "from-emerald-500 to-teal-500",
    },
];

export default function HasilSurveyPage() {
    const [activeReport, setActiveReport] = React.useState<(typeof reports)[0] | null>(null);

    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveReport(null);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden flex flex-col">

            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-blue-600/12 rounded-full blur-[130px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/12 rounded-full blur-[130px]" />
                <div className="absolute top-[40%] left-[30%] w-[35%] h-[35%] bg-emerald-600/8 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] contrast-150" />
            </div>

            <main className="flex-1 relative z-10 pt-32 pb-24 px-4 md:px-8">
                <div className="max-w-5xl mx-auto space-y-16">

                    {/* ── Hero Header ── */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.25em] uppercase"
                        >
                            <FiBarChart2 className="animate-pulse" />
                            Transparansi Publik
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-calsans leading-tight tracking-tight"
                        >
                            Hasil{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                                Survei Kepuasan
                            </span>
                            <br />
                            Masyarakat
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto"
                        >
                            Laporan tindak lanjut hasil Survei Kepuasan Masyarakat (SKM) BPPSDM Kelautan dan Perikanan sebagai wujud akuntabilitas pelayanan publik.
                        </motion.p>

                        {/* Stats row */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="flex justify-center gap-8 pt-4"
                        >
                            {[
                                { val: "2", label: "Laporan Tersedia" },
                                { val: "2026", label: "Tahun Anggaran" },
                                { val: "I", label: "Semester" },
                            ].map((s) => (
                                <div key={s.label} className="text-center">
                                    <p className="text-3xl font-black text-white">{s.val}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Report Cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reports.map((report, idx) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 32 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.12, type: "spring", bounce: 0.3 }}
                                className="group relative"
                            >
                                {/* Glow halo */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-br ${report.glowColor} rounded-[2.5rem] blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`} />

                                {/* Card body */}
                                <div className={`relative flex flex-col h-full rounded-[2.5rem] border ${report.borderColor} bg-gradient-to-br ${report.color} backdrop-blur-2xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl`}>

                                    {/* Accent top line */}
                                    <div className={`h-0.5 w-full bg-gradient-to-r ${report.accentLine} opacity-60`} />

                                    {/* PDF thumbnail preview area */}
                                    <div className="relative h-52 bg-[#020617]/60 overflow-hidden flex items-center justify-center border-b border-white/5">
                                        {/* Background pattern */}
                                        <div className="absolute inset-0 opacity-5">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="absolute h-px w-full bg-white" style={{ top: `${i * 20}%` }} />
                                            ))}
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="absolute w-px h-full bg-white" style={{ left: `${i * 20}%` }} />
                                            ))}
                                        </div>

                                        {/* Glowing icon */}
                                        <div className="relative flex flex-col items-center gap-4 z-10">
                                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${report.color} border ${report.borderColor} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                                                <HiOutlineDocumentReport size={40} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${report.badgeColor}`}>
                                                {report.type}
                                            </span>
                                        </div>

                                        {/* Shimmer overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-7 space-y-5">
                                        {/* Meta badges */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                                                <FiCalendar size={10} /> {report.semester} {report.tahun}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                                                <FiCheckCircle size={10} /> Tersedia
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-calsans leading-tight text-white group-hover:text-white transition-colors">
                                                {report.title}
                                            </h2>
                                            <p className={`text-sm font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r ${report.accentLine}`}>
                                                {report.subtitle}
                                            </p>
                                        </div>

                                        <p className="text-gray-400 text-sm leading-relaxed font-light flex-1">
                                            {report.description}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setActiveReport(report)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r ${report.accentLine} text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5`}
                                            >
                                                <FiExternalLink size={14} /> Lihat Dokumen
                                            </button>
                                            <a
                                                href={report.file}
                                                download
                                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                <FiDownload size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Info Note ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/8 backdrop-blur-xl">
                            <FiFileText className="text-blue-400 animate-pulse" size={14} />
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                                Dokumen Publik — BPPSDM Kelautan dan Perikanan © 2026
                            </p>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />

            {/* ── PDF Viewer Modal ── */}
            <AnimatePresence>
                {activeReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9999999999] flex items-center justify-center p-4"
                        onClick={() => setActiveReport(null)}
                    >
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 24 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                            className="relative w-full max-w-5xl z-10 rounded-3xl overflow-hidden border border-white/10 bg-[#050d1a] shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[#020617]/60 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeReport.color} border ${activeReport.borderColor} flex items-center justify-center text-white`}>
                                        {activeReport.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-tight">{activeReport.title}</h3>
                                        <p className="text-[10px] text-gray-400">{activeReport.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={activeReport.file}
                                        download
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
                                    >
                                        <FiDownload size={12} /> Unduh
                                    </a>
                                    <button
                                        onClick={() => setActiveReport(null)}
                                        className="w-9 h-9 rounded-xl bg-white/8 hover:bg-red-500/70 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* PDF iframe */}
                            <div className="relative" style={{ height: "75vh" }}>
                                <iframe
                                    src={`${activeReport.file}#toolbar=1&view=FitH`}
                                    className="w-full h-full"
                                    title={activeReport.title}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

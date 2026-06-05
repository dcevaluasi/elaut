"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText,
    FiDownload,
    FiExternalLink,
    FiX,
    FiCalendar,
    FiArrowLeft,
    FiSearch,
    FiChevronRight,
    FiLock,
    FiLayers,
    FiFilter,
    FiCheckCircle,
    FiSettings,
    FiActivity,
    FiShield,
    FiPieChart,
} from "react-icons/fi";
import {
    HiOutlineBookOpen,
    HiOutlineClock,
    HiOutlineScale,
    HiOutlineInformationCircle,
} from "react-icons/hi2";
import Footer from "@/components/ui/footer";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { fileModuleBaseUrl } from "@/constants/urls";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";

import dynamic from "next/dynamic";

// Dynamic imports for react-pdf (already in package.json)
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });
import { pdfjs } from 'react-pdf';

// pdfjs Worker from CDN
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const parseJP = (jpString: string | number | undefined | null) => {
    if (jpString === undefined || jpString === null || jpString === "") return { teori: 0, praktek: 0, total: 0 };

    const str = String(jpString);
    const numbers = str.match(/\d+/g);

    if (numbers && numbers.length >= 2) {
        const teori = parseInt(numbers[0], 10);
        const praktek = parseInt(numbers[1], 10);
        return { teori, praktek, total: teori + praktek };
    } else if (numbers && numbers.length === 1) {
        const value = parseInt(numbers[0], 10);
        return { teori: value, praktek: 0, total: value };
    }

    return { teori: 0, praktek: 0, total: 0 };
};

export default function KNMPMateriPage() {
    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat("Modul");

    const [view, setView] = useState<"home" | "detail">("home");
    const [selectedMateri, setSelectedMateri] = useState<MateriPelatihan | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"az" | "mod">("az");
    const [activePdf, setActivePdf] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    // Hero image slideshow
    const heroImages = [
        "/layanan/knmp/knmp1.jpg",
        "/layanan/knmp/knmp2.jpg",
        "/layanan/knmp/knmp3.jpg",
        "/layanan/knmp/knmp4.jpg",
    ];
    const [heroIndex, setHeroIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const openPdfPreview = async (filename: string) => {
        const baseUrl = fileModuleBaseUrl || "";
        const fullUrl = filename.startsWith('http') ? filename : `${baseUrl}/${filename}`;
        setActivePdf(fullUrl);
    };

    const getCategoryStyles = (namaMateri: string | undefined) => {
        const name = (namaMateri || "").toLowerCase();

        let type = "Kompetensi KNMP";
        let title = namaMateri || "Materi Pelatihan";
        let icon = FiFileText;

        if (name.includes("pengelola") || name.includes("umum")) {
            type = "Kompetensi Umum";
            title = "Pengelola KNMP";
            icon = FiShield;
        } else if (name.includes("manajer") || name.includes("operasional")) {
            type = "Kompetensi Khusus";
            title = "Manajer Operasional";
            icon = FiSettings;
        } else if (name.includes("produksi")) {
            type = "Kompetensi Khusus";
            title = "Kepala Produksi";
            icon = FiActivity;
        } else if (name.includes("mutu") || name.includes("penjamin")) {
            type = "Kompetensi Khusus";
            title = "Penjamin Mutu";
            icon = FiCheckCircle;
        } else if (name.includes("keuangan") || name.includes("administrasi")) {
            type = "Kompetensi Khusus";
            title = "Administrasi Keuangan";
            icon = FiPieChart;
        }

        // Strictly Merah Putih (Red & White) Aesthetic
        return {
            type,
            title,
            icon,
            glow: "from-rose-600/30 to-white/10",
            border: "border-rose-500/40",
            bg: "from-rose-950/30 via-[#020617] to-white/5",
            accent: "from-rose-500 to-rose-600",
            iconBg: "bg-gradient-to-br from-white/10 to-rose-500/10 text-white border border-white/10"
        };
    };

    const filteredList = useMemo(() => {
        let list = data.filter((item: MateriPelatihan) => {
            const isModulType = item.BerlakuSampai === "1";
            const isKNMP = item.BidangMateriPelatihan === "Kampung Nelayan Merah Putih (KNMP)";
            const matchesSearch = item.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase());
            return isModulType && isKNMP && matchesSearch;
        });

        if (sortOrder === "az") {
            list.sort((a, b) => a.NamaMateriPelatihan.localeCompare(b.NamaMateriPelatihan));
        } else {
            list.sort((a, b) => (b.ModulPelatihan?.length || 0) - (a.ModulPelatihan?.length || 0));
        }

        return list;
    }, [data, searchQuery, sortOrder]);

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-rose-500/20 rounded-full blur-md animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">Materi KNMP</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Sinkronisasi Repositori...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen !font-plusJakartaSans bg-[#020617] text-white selection:bg-rose-500/30 overflow-x-hidden flex flex-col">
            {/* Ambient Background & Ornaments */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-red-600/5 rounded-full blur-[100px]" />

                {/* Nautical Floating Ornaments */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-40 left-[5%] opacity-[0.03] text-rose-500"
                >
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-40 right-[10%] opacity-[0.03] text-red-500"
                >
                    <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.64 4.18 1.62 6" /></svg>
                </motion.div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-150" />
            </div>

            {/* Decorative Wave Divider */}
            <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="currentColor" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,181.3C672,203,768,213,864,192C960,171,1056,117,1152,101.3C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* ── HERO SECTION ── */}
            {view === "home" && (
                <div className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
                    {/* Rotating background images */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroIndex}
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 0.45, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={heroImages[heroIndex]}
                                alt="Hero KNMP"
                                fill
                                priority
                                className="object-cover"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#020617]/30 to-[#020617]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/70 via-transparent to-transparent" />

                    {/* Animated blobs */}
                    <motion.div
                        animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        className="pointer-events-none absolute -top-16 -left-16 h-[28rem] w-[28rem] rounded-full bg-rose-600/15 blur-[120px]"
                    />
                    <motion.div
                        animate={{ x: [0, -50, 0], y: [0, 35, 0] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                        className="pointer-events-none absolute -bottom-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-red-500/10 blur-[150px]"
                    />

                    {/* Noise texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] contrast-150 pointer-events-none" />

                    {/* Hero text content */}
                    <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-16 pb-14 max-w-5xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-0.5 w-12 bg-rose-500 rounded-full" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-rose-400 uppercase">
                                Repositori Nasional
                            </span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-calsans leading-none tracking-tight text-white drop-shadow-2xl">
                                Kampung Nelayan <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-400 to-rose-600">
                                    Merah Putih
                                </span>
                            </h1>
                            <p className="mt-4 text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed font-light">
                                Repositori digital materi pelatihan dan pengembangan kompetensi SDM Manajerial
                                Kampung Nelayan Merah Putih (KNMP).
                            </p>
                        </motion.div>

                        {/* Image indicator dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-2 mt-6"
                        >
                            {heroImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setHeroIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === heroIndex
                                        ? "w-8 bg-rose-500"
                                        : "w-2 bg-white/20 hover:bg-white/40"
                                        }`}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}
            {/* ── END HERO ── */}

            <main className={`flex-1 relative px-6 md:px-16 z-10 pb-24 ${view === "detail" ? "pt-40" : "pt-12"}`}>
                <div className="max-w-full mx-auto space-y-12">
                    <AnimatePresence mode="wait">
                        {view === "home" ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >

                                {/* Struktur Jabatan Kompetensi KNMP */}
                                <div className="space-y-6  pb-4 border-t border-white/5 relative z-10 w-full overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-transparent blur-[80px] pointer-events-none" />

                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="space-y-2">
                                            <h2 className="text-xl md:text-2xl font-calsans tracking-tight">Struktur Jabatan Kompetensi</h2>
                                            <p className="text-xs text-gray-400 font-light max-w-lg leading-relaxed">
                                                Lima pilar utama penggerak manajerial Kampung Nelayan Merah Putih beserta fungsional dan tanggung jawab operasionalnya.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inline Marquee Animation */}
                                    <style>{`
                                        @keyframes knmpMarquee {
                                            0% { transform: translateX(0%); }
                                            100% { transform: translateX(-50%); }
                                        }
                                        .animate-knmp-marquee {
                                            animation: knmpMarquee 25s linear infinite;
                                        }
                                    `}</style>

                                    <div className="relative w-full overflow-hidden py-2">
                                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
                                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />

                                        <div className="flex w-max animate-knmp-marquee items-center gap-4 hover:[animation-play-state:paused] cursor-default">
                                            {[
                                                { title: "Pengelola KNMP", type: "Kompetensi Umum", icon: FiShield },
                                                { title: "Manajer Operasional", type: "Kompetensi Khusus", icon: FiSettings },
                                                { title: "Kepala Produksi", type: "Kompetensi Khusus", icon: FiActivity },
                                                { title: "Penjamin Mutu", type: "Kompetensi Khusus", icon: FiCheckCircle },
                                                { title: "Administrasi Keuangan", type: "Kompetensi Khusus", icon: FiPieChart },
                                                // Duplicated to ensure perfectly seamless -50% CSS loop
                                                { title: "Pengelola KNMP", type: "Kompetensi Umum", icon: FiShield },
                                                { title: "Manajer Operasional", type: "Kompetensi Khusus", icon: FiSettings },
                                                { title: "Kepala Produksi", type: "Kompetensi Khusus", icon: FiActivity },
                                                { title: "Penjamin Mutu", type: "Kompetensi Khusus", icon: FiCheckCircle },
                                                { title: "Administrasi Keuangan", type: "Kompetensi Khusus", icon: FiPieChart }
                                            ].map((jabatan, i) => (
                                                <div
                                                    key={i}
                                                    className="w-64 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 shrink-0 transition-colors hover:bg-white/[0.05] hover:border-rose-500/20"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex items-center justify-center text-white shrink-0">
                                                        <jabatan.icon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 block mb-0.5">{jabatan.type}</span>
                                                        <h3 className="text-[11px] font-bold text-white truncate">{jabatan.title}</h3>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Controls & Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Content Area */}
                                    <div className="lg:col-span-12 space-y-6">
                                        {/* Search & Sort Bar */}
                                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                            <div className="relative w-full md:max-w-md group">
                                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Cari materi KNMP..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 self-end md:self-auto">
                                                <button
                                                    onClick={() => setSortOrder("az")}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === "az" ? "bg-rose-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                                >
                                                    A-Z
                                                </button>
                                                <button
                                                    onClick={() => setSortOrder("mod")}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortOrder === "mod" ? "bg-rose-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                                                >
                                                    Modul
                                                </button>
                                            </div>
                                        </div>

                                        {/* Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {filteredList.map((materi, idx) => {
                                                const style = getCategoryStyles(materi.NamaMateriPelatihan);
                                                return (
                                                    <motion.div
                                                        key={materi.IdMateriPelatihan}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        onClick={() => {
                                                            setSelectedMateri(materi);
                                                            setView("detail");
                                                        }}
                                                        className="group relative cursor-pointer"
                                                    >
                                                        {/* Glow halo */}
                                                        <div className={`absolute -inset-0.5 bg-gradient-to-br ${style.glow} rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                                                        <div className={`relative h-full bg-gradient-to-br ${style.bg} border border-white/10 group-hover:${style.border} rounded-[2rem] p-6 backdrop-blur-3xl overflow-hidden shadow-2xl transition-all duration-500 flex flex-col`}>
                                                            {/* Card Header Illustration */}
                                                            <div className="relative h-32 mb-6 -mx-6 -mt-6 bg-[#020617]/50 flex items-center justify-center border-b border-white/5 overflow-hidden">
                                                                <div className="absolute inset-0 opacity-[0.03] pattern-grid-white" />
                                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.accent} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700`}>
                                                                    <style.icon size={28} />
                                                                </div>

                                                                {/* Floating elements */}
                                                                <div className="absolute top-4 right-4 flex gap-1">
                                                                    {[...Array(3)].map((_, i) => (
                                                                        <div key={i} className="w-1 h-1 rounded-full bg-white/20" />
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 space-y-4">
                                                                <div>
                                                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md ${style.iconBg} text-[8px] font-black uppercase tracking-widest mb-3`}>
                                                                        <style.icon size={10} /> {style.type}
                                                                    </div>
                                                                    <h3 className="text-sm font-black text-white leading-tight transition-colors line-clamp-2">
                                                                        {materi.NamaMateriPelatihan}
                                                                    </h3>
                                                                </div>

                                                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[14px] font-black text-white">{materi.ModulPelatihan?.length || 0}</span>
                                                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Modul</span>
                                                                    </div>
                                                                    <div className="flex flex-col pl-4 border-l border-white/5">
                                                                        <span className="text-[14px] font-black text-white">{materi.Tahun}</span>
                                                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Tahun</span>
                                                                    </div>
                                                                    <div className="flex flex-col pl-4 border-l border-white/5">
                                                                        <span className="text-[14px] font-black text-white">{parseJP(materi.JamPelajaran).total || 0}</span>
                                                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Total JP</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 flex items-center justify-between text-rose-400 group-hover:translate-x-2 transition-transform">
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Buka Repositori</span>
                                                                <FiChevronRight size={14} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {filteredList.length === 0 && (
                                            <div className="py-24 text-center space-y-4 bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem]">
                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                                                    <FiLock size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-lg font-bold text-gray-400 uppercase tracking-tight">Tidak Ada Materi Ditemukan</h4>
                                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Silakan hubungi administrator untuk ketersediaan modul</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Detail Header */}
                                <button
                                    onClick={() => setView("home")}
                                    className="flex items-center gap-2 text-xs font-black text-rose-400 uppercase tracking-widest hover:text-white transition-colors group"
                                >
                                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Katalog
                                </button>

                                {(() => {
                                    const style = getCategoryStyles(selectedMateri?.NamaMateriPelatihan);
                                    return (
                                        <>
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                                <div className="lg:col-span-4 space-y-6">
                                                    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${style.bg} border ${style.border} backdrop-blur-3xl relative overflow-hidden`}>
                                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.glow} rounded-full blur-[60px] pointer-events-none`} />

                                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.accent} flex items-center justify-center text-white shadow-2xl mb-6`}>
                                                            <style.icon size={32} />
                                                        </div>

                                                        <div className="space-y-2 relative z-10">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${style.iconBg} text-[10px] font-black uppercase tracking-[0.2em]`}>
                                                                <style.icon /> {style.type}
                                                            </div>
                                                            <h1 className="text-2xl font-black text-white leading-tight mt-1">{selectedMateri?.NamaMateriPelatihan}</h1>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5 relative z-10">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total JP</p>
                                                                <p className="text-lg font-black text-white tracking-widest">{parseJP(selectedMateri?.JamPelajaran).total || 0}</p>
                                                            </div>
                                                            <div className="space-y-1 border-l border-white/5 pl-4">
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tahun</p>
                                                                <p className="text-lg font-black text-white tracking-widest">{selectedMateri?.Tahun}</p>
                                                            </div>
                                                            <div className="space-y-1 border-l border-white/5 pl-4">
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID Materi</p>
                                                                <p className="text-lg font-black text-white tracking-widest">#{selectedMateri?.IdMateriPelatihan}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl">
                                                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                                            <HiOutlineClock className="text-rose-400" /> Ringkasan Materi
                                                        </h3>
                                                        <div className="space-y-4">
                                                            <p className="text-[11px] text-gray-400 font-light leading-relaxed italic">
                                                                "Materi ini disusun khusus untuk meningkatkan kompetensi sumber daya manusia di kawasan Kampung Nelayan Merah Putih dalam mengelola potensi kelautan dan perikanan secara mandiri dan berkelanjutan."
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-8 space-y-8">
                                                    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden">
                                                        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${style.glow} rounded-full blur-[80px] pointer-events-none opacity-40`} />

                                                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
                                                            <h2 className="text-lg font-calsans uppercase tracking-tight">Daftar Modul KNMP</h2>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{selectedMateri?.ModulPelatihan?.length} File</span>
                                                        </div>

                                                        <div className="space-y-3 relative z-10">
                                                            {selectedMateri?.ModulPelatihan?.map((mod: ModulPelatihan, idx: number) => (
                                                                <motion.div
                                                                    key={mod.IdModulPelatihan}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] hover:border-rose-500/30 transition-all group"
                                                                >
                                                                    <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center text-xs font-black`}>
                                                                        {(idx + 1).toString().padStart(2, '0')}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-[13px] font-bold text-white group-hover:text-rose-300 transition-colors leading-relaxed">{mod.NamaModulPelatihan}</h4>
                                                                        <div className="flex flex-col gap-2 mt-2">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md whitespace-nowrap">
                                                                                    Teori: {parseJP(mod.JamPelajaran).teori} JP
                                                                                </span>
                                                                                <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md whitespace-nowrap">
                                                                                    Praktek: {parseJP(mod.JamPelajaran).praktek} JP
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{mod.DeskripsiModulPelatihan}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        {mod.FileModule ? (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => openPdfPreview(mod.FileModule)}
                                                                                    className={`px-4 py-2 rounded-xl bg-gradient-to-r ${style.accent} text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95`}
                                                                                >
                                                                                    Buka
                                                                                </button>
                                                                                <a
                                                                                    href={mod.FileModule.startsWith('http') ? mod.FileModule : `${fileModuleBaseUrl}/${mod.FileModule}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    download
                                                                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5"
                                                                                >
                                                                                    <FiDownload size={14} />
                                                                                </a>
                                                                            </>
                                                                        ) : (
                                                                            <div className="text-[9px] font-black text-gray-700 uppercase">Belum Tersedia</div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-center">
                                                            <HiOutlineInformationCircle size={20} className="text-rose-400/50 shrink-0" />
                                                            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                                                                Dokumen ini merupakan bagian dari kurikulum nasional Kampung Nelayan Merah Putih. Penyalahgunaan materi dapat dikenakan sanksi akademik sesuai ketentuan yang berlaku.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* PDF Modal */}
            <AnimatePresence>
                {activePdf && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999999999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
                        onClick={() => setActivePdf(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full max-w-5xl h-full bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Pratinjau Modul Pelatihan KNMP</span>
                                <div className="flex items-center gap-3">
                                    <a href={activePdf} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-rose-500/20 text-[10px] font-black uppercase text-rose-400 hover:bg-rose-500/30 transition-all border border-rose-500/30 flex items-center gap-2">
                                        <FiExternalLink /> Fullscreen
                                    </a>
                                    <a href={activePdf} download className="px-4 py-2 rounded-xl bg-white/10 text-[10px] font-black uppercase text-white hover:bg-white/20 transition-all">Download</a>
                                    <button onClick={() => setActivePdf(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-red-500/80 transition-all"><FiX /></button>
                                </div>
                            </div>
                            <div className="flex-1 bg-white relative overflow-auto flex flex-col items-center py-8">
                                {activePdf && (
                                    <Document
                                        file={activePdf}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex flex-col items-center justify-center gap-4 py-20">
                                                <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menyiapkan Dokumen...</p>
                                            </div>
                                        }
                                    >
                                        {numPages && Array.from(new Array(numPages), (el, index) => (
                                            <div key={`page_${index + 1}`} className="mb-8 shadow-2xl border border-gray-100">
                                                <Page
                                                    pageNumber={index + 1}
                                                    scale={1.2}
                                                    renderTextLayer={true}
                                                    renderAnnotationLayer={true}
                                                />
                                            </div>
                                        ))}
                                    </Document>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

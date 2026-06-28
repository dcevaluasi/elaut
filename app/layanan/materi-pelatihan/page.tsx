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

// pdfjs Worker from CDN (version must match the pdfjs-dist bundled by react-pdf)
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function MateriPelatihanPage() {
    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat("Modul");

    const [view, setView] = useState<"home" | "detail">("home");
    const [selectedMateri, setSelectedMateri] = useState<MateriPelatihan | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCat, setActiveCat] = useState("Semua");
    const [sortOrder, setSortOrder] = useState<"az" | "mod">("az");
    const [activePdf, setActivePdf] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const openPdfPreview = async (filename: string) => {
        const baseUrl = fileModuleBaseUrl || "";
        const fullUrl = filename.startsWith('http') ? filename : `${baseUrl}/${filename}`;
        setActivePdf(fullUrl);
    };

    useEffect(() => {
        // No cleanup needed for direct URLs in react-pdf-viewer
    }, [activePdf]);

    const getCategoryStyles = (cat: string | undefined) => {
        const c = (cat || "").toLowerCase();
        if (c.includes("perikanan") || c.includes("aquaculture") || c.includes("akuakultur") || c.includes("budidaya") || c.includes("tangkap") || c.includes("pemasaran")) return {
            glow: "from-blue-500/20 to-indigo-500/20",
            border: "border-blue-500/30",
            bg: "from-blue-600/10 to-indigo-600/5",
            accent: "from-blue-500 to-indigo-500",
            iconBg: "bg-blue-600/20 text-blue-400"
        };
        if (c.includes("kelautan") || c.includes("ruang laut") || c.includes("pesisir") || c.includes("wisata") || c.includes("ppkrl") || c.includes("garam")) return {
            glow: "from-emerald-500/20 to-teal-500/20",
            border: "border-emerald-500/30",
            bg: "from-emerald-600/10 to-teal-600/5",
            accent: "from-emerald-500 to-teal-500",
            iconBg: "bg-emerald-600/20 text-emerald-400"
        };
        if (c.includes("vokasi") || c.includes("umum") || c.includes("manajemen") || c.includes("sdm") || c.includes("kepemimpinan") || c.includes("puslatluh")) return {
            glow: "from-amber-500/20 to-orange-500/20",
            border: "border-amber-500/30",
            bg: "from-amber-600/10 to-orange-600/5",
            accent: "from-amber-500 to-orange-500",
            iconBg: "bg-amber-600/20 text-amber-400"
        };
        if (c.includes("pengawasan") || c.includes("psdkp") || c.includes("karantina") || c.includes("keamanan") || c.includes("hukum")) return {
            glow: "from-rose-500/20 to-pink-500/20",
            border: "border-rose-500/30",
            bg: "from-rose-600/10 to-pink-600/5",
            accent: "from-rose-500 to-pink-500",
            iconBg: "bg-rose-600/20 text-rose-400"
        };
        return {
            glow: "from-violet-500/20 to-purple-500/20",
            border: "border-violet-500/30",
            bg: "from-violet-600/10 to-purple-600/5",
            accent: "from-violet-500 to-purple-500",
            iconBg: "bg-violet-600/20 text-violet-400"
        };
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActivePdf(null); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const categories = useMemo(() => {
        // Derive categories only from items that are actually modules
        const moduleOnly = data.filter((item: MateriPelatihan) => item.BerlakuSampai === "1");
        const cats = new Set(moduleOnly.map((item: MateriPelatihan) => item.BidangMateriPelatihan));
        return ["Semua", ...Array.from(cats)].filter(Boolean);
    }, [data]);

    const filteredList = useMemo(() => {
        let list = data.filter((item: MateriPelatihan) => {
            // Fix: ensure only modules are shown by secondary check on BerlakuSampai
            const isModulType = item.BerlakuSampai === "1";
            const matchesSearch =
                item.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.BidangMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = activeCat === "Semua" || item.BidangMateriPelatihan === activeCat;
            return isModulType && matchesSearch && matchesCat;
        });

        if (sortOrder === "az") {
            list.sort((a: MateriPelatihan, b: MateriPelatihan) => a.NamaMateriPelatihan.localeCompare(b.NamaMateriPelatihan));
        } else {
            list.sort((a: MateriPelatihan, b: MateriPelatihan) => (b.ModulPelatihan?.length || 0) - (a.ModulPelatihan?.length || 0));
        }

        return list;
    }, [data, searchQuery, activeCat, sortOrder]);

    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-[2px] border-blue-500/10 rounded-full" />
                        <div className="absolute inset-0 border-[2px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-jakarta overflow-x-hidden flex flex-col selection:bg-blue-500/30">

            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <main className="flex-1 relative mt-10 z-10 pt-28 pb-20 px-6 md:px-10 lg:px-16">
                <div className="max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        {view === "home" ? (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-12"
                            >
                                {/* ── Header / Hero ── */}
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl font-calsans tracking-tight">Katalog <span className="text-blue-400">Materi</span></h1>
                                    <p className="text-gray-400 text-sm max-w-2xl font-light">
                                        Pusat dokumentasi dan referensi modul pelatihan vokasi untuk meningkatkan kompetensi taruna dan masyarakat.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                                    {/* ── Sidebar Filters (UX Improvement) ── */}
                                    <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-28">

                                        {/* Search Box */}
                                        <div className="relative group">
                                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Cari modul..."
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Categories List */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-2">
                                                <FiFilter className="text-blue-400" size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Kategori Bidang</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {categories.map((cat) => {
                                                    const style = getCategoryStyles(cat);
                                                    const isActive = cat === activeCat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setActiveCat(cat)}
                                                            className={`text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all border group relative overflow-hidden ${isActive
                                                                ? `text-white border-transparent`
                                                                : "bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5"
                                                                }`}
                                                        >
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="activeCatBg"
                                                                    className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-100`}
                                                                />
                                                            )}
                                                            <span className="relative z-10 flex items-center justify-between">
                                                                {cat}
                                                                {isActive && <FiChevronRight />}
                                                                {!isActive && (
                                                                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${style.accent} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                                                )}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Stats Highlight */}
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border border-blue-500/20 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg">
                                                    <FiCheckCircle />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Database Aktif</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-2xl font-black">{data.length}</p>
                                                    <p className="text-[8px] text-gray-500 uppercase font-black">Materi</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-black">{categories.length - 1}</p>
                                                    <p className="text-[8px] text-gray-500 uppercase font-black">Bidang</p>
                                                </div>
                                            </div>
                                        </div>
                                    </aside>

                                    {/* ── Main Grid Content ── */}
                                    <div className="lg:col-span-9 space-y-6">

                                        {/* Sorting Bar */}
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                Menampilkan {filteredList.length} Hasil
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Urutkan:</span>
                                                <select
                                                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-blue-400 outline-none cursor-pointer"
                                                    value={sortOrder}
                                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                                >
                                                    <option value="az" className="bg-[#020617]">A – Z</option>
                                                    <option value="mod" className="bg-[#020617]">Jumlah Modul</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Cards Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {filteredList.length > 0 ? (
                                                filteredList.map((item, idx) => {
                                                    const style = getCategoryStyles(item.BidangMateriPelatihan);
                                                    return (
                                                        <motion.div
                                                            key={item.IdMateriPelatihan}
                                                            initial={{ opacity: 0, y: 12 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: idx % 6 * 0.05 }}
                                                            onClick={() => { setSelectedMateri(item); setView("detail"); window.scrollTo(0, 0); }}
                                                            className="group relative cursor-pointer"
                                                        >
                                                            {/* Glow halo */}
                                                            <div className={`absolute -inset-0.5 bg-gradient-to-br ${style.glow} rounded-[2rem] blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`} />

                                                            <div className={`relative flex flex-col h-full bg-gradient-to-br ${style.bg} border ${style.border} rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:shadow-2xl active:scale-[0.98]`}>

                                                                {/* Accent top line */}
                                                                <div className={`h-0.5 w-full bg-gradient-to-r ${style.accent} opacity-40`} />

                                                                {/* Thumbnail Area (Style from Hasil Survey) */}
                                                                <div className="relative h-32 bg-[#020617]/40 flex items-center justify-center border-b border-white/5 overflow-hidden">
                                                                    <div className="absolute inset-0 opacity-[0.03]">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <div key={i} className="absolute h-px w-full bg-white" style={{ top: `${i * 25}%` }} />
                                                                        ))}
                                                                    </div>

                                                                    <div className={`relative w-14 h-14 rounded-2xl ${style.iconBg} border border-white/5 flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                                                        <HiOutlineBookOpen />
                                                                    </div>

                                                                    <span className="absolute top-4 right-4 px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                                                        {item.Tahun}
                                                                    </span>
                                                                </div>

                                                                {/* Content */}
                                                                <div className="p-6 flex flex-col flex-1 gap-4">
                                                                    <div className="space-y-2 flex-1">
                                                                        <h3 className="text-sm font-bold group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                                                                            {item.NamaMateriPelatihan}
                                                                        </h3>
                                                                        <p className="text-gray-500 text-[11px] font-light leading-relaxed line-clamp-2">
                                                                            {item.DeskripsiMateriPelatihan || "Materi pelatihan terstandarisasi untuk menunjang kompetensi vokasi."}
                                                                        </p>
                                                                    </div>

                                                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${style.accent}`}>
                                                                            <FiLayers size={14} className="text-gray-500" />
                                                                            {item.ModulPelatihan?.length || 0} Unit Modul
                                                                        </div>
                                                                        <div className={`w-6 h-6 rounded-lg ${style.iconBg} flex items-center justify-center text-xs group-hover:translate-x-1 transition-all`}>
                                                                            <FiChevronRight />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl text-gray-700">
                                                        <FiSearch />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-500">Materi Tidak Ditemukan</p>
                                                        <p className="text-xs text-gray-600">Coba gunakan kata kunci atau kategori lain.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
                            >
                                {(() => {
                                    const style = getCategoryStyles(selectedMateri?.BidangMateriPelatihan || "");
                                    return (
                                        <>
                                            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-8">
                                                <button
                                                    onClick={() => setView("home")}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all group"
                                                >
                                                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Katalog
                                                </button>

                                                <div className="space-y-6">
                                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.accent} flex items-center justify-center text-3xl text-white shadow-xl shadow-blue-500/10`}>
                                                        <HiOutlineBookOpen />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${style.iconBg} border border-white/5`}>
                                                            {selectedMateri?.BidangMateriPelatihan}
                                                        </span>
                                                        <h1 className="text-3xl font-calsans leading-tight pt-2">{selectedMateri?.NamaMateriPelatihan}</h1>
                                                    </div>
                                                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                                                        {selectedMateri?.DeskripsiMateriPelatihan || "Gunakan dokumen modul ini sebagai panduan teknis yang telah disetujui oleh pusat kurikulum."}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                                        {[
                                                            { ic: <HiOutlineClock />, label: "Durasi", val: `${selectedMateri?.JamPelajaran || "40"} JP` },
                                                            { ic: <FiCalendar />, label: "Tahun", val: selectedMateri?.Tahun || "2024" },
                                                            { ic: <FiLayers />, label: "Komponen", val: `${selectedMateri?.ModulPelatihan?.length || 0} File` },
                                                            { ic: <HiOutlineScale />, label: "Sektor", val: selectedMateri?.BidangMateriPelatihan?.split(' ')[0] },
                                                        ].map((item, i) => (
                                                            <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} space-y-1`}>
                                                                <div className={`text-lg mb-2 opacity-60`}>{item.ic}</div>
                                                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{item.label}</p>
                                                                <p className="text-xs font-bold text-gray-300">{item.val}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-8 space-y-8">
                                                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden">
                                                    {/* Glow halo in detail too */}
                                                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${style.glow} rounded-full blur-[80px] pointer-events-none opacity-40`} />

                                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 relative z-10">
                                                        <h2 className="text-lg font-calsans uppercase tracking-tight">Daftar Modul Unit</h2>
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{selectedMateri?.ModulPelatihan?.length} File</span>
                                                    </div>

                                                    <div className="space-y-3 relative z-10">
                                                        {selectedMateri?.ModulPelatihan?.map((mod: ModulPelatihan, idx: number) => (
                                                            <motion.div
                                                                key={mod.IdModulPelatihan}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.05 }}
                                                                className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all group"
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center text-xs font-black`}>
                                                                    {(idx + 1).toString().padStart(2, '0')}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-[13px] font-bold text-white truncate group-hover:text-blue-300 transition-colors">{mod.NamaModulPelatihan}</h4>
                                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">Estimasi {mod.JamPelajaran || "4"} JP</p>
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
                                                        <HiOutlineInformationCircle size={20} className="text-blue-400/50 shrink-0" />
                                                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                                                            Gunakan dokumen ini sesuai dengan standar operasional prosedur yang berlaku. Distribusi komersial tanpa izin tertulis dilarang.
                                                        </p>
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Pratinjau Modul Pelatihan</span>
                                <div className="flex items-center gap-3">
                                    <a href={activePdf} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-blue-500/20 text-[10px] font-black uppercase text-blue-400 hover:bg-blue-500/30 transition-all border border-blue-500/30 flex items-center gap-2">
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
                                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
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

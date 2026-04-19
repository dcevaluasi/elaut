"use client";

import React from "react";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlay, FiYoutube, FiX, FiSearch, FiFilter } from "react-icons/fi";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";

const extractYoutubeId = (url: string) => {
    if (!url) return "";
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    } catch (e) {
        return url;
    }
}

export default function VideoGratisPage() {
    const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [videoLayanan, setVideoLayanan] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await getAllVideoPelatihans();
                setVideoLayanan(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchVideos();
    }, []);

    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveVideo(null);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const filteredVideos = videoLayanan.filter(v =>
        (v.namaPelatihan || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.programPelatihan || v.jenisProgramPelatihan || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleVideoClick = async (video: any) => {
        const ytId = extractYoutubeId(video.linkPelatihan);
        setActiveVideo(ytId);
        try {
            await incrementVideoClick(video.id);
        } catch (e) {}
    };

    return (
        <section className="pt-24 min-h-screen bg-[#020617] text-white font-jakarta overflow-x-hidden flex flex-col">

            {/* Ambient Backgrounds */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100 mix-blend-overlay" />
            </div>

            <main className="flex-1 relative z-10 flex flex-col mt-8">
                {/* Hero Title Section */}
                <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center leading-none gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase mb-6"
                    >
                        <FiYoutube className="animate-pulse" /> Edukasi E-LAUT
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl leading-none lg:text-6xl font-calsans leading-tight mb-6"
                    >
                        Koleksi Video <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                            Pelatihan Gratis
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Akses ratusan modul video pembelajaran secara gratis. Tingkatkan keahlian Kelautan dan Perikanan Anda dari mana saja bersama instruktur profesional kami.
                    </motion.p>

                    {/* Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 max-w-2xl mx-auto flex items-center bg-[#1e293b]/50 border border-white/10 rounded-2xl p-2 backdrop-blur-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
                    >
                        <div className="pl-4 pr-2 text-gray-400">
                            <FiSearch size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kelas, teknik budidaya, atau penyelenggara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white text-sm py-2 px-2 placeholder:text-gray-500"
                        />
                        <button className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <FiFilter size={14} /> Filter
                        </button>
                    </motion.div>
                </div>

                {/* Video Grid Area */}
                <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-24">
                    {filteredVideos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVideos.map((video, idx) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <VideoCard
                                        video={video}
                                        onClick={() => handleVideoClick(video)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <FiYoutube size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">Tidak ada video yang sesuai dengan pencarian Anda.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Popup Player */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                        onClick={() => setActiveVideo(null)}
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: 30 }}
                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                            className="relative w-full max-w-5xl z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-[#050d1a]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/80 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm"
                            >
                                <FiX size={16} />
                            </button>
                            <div className="aspect-video w-full bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    className="w-full h-full"
                                    title="Video Pelatihan E-LAUT"
                                />
                            </div>

                            {/* Player info strip */}
                            {(() => {
                                const vid = videoLayanan.find((v) => extractYoutubeId(v.linkPelatihan) === activeVideo);
                                return vid ? (
                                    <div className="px-6 md:px-8 py-5 border-t border-white/5 bg-[#020617]/50">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 shrink-0 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mt-1 md:mt-0">
                                                    <FiYoutube size={18} className="text-red-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white text-base md:text-lg font-bold font-calsans">{vid.namaPelatihan}</h3>
                                                    <p className="text-sm text-gray-400 mt-1 max-w-2xl">{vid.descriptionVideo}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                            {vid.programPelatihan || vid.jenisProgramPelatihan || "Umum"}
                                                        </span>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                                            {vid.penyelenggara}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="md:w-auto w-full px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0">
                                                BAGIKAN VIDEO
                                            </button>
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function VideoCard({ video, onClick }: {
    video: any;
    onClick: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);
    const ytId = extractYoutubeId(video.linkPelatihan);
    const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    const fallbackUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group cursor-pointer rounded-[2rem] overflow-hidden border border-white/10 hover:border-blue-500/40 transition-all duration-300 bg-[#1e293b]/30 shadow-lg hover:shadow-blue-500/10 h-full flex flex-col"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={thumbnailUrl}
                    alt={video.namaPelatihan}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                        animate={{ scale: hovered ? 1.1 : 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-16 h-16 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/50 flex items-center justify-center shadow-xl shadow-blue-500/50"
                    >
                        <FiPlay size={24} className="text-white translate-x-0.5" fill="white" />
                    </motion.div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                    <FiYoutube size={12} className="text-red-400" />
                    <span className="text-[10px] text-gray-200 font-bold uppercase tracking-wider">E-LAUT Video</span>
                </div>

                <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-blue-600/80 text-white border border-blue-400/30 backdrop-blur-sm shadow-lg">
                        {video.programPelatihan || video.jenisProgramPelatihan || "Umum"}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold font-calsans text-white text-lg leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                        {video.namaPelatihan}
                    </h4>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {video.descriptionVideo}
                    </p>
                </div>
                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-300 text-[10px] font-bold">BP</span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {video.penyelenggara}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

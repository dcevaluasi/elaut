"use client";

import React from "react";
import Footer from "@/components/ui/footer";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FiYoutube, FiX, FiSearch, FiFilter } from "react-icons/fi";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";
import { extractYoutubeId } from "@/utils/videos";
import { VideoCard } from "@/components/video/VideoCard";

export default function VideoGratisPage() {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

    const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [videoLayanan, setVideoLayanan] = React.useState<any[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = React.useState(true);

    React.useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoadingVideos(true);
                const data = await getAllVideoPelatihans();
                setVideoLayanan([...data].reverse());
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingVideos(false);
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

    const filteredVideos = videoLayanan.filter(v => {
        const query = searchQuery.toLowerCase();
        return (v.namaPelatihan?.toLowerCase() || "").includes(query) ||
            (v.programPelatihan?.toLowerCase() || "").includes(query) ||
            (v.jenisProgramPelatihan?.toLowerCase() || "").includes(query) ||
            (v.penyelenggara?.toLowerCase() || "").includes(query) ||
            (v.descriptionVideo?.toLowerCase() || "").includes(query);
    });

    const handleVideoClick = async (video: any) => {
        const ytId = extractYoutubeId(video.linkPelatihan);
        setActiveVideo(ytId);
        try {
            await incrementVideoClick(video.id);
        } catch (e) { }
    };

    return (
        <section className="pt-16 min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden flex flex-col">

            {/* Immersive Background System */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100" />
            </div>

            <main className="flex-1 relative z-10 flex flex-col mt-8">
                {/* Hero Title Section */}
                <motion.div
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    className="relative pt-18 pb-6 px-4 md:px-8 max-w-6xl mx-auto text-center"
                >
                    <div className="text-center space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center leading-none gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase"
                        >
                            <FiYoutube className="animate-pulse" /> Edukasi E-LAUT
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-4xl lg:text-5xl font-calsans leading-[1] tracking-tight"
                            >
                                KOLEKSI VIDEO <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                                    PELATIHAN GRATIS
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-light"
                            >
                                Akses ratusan modul video pembelajaran secara gratis. Tingkatkan keahlian Kelautan dan Perikanan Anda dari mana saja bersama instruktur profesional.
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter */}
                <div className="mt-8 mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-xl mx-auto flex items-center bg-[#1e293b]/50 border border-white/10 rounded-2xl p-2 backdrop-blur-xl focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-2xl relative z-20"
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
                    {isLoadingVideos ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="rounded-[2rem] aspect-video w-full min-h-[300px] bg-[#1e293b]/40 animate-pulse border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                                        <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                                        <div className="h-4 w-full bg-white/10 rounded-lg" />
                                        <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredVideos.length > 0 ? (
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
                        className="fixed inset-0 z-[999999999999] flex items-center justify-center p-4"
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


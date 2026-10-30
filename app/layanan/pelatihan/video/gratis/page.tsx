"use client";

import React from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import { Check, ExternalLink, Search, Share2, X, Youtube } from "lucide-react";

import Footer from "@/components/ui/footer";
import { VideoCard } from "@/components/video/VideoCard";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";
import { extractYoutubeId } from "@/utils/videos";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                     */
/* ------------------------------------------------------------------ */
type RawVideo = Parameters<typeof VideoCard>[0]["video"];

type VideoItem = {
    id: Parameters<typeof incrementVideoClick>[0];
    ytId: string;
    nama: string;
    program: string;
    penyelenggara: string;
    description: string;
    /** Lowercased text used for searching. */
    searchText: string;
    /** Original record, passed to <VideoCard> untouched. */
    raw: RawVideo;
};

const ALL = "Semua";
const PAGE_SIZE = 9;
const QUERY_PARAM = "v";

const toVideoItem = (raw: unknown): VideoItem => {
    const v = (raw ?? {}) as Record<string, any>;
    const nama = v.namaPelatihan ?? "Video pelatihan";
    const program = v.programPelatihan || v.jenisProgramPelatihan || "Umum";
    const penyelenggara = v.penyelenggara ?? "";
    const description = v.descriptionVideo ?? "";
    return {
        id: v.id,
        ytId: extractYoutubeId(v.linkPelatihan ?? ""),
        nama,
        program,
        penyelenggara,
        description,
        searchText: [nama, program, v.jenisProgramPelatihan, penyelenggara, description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        raw: raw as RawVideo,
    };
};

/** Keeps `?v=<youtube id>` in the URL so an open video can be shared. */
const setVideoParam = (ytId: string | null) => {
    const url = new URL(window.location.href);
    if (ytId) url.searchParams.set(QUERY_PARAM, ytId);
    else url.searchParams.delete(QUERY_PARAM);
    window.history.replaceState(null, "", url);
};

/* ------------------------------------------------------------------ */
/*  Data hook                                                           */
/* ------------------------------------------------------------------ */
function useVideos() {
    const [videos, setVideos] = React.useState<VideoItem[]>([]);
    const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
    const requestId = React.useRef(0);

    const load = React.useCallback(async () => {
        const id = ++requestId.current;
        setStatus("loading");
        try {
            const data = await getAllVideoPelatihans();
            if (id !== requestId.current) return;
            const list = (Array.isArray(data) ? data : []).map(toVideoItem).filter((v) => v.ytId);
            setVideos(list.reverse());
            setStatus("ready");
        } catch (error) {
            if (id !== requestId.current) return;
            console.error(error);
            setStatus("error");
        }
    }, []);

    React.useEffect(() => {
        load();
        return () => {
            requestId.current++;
        };
    }, [load]);

    return { videos, status, reload: load };
}

/* ------------------------------------------------------------------ */
/*  Player modal                                                        */
/* ------------------------------------------------------------------ */
function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    const share = async () => {
        const url = window.location.href; // already contains ?v=<id>
        try {
            if (navigator.share) {
                await navigator.share({ title: video.nama, text: `Tonton "${video.nama}" di E-LAUT`, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* share sheet dismissed or clipboard blocked */
        }
    };

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={video.nama}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#050d1a] shadow-2xl shadow-blue-500/20"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup video"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="aspect-video w-full bg-black">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0&modestbranding=1`}
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        title={video.nama}
                    />
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 bg-[#020617]/50 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
                    <div className="flex min-w-0 items-start gap-4">
                        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/20 md:mt-0">
                            <Youtube className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="font-calsans text-base text-white md:text-lg">{video.nama}</h3>
                            {video.description && (
                                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">{video.description}</p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                                    {video.program}
                                </span>
                                {video.penyelenggara && (
                                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                        {video.penyelenggara}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <a
                            href={`https://youtu.be/${video.ytId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/15 md:flex-none"
                        >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            YouTube
                        </a>
                        <button
                            type="button"
                            onClick={share}
                            className={cn(
                                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors md:flex-none",
                                copied ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-500"
                            )}
                        >
                            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
                            {copied ? "Tautan disalin" : "Bagikan"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat video">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="relative aspect-video min-h-[300px] w-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#1e293b]/40">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 space-y-4 p-6">
                        <div className="h-6 w-3/4 rounded-lg bg-white/10" />
                        <div className="h-4 w-full rounded-lg bg-white/10" />
                        <div className="h-4 w-1/2 rounded-lg bg-white/10" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function VideoGratisPage() {
    const reduceMotion = useReducedMotion();
    const searchRef = React.useRef<HTMLInputElement>(null);
    const { videos, status, reload } = useVideos();

    const [query, setQuery] = React.useState("");
    const [category, setCategory] = React.useState(ALL);
    const [visible, setVisible] = React.useState(PAGE_SIZE);
    const [active, setActive] = React.useState<VideoItem | null>(null);

    /* Parallax: hero fades & shrinks, background glow drifts. */
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, reduceMotion ? 1 : 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, reduceMotion ? 1 : 0.92]);
    const glowY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "-30%"]);

    /* Filtering */
    const categories = React.useMemo(
        () => [ALL, ...Array.from(new Set(videos.map((v) => v.program))).sort()],
        [videos]
    );
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return videos.filter(
            (v) => (category === ALL || v.program === category) && (!q || v.searchText.includes(q))
        );
    }, [videos, query, category]);
    const shown = filtered.slice(0, visible);
    const isFiltering = query.trim() !== "" || category !== ALL;

    React.useEffect(() => setVisible(PAGE_SIZE), [query, category]);

    /* Open the video from a shared link (?v=<id>) once the list has loaded. */
    React.useEffect(() => {
        if (status !== "ready") return;
        const ytId = new URLSearchParams(window.location.search).get(QUERY_PARAM);
        const match = ytId && videos.find((v) => v.ytId === ytId);
        if (match) setActive(match);
    }, [status, videos]);

    /* "/" focuses search, like many modern sites. */
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing = (e.target as HTMLElement)?.closest("input, textarea");
            if (e.key === "/" && !typing && !active) {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [active]);

    const openVideo = (video: VideoItem) => {
        setActive(video);
        setVideoParam(video.ytId);
        incrementVideoClick(video.id).catch(() => { });
    };
    const closeVideo = React.useCallback(() => {
        setActive(null);
        setVideoParam(null);
    }, []);

    const resetFilters = () => {
        setQuery("");
        setCategory(ALL);
    };

    return (
        <section className="flex min-h-screen flex-col overflow-x-hidden bg-[#020617] pt-16 font-jakarta text-white selection:bg-blue-500/30">
            {/* Background with parallax glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <motion.div style={{ y: glowY }} className="absolute inset-0">
                    <div className="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-blue-600/15 blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-600/15 blur-[140px]" />
                    <div className="absolute right-0 top-[30%] h-[40%] w-[40%] rounded-full bg-cyan-600/10 blur-[110px]" />
                </motion.div>
                <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150" />
            </div>

            <main className="relative z-10 mt-8 flex flex-1 flex-col">
                {/* Hero */}
                <motion.header
                    style={{ opacity: heroOpacity, scale: heroScale }}
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                    className="mx-auto max-w-6xl space-y-5 px-4 pb-6 pt-16 text-center md:px-8"
                >
                    <motion.span
                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.2em] text-blue-400"
                    >
                        <Youtube className="h-3.5 w-3.5" aria-hidden="true" />
                        Edukasi E-LAUT
                    </motion.span>
                    <motion.h1
                        variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
                        className="font-calsans text-3xl leading-[1] tracking-tight md:text-5xl lg:text-6xl"
                    >
                        Koleksi Video
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                            Pelatihan Gratis
                        </span>
                    </motion.h1>
                    <motion.p
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                        className="mx-auto max-w-xl text-xs font-light leading-relaxed text-gray-400 md:text-sm"
                    >
                        Akses modul video pembelajaran secara gratis. Tingkatkan keahlian Kelautan dan Perikanan Anda dari
                        mana saja bersama instruktur profesional.
                    </motion.p>
                </motion.header>

                {/* Search + category filter (sticky while browsing) */}
                <div className="sticky top-16 z-20 mx-auto mb-10 mt-6 w-full max-w-7xl px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="space-y-3 rounded-3xl border border-white/10 bg-[#0b1324]/80 p-3 shadow-2xl backdrop-blur-xl"
                    >
                        <label className="flex items-center rounded-2xl bg-white/5 px-3 transition focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-blue-500/40">
                            <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
                            <span className="sr-only">Cari video</span>
                            <input
                                ref={searchRef}
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari kelas, teknik budidaya, atau penyelenggara…"
                                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none border-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    aria-label="Hapus pencarian"
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : (
                                <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[11px] text-gray-400 md:block">
                                    /
                                </kbd>
                            )}
                        </label>

                        {categories.length > 2 && (
                            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Kategori program">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        role="tab"
                                        aria-selected={category === c}
                                        onClick={() => setCategory(c)}
                                        className={cn(
                                            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                                            category === c
                                                ? "border-blue-400/60 bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:text-white"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Results */}
                <div className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">
                    {status === "ready" && (
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-400" aria-live="polite">
                            <p>
                                <span className="font-semibold text-white">{filtered.length}</span> video
                                {isFiltering && " ditemukan"}
                            </p>
                            {isFiltering && (
                                <button type="button" onClick={resetFilters} className="text-blue-300 underline-offset-4 hover:underline">
                                    Reset filter
                                </button>
                            )}
                        </div>
                    )}

                    {status === "loading" && <GridSkeleton />}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 py-20 text-center">
                            <p className="text-gray-300">Video gagal dimuat. Periksa koneksi lalu coba lagi.</p>
                            <button
                                type="button"
                                onClick={reload}
                                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {status === "ready" && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-20 text-center text-gray-400">
                            <Youtube className="mb-4 h-12 w-12 opacity-50" aria-hidden="true" />
                            <p className="text-lg text-gray-300">
                                {videos.length === 0 ? "Belum ada video pelatihan." : "Tidak ada video yang sesuai."}
                            </p>
                            {isFiltering && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 rounded-full border border-white/15 px-5 py-2 text-sm text-white transition-colors hover:bg-white/10"
                                >
                                    Tampilkan semua video
                                </button>
                            )}
                        </div>
                    )}

                    {status === "ready" && shown.length > 0 && (
                        <>
                            <motion.div layout={!reduceMotion} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <AnimatePresence mode="popLayout">
                                    {shown.map((video, i) => (
                                        <motion.div
                                            key={String(video.id)}
                                            layout={!reduceMotion}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            // Cap the stagger so long lists don't wait seconds for the last card.
                                            transition={{ duration: 0.4, delay: Math.min(i % PAGE_SIZE, 6) * 0.06 }}
                                        >
                                            <VideoCard video={video.raw} onClick={() => openVideo(video)} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {filtered.length > shown.length && (
                                <div className="mt-10 flex flex-col items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setVisible((n) => n + PAGE_SIZE)}
                                        className="rounded-full border border-blue-500/30 bg-white/5 px-8 py-3 text-sm font-semibold text-blue-300 transition-all hover:border-transparent hover:bg-blue-600 hover:text-white"
                                    >
                                        Muat lebih banyak
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        {shown.length} dari {filtered.length} video
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />

            <AnimatePresence>{active && <VideoModal video={active} onClose={closeVideo} />}</AnimatePresence>
        </section>
    );
}

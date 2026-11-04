"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Building2, Check, ExternalLink, Eye, Flame, Layers, Play, PlayCircle, RefreshCw, Search, Share2, Sparkles, X, Youtube } from "lucide-react";

import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";
import { extractYoutubeId } from "@/utils/videos";

/* ============================ TYPES & HELPERS ============================ */

type VideoItem = {
    id: Parameters<typeof incrementVideoClick>[0];
    ytId: string;
    nama: string;
    program: string;
    penyelenggara: string;
    description: string;
    clicks: number | null;
    order: number;
    searchText: string;
};

const ALL = "Semua";
const PAGE_SIZE = 12;
const QUERY_PARAM = "v";
const ACCENTS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E"];
const fmt = (n: number) => n.toLocaleString("id-ID");

/** Nama field jumlah klik belum pasti → dicoba beberapa kemungkinan. */
const clicksOf = (v: Record<string, any>): number | null => {
    for (const k of ["clickCount", "click", "clicks", "jumlahKlik", "views", "viewCount"]) {
        const n = Number(v[k]);
        if (v[k] != null && Number.isFinite(n)) return n;
    }
    return null;
};

const toVideoItem = (raw: unknown, order: number): VideoItem => {
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
        clicks: clicksOf(v),
        order,
        searchText: [nama, program, v.jenisProgramPelatihan, penyelenggara, description].filter(Boolean).join(" ").toLowerCase(),
    };
};

const thumb = (ytId: string) => `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

/** Simpan `?v=<id>` di URL supaya video yang dibuka bisa dibagikan. */
const setVideoParam = (ytId: string | null) => {
    const url = new URL(window.location.href);
    if (ytId) url.searchParams.set(QUERY_PARAM, ytId);
    else url.searchParams.delete(QUERY_PARAM);
    window.history.replaceState(null, "", url);
};

/* ============================ DATA ============================ */

const normalize = (data: unknown) => (Array.isArray(data) ? data : []).map((r, i) => toVideoItem(r, i)).filter((v) => v.ytId);

/** `initial` = data dari server (SSR) → langsung tampil & terbaca Google, tanpa fetch ulang di browser. */
function useVideos(initial?: unknown[] | null) {
    const hasInitial = Array.isArray(initial);
    const [videos, setVideos] = React.useState<VideoItem[]>(() => (hasInitial ? normalize(initial) : []));
    const [status, setStatus] = React.useState<"loading" | "ready" | "error">(hasInitial ? "ready" : "loading");
    const requestId = React.useRef(0);

    const load = React.useCallback(async () => {
        const id = ++requestId.current;
        setStatus("loading");
        try {
            const data = await getAllVideoPelatihans();
            if (id !== requestId.current) return;
            // urutan asli = terlama → terbaru; order lebih besar = lebih baru
            setVideos(normalize(data));
            setStatus("ready");
        } catch (e) {
            if (id !== requestId.current) return;
            console.error(e);
            setStatus("error");
        }
    }, []);

    React.useEffect(() => {
        if (!hasInitial) load();
        return () => {
            requestId.current++;
        };
    }, [load, hasInitial]);

    return { videos, status, reload: load };
}

/* ============================ PAGE ============================ */

export default function VideoGratisClient({ initialVideos }: { initialVideos?: unknown[] | null }) {
    const searchRef = React.useRef<HTMLInputElement>(null);
    const { videos, status, reload } = useVideos(initialVideos);

    const [query, setQuery] = React.useState("");
    const q = React.useDeferredValue(query.trim().toLowerCase());
    const [category, setCategory] = React.useState(ALL);
    const [sort, setSort] = React.useState<"baru" | "populer">("baru");
    const [visible, setVisible] = React.useState(PAGE_SIZE);
    const [active, setActive] = React.useState<VideoItem | null>(null);

    /* Agregasi sekali */
    const { categories, stats } = React.useMemo(() => {
        const count = new Map<string, number>();
        const org = new Set<string>();
        let totalClicks = 0;
        let hasClicks = false;
        videos.forEach((v) => {
            count.set(v.program, (count.get(v.program) || 0) + 1);
            if (v.penyelenggara) org.add(v.penyelenggara);
            if (v.clicks != null) {
                hasClicks = true;
                totalClicks += v.clicks;
            }
        });
        const cats = [{ name: ALL, n: videos.length }, ...Array.from(count, ([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n)];
        return { categories: cats, stats: { videos: videos.length, programs: count.size, org: org.size, clicks: hasClicks ? totalClicks : null } };
    }, [videos]);

    const filtered = React.useMemo(() => {
        const list = videos.filter((v) => (category === ALL || v.program === category) && (!q || v.searchText.includes(q)));
        return list.sort((a, b) => (sort === "populer" ? (b.clicks ?? 0) - (a.clicks ?? 0) || b.order - a.order : b.order - a.order));
    }, [videos, q, category, sort]);

    const shown = filtered.slice(0, visible);
    const isFiltering = q !== "" || category !== ALL;
    const featured = !isFiltering && sort === "baru" ? shown[0] : undefined;
    const gridItems = featured ? shown.slice(1) : shown;

    React.useEffect(() => setVisible(PAGE_SIZE), [q, category, sort]);

    /* Buka video dari tautan bersama (?v=<id>) */
    React.useEffect(() => {
        if (status !== "ready") return;
        const ytId = new URLSearchParams(window.location.search).get(QUERY_PARAM);
        const match = ytId && videos.find((v) => v.ytId === ytId);
        if (match) setActive(match);
    }, [status, videos]);

    /* "/" fokus ke pencarian */
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const typing = (e.target as HTMLElement)?.closest("input, textarea, select");
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

    const loading = status === "loading";

    return (
        <div className="relative flex min-h-[80vh] flex-col overflow-x-hidden bg-[#020617] font-jakarta text-white selection:bg-blue-500/30">
            {/* Latar */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_40%_at_100%_60%,#0EA5E926_0%,transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" />
            </div>

            <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-28 md:pt-36 pb-12 space-y-6">
                {/* Breadcrumb (selaras dengan JSON-LD BreadcrumbList di page.tsx) */}
                <nav aria-label="Breadcrumb" className="text-[11px] text-slate-400">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li>
                            <Link href="/" className="hover:text-white">Beranda</Link>
                        </li>
                        <li aria-hidden>/</li>
                        <li>Layanan</li>
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="text-sky-200">Video Pelatihan Gratis</li>
                    </ol>
                </nav>

                {/* ===== HERO ===== */}
                <header className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)] p-6 md:p-10">
                    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                    <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    <PlayCircle aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-10 -bottom-14 -z-10 w-72 h-72 -rotate-12 text-sky-300 opacity-[0.12]" />

                    <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                        <div className="min-w-0 space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                                <Youtube className="w-3.5 h-3.5" /> Edukasi E-LAUT
                            </span>
                            <h1 className="text-3xl md:text-5xl font-calsans leading-[1.1] tracking-tight">
                                Koleksi Video{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">Pelatihan Gratis</span>
                            </h1>
                            <p className="max-w-xl text-sm md:text-base text-blue-100/75 leading-relaxed">
                                Belajar keahlian Kelautan dan Perikanan dari mana saja bersama instruktur profesional — <b className="text-white">gratis</b>, tanpa login.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 lg:w-60">
                            <HeroKpi icon={PlayCircle} label="Video" value={loading ? "…" : fmt(stats.videos)} accent="#3B82F6" />
                            <HeroKpi icon={Layers} label="Program" value={loading ? "…" : fmt(stats.programs)} accent="#06B6D4" />
                            {stats.clicks != null ? (
                                <HeroKpi icon={Eye} label="Total ditonton" value={fmt(stats.clicks)} accent="#10B981" />
                            ) : (
                                <HeroKpi icon={Building2} label="Penyelenggara" value={loading ? "…" : fmt(stats.org)} accent="#10B981" />
                            )}
                        </div>
                    </div>
                </header>

                {/* ===== TOOLBAR (sticky, navy glass) ===== */}
                <div className="sticky top-20 z-20 isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F]/95 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)] p-2 space-y-2">
                    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-50" />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <label className="relative flex-1 group">
                            <span className="sr-only">Cari video</span>
                            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-300" />
                            <input
                                ref={searchRef}
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari kelas, teknik budidaya, atau penyelenggara…"
                                className="w-full h-11 pl-11 pr-12 border-none rounded-2xl bg-white/[0.08] ring-1 ring-white/10 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-300/50 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {query ? (
                                <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:bg-white/10 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            ) : (
                                <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 rounded-md ring-1 ring-white/15 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">/</kbd>
                            )}
                        </label>
                        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 sm:w-60">
                            {[
                                { v: "baru" as const, l: "Terbaru", icon: Sparkles },
                                { v: "populer" as const, l: "Populer", icon: Flame },
                            ].map((o) => (
                                <button
                                    key={o.v}
                                    type="button"
                                    onClick={() => setSort(o.v)}
                                    aria-pressed={sort === o.v}
                                    className={`h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${sort === o.v ? "bg-white text-[#0B1B3F] shadow" : "text-blue-100/70 hover:text-white"}`}
                                >
                                    <o.icon className="w-3.5 h-3.5" /> {o.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {categories.length > 2 && (
                        <div role="tablist" aria-label="Kategori program" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] px-0.5 pb-0.5">
                            {categories.map((c, i) => {
                                const on = category === c.name;
                                const accent = c.name === ALL ? "#38BDF8" : ACCENTS[(i - 1) % ACCENTS.length];
                                return (
                                    <button
                                        key={c.name}
                                        type="button"
                                        role="tab"
                                        aria-selected={on}
                                        onClick={() => setCategory(c.name)}
                                        className={`relative isolate overflow-hidden shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold ring-1 transition-all ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`}
                                    >
                                        {on && <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${accent}55 0%, transparent 85%)` }} />}
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                                        {c.name}
                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/10 tabular-nums">{c.n}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ===== HASIL ===== */}
                {status === "ready" && (
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400" aria-live="polite">
                        <p>
                            <b className="text-white tabular-nums">{fmt(filtered.length)}</b> video{isFiltering && " ditemukan"}
                            {category !== ALL && <> di <b className="text-sky-200">{category}</b></>}
                        </p>
                        {isFiltering && (
                            <button type="button" onClick={resetFilters} className="font-semibold text-sky-300 hover:underline">
                                Reset filter
                            </button>
                        )}
                    </div>
                )}

                {loading && <GridSkeleton />}

                {status === "error" && (
                    <div className="mx-auto max-w-md rounded-3xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl p-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-300 grid place-items-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <p className="mt-4 font-bold">Video gagal dimuat</p>
                        <p className="mt-1 text-sm text-slate-400">Periksa koneksi lalu coba lagi.</p>
                        <button type="button" onClick={reload} className="mt-5 h-10 px-5 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold inline-flex items-center gap-2 hover:bg-sky-100">
                            <RefreshCw className="w-4 h-4" /> Coba lagi
                        </button>
                    </div>
                )}

                {status === "ready" && filtered.length === 0 && (
                    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 grid place-items-center">
                            <Youtube className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="mt-4 font-calsans text-xl">{videos.length === 0 ? "Belum ada video pelatihan" : "Tidak ada video yang sesuai"}</p>
                        {isFiltering && (
                            <button type="button" onClick={resetFilters} className="mt-4 h-10 px-5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm font-semibold hover:bg-white/[0.12]">
                                Tampilkan semua video
                            </button>
                        )}
                    </div>
                )}

                {status === "ready" && shown.length > 0 && (
                    <>
                        {featured && <FeaturedVideo video={featured} onPlay={() => openVideo(featured)} />}

                        {gridItems.length > 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {gridItems.map((v) => (
                                    <VideoTile key={String(v.id)} video={v} accent={ACCENTS[Math.max(0, categories.findIndex((c) => c.name === v.program) - 1) % ACCENTS.length]} onPlay={() => openVideo(v)} />
                                ))}
                            </div>
                        )}

                        {filtered.length > shown.length && (
                            <div className="flex flex-col items-center gap-2 pt-4">
                                <button type="button" onClick={() => setVisible((n) => n + PAGE_SIZE)} className="h-11 px-8 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors">
                                    Muat lebih banyak
                                </button>
                                <p className="text-xs text-slate-500 tabular-nums">
                                    {shown.length} dari {filtered.length} video
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {active && <VideoModal video={active} onClose={closeVideo} />}
        </div>
    );
}

/* ============================ KOMPONEN ============================ */

function HeroKpi({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
    return (
        <div className="group relative isolate overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/10 backdrop-blur px-3.5 py-3 transition-colors hover:bg-white/[0.12]">
            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-2 -bottom-3 -z-10 w-14 h-14 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100/70 truncate">{label}</p>
            <p className="mt-0.5 text-lg sm:text-2xl font-black tabular-nums tracking-tight">{value}</p>
        </div>
    );
}

function Thumb({ video, big }: { video: VideoItem; big?: boolean }) {
    return (
        <div className="relative aspect-video w-full overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(video.ytId)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-md text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-[#0B1B3F] ${big ? "w-16 h-16" : "w-12 h-12"}`}>
                <Play className={`${big ? "w-7 h-7" : "w-5 h-5"} translate-x-0.5 fill-current`} />
            </span>
            {video.clicks != null && (
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold tabular-nums backdrop-blur">
                    <Eye className="w-3 h-3" /> {fmt(video.clicks)}
                </span>
            )}
        </div>
    );
}

function FeaturedVideo({ video, onPlay }: { video: VideoItem; onPlay: () => void }) {
    return (
        <button
            type="button"
            onClick={onPlay}
            className="group relative isolate overflow-hidden grid md:grid-cols-[1.4fr_1fr] w-full text-left rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 transition-all hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
        >
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_100%_0%,#2563EB_0%,transparent_60%)] opacity-60" />
            <Thumb video={video} big />
            <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-400/15 ring-1 ring-amber-300/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
                    <Sparkles className="w-3 h-3" /> Video terbaru
                </span>
                <h2 className="font-calsans text-2xl md:text-3xl leading-tight group-hover:text-sky-100">{video.nama}</h2>
                {video.description && <p className="text-sm text-blue-100/70 leading-relaxed line-clamp-3">{video.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                    <Tag>{video.program}</Tag>
                    {video.penyelenggara && <Tag muted>{video.penyelenggara}</Tag>}
                </div>
                <span className="mt-1 inline-flex w-fit items-center gap-2 h-10 px-4 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold">
                    <Play className="w-4 h-4 fill-current" /> Tonton sekarang
                </span>
            </div>
        </button>
    );
}

function VideoTile({ video, accent, onPlay }: { video: VideoItem; accent: string; onPlay: () => void }) {
    return (
        <button
            type="button"
            onClick={onPlay}
            className="group relative isolate overflow-hidden flex flex-col w-full text-left rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition-all hover:bg-white/[0.07] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70"
        >
            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(70% 50% at 100% 100%, ${accent}30 0%, transparent 70%)` }} />
            <Thumb video={video} />
            <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="inline-flex w-fit items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} /> {video.program}
                </span>
                <h3 className="text-[15px] font-bold leading-snug line-clamp-2 group-hover:text-sky-100">{video.nama}</h3>
                {video.description && <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{video.description}</p>}
                {video.penyelenggara && (
                    <p className="mt-auto pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0" /> {video.penyelenggara}
                    </p>
                )}
            </div>
        </button>
    );
}

const Tag = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => (
    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${muted ? "bg-white/[0.06] ring-white/10 text-slate-300" : "bg-sky-500/15 ring-sky-400/30 text-sky-200"}`}>{children}</span>
);

function GridSkeleton() {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Memuat video">
            <div className="h-64 md:h-72 rounded-3xl bg-white/[0.05] ring-1 ring-white/10 animate-pulse" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
                        <div className="aspect-video bg-white/[0.06] animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-3 w-24 rounded bg-white/10" />
                            <div className="h-4 w-4/5 rounded bg-white/10" />
                            <div className="h-3 w-full rounded bg-white/[0.06]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
        const url = window.location.href; // sudah berisi ?v=<id>
        try {
            if (navigator.share) {
                await navigator.share({ title: video.nama, text: `Tonton "${video.nama}" di E-LAUT`, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* dibatalkan / clipboard diblokir */
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-label={video.nama} onClick={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
            <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
            <div onClick={(e) => e.stopPropagation()} className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#0B1B3F] ring-1 ring-white/15 shadow-[0_40px_120px_-30px_rgba(37,99,235,0.7)] animate-in zoom-in-95 duration-200">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup video"
                    className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-xl bg-black/50 ring-1 ring-white/15 text-white backdrop-blur hover:bg-white hover:text-[#0B1B3F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="aspect-video w-full bg-black">
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.ytId}?autoplay=1&rel=0&modestbranding=1`}
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                        title={video.nama}
                    />
                </div>

                <div className="relative isolate overflow-hidden flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_100%,#2563EB_0%,transparent_60%)] opacity-50" />
                    <div className="min-w-0">
                        <h3 className="font-calsans text-lg md:text-xl leading-tight">{video.nama}</h3>
                        {video.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-blue-100/70">{video.description}</p>}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            <Tag>{video.program}</Tag>
                            {video.penyelenggara && <Tag muted>{video.penyelenggara}</Tag>}
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <a
                            href={`https://youtu.be/${video.ytId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 md:flex-none items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-xs font-bold hover:bg-white/[0.16] transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" /> YouTube
                        </a>
                        <button
                            type="button"
                            onClick={share}
                            className={`inline-flex flex-1 md:flex-none items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-bold transition-colors ${copied ? "bg-emerald-400 text-emerald-950" : "bg-white text-[#0B1B3F] hover:bg-sky-100"}`}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                            {copied ? "Tautan disalin" : "Bagikan"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

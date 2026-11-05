"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDownAZ, ArrowLeft, BookOpen, Calendar, ChevronRight, Clock, Download, ExternalLink, FileText, Info, Layers, Loader2, Search, X } from "lucide-react";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { fileModuleBaseUrl } from "@/constants/urls";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/* react-pdf dimuat malas + worker diset di loader (tidak masuk bundle awal) */
const loadPdf = () =>
    import("react-pdf").then((m) => {
        m.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${m.pdfjs.version}/build/pdf.worker.min.mjs`;
        return m;
    });
const PdfDocument = dynamic(() => loadPdf().then((m) => m.Document), { ssr: false });
const PdfPage = dynamic(() => loadPdf().then((m) => m.Page), { ssr: false });

const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";
const PAGES_STEP = 5;

const fileUrl = (f: string) => (f.startsWith("http") ? f : `${fileModuleBaseUrl || ""}/${f}`);

/** Warna aksen per bidang */
const accentOf = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (/perikanan|akuakultur|aquaculture|budidaya|tangkap|pemasaran/.test(c)) return "#3B82F6";
    if (/kelautan|ruang laut|pesisir|wisata|ppkrl|garam/.test(c)) return "#10B981";
    if (/vokasi|umum|manajemen|sdm|kepemimpinan|puslatluh/.test(c)) return "#F59E0B";
    if (/pengawasan|psdkp|karantina|keamanan|hukum/.test(c)) return "#F43F5E";
    return "#8B5CF6";
};

/* ───────── PDF viewer ───────── */
function PdfModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
    const [pages, setPages] = useState(0);
    const [shown, setShown] = useState(PAGES_STEP);
    const [failed, setFailed] = useState(false);
    const [width, setWidth] = useState(800);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setWidth(Math.min(900, e.contentRect.width - 32)));
        ro.observe(el);
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            ro.disconnect();
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" aria-label={`Pratinjau ${title}`} className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#020617]/90 p-2 sm:p-4 backdrop-blur-sm font-jakarta" onClick={onClose}>
            <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">Pratinjau modul{pages ? ` · ${pages} halaman` : ""}</p>
                        <p className="truncate text-sm font-bold">{title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <a href={url} target="_blank" rel="noopener" title="Buka di tab baru" className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20"><ExternalLink className="h-4 w-4" /></a>
                        <a href={url} download title="Unduh" className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20"><Download className="h-4 w-4" /></a>
                        <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0B1B3F] hover:bg-sky-100"><X className="h-4 w-4" /></button>
                    </div>
                </div>
                <div ref={box} className="flex-1 overflow-auto bg-slate-200 py-4">
                    {failed ? (
                        <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-600">
                            <FileText className="h-8 w-8" />
                            <p className="text-sm font-bold">Pratinjau tidak dapat ditampilkan.</p>
                            <a href={url} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"><ExternalLink className="h-4 w-4" /> Buka dokumen</a>
                        </div>
                    ) : (
                        <PdfDocument
                            file={url}
                            onLoadSuccess={({ numPages }: { numPages: number }) => setPages(numPages)}
                            onLoadError={() => setFailed(true)}
                            loading={<div className="flex items-center justify-center gap-2 py-24 text-sm font-semibold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Menyiapkan dokumen…</div>}
                            className="flex flex-col items-center gap-4"
                        >
                            {Array.from({ length: Math.min(pages, shown) }, (_, i) => (
                                <div key={i} className="shadow-lg">
                                    <PdfPage pageNumber={i + 1} width={width} renderTextLayer renderAnnotationLayer loading={<div style={{ width, height: width * 1.4 }} className="bg-white" />} />
                                </div>
                            ))}
                            {pages > shown && (
                                <button type="button" onClick={() => setShown((s) => s + PAGES_STEP)} className="h-10 rounded-xl bg-[#0B1B3F] px-5 text-sm font-bold text-white hover:bg-blue-700">
                                    Tampilkan halaman {shown + 1}–{Math.min(pages, shown + PAGES_STEP)} dari {pages}
                                </button>
                            )}
                        </PdfDocument>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ───────── Katalog ───────── */
export default function MateriClient() {
    const { data = [], loading, error } = useFetchDataMateriPelatihanMasyarakat("Modul");
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("");
    const [sort, setSort] = useState<"az" | "mod">("az");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pdf, setPdf] = useState<{ url: string; title: string } | null>(null);

    // Sinkron detail dengan URL (?materi=)
    useEffect(() => {
        const read = () => setSelectedId(new URLSearchParams(window.location.search).get("materi"));
        read();
        window.addEventListener("popstate", read);
        return () => window.removeEventListener("popstate", read);
    }, []);
    const openDetail = (id: string | null) => {
        const url = new URL(window.location.href);
        if (id) url.searchParams.set("materi", id);
        else url.searchParams.delete("materi");
        window.history.pushState(null, "", url);
        setSelectedId(id);
        document.getElementById("katalog")?.scrollIntoView({ block: "start" });
    };
    const closePdf = useCallback(() => setPdf(null), []);

    const modules = useMemo(() => (data as MateriPelatihan[]).filter((m) => m.BerlakuSampai === "1"), [data]);
    const cats = useMemo(() => {
        const m = new Map<string, number>();
        modules.forEach((x) => x.BidangMateriPelatihan && m.set(x.BidangMateriPelatihan, (m.get(x.BidangMateriPelatihan) || 0) + 1));
        return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    }, [modules]);
    const list = useMemo(() => {
        const s = q.trim().toLowerCase();
        return modules
            .filter((m) => (!cat || m.BidangMateriPelatihan === cat) && (!s || `${m.NamaMateriPelatihan} ${m.BidangMateriPelatihan} ${m.DeskripsiMateriPelatihan ?? ""}`.toLowerCase().includes(s)))
            .sort((a, b) => (sort === "az" ? a.NamaMateriPelatihan.localeCompare(b.NamaMateriPelatihan) : (b.ModulPelatihan?.length || 0) - (a.ModulPelatihan?.length || 0)));
    }, [modules, q, cat, sort]);
    const totalUnit = useMemo(() => modules.reduce((n, m) => n + (m.ModulPelatihan?.length || 0), 0), [modules]);

    const selected = selectedId ? modules.find((m) => String(m.IdMateriPelatihan) === selectedId) : null;
    const isLoading = loading && modules.length === 0;
    const chip = (on: boolean) => `h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap ring-1 transition-all ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`;

    /* ── Detail ── */
    if (selected) {
        const accent = accentOf(selected.BidangMateriPelatihan);
        const units = selected.ModulPelatihan || [];
        return (
            <section id="katalog" aria-labelledby="materi-detail" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:px-8 pb-16">
                <button type="button" onClick={() => openDetail(null)} className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
                </button>
                <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                    <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl text-white" style={{ background: accent }}><BookOpen className="h-7 w-7" /></span>
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} /> {selected.BidangMateriPelatihan}</p>
                        <h2 id="materi-detail" className="font-calsans text-2xl md:text-3xl leading-tight">{selected.NamaMateriPelatihan}</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{selected.DeskripsiMateriPelatihan || "Modul pelatihan terstandar sebagai panduan teknis penyelenggaraan pelatihan."}</p>
                        <dl className="grid grid-cols-3 gap-2">
                            {[
                                { icon: Clock, l: "Durasi", v: selected.JamPelajaran ? `${selected.JamPelajaran} JP` : "—" },
                                { icon: Calendar, l: "Tahun", v: selected.Tahun || "—" },
                                { icon: Layers, l: "Unit", v: `${units.length} file` },
                            ].map((x) => (
                                <div key={x.l} className={`${card} p-3`}>
                                    <x.icon className="h-4 w-4 text-sky-300" aria-hidden />
                                    <dt className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500">{x.l}</dt>
                                    <dd className="text-sm font-bold">{x.v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className={`${card} p-4 md:p-5`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="font-calsans text-lg">Daftar unit modul</h3>
                            <span className="text-xs text-slate-400">{units.length} file</span>
                        </div>
                        {units.length === 0 ? (
                            <p className="py-10 text-center text-sm text-slate-400">Belum ada file modul.</p>
                        ) : (
                            <ol className="mt-3 space-y-2">
                                {units.map((m: ModulPelatihan, i: number) => (
                                    <li key={m.IdModulPelatihan} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5 transition-colors hover:bg-white/[0.06]">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-black" style={{ background: `${accent}26`, color: accent }}>{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold leading-snug line-clamp-2">{m.NamaModulPelatihan}</p>
                                            {m.JamPelajaran && <p className="mt-0.5 text-[11px] text-slate-500">{m.JamPelajaran} JP</p>}
                                        </div>
                                        {m.FileModule ? (
                                            <div className="flex shrink-0 gap-1.5">
                                                <button type="button" onClick={() => setPdf({ url: fileUrl(m.FileModule), title: m.NamaModulPelatihan })} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold hover:bg-blue-500">
                                                    <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Baca</span>
                                                </button>
                                                <a href={fileUrl(m.FileModule)} download title="Unduh" aria-label={`Unduh ${m.NamaModulPelatihan}`} className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/15 hover:bg-white/[0.12]">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="shrink-0 text-[11px] text-slate-500">Belum tersedia</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        )}
                        <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[12px] leading-relaxed text-slate-400 ring-1 ring-white/5">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" /> Gunakan modul sesuai prosedur yang berlaku. Distribusi komersial tanpa izin tertulis dilarang.
                        </p>
                    </div>
                </div>
                {pdf && <PdfModal url={pdf.url} title={pdf.title} onClose={closePdf} />}
            </section>
        );
    }

    /* ── Katalog ── */
    return (
        <section id="katalog" aria-labelledby="katalog-title" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:px-8 pb-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="katalog-title" className="font-calsans text-2xl md:text-3xl">Katalog modul pelatihan</h2>
                <dl className="grid grid-cols-3 gap-2">
                    {[["Materi", modules.length], ["Unit modul", totalUnit], ["Bidang", cats.length]].map(([l, v]) => (
                        <div key={l} className={`${card} px-4 py-2.5`}>
                            <dd className="font-calsans text-xl leading-none">{isLoading ? "…" : v}</dd>
                            <dt className="mt-1 text-[11px] text-slate-400">{l}</dt>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="sticky top-16 z-30 -mx-4 mt-5 px-4 py-2 md:mx-0 md:px-0">
                <div className="space-y-2 rounded-2xl bg-[#0B1B3F]/85 p-2 ring-1 ring-white/10 backdrop-blur shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)]">
                    <div className="flex gap-2">
                        <label className="relative flex-1">
                            <span className="sr-only">Cari materi</span>
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/50" />
                            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari judul atau bidang materi…" className="h-11 w-full rounded-xl border-none bg-[#020617]/50 pl-10 pr-9 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-blue-100/40 focus:ring-2 focus:ring-sky-400/60 [&::-webkit-search-cancel-button]:hidden" />
                            {q && <button type="button" onClick={() => setQ("")} aria-label="Hapus" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-100/60 hover:text-white"><X className="h-4 w-4" /></button>}
                        </label>
                        <label className="relative">
                            <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
                            <select value={sort} onChange={(e) => setSort(e.target.value as "az" | "mod")} aria-label="Urutkan" className="h-11 rounded-xl border-none bg-[#020617]/50 pl-9 pr-3 text-xs font-bold text-white outline-none ring-1 ring-white/10 [&>option]:text-slate-900">
                                <option value="az">A–Z</option>
                                <option value="mod">Unit terbanyak</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]" role="radiogroup" aria-label="Bidang">
                        <button type="button" role="radio" aria-checked={!cat} onClick={() => setCat("")} className={chip(!cat)}>Semua <span className="opacity-60">{modules.length}</span></button>
                        {cats.map(([c, n]) => (
                            <button key={c} type="button" role="radio" aria-checked={cat === c} onClick={() => setCat(c)} className={`${chip(cat === c)} inline-flex items-center gap-1.5`}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentOf(c) }} /> {c} <span className="opacity-60">{n}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{[0, 1, 2, 3, 4, 5].map((i) => <li key={i} className={`${card} h-48 animate-pulse`} />)}</ul>
                ) : error && modules.length === 0 ? (
                    <div className={`${card} py-14 text-center`}>
                        <p className="font-calsans text-lg">Gagal memuat materi</p>
                        <button type="button" onClick={() => window.location.reload()} className="mt-4 h-10 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-500">Coba lagi</button>
                    </div>
                ) : list.length === 0 ? (
                    <div className={`${card} py-14 text-center`}>
                        <Search className="mx-auto h-6 w-6 text-slate-500" />
                        <p className="mt-2 font-bold">Materi tidak ditemukan</p>
                        <p className="text-sm text-slate-400">Coba kata kunci atau bidang lain.</p>
                    </div>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((m) => {
                            const accent = accentOf(m.BidangMateriPelatihan);
                            const id = String(m.IdMateriPelatihan);
                            return (
                                <li key={id}>
                                    <article className={`group relative flex h-full flex-col ${card} p-5 transition-colors hover:bg-white/[0.06] hover:ring-white/20`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${accent}26`, color: accent }}><BookOpen className="h-5 w-5" /></span>
                                            {m.Tahun && <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-white/10">{m.Tahun}</span>}
                                        </div>
                                        <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} /> {m.BidangMateriPelatihan}</p>
                                        <h3 className="mt-1 text-sm font-bold leading-snug line-clamp-2 group-hover:text-sky-200">
                                            <a href={`?materi=${encodeURIComponent(id)}`} onClick={(e) => { e.preventDefault(); openDetail(id); }} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-sky-400">
                                                {m.NamaMateriPelatihan}
                                            </a>
                                        </h3>
                                        {m.DeskripsiMateriPelatihan && <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">{m.DeskripsiMateriPelatihan}</p>}
                                        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 mt-4 text-xs">
                                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300"><Layers className="h-3.5 w-3.5 text-sky-300" /> {m.ModulPelatihan?.length || 0} unit modul</span>
                                            <ChevronRight className="h-4 w-4 text-sky-300 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}

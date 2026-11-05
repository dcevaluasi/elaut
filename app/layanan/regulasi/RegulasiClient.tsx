"use client";

/**
 * Daftar regulasi interaktif. Data awal dari server (SSR) → langsung terindeks.
 * Fallback: bila server gagal, ambil ulang di klien.
 */
import React from "react";
import { ArrowDownWideNarrow, Calendar, Download, ExternalLink, FileText, Info, RotateCcw, Scale, Search, X } from "lucide-react";
import { getRegulasi, RegulasiData } from "@/utils/regulasi";

const CATEGORY_ORDER = ["Undang-Undang", "Peraturan Pemerintah", "Peraturan Menteri", "Keputusan Menteri", "Peraturan Kepala Badan", "Keputusan Kepala Badan", "Peraturan Kepala Pusat", "Keputusan Kepala Pusat", "Edaran"];
const PAGE = 10;
type Sort = "terbaru" | "terlama" | "judul";

export const fileUrl = (f?: string) => (!f ? "" : f.startsWith("http") ? f : `https://elaut-bppsdm.kkp.go.id/api-elaut/public/regulasi_pelatihan/${f}`);

const statusTone = (s?: string) =>
    !s || s === "Berlaku" ? "bg-emerald-500/10 ring-emerald-400/25 text-emerald-200" : s === "Dicabut" ? "bg-rose-500/10 ring-rose-400/25 text-rose-200" : "bg-amber-500/10 ring-amber-400/25 text-amber-200";

const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";

export default function RegulasiClient({ initial }: { initial: RegulasiData[] | null }) {
    const [list, setList] = React.useState<RegulasiData[]>(initial ?? []);
    const [state, setState] = React.useState<"ok" | "loading" | "error">(initial ? "ok" : "loading");
    const [tries, setTries] = React.useState(0);
    const [q, setQ] = React.useState("");
    const [kat, setKat] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [sort, setSort] = React.useState<Sort>("terbaru");
    const [limit, setLimit] = React.useState(PAGE);

    React.useEffect(() => {
        if (initial && tries === 0) return;
        let alive = true;
        setState("loading");
        getRegulasi()
            .then((d) => alive && (setList(d || []), setState("ok")))
            .catch(() => alive && setState("error"));
        return () => {
            alive = false;
        };
    }, [initial, tries]);

    React.useEffect(() => setLimit(PAGE), [q, kat, status, sort]);

    const cats = React.useMemo(() => {
        const m = new Map<string, number>();
        list.forEach((r) => r.kategori_regulasi && m.set(r.kategori_regulasi, (m.get(r.kategori_regulasi) || 0) + 1));
        const idx = (c: string) => (CATEGORY_ORDER.indexOf(c) + 1 || 99);
        return Array.from(m.entries()).sort((a, b) => idx(a[0]) - idx(b[0]));
    }, [list]);
    const statuses = React.useMemo(() => Array.from(new Set(list.map((r) => r.status || "Berlaku"))), [list]);

    const results = React.useMemo(() => {
        const s = q.trim().toLowerCase();
        const year = (r: RegulasiData) => Number(r.tahun) || 0;
        return list
            .filter((r) =>
                (!kat || r.kategori_regulasi === kat) &&
                (!status || (r.status || "Berlaku") === status) &&
                (!s || [r.judul, r.no_peraturan, r.tahun, r.ruang_lingkup].some((v) => String(v ?? "").toLowerCase().includes(s))))
            .sort((a, b) => (sort === "judul" ? a.judul.localeCompare(b.judul) : (year(b) - year(a)) * (sort === "terbaru" ? 1 : -1)));
    }, [list, q, kat, status, sort]);

    const berlaku = list.filter((r) => !r.status || r.status === "Berlaku").length;
    const active = !!(q || kat || status);
    const reset = () => { setQ(""); setKat(""); setStatus(""); };
    const chip = (on: boolean) => `h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap ring-1 transition-all ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`;

    return (
        <section id="daftar-regulasi" aria-labelledby="daftar-regulasi-title" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 md:px-8 pb-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">Basis data hukum</p>
                    <h2 id="daftar-regulasi-title" className="mt-2 font-calsans text-2xl md:text-3xl">Daftar regulasi pelatihan KP</h2>
                </div>
                <dl className="grid grid-cols-3 gap-2">
                    {[["Total", list.length], ["Berlaku", berlaku], ["Kategori", cats.length]].map(([l, v]) => (
                        <div key={l} className={`${card} px-4 py-2.5`}>
                            <dd className="font-calsans text-xl leading-none">{state === "loading" ? "…" : v}</dd>
                            <dt className="mt-1 text-[11px] text-slate-400">{l}</dt>
                        </div>
                    ))}
                </dl>
            </div>

            {/* Toolbar lengket */}
            <div className="sticky top-16 z-30 -mx-4 mt-5 px-4 py-2 md:mx-0 md:px-0">
                <div className="rounded-2xl bg-[#0B1B3F]/85 backdrop-blur ring-1 ring-white/10 p-2 space-y-2 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col md:flex-row gap-2">
                        <label className="relative flex-1">
                            <span className="sr-only">Cari regulasi</span>
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-100/50" />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari judul, nomor, tahun, atau ruang lingkup…"
                                className="h-11 w-full rounded-xl bg-[#020617]/50 pl-10 pr-9 text-sm text-white ring-1 ring-white/10 border-none outline-none placeholder:text-blue-100/40 focus:ring-2 focus:ring-sky-400/60 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {q && (
                                <button type="button" onClick={() => setQ("")} aria-label="Hapus kata kunci" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-100/60 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </label>
                        <div className="flex gap-2">
                            {statuses.length > 1 && (
                                <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status regulasi" className="h-11 rounded-xl bg-[#020617]/50 px-3 text-xs font-bold text-white ring-1 ring-white/10 border-none outline-none [&>option]:text-slate-900">
                                    <option value="">Semua status</option>
                                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}
                            <label className="relative">
                                <ArrowDownWideNarrow className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-300" />
                                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Urutkan" className="h-11 rounded-xl bg-[#020617]/50 pl-9 pr-3 text-xs font-bold text-white ring-1 ring-white/10 border-none outline-none [&>option]:text-slate-900">
                                    <option value="terbaru">Tahun terbaru</option>
                                    <option value="terlama">Tahun terlama</option>
                                    <option value="judul">Judul A–Z</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]" role="radiogroup" aria-label="Kategori regulasi">
                        <button type="button" role="radio" aria-checked={!kat} onClick={() => setKat("")} className={chip(!kat)}>Semua <span className="opacity-60">{list.length}</span></button>
                        {cats.map(([c, n]) => (
                            <button key={c} type="button" role="radio" aria-checked={kat === c} onClick={() => setKat(c)} className={chip(kat === c)}>
                                {c} <span className="opacity-60">{n}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <p className="mt-2 px-1 text-xs text-slate-400" aria-live="polite">
                {state === "ok" && <><b className="text-white">{results.length}</b> regulasi{active && <> · <button type="button" onClick={reset} className="font-bold text-sky-300 hover:text-white">reset filter</button></>}</>}
            </p>

            {/* Hasil */}
            <div className="mt-3">
                {state === "loading" ? (
                    <ul className="space-y-2.5" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className={`${card} h-36 animate-pulse`} />)}</ul>
                ) : state === "error" || results.length === 0 ? (
                    <div className={`${card} flex flex-col items-center px-4 py-14 text-center`}>
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-slate-400"><FileText className="h-6 w-6" /></span>
                        <h3 className="mt-3 font-calsans text-lg">{state === "error" ? "Gagal memuat regulasi" : "Regulasi tidak ditemukan"}</h3>
                        <p className="mt-1 mb-5 max-w-sm text-sm text-slate-400">{state === "error" ? "Periksa koneksi internet lalu coba lagi." : "Coba kata kunci lain atau ganti kategori."}</p>
                        {state === "error" ? (
                            <button type="button" onClick={() => setTries((t) => t + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-500"><RotateCcw className="h-4 w-4" /> Coba lagi</button>
                        ) : active && (
                            <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#0B1B3F] hover:bg-sky-100"><RotateCcw className="h-4 w-4" /> Reset filter</button>
                        )}
                    </div>
                ) : (
                    <>
                        <ol className="space-y-2.5">
                            {results.slice(0, limit).map((r) => {
                                const url = fileUrl(r.file);
                                const nomor = `${r.no_peraturan}${r.tahun ? ` Tahun ${r.tahun}` : ""}`;
                                return (
                                    <li key={r.id} id={`regulasi-${r.id}`}>
                                        <article className={`group ${card} p-5 transition-colors hover:bg-white/[0.06] hover:ring-white/20`}>
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200 ring-1 ring-sky-400/20"><Scale className="h-3 w-3" />{r.kategori_regulasi}</span>
                                                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${statusTone(r.status)}`}>{r.status || "Berlaku"}</span>
                                                        {r.tanggal_pengundangan && <span className="inline-flex items-center gap-1 text-[11px] text-slate-400"><Calendar className="h-3 w-3" />{r.tanggal_pengundangan}</span>}
                                                    </div>
                                                    <h3 className="mt-2.5 text-base md:text-lg font-bold leading-snug group-hover:text-sky-200">{r.judul}</h3>
                                                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
                                                        <div><dt className="text-slate-500">Nomor</dt><dd className="font-semibold text-slate-200">{nomor}</dd></div>
                                                        {r.ruang_lingkup && <div><dt className="text-slate-500">Ruang lingkup</dt><dd className="font-semibold text-slate-200">{r.ruang_lingkup}</dd></div>}
                                                        {r.sumber && <div className="min-w-0"><dt className="text-slate-500">Sumber</dt><dd className="truncate font-semibold text-slate-200" title={r.sumber}>{r.sumber}</dd></div>}
                                                    </dl>
                                                    {r.perubahan_turunan_terkait && r.perubahan_turunan_terkait !== "-" && (
                                                        <p className="mt-3 flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-[12px] leading-relaxed text-slate-400 ring-1 ring-white/5">
                                                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" /> <span><b className="text-slate-300">Terkait:</b> {r.perubahan_turunan_terkait}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex md:flex-col gap-2 shrink-0">
                                                    {url ? (
                                                        <>
                                                            <a href={url} target="_blank" rel="noopener" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold hover:bg-blue-500" aria-label={`Lihat dokumen ${r.judul}`}>
                                                                <ExternalLink className="h-4 w-4" /> Lihat dokumen
                                                            </a>
                                                            <a href={url} download className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 text-xs font-bold ring-1 ring-white/15 hover:bg-white/[0.12]" aria-label={`Unduh ${r.judul}`}>
                                                                <Download className="h-4 w-4" /> Unduh PDF
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.03] px-4 text-xs font-bold text-slate-500 ring-1 ring-white/5">Dokumen belum tersedia</span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    </li>
                                );
                            })}
                        </ol>
                        {results.length > limit && (
                            <div className="mt-6 flex justify-center">
                                <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="h-11 rounded-xl bg-white/[0.06] px-6 text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                                    Tampilkan {Math.min(PAGE, results.length - limit)} regulasi lagi
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

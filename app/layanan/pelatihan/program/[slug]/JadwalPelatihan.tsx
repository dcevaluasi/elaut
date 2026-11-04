"use client";

/**
 * Daftar jadwal pelatihan (satu-satunya bagian interaktif halaman program).
 * - Data diambil sekali; filter/urut/cari instan di klien.
 * - Kotak cari ada di hero (server, form GET `?q=`) → dibaca & disinkron di sini (progressive enhancement).
 * - Kartu bergaya sama dengan kartu FAQ (bg-white/[0.04] ring-white/10).
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, ArrowUpDown, Calendar, CheckCircle2, Clock, Eye, MapPin, RotateCcw, School, SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import { BALAI_PELATIHAN, JENIS_PELAKSANAAN } from "@/constants/pelatihan";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { createSlug } from "@/utils";
import { encryptValue, formatToRupiah, getMonthName } from "@/lib/utils";
import { formatDateRange } from "@/utils/time";

const PAGE = 9;
const ALL = "__all";
const DAY = 864e5;
const SEARCH_INPUT_ID = "hp-q"; // sama dengan page.tsx
const SEARCH_FORM_ID = "hp-search";

const toDate = (s?: string) => {
    const d = s ? new Date(s) : null;
    return d && !isNaN(d.getTime()) ? d : null;
};
const today0 = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
};

/** Selesai bila StatusApproval "Selesai" ATAU hari ini lewat TanggalBerakhirPelatihan (bukan batas pendaftaran). */
export const checkIsTrainingFinished = (p: PelatihanMasyarakat): boolean => {
    if (p?.StatusApproval === "Selesai") return true;
    const end = toDate(p?.TanggalBerakhirPelatihan);
    if (!end) return false;
    end.setHours(23, 59, 59, 999);
    return today0() > end;
};
const daysLeft = (p: PelatihanMasyarakat) => {
    const end = toDate(p?.TanggalBerakhirPendaftaran);
    if (!end) return null;
    end.setHours(0, 0, 0, 0);
    return Math.round((end.getTime() - today0().getTime()) / DAY);
};

type Row = { p: PelatihanMasyarakat; done: boolean; left: number | null; open: boolean; free: boolean };
type Filters = { status: string; bayar: string; balai: string; metode: string };
type Sort = "terdekat" | "deadline" | "termurah";
const EMPTY: Filters = { status: ALL, bayar: ALL, balai: ALL, metode: ALL };
const SORT_LABEL: Record<Sort, string> = { terdekat: "Jadwal terdekat", deadline: "Segera tutup", termurah: "Biaya termurah" };

const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";
const glass = "bg-[#0B1B3F]/85 backdrop-blur ring-1 ring-white/10";

function Pills({ label, value, onChange, options, accent }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; accent: string }) {
    return (
        <div role="radiogroup" aria-label={label} className="flex shrink-0 gap-1 p-1 rounded-2xl bg-[#020617]/50 ring-1 ring-white/10">
            {options.map((o) => {
                const on = o.value === value;
                return (
                    <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
                        className={`relative isolate overflow-hidden h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap ring-1 transition-all ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`}>
                        {on && <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${accent}55 0%, transparent 85%)` }} />}
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

function Drop({ label, icon: Icon, value, onChange, allLabel, options }: { label: string; icon: React.ElementType; value: string; onChange: (v: string) => void; allLabel?: string; options: { value: string; label: string }[] }) {
    const current = options.find((o) => o.value === value)?.label ?? allLabel;
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger aria-label={label} className="h-11 w-fit shrink-0 gap-2 rounded-2xl border-0 bg-[#020617]/50 px-3.5 text-xs font-bold text-white ring-1 ring-white/10 hover:bg-white/[0.06] focus:ring-2 focus:ring-sky-400/60">
                <div className="flex items-center w-fit flex-row gap-2 truncate">
                    <Icon className="w-4 block h-4 shrink-0 text-sky-300" aria-hidden />
                    <div className={`truncate block ${value === ALL ? "text-blue-100/70" : ""}`}>{current}</div>
                </div>
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-72 bg-[#0B1B3F] border-white/10 text-white">
                <SelectGroup>
                    {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
                    {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

function Card({ r, accent }: { r: Row; accent: string }) {
    const { p, done, left, open, free } = r;
    const href = `/layanan/pelatihan/${createSlug(p.NamaPelatihan)}/${p?.KodePelatihan}/${encryptValue(p?.IdPelatihan)}`;
    const chip = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ring-1";
    const urgent = open && left !== null && left <= 7;
    const state = done
        ? { text: "Selesai", cls: "bg-amber-500/10 ring-amber-400/25 text-amber-200" }
        : open
            ? { text: urgent ? (left === 0 ? "Tutup hari ini" : `Tutup ${left} hari lagi`) : "Dibuka", cls: urgent ? "bg-rose-500/10 ring-rose-400/25 text-rose-200" : "bg-emerald-500/10 ring-emerald-400/25 text-emerald-200" }
            : { text: "Pendaftaran ditutup", cls: "bg-white/[0.06] ring-white/15 text-blue-100/70" };

    return (
        <article className={`group relative flex h-full flex-col ${card} p-5 transition-all hover:bg-white/[0.06] hover:ring-white/20 ${done ? "opacity-80 hover:opacity-100" : ""}`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`${chip} ${state.cls}`}>
                    {done ? <CheckCircle2 className="w-3 h-3" aria-hidden /> : open && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden />}
                    {state.text}
                </span>
                <span className={`${chip} ${free ? "bg-emerald-500/10 ring-emerald-400/25 text-emerald-200" : "bg-cyan-500/10 ring-cyan-400/25 text-cyan-200"}`}>{free ? "Gratis" : "Berbayar"}</span>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
                {p.BidangPelatihan || "Pelatihan KP"}
            </p>
            <h3 className="mt-1 text-sm sm:text-base font-bold leading-snug line-clamp-3">
                <Link href={href} onClick={() => Cookies.set("JenisProgram", p?.JenisProgram)} className="after:absolute after:inset-0 after:rounded-2xl group-hover:text-sky-200 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-sky-400">
                    {p.NamaPelatihan}
                </Link>
            </h3>

            <dl className="mt-4 grid gap-1.5 text-xs text-slate-400">
                {[
                    { icon: School, label: "Penyelenggara", value: p.PenyelenggaraPelatihan },
                    { icon: MapPin, label: "Lokasi", value: `${p.LokasiPelatihan || "-"} · ${p.PelaksanaanPelatihan || "Offline"}` },
                    { icon: Calendar, label: "Pelaksanaan", value: p.TanggalMulaiPelatihan ? getMonthName(p.TanggalMulaiPelatihan) : "-" },
                    { icon: Clock, label: "Pendaftaran", value: formatDateRange(p.TanggalMulaiPendaftaran, p.TanggalBerakhirPendaftaran) },
                ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2 min-w-0">
                        <dt className="sr-only">{m.label}</dt>
                        <m.icon className="w-3.5 h-3.5 shrink-0 text-sky-300/80" aria-hidden />
                        <dd className="truncate">{m.value}</dd>
                    </div>
                ))}
            </dl>

            <div className="mt-auto pt-4">
                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-base font-extrabold">{free ? <span className="text-emerald-300">Gratis</span> : formatToRupiah(p.HargaPelatihan)}</p>
                    <span aria-hidden className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-bold transition-colors ${open ? "bg-blue-600 group-hover:bg-blue-500" : "bg-white/[0.06] ring-1 ring-white/15 group-hover:bg-white/[0.12]"}`}>
                        {open ? <>Daftar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></> : <><Eye className="w-3.5 h-3.5" /> Detail</>}
                    </span>
                </div>
            </div>
        </article>
    );
}

export default function JadwalPelatihan({ jenisProgram, accent }: { jenisProgram: string; accent: string }) {
    const [raw, setRaw] = React.useState<PelatihanMasyarakat[]>([]);
    const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading");
    const [reloadKey, setReloadKey] = React.useState(0);
    const [q, setQ] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [f, setF] = React.useState<Filters>(EMPTY);
    const [sort, setSort] = React.useState<Sort>("terdekat");
    const [limit, setLimit] = React.useState(PAGE);
    const listRef = React.useRef<HTMLElement>(null);
    const goList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Ambil data
    React.useEffect(() => {
        const ctrl = new AbortController();
        setStatus("loading");
        axios.get(`${elautBaseUrl}/lemdik/getPelatihan`, { signal: ctrl.signal })
            .then((res) => {
                const items: PelatihanMasyarakat[] = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
                setRaw(items.filter((i) => (!i.JenisProgram || i.JenisProgram === jenisProgram) && (!i.Status || i.Status === "Publish")));
                setStatus("ok");
            })
            .catch((e) => !axios.isCancel(e) && setStatus("error"));
        return () => ctrl.abort();
    }, [jenisProgram, reloadKey]);

    // Sinkron dengan kotak cari di hero (server-rendered)
    React.useEffect(() => {
        const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
        const form = document.getElementById(SEARCH_FORM_ID) as HTMLFormElement | null;
        const initial = new URLSearchParams(window.location.search).get("q") ?? "";
        if (initial) { setQ(initial); setQuery(initial.toLowerCase()); if (input) input.value = initial; }
        const onInput = () => setQ(input?.value ?? "");
        const onSubmit = (e: Event) => { e.preventDefault(); setQuery((input?.value ?? "").trim().toLowerCase()); goList(); };
        input?.addEventListener("input", onInput);
        form?.addEventListener("submit", onSubmit);
        return () => { input?.removeEventListener("input", onInput); form?.removeEventListener("submit", onSubmit); };
    }, []);
    const setSearch = (v: string) => {
        setQ(v);
        const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
        if (input) input.value = v;
    };

    React.useEffect(() => {
        const t = setTimeout(() => setQuery(q.trim().toLowerCase()), 250);
        return () => clearTimeout(t);
    }, [q]);
    React.useEffect(() => setLimit(PAGE), [query, f, sort]);

    const rows = React.useMemo<Row[]>(() => raw.map((p) => {
        const done = checkIsTrainingFinished(p);
        const left = daysLeft(p);
        return { p, done, left, open: !done && (left === null || left >= 0), free: Number(p?.HargaPelatihan) === 0 };
    }), [raw]);

    const results = React.useMemo(() => {
        const time = (s?: string) => toDate(s)?.getTime() ?? Infinity;
        return rows
            .filter((r) =>
                (f.status === ALL || (f.status === "Buka" ? r.open : r.done)) &&
                (f.bayar === ALL || r.p.JenisPelatihan === f.bayar) &&
                (f.balai === ALL || r.p.PenyelenggaraPelatihan?.toLowerCase().includes(f.balai.toLowerCase())) &&
                (f.metode === ALL || r.p.PelaksanaanPelatihan === f.metode) &&
                (!query || [r.p.NamaPelatihan, r.p.BidangPelatihan, r.p.PenyelenggaraPelatihan, r.p.LokasiPelatihan].some((s) => s?.toLowerCase().includes(query))))
            .sort((a, b) =>
                Number(b.open) - Number(a.open) || Number(a.done) - Number(b.done) ||
                (sort === "deadline" ? (a.left ?? 1e9) - (b.left ?? 1e9) : sort === "termurah" ? Number(a.p.HargaPelatihan || 0) - Number(b.p.HargaPelatihan || 0) : time(a.p.TanggalMulaiPelatihan) - time(b.p.TanggalMulaiPelatihan)));
    }, [rows, f, query, sort]);

    const stats = React.useMemo(() => ({
        open: rows.filter((r) => r.open).length,
        free: rows.filter((r) => r.open && r.free).length,
        lemdik: new Set(rows.map((r) => r.p.PenyelenggaraPelatihan).filter(Boolean)).size,
    }), [rows]);

    const set = (k: keyof Filters) => (v: string) => setF((s) => ({ ...s, [k]: v }));
    const reset = () => { setSearch(""); setF(EMPTY); };
    const active = [
        q && { k: "q", label: `“${q}”`, clear: () => setSearch("") },
        f.status !== ALL && { k: "status", label: f.status === "Buka" ? "Dibuka" : "Selesai", clear: () => set("status")(ALL) },
        f.bayar !== ALL && { k: "bayar", label: f.bayar, clear: () => set("bayar")(ALL) },
        f.balai !== ALL && { k: "balai", label: f.balai, clear: () => set("balai")(ALL) },
        f.metode !== ALL && { k: "metode", label: f.metode, clear: () => set("metode")(ALL) },
    ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

    return (
        <section ref={listRef} id="cari-pelatihan" aria-labelledby="cari-pelatihan-title" className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-20 px-4 md:px-8 pb-16">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">Jadwal resmi Lemdiklat KP</p>
                    <h2 id="cari-pelatihan-title" className="mt-2 font-calsans text-2xl md:text-3xl leading-tight">Jadwal {jenisProgram.toLowerCase().startsWith("pelatihan") ? jenisProgram.toLowerCase() : `pelatihan ${jenisProgram.toLowerCase()}`} terbaru</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Dibuka", value: stats.open, on: () => { setF({ ...EMPTY, status: "Buka" }); } },
                        { label: "Gratis", value: stats.free, on: () => { setF({ ...EMPTY, status: "Buka", bayar: "Gratis" }); } },
                        { label: "Lemdiklat", value: stats.lemdik, on: () => setF(EMPTY) },
                    ].map((s) => (
                        <button key={s.label} type="button" onClick={s.on} className={`${card} px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06] hover:ring-white/20`}>
                            <span className="block font-calsans text-xl leading-none">{status === "loading" ? <span className="inline-block h-5 w-7 rounded bg-white/10 animate-pulse align-middle" /> : s.value}</span>
                            <span className="mt-1 block text-[11px] text-slate-400">{s.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar lengket */}
            <div className="sticky top-16 z-30 -mx-4 mt-5 px-4 py-2 md:mx-0 md:px-0">
                <div className={`rounded-2xl p-2 ${glass} shadow-[0_20px_50px_-25px_rgba(0,0,0,0.8)]`}>
                    <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                        <SlidersHorizontal className="ml-2 w-4 h-4 shrink-0 text-sky-300" aria-hidden />
                        <Pills label="Status" value={f.status} onChange={set("status")} accent={accent} options={[{ value: ALL, label: "Semua" }, { value: "Buka", label: "Dibuka" }, { value: "Selesai", label: "Selesai" }]} />
                        <Pills label="Biaya" value={f.bayar} onChange={set("bayar")} accent={accent} options={[{ value: ALL, label: "Semua biaya" }, { value: "Gratis", label: "Gratis" }, { value: "Berbayar", label: "Berbayar" }]} />
                        <Drop label="Lemdiklat KP" icon={School} value={f.balai} onChange={set("balai")} allLabel="Semua lemdiklat" options={BALAI_PELATIHAN.map((b) => ({ value: b.Name, label: b.Name }))} />
                        <Drop label="Metode pelaksanaan" icon={Clock} value={f.metode} onChange={set("metode")} allLabel="Semua metode" options={JENIS_PELAKSANAAN.map((m) => ({ value: m, label: m }))} />
                        <span className="ml-auto" />
                        <Drop label="Urutkan" icon={ArrowUpDown} value={sort} onChange={(v) => setSort(v as Sort)} options={(Object.keys(SORT_LABEL) as Sort[]).map((s) => ({ value: s, label: SORT_LABEL[s] }))} />
                    </div>
                    {active.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 px-2 pt-2">
                            {active.map((a) => (
                                <button key={a.k} type="button" onClick={a.clear} aria-label={`Hapus filter ${a.label}`} className="inline-flex h-7 items-center gap-1 rounded-lg bg-white/[0.08] px-2.5 text-[11px] font-semibold ring-1 ring-white/15 hover:bg-white/[0.14]">
                                    {a.label} <X className="w-3 h-3" aria-hidden />
                                </button>
                            ))}
                            <button type="button" onClick={reset} className="inline-flex h-7 items-center gap-1 px-2 text-[11px] font-bold text-sky-300 hover:text-white">
                                <RotateCcw className="w-3 h-3" aria-hidden /> Reset semua
                            </button>
                            <span className="ml-auto text-[11px] text-slate-400" aria-live="polite">{status === "ok" && `${results.length} jadwal`}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hasil */}
            <div className="mt-3">
                {status === "loading" ? (
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Memuat jadwal pelatihan">
                        {[0, 1, 2, 3, 4, 5].map((n) => <li key={n} className={`h-64 ${card} animate-pulse`} />)}
                    </ul>
                ) : status === "error" || results.length === 0 ? (
                    <div className={`flex flex-col items-center ${card} px-4 py-14 text-center`}>
                        <Image src="/illustrations/not-found.png" alt="" width={120} height={120} className="mb-4 opacity-40 grayscale" />
                        <h3 className="font-calsans text-lg">{status === "error" ? "Gagal memuat jadwal" : "Pelatihan tidak ditemukan"}</h3>
                        <p className="mt-1 mb-5 max-w-sm text-sm text-slate-400">{status === "error" ? "Periksa koneksi internet Anda lalu coba lagi." : "Coba kata kunci lain atau hapus beberapa filter."}</p>
                        {status === "error" ? (
                            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold hover:bg-blue-500"><RotateCcw className="w-4 h-4" aria-hidden /> Coba lagi</button>
                        ) : active.length > 0 && (
                            <button type="button" onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#0B1B3F] hover:bg-sky-100"><RotateCcw className="w-4 h-4" aria-hidden /> Reset filter</button>
                        )}
                    </div>
                ) : (
                    <>
                        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {results.slice(0, limit).map((r, i) => <li key={r.p.IdPelatihan ?? i}><Card r={r} accent={accent} /></li>)}
                        </ul>
                        {results.length > limit && (
                            <div className="mt-6 flex flex-col items-center gap-2">
                                <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="h-11 rounded-xl bg-white/[0.06] px-6 text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">Tampilkan {Math.min(PAGE, results.length - limit)} jadwal lagi</button>
                                <p className="text-[11px] text-slate-500">{limit} dari {results.length} jadwal</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

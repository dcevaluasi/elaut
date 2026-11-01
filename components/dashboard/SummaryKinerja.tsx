"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { CalendarRange, RotateCcw, Building2, Layers, Users, MapPinned, BadgeCheck, LucideIcon } from "lucide-react";
import { TbMapPin, TbUsers, TbCertificate, TbLayoutDashboard } from "react-icons/tb";
import Cookies from "js-cookie";

import { DynamicTablePelatihanMasyarakat } from "./Summary/DynamicTablePelatihanMasyarakat";
import DataDukungPelatihanTable from "./Dashboard/Tables/DataDukungPelatihanTable";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseIndonesianDate, tahunList } from "@/utils/time";

/* ============================ KONSTANTA & HELPERS ============================ */

const QUARTERS = ["TW I", "TW II", "TW III", "TW IV"] as const;
type Quarter = (typeof QUARTERS)[number];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const NOW = dayjs();
const CURRENT_YEAR = NOW.year();
const CURRENT_QUARTER_IDX = Math.floor(NOW.month() / 3);
const defaultQuarterFor = (year: number): Quarter => QUARTERS[year === CURRENT_YEAR ? CURRENT_QUARTER_IDX : 3];

const parseDate = (s?: string | null): Date | null => {
    if (!s) return null;
    if (s.includes("-")) {
        const [a, b, c] = s.split("-");
        const d = a.length === 4 ? new Date(+a, +b - 1, parseInt(c)) : new Date(+c, +b - 1, +a);
        return isNaN(d.getTime()) ? null : d;
    }
    const d = parseIndonesianDate(s);
    return d && !isNaN(d.getTime()) ? d : null;
};

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

type TableDef = { rowKey: string; colKey: string; title: string };

const SECTIONS: { id: string; label: string; description: string; icon: React.ElementType; accent: string; tables: TableDef[] }[] = [
    {
        id: "demografi",
        label: "Demografi Peserta",
        description: "Profil gender dan latar belakang pendidikan peserta.",
        icon: TbUsers,
        accent: "#3B82F6",
        tables: [
            { rowKey: "PenyelenggaraPelatihan", colKey: "JenisKelamin", title: "Analisis Sebaran Gender" },
            { rowKey: "PenyelenggaraPelatihan", colKey: "PendidikanTerakhir", title: "Tingkat Pendidikan Terakhir" },
        ],
    },
    {
        id: "geografis",
        label: "Sebaran Geografis",
        description: "Asal wilayah peserta dan jangkauan pelatihan.",
        icon: TbMapPin,
        accent: "#06B6D4",
        tables: [
            { rowKey: "Provinsi", colKey: "PenyelenggaraPelatihan", title: "Sebaran Peserta per Provinsi" },
            { rowKey: "Provinsi", colKey: "BidangPelatihan", title: "Minat Pelatihan Berdasarkan Wilayah" },
        ],
    },
    {
        id: "output",
        label: "Analisis Pelatihan",
        description: "Output pelaksanaan berdasarkan triwulan, program, dan sektor.",
        icon: TbCertificate,
        accent: "#8B5CF6",
        tables: [
            { rowKey: "PenyelenggaraPelatihan", colKey: "Triwulan", title: "Realisasi Output per Triwulan" },
            { rowKey: "JenisProgram", colKey: "PenyelenggaraPelatihan", title: "Sektor/Jenis Program Pelatihan" },
            { rowKey: "BidangPelatihan", colKey: "PenyelenggaraPelatihan", title: "Rumpun/Klaster Keilmuan" },
            { rowKey: "Program", colKey: "PenyelenggaraPelatihan", title: "Rincian Judul Program Pelatihan" },
            { rowKey: "DukunganProgramPrioritas", colKey: "PenyelenggaraPelatihan", title: "Output Dukungan Program Prioritas" },
        ],
    },
];

const NAV = [{ id: "ringkasan", label: "Ringkasan" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label }))];

/* ============================ KOMPONEN ============================ */

const SummaryKinerja: React.FC = () => {
    const [isSuperAdmin] = useState(() => (Cookies.get("Access") || "").includes("superAdmin"));
    const [includePusat, setIncludePusat] = useState(true);
    const { data: dataDukung, isFetching } = useFetchDataDukung(includePusat);

    const [tahun, setTahun] = useState(CURRENT_YEAR);
    const [triwulan, setTriwulan] = useState<Quarter>(() => defaultQuarterFor(CURRENT_YEAR));
    const years = useMemo(() => [...tahunList].sort((a, b) => b - a), []);
    const quarterIdx = QUARTERS.indexOf(triwulan);
    const tahunStr = String(tahun);
    const isDefaultPeriod = tahun === CURRENT_YEAR && triwulan === defaultQuarterFor(CURRENT_YEAR);
    const changeYear = (y: number) => {
        setTahun(y);
        setTriwulan(defaultQuarterFor(y));
    };

    /* ---------- Index tanggal sekali ---------- */
    const indexed = useMemo(() => (dataDukung || []).map((item) => ({ item, start: parseDate(item.TanggalMulai) })), [dataDukung]);

    /* ---------- Periode + KPI dalam 1 loop ---------- */
    const period = useMemo(() => {
        let total = 0;
        let male = 0, female = 0, signed = 0;
        const org = new Set<string>(), prov = new Set<string>(), program = new Set<string>();
        for (const { item, start } of indexed) {
            if (!start || start.getFullYear() !== tahun || Math.floor(start.getMonth() / 3) > quarterIdx) continue;
            total++;
            const jk = item.JenisKelamin;
            if (jk === "L" || jk === "Laki - Laki") male++;
            else if (jk === "P" || jk === "Perempuan") female++;
            if (item.FileSertifikat?.includes("signed")) signed++;
            if (item.PenyelenggaraPelatihan) org.add(item.PenyelenggaraPelatihan);
            if (item.Provinsi) prov.add(String(item.Provinsi).trim().toLowerCase());
            if (item.Program) program.add(item.Program);
        }
        return { total, male, female, signed, org: org.size, prov: prov.size, program: program.size };
    }, [indexed, tahun, quarterIdx]);

    /* ---------- Scrollspy ---------- */
    const [activeNav, setActiveNav] = useState(NAV[0].id);
    useEffect(() => {
        const els = NAV.map((n) => document.getElementById(`kinerja-${n.id}`)).filter(Boolean) as HTMLElement[];
        if (!els.length) return;
        const io = new IntersectionObserver(
            (entries) => {
                const v = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (v) setActiveNav(v.target.id.replace("kinerja-", ""));
            },
            { rootMargin: "-140px 0px -60% 0px" }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [dataDukung]);
    const scrollTo = (id: string) => document.getElementById(`kinerja-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (isFetching && !dataDukung?.length) return <KinerjaSkeleton />;

    const hasData = !!dataDukung?.length;
    const malePct = pct(period.male, period.total);
    const femalePct = pct(period.female, period.total);
    const signedPct = pct(period.signed, period.total);

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex flex-col gap-6 w-full pb-32">
                {/* ─── HERO ─── */}
                <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.45)]">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_70%_at_100%_0%,#F59E0B_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />

                    <div className="p-5 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                                    </span>
                                    {isFetching ? "Memperbarui…" : "Indikator Kinerja Pelatihan"}
                                </span>
                                <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                                    Kinerja <span className="bg-gradient-to-r from-sky-200 via-white to-amber-200 bg-clip-text text-transparent">s.d. {triwulan}</span> <span className="text-white/40">{tahun}</span>
                                </h2>
                                <p className="mt-1 text-sm text-blue-100/70">
                                    Januari – {BULAN[quarterIdx * 3 + 2]} {tahun} · {includePusat ? "Konsolidasi Pusat & Balai" : "Unit Pelaksana (Balai)"}
                                </p>
                            </div>

                            <div className="flex flex-col items-stretch sm:items-end gap-2">
                                <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/[0.07] ring-1 ring-white/10 p-1.5 backdrop-blur-xl">
                                    <label className="relative">
                                        <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-200" />
                                        <select value={tahunStr} onChange={(e) => changeYear(Number(e.target.value))} aria-label="Tahun anggaran" className="h-9 pl-8 pr-2 rounded-xl border-none bg-white/10 text-sm font-bold text-white outline-none hover:bg-white/15 [&>option]:text-slate-900">
                                            {years.map((y) => <option key={y} value={y}>TA {y}</option>)}
                                        </select>
                                    </label>
                                    {QUARTERS.map((q, i) => {
                                        const future = tahun === CURRENT_YEAR && i > CURRENT_QUARTER_IDX;
                                        const active = q === triwulan;
                                        return (
                                            <Tooltip key={q}>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <button type="button" disabled={future} onClick={() => setTriwulan(q)} className={`h-9 min-w-[48px] px-3 rounded-xl text-xs font-black transition-all ${active ? "bg-white text-[#0B1B3F] shadow-[0_6px_20px_-6px_rgba(255,255,255,0.6)]" : future ? "text-white/25 cursor-not-allowed" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}>
                                                            {q.replace("TW ", "TW ")}
                                                        </button>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs font-bold">{future ? "Belum berjalan" : `Akumulasi s.d. ${q}`}</TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                    {!isDefaultPeriod && (
                                        <button type="button" onClick={() => changeYear(CURRENT_YEAR)} className="h-9 px-3 rounded-xl text-xs font-bold text-sky-100 hover:bg-white/10 inline-flex items-center gap-1.5">
                                            <RotateCcw className="h-3.5 w-3.5" /> Sekarang
                                        </button>
                                    )}
                                </div>
                                {isSuperAdmin && (
                                    <div className="flex items-center gap-0.5 rounded-2xl bg-white/[0.07] ring-1 ring-white/10 p-1.5 backdrop-blur-xl self-start sm:self-auto">
                                        {[{ v: false, label: "Balai" }, { v: true, label: "Pusat & Balai" }].map((o) => (
                                            <button key={o.label} type="button" onClick={() => setIncludePusat(o.v)} disabled={isFetching} className={`h-8 px-3 rounded-xl text-[11px] font-black transition-all ${includePusat === o.v ? "bg-white text-[#0B1B3F]" : "text-blue-100/80 hover:bg-white/10"}`}>
                                                {o.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="group col-span-2 lg:col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between gap-5">
                                <Users aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-sky-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Masyarakat dilatih</p>
                                <div>
                                    <p className="text-5xl md:text-6xl font-black tracking-[-0.04em] tabular-nums leading-none">{fmt(period.total)}</p>
                                    <p className="mt-1 text-xs text-blue-100/60">peserta pada periode ini</p>
                                </div>
                                <div>
                                    <div className="flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                                        <div className="bg-sky-300" style={{ width: `${malePct}%` }} />
                                        <div className="bg-pink-300" style={{ width: `${femalePct}%` }} />
                                    </div>
                                    <div className="mt-1.5 flex justify-between text-[11px] text-blue-100/75">
                                        <span>♂ <b className="text-white">{fmt(period.male)}</b> · {malePct}%</span>
                                        <span>♀ <b className="text-white">{fmt(period.female)}</b> · {femalePct}%</span>
                                    </div>
                                </div>
                            </div>
                            <HeroKpi className="lg:col-span-2" icon={BadgeCheck} accent="#10B981" label="Bersertifikat" value={`${signedPct}%`} sub={`${fmt(period.signed)} peserta`} progress={signedPct} />
                            <HeroKpi className="lg:col-span-2" icon={Building2} accent="#3B82F6" label="Penyelenggara" value={fmt(period.org)} sub="unit pelaksana" />
                            <HeroKpi className="lg:col-span-2" icon={MapPinned} accent="#06B6D4" label="Provinsi terjangkau" value={fmt(period.prov)} sub={`${pct(period.prov, 38)}% dari 38 provinsi`} progress={pct(period.prov, 38)} />
                            <HeroKpi className="lg:col-span-2" icon={Layers} accent="#F59E0B" label="Ragam program" value={fmt(period.program)} sub="judul program terlaksana" />
                        </div>
                    </div>
                </section>

                {!hasData ? (
                    <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                        <Image src="/illustrations/not-found.png" alt="" width={320} height={320} className="w-60 h-auto" />
                        <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Data belum tersedia</h1>
                        <p className="mt-1 text-sm text-slate-500 max-w-md">
                            Pastikan data penyelenggaraan telah terinput{isSuperAdmin && !includePusat ? ", atau coba cakupan Pusat & Balai" : ""}.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ─── Navigasi seksi ─── */}
                        <nav className="sticky top-20 z-30">
                            <div className="relative isolate flex items-center gap-1 overflow-x-auto scrollbar-hide rounded-2xl bg-[#0B1B3F]/90 ring-1 ring-white/10 backdrop-blur-xl p-1.5 shadow-lg w-fit max-w-full">
                                {NAV.map((n) => (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => scrollTo(n.id)}
                                        className={`h-8 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeNav === n.id ? "bg-white/[0.16] text-white ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "text-blue-100/70 hover:text-white hover:bg-white/[0.07]"}`}
                                    >
                                        {n.label}
                                    </button>
                                ))}
                            </div>
                        </nav>

                        <section id="kinerja-ringkasan" className="scroll-mt-36 space-y-4">
                            <Section icon={TbLayoutDashboard} accent="#2563EB" title="Ringkasan Data Dukung" desc="Rekap data peserta periode ini beserta unduhan laporan." />
                            <DataDukungPelatihanTable data={dataDukung} tahun={tahun} triwulan={triwulan} />
                        </section>

                        {SECTIONS.map((s) => (
                            <section key={s.id} id={`kinerja-${s.id}`} className="scroll-mt-36 space-y-4">
                                <Section icon={s.icon} accent={s.accent} title={s.label} desc={s.description} />
                                <div className="grid grid-cols-1 gap-5">
                                    {s.tables.map((t) => (
                                        <LazyMount key={t.title}>
                                            <DynamicTablePelatihanMasyarakat tahun={tahunStr} triwulan={triwulan} dataUser={dataDukung} rowKey={t.rowKey} colKey={t.colKey} title={t.title} />
                                        </LazyMount>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </>
                )}
            </div>
        </TooltipProvider>
    );
};

/* ============================ UI ============================ */

function HeroKpi({ icon: Icon, accent, label, value, sub, progress, className = "" }: { icon: LucideIcon; accent: string; label: string; value: string; sub: string; progress?: number; className?: string }) {
    return (
        <div className={`group relative isolate overflow-hidden rounded-3xl bg-white/[0.07] ring-1 ring-white/10 p-4 md:p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.1] ${className}`}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 h-24 w-24 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/70">{label}</p>
            <p className="mt-1 text-2xl md:text-3xl font-black tracking-tight tabular-nums">{value}</p>
            {progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
            <p className="mt-1 text-[11px] text-blue-100/60 truncate">{sub}</p>
        </div>
    );
}

function Section({ icon: Icon, accent, title, desc }: { icon: React.ElementType; accent: string; title: string; desc: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
                <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 75%)` }} />
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h3>
                <p className="text-xs text-slate-500 truncate">{desc}</p>
            </div>
            <span className="ml-2 hidden md:block h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
        </div>
    );
}

/** Render children saat mendekati viewport → tabel berat tidak diproses sekaligus */
function LazyMount({ children, minHeight = 320 }: { children: React.ReactNode; minHeight?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (show) return;
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setShow(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow(true);
                    io.disconnect();
                }
            },
            { rootMargin: "400px 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [show]);
    return <div ref={ref}>{show ? children : <div className="rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ minHeight }} />}</div>;
}

const KinerjaSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-[380px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-96 max-w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-[460px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
);

export default SummaryKinerja;

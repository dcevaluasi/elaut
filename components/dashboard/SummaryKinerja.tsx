"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { CalendarRange, RotateCcw, Building2, Layers, Users, MapPinned, BadgeCheck, Download, Search, Table2, ArrowDown, ArrowUp, ArrowUpDown, AlertTriangle, RefreshCw, ShieldCheck, FileSpreadsheet, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { TbMapPin, TbUsers, TbCertificate, TbLayoutDashboard } from "react-icons/tb";
import Cookies from "js-cookie";

import DataDukungPelatihanTable from "./Dashboard/Tables/DataDukungPelatihanTable";
import useFetchDataDukung, { prefetchDataDukung } from "@/hooks/elaut/useFetchDataDukung";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseIndonesianDate, tahunList } from "@/utils/time";
import { UserPelatihan } from "@/types/product";

prefetchDataDukung(); // mulai fetch saat modul dimuat (request dibagi dengan hook)

/* ============================ KONSTANTA & HELPERS ============================ */

const QUARTERS = ["TW I", "TW II", "TW III", "TW IV"] as const;
type Quarter = (typeof QUARTERS)[number];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const NOW = dayjs();
const CURRENT_YEAR = NOW.year();
const CURRENT_QUARTER_IDX = Math.floor(NOW.month() / 3);
const defaultQuarterFor = (year: number): Quarter => QUARTERS[year === CURRENT_YEAR ? CURRENT_QUARTER_IDX : 3];

const dateCache = new Map<string, Date | null>();
const parseDate = (s?: string | null): Date | null => {
    if (!s) return null;
    const hit = dateCache.get(s);
    if (hit !== undefined) return hit;
    let d: Date | null;
    if (s.includes("-")) {
        const [a, b, c] = s.split("-");
        d = a.length === 4 ? new Date(+a, +b - 1, parseInt(c)) : new Date(+c, +b - 1, +a);
    } else d = parseIndonesianDate(s);
    const out = d && !isNaN(d.getTime()) ? d : null;
    dateCache.set(s, out);
    return out;
};

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

/* ---------- Rekap silang (baris × kolom) ---------- */

type TableDef = { rowKey: string; colKey: string; title: string; label: string; rowLabel: string };
type Indexed = { item: UserPelatihan; start: Date };

const URUTAN_SATKER = ["Pusat", "Medan", "Tegal", "Banyuwangi", "Bitung", "Ambon", "Sukamandi"];
const PENDIDIKAN = ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Di/Dii/DIII", "DIV/S1", "S2", "S3", "Tidak Bersekolah", "Tidak Diketahui"];
const KOSONG = "Belum diisi";
const MAX_KOLOM = 12; // kolom dinamis lebih dari ini digabung ke "Lainnya"
const ROW_PREVIEW = 15;

/** Field yang dipantau tim monev untuk kelengkapan data */
const QUALITY_FIELDS: { key: string; label: string }[] = [
    { key: "JenisKelamin", label: "Jenis Kelamin" },
    { key: "PendidikanTerakhir", label: "Pendidikan" },
    { key: "Provinsi", label: "Provinsi" },
    { key: "BidangPelatihan", label: "Bidang" },
    { key: "Program", label: "Program" },
    { key: "DukunganProgramPrioritas", label: "Prog. Prioritas" },
    { key: "__signed", label: "Sertifikat TTE" },
];
const GOOD = 95, WARN = 80; // ambang kelengkapan (%)
const qualityTone = (v: number) => (v >= GOOD ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : v >= WARN ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300");

const urutanSatker = (n: string) => {
    const i = URUTAN_SATKER.findIndex((k) => n.toLowerCase().includes(k.toLowerCase()));
    return i === -1 ? URUTAN_SATKER.length : i;
};
/** "Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon" → "BPPP Ambon" */
const singkatSatker = (n: string) => (/^pusat pelatihan kelautan dan perikanan$/i.test(n.trim()) ? "Puslat KP" : n.replace(/^.*\((\w+)\)\s*/, "$1 ").trim());
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Ambil & rapikan nilai sebuah kunci (Triwulan diturunkan dari tanggal) */
function valueOf(r: Indexed, key: string): string {
    if (key === "__signed") return r.item.FileSertifikat?.includes("signed") ? "Ya" : KOSONG;
    if (key === "Triwulan") return QUARTERS[Math.floor(r.start.getMonth() / 3)];
    const raw = String((r.item as unknown as Record<string, unknown>)[key] ?? "").trim().replace(/\s+/g, " ");
    if (!raw || raw === "-" || raw.toLowerCase() === "null") return KOSONG;
    if (key === "JenisKelamin") return /^l/i.test(raw) ? "Laki-laki" : /^p/i.test(raw) ? "Perempuan" : KOSONG;
    if (key === "Provinsi") return titleCase(raw);
    return raw;
}

/** Urutan tetap untuk kunci tertentu; selain itu urut total terbesar */
function orderKeys(key: string, totals: Map<string, number>): string[] {
    const keys = Array.from(totals.keys());
    const last = (a: string, b: string) => Number(a === KOSONG) - Number(b === KOSONG);
    if (key === "Triwulan") return QUARTERS.filter((q) => totals.has(q));
    if (key === "JenisKelamin") return ["Laki-laki", "Perempuan", KOSONG].filter((k) => totals.has(k));
    if (key === "PendidikanTerakhir") {
        const idx = (k: string) => { const i = PENDIDIKAN.findIndex((p) => p.toLowerCase() === k.toLowerCase()); return i === -1 ? 99 : i; };
        return keys.sort((a, b) => last(a, b) || idx(a) - idx(b) || a.localeCompare(b));
    }
    if (key === "PenyelenggaraPelatihan") return keys.sort((a, b) => last(a, b) || urutanSatker(a) - urutanSatker(b) || a.localeCompare(b));
    return keys.sort((a, b) => last(a, b) || totals.get(b)! - totals.get(a)! || a.localeCompare(b));
}

type Rekap = { kolom: string[]; rows: { nama: string; nilai: number[]; jumlah: number }[]; total: number[]; jumlah: number; max: number };

function buildRekap(data: Indexed[], rowKey: string, colKey: string): Rekap {
    // 1 loop: hitung sel + total kolom/baris (key digabung case-insensitive)
    const label = new Map<string, string>();
    const norm = (v: string) => { const k = v.toLowerCase(); if (!label.has(k)) label.set(k, v); return label.get(k)!; };
    const cells = new Map<string, Map<string, number>>();
    const colTotal = new Map<string, number>();
    const rowTotal = new Map<string, number>();
    for (const r of data) {
        const rv = norm(valueOf(r, rowKey));
        const cv = norm(valueOf(r, colKey));
        let m = cells.get(rv);
        if (!m) cells.set(rv, (m = new Map()));
        m.set(cv, (m.get(cv) || 0) + 1);
        colTotal.set(cv, (colTotal.get(cv) || 0) + 1);
        rowTotal.set(rv, (rowTotal.get(rv) || 0) + 1);
    }

    let cols = orderKeys(colKey, colTotal);
    let lainnya: Set<string> | null = null;
    if (cols.length > MAX_KOLOM && colKey !== "PenyelenggaraPelatihan") {
        lainnya = new Set(cols.slice(MAX_KOLOM - 1));
        cols = [...cols.slice(0, MAX_KOLOM - 1), "Lainnya"];
    }
    const colIdx = (c: string) => (lainnya?.has(c) ? cols.length - 1 : cols.indexOf(c));

    const total = Array(cols.length).fill(0);
    let max = 1;
    const rows = orderKeys(rowKey, rowTotal).map((nama) => {
        const nilai = Array(cols.length).fill(0);
        cells.get(nama)!.forEach((n, c) => { nilai[colIdx(c)] += n; });
        nilai.forEach((n, i) => { total[i] += n; if (n > max) max = n; });
        return { nama, nilai, jumlah: rowTotal.get(nama)! };
    });
    const kolom = colKey === "PenyelenggaraPelatihan" ? cols.map(singkatSatker) : cols;
    return { kolom, rows, total, jumlah: data.length, max };
}

type QualityRow = { nama: string; total: number; pct: number[]; avg: number };
function buildQuality(data: Indexed[]) {
    const per = new Map<string, { total: number; ok: number[] }>();
    const all = { total: 0, ok: Array(QUALITY_FIELDS.length).fill(0) };
    for (const r of data) {
        const nama = valueOf(r, "PenyelenggaraPelatihan");
        let g = per.get(nama);
        if (!g) per.set(nama, (g = { total: 0, ok: Array(QUALITY_FIELDS.length).fill(0) }));
        g.total++; all.total++;
        QUALITY_FIELDS.forEach((f, i) => { if (valueOf(r, f.key) !== KOSONG) { g!.ok[i]++; all.ok[i]++; } });
    }
    const toRow = (nama: string, g: { total: number; ok: number[] }): QualityRow => {
        const p = g.ok.map((n) => pct(n, g.total));
        return { nama, total: g.total, pct: p, avg: Math.round(p.reduce((a, b) => a + b, 0) / (p.length || 1)) };
    };
    const rows = Array.from(per.entries()).map(([n, g]) => toRow(n, g)).sort((a, b) => urutanSatker(a.nama) - urutanSatker(b.nama) || a.nama.localeCompare(b.nama));
    const issues = rows.flatMap((r) => r.pct.map((v, i) => ({ satker: r.nama, field: QUALITY_FIELDS[i].label, v, n: r.total }))).filter((x) => x.v < WARN).sort((a, b) => a.v - b.v);
    return { rows, overall: toRow("Semua satuan kerja", all), issues };
}

const sheetName = (s: string) => s.replace(/[\\/?*[\]:]/g, "").slice(0, 31);

/* ---------- Definisi seksi ---------- */

const SECTIONS: { id: string; label: string; description: string; icon: React.ElementType; accent: string; tables: TableDef[] }[] = [
    {
        id: "demografi",
        label: "Demografi Peserta",
        description: "Profil gender dan latar belakang pendidikan peserta.",
        icon: TbUsers,
        accent: "#3B82F6",
        tables: [
            { rowKey: "PenyelenggaraPelatihan", colKey: "JenisKelamin", title: "Sebaran peserta menurut jenis kelamin", label: "Jenis Kelamin", rowLabel: "Satuan Kerja" },
            { rowKey: "PenyelenggaraPelatihan", colKey: "PendidikanTerakhir", title: "Peserta menurut pendidikan terakhir", label: "Pendidikan", rowLabel: "Satuan Kerja" },
        ],
    },
    {
        id: "geografis",
        label: "Sebaran Geografis",
        description: "Asal wilayah peserta dan jangkauan pelatihan.",
        icon: TbMapPin,
        accent: "#06B6D4",
        tables: [
            { rowKey: "Provinsi", colKey: "PenyelenggaraPelatihan", title: "Sebaran peserta per provinsi", label: "Per Provinsi", rowLabel: "Provinsi" },
            { rowKey: "Provinsi", colKey: "BidangPelatihan", title: "Minat bidang pelatihan per wilayah", label: "Minat Bidang", rowLabel: "Provinsi" },
        ],
    },
    {
        id: "output",
        label: "Analisis Pelatihan",
        description: "Output pelaksanaan berdasarkan triwulan, program, dan sektor.",
        icon: TbCertificate,
        accent: "#8B5CF6",
        tables: [
            { rowKey: "PenyelenggaraPelatihan", colKey: "Triwulan", title: "Realisasi output per triwulan", label: "Triwulan", rowLabel: "Satuan Kerja" },
            { rowKey: "JenisProgram", colKey: "PenyelenggaraPelatihan", title: "Sektor / jenis program pelatihan", label: "Jenis Program", rowLabel: "Jenis Program" },
            { rowKey: "BidangPelatihan", colKey: "PenyelenggaraPelatihan", title: "Rumpun / klaster keilmuan", label: "Rumpun", rowLabel: "Rumpun / Klaster" },
            { rowKey: "Program", colKey: "PenyelenggaraPelatihan", title: "Rincian judul program pelatihan", label: "Judul Program", rowLabel: "Program" },
            { rowKey: "DukunganProgramPrioritas", colKey: "PenyelenggaraPelatihan", title: "Output dukungan program prioritas", label: "Program Prioritas", rowLabel: "Program Prioritas" },
        ],
    },
];

const NAV = [{ id: "ringkasan", label: "Ringkasan" }, { id: "kualitas", label: "Kualitas Data" }, ...SECTIONS.map((s) => ({ id: s.id, label: s.label }))];

/* ============================ KOMPONEN ============================ */

const SummaryKinerja: React.FC = () => {
    const [isSuperAdmin] = useState(() => (Cookies.get("Access") || "").includes("superAdmin"));
    const [includePusat, setIncludePusat] = useState(true);
    const { data: dataDukung, isFetching, refetch } = useFetchDataDukung(includePusat);
    const [satker, setSatker] = useState(""); // "" = semua
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    useEffect(() => { if (!isFetching && dataDukung?.length) setUpdatedAt(new Date()); }, [isFetching, dataDukung]);

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
    const indexed = useMemo(() => {
        const out: Indexed[] = [];
        for (const item of dataDukung || []) {
            const start = parseDate(item.TanggalMulai);
            if (start) out.push({ item, start });
        }
        return out;
    }, [dataDukung]);

    const satkerOptions = useMemo(
        () => Array.from(new Set(indexed.map((r) => r.item.PenyelenggaraPelatihan).filter(Boolean) as string[])).sort((a, b) => urutanSatker(a) - urutanSatker(b) || a.localeCompare(b)),
        [indexed]
    );
    useEffect(() => { if (satker && !satkerOptions.includes(satker)) setSatker(""); }, [satker, satkerOptions]);

    /* ---------- Periode + KPI dalam 1 loop ---------- */
    const period = useMemo(() => {
        const rows: Indexed[] = [];
        let male = 0, female = 0, signed = 0;
        const org = new Set<string>(), prov = new Set<string>(), program = new Set<string>();
        let prevTotal = 0, prevSigned = 0;
        for (const r of indexed) {
            const { item, start } = r;
            if (satker && item.PenyelenggaraPelatihan !== satker) continue;
            if (Math.floor(start.getMonth() / 3) > quarterIdx) continue;
            const y = start.getFullYear();
            if (y === tahun - 1) { prevTotal++; if (item.FileSertifikat?.includes("signed")) prevSigned++; continue; }
            if (y !== tahun) continue;
            rows.push(r);
            const jk = item.JenisKelamin;
            if (jk === "L" || jk === "Laki - Laki") male++;
            else if (jk === "P" || jk === "Perempuan") female++;
            if (item.FileSertifikat?.includes("signed")) signed++;
            if (item.PenyelenggaraPelatihan) org.add(item.PenyelenggaraPelatihan);
            if (item.Provinsi) prov.add(String(item.Provinsi).trim().toLowerCase());
            if (item.Program) program.add(item.Program);
        }
        return { rows, total: rows.length, male, female, signed, org: org.size, prov: prov.size, program: program.size, prevTotal, prevSignedPct: pct(prevSigned, prevTotal) };
    }, [indexed, tahun, quarterIdx, satker]);
    const quality = useMemo(() => buildQuality(period.rows), [period.rows]);

    /* ---------- Scrollspy ---------- */
    const [activeNav, setActiveNav] = useState(NAV[0].id);
    const hasData = !!dataDukung?.length;
    useEffect(() => {
        if (!hasData) return;
        const els = NAV.map((n) => document.getElementById(`kinerja-${n.id}`)).filter(Boolean) as HTMLElement[];
        const io = new IntersectionObserver(
            (entries) => {
                const v = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (v) setActiveNav(v.target.id.replace("kinerja-", ""));
            },
            { rootMargin: "-140px 0px -60% 0px" }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [hasData]);
    const scrollTo = (id: string) => document.getElementById(`kinerja-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (isFetching && !hasData) return <KinerjaSkeleton />;

    const malePct = pct(period.male, period.total);
    const femalePct = pct(period.female, period.total);
    const signedPct = pct(period.signed, period.total);
    const periodLabel = `s.d. ${triwulan} ${tahun}${satker ? ` · ${singkatSatker(satker)}` : ""}`;
    const growth = period.prevTotal ? Math.round(((period.total - period.prevTotal) / period.prevTotal) * 100) : null;
    const signedDelta = period.prevTotal ? signedPct - period.prevSignedPct : null;
    const prevLabel = `vs ${triwulan} ${tahun - 1}`;

    /** Semua tabel (aktif sesuai filter) dalam 1 file Excel, 1 sheet per tabel */
    const exportAll = () => {
        const wb = XLSX.utils.book_new();
        const q = [["Kelengkapan data (%) " + periodLabel], [], ["No", "Satuan Kerja", "Peserta", ...QUALITY_FIELDS.map((f) => f.label), "Rata-rata"],
        ...quality.rows.map((r, i) => [i + 1, r.nama, r.total, ...r.pct, r.avg]), ["", quality.overall.nama, quality.overall.total, ...quality.overall.pct, quality.overall.avg]];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(q), "Kualitas Data");
        for (const s of SECTIONS) for (const t of s.tables) {
            const r = buildRekap(period.rows, t.rowKey, t.colKey);
            const aoa = [[`${t.title} (${periodLabel})`], [], ["No", t.rowLabel, ...r.kolom, "Jumlah"], ...r.rows.map((x, i) => [i + 1, x.nama, ...x.nilai, x.jumlah]), ["", "Jumlah", ...r.total, r.jumlah]];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), sheetName(t.label));
        }
        XLSX.writeFile(wb, `Laporan Kinerja Pelatihan ${periodLabel.replace(/[^\w\s-]/g, "")}.xlsx`);
    };

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
                                <button type="button" onClick={() => refetch()} disabled={isFetching} title="Muat ulang data" className="ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-sky-100/80 ring-1 ring-white/15 hover:bg-white/10 disabled:opacity-50">
                                    <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
                                    {updatedAt ? `Diperbarui ${dayjs(updatedAt).format("HH:mm")}` : "Muat ulang"}
                                </button>
                                <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                                    Kinerja <span className="bg-gradient-to-r from-sky-200 via-white to-amber-200 bg-clip-text text-transparent">s.d. {triwulan}</span> <span className="text-white/40">{tahun}</span>
                                </h2>
                                <p className="mt-1 text-sm text-blue-100/70">
                                    Januari – {BULAN[quarterIdx * 3 + 2]} {tahun} · {satker ? satker : includePusat ? "Konsolidasi Pusat & Balai" : "Unit Pelaksana (Balai)"}
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
                                                            {q}
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
                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                    {satkerOptions.length > 1 && (
                                        <label className="relative rounded-2xl bg-white/[0.07] ring-1 ring-white/10 p-1.5 backdrop-blur-xl">
                                            <Building2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sky-200" />
                                            <select value={satker} onChange={(e) => setSatker(e.target.value)} aria-label="Fokus satuan kerja" className="h-8 max-w-[220px] pl-7 pr-2 rounded-xl border-none bg-white/10 text-[11px] font-black text-white outline-none hover:bg-white/15 [&>option]:text-slate-900">
                                                <option value="">Semua satuan kerja</option>
                                                {satkerOptions.map((o) => <option key={o} value={o}>{singkatSatker(o)}</option>)}
                                            </select>
                                        </label>
                                    )}
                                    {isSuperAdmin && (
                                        <div className="flex items-center gap-0.5 rounded-2xl bg-white/[0.07] ring-1 ring-white/10 p-1.5 backdrop-blur-xl self-start sm:self-auto">
                                            {[{ v: false, label: "Balai" }, { v: true, label: "Pusat & Balai" }].map((o) => (
                                                <button key={o.label} type="button" onClick={() => setIncludePusat(o.v)} className={`h-8 px-3 rounded-xl text-[11px] font-black transition-all ${includePusat === o.v ? "bg-white text-[#0B1B3F]" : "text-blue-100/80 hover:bg-white/10"}`}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="group col-span-2 lg:col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between gap-5">
                                <Users aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-sky-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Masyarakat dilatih</p>
                                <div>
                                    <p className="text-5xl md:text-6xl font-black tracking-[-0.04em] tabular-nums leading-none">{fmt(period.total)}</p>
                                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-100/60">
                                        peserta pada periode ini
                                        {growth !== null && <Delta value={growth} suffix="%" label={prevLabel} />}
                                    </p>
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
                            <HeroKpi className="lg:col-span-2" icon={BadgeCheck} accent="#10B981" label="Bersertifikat" value={`${signedPct}%`} sub={`${fmt(period.signed)} peserta`} progress={signedPct} extra={signedDelta !== null ? <Delta value={signedDelta} suffix=" poin" label={prevLabel} /> : undefined} />
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
                                <span className="mx-1 h-5 w-px bg-white/15" aria-hidden />
                                <button type="button" onClick={exportAll} title="Unduh semua tabel (1 file, 1 sheet per tabel)" className="h-8 px-3 rounded-xl text-xs font-bold whitespace-nowrap bg-white text-[#0B1B3F] hover:bg-sky-100 inline-flex items-center gap-1.5">
                                    <FileSpreadsheet className="h-3.5 w-3.5" /> Unduh semua
                                </button>
                            </div>
                        </nav>

                        <section id="kinerja-ringkasan" className="scroll-mt-36 space-y-4">
                            <Section icon={TbLayoutDashboard} accent="#2563EB" title="Ringkasan Data Dukung" desc="Rekap data peserta periode ini beserta unduhan laporan." />
                            <DataDukungPelatihanTable data={satker ? dataDukung.filter((d) => d.PenyelenggaraPelatihan === satker) : dataDukung} tahun={tahun} triwulan={triwulan} />
                        </section>

                        <section id="kinerja-kualitas" className="scroll-mt-36 space-y-4">
                            <Section icon={ShieldCheck} accent="#10B981" title="Kualitas & Kelengkapan Data" desc={`Persentase isian terisi per satuan kerja · hijau ≥ ${GOOD}%, kuning ≥ ${WARN}%, merah perlu tindak lanjut.`} />
                            <QualityCard q={quality} periodLabel={periodLabel} onPick={(n) => setSatker(satkerOptions.find((o) => o === n) ?? "")} />
                        </section>

                        {SECTIONS.map((s) => (
                            <section key={s.id} id={`kinerja-${s.id}`} className="scroll-mt-36 space-y-4">
                                <Section icon={s.icon} accent={s.accent} title={s.label} desc={s.description} />
                                <RekapCard tables={s.tables} data={period.rows} accent={s.accent} periodLabel={periodLabel} />
                            </section>
                        ))}
                    </>
                )}
            </div>
        </TooltipProvider>
    );
};

/* ============================ TABEL REKAP ============================ */

const th = "px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap";
const td = "px-3 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 tabular-nums";

type SortState = { col: number; dir: 1 | -1 } | null; // col: indeks kolom, -1 = nama, -2 = jumlah

function SortTh({ label, active, dir, onClick, className = "" }: { label: string; active: boolean; dir?: 1 | -1; onClick: () => void; className?: string }) {
    const Icon = !active ? ArrowUpDown : dir === 1 ? ArrowUp : ArrowDown;
    return (
        <th className={`${th} ${className}`} aria-sort={active ? (dir === 1 ? "ascending" : "descending") : "none"}>
            <button type="button" onClick={onClick} title={`Urutkan ${label}`} className={`inline-flex max-w-[140px] items-center gap-1 hover:text-slate-900 dark:hover:text-white ${active ? "text-[#0B1B3F] dark:text-sky-200" : ""}`}>
                <span className="truncate">{label}</span>
                <Icon className={`h-3 w-3 shrink-0 ${active ? "" : "opacity-40"}`} />
            </button>
        </th>
    );
}

/** Satu kartu per seksi: tab, mode jumlah/%, urut kolom, cari, insight, heat cell, total navy, unduh Excel. Hanya tab aktif yang dihitung. */
function RekapCard({ tables, data, accent, periodLabel }: { tables: TableDef[]; data: Indexed[]; accent: string; periodLabel: string }) {
    const [tab, setTab] = useState(0);
    const [q, setQ] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [mode, setMode] = useState<"n" | "pct">("n");
    const [sort, setSort] = useState<SortState>(null);
    const t = tables[tab];
    const rekap = useMemo(() => buildRekap(data, t.rowKey, t.colKey), [data, t.rowKey, t.colKey]);

    const query = q.trim().toLowerCase();
    const filtered = useMemo(() => {
        const list = query ? rekap.rows.filter((r) => r.nama.toLowerCase().includes(query)) : rekap.rows.slice();
        if (!sort) return list;
        const val = (r: (typeof list)[number]) => (sort.col === -2 ? r.jumlah : mode === "pct" ? r.nilai[sort.col] / (r.jumlah || 1) : r.nilai[sort.col]);
        return list.sort((a, b) => (sort.col === -1 ? a.nama.localeCompare(b.nama) : val(a) - val(b)) * sort.dir);
    }, [rekap, query, sort, mode]);
    const visible = showAll || query ? filtered : filtered.slice(0, ROW_PREVIEW);
    const colLabel = t.colKey === "PenyelenggaraPelatihan" ? "Satuan Kerja" : t.label;
    const kosongIdx = rekap.kolom.indexOf(KOSONG);

    // Insight singkat untuk dibaca cepat
    const top = rekap.rows.filter((r) => r.nama !== KOSONG).reduce<(typeof rekap.rows)[number] | null>((m, r) => (!m || r.jumlah > m.jumlah ? r : m), null);
    const topColIdx = rekap.total.reduce((m, n, i) => (rekap.kolom[i] !== KOSONG && rekap.kolom[i] !== "Lainnya" && n > (rekap.total[m] ?? -1) ? i : m), 0);
    const kosongRow = rekap.rows.find((r) => r.nama === KOSONG)?.jumlah ?? 0;
    const kosongTotal = kosongRow + (kosongIdx >= 0 ? rekap.total[kosongIdx] : 0);

    const pick = (i: number) => {
        setTab(i);
        setQ("");
        setShowAll(false);
        setSort(null);
    };
    const toggleSort = (col: number) => setSort((s) => (s?.col === col ? (s.dir === -1 ? { col, dir: 1 } : null) : { col, dir: col === -1 ? 1 : -1 }));
    const cell = (n: number, rowTotal: number) => (mode === "pct" ? `${pct(n, rowTotal)}%` : fmt(n));
    const heat = (n: number, rowTotal: number) => (mode === "pct" ? n / (rowTotal || 1) : n / rekap.max);

    const exportExcel = () => {
        const asPct = mode === "pct";
        const header = ["No", t.rowLabel, ...rekap.kolom.map((k) => (asPct ? `${k} (%)` : k)), "Jumlah"];
        const body = filtered.map((r, i) => [i + 1, r.nama, ...r.nilai.map((n) => (asPct ? pct(n, r.jumlah) : n)), r.jumlah]);
        const foot = ["", "Jumlah", ...rekap.total.map((n) => (asPct ? pct(n, rekap.jumlah) : n)), rekap.jumlah];
        const ws = XLSX.utils.aoa_to_sheet([[`${t.title} (${periodLabel})${asPct ? " — persentase per baris" : ""}`], [], header, ...body, foot]);
        ws["!cols"] = [{ wch: 5 }, { wch: 42 }, ...rekap.kolom.map(() => ({ wch: 12 })), { wch: 10 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap");
        XLSX.writeFile(wb, `${t.title.replace(/[^\w\s-]/g, "").slice(0, 50)} ${periodLabel.replace(/[^\w\s-]/g, "")}.xlsx`);
    };

    const pill = (on: boolean) => `h-8 px-3 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${on ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`;
    const stickyCol = "sticky left-0 z-[1] bg-white dark:bg-slate-900";

    return (
        <section className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
                        <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 75%)` }} />
                        <Table2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{t.title}</h4>
                        <p className="text-[11px] text-slate-500">{periodLabel} · {fmt(rekap.jumlah)} peserta · klik judul kolom untuk mengurutkan</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {tables.length > 1 && (
                        <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 overflow-x-auto scrollbar-hide max-w-full">
                            {tables.map((x, i) => (
                                <button key={x.title} type="button" onClick={() => pick(i)} className={pill(tab === i)}>{x.label}</button>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700" role="radiogroup" aria-label="Tampilan angka">
                        <button type="button" role="radio" aria-checked={mode === "n"} onClick={() => setMode("n")} className={pill(mode === "n")} title="Jumlah peserta">Jumlah</button>
                        <button type="button" role="radio" aria-checked={mode === "pct"} onClick={() => setMode("pct")} className={pill(mode === "pct")} title="Persentase terhadap jumlah tiap baris — untuk membandingkan satker berbeda ukuran">% baris</button>
                    </div>
                    <button type="button" onClick={exportExcel} title="Unduh tabel ini (sesuai tampilan)" aria-label="Unduh Excel" className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 flex items-center justify-center">
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div key={tab} className="p-4 md:p-5 animate-in fade-in duration-200 space-y-3">
                {/* Insight cepat */}
                {rekap.jumlah > 0 && (
                    <div className="flex flex-wrap gap-2 text-[11px]">
                        {top && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-blue-800 dark:text-blue-200 ring-1 ring-blue-200/60 dark:ring-blue-400/20">
                                <TrendingUp className="h-3.5 w-3.5" /> Terbanyak: <b className="truncate max-w-[220px]">{top.nama}</b> · {fmt(top.jumlah)} ({pct(top.jumlah, rekap.jumlah)}%)
                            </span>
                        )}
                        {rekap.kolom.length > 1 && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/80 dark:ring-slate-700">
                                Kolom dominan: <b>{rekap.kolom[topColIdx]}</b> · {pct(rekap.total[topColIdx], rekap.jumlah)}%
                            </span>
                        )}
                        {kosongTotal > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 text-amber-800 dark:text-amber-200 ring-1 ring-amber-200/70 dark:ring-amber-400/20">
                                <AlertTriangle className="h-3.5 w-3.5" /> {fmt(kosongTotal)} isian &quot;{KOSONG}&quot; ({pct(kosongTotal, rekap.jumlah)}%)
                            </span>
                        )}
                    </div>
                )}

                {rekap.rows.length > ROW_PREVIEW && (
                    <label className="relative block max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${t.rowLabel.toLowerCase()}…`} className="h-9 w-full rounded-xl bg-slate-50 dark:bg-slate-800 pl-8 pr-3 text-xs ring-1 ring-slate-200/80 dark:ring-slate-700 outline-none focus:ring-2 focus:ring-blue-500/40" />
                    </label>
                )}

                <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                    <table className="w-full text-center">
                        <thead>
                            <tr>
                                <th rowSpan={2} className={`${th} w-10 ${stickyCol}`}>No</th>
                                <SortTh label={t.rowLabel} active={sort?.col === -1} dir={sort?.dir} onClick={() => toggleSort(-1)} className={`text-left min-w-[200px] sticky left-10 z-[1] bg-white dark:bg-slate-900`} />
                                <th colSpan={rekap.kolom.length} className={`${th} border-b-0 text-[#0B1B3F] dark:text-sky-200`}>{colLabel}{mode === "pct" && <span className="ml-1 normal-case text-slate-400">(% dari baris)</span>}</th>
                                <SortTh label="Jumlah" active={sort?.col === -2} dir={sort?.dir} onClick={() => toggleSort(-2)} />
                            </tr>
                            <tr>
                                {rekap.kolom.map((k, i) => (
                                    <SortTh key={i} label={k} active={sort?.col === i} dir={sort?.dir} onClick={() => toggleSort(i)} className={k === KOSONG ? "bg-amber-50/60 dark:bg-amber-500/5" : ""} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {visible.length === 0 && (
                                <tr>
                                    <td colSpan={rekap.kolom.length + 3} className="py-10 text-sm text-slate-400">{query ? "Tidak ada yang cocok" : "Belum ada data pada periode ini"}</td>
                                </tr>
                            )}
                            {visible.map((r, i) => (
                                <tr key={r.nama} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                    <td className={`${td} text-slate-400 ${stickyCol} group-hover:bg-slate-50 dark:group-hover:bg-slate-800`}>{i + 1}</td>
                                    <td className={`${td} text-left font-semibold sticky left-10 z-[1] bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 ${r.nama === KOSONG ? "text-amber-600 italic" : ""}`}>
                                        <span className="line-clamp-2" title={r.nama}>{r.nama}</span>
                                    </td>
                                    {r.nilai.map((n, j) => (
                                        <td key={j} className={`${td} ${j === kosongIdx ? "bg-amber-50/40 dark:bg-amber-500/5" : ""}`} title={`${r.nama} · ${rekap.kolom[j]}: ${fmt(n)} peserta (${pct(n, r.jumlah)}% baris, ${pct(n, rekap.total[j])}% kolom)`}>
                                            <span
                                                className={`inline-flex min-w-[34px] justify-center rounded-md px-1.5 py-0.5 ${n ? "font-bold text-[#0B1B3F] dark:text-white" : "text-slate-300 dark:text-slate-600"}`}
                                                style={n ? { background: j === kosongIdx ? `rgba(245,158,11,${0.1 + heat(n, r.jumlah) * 0.3})` : `rgba(59,130,246,${0.08 + heat(n, r.jumlah) * 0.32})` } : undefined}
                                            >
                                                {n ? cell(n, r.jumlah) : "–"}
                                            </span>
                                        </td>
                                    ))}
                                    <td className={`${td} font-black text-slate-900 dark:text-white`}>
                                        {fmt(r.jumlah)}
                                        <span className="ml-1 text-[10px] font-semibold text-slate-400">{pct(r.jumlah, rekap.jumlah)}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#0B1B3F] text-white">
                                <td colSpan={2} className="sticky left-0 z-[1] bg-[#0B1B3F] px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider">Jumlah</td>
                                {rekap.total.map((n, j) => <td key={j} className="px-3 py-2.5 text-[13px] font-black tabular-nums">{mode === "pct" ? `${pct(n, rekap.jumlah)}%` : fmt(n)}</td>)}
                                <td className="px-3 py-2.5 text-[13px] font-black tabular-nums text-sky-200">{fmt(rekap.jumlah)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {!query && filtered.length > ROW_PREVIEW && (
                    <div className="flex justify-center">
                        <button type="button" onClick={() => setShowAll((v) => !v)} className="h-8 px-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                            {showAll ? "Tampilkan lebih sedikit" : `Tampilkan semua (${fmt(filtered.length)} baris)`}
                        </button>
                    </div>
                )}
                {rekap.kolom.includes("Lainnya") && <p className="px-1 text-[11px] text-slate-500">Kolom &quot;Lainnya&quot; menggabungkan kategori dengan jumlah peserta kecil.</p>}
            </div>
        </section>
    );
}

/* ============================ KUALITAS DATA ============================ */

function QualityCard({ q, periodLabel, onPick }: { q: ReturnType<typeof buildQuality>; periodLabel: string; onPick: (satker: string) => void }) {
    const [onlyIssues, setOnlyIssues] = useState(false);
    const rows = onlyIssues ? q.rows.filter((r) => r.pct.some((v) => v < WARN)) : q.rows;

    return (
        <section className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
                        <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#10B981_0%,transparent_75%)]" />
                        <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Kelengkapan isian data peserta</h4>
                        <p className="text-[11px] text-slate-500">{periodLabel} · rata-rata kelengkapan <b className="text-slate-700 dark:text-slate-200">{q.overall.avg}%</b> · klik nama satker untuk fokus</p>
                    </div>
                </div>
                <label className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} className="h-3.5 w-3.5 accent-[#0B1B3F]" />
                    Hanya yang perlu tindak lanjut
                </label>
            </header>

            <div className="p-4 md:p-5 space-y-3">
                {q.issues.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-300"><AlertTriangle className="h-3.5 w-3.5" /> Perlu perhatian:</span>
                        {q.issues.slice(0, 6).map((x) => (
                            <button key={x.satker + x.field} type="button" onClick={() => onPick(x.satker)} className="rounded-lg bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-700 dark:text-rose-200 ring-1 ring-rose-200/70 dark:ring-rose-400/20 hover:bg-rose-100">
                                {singkatSatker(x.satker)} · {x.field} <b>{x.v}%</b>
                            </button>
                        ))}
                        {q.issues.length > 6 && <span className="text-[11px] text-slate-400">+{q.issues.length - 6} lainnya</span>}
                    </div>
                ) : q.overall.total > 0 && (
                    <p className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> Semua isian di atas {WARN}% — data siap dilaporkan.</p>
                )}

                <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
                    <table className="w-full text-center">
                        <thead>
                            <tr>
                                <th className={`${th} w-10`}>No</th>
                                <th className={`${th} text-left min-w-[200px]`}>Satuan Kerja</th>
                                <th className={th}>Peserta</th>
                                {QUALITY_FIELDS.map((f) => <th key={f.key} className={th}>{f.label}</th>)}
                                <th className={th}>Rata-rata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {rows.length === 0 && <tr><td colSpan={QUALITY_FIELDS.length + 4} className="py-10 text-sm text-slate-400">{onlyIssues ? "Tidak ada satker yang perlu tindak lanjut 🎉" : "Belum ada data pada periode ini"}</td></tr>}
                            {rows.map((r, i) => (
                                <tr key={r.nama} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                    <td className={`${td} text-slate-400`}>{i + 1}</td>
                                    <td className={`${td} text-left font-semibold`}>
                                        <button type="button" onClick={() => onPick(r.nama)} className="text-left hover:text-blue-600 hover:underline line-clamp-2" title={`Fokus ke ${r.nama}`}>{r.nama}</button>
                                    </td>
                                    <td className={td}>{fmt(r.total)}</td>
                                    {r.pct.map((v, j) => (
                                        <td key={j} className={td} title={`${QUALITY_FIELDS[j].label}: ${v}% terisi (${fmt(Math.round((v / 100) * r.total))} dari ${fmt(r.total)})`}>
                                            <span className={`inline-flex min-w-[44px] justify-center rounded-md px-1.5 py-0.5 text-[12px] font-bold ${qualityTone(v)}`}>{v}%</span>
                                        </td>
                                    ))}
                                    <td className={td}><span className={`inline-flex min-w-[44px] justify-center rounded-md px-1.5 py-0.5 text-[12px] font-black ${qualityTone(r.avg)}`}>{r.avg}%</span></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#0B1B3F] text-white">
                                <td colSpan={2} className="px-3 py-2.5 text-left text-xs font-black uppercase tracking-wider">Keseluruhan</td>
                                <td className="px-3 py-2.5 text-[13px] font-black tabular-nums">{fmt(q.overall.total)}</td>
                                {q.overall.pct.map((v, j) => <td key={j} className="px-3 py-2.5 text-[13px] font-black tabular-nums">{v}%</td>)}
                                <td className="px-3 py-2.5 text-[13px] font-black tabular-nums text-sky-200">{q.overall.avg}%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </section>
    );
}

/* ============================ UI ============================ */

function Delta({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const up = value >= 0;
    return (
        <span title={label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${up ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30" : "bg-rose-400/15 text-rose-200 ring-rose-300/30"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up && value > 0 ? "+" : ""}{value}{suffix} <span className="font-normal opacity-80">{label}</span>
        </span>
    );
}

function HeroKpi({ icon: Icon, accent, label, value, sub, progress, extra, className = "" }: { icon: LucideIcon; accent: string; label: string; value: string; sub: string; progress?: number; extra?: React.ReactNode; className?: string }) {
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
            {extra && <div className="mt-1.5">{extra}</div>}
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

const KinerjaSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-[380px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-96 max-w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-[460px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
);

export default SummaryKinerja;

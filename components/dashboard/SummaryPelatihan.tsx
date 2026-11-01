"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import {
  TrendingUp, TrendingDown, CalendarRange, RotateCcw, Wallet, School, Users, CheckCircle2, Gauge,
  Map as MapIcon, LucideIcon,
} from "lucide-react";

import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { useFetchAllDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseIndonesianDate, tahunList } from "@/utils/time";
import { formatToRupiah, formatToShorthandRupiah } from "@/lib/utils";
import PenyelenggaraMap from "./PenyelenggaraMap";

/* ============================ HELPERS ============================ */

const QUARTERS = ["TW I", "TW II", "TW III", "TW IV"] as const;
type Quarter = (typeof QUARTERS)[number];

const DAY_MS = 86_400_000;
const PUSAT = "Pusat Pelatihan Kelautan dan Perikanan";
const NOW = dayjs();
const CURRENT_YEAR = NOW.year();
const CURRENT_QUARTER_IDX = Math.floor(NOW.month() / 3);
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const quarterIdxOf = (month: number) => Math.min(3, Math.max(0, Math.ceil(month / 3) - 1));
const defaultQuarterFor = (year: number): Quarter => QUARTERS[year === CURRENT_YEAR ? CURRENT_QUARTER_IDX : 3];

/** Parse "YYYY-MM-DD", "DD-MM-YYYY", atau tanggal Indonesia → Date | null */
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

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
const isSigned = (f?: string) => !!f && f.includes("signed");

/* ============================ KOMPONEN ============================ */

const SummaryPelatihan: React.FC = () => {
  const { data: dataDukung, isFetching: isFetchingDukung } = useFetchDataDukung();
  const { data, isFetching } = useFetchAllDataPelatihanMasyarakat();

  const [tahun, setTahun] = useState(CURRENT_YEAR);
  const [triwulan, setTriwulan] = useState<Quarter>(() => defaultQuarterFor(CURRENT_YEAR));
  useEffect(() => setTriwulan(defaultQuarterFor(tahun)), [tahun]);

  const years = useMemo(() => [...tahunList].sort((a, b) => b - a), []);
  const quarterIdx = QUARTERS.indexOf(triwulan);
  const isDefaultPeriod = tahun === CURRENT_YEAR && triwulan === defaultQuarterFor(CURRENT_YEAR);

  /* ---------- Index tanggal (parse sekali) ---------- */
  const pelatihanIndexed = useMemo(
    () => (data || []).map((item) => ({ item, start: parseDate(item.TanggalMulaiPelatihan), end: parseDate(item.TanggalBerakhirPelatihan) })),
    [data]
  );
  const dukungIndexed = useMemo(
    () =>
      (dataDukung || [])
        .filter((u) => isSigned(u.FileSertifikat) && !u.PenyelenggaraPelatihan?.includes(PUSAT))
        .map((item) => ({ item, start: parseDate(item.TanggalMulai) })),
    [dataDukung]
  );

  /* ---------- Filter periode (s.d. triwulan) dalam 1 loop ---------- */
  const period = useMemo(() => {
    const inPeriod = (d: Date | null) => !!d && d.getFullYear() === tahun && quarterIdxOf(d.getMonth() + 1) <= quarterIdx;

    const pel: (typeof pelatihanIndexed)[number]["item"][] = [];
    let days = 0, done = 0, pnbp = 0;
    for (const { item, start, end } of pelatihanIndexed) {
      if (!inPeriod(start)) continue;
      pel.push(item);
      if (start && end) {
        const diff = Math.ceil((end.getTime() - start.getTime()) / DAY_MS);
        if (diff > 0) days += diff;
      }
      if (parseInt(item?.StatusPenerbitan) >= 5) done++;
      const price = Number(item.HargaPelatihan || 0);
      if (price) {
        let signed = 0;
        for (const u of item.UserPelatihan || []) if (isSigned(u.FileSertifikat)) signed++;
        pnbp += price * signed;
      }
    }

    const duk: (typeof dukungIndexed)[number]["item"][] = [];
    let m = 0, f = 0;
    const monthly = new Array(12).fill(0);
    for (const { item, start } of dukungIndexed) {
      if (!inPeriod(start)) continue;
      duk.push(item);
      const jk = item.JenisKelamin;
      if (jk === "L" || jk === "Laki - Laki") m++;
      else if (jk === "P" || jk === "Perempuan") f++;
      monthly[start!.getMonth()]++;
    }
    const activeMonths = monthly.filter((v) => v > 0);
    const last = activeMonths[activeMonths.length - 1] ?? 0;
    const prev = activeMonths[activeMonths.length - 2] ?? 0;

    return { pel, duk, days, done, pnbp, male: m, female: f, growth: prev > 0 ? Math.round(((last - prev) / prev) * 100) : null };
  }, [pelatihanIndexed, dukungIndexed, tahun, quarterIdx]);

  const totalPelatihan = period.pel.length;
  const totalPeserta = period.duk.length;
  const avgPeserta = totalPelatihan ? Math.round(totalPeserta / totalPelatihan) : 0;
  const avgPerDay = period.days ? Math.round(totalPeserta / period.days) : 0;
  const completionRate = pct(period.done, totalPelatihan);
  const malePct = pct(period.male, totalPeserta);
  const femalePct = pct(period.female, totalPeserta);
  const tahunStr = String(tahun);

  const initialLoading = (isFetching && !data?.length) || (isFetchingDukung && !dataDukung?.length);

  if (initialLoading) return <SummarySkeleton />;

  if (!data?.length) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-12 text-center">
        <Image src="/illustrations/not-found.png" alt="" width={320} height={320} className="w-64 h-auto" />
        <h1 className="mt-4 text-xl font-black text-slate-900 dark:text-white">Belum ada data pelatihan</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">Data capaian akan tampil setelah penyelenggaraan pelatihan tercatat di sistem.</p>
      </div>
    );
  }

  /* ============================ RENDER ============================ */

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full flex flex-col gap-6 max-w-[1920px] mx-auto pb-12">
        {/* ─── HERO ─── */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.45)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_70%_at_100%_0%,#0EA5E9_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-90" />
          <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />

          <div className="p-5 md:p-8">
            {/* Header + filter */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                  </span>
                  {isFetching ? "Memperbarui…" : "Realisasi Pelatihan Masyarakat"}
                </span>
                <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                  Capaian <span className="bg-gradient-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-transparent">s.d. {triwulan}</span> <span className="text-white/40">{tahun}</span>
                </h2>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-blue-100/70">
                  Januari – {BULAN[quarterIdx * 3 + 2]} {tahun} · peserta bersertifikat
                  {period.growth !== null && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${period.growth >= 0 ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30" : "bg-rose-400/15 text-rose-200 ring-rose-300/30"}`}>
                      {period.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {period.growth > 0 ? "+" : ""}
                      {period.growth}% bulan terakhir
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/[0.07] ring-1 ring-white/10 p-1.5 backdrop-blur-xl">
                <label className="relative">
                  <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-200" />
                  <select
                    value={tahunStr}
                    onChange={(e) => setTahun(parseInt(e.target.value))}
                    className="h-9 pl-8 pr-2 rounded-xl border-none bg-white/10 text-sm font-bold text-white outline-none hover:bg-white/15 [&>option]:text-slate-900"
                    aria-label="Tahun"
                  >
                    {years.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                {QUARTERS.map((q, i) => {
                  const future = tahun === CURRENT_YEAR && i > CURRENT_QUARTER_IDX;
                  const active = q === triwulan;
                  return (
                    <Tooltip key={q}>
                      <TooltipTrigger asChild>
                        <span>
                          <button
                            type="button"
                            disabled={future}
                            onClick={() => setTriwulan(q)}
                            className={`h-9 min-w-[48px] px-3 rounded-xl text-xs font-black transition-all ${active ? "bg-white text-[#0B1B3F] shadow-[0_6px_20px_-6px_rgba(255,255,255,0.6)]" : future ? "text-white/25 cursor-not-allowed" : "text-blue-100/80 hover:bg-white/10 hover:text-white"}`}
                          >
                            {q.replace("TW ", "TW ")}
                          </button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs font-bold">{future ? "Belum berjalan" : `Akumulasi s.d. ${q}`}</TooltipContent>
                    </Tooltip>
                  );
                })}
                {!isDefaultPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      setTahun(CURRENT_YEAR);
                      setTriwulan(defaultQuarterFor(CURRENT_YEAR));
                    }}
                    className="h-9 px-3 rounded-xl text-xs font-bold text-sky-100 hover:bg-white/10 inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Sekarang
                  </button>
                )}
              </div>
            </div>

            {/* Bento KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              {/* PNBP */}
              <div className="group col-span-2 lg:col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between min-h-[190px]">
                <Wallet aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-amber-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 [background:linear-gradient(to_left,#F59E0B40_0%,transparent_70%)]" />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Realisasi PNBP</p>
                  <span className="rounded-full bg-white/10 ring-1 ring-white/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-100">Penerimaan negara</span>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="w-fit cursor-help text-4xl md:text-[52px] font-black tracking-[-0.04em] tabular-nums leading-none">{formatToShorthandRupiah(period.pnbp)}</p>
                    </TooltipTrigger>
                    <TooltipContent className="text-sm font-bold">{formatToRupiah(period.pnbp)}</TooltipContent>
                  </Tooltip>
                  <p className="mt-2 text-xs text-blue-100/60">dari {fmt(totalPeserta)} peserta bersertifikat · {fmt(totalPelatihan)} pelatihan</p>
                </div>
              </div>

              <Kpi className="lg:col-span-2" label="Total Pelatihan" value={fmt(totalPelatihan)} unit="kelas" icon={School} accent="#3B82F6" />
              <Kpi className="lg:col-span-2" label="Masyarakat Dilatih" value={fmt(totalPeserta)} unit="peserta" icon={Users} accent="#06B6D4">
                <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-white/10" title={`Laki-laki ${malePct}% · Perempuan ${femalePct}%`}>
                  <div className="h-full bg-sky-300" style={{ width: `${malePct}%` }} />
                  <div className="h-full bg-pink-300" style={{ width: `${femalePct}%` }} />
                </div>
                <p className="mt-1 flex justify-between text-[10px] text-blue-100/60">
                  <span>♂ {fmt(period.male)} · {malePct}%</span>
                  <span>♀ {fmt(period.female)} · {femalePct}%</span>
                </p>
              </Kpi>
              <Kpi className="lg:col-span-2" label="Penyelesaian" value={`${completionRate}%`} unit={`${fmt(period.done)}/${fmt(totalPelatihan)} kelas`} icon={CheckCircle2} accent="#10B981">
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completionRate}%`, background: "linear-gradient(90deg,#10B981,#fff)" }} />
                </div>
              </Kpi>
              <Kpi className="lg:col-span-2" label="Rata-rata" value={fmt(avgPeserta)} unit="peserta / kelas" icon={Gauge} accent="#8B5CF6">
                <p className="mt-1 text-[11px] text-blue-100/60">{fmt(avgPerDay)} peserta / hari · {fmt(period.days)} hari kegiatan</p>
              </Kpi>
            </div>
          </div>
        </section>

        {/* ─── PUSAT INSIGHT: peta + tren + pipeline + aktivitas + komposisi (satu komponen) ─── */}
        <Section icon={MapIcon} title="Sebaran & Insight Penyelenggara" desc="Klik titik di peta atau nama penyelenggara untuk melihat detailnya." />
        <PenyelenggaraMap data={period.pel} tahun={tahunStr} />
      </div>
    </TooltipProvider>
  );
};

/* ============================ UI ============================ */

function Kpi({ label, value, unit, icon: Icon, accent, className = "", children }: { label: string; value: string; unit: string; icon: LucideIcon; accent: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`group relative isolate overflow-hidden rounded-3xl bg-white/[0.07] ring-1 ring-white/10 p-4 md:p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.1] ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
      <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 h-24 w-24 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/70">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl md:text-3xl font-black tracking-tight tabular-nums">{value}</span>
        <span className="text-[10px] font-bold uppercase text-sky-100/60">{unit}</span>
      </div>
      {children}
    </div>
  );
}

function Section({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1B3F]/5 dark:bg-white/5 text-[#0B1B3F] dark:text-sky-200">
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

const SummarySkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    <div className="h-80 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
    <div className="h-[420px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="h-[380px] xl:col-span-2 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-[380px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
  </div>
);

export default SummaryPelatihan;

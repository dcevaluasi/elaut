"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  MapPin, Users, School, Wallet, Search, X, CheckCircle2, Loader, CalendarDays, Clock, BookOpen, ArrowUpRight,
  AlertTriangle, Globe2, LayoutGrid, Megaphone, Layers, Coins, LucideIcon,
} from "lucide-react";
import { PelatihanMasyarakat } from "@/types/product";
import { formatToRupiah, formatToShorthandRupiah, encryptValue } from "@/lib/utils";
import { parseIndonesianDate } from "@/utils/time";

/* ============================ PROYEKSI & PETA ============================
 * Peta Indonesia bergaya "dot-matrix" tanpa library tambahan.
 * Pulau digambar dari poligon sederhana (lon, lat) → titik grid.
 * ======================================================================= */

export const W = 960;
export const H = 380;
const LON0 = 94, LON1 = 142, LAT0 = 7, LAT1 = -12;
export const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * W;
export const py = (lat: number) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;

type Poly = [number, number][];
const ISLANDS: Poly[] = [
  // Sumatra
  [[95.2, 5.6], [97.5, 5.2], [100.3, 2.5], [103.5, 1.0], [104.6, -1.0], [106.0, -3.2], [105.8, -5.9], [104.5, -5.9], [102.3, -4.0], [100.4, -1.0], [98.8, 1.7], [97.0, 3.3], [95.3, 4.8]],
  // Bangka
  [[105.2, -1.6], [106.3, -1.8], [106.7, -3.0], [105.8, -2.9]],
  // Jawa
  [[105.2, -6.8], [106.0, -5.9], [108.3, -6.2], [110.4, -6.9], [112.6, -6.9], [114.4, -7.7], [114.6, -8.7], [112.5, -8.4], [110.0, -8.1], [108.0, -7.8], [106.4, -7.4]],
  // Bali
  [[114.4, -8.1], [115.7, -8.3], [115.2, -8.85], [114.6, -8.6]],
  // Lombok–Sumbawa
  [[116.0, -8.25], [119.0, -8.2], [119.1, -8.85], [116.0, -8.95]],
  // Flores
  [[119.8, -8.35], [123.0, -8.2], [122.9, -8.75], [119.8, -8.85]],
  // Sumba
  [[119.0, -9.4], [120.8, -9.6], [120.6, -10.25], [119.1, -9.85]],
  // Timor
  [[123.5, -10.4], [125.2, -9.3], [125.0, -9.95], [123.6, -10.45]],
  // Kalimantan
  [[108.9, 1.5], [109.6, 2.0], [111.0, 1.4], [113.0, 1.2], [114.5, 1.5], [115.6, 4.2], [117.6, 4.2], [118.3, 1.0], [117.5, 0.5], [117.5, -1.0], [116.5, -2.0], [116.2, -3.9], [114.6, -4.1], [113.0, -3.2], [111.0, -3.0], [110.2, -2.9], [109.9, -1.0], [109.0, 0.0]],
  // Sulawesi
  [[119.3, -5.5], [120.5, -5.6], [120.4, -2.9], [121.2, -2.7], [122.8, -4.6], [123.3, -4.3], [121.4, -1.9], [123.4, -0.9], [121.9, -0.9], [121.2, 0.5], [124.0, 0.4], [125.2, 1.5], [124.6, 1.8], [123.0, 1.0], [120.8, 1.3], [120.1, 0.6], [119.8, -0.6], [118.8, -2.6], [119.6, -3.5]],
  // Halmahera
  [[127.4, 2.2], [128.7, 1.6], [128.2, 0.6], [128.9, -0.4], [127.9, -0.8], [127.7, 1.0]],
  // Buru
  [[125.9, -3.1], [127.2, -3.2], [127.0, -3.85], [126.0, -3.7]],
  // Seram
  [[127.9, -2.8], [130.9, -3.2], [130.7, -3.85], [128.2, -3.6]],
  // Kepulauan Kei & Tanimbar
  [[132.6, -5.4], [133.2, -5.5], [133.0, -6.0], [132.6, -5.9]],
  [[131.0, -7.2], [131.7, -7.1], [131.6, -8.1], [131.0, -8.0]],
  // Papua
  [[131.0, -1.2], [132.5, -0.4], [134.1, -0.9], [135.3, -3.4], [137.0, -1.5], [138.7, -1.7], [141.0, -2.6], [141.0, -9.1], [140.1, -8.2], [138.0, -8.4], [137.6, -7.5], [138.5, -6.5], [136.8, -4.7], [134.8, -4.3], [133.2, -4.1], [132.0, -2.9], [133.6, -2.5], [131.6, -1.6]],
];

const inside = (lon: number, lat: number, poly: Poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

// Titik peta dihitung sekali (modul)
const STEP = 0.36;
export const DOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let lat = LAT0; lat >= LAT1; lat -= STEP)
    for (let lon = LON0; lon <= LON1; lon += STEP)
      if (ISLANDS.some((p) => inside(lon, lat, p))) out.push([px(lon), py(lat)]);
  return out;
})();

/* ============================ KOORDINAT PENYELENGGARA ============================
 * Dicocokkan dari kata kunci nama penyelenggara (case-insensitive).
 * Tambahkan di sini bila ada UPT yang belum terpetakan.
 * ================================================================================ */

const PLACES: [string[], number, number][] = [
  [["pusat pelatihan", "puslat", "jakarta", "pasar minggu", "ancol", "bppsdm"], 106.82, -6.2],
  [["aceh", "ladong"], 95.45, 5.5],
  [["medan", "belawan"], 98.67, 3.59],
  [["pariaman", "padang"], 100.12, -0.62],
  [["dumai"], 101.45, 1.67],
  [["batam", "kepri", "karimun", "tanjung pinang"], 104.05, 1.1],
  [["jambi"], 103.6, -1.6],
  [["palembang"], 104.75, -2.99],
  [["bengkulu"], 102.26, -3.8],
  [["lampung", "kotaagung", "kota agung"], 104.62, -5.5],
  [["serang", "banten"], 106.15, -6.12],
  [["bogor"], 106.8, -6.6],
  [["karawang"], 107.3, -6.3],
  [["sukamandi", "subang"], 107.65, -6.35],
  [["cirebon"], 108.55, -6.73],
  [["pangandaran"], 108.65, -7.68],
  [["tegal"], 109.14, -6.87],
  [["semarang"], 110.42, -6.97],
  [["jepara"], 110.67, -6.59],
  [["sidoarjo"], 112.72, -7.45],
  [["surabaya"], 112.75, -7.25],
  [["situbondo"], 114.0, -7.7],
  [["banyuwangi"], 114.37, -8.22],
  [["jembrana", "bali", "denpasar"], 114.62, -8.36],
  [["lombok", "mataram"], 116.1, -8.58],
  [["kupang"], 123.6, -10.17],
  [["pontianak"], 109.34, -0.03],
  [["banjarmasin"], 114.59, -3.32],
  [["balikpapan", "samarinda"], 116.86, -1.26],
  [["makassar"], 119.42, -5.14],
  [["maros"], 119.57, -5.0],
  [["pangkep", "pangkajene"], 119.55, -4.82],
  [["bone"], 120.33, -4.54],
  [["kendari"], 122.51, -3.97],
  [["gorontalo"], 123.06, 0.54],
  [["bitung"], 125.19, 1.44],
  [["manado"], 124.84, 1.49],
  [["ternate"], 127.38, 0.79],
  [["ambon", "waiheru"], 128.19, -3.69],
  [["tual", "langgur"], 132.73, -5.64],
  [["sorong"], 131.25, -0.88],
  [["jayapura"], 140.7, -2.53],
  [["merauke"], 140.4, -8.5],
];

export const locate = (name: string): { x: number; y: number } | null => {
  const n = name.toLowerCase();
  const hit = PLACES.find(([keys]) => keys.some((k) => n.includes(k)));
  return hit ? { x: px(hit[1]), y: py(hit[2]) } : null;
};


/* ============================ TURUNAN DATA ============================ */

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY = 86_400_000;

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

// Tahap pipeline (sama dengan StatsMetricStatus)
const STAGES = [
  { id: "persiapan", label: "Persiapan", codes: ["0"], color: "#94A3B8" },
  { id: "spv", label: "Review SPV", codes: ["1", "1.2"], color: "#F59E0B" },
  { id: "verif", label: "Verifikator", codes: ["2", "3", "4"], color: "#3B82F6" },
  { id: "laksana", label: "Pelaksanaan", codes: ["5", "6"], color: "#14B8A6" },
  { id: "sttpl", label: "Review STTPL", codes: ["7", "7A", "7B", "7C", "8", "9", "10"], color: "#8B5CF6" },
  { id: "kabadan", label: "Kabadan", codes: ["12", "13", "14"], color: "#F97316" },
  { id: "selesai", label: "Selesai", codes: ["7D", "11", "15"], color: "#10B981" },
] as const;
type StageId = (typeof STAGES)[number]["id"] | "lain";
const CODE_STAGE = new Map<string, StageId>();
STAGES.forEach((s) => s.codes.forEach((c) => CODE_STAGE.set(c, s.id)));

const PENDING_STTPL = new Set(["7A", "7B", "8", "10", "12", "14"]);

type Activity = "upcoming" | "ongoing" | "done" | "other";

interface Rec {
  p: PelatihanMasyarakat;
  org: string;
  signed: number;
  pnbp: number;
  male: number;
  female: number;
  month: number; // 0-11, -1 bila tak diketahui
  stage: StageId;
  activity: Activity;
  progress: number;
  pendingSttpl: boolean;
}

const derive = (p: PelatihanMasyarakat, now: Date): Rec => {
  let signed = 0, male = 0, female = 0;
  for (const u of p.UserPelatihan || []) {
    if (!u.FileSertifikat?.includes("signed")) continue;
    signed++;
    const jk = (u as any).JenisKelamin;
    if (jk === "L" || jk === "Laki - Laki") male++;
    else if (jk === "P" || jk === "Perempuan") female++;
  }
  const start = parseDate(p.TanggalMulaiPelatihan);
  const end = parseDate(p.TanggalBerakhirPelatihan);
  const code = String(p.StatusPenerbitan ?? "").trim().toUpperCase();
  const num = parseFloat(code);

  let activity: Activity = "other";
  if (code === "4" && start && start > now) activity = "upcoming";
  else if (code === "4" && start && end && start <= now && end >= now) activity = "ongoing";
  else if (end && end < now && num >= 5) activity = "done";

  let progress = 0;
  if (start && end) {
    const total = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY));
    progress = Math.max(0, Math.min(100, Math.round(((now.getTime() - start.getTime()) / DAY / total) * 100)));
  }

  return {
    p,
    org: (p.PenyelenggaraPelatihan || "").trim(),
    signed,
    pnbp: Number(p.HargaPelatihan || 0) * signed,
    male,
    female,
    month: start ? start.getMonth() : -1,
    stage: CODE_STAGE.get(code) ?? "lain",
    activity,
    progress,
    pendingSttpl: PENDING_STTPL.has(code),
  };
};

const tallyTop = (recs: Rec[], key: (p: PelatihanMasyarakat) => string | undefined) => {
  const m = new Map<string, number>();
  for (const r of recs) {
    const k = key(r.p)?.trim();
    if (k && r.signed) m.set(k, (m.get(k) || 0) + r.signed);
  }
  return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

/* ============================ KOMPONEN ============================ */

type Metric = "peserta" | "pelatihan" | "pnbp";
type TopTab = "program" | "klaster" | "prioritas" | "pembiayaan";

const METRICS: { key: Metric; label: string; icon: LucideIcon; color: string }[] = [
  { key: "peserta", label: "Peserta", icon: Users, color: "#38BDF8" },
  { key: "pelatihan", label: "Pelatihan", icon: School, color: "#34D399" },
  { key: "pnbp", label: "PNBP", icon: Wallet, color: "#FBBF24" },
];
const TOP_TABS: { key: TopTab; label: string; icon: LucideIcon }[] = [
  { key: "program", label: "Program", icon: BookOpen },
  { key: "klaster", label: "Klaster", icon: LayoutGrid },
  { key: "prioritas", label: "Prioritas", icon: Megaphone },
  { key: "pembiayaan", label: "Pembiayaan", icon: Coins },
];
const BAR_COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#6366F1", "#14B8A6"];

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const showVal = (m: Metric, v: number) => (m === "pnbp" ? formatToShorthandRupiah(v) : fmt(v));

export default function PenyelenggaraMap({ data }: { data: PelatihanMasyarakat[]; tahun?: string }) {
  const pathname = usePathname() || "";
  const adminBase = pathname.includes("pusat") ? "pusat" : "lemdiklat";

  const [metric, setMetric] = useState<Metric>("peserta");
  const [hover, setHover] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>(null); // null = nasional
  const [q, setQ] = useState("");
  const [topTab, setTopTab] = useState<TopTab>("program");

  /* ---------- Turunan per pelatihan (sekali) ---------- */
  const recs = useMemo(() => {
    const now = new Date();
    return data.map((p) => derive(p, now)).filter((r) => r.org);
  }, [data]);

  /* ---------- Agregat per penyelenggara (peta + peringkat) ---------- */
  const orgs = useMemo(() => {
    const m = new Map<string, { name: string; pelatihan: number; peserta: number; pnbp: number; selesai: number; pos: { x: number; y: number } | null }>();
    for (const r of recs) {
      const a = m.get(r.org) || { name: r.org, pelatihan: 0, peserta: 0, pnbp: 0, selesai: 0, pos: locate(r.org) };
      a.pelatihan++;
      a.peserta += r.signed;
      a.pnbp += r.pnbp;
      if (r.stage === "selesai") a.selesai++;
      m.set(r.org, a);
    }
    return Array.from(m.values());
  }, [recs]);

  const sorted = useMemo(() => [...orgs].sort((a, b) => b[metric] - a[metric]), [orgs, metric]);
  const rankOf = useMemo(() => new Map(sorted.map((o, i) => [o.name, i + 1])), [sorted]);
  const max = sorted[0]?.[metric] || 1;
  const mapped = sorted.filter((o) => o.pos);
  const unmapped = sorted.filter((o) => !o.pos);
  const list = sorted.filter((o) => !q || o.name.toLowerCase().includes(q.toLowerCase()));
  const color = METRICS.find((x) => x.key === metric)!.color;
  const focus = hover || scope;
  const radius = (v: number) => (v > 0 ? 5 + Math.sqrt(v / max) * 17 : 3.5);

  /* ---------- Insight untuk lingkup terpilih ---------- */
  const insight = useMemo(() => {
    const rs = scope ? recs.filter((r) => r.org === scope) : recs;
    const monthly = Array.from({ length: 12 }, (_, i) => ({ bulan: BULAN[i], peserta: 0, pnbp: 0, kelas: 0 }));
    const stage = new Map<StageId, number>();
    let signed = 0, pnbp = 0, male = 0, female = 0, selesai = 0, pending = 0;
    const act = { upcoming: 0, ongoing: 0, done: 0 };
    const ongoing: Rec[] = [];
    for (const r of rs) {
      signed += r.signed;
      pnbp += r.pnbp;
      male += r.male;
      female += r.female;
      if (r.stage === "selesai") selesai++;
      if (r.pendingSttpl) pending++;
      stage.set(r.stage, (stage.get(r.stage) || 0) + 1);
      if (r.activity !== "other") act[r.activity]++;
      if (r.activity === "ongoing") ongoing.push(r);
      if (r.month >= 0) {
        monthly[r.month].peserta += r.signed;
        monthly[r.month].pnbp += r.pnbp;
        monthly[r.month].kelas++;
      }
    }
    const stages = [...STAGES.map((s) => ({ id: s.id as StageId, label: s.label, color: s.color, n: stage.get(s.id) || 0 })), { id: "lain" as StageId, label: "Lainnya", color: "#CBD5E1", n: stage.get("lain") || 0 }].filter(
      (s) => s.id !== "lain" || s.n > 0
    );
    const neck = stages.filter((s) => s.id !== "selesai" && s.id !== "lain" && s.n > 0).sort((a, b) => b.n - a.n)[0] || null;
    const lastIdx = monthly.map((m) => m.peserta).reduce((acc, v, i) => (v > 0 ? i : acc), -1);
    const prevIdx = monthly.slice(0, Math.max(0, lastIdx)).map((m) => m.peserta).reduce((acc, v, i) => (v > 0 ? i : acc), -1);
    const growth = lastIdx >= 0 && prevIdx >= 0 && monthly[prevIdx].peserta > 0 ? Math.round(((monthly[lastIdx].peserta - monthly[prevIdx].peserta) / monthly[prevIdx].peserta) * 100) : null;

    return {
      kelas: rs.length,
      signed,
      pnbp,
      male,
      female,
      selesai,
      pending,
      act,
      ongoing: ongoing.sort((a, b) => b.signed - a.signed || (b.p.UserPelatihan?.length || 0) - (a.p.UserPelatihan?.length || 0)),
      monthly,
      stages,
      neck,
      growth,
      top: {
        program: tallyTop(rs, (p) => p.Program),
        klaster: tallyTop(rs, (p) => p.BidangPelatihan),
        prioritas: tallyTop(rs, (p) => p.DukunganProgramTerobosan),
        pembiayaan: tallyTop(rs, (p) => p.JenisPelatihan),
      },
    };
  }, [recs, scope]);

  const scopeRow = scope ? orgs.find((o) => o.name === scope) : null;
  const hoverRow = hover ? orgs.find((o) => o.name === hover) : null;
  const completion = pct(insight.selesai, insight.kelas);
  const genderTotal = insight.male + insight.female;
  const topList = insight.top[topTab];
  const topMax = topList[0]?.value || 1;

  const pick = (name: string) => setScope((s) => (s === name ? null : name));

  /* ============================ RENDER ============================ */

  return (
    <div className="flex flex-col gap-5">
      {/* ================= PETA + PERINGKAT ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] rounded-3xl overflow-hidden ring-1 ring-slate-200/80 dark:ring-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white min-w-0">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_10%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_80%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-60" />

          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Sebaran Penyelenggara</p>
              <h3 className="text-lg font-black tracking-tight">
                {fmt(orgs.length)} penyelenggara · {fmt(mapped.length)} terpetakan
              </h3>
            </div>
            <div className="flex items-center p-1 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${metric === m.key ? "bg-white text-[#0B1B3F] shadow" : "text-blue-100/70 hover:text-white"}`}
                >
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative px-2 pb-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Peta sebaran penyelenggara" onClick={() => setScope(null)}>
              <defs>
                <radialGradient id="pm-glow">
                  <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </radialGradient>
              </defs>
              <g fill="#fff" opacity={0.16}>
                {DOTS.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={2.1} />
                ))}
              </g>
              {[...mapped].reverse().map((o) => {
                const v = o[metric];
                const rad = radius(v);
                const on = focus === o.name;
                return (
                  <g
                    key={o.name}
                    transform={`translate(${o.pos!.x},${o.pos!.y})`}
                    onMouseEnter={() => setHover(o.name)}
                    onMouseLeave={() => setHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      pick(o.name);
                    }}
                    style={{ cursor: "pointer", transition: "opacity .2s" }}
                    opacity={focus && !on ? 0.35 : 1}
                  >
                    <circle r={rad * 2.2} fill="url(#pm-glow)" />
                    {on && <circle r={rad + 6} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} className="animate-ping" style={{ transformOrigin: "center", animationDuration: "1.6s" }} />}
                    <circle r={rad} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.6} />
                    {v > 0 && rad > 11 && metric !== "pnbp" && (
                      <text textAnchor="middle" dy="0.35em" fontSize={10} fontWeight={800} fill="#0B1B3F">
                        {v > 999 ? `${Math.round(v / 100) / 10}k` : v}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {hoverRow && (
              <div className="pointer-events-none absolute left-4 bottom-4 max-w-[300px] rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] animate-in fade-in slide-in-from-bottom-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">Peringkat #{rankOf.get(hoverRow.name)}</p>
                <p className="text-[13px] font-black leading-snug">{hoverRow.name}</p>
                <div className="mt-2 grid grid-cols-4 gap-3">
                  {METRICS.map((m) => (
                    <div key={m.key}>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-sky-100/60">{m.label}</p>
                      <p className="text-sm font-black tabular-nums" style={{ color: m.color }}>{showVal(m.key, hoverRow[m.key])}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-sky-100/60">Selesai</p>
                    <p className="text-sm font-black tabular-nums text-emerald-300">{pct(hoverRow.selesai, hoverRow.pelatihan)}%</p>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-blue-100/60">Klik untuk melihat detail di bawah</p>
              </div>
            )}

            {unmapped.length > 0 && (
              <p className="absolute right-4 bottom-3 text-[10px] text-blue-100/50" title={unmapped.map((u) => u.name).join(", ")}>
                {unmapped.length} belum punya koordinat
              </p>
            )}
          </div>
        </div>

        {/* Peringkat */}
        <div className="flex flex-col min-w-0 max-h-[520px] xl:max-h-[480px]">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setScope(null)}
              className={`w-full mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${!scope ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}
            >
              <Globe2 className="h-4 w-4" /> Nasional (semua penyelenggara)
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari penyelenggara…"
                className="w-full h-9 pl-8 pr-8 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:bg-slate-200" aria-label="Hapus">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <ol className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {list.length === 0 ? (
              <li className="py-10 text-center text-xs text-slate-400">Tidak ada penyelenggara</li>
            ) : (
              list.map((o) => {
                const rank = rankOf.get(o.name)!;
                const on = scope === o.name;
                return (
                  <li key={o.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setHover(o.name)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => pick(o.name)}
                      className={`w-full rounded-xl px-2.5 py-2 text-left transition-colors ${on ? "bg-[#0B1B3F] text-white" : hover === o.name ? "bg-slate-50 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 shrink-0 text-[10px] font-black tabular-nums ${on ? "text-sky-300" : rank <= 3 ? "text-amber-500" : "text-slate-400"}`}>{rank}</span>
                        <span className={`flex-1 min-w-0 truncate text-xs font-semibold ${on ? "text-white" : "text-slate-700 dark:text-slate-200"}`} title={o.name}>{o.name}</span>
                        {!o.pos && <MapPin className="h-3 w-3 shrink-0 text-slate-300" aria-label="Belum terpetakan" />}
                        <span className={`shrink-0 text-xs font-black tabular-nums ${on ? "text-white" : "text-slate-900 dark:text-white"}`}>{showVal(metric, o[metric])}</span>
                      </div>
                      <div className={`ml-7 mt-1 h-1 rounded-full overflow-hidden ${on ? "bg-white/15" : "bg-slate-100 dark:bg-slate-800"}`}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(o[metric] / max) * 100}%`, background: on ? "#fff" : color }} />
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ol>
        </div>
      </div>

      {/* ================= INSIGHT LINGKUP ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1B3F] text-sky-200">
            {scope ? <MapPin className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Insight {scope ? `· peringkat #${rankOf.get(scope)}` : "nasional"}</p>
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{scope || "Seluruh penyelenggara"}</h3>
          </div>
        </div>
        {scope && (
          <button type="button" onClick={() => setScope(null)} className="h-9 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5">
            <X className="h-3.5 w-3.5" /> Kembali ke nasional
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={School} accent="#3B82F6" label="Pelatihan" value={fmt(insight.kelas)} sub={`${fmt(insight.act.ongoing)} sedang berjalan`} />
        <Kpi icon={Users} accent="#06B6D4" label="Peserta bersertifikat" value={fmt(insight.signed)} sub={insight.kelas ? `${fmt(Math.round(insight.signed / insight.kelas))} / kelas` : "—"} />
        <Kpi icon={Wallet} accent="#F59E0B" label="PNBP" value={formatToShorthandRupiah(insight.pnbp)} sub={formatToRupiah(insight.pnbp)} />
        <Kpi icon={CheckCircle2} accent="#10B981" label="Tingkat selesai" value={`${completion}%`} sub={`${fmt(insight.selesai)} / ${fmt(insight.kelas)} kelas`} progress={completion} />
        <div className="col-span-2 lg:col-span-1 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Gender peserta</p>
          <div className="mt-2 flex h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-blue-500" style={{ width: `${pct(insight.male, genderTotal)}%` }} />
            <div className="h-full bg-pink-400" style={{ width: `${pct(insight.female, genderTotal)}%` }} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <p><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />L <b className="tabular-nums">{fmt(insight.male)}</b> <span className="text-slate-400">{pct(insight.male, genderTotal)}%</span></p>
            <p><span className="inline-block w-2 h-2 rounded-full bg-pink-400 mr-1" />P <b className="tabular-nums">{fmt(insight.female)}</b> <span className="text-slate-400">{pct(insight.female, genderTotal)}%</span></p>
          </div>
        </div>
      </div>

      {/* Tren + Pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <Card className="xl:col-span-3" icon={CalendarDays} accent="#6366F1" title="Tren bulanan" subtitle="Peserta bersertifikat & PNBP per bulan mulai pelatihan"
          right={insight.growth !== null && (
            <span className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-bold ring-1 ${insight.growth >= 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-rose-50 text-rose-600 ring-rose-100"}`}>
              {insight.growth > 0 ? "+" : ""}{insight.growth}% bulan terakhir
            </span>
          )}
        >
          <div className="px-2 pb-3 h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={insight.monthly} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="pm-bar" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} />
                <YAxis yAxisId="l" axisLine={false} tickLine={false} width={36} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} width={48} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => formatToShorthandRupiah(v).replace("Rp", "").trim()} />
                <Tooltip content={<TrendTip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                <Bar yAxisId="l" dataKey="peserta" name="Peserta" fill="url(#pm-bar)" radius={[6, 6, 0, 0]} barSize={18} />
                <Line yAxisId="r" dataKey="pnbp" name="PNBP" type="monotone" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: "#fff", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2" icon={Layers} accent="#10B981" title="Pipeline administrasi" subtitle={`${fmt(insight.kelas)} pelatihan`}>
          <div className="px-5 pb-5 space-y-3">
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800">
              {insight.stages.filter((s) => s.n > 0).map((s) => (
                <div key={s.id} title={`${s.label}: ${s.n}`} style={{ width: `${(s.n / Math.max(1, insight.kelas)) * 100}%`, background: s.color }} />
              ))}
            </div>
            <ul className="space-y-1.5">
              {insight.stages.map((s) => (
                <li key={s.id} className={`flex items-center gap-2 text-xs ${s.n ? "" : "opacity-40"}`}>
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-slate-600 dark:text-slate-300">{s.label}</span>
                  {insight.neck?.id === s.id && <span className="px-1.5 py-px rounded-md bg-amber-100 text-amber-700 text-[9px] font-black uppercase">Antrian terbanyak</span>}
                  <b className="tabular-nums text-slate-900 dark:text-white">{fmt(s.n)}</b>
                  <span className="w-9 text-right text-slate-400 tabular-nums">{pct(s.n, insight.kelas)}%</span>
                </li>
              ))}
            </ul>
            {insight.neck && (
              <p className="flex items-start gap-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 ring-1 ring-amber-100 dark:ring-amber-900/40 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 mt-px shrink-0" /> {fmt(insight.neck.n)} pelatihan tertahan di tahap <b>{insight.neck.label}</b>.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Aktivitas + Top */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <Card className="xl:col-span-2" icon={Loader} accent="#3B82F6" title="Aktivitas pelatihan" subtitle="Status pelaksanaan saat ini">
          <div className="px-5 grid grid-cols-4 gap-2">
            {[
              { label: "Akan datang", v: insight.act.upcoming, icon: CalendarDays, c: "text-teal-600 bg-teal-50" },
              { label: "Berjalan", v: insight.act.ongoing, icon: BookOpen, c: "text-blue-600 bg-blue-50" },
              { label: "Selesai", v: insight.act.done, icon: CheckCircle2, c: "text-emerald-600 bg-emerald-50" },
              { label: "Pending STTPL", v: insight.pending, icon: Clock, c: "text-amber-600 bg-amber-50" },
            ].map((a) => (
              <div key={a.label} className="rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 p-2.5 text-center">
                <span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg ${a.c}`}>
                  <a.icon className="h-3.5 w-3.5" />
                </span>
                <p className="mt-1 text-lg font-black tabular-nums text-slate-900 dark:text-white">{fmt(a.v)}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{a.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="px-5 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Sedang berjalan</p>
            <ul className="max-h-[230px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {insight.ongoing.length === 0 ? (
                <li className="px-5 py-6 text-center text-xs text-slate-400">Tidak ada pelatihan yang sedang berjalan</li>
              ) : (
                insight.ongoing.slice(0, 20).map((r) => {
                  const href = `/admin/${adminBase}/pelatihan/detail/${r.p.KodePelatihan}/${encryptValue(String(r.p.IdPelatihan))}`;
                  return (
                    <li key={r.p.IdPelatihan} className="px-5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <Link href={href} className="group flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">{r.p.NamaPelatihan}</span>
                          <span className="block text-[10px] text-slate-400 truncate">
                            {!scope && `${r.org} · `}
                            {r.p.UserPelatihan?.length || 0} peserta
                          </span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-blue-600" />
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${r.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-slate-500">{r.progress}%</span>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </Card>

        <Card
          className="xl:col-span-3"
          icon={LayoutGrid}
          accent="#8B5CF6"
          title="Komposisi peserta"
          subtitle="Peserta bersertifikat per kategori"
          right={
            <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 overflow-x-auto scrollbar-hide">
              {TOP_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopTab(t.key)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1 transition-all ${topTab === t.key ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                >
                  <t.icon className="h-3 w-3" /> {t.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="px-5 pb-5">
            {topList.length === 0 ? (
              <p className="py-10 text-center text-xs text-slate-400">Belum ada peserta bersertifikat</p>
            ) : (
              <ul className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {topList.slice(0, 12).map((t, i) => {
                  const c = BAR_COLORS[i % BAR_COLORS.length];
                  return (
                    <li key={t.name} className="group">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-200" title={t.name}>
                          <span className="mr-1.5 text-[10px] font-black text-slate-400 tabular-nums">{i + 1}</span>
                          {t.name}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          <b className="text-slate-900 dark:text-white">{fmt(t.value)}</b>{" "}
                          <span className="text-slate-400">{pct(t.value, insight.signed)}%</span>
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 group-hover:brightness-110" style={{ width: `${(t.value / topMax) * 100}%`, background: `linear-gradient(90deg, ${c}99, ${c})` }} />
                      </div>
                    </li>
                  );
                })}
                {topList.length > 12 && <li className="text-[11px] text-slate-400">+{topList.length - 12} kategori lain</li>}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ UI ============================ */

const TrendTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const peserta = payload.find((p: any) => p.dataKey === "peserta")?.value || 0;
  const pnbp = payload.find((p: any) => p.dataKey === "pnbp")?.value || 0;
  const kelas = payload[0]?.payload?.kelas || 0;
  return (
    <div className="rounded-2xl bg-[#0B1B3F]/95 backdrop-blur-xl px-3.5 py-3 text-white ring-1 ring-white/15 shadow-2xl text-xs">
      <p className="mb-1.5 pb-1.5 border-b border-white/10 font-bold">{label}</p>
      <p className="flex justify-between gap-4"><span className="text-blue-100/70">Peserta</span><b className="tabular-nums">{fmt(peserta)}</b></p>
      <p className="flex justify-between gap-4"><span className="text-blue-100/70">Pelatihan</span><b className="tabular-nums">{fmt(kelas)}</b></p>
      <p className="flex justify-between gap-4"><span className="text-blue-100/70">PNBP</span><b className="tabular-nums text-amber-300">{formatToShorthandRupiah(pnbp)}</b></p>
    </div>
  );
};

function Kpi({ icon: Icon, accent, label, value, sub, progress }: { icon: LucideIcon; accent: string; label: string; value: string; sub?: string; progress?: number }) {
  return (
    <div className="group relative isolate overflow-hidden rounded-2xl bg-[#0B1B3F] p-4 text-white ring-1 ring-white/10 shadow-lg">
      <div className="absolute inset-0 -z-10 opacity-90" style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }} />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }} />
      <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 h-20 w-20 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 truncate">{label}</p>
      <p className="mt-0.5 text-2xl font-black tabular-nums tracking-tight truncate">{value}</p>
      {progress !== undefined && (
        <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
        </div>
      )}
      {sub && <p className="mt-1 text-[10px] text-blue-100/60 truncate">{sub}</p>}
    </div>
  );
}

function Card({ icon: Icon, accent, title, subtitle, right, className = "", children }: { icon: LucideIcon; accent: string; title: string; subtitle: string; right?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`min-w-0 flex flex-col rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
            <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 75%)` }} />
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{title}</h4>
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

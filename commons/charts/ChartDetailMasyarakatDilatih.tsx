"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie, Treemap } from "recharts";
import { BarChart3, BarChartHorizontal, PieChart as PieIcon, ChevronLeft, ChevronRight, Trophy, Users, Layers, Megaphone, BookOpen, Building2, LayoutGrid, LucideIcon } from "lucide-react";
import { getFilteredDataByBalai } from "@/lib/training";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";

/* ============================ TEMA ============================ */

// Palet selaras aksen StatCard / tab dashboard
const PALETTE = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#6366F1", "#14B8A6", "#0EA5E9", "#A855F7"];
const colorAt = (i: number) => PALETTE[i % PALETTE.length];

const SIGNED_STAGES = new Set(["7D", "11", "15"]);
const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const truncate = (v: string, n = 22) => (typeof v === "string" && v.length > n ? v.slice(0, n) + "…" : v);
const isSignedFile = (f?: string) => !!f && f.includes("signed");

type Datum = { name: string; visitors: number };
type ChartType = "horizontal" | "vertical" | "pie" | "treemap";

/** Pilih bentuk chart otomatis sesuai karakter data */
const autoType = (d: Datum[]): ChartType => {
  if (d.length <= 4) return "pie"; // sedikit kategori → proporsi lebih jelas sebagai donat
  const avgLabel = d.reduce((s, x) => s + x.name.length, 0) / d.length;
  if (d.length >= 12) return "treemap"; // sangat banyak → peta proporsi
  if (avgLabel > 16 || d.length > 7) return "horizontal"; // label panjang → batang mendatar
  return "vertical";
};

/** Agregasi satu kali jalan (Map) — pengganti filter berulang per kategori */
const tally = <T,>(rows: T[], key: (r: T) => string | undefined | null, weight: (r: T) => number): Datum[] => {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r)?.trim();
    if (!k) continue;
    const w = weight(r);
    if (w) m.set(k, (m.get(k) || 0) + w);
  }
  return Array.from(m, ([name, visitors]) => ({ name, visitors })).sort((a, b) => b.visitors - a.visitors);
};

const signedCount = (p: PelatihanMasyarakat) => p.UserPelatihan?.reduce((s, u) => s + (isSignedFile(u.FileSertifikat) ? 1 : 0), 0) || 0;

/* ============================ UI BERSAMA ============================ */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p: any) => Number(p.value) > 0);
  const title = payload[0]?.payload?.name || payload[0]?.payload?.sektor || label;
  return (
    <div className="min-w-[180px] rounded-2xl bg-[#0B1B3F]/95 backdrop-blur-xl px-3.5 py-3 text-white ring-1 ring-white/15 shadow-2xl">
      {title && <p className="mb-1.5 pb-1.5 border-b border-white/10 text-[12px] font-bold leading-snug max-w-[260px]">{title}</p>}
      {rows.map((p: any) => (
        <div key={p.dataKey + p.name} className="mt-1 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: p.payload?.colorHex || p.color || p.fill }} />
          {payload.length > 1 && <span className="flex-1 text-[11px] text-blue-100/70 truncate">{p.name}</span>}
          <span className="text-[13px] font-black tabular-nums">{fmt(Number(p.value))}</span>
          <span className="text-[10px] text-blue-100/60">peserta</span>
        </div>
      ))}
    </div>
  );
};

function CardShell({ icon: Icon, title, subtitle, accent = "#3B82F6", right, children }: { icon: LucideIcon; title: string; subtitle: string; accent?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col w-full min-w-0 h-full rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative isolate flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
            <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 75%)` }} />
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight truncate">{title}</h3>
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

function StatStrip({ items }: { items: { label: string; value: string; sub?: string; accent: string; icon: LucideIcon }[] }) {
  return (
    <div className="relative isolate overflow-hidden mx-5 mt-4 rounded-2xl bg-[#0B1B3F] text-white ring-1 ring-white/10 grid grid-cols-3 divide-x divide-white/10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_140%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_140%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
      {items.map((s) => (
        <div key={s.label} className="group relative isolate overflow-hidden px-3.5 py-3 min-w-0">
          <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${s.accent}55 0%, transparent 80%)` }} />
          <s.icon aria-hidden className="pointer-events-none absolute -right-2 -bottom-3 -z-10 h-12 w-12 -rotate-12 opacity-20 group-hover:opacity-40 transition-opacity" style={{ color: s.accent }} />
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-sky-100/70 truncate">{s.label}</p>
          <p className="text-xl font-black tabular-nums leading-tight truncate">{s.value}</p>
          {s.sub && <p className="text-[10px] text-blue-100/55 truncate">{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function TypeToggle({ value, onChange }: { value: ChartType; onChange: (v: ChartType) => void }) {
  const opts: { v: ChartType; icon: LucideIcon; label: string }[] = [
    { v: "horizontal", icon: BarChartHorizontal, label: "Batang mendatar" },
    { v: "vertical", icon: BarChart3, label: "Batang tegak" },
    { v: "pie", icon: PieIcon, label: "Donat" },
    { v: "treemap", icon: LayoutGrid, label: "Peta proporsi" },
  ];
  return (
    <div className="flex shrink-0 items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          title={o.label}
          aria-label={o.label}
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${value === o.v ? "bg-[#0B1B3F] text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
        >
          <o.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/** Sel treemap: warna sesuai kategori, label bila cukup ruang */
const TreeCell = (props: any) => {
  const { x, y, width, height, name, visitors, colorHex, hover, onHover, total, depth } = props;
  if (depth !== 1 || !width || !height) return null;
  const dim = hover && hover !== name;
  const big = width > 70 && height > 38;
  return (
    <g onMouseEnter={() => onHover?.(name)} onMouseLeave={() => onHover?.(null)} style={{ cursor: "default" }}>
      <rect x={x + 1.5} y={y + 1.5} width={Math.max(0, width - 3)} height={Math.max(0, height - 3)} rx={10} fill={colorHex} opacity={dim ? 0.3 : 0.9} />
      {big && (
        <>
          <text x={x + 10} y={y + 20} fill="#fff" fontSize={11} fontWeight={700}>
            {truncate(String(name), Math.max(4, Math.floor(width / 7)))}
          </text>
          <text x={x + 10} y={y + 36} fill="#fff" fontSize={13} fontWeight={900} opacity={0.95}>
            {fmt(visitors)} · {pct(visitors, total)}%
          </text>
        </>
      )}
    </g>
  );
};

/* ============================ KARTU CHART ============================ */

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  accent?: string;
  chartData: Datum[];
  barHeight?: number;
  chartType?: ChartType;
  itemsPerPage?: number;
}

const TrainingChartCard: React.FC<ChartCardProps> = ({ title, icon, accent = "#3B82F6", chartData, barHeight = 46, chartType: initialType = "horizontal", itemsPerPage = 8 }) => {
  const [chartType, setChartType] = useState<ChartType>(initialType);
  const [page, setPage] = useState(1);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => setChartType(initialType), [initialType]);

  const totalPages = Math.max(1, Math.ceil(chartData.length / itemsPerPage));
  useEffect(() => setPage((p) => Math.min(p, totalPages)), [totalPages]);
  const start = (page - 1) * itemsPerPage;

  const total = useMemo(() => chartData.reduce((s, d) => s + d.visitors, 0), [chartData]);
  const top = chartData[0];

  // Warna stabil per kategori (berdasarkan urutan global, bukan per halaman)
  const rows = useMemo(
    () => chartData.slice(start, start + itemsPerPage).map((d, i) => ({ ...d, colorHex: colorAt(start + i), rank: start + i + 1 })),
    [chartData, start, itemsPerPage]
  );

  const height = chartType === "horizontal" ? Math.max(220, rows.length * (barHeight + 10) + 40) : chartType === "pie" ? 280 : chartType === "treemap" ? 320 : 340;
  // treemap & donat menampilkan semua kategori sekaligus (bukan per halaman)
  const allRows = useMemo(() => chartData.map((d, i) => ({ ...d, colorHex: colorAt(i), rank: i + 1 })), [chartData]);
  const paged = chartType === "horizontal" || chartType === "vertical";
  const gid = useMemo(() => `g${title.replace(/\W/g, "")}`, [title]);

  return (
    <CardShell icon={icon} accent={accent} title={title} subtitle="Peserta bersertifikat per kategori" right={chartData.length > 0 && <TypeToggle value={chartType} onChange={setChartType} />}>
      {chartData.length === 0 ? (
        <div className="m-5 py-14 flex flex-col items-center gap-2 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <BarChart3 className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada data</p>
          <p className="text-[11px] text-slate-400">Tidak ada peserta bersertifikat pada filter ini.</p>
        </div>
      ) : (
        <>
          <StatStrip
            items={[
              { label: "Total peserta", value: fmt(total), sub: "bersertifikat", accent: "#3B82F6", icon: Users },
              { label: "Kategori", value: fmt(chartData.length), sub: "segmen unik", accent: "#10B981", icon: Layers },
              { label: "Tertinggi", value: fmt(top?.visitors || 0), sub: `${pct(top?.visitors || 0, total)}% dari total`, accent: "#F59E0B", icon: Trophy },
            ]}
          />

          {top && (
            <div className="mx-5 mt-3 flex items-center gap-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 ring-1 ring-amber-100 dark:ring-amber-900/40 px-3 py-2">
              <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="min-w-0 text-xs text-slate-600 dark:text-slate-300 truncate">
                Terbanyak: <b className="text-slate-900 dark:text-white">{top.name}</b> · <b className="text-amber-600 tabular-nums">{fmt(top.visitors)}</b> peserta
              </p>
            </div>
          )}

          <div className="relative px-3 pt-3 min-w-0">
            {chartType === "pie" && (
              <div className="pointer-events-none absolute inset-0 pt-3 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{hover ? truncate(hover, 18) : "Total"}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{fmt(hover ? allRows.find((r) => r.name === hover)?.visitors || 0 : total)}</span>
                {hover && <span className="text-[11px] font-bold text-slate-500">{pct(allRows.find((r) => r.name === hover)?.visitors || 0, total)}%</span>}
              </div>
            )}
            <ResponsiveContainer key={chartType} width="100%" height={height}>
              {chartType === "treemap" ? (
                <Treemap
                  data={allRows}
                  dataKey="visitors"
                  nameKey="name"
                  aspectRatio={4 / 3}
                  isAnimationActive={false}
                  content={<TreeCell hover={hover} onHover={setHover} total={total} />}
                >
                  <Tooltip content={<ChartTooltip />} />
                </Treemap>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Pie
                    data={allRows}
                    dataKey="visitors"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="88%"
                    paddingAngle={3}
                    cornerRadius={8}
                    stroke="none"
                    onMouseEnter={(d: any) => setHover(d?.name)}
                    onMouseLeave={() => setHover(null)}
                    animationDuration={900}
                  >
                    {allRows.map((r) => (
                      <Cell key={r.name} fill={r.colorHex} opacity={hover && hover !== r.name ? 0.35 : 1} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart
                  data={rows}
                  layout={chartType === "horizontal" ? "vertical" : "horizontal"}
                  margin={{ top: 8, right: chartType === "horizontal" ? 44 : 12, left: chartType === "horizontal" ? 8 : -10, bottom: chartType === "vertical" ? 60 : 0 }}
                  barCategoryGap={chartType === "horizontal" ? "22%" : "28%"}
                  onMouseLeave={() => setHover(null)}
                >
                  <defs>
                    {rows.map((r) => (
                      <linearGradient key={r.name} id={`${gid}-${r.rank}`} x1="0" y1={chartType === "horizontal" ? "0" : "1"} x2={chartType === "horizontal" ? "1" : "0"} y2="0">
                        <stop offset="0%" stopColor={r.colorHex} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={r.colorHex} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={chartType === "vertical" ? false : true} horizontal={chartType === "vertical"} />
                  {chartType === "horizontal" ? (
                    <>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
                      <YAxis type="category" dataKey="name" width={170} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} tickFormatter={(v) => truncate(v, 24)} />
                    </>
                  ) : (
                    <>
                      <XAxis type="category" dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={70} tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} tickFormatter={(v) => truncate(v, 14)} />
                      <YAxis type="number" axisLine={false} tickLine={false} width={44} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
                    </>
                  )}
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)", radius: 10 }} />
                  <Bar
                    dataKey="visitors"
                    radius={chartType === "horizontal" ? [0, 10, 10, 0] : [10, 10, 0, 0]}
                    barSize={chartType === "horizontal" ? 20 : 36}
                    onMouseEnter={(d: any) => setHover(d?.name)}
                    label={{ position: chartType === "horizontal" ? "right" : "top", fill: "#0B1B3F", fontSize: 11, fontWeight: 800, formatter: (v: number) => (v > 0 ? fmt(v) : "") }}
                    animationDuration={900}
                  >
                    {rows.map((r) => (
                      <Cell key={r.name} fill={`url(#${gid}-${r.rank})`} opacity={hover && hover !== r.name ? 0.35 : 1} className="transition-opacity duration-200" />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legenda interaktif (hover menyorot chart) */}
          <div className="px-5 pt-2 pb-4">
            <div className="flex flex-wrap gap-1.5">
              {(paged ? rows : allRows).map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onMouseEnter={() => setHover(r.name)}
                  onMouseLeave={() => setHover(null)}
                  className={`inline-flex items-center gap-1.5 max-w-full h-7 px-2.5 rounded-full ring-1 text-[11px] transition-all ${hover === r.name ? "bg-[#0B1B3F] text-white ring-[#0B1B3F]" : "bg-slate-50 dark:bg-slate-800 ring-slate-200/80 dark:ring-slate-700 text-slate-600 dark:text-slate-300"} ${hover && hover !== r.name ? "opacity-50" : ""}`}
                  title={r.name}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: r.colorHex }} />
                  <span className="truncate max-w-[160px]">{r.name}</span>
                  <b className="tabular-nums">{fmt(r.visitors)}</b>
                  <span className="opacity-60">{pct(r.visitors, total)}%</span>
                </button>
              ))}
            </div>
          </div>

          {paged && totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>
                <b className="text-slate-800 dark:text-white tabular-nums">{start + 1}–{Math.min(start + itemsPerPage, chartData.length)}</b> dari {chartData.length}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && p - arr[i - 1] > 1 && <span className="px-0.5 text-slate-300">…</span>}
                      <button type="button" onClick={() => setPage(p)} className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold tabular-nums ${p === page ? "bg-[#0B1B3F] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </CardShell>
  );
};

/* ============================ KOMPONEN UTAMA ============================ */

interface ChartDetailMasyarakatDilatihProps {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
  tahun: string;
  triwulan: string;
}

const ChartDetailMasyarakatDilatih: React.FC<ChartDetailMasyarakatDilatihProps> = ({ data, dataUser }) => {
  const [session] = useState(() => ({ isUPT: Cookies.get("Role") === "Pengelola UPT", satker: Cookies.get("Satker") || "", rawSatker: Cookies.get("Satker") }));

  // sama seperti sebelumnya: nilai cookie apa adanya
  const usersByBalai = useMemo(() => getFilteredDataByBalai(dataUser, session.rawSatker!), [dataUser, session.rawSatker]);

  const pelatihanSigned = useMemo(
    () =>
      data.filter(
        (p) => (!session.isUPT || p.PenyelenggaraPelatihan === session.satker) && SIGNED_STAGES.has(String(p?.StatusPenerbitan ?? "").trim().toUpperCase())
      ),
    [data, session]
  );

  const charts = useMemo(() => {
    const signedUser = (u: any) => (isSignedFile(u.FileSertifikat) ? 1 : 0);
    return {
      prioritas: tally(pelatihanSigned, (p) => p.DukunganProgramTerobosan, signedCount),
      program: tally(usersByBalai, (u: any) => u.Program, signedUser),
      penyelenggara: tally(usersByBalai, (u: any) => u.PenyelenggaraPelatihan, signedUser),
      klaster: tally(usersByBalai, (u: any) => u.BidangPelatihan, signedUser),
    };
  }, [pelatihanSigned, usersByBalai]);

  // Kartu dengan data paling banyak diberi kolom lebih lebar
  const wide = (d: Datum[]) => autoType(d) === "horizontal" || autoType(d) === "treemap";
  const rowSpan = (a: Datum[], b: Datum[]) => {
    const wa = wide(a), wb = wide(b);
    if (wa === wb) return ["xl:col-span-6", "xl:col-span-6"];
    return wa ? ["xl:col-span-7", "xl:col-span-5"] : ["xl:col-span-5", "xl:col-span-7"];
  };
  const [r1a, r1b] = rowSpan(charts.prioritas, charts.klaster);
  const [r2a, r2b] = rowSpan(charts.program, charts.penyelenggara);

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div className={`min-w-0 ${r1a}`}>
          <TrainingChartCard title="Dukungan Program Prioritas" icon={Megaphone} accent="#F59E0B" chartData={charts.prioritas} chartType={autoType(charts.prioritas)} itemsPerPage={6} />
        </div>
        <div className={`min-w-0 ${r1b}`}>
          <TrainingChartCard title="Klaster / Bidang Pelatihan" icon={LayoutGrid} accent="#8B5CF6" chartData={charts.klaster} chartType={autoType(charts.klaster)} itemsPerPage={7} />
        </div>
        <div className={`min-w-0 ${r2a}`}>
          <TrainingChartCard title="Program Pelatihan" icon={BookOpen} accent="#3B82F6" chartData={charts.program} chartType={autoType(charts.program)} itemsPerPage={8} barHeight={42} />
        </div>
        <div className={`min-w-0 ${r2b}`}>
          <TrainingChartCard title="Penyelenggara Pelatihan" icon={Building2} accent="#06B6D4" chartData={charts.penyelenggara} chartType={autoType(charts.penyelenggara)} itemsPerPage={7} />
        </div>
      </div>
    </div>
  );
};

export default ChartDetailMasyarakatDilatih;

/* ============================ SEKTOR × SUMBER PEMBIAYAAN ============================ */

interface CrossTabRow {
  sektor: string;
  [jenis: string]: string | number;
}

interface ChartSektorPembiayaanCardProps {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[]; // dipertahankan untuk kompatibilitas API
}

export const ChartSektorPembiayaanCard: React.FC<ChartSektorPembiayaanCardProps> = ({ data }) => {
  const [session] = useState(() => ({ isUPT: Cookies.get("Role") === "Pengelola UPT", satker: Cookies.get("Satker") || "" }));
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const { crossTab, jenisKeys, totals, grandTotal } = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    const jenisSet = new Set<string>();
    for (const p of data) {
      if (session.isUPT && p.PenyelenggaraPelatihan !== session.satker) continue;
      if (!SIGNED_STAGES.has(String(p?.StatusPenerbitan ?? "").trim().toUpperCase())) continue;
      const sektor = p.JenisProgram?.trim();
      const jenis = p.JenisPelatihan?.trim();
      if (!sektor || !jenis) continue;
      const n = signedCount(p);
      if (!n) continue;
      jenisSet.add(jenis);
      const row = m.get(sektor) || new Map<string, number>();
      row.set(jenis, (row.get(jenis) || 0) + n);
      m.set(sektor, row);
    }
    const keys = Array.from(jenisSet);
    const rows: (CrossTabRow & { _t: number })[] = Array.from(m, ([sektor, row]) => {
      const r: CrossTabRow & { _t: number } = { sektor, _t: 0 };
      keys.forEach((k) => {
        r[k] = row.get(k) || 0;
        r._t += row.get(k) || 0;
      });
      return r;
    }).sort((a, b) => b._t - a._t);
    const t: Record<string, number> = {};
    keys.forEach((k) => (t[k] = rows.reduce((s, r) => s + ((r[k] as number) || 0), 0)));
    return { crossTab: rows, jenisKeys: keys, totals: t, grandTotal: rows.reduce((s, r) => s + r._t, 0) };
  }, [data, session]);

  const toggle = (k: string) =>
    setHidden((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  const visibleKeys = jenisKeys.filter((k) => !hidden.has(k));
  const chartHeight = Math.max(280, crossTab.length * 40 + 80);

  if (crossTab.length === 0) {
    return (
      <div className="py-14 flex flex-col items-center gap-2 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <BarChart3 className="h-6 w-6 text-slate-300" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada data sektor</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 px-1">
        {[
          { label: "Peserta", value: fmt(grandTotal), dot: "#3B82F6" },
          { label: "Sektor", value: `${crossTab.length}`, dot: "#10B981" },
          { label: "Sumber dana", value: `${jenisKeys.length}`, dot: "#8B5CF6" },
        ].map((s) => (
          <div key={s.label} className="inline-flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700">
            <span className="h-2 w-2 rounded-full" style={{ background: s.dot, boxShadow: `0 0 0 3px ${s.dot}33` }} />
            <span className="text-[11px] text-slate-500">{s.label}</span>
            <b className="text-sm text-slate-900 dark:text-white tabular-nums">{s.value}</b>
          </div>
        ))}
      </div>

      <div className="-ml-3 min-w-0">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={crossTab} margin={{ top: 16, right: 16, left: 0, bottom: crossTab.length > 3 ? 70 : 40 }} barCategoryGap="22%" barGap={2}>
            <defs>
              {jenisKeys.map((k, i) => (
                <linearGradient key={k} id={`spg-${i}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={colorAt(i)} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={colorAt(i)} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="sektor"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
              tickFormatter={(v) => truncate(v, 14)}
              angle={crossTab.length > 3 ? -35 : 0}
              textAnchor={crossTab.length > 3 ? "end" : "middle"}
              height={crossTab.length > 3 ? 70 : 40}
              interval={0}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)", radius: 8 }} />
            {jenisKeys.map((k, i) =>
              hidden.has(k) ? null : (
                <Bar
                  key={k}
                  dataKey={k}
                  name={k}
                  fill={`url(#spg-${i})`}
                  radius={[6, 6, 0, 0]}
                  barSize={Math.max(10, Math.min(28, Math.floor(160 / (crossTab.length * Math.max(1, visibleKeys.length) + 1))))}
                  animationDuration={800 + i * 100}
                />
              )
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda: klik untuk sembunyikan/tampilkan seri */}
      <div className="flex flex-wrap gap-1.5 px-1 pb-1">
        {jenisKeys.map((k, i) => {
          const off = hidden.has(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              aria-pressed={!off}
              title={off ? "Tampilkan" : "Sembunyikan"}
              className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full ring-1 text-[11px] transition-all ${off ? "bg-white dark:bg-slate-900 ring-slate-200 dark:ring-slate-700 text-slate-400 line-through" : "bg-slate-50 dark:bg-slate-800 ring-slate-200/80 dark:ring-slate-700 text-slate-600 dark:text-slate-300"}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: off ? "#cbd5e1" : colorAt(i) }} />
              {k} <b className="tabular-nums">{fmt(totals[k] || 0)}</b>
              <span className="opacity-60">{pct(totals[k] || 0, grandTotal)}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

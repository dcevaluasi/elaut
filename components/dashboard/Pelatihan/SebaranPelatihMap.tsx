"use client";

import React, { useMemo, useState } from "react";
import {
  MapPin, Users, Search, X, Globe2, GraduationCap, BadgeCheck, UserCheck, Presentation, Layers, Briefcase, LucideIcon,
} from "lucide-react";
import { Instruktur } from "@/types/instruktur";
import { UnitKerja } from "@/types/master";
import { kategoriPelatih } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { W, H, DOTS, locate } from "../PenyelenggaraMap";

/* ============================ KONSTANTA ============================ */

const JENJANG_WI = [
  { kunci: ["pertama"], label: "Pertama" },
  { kunci: ["muda"], label: "Muda" },
  { kunci: ["madya"], label: "Madya" },
  { kunci: ["utama"], label: "Utama" },
];
const JENJANG_INS = [
  { kunci: ["pelaksana", "terampil"], label: "Terampil" },
  { kunci: ["mahir"], label: "Mahir" },
  { kunci: ["penyelia"], label: "Penyelia" },
  { kunci: ["pertama"], label: "Pertama" },
  { kunci: ["muda"], label: "Muda" },
  { kunci: ["madya"], label: "Madya" },
];

const KATEGORI = [
  { key: "widyaiswara", label: "Widyaiswara", color: "#8B5CF6" },
  { key: "instruktur", label: "Instruktur", color: "#3B82F6" },
  { key: "nonInstruktur", label: "Non Instruktur", color: "#06B6D4" },
  { key: "belumDiisi", label: "Belum dikategorikan", color: "#CBD5E1" },
] as const;
type KatKey = (typeof KATEGORI)[number]["key"];

type Metric = "total" | "widyaiswara" | "instruktur" | "tot";
const METRICS: { key: Metric; label: string; icon: LucideIcon; color: string }[] = [
  { key: "total", label: "Total", icon: Users, color: "#38BDF8" },
  { key: "widyaiswara", label: "Widyaiswara", icon: Presentation, color: "#A78BFA" },
  { key: "instruktur", label: "Instruktur", icon: GraduationCap, color: "#60A5FA" },
  { key: "tot", label: "ToT", icon: BadgeCheck, color: "#34D399" },
];

type TopTab = "keahlian" | "pendidikan" | "jenjang";
const BAR_COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#6366F1", "#14B8A6"];

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const clean = (s?: string | null) => (s || "").trim().replace(/\s+/g, " ");
const jenjangIdx = (j: string, list: typeof JENJANG_WI) => list.findIndex((k) => k.kunci.some((x) => j.includes(x)));

/** "Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon" → "BPPP Ambon" */
const singkat = (nama: string) => (/^pusat pelatihan kelautan dan perikanan$/i.test(nama.trim()) ? "Puslat KP" : nama.replace(/^.*\((\w+)\)\s*/, "$1 ").trim());

/* ============================ TURUNAN ============================ */

interface Rec {
  unit: string;
  kat: KatKey;
  jk: "L" | "P" | "-";
  tot: boolean;
  aktif: boolean;
  status: string;
  keahlian: string;
  pendidikan: string;
  jenjang: string;
}

const derive = (d: Instruktur, namaUnit: Map<string, string>): Rec => {
  const id = String(d.id_lemdik ?? "");
  const jk = clean(d.jenis_kelamin).toLowerCase();
  const status = clean((d as any).status);
  return {
    unit: namaUnit.get(id) || `Unit ${id || "-"}`,
    kat: kategoriPelatih(d) as KatKey,
    jk: jk === "laki-laki" || jk === "l" ? "L" : jk === "perempuan" || jk === "p" ? "P" : "-",
    tot: !!clean((d as any).training_officer_course),
    aktif: status.toLowerCase() === "active" || status.toLowerCase() === "aktif",
    status: status || "Belum diisi",
    keahlian: clean(d.bidang_keahlian) || "Belum diisi",
    pendidikan: clean(d.pendidikkan_terakhir) || "Belum diisi",
    jenjang: clean(d.jenjang_jabatan).toLowerCase(),
  };
};

const tallyBy = (rs: Rec[], key: (r: Rec) => string) => {
  const m = new Map<string, { name: string; value: number }>();
  for (const r of rs) {
    const name = key(r);
    const k = name.toLowerCase();
    const e = m.get(k) || { name, value: 0 };
    e.value++;
    m.set(k, e);
  }
  return Array.from(m.values()).sort((a, b) => Number(a.name === "Belum diisi") - Number(b.name === "Belum diisi") || b.value - a.value);
};

/* ============================ KOMPONEN ============================ */

export default function SebaranPelatihMap({ data, unitKerjas }: { data: Instruktur[]; unitKerjas: UnitKerja[] }) {
  const [metric, setMetric] = useState<Metric>("total");
  const [hover, setHover] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [topTab, setTopTab] = useState<TopTab>("keahlian");
  const [katFilter, setKatFilter] = useState<"semua" | "widyaiswara" | "instruktur">("semua");

  const recs = useMemo(() => {
    const namaUnit = new Map(unitKerjas.map((u) => [String(u.id_unit_kerja), u.nama]));
    return data.map((d) => derive(d, namaUnit));
  }, [data, unitKerjas]);

  /* ---------- Agregat per satker ---------- */
  const units = useMemo(() => {
    const m = new Map<string, { name: string; short: string; total: number; widyaiswara: number; instruktur: number; tot: number; aktif: number; pos: { x: number; y: number } | null }>();
    for (const r of recs) {
      const u = m.get(r.unit) || { name: r.unit, short: singkat(r.unit), total: 0, widyaiswara: 0, instruktur: 0, tot: 0, aktif: 0, pos: locate(r.unit) };
      u.total++;
      if (r.kat === "widyaiswara") u.widyaiswara++;
      if (r.kat === "instruktur") u.instruktur++;
      if (r.tot) u.tot++;
      if (r.aktif) u.aktif++;
      m.set(r.unit, u);
    }
    return Array.from(m.values());
  }, [recs]);

  const sorted = useMemo(() => [...units].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name)), [units, metric]);
  const rankOf = useMemo(() => new Map(sorted.map((u, i) => [u.name, i + 1])), [sorted]);
  const max = sorted[0]?.[metric] || 1;
  const mapped = sorted.filter((u) => u.pos);
  const unmapped = sorted.filter((u) => !u.pos);
  const list = sorted.filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()));
  const color = METRICS.find((m) => m.key === metric)!.color;
  const focus = hover || scope;
  const radius = (v: number) => (v > 0 ? 6 + Math.sqrt(v / max) * 18 : 4);
  const pick = (n: string) => setScope((s) => (s === n ? null : n));

  /* ---------- Insight lingkup ---------- */
  const insight = useMemo(() => {
    const rs = scope ? recs.filter((r) => r.unit === scope) : recs;
    const kat: Record<KatKey, number> = { widyaiswara: 0, instruktur: 0, nonInstruktur: 0, belumDiisi: 0 };
    let L = 0, P = 0, tot = 0, aktif = 0;
    const jWI = new Array(JENJANG_WI.length + 1).fill(0);
    const jIN = new Array(JENJANG_INS.length + 1).fill(0);
    for (const r of rs) {
      kat[r.kat]++;
      if (r.jk === "L") L++;
      else if (r.jk === "P") P++;
      if (r.tot) tot++;
      if (r.aktif) aktif++;
      if (r.kat === "widyaiswara") {
        const i = jenjangIdx(r.jenjang, JENJANG_WI);
        jWI[i === -1 ? JENJANG_WI.length : i]++;
      } else if (r.kat === "instruktur") {
        const i = jenjangIdx(r.jenjang, JENJANG_INS);
        jIN[i === -1 ? JENJANG_INS.length : i]++;
      }
    }
    return { rs, total: rs.length, kat, L, P, tot, aktif, jWI, jIN, status: tallyBy(rs, (r) => r.status) };
  }, [recs, scope]);

  const filteredRs = useMemo(() => (katFilter === "semua" ? insight.rs : insight.rs.filter((r) => r.kat === katFilter)), [insight.rs, katFilter]);
  const topList = useMemo(() => {
    if (topTab === "keahlian") return tallyBy(filteredRs, (r) => r.keahlian);
    if (topTab === "pendidikan") return tallyBy(filteredRs, (r) => r.pendidikan);
    return [];
  }, [filteredRs, topTab]);
  const topMax = topList[0]?.value || 1;

  const hoverRow = hover ? units.find((u) => u.name === hover) : null;
  const genderTotal = insight.L + insight.P;

  return (
    <div className="flex flex-col gap-5">
      {/* ================= PETA + PERINGKAT ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] rounded-3xl overflow-hidden ring-1 ring-slate-200/80 dark:ring-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white min-w-0">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_10%_0%,#7C3AED_0%,transparent_60%),radial-gradient(50%_80%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-55" />

          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Sebaran Tenaga Pelatih</p>
              <h3 className="text-lg font-black tracking-tight">
                {fmt(recs.length)} pelatih · {fmt(units.length)} satuan kerja
              </h3>
            </div>
            <div className="flex items-center p-1 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md overflow-x-auto scrollbar-hide">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all ${metric === m.key ? "bg-white text-[#0B1B3F] shadow" : "text-blue-100/70 hover:text-white"}`}
                >
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative px-2 pb-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Peta sebaran pelatih per satuan kerja" onClick={() => setScope(null)}>
              <defs>
                <radialGradient id="sp-glow">
                  <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </radialGradient>
              </defs>
              <g fill="#fff" opacity={0.16}>
                {DOTS.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={2.1} />
                ))}
              </g>
              {[...mapped].reverse().map((u) => {
                const v = u[metric];
                const rad = radius(v);
                const on = focus === u.name;
                return (
                  <g
                    key={u.name}
                    transform={`translate(${u.pos!.x},${u.pos!.y})`}
                    onMouseEnter={() => setHover(u.name)}
                    onMouseLeave={() => setHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      pick(u.name);
                    }}
                    style={{ cursor: "pointer", transition: "opacity .2s" }}
                    opacity={focus && !on ? 0.35 : 1}
                  >
                    <circle r={rad * 2.2} fill="url(#sp-glow)" />
                    {on && <circle r={rad + 6} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} className="animate-ping" style={{ transformOrigin: "center", animationDuration: "1.6s" }} />}
                    <circle r={rad} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.6} />
                    {rad > 11 && (
                      <text textAnchor="middle" dy="0.35em" fontSize={10} fontWeight={800} fill="#0B1B3F">
                        {v}
                      </text>
                    )}
                    <text y={-rad - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff" opacity={on ? 1 : 0.75}>
                      {u.short}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoverRow && (
              <div className="pointer-events-none absolute left-4 bottom-4 max-w-[320px] rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] animate-in fade-in slide-in-from-bottom-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">Peringkat #{rankOf.get(hoverRow.name)}</p>
                <p className="text-[13px] font-black leading-snug">{hoverRow.name}</p>
                <div className="mt-2 grid grid-cols-5 gap-2.5">
                  {METRICS.map((m) => (
                    <div key={m.key}>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-sky-100/60">{m.label}</p>
                      <p className="text-sm font-black tabular-nums" style={{ color: m.color }}>{fmt(hoverRow[m.key])}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-sky-100/60">Aktif</p>
                    <p className="text-sm font-black tabular-nums text-emerald-300">{pct(hoverRow.aktif, hoverRow.total)}%</p>
                  </div>
                </div>
              </div>
            )}

            {unmapped.length > 0 && (
              <p className="absolute right-4 bottom-3 text-[10px] text-blue-100/50" title={unmapped.map((u) => u.name).join(", ")}>
                {unmapped.length} satker belum punya koordinat
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
              <Globe2 className="h-4 w-4" /> Semua satuan kerja
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari satuan kerja…"
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
            {list.map((u) => {
              const rank = rankOf.get(u.name)!;
              const on = scope === u.name;
              return (
                <li key={u.name}>
                  <button
                    type="button"
                    onMouseEnter={() => setHover(u.name)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => pick(u.name)}
                    className={`w-full rounded-xl px-2.5 py-2 text-left transition-colors ${on ? "bg-[#0B1B3F] text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 shrink-0 text-[10px] font-black tabular-nums ${on ? "text-sky-300" : rank <= 3 ? "text-amber-500" : "text-slate-400"}`}>{rank}</span>
                      <span className={`flex-1 min-w-0 truncate text-xs font-semibold ${on ? "text-white" : "text-slate-700 dark:text-slate-200"}`} title={u.name}>{u.short}</span>
                      {!u.pos && <MapPin className="h-3 w-3 shrink-0 text-slate-300" aria-label="Belum terpetakan" />}
                      <span className={`shrink-0 text-xs font-black tabular-nums ${on ? "text-white" : "text-slate-900 dark:text-white"}`}>{fmt(u[metric])}</span>
                    </div>
                    {/* komposisi WI / Instruktur */}
                    <div className={`ml-7 mt-1 flex h-1 rounded-full overflow-hidden ${on ? "bg-white/15" : "bg-slate-100 dark:bg-slate-800"}`} style={{ width: `${Math.max(8, (u[metric] / max) * 100)}%` }}>
                      <div style={{ width: `${pct(u.widyaiswara, u.total)}%`, background: "#8B5CF6" }} />
                      <div style={{ width: `${pct(u.instruktur, u.total)}%`, background: "#3B82F6" }} />
                      <div className="flex-1" style={{ background: on ? "#ffffff55" : "#CBD5E1" }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ================= INSIGHT ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1B3F] text-sky-200">{scope ? <MapPin className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Insight {scope ? `· peringkat #${rankOf.get(scope)}` : "seluruh satker"}</p>
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{scope || "Semua satuan kerja"}</h3>
          </div>
        </div>
        {scope && (
          <button type="button" onClick={() => setScope(null)} className="h-9 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5">
            <X className="h-3.5 w-3.5" /> Semua satker
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={Users} accent="#3B82F6" label="Tenaga pelatih" value={fmt(insight.total)} sub={`${fmt(insight.kat.belumDiisi)} belum dikategorikan`} />
        <Kpi icon={Presentation} accent="#8B5CF6" label="Widyaiswara" value={fmt(insight.kat.widyaiswara)} sub={`${pct(insight.kat.widyaiswara, insight.total)}% dari total`} />
        <Kpi icon={GraduationCap} accent="#06B6D4" label="Instruktur" value={fmt(insight.kat.instruktur)} sub={`${pct(insight.kat.instruktur, insight.total)}% dari total`} />
        <Kpi icon={BadgeCheck} accent="#10B981" label="Sertifikasi ToT" value={`${pct(insight.tot, insight.total)}%`} sub={`${fmt(insight.tot)} pelatih`} progress={pct(insight.tot, insight.total)} />
        <Kpi icon={UserCheck} accent="#F59E0B" label="SDM aktif" value={`${pct(insight.aktif, insight.total)}%`} sub={`${fmt(insight.aktif)} siap penugasan`} progress={pct(insight.aktif, insight.total)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Komposisi */}
        <Card icon={Layers} accent="#8B5CF6" title="Komposisi pelatih" subtitle="Kategori, jenis kelamin & status">
          <div className="px-5 pb-5 space-y-4">
            <Stack
              items={KATEGORI.map((k) => ({ label: k.label, value: insight.kat[k.key], color: k.color }))}
              total={insight.total}
            />
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Jenis kelamin</p>
              <Stack
                items={[
                  { label: "Laki-laki", value: insight.L, color: "#3B82F6" },
                  { label: "Perempuan", value: insight.P, color: "#F472B6" },
                  { label: "Belum diisi", value: insight.total - genderTotal, color: "#CBD5E1" },
                ]}
                total={insight.total}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status kepegawaian</p>
              <div className="flex flex-wrap gap-1.5">
                {insight.status.map((s) => (
                  <span key={s.name} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className={`h-1.5 w-1.5 rounded-full ${/^(active|aktif)$/i.test(s.name) ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {s.name} <b className="tabular-nums text-slate-900 dark:text-white">{fmt(s.value)}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Jenjang */}
        <Card icon={Briefcase} accent="#3B82F6" title="Jenjang jabatan fungsional" subtitle="Widyaiswara & instruktur">
          <div className="px-5 pb-5 space-y-4">
            <JenjangBars title="Widyaiswara" color="#8B5CF6" labels={[...JENJANG_WI.map((j) => j.label), "Lainnya"]} values={insight.jWI} />
            <JenjangBars title="Instruktur" color="#3B82F6" labels={[...JENJANG_INS.map((j) => j.label), "Lainnya"]} values={insight.jIN} />
          </div>
        </Card>

        {/* Keahlian / pendidikan */}
        <Card
          icon={GraduationCap}
          accent="#10B981"
          title={topTab === "keahlian" ? "Bidang keahlian" : "Pendidikan terakhir"}
          subtitle="Klik tab untuk berganti"
          right={
            <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700">
              {(["keahlian", "pendidikan"] as TopTab[]).map((t) => (
                <button key={t} type="button" onClick={() => setTopTab(t)} className={`h-7 px-2.5 rounded-lg text-[11px] font-bold capitalize ${topTab === t ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500"}`}>
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <div className="px-5 pb-5">
            <div className="mb-3 flex gap-1">
              {(["semua", "widyaiswara", "instruktur"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKatFilter(k)}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-semibold capitalize ring-1 transition-colors ${katFilter === k ? "bg-[#0B1B3F] text-white ring-[#0B1B3F]" : "ring-slate-200 dark:ring-slate-700 text-slate-500 hover:bg-slate-50"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            {topList.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Belum ada data</p>
            ) : (
              <ul className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {topList.slice(0, 12).map((t, i) => {
                  const c = t.name === "Belum diisi" ? "#CBD5E1" : BAR_COLORS[i % BAR_COLORS.length];
                  return (
                    <li key={t.name}>
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className={`min-w-0 truncate font-semibold ${t.name === "Belum diisi" ? "text-slate-400 italic" : "text-slate-700 dark:text-slate-200"}`} title={t.name}>{t.name}</span>
                        <span className="shrink-0 tabular-nums"><b className="text-slate-900 dark:text-white">{fmt(t.value)}</b> <span className="text-slate-400">{pct(t.value, filteredRs.length)}%</span></span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(t.value / topMax) * 100}%`, background: `linear-gradient(90deg, ${c}99, ${c})` }} />
                      </div>
                    </li>
                  );
                })}
                {topList.length > 12 && <li className="text-[11px] text-slate-400">+{topList.length - 12} lainnya</li>}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ UI ============================ */

function Stack({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800">
        {items.filter((i) => i.value > 0).map((i) => (
          <div key={i.label} title={`${i.label}: ${i.value}`} style={{ width: `${pct(i.value, total)}%`, background: i.color }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {items.map((i) => (
          <p key={i.label} className={`flex items-center gap-1.5 text-[11px] ${i.value ? "" : "opacity-40"}`}>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: i.color }} />
            <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{i.label}</span>
            <b className="tabular-nums text-slate-900 dark:text-white">{fmt(i.value)}</b>
          </p>
        ))}
      </div>
    </div>
  );
}

function JenjangBars({ title, color, labels, values }: { title: string; color: string; labels: string[]; values: number[] }) {
  const total = values.reduce((s, v) => s + v, 0);
  const max = Math.max(1, ...values);
  const shown = labels.map((l, i) => ({ l, v: values[i] })).filter((x, i) => i < labels.length - 1 || x.v > 0); // "Lainnya" hanya bila ada
  return (
    <div>
      <p className="mb-2 flex items-baseline justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {title} <span className="normal-case tracking-normal text-slate-500">{fmt(total)} orang</span>
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {shown.map((x) => (
          <div key={x.l} className="group flex-1 min-w-0 flex flex-col items-center gap-1" title={`${x.l}: ${x.v}`}>
            <span className="text-[10px] font-black tabular-nums text-slate-700 dark:text-slate-200">{x.v || ""}</span>
            <div className="w-full rounded-t-lg transition-all duration-700 group-hover:brightness-110" style={{ height: `${Math.max(3, (x.v / max) * 64)}px`, background: x.v ? `linear-gradient(180deg, ${color}, ${color}88)` : "#E2E8F0" }} />
            <span className="w-full truncate text-center text-[9px] font-semibold text-slate-500">{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function Card({ icon: Icon, accent, title, subtitle, right, children }: { icon: LucideIcon; accent: string; title: string; subtitle: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0 flex flex-col rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
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

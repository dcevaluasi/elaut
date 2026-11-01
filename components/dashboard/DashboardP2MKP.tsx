"use client";

import React, { useMemo, useState } from "react";
import {
    Building2, MapPin, CheckCircle2, Clock, AlertCircle, Layers, Briefcase, ShieldCheck, Globe2, FileText, Search, X,
    Map as MapIcon, BadgeCheck, LucideIcon,
} from "lucide-react";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { P2MKP } from "@/types/p2mkp";
import { W, H, DOTS, px, py } from "./PenyelenggaraMap";

/* ============================ PROVINSI → KOORDINAT ============================ */

// Urut dari nama terpanjang agar "Papua Barat Daya" tidak tertangkap "Papua", dst.
const PROVINSI: [string, number, number][] = (
    [
        ["papua barat daya", 131.9, -1.2], ["papua pegunungan", 139.0, -4.1], ["papua tengah", 136.5, -3.6], ["papua selatan", 139.6, -7.4],
        ["papua barat", 133.0, -1.3], ["papua", 139.5, -2.9],
        ["kepulauan bangka belitung", 106.4, -2.7], ["bangka belitung", 106.4, -2.7], ["babel", 106.4, -2.7],
        ["kepulauan riau", 104.5, 0.9], ["kepri", 104.5, 0.9],
        ["nusa tenggara barat", 117.4, -8.65], ["ntb", 117.4, -8.65], ["nusa tenggara timur", 121.1, -8.9], ["ntt", 121.1, -8.9],
        ["kalimantan barat", 111.5, -0.1], ["kalimantan tengah", 113.4, -1.6], ["kalimantan selatan", 115.3, -3.1], ["kalimantan timur", 116.4, 0.5], ["kalimantan utara", 116.1, 3.0],
        ["sulawesi utara", 124.6, 1.0], ["sulawesi tengah", 121.4, -1.4], ["sulawesi barat", 119.3, -2.5], ["sulawesi selatan", 120.0, -4.0], ["sulawesi tenggara", 122.3, -4.1],
        ["sumatera utara", 99.05, 2.19], ["sumatera barat", 100.47, -0.74], ["sumatera selatan", 104.2, -3.3],
        ["maluku utara", 127.8, 1.0], ["maluku", 129.5, -3.2],
        ["jawa barat", 107.6, -6.9], ["jawa tengah", 110.1, -7.15], ["jawa timur", 112.5, -7.5],
        ["yogyakarta", 110.4, -7.9], ["jakarta", 106.84, -6.21], ["banten", 106.1, -6.4],
        ["gorontalo", 122.4, 0.7], ["lampung", 105.0, -4.9], ["bengkulu", 102.3, -3.6], ["jambi", 103.2, -1.6], ["riau", 101.8, 0.29],
        ["aceh", 96.75, 4.37], ["bali", 115.1, -8.4],
    ] as [string, number, number][]
).sort((a, b) => b[0].length - a[0].length);

const normProv = (s?: string) =>
    (s || "").toLowerCase().replace(/provinsi|prov\.?/g, "").replace(/d\.?\s?i\.?\s/g, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

const provPos = (name: string) => {
    const n = normProv(name);
    const hit = PROVINSI.find(([k]) => n.includes(k));
    return hit ? { x: px(hit[1]), y: py(hit[2]) } : null;
};

/* ============================ HELPERS ============================ */

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const klasOf = (d: P2MKP) => (((d as any).klasifikasi || d.klasiikasi || "") as string).trim() || "Belum ditetapkan";

const KLAS_COLOR = (k: string) => {
    const v = k.toLowerCase();
    if (v.includes("utama")) return "#8B5CF6";
    if (v.includes("madya")) return "#10B981";
    if (v.includes("mula")) return "#3B82F6";
    return "#CBD5E1";
};
const BAR_COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E"];

type PStatus = "approved" | "pending" | "revisi";
const normStatus = (s?: string): PStatus => {
    const v = (s || "").trim().toLowerCase();
    return v === "approved" ? "approved" : v === "perbaikan" ? "revisi" : "pending";
};

type Metric = "lembaga" | "pengajuan" | "pending";
const METRICS: { key: Metric; label: string; icon: LucideIcon; color: string }[] = [
    { key: "lembaga", label: "Ditetapkan", icon: BadgeCheck, color: "#34D399" },
    { key: "pengajuan", label: "Pengajuan", icon: FileText, color: "#38BDF8" },
    { key: "pending", label: "Menunggu", icon: Clock, color: "#FBBF24" },
];

/* ============================ KOMPONEN ============================ */

const DashboardP2MKP = () => {
    const { data: p2mkpData, loading: loadingP2MKP } = useFetchDataP2MKP();
    const { data: penetapanData, loading: loadingPenetapan } = useFetchDataPengajuanPenetapan();
    const loading = loadingP2MKP || loadingPenetapan;

    const [metric, setMetric] = useState<Metric>("lembaga");
    const [hover, setHover] = useState<string | null>(null);
    const [scope, setScope] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [qLembaga, setQLembaga] = useState("");

    /* ---------- Normalisasi sekali ---------- */
    const base = useMemo(() => {
        const all = p2mkpData || [];
        const byId = new Map(all.map((d) => [String(d.IdPpmkp), d]));
        const lembaga = all
            .filter((d) => (d.status || "").toLowerCase() === "approved")
            .map((d) => ({
                d,
                nama: d.nama_ppmkp || d.nama_Ppmkp || "-",
                prov: title((d.provinsi || "").trim()) || "Tidak diketahui",
                kota: title((d.kota || "").trim()),
                klas: klasOf(d),
                milik: (d.status_kepemilikan || "").trim() || "Tidak diketahui",
                lpk: d.is_lpk === "Ya",
            }));
        const pengajuan = (penetapanData || [])
            .filter((p) => !!(p.id_Ppmkp || p.nama_Ppmkp))
            .map((p) => {
                const m = byId.get(String(p.id_Ppmkp));
                return { status: normStatus(p.status), prov: title(((m?.provinsi || p.provinsi || "") as string).trim()) || "Tidak diketahui" };
            });
        return { totalTerdaftar: all.length, lembaga, pengajuan };
    }, [p2mkpData, penetapanData]);

    /* ---------- Agregat per provinsi ---------- */
    const provs = useMemo(() => {
        const m = new Map<string, { name: string; lembaga: number; pengajuan: number; pending: number; pos: { x: number; y: number } | null }>();
        const get = (name: string) => {
            let e = m.get(name);
            if (!e) {
                e = { name, lembaga: 0, pengajuan: 0, pending: 0, pos: provPos(name) };
                m.set(name, e);
            }
            return e;
        };
        base.lembaga.forEach((l) => get(l.prov).lembaga++);
        base.pengajuan.forEach((p) => {
            const e = get(p.prov);
            e.pengajuan++;
            if (p.status === "pending") e.pending++;
        });
        return Array.from(m.values());
    }, [base]);

    const sorted = useMemo(() => [...provs].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name)), [provs, metric]);
    const rankOf = useMemo(() => new Map(sorted.map((p, i) => [p.name, i + 1])), [sorted]);
    const max = sorted[0]?.[metric] || 1;
    const mapped = sorted.filter((p) => p.pos && p[metric] > 0);
    const list = sorted.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
    const color = METRICS.find((m) => m.key === metric)!.color;
    const focus = hover || scope;
    const radius = (v: number) => (v > 0 ? 5 + Math.sqrt(v / max) * 18 : 3.5);
    const pick = (n: string) => setScope((s) => (s === n ? null : n));

    /* ---------- Insight lingkup ---------- */
    const insight = useMemo(() => {
        const lem = scope ? base.lembaga.filter((l) => l.prov === scope) : base.lembaga;
        const pen = scope ? base.pengajuan.filter((p) => p.prov === scope) : base.pengajuan;
        const tally = (arr: string[]) => {
            const t = new Map<string, number>();
            arr.forEach((k) => t.set(k, (t.get(k) || 0) + 1));
            return Array.from(t, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        };
        const st = { approved: 0, pending: 0, revisi: 0 };
        pen.forEach((p) => st[p.status]++);
        return {
            lem,
            total: lem.length,
            pengajuan: pen.length,
            st,
            lpk: lem.filter((l) => l.lpk).length,
            klas: tally(lem.map((l) => l.klas)),
            milik: tally(lem.map((l) => l.milik)),
            kota: tally(lem.map((l) => l.kota).filter(Boolean)),
        };
    }, [base, scope]);

    const lembagaList = useMemo(
        () => insight.lem.filter((l) => !qLembaga || `${l.nama} ${l.kota}`.toLowerCase().includes(qLembaga.toLowerCase())).sort((a, b) => a.nama.localeCompare(b.nama)),
        [insight.lem, qLembaga]
    );

    const hoverRow = hover ? provs.find((p) => p.name === hover) : null;
    const approvalRate = pct(insight.st.approved, insight.pengajuan);
    const penetapanRate = pct(base.lembaga.length, base.totalTerdaftar);

    if (loading && !p2mkpData?.length) return <Skeleton />;

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* ─── HERO ─── */}
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.45)]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_70%_at_100%_0%,#06B6D4_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-90" />
                <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />
                <div className="p-5 md:p-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                        </span>
                        {loading ? "Memperbarui…" : "Penetapan & Klasifikasi"}
                    </span>
                    <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                        P2MKP <span className="bg-gradient-to-r from-sky-200 via-white to-cyan-200 bg-clip-text text-transparent">Nasional</span>
                    </h2>
                    <p className="mt-1 text-sm text-blue-100/70">Pusat Pelatihan Mandiri Kelautan dan Perikanan di {fmt(new Set(base.lembaga.map((l) => l.prov)).size)} provinsi</p>

                    <div className="mt-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="group col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between gap-5">
                            <Building2 aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-cyan-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Lembaga ditetapkan</p>
                            <div>
                                <p className="text-5xl md:text-6xl font-black tracking-[-0.04em] tabular-nums leading-none">{fmt(base.lembaga.length)}</p>
                                <p className="mt-1 text-xs text-blue-100/60">dari {fmt(base.totalTerdaftar)} lembaga terdaftar · {penetapanRate}%</p>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${penetapanRate}%`, background: "linear-gradient(90deg,#22D3EE,#fff)" }} />
                            </div>
                        </div>
                        <HeroKpi className="lg:col-span-2" icon={FileText} accent="#3B82F6" label="Pengajuan penetapan" value={fmt(base.pengajuan.length)} sub={`${pct(base.pengajuan.filter((p) => p.status === "approved").length, base.pengajuan.length)}% disetujui`} />
                        <HeroKpi className="lg:col-span-2" icon={Clock} accent="#F59E0B" label="Menunggu review" value={fmt(base.pengajuan.filter((p) => p.status === "pending").length)} sub={`${fmt(base.pengajuan.filter((p) => p.status === "revisi").length)} perlu perbaikan`} />
                        <HeroKpi className="lg:col-span-2" icon={ShieldCheck} accent="#10B981" label="Berstatus LPK" value={fmt(base.lembaga.filter((l) => l.lpk).length)} sub={`${pct(base.lembaga.filter((l) => l.lpk).length, base.lembaga.length)}% dari lembaga ditetapkan`} />
                        <HeroKpi className="lg:col-span-2" icon={Globe2} accent="#06B6D4" label="Cakupan wilayah" value={fmt(new Set(base.lembaga.map((l) => l.kota).filter(Boolean)).size)} sub="kota / kabupaten" />
                    </div>
                </div>
            </section>

            <Section icon={MapIcon} title="Sebaran & Insight P2MKP" desc="Klik provinsi di peta atau daftar untuk melihat lembaga dan komposisinya." />

            {/* ─── PETA + PERINGKAT ─── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] rounded-3xl overflow-hidden ring-1 ring-slate-200/80 dark:ring-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white min-w-0">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_10%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_80%_at_100%_100%,#06B6D4_0%,transparent_60%)] opacity-60" />
                    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Sebaran per provinsi</p>
                            <h3 className="text-lg font-black tracking-tight">{fmt(provs.filter((p) => p.lembaga).length)} provinsi memiliki P2MKP</h3>
                        </div>
                        <div className="flex items-center p-1 rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md">
                            {METRICS.map((m) => (
                                <button key={m.key} type="button" onClick={() => setMetric(m.key)} className={`h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${metric === m.key ? "bg-white text-[#0B1B3F] shadow" : "text-blue-100/70 hover:text-white"}`}>
                                    <m.icon className="h-3.5 w-3.5" /> {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative px-2 pb-2">
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Peta sebaran P2MKP per provinsi" onClick={() => setScope(null)}>
                            <defs>
                                <radialGradient id="p2-glow">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.55} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </radialGradient>
                            </defs>
                            <g fill="#fff" opacity={0.16}>
                                {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.1} />)}
                            </g>
                            {[...mapped].reverse().map((p) => {
                                const v = p[metric];
                                const rad = radius(v);
                                const on = focus === p.name;
                                return (
                                    <g
                                        key={p.name}
                                        transform={`translate(${p.pos!.x},${p.pos!.y})`}
                                        onMouseEnter={() => setHover(p.name)}
                                        onMouseLeave={() => setHover(null)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            pick(p.name);
                                        }}
                                        style={{ cursor: "pointer", transition: "opacity .2s" }}
                                        opacity={focus && !on ? 0.35 : 1}
                                    >
                                        <circle r={rad * 2.2} fill="url(#p2-glow)" />
                                        {on && <circle r={rad + 6} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.5} className="animate-ping" style={{ transformOrigin: "center", animationDuration: "1.6s" }} />}
                                        <circle r={rad} fill={color} fillOpacity={0.85} stroke="#fff" strokeWidth={on ? 2 : 1} strokeOpacity={on ? 1 : 0.6} />
                                        {rad > 10 && (
                                            <text textAnchor="middle" dy="0.35em" fontSize={10} fontWeight={800} fill="#0B1B3F">{v}</text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                        {hoverRow && (
                            <div className="pointer-events-none absolute left-4 bottom-4 max-w-[300px] rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] animate-in fade-in slide-in-from-bottom-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">Peringkat #{rankOf.get(hoverRow.name)}</p>
                                <p className="text-[13px] font-black">{hoverRow.name}</p>
                                <div className="mt-2 grid grid-cols-3 gap-3">
                                    {METRICS.map((m) => (
                                        <div key={m.key}>
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-sky-100/60">{m.label}</p>
                                            <p className="text-sm font-black tabular-nums" style={{ color: m.color }}>{fmt(hoverRow[m.key])}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col min-w-0 max-h-[520px] xl:max-h-[480px]">
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setScope(null)} className={`w-full mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${!scope ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}>
                            <Globe2 className="h-4 w-4" /> Nasional (semua provinsi)
                        </button>
                        <SearchBox value={q} onChange={setQ} placeholder="Cari provinsi…" />
                    </div>
                    <ol className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {list.map((p) => {
                            const rank = rankOf.get(p.name)!;
                            const on = scope === p.name;
                            return (
                                <li key={p.name}>
                                    <button type="button" onMouseEnter={() => setHover(p.name)} onMouseLeave={() => setHover(null)} onClick={() => pick(p.name)} className={`w-full rounded-xl px-2.5 py-2 text-left transition-colors ${on ? "bg-[#0B1B3F] text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-5 shrink-0 text-[10px] font-black tabular-nums ${on ? "text-sky-300" : rank <= 3 ? "text-amber-500" : "text-slate-400"}`}>{rank}</span>
                                            <span className={`flex-1 min-w-0 truncate text-xs font-semibold ${on ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{p.name}</span>
                                            {!p.pos && <MapPin className="h-3 w-3 shrink-0 text-slate-300" aria-label="Belum terpetakan" />}
                                            <span className={`shrink-0 text-xs font-black tabular-nums ${on ? "text-white" : "text-slate-900 dark:text-white"}`}>{fmt(p[metric])}</span>
                                        </div>
                                        <div className={`ml-7 mt-1 h-1 rounded-full overflow-hidden ${on ? "bg-white/15" : "bg-slate-100 dark:bg-slate-800"}`}>
                                            <div className="h-full rounded-full" style={{ width: `${(p[metric] / max) * 100}%`, background: on ? "#fff" : color }} />
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>

            {/* ─── INSIGHT ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1B3F] text-sky-200">{scope ? <MapPin className="h-4 w-4" /> : <Globe2 className="h-4 w-4" />}</span>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Insight {scope ? `· peringkat #${rankOf.get(scope)}` : "nasional"}</p>
                        <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{scope || "Seluruh provinsi"}</h3>
                    </div>
                </div>
                {scope && (
                    <button type="button" onClick={() => setScope(null)} className="h-9 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> Kembali ke nasional
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Kpi icon={Building2} accent="#06B6D4" label="Lembaga ditetapkan" value={fmt(insight.total)} sub={`${fmt(insight.kota.length)} kota / kab`} />
                <Kpi icon={FileText} accent="#3B82F6" label="Pengajuan" value={fmt(insight.pengajuan)} sub={`${approvalRate}% disetujui`} progress={approvalRate} />
                <Kpi icon={Clock} accent="#F59E0B" label="Menunggu review" value={fmt(insight.st.pending)} sub="perlu ditindaklanjuti" />
                <Kpi icon={AlertCircle} accent="#F43F5E" label="Perlu perbaikan" value={fmt(insight.st.revisi)} sub="dikembalikan ke lembaga" />
                <Kpi icon={ShieldCheck} accent="#10B981" label="Berstatus LPK" value={`${pct(insight.lpk, insight.total)}%`} sub={`${fmt(insight.lpk)} LPK · ${fmt(insight.total - insight.lpk)} non-LPK`} progress={pct(insight.lpk, insight.total)} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Klasifikasi & status */}
                <Card icon={Layers} accent="#8B5CF6" title="Klasifikasi & status" subtitle="Tingkatan lembaga dan status pengajuan">
                    <div className="px-5 pb-5 space-y-5">
                        <div>
                            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100 dark:bg-slate-800">
                                {insight.klas.map((k) => <div key={k.name} title={`${k.name}: ${k.value}`} style={{ width: `${pct(k.value, insight.total)}%`, background: KLAS_COLOR(k.name) }} />)}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {insight.klas.map((k) => (
                                    <div key={k.name} className="rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 px-3 py-2">
                                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: KLAS_COLOR(k.name) }} /> {k.name}
                                        </p>
                                        <p className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{fmt(k.value)} <span className="text-[11px] font-semibold text-slate-400">{pct(k.value, insight.total)}%</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Status pengajuan penetapan</p>
                            {[
                                { label: "Disetujui", v: insight.st.approved, c: "#10B981", icon: CheckCircle2 },
                                { label: "Menunggu review", v: insight.st.pending, c: "#F59E0B", icon: Clock },
                                { label: "Perlu perbaikan", v: insight.st.revisi, c: "#F43F5E", icon: AlertCircle },
                            ].map((s) => (
                                <div key={s.label} className="mb-2 last:mb-0">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300"><s.icon className="h-3.5 w-3.5" style={{ color: s.c }} /> {s.label}</span>
                                        <span className="tabular-nums"><b className="text-slate-900 dark:text-white">{fmt(s.v)}</b> <span className="text-slate-400">{pct(s.v, insight.pengajuan)}%</span></span>
                                    </div>
                                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(s.v, insight.pengajuan)}%`, background: s.c }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Kepemilikan & kota */}
                <Card icon={Briefcase} accent="#F59E0B" title="Kepemilikan & wilayah" subtitle={scope ? "Kota / kabupaten di provinsi ini" : "Kota / kabupaten teratas"}>
                    <div className="px-5 pb-5 space-y-5">
                        <div className="flex flex-wrap gap-1.5">
                            {insight.milik.map((m, i) => (
                                <span key={m.name} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                                    <span className="h-2 w-2 rounded-full" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} /> {m.name} <b className="tabular-nums text-slate-900 dark:text-white">{fmt(m.value)}</b>
                                </span>
                            ))}
                        </div>
                        <ul className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                            {insight.kota.length === 0 ? (
                                <li className="py-6 text-center text-xs text-slate-400">Belum ada data kota</li>
                            ) : (
                                insight.kota.slice(0, 12).map((k, i) => (
                                    <li key={k.name}>
                                        <div className="flex items-baseline justify-between gap-3 text-xs">
                                            <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-200"><span className="mr-1.5 text-[10px] font-black text-slate-400">{i + 1}</span>{k.name}</span>
                                            <b className="tabular-nums text-slate-900 dark:text-white">{fmt(k.value)}</b>
                                        </div>
                                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(k.value / (insight.kota[0]?.value || 1)) * 100}%`, background: "linear-gradient(90deg,#06B6D499,#06B6D4)" }} />
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </Card>

                {/* Daftar lembaga */}
                <Card icon={Building2} accent="#06B6D4" title="Daftar lembaga" subtitle={`${fmt(insight.total)} lembaga ditetapkan`}>
                    <div className="px-5 pb-3">
                        <SearchBox value={qLembaga} onChange={setQLembaga} placeholder="Cari lembaga atau kota…" />
                    </div>
                    <ul className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                        {lembagaList.length === 0 ? (
                            <li className="py-8 text-center text-xs text-slate-400">Tidak ada lembaga</li>
                        ) : (
                            lembagaList.slice(0, 100).map((l) => (
                                <li key={l.d.IdPpmkp} className="px-5 py-2.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={l.nama}>{l.nama}</p>
                                    <p className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className="truncate">{[l.kota, scope ? "" : l.prov].filter(Boolean).join(", ") || "-"}</span>
                                        <span className="inline-flex items-center gap-1 shrink-0"><span className="h-1.5 w-1.5 rounded-full" style={{ background: KLAS_COLOR(l.klas) }} /> {l.klas}</span>
                                        {l.lpk && <span className="shrink-0 px-1 rounded bg-emerald-50 text-emerald-600 font-bold">LPK</span>}
                                    </p>
                                </li>
                            ))
                        )}
                        {lembagaList.length > 100 && <li className="px-5 py-2 text-[11px] text-slate-400">+{lembagaList.length - 100} lembaga lain — persempit pencarian</li>}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default DashboardP2MKP;

/* ============================ UI ============================ */

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-9 pl-8 pr-8 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/30" />
            {value && (
                <button type="button" onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:bg-slate-200" aria-label="Hapus">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

function HeroKpi({ icon: Icon, accent, label, value, sub, className = "" }: { icon: LucideIcon; accent: string; label: string; value: string; sub: string; className?: string }) {
    return (
        <div className={`group relative isolate overflow-hidden rounded-3xl bg-white/[0.07] ring-1 ring-white/10 p-4 md:p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.1] ${className}`}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 h-24 w-24 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/70">{label}</p>
            <p className="mt-1 text-2xl md:text-3xl font-black tracking-tight tabular-nums">{value}</p>
            <p className="mt-1 text-[11px] text-blue-100/60 truncate">{sub}</p>
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

function Card({ icon: Icon, accent, title, subtitle, children }: { icon: LucideIcon; accent: string; title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <section className="min-w-0 flex flex-col rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
            <header className="flex items-center gap-3 px-5 pt-5 pb-3">
                <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-white shadow-md">
                    <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 75%)` }} />
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
                </div>
            </header>
            {children}
        </section>
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

const Skeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-[340px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="h-[460px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => <div key={i} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800" />)}
        </div>
    </div>
);

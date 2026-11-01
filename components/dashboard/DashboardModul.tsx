'use client'

import React, { useEffect, useMemo, useState } from "react";
import {
    Library, Layers, FileWarning, RefreshCw, BadgeCheck, Globe2, Search, X, CalendarRange, LayoutGrid,
    AlertTriangle, MonitorPlay, Sparkles, LucideIcon,
} from "lucide-react";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";

/* ============================ HELPERS ============================ */

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
const OTHER = "Lainnya";
const BAR_COLORS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#6366F1", "#14B8A6"];

/** "Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon" → "BPPP Ambon" */
const singkat = (nama: string) => (/^pusat pelatihan kelautan dan perikanan$/i.test(nama.trim()) ? "Puslat KP" : nama.replace(/^.*\((\w+)\)\s*/, "$1 ").trim());

interface Rec {
    id: string;
    nama: string;
    produsen: string;
    bidang: string;
    tahun: string;
    files: number;
    bahan: number;
    verified: boolean;
}

/* ============================ KOMPONEN ============================ */

export default function DashboardModul() {
    const { data, loading, fetchModulPelatihan } = useFetchDataMateriPelatihanMasyarakat("Modul");
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();
    const [ready, setReady] = useState(false);
    const [scope, setScope] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [issueTab, setIssueTab] = useState<"file" | "verif">("file");

    useEffect(() => {
        Promise.resolve(fetchModulPelatihan()).finally(() => setReady(true));
        fetchUnitKerjaData();
    }, [fetchModulPelatihan, fetchUnitKerjaData]);

    /* ---------- Normalisasi sekali ---------- */
    const recs = useMemo<Rec[]>(() => {
        const unit = new Map((unitKerjas || []).map((u: UnitKerja) => [String(u.id_unit_kerja), u.nama]));
        return (data as any[]).map((m) => {
            const files = Array.isArray(m.ModulPelatihan) ? m.ModulPelatihan : [];
            return {
                id: String(m.IdMateriPelatihan ?? ""),
                nama: m.NamaMateriPelatihan || "-",
                produsen: unit.get(String(m.DeskripsiMateriPelatihan ?? "")) || "Tidak diketahui",
                bidang: (m.BidangMateriPelatihan || "").trim() || OTHER,
                tahun: (m.Tahun || "").trim() || OTHER,
                files: files.length,
                bahan: files.reduce((s: number, f: any) => s + (f.BahanTayang?.length || 0), 0),
                verified: m.IsVerified === "Verified",
            };
        });
    }, [data, unitKerjas]);

    /* ---------- Agregat per produsen ---------- */
    const produsen = useMemo(() => {
        const m = new Map<string, { name: string; total: number; verified: number; files: number }>();
        for (const r of recs) {
            const e = m.get(r.produsen) || { name: r.produsen, total: 0, verified: 0, files: 0 };
            e.total++;
            e.files += r.files;
            if (r.verified) e.verified++;
            m.set(r.produsen, e);
        }
        return Array.from(m.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }, [recs]);
    const maxProd = produsen[0]?.total || 1;
    const prodList = produsen.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

    /* ---------- Metrik (global & lingkup) ---------- */
    const calc = (rs: Rec[]) => {
        let files = 0, bahan = 0, tanpaFile = 0, verified = 0;
        const tahun = new Map<string, { v: number; d: number }>();
        const bidang = new Map<string, number>();
        for (const r of rs) {
            files += r.files;
            bahan += r.bahan;
            if (!r.files) tanpaFile++;
            if (r.verified) verified++;
            const t = tahun.get(r.tahun) || { v: 0, d: 0 };
            r.verified ? t.v++ : t.d++;
            tahun.set(r.tahun, t);
            bidang.set(r.bidang, (bidang.get(r.bidang) || 0) + 1);
        }
        return {
            total: rs.length,
            files,
            bahan,
            tanpaFile,
            verified,
            avgFile: rs.length ? Math.round((files / rs.length) * 10) / 10 : 0,
            tahun: Array.from(tahun, ([name, x]) => ({ name, ...x })).sort((a, b) => (a.name === OTHER ? 1 : b.name === OTHER ? -1 : a.name.localeCompare(b.name))),
            bidang: Array.from(bidang, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        };
    };
    const global = useMemo(() => calc(recs), [recs]);
    const scoped = useMemo(() => (scope ? recs.filter((r) => r.produsen === scope) : recs), [recs, scope]);
    const insight = useMemo(() => calc(scoped), [scoped]);
    const issues = useMemo(
        () => (issueTab === "file" ? scoped.filter((r) => !r.files) : scoped.filter((r) => !r.verified)).sort((a, b) => b.tahun.localeCompare(a.tahun)),
        [scoped, issueTab]
    );

    if (!ready || (loading && data.length === 0)) return <ModulSkeleton />;

    const gVer = pct(global.verified, global.total);
    const sVer = pct(insight.verified, insight.total);
    const tahunMax = Math.max(1, ...insight.tahun.map((t) => t.v + t.d));
    const bidangMax = insight.bidang[0]?.value || 1;

    return (
        <div className="flex flex-col gap-6 w-full pb-12">
            {/* ─── HERO ─── */}
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.45)]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_70%_at_100%_0%,#10B981_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-90" />
                <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />

                <div className="p-5 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                                </span>
                                {loading ? "Memperbarui…" : "Perangkat Pelatihan"}
                            </span>
                            <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                                Modul <span className="bg-gradient-to-r from-sky-200 via-white to-emerald-200 bg-clip-text text-transparent">Pelatihan</span>
                            </h2>
                            <p className="mt-1 text-sm text-blue-100/70">Koleksi modul dari {fmt(produsen.length)} unit produsen · {fmt(global.bidang.length)} bidang</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchModulPelatihan()}
                            disabled={loading}
                            className="self-start lg:self-auto h-10 px-4 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl text-xs font-bold text-sky-100 hover:bg-white/15 disabled:opacity-60 inline-flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Muat ulang
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="group col-span-2 lg:col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between gap-5">
                            <Library aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-emerald-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Total modul</p>
                            <div>
                                <p className="text-5xl md:text-6xl font-black tracking-[-0.04em] tabular-nums leading-none">{fmt(global.total)}</p>
                                <p className="mt-1 text-xs text-blue-100/60">koleksi modul pelatihan</p>
                            </div>
                            <div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                                    <div className="bg-emerald-300" style={{ width: `${gVer}%` }} />
                                    <div className="bg-white/30" style={{ width: `${100 - gVer}%` }} />
                                </div>
                                <div className="mt-1.5 flex justify-between text-[11px] text-blue-100/75">
                                    <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Disahkan <b className="text-white">{fmt(global.verified)}</b></span>
                                    <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white/40" /> Belum <b className="text-white">{fmt(global.total - global.verified)}</b></span>
                                </div>
                            </div>
                        </div>
                        <HeroKpi className="lg:col-span-2" icon={Layers} accent="#3B82F6" label="File materi" value={fmt(global.files)} sub={`rata-rata ${global.avgFile.toLocaleString("id-ID")} file / modul`} />
                        <HeroKpi className="lg:col-span-2" icon={MonitorPlay} accent="#8B5CF6" label="Bahan tayang" value={fmt(global.bahan)} sub="slide & video pendukung" />
                        <HeroKpi className="lg:col-span-2" icon={BadgeCheck} accent="#10B981" label="Tingkat pengesahan" value={`${gVer}%`} sub={`${fmt(global.verified)} / ${fmt(global.total)} modul`} progress={gVer} />
                        <HeroKpi className="lg:col-span-2" icon={FileWarning} accent="#F59E0B" label="Modul tanpa file" value={fmt(global.tanpaFile)} sub={global.tanpaFile ? "perlu dilengkapi" : "semua sudah lengkap"} warn={global.tanpaFile > 0} />
                    </div>
                </div>
            </section>

            {global.total === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Library className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-700 dark:text-slate-200">Belum ada modul</h3>
                    <p className="text-sm text-slate-400 max-w-sm">Modul pelatihan akan tampil setelah diunggah dan didaftarkan.</p>
                </div>
            ) : (
                <>
                    <Section icon={Sparkles} title="Insight Modul" desc="Pilih unit produsen untuk melihat komposisi, tren tahunan, dan modul yang perlu dilengkapi." />

                    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">
                        {/* ─── Produsen (navy) ─── */}
                        <aside className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-lg xl:sticky xl:top-24">
                            <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(70%_50%_at_100%_100%,#10B981_0%,transparent_60%)] opacity-60" />
                            <div className="px-4 pt-4 pb-3 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Unit produsen</p>
                                <button
                                    type="button"
                                    onClick={() => setScope(null)}
                                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all ${!scope ? "bg-white/[0.14] ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "hover:bg-white/[0.07] text-blue-100/80"}`}
                                >
                                    <Globe2 className="h-4 w-4" /> Semua produsen <span className="ml-auto tabular-nums">{fmt(global.total)}</span>
                                </button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-100/50" />
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Cari unit…"
                                        className="w-full h-9 pl-8 pr-8 rounded-xl border-none bg-white/10 ring-1 ring-white/15 text-xs font-medium text-white placeholder:text-blue-100/40 outline-none focus:ring-2 focus:ring-sky-300/40"
                                    />
                                    {q && (
                                        <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-blue-100/60 hover:bg-white/10" aria-label="Hapus">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <ol className="max-h-[520px] overflow-y-auto px-2 pb-3 space-y-0.5">
                                {prodList.map((p, i) => {
                                    const on = scope === p.name;
                                    return (
                                        <li key={p.name}>
                                            <button
                                                type="button"
                                                onClick={() => setScope(on ? null : p.name)}
                                                className={`relative isolate w-full overflow-hidden rounded-xl px-2.5 py-2 text-left transition-all ${on ? "bg-white/[0.14] ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "hover:bg-white/[0.07]"}`}
                                            >
                                                {on && <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_left,#10B98155,transparent_80%)]" />}
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-5 shrink-0 text-[10px] font-black tabular-nums ${i < 3 ? "text-amber-300" : "text-blue-100/40"}`}>{produsen.indexOf(p) + 1}</span>
                                                    <span className="flex-1 min-w-0 truncate text-xs font-semibold" title={p.name}>{singkat(p.name)}</span>
                                                    <span className="shrink-0 text-xs font-black tabular-nums">{fmt(p.total)}</span>
                                                </div>
                                                <div className="ml-7 mt-1 flex h-1 rounded-full overflow-hidden bg-white/10" style={{ width: `${Math.max(10, (p.total / maxProd) * 100)}%` }}>
                                                    <div className="bg-emerald-300" style={{ width: `${pct(p.verified, p.total)}%` }} />
                                                    <div className="flex-1 bg-white/30" />
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ol>
                        </aside>

                        {/* ─── Insight ─── */}
                        <div className="min-w-0 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Insight {scope ? "unit" : "seluruh produsen"}</p>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{scope || "Semua unit produsen"}</h3>
                                </div>
                                {scope && (
                                    <button type="button" onClick={() => setScope(null)} className="h-9 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 inline-flex items-center gap-1.5">
                                        <X className="h-3.5 w-3.5" /> Semua
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <Kpi icon={Library} accent="#3B82F6" label="Modul" value={fmt(insight.total)} sub={`${fmt(insight.bidang.length)} bidang`} />
                                <Kpi icon={Layers} accent="#06B6D4" label="File materi" value={fmt(insight.files)} sub={`${insight.avgFile.toLocaleString("id-ID")} / modul`} />
                                <Kpi icon={BadgeCheck} accent="#10B981" label="Disahkan" value={`${sVer}%`} sub={`${fmt(insight.verified)} modul`} progress={sVer} />
                                <Kpi icon={FileWarning} accent="#F59E0B" label="Tanpa file" value={fmt(insight.tanpaFile)} sub={`${pct(insight.tanpaFile, insight.total)}% dari modul`} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Tren tahunan */}
                                <Card icon={CalendarRange} accent="#6366F1" title="Modul per tahun" subtitle="Disahkan vs belum disahkan">
                                    <div className="px-5 pb-5">
                                        <div className="flex items-end gap-2 h-44">
                                            {insight.tahun.map((t) => {
                                                const tot = t.v + t.d;
                                                const h = (tot / tahunMax) * 140;
                                                return (
                                                    <div key={t.name} className="group flex-1 min-w-0 flex flex-col items-center gap-1" title={`${t.name}: ${t.v} disahkan, ${t.d} belum`}>
                                                        <span className="text-[10px] font-black tabular-nums text-slate-700 dark:text-slate-200">{tot}</span>
                                                        <div className="w-full max-w-[44px] flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-700 group-hover:brightness-110" style={{ height: Math.max(4, h) }}>
                                                            <div style={{ height: `${pct(t.v, tot)}%`, background: "linear-gradient(180deg,#34D399,#10B981)" }} />
                                                            <div style={{ height: `${pct(t.d, tot)}%`, background: "#CBD5E1" }} />
                                                        </div>
                                                        <span className="w-full truncate text-center text-[10px] font-semibold text-slate-500">{t.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
                                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Disahkan</span>
                                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Belum</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Bidang */}
                                <Card icon={LayoutGrid} accent="#8B5CF6" title="Bidang materi" subtitle={`${fmt(insight.bidang.length)} bidang`}>
                                    <ul className="px-5 pb-5 space-y-2.5 max-h-[260px] overflow-y-auto">
                                        {insight.bidang.slice(0, 12).map((b, i) => {
                                            const c = b.name === OTHER ? "#CBD5E1" : BAR_COLORS[i % BAR_COLORS.length];
                                            return (
                                                <li key={b.name}>
                                                    <div className="flex items-baseline justify-between gap-3 text-xs">
                                                        <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-200" title={b.name}>{b.name}</span>
                                                        <span className="shrink-0 tabular-nums"><b className="text-slate-900 dark:text-white">{fmt(b.value)}</b> <span className="text-slate-400">{pct(b.value, insight.total)}%</span></span>
                                                    </div>
                                                    <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(b.value / bidangMax) * 100}%`, background: `linear-gradient(90deg, ${c}99, ${c})` }} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                        {insight.bidang.length > 12 && <li className="text-[11px] text-slate-400">+{insight.bidang.length - 12} bidang lain</li>}
                                    </ul>
                                </Card>
                            </div>

                            {/* Perlu ditindaklanjuti */}
                            <Card
                                icon={AlertTriangle}
                                accent="#F59E0B"
                                title="Perlu ditindaklanjuti"
                                subtitle={`${fmt(issues.length)} modul`}
                                right={
                                    <div className="flex items-center p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700">
                                        {([["file", `Tanpa file ${insight.tanpaFile}`], ["verif", `Belum disahkan ${insight.total - insight.verified}`]] as const).map(([k, l]) => (
                                            <button key={k} type="button" onClick={() => setIssueTab(k)} className={`h-7 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${issueTab === k ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500"}`}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                }
                            >
                                {issues.length === 0 ? (
                                    <p className="px-5 pb-6 text-center text-xs text-emerald-600 font-semibold">Semua modul pada lingkup ini sudah lengkap 🎉</p>
                                ) : (
                                    <ul className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                                        {issues.slice(0, 50).map((r) => (
                                            <li key={r.id || r.nama} className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.nama}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{[r.bidang, r.tahun, scope ? "" : singkat(r.produsen)].filter(Boolean).join(" · ")}</p>
                                                </div>
                                                <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold ${issueTab === "file" ? "text-amber-600" : "text-slate-500"}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${issueTab === "file" ? "bg-amber-500" : "bg-slate-400"}`} />
                                                    {issueTab === "file" ? "Tanpa file" : "Draft"}
                                                </span>
                                            </li>
                                        ))}
                                        {issues.length > 50 && <li className="px-5 py-2 text-[11px] text-slate-400">+{issues.length - 50} modul lain</li>}
                                    </ul>
                                )}
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ============================ UI ============================ */

function HeroKpi({ icon: Icon, accent, label, value, sub, progress, warn, className = "" }: { icon: LucideIcon; accent: string; label: string; value: string; sub: string; progress?: number; warn?: boolean; className?: string }) {
    return (
        <div className={`group relative isolate overflow-hidden rounded-3xl ring-1 p-4 md:p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors ${warn ? "bg-amber-300/10 ring-amber-300/30 hover:bg-amber-300/15" : "bg-white/[0.07] ring-white/10 hover:bg-white/[0.1]"} ${className}`}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 h-24 w-24 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/70">{label}</p>
            <p className="mt-1 text-2xl md:text-3xl font-black tracking-tight tabular-nums">{value}</p>
            {progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
            <p className={`mt-1 text-[11px] truncate ${warn ? "text-amber-100/80" : "text-blue-100/60"}`}>{sub}</p>
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

const ModulSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-[340px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
            <div className="h-[480px] rounded-3xl bg-slate-200/70 dark:bg-slate-800" />
            <div className="h-[480px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>
    </div>
);

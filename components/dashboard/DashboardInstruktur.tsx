'use client'

import React, { useEffect, useState } from "react";
import { Users, RefreshCw, Map as MapIcon, Table2, Presentation, GraduationCap, BadgeCheck, UserCheck, LucideIcon } from "lucide-react";
import SebaranPelatihMap from "./Pelatihan/SebaranPelatihMap";
import TableSebaranPelatih from "./Pelatihan/TableSebaranPelatih";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";

/* ============================ HELPERS ============================ */

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

const KATEGORI = [
    { key: "widyaiswara", label: "Widyaiswara", color: "#A78BFA" },
    { key: "instruktur", label: "Instruktur", color: "#60A5FA" },
    { key: "nonInstruktur", label: "Non Instruktur", color: "#22D3EE" },
    { key: "belumDiisi", label: "Belum dikategorikan", color: "rgba(255,255,255,0.25)" },
] as const;

/* ============================ KOMPONEN ============================ */

export default function DashboardInstruktur() {
    const { instrukturs, unitKerjas, loading, fetchInstrukturData, stats } = useFetchDataInstruktur({ balaiOnly: true });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        Promise.resolve(fetchInstrukturData()).finally(() => setReady(true));
    }, [fetchInstrukturData]);

    const total = instrukturs.length;
    const kategori = stats?.kategori ?? { instruktur: 0, widyaiswara: 0, nonInstruktur: 0, belumDiisi: 0 };
    const tot = stats?.tot ?? 0;
    const aktif = stats?.status?.Active ?? 0;
    const terkategori = total - (kategori.belumDiisi || 0);

    if (!ready || (loading && total === 0)) return <InstrukturSkeleton />;

    return (
        <div className="flex flex-col gap-6 w-full pb-12">
            {/* ─── HERO ─── */}
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.45)]">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_70%_at_100%_0%,#7C3AED_0%,transparent_55%),radial-gradient(60%_60%_at_80%_100%,#1D4ED8_0%,transparent_60%)] opacity-90" />
                <div className="absolute inset-0 -z-10 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]" />

                <div className="p-5 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
                                </span>
                                {loading ? "Memperbarui…" : "Sumber Daya Manusia Pelatihan"}
                            </span>
                            <h2 className="mt-3 text-3xl md:text-[44px] font-black tracking-[-0.03em] leading-[1.05]">
                                SDM <span className="bg-gradient-to-r from-sky-200 via-white to-violet-200 bg-clip-text text-transparent">Pelatih</span>
                            </h2>
                            <p className="mt-1 text-sm text-blue-100/70">Instruktur, widyaiswara & pelatih aktif di {fmt(unitKerjas?.length ?? 0)} unit kerja</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchInstrukturData()}
                            disabled={loading}
                            className="self-start lg:self-auto h-10 px-4 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl text-xs font-bold text-sky-100 hover:bg-white/15 disabled:opacity-60 inline-flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Muat ulang
                        </button>
                    </div>

                    {/* Bento */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="group col-span-2 lg:col-span-2 lg:row-span-2 relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.16] to-white/[0.04] ring-1 ring-white/15 p-5 md:p-6 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col justify-between gap-5">
                            <Users aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 h-40 w-40 -rotate-12 text-sky-300 opacity-20 transition-all duration-500 group-hover:opacity-35 group-hover:-rotate-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Total tenaga pelatih</p>
                            <div>
                                <p className="text-5xl md:text-6xl font-black tracking-[-0.04em] tabular-nums leading-none">{fmt(total)}</p>
                                <p className="mt-1 text-xs text-blue-100/60">orang terdaftar di balai</p>
                            </div>
                            <div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                                    {KATEGORI.map((k) => (kategori[k.key] ? <div key={k.key} title={`${k.label}: ${kategori[k.key]}`} style={{ width: `${pct(kategori[k.key], total)}%`, background: k.color }} /> : null))}
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                                    {KATEGORI.map((k) => (
                                        <p key={k.key} className="flex items-center gap-1.5 text-[11px] text-blue-100/75">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: k.color }} />
                                            <span className="flex-1 truncate">{k.label}</span>
                                            <b className="text-white tabular-nums">{fmt(kategori[k.key])}</b>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Kpi className="lg:col-span-2" icon={Presentation} accent="#8B5CF6" label="Widyaiswara" value={fmt(kategori.widyaiswara)} unit={`${pct(kategori.widyaiswara, total)}% dari total`} />
                        <Kpi className="lg:col-span-2" icon={GraduationCap} accent="#3B82F6" label="Instruktur" value={fmt(kategori.instruktur)} unit={`${pct(kategori.instruktur, total)}% dari total`} />
                        <Kpi className="lg:col-span-2" icon={BadgeCheck} accent="#10B981" label="Sertifikasi ToT" value={`${pct(tot, total)}%`} unit={`${fmt(tot)} pelatih`} progress={pct(tot, total)} />
                        <Kpi className="lg:col-span-2" icon={UserCheck} accent="#F59E0B" label="SDM aktif" value={`${pct(aktif, total)}%`} unit={`${fmt(aktif)} siap · kategori lengkap ${pct(terkategori, total)}%`} progress={pct(aktif, total)} />
                    </div>
                </div>
            </section>

            {total === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-700 dark:text-slate-200">Belum ada data pelatih</h3>
                    <p className="text-sm text-slate-400 max-w-sm">Data instruktur dan widyaiswara akan tampil setelah didaftarkan oleh balai.</p>
                </div>
            ) : (
                <>
                    <Section icon={MapIcon} title="Sebaran & Insight Pelatih" desc="Klik titik di peta atau nama satker untuk melihat komposisi, jenjang, dan keahliannya." />
                    <SebaranPelatihMap data={instrukturs} unitKerjas={unitKerjas} />

                    <Section icon={Table2} title="Tabel Laporan" desc="Rekap per satuan kerja dalam format laporan — bisa diunduh ke Excel." />
                    <TableSebaranPelatih data={instrukturs} unitKerjas={unitKerjas} />
                </>
            )}
        </div>
    );
}

/* ============================ UI ============================ */

function Kpi({ icon: Icon, accent, label, value, unit, progress, className = "" }: { icon: LucideIcon; accent: string; label: string; value: string; unit: string; progress?: number; className?: string }) {
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
            <p className="mt-1 text-[11px] text-blue-100/60 truncate">{unit}</p>
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

const InstrukturSkeleton = () => (
    <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-[360px] rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="h-[460px] rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
);

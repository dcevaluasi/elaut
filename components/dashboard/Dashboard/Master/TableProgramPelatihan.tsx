"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
    TbShieldCheck,
    TbShip,
    TbSettings,
    TbFish,
    TbLeaf,
    TbGlobe,
    TbAnchor,
    TbBuildingFactory,
    TbUsersGroup,
    TbEngine,
    TbBook,
} from "react-icons/tb";
import { IconType } from "react-icons";
import {
    Search,
    BookOpen,
    ChevronRight,
    X,
    FileText,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    ChevronsDownUp,
    ChevronsUpDown,
    Layers,
    LucideIcon,
} from "lucide-react";

import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";
import DeleteProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/DeleteProgramPelatihanAction";
import { findNameRumpunPelatihanById } from "@/utils/programs";
import { generatedDescriptionCertificateFull } from "@/utils/certificates";
import { canManageProgram, canManageProgramUPT } from "@/utils/permissions";
import { ProgramPelatihan } from "@/types/program";
import MateriProgramPanel, { MateriSummary, useMateriIndex } from "./MateriProgramPanel";

/* ============================ KONSTANTA ============================ */

const RUMPUN_ICONS: Record<string, IconType> = {
    "Sistem Jaminan Mutu": TbShieldCheck,
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": TbShip,
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": TbSettings,
    "Budi Daya": TbFish,
    "Pengolahan dan Pemasaran": TbBuildingFactory,
    "Konservasi dan Kemitigasian": TbLeaf,
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)": TbGlobe,
    "Pengawasan dan Kepelabuhan Perikanan": TbAnchor,
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)": TbUsersGroup,
    "Permesinan dan Mekanisasi": TbEngine,
};

const OTHER = "Lainnya";

/** Warna per rumpun (seperti versi awal) — lembut, satu warna per klaster */
type RumpunColor = { dot: string; soft: string; icon: string; bar: string };
const RUMPUN_COLORS: Record<string, RumpunColor> = {
    "Sistem Jaminan Mutu": { dot: "bg-blue-500", soft: "bg-blue-50 ring-blue-200 text-blue-700", icon: "text-blue-600", bar: "bg-blue-500" },
    "Pembentukan Keahlian Awak Kapal Perikanan (AKP)": { dot: "bg-indigo-500", soft: "bg-indigo-50 ring-indigo-200 text-indigo-700", icon: "text-indigo-600", bar: "bg-indigo-500" },
    "Peningkatan Keahlian Awak Kapal Perikanan (AKP)": { dot: "bg-emerald-500", soft: "bg-emerald-50 ring-emerald-200 text-emerald-700", icon: "text-emerald-600", bar: "bg-emerald-500" },
    "Budi Daya": { dot: "bg-cyan-500", soft: "bg-cyan-50 ring-cyan-200 text-cyan-700", icon: "text-cyan-600", bar: "bg-cyan-500" },
    "Pengolahan dan Pemasaran": { dot: "bg-rose-500", soft: "bg-rose-50 ring-rose-200 text-rose-700", icon: "text-rose-600", bar: "bg-rose-500" },
    "Konservasi dan Kemitigasian": { dot: "bg-green-500", soft: "bg-green-50 ring-green-200 text-green-700", icon: "text-green-600", bar: "bg-green-500" },
    "Kelautan dan Kemaritiman (Garam, Oceanografi,Biologi, Iklim, Marine Debris)": { dot: "bg-teal-500", soft: "bg-teal-50 ring-teal-200 text-teal-700", icon: "text-teal-600", bar: "bg-teal-500" },
    "Pengawasan dan Kepelabuhan Perikanan": { dot: "bg-sky-500", soft: "bg-sky-50 ring-sky-200 text-sky-700", icon: "text-sky-600", bar: "bg-sky-500" },
    "Teknis Lainnya (Rekayasa Sosial, Enumerator, Koperasi, Dll)": { dot: "bg-amber-500", soft: "bg-amber-50 ring-amber-200 text-amber-700", icon: "text-amber-600", bar: "bg-amber-500" },
    "Permesinan dan Mekanisasi": { dot: "bg-violet-500", soft: "bg-violet-50 ring-violet-200 text-violet-700", icon: "text-violet-600", bar: "bg-violet-500" },
};
const DEFAULT_COLOR: RumpunColor = { dot: "bg-slate-400", soft: "bg-slate-50 ring-slate-200 text-slate-600", icon: "text-slate-500", bar: "bg-slate-400" };
const colorOf = (name: string) => RUMPUN_COLORS[name] ?? DEFAULT_COLOR;

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const byName = (a: string, b: string) => (a === OTHER ? 1 : b === OTHER ? -1 : a.localeCompare(b));

type MateriFilter = "" | "ada" | "belum";

type Row = {
    p: ProgramPelatihan;
    rumpun: string;
    haystack: string;
    materi: MateriSummary | null; // null = belum ada materi
    canManage: boolean;
};

/* ============================ PAGE ============================ */

export default function TableProgramPelatihan() {
    const { data, loading, error, fetchProgramPelatihan } = useFetchDataProgramPelatihan();
    const { data: dataRumpun } = useFetchDataRumpunPelatihan();
    const { index: materiIndex, loading: loadingMateri, reload: reloadMateri, setEntry } = useMateriIndex();

    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [rumpunFilter, setRumpunFilter] = useState("");
    const [materiFilter, setMateriFilter] = useState<MateriFilter>("");
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
    const [openDesc, setOpenDesc] = useState<number | null>(null);
    const [materiOf, setMateriOf] = useState<ProgramPelatihan | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ---------- Normalisasi SEKALI per data ---------- */
    const rows = useMemo<Row[]>(() => {
        if (!Array.isArray(data)) return [];
        const rumpunCache = new Map<string, string>();
        const manageCache = new Map<string, boolean>();
        return data.map((p) => {
            const rid = String(p.id_rumpun_pelatihan ?? "");
            if (!rumpunCache.has(rid)) rumpunCache.set(rid, findNameRumpunPelatihanById(dataRumpun, rid)?.name || OTHER);
            const rumpun = rumpunCache.get(rid)!;
            if (!manageCache.has(rumpun)) manageCache.set(rumpun, canManageProgram(rumpun) || canManageProgramUPT(rumpun));
            const m = materiIndex.get(p.name_indo);
            return {
                p,
                rumpun,
                haystack: [p.name_indo, p.name_english, p.abbrv_name, p.id_program_pelatihan, rumpun].filter(Boolean).join(" ").toLowerCase(),
                materi: m && m.materi > 0 ? m : null,
                canManage: manageCache.get(rumpun)!,
            };
        });
    }, [data, dataRumpun, materiIndex]);

    const rumpunOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.rumpun))).sort(byName), [rows]);

    /* ---------- Filter + grouping + ringkasan (1 loop) ---------- */
    const { groups, summary, rumpunCounts, total } = useMemo(() => {
        const g = new Map<string, Row[]>();
        const rc = new Map<string, number>();
        let ada = 0, belum = 0, base = 0;

        for (const r of rows) {
            if (q && !r.haystack.includes(q)) continue;
            if (rumpunFilter && r.rumpun !== rumpunFilter) {
                // tetap dihitung untuk pill rumpun lain (sesuai filter materi)
                if (!materiFilter || (materiFilter === "ada") === !!r.materi) rc.set(r.rumpun, (rc.get(r.rumpun) || 0) + 1);
                continue;
            }

            // Ringkasan kartu: sebelum filter materi → angka stabil saat kartu diklik
            base++;
            r.materi ? ada++ : belum++;

            if (materiFilter === "ada" && !r.materi) continue;
            if (materiFilter === "belum" && r.materi) continue;

            rc.set(r.rumpun, (rc.get(r.rumpun) || 0) + 1);
            if (!g.has(r.rumpun)) g.set(r.rumpun, []);
            g.get(r.rumpun)!.push(r);
        }

        const sorted = Array.from(g.entries())
            .sort(([a], [b]) => byName(a, b))
            .map(([name, items]) => ({
                name,
                items: items.sort((a, b) => (a.p.name_indo || "").localeCompare(b.p.name_indo || "")),
                withMateri: items.filter((i) => i.materi).length,
            }));

        return { groups: sorted, summary: { ada, belum }, rumpunCounts: rc, total: base };
    }, [rows, q, materiFilter, rumpunFilter]);

    const hasFilter = !!(q || rumpunFilter || materiFilter);
    const forceOpen = hasFilter;

    // Buka otomatis jika hanya ada 1 grup
    useEffect(() => {
        if (groups.length === 1) setOpenGroups(new Set([groups[0].name]));
    }, [groups.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Dukungan link lama: ?materi=<nama program>
    useEffect(() => {
        if (!Array.isArray(data) || data.length === 0) return;
        const name = new URLSearchParams(window.location.search).get("materi");
        if (!name) return;
        const found = data.find((p) => p.name_indo === name);
        if (found) setMateriOf(found);
    }, [data]);

    const toggleGroup = (name: string) =>
        setOpenGroups((prev) => {
            const n = new Set(prev);
            n.has(name) ? n.delete(name) : n.add(name);
            return n;
        });

    const clearFilters = () => {
        setSearch("");
        setRumpunFilter("");
        setMateriFilter("");
    };

    const refresh = useCallback(() => {
        fetchProgramPelatihan();
        reloadMateri();
    }, [fetchProgramPelatihan, reloadMateri]);

    const toggleDesc = (id: number) => setOpenDesc((cur) => (cur === id ? null : id));

    const initialLoading = loading && (!Array.isArray(data) || data.length === 0);
    const allTotal = rows.length;
    const shownCount = groups.reduce((s, g) => s + g.items.length, 0);

    /* ============================ RENDER ============================ */

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="p-4 bg-rose-50 rounded-2xl ring-1 ring-rose-200 text-rose-600 text-sm font-bold flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Gagal memuat data: {String(error)}</span>
                </div>
                <button onClick={refresh} className="h-10 px-4 rounded-xl ring-1 ring-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4" /> Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-16 w-full">
            {/* ─── Statistik (gaya hero) ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="Total Program"
                            value={total}
                            unit="Program"
                            sub={hasFilter && total !== allTotal ? `dari ${fmt(allTotal)} program` : "terdaftar di master data"}
                            icon={BookOpen}
                            accent="#3B82F6"
                            active={materiFilter === ""}
                            onClick={() => setMateriFilter("")}
                        />
                        <StatCard
                            label="Rumpun"
                            value={rumpunFilter ? 1 : rumpunOptions.length}
                            unit="Rumpun"
                            sub={rumpunFilter ? rumpunFilter : "kelompok keilmuan"}
                            icon={Layers}
                            accent="#06B6D4"
                        />
                        <StatCard
                            label="Sudah Ada Materi"
                            value={summary.ada}
                            unit="Program"
                            sub={`${pct(summary.ada, total)}% program bermateri`}
                            icon={CheckCircle2}
                            accent="#10B981"
                            progress={pct(summary.ada, total)}
                            active={materiFilter === "ada"}
                            onClick={() => setMateriFilter(materiFilter === "ada" ? "" : "ada")}
                            loading={loadingMateri}
                        />
                        <StatCard
                            label="Belum Ada Materi"
                            value={summary.belum}
                            unit="Program"
                            sub={summary.belum ? "perlu dilengkapi — klik" : "semua sudah bermateri"}
                            icon={AlertTriangle}
                            accent="#F59E0B"
                            progress={pct(summary.belum, total)}
                            active={materiFilter === "belum"}
                            onClick={() => setMateriFilter(materiFilter === "belum" ? "" : "belum")}
                            loading={loadingMateri}
                        />
                    </>
                )}
            </div>

            {/* ─── Toolbar ────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari kode, nama program (ID/EN), atau rumpun..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-12 w-full h-11 border-none bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search ? (
                        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400">/</kbd>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800">
                        {[
                            { v: "", label: "Semua" },
                            { v: "ada", label: "Ada Materi" },
                            { v: "belum", label: "Belum" },
                        ].map((o) => (
                            <button
                                key={o.v || "all"}
                                type="button"
                                onClick={() => setMateriFilter(o.v as MateriFilter)}
                                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all ${materiFilter === o.v ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={refresh}
                        disabled={loading || loadingMateri}
                        title="Muat ulang"
                        className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading || loadingMateri ? "animate-spin" : ""}`} />
                    </button>

                    <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} />
                </div>
            </div>

            {/* ─── Pill rumpun (netral) ────────────────────────────────────── */}
            {rumpunOptions.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                        {["", ...rumpunOptions].map((name) => {
                            const active = rumpunFilter === name;
                            const count = name ? rumpunCounts.get(name) || 0 : Array.from(rumpunCounts.values()).reduce((a, b) => a + b, 0);
                            const Icon = name ? RUMPUN_ICONS[name] || TbBook : Layers;
                            return (
                                <button
                                    key={name || "all"}
                                    type="button"
                                    onClick={() => setRumpunFilter(active && name ? "" : name)}
                                    title={name || "Semua rumpun"}
                                    className={`inline-flex items-center gap-2 h-8 pl-2.5 pr-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap ring-1 transition-all ${active
                                        ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-sm"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300"
                                        } ${count === 0 && !active ? "opacity-50" : ""}`}
                                >
                                    <Icon className={`w-3.5 h-3.5 ${active ? "text-sky-200" : name ? colorOf(name).icon : "text-slate-400"}`} />
                                    <span className="max-w-[200px] truncate">{name || "Semua Rumpun"}</span>
                                    <span className={`min-w-[22px] text-center text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${active ? "bg-white/15" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {hasFilter && (
                            <>
                                <span className="text-[11px] text-slate-400 mr-1">
                                    <b className="text-slate-700 dark:text-slate-200 tabular-nums">{fmt(shownCount)}</b> ditampilkan
                                </span>
                                <button type="button" onClick={clearFilters} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 mr-2">
                                    Reset filter
                                </button>
                            </>
                        )}
                        {!forceOpen && groups.length > 1 && (
                            <>
                                <button type="button" onClick={() => setOpenGroups(new Set(groups.map((g) => g.name)))} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1">
                                    <ChevronsUpDown className="w-3.5 h-3.5" /> Buka semua
                                </button>
                                <button type="button" onClick={() => setOpenGroups(new Set())} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1">
                                    <ChevronsDownUp className="w-3.5 h-3.5" /> Tutup semua
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Daftar per rumpun ──────────────────────────────────────── */}
            {initialLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center gap-2 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{hasFilter ? "Program tidak ditemukan" : "Belum ada program pelatihan"}</p>
                    <p className="text-xs text-slate-400">{hasFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan program pertama melalui tombol di atas."}</p>
                    {hasFilter && (
                        <button type="button" onClick={clearFilters} className="mt-2 h-9 px-4 rounded-xl ring-1 ring-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                            Reset filter
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((g) => {
                        const open = forceOpen || openGroups.has(g.name);
                        const Icon = RUMPUN_ICONS[g.name] || TbBook;
                        const c = colorOf(g.name);
                        const p = pct(g.withMateri, g.items.length);
                        return (
                            <section key={g.name} className="rounded-[1.5rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(g.name)}
                                    aria-expanded={open}
                                    className="w-full flex items-center gap-4 p-4 md:px-5 text-left hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className={`w-11 h-11 rounded-xl ring-1 flex items-center justify-center shrink-0 transition-transform ${c.soft} ${open ? "scale-105" : ""}`}>
                                        <Icon className={`w-5 h-5 ${c.icon}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm md:text-[15px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">{g.name}</h3>
                                        <div className="mt-1.5 flex items-center gap-2.5 max-w-md">
                                            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">{fmt(g.items.length)} program</span>
                                            <div className="h-1 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${p}%` }} />
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-400 tabular-nums whitespace-nowrap">{g.withMateri}/{g.items.length} bermateri</span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
                                </button>

                                <Collapse open={open}>
                                    {/* Desktop: tabel */}
                                    <div className="hidden md:block border-t border-slate-100 dark:border-slate-800">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                    <th className="w-14 px-5 py-2.5 text-center font-semibold">No</th>
                                                    <th className="px-3 py-2.5 font-semibold">Program</th>
                                                    <th className="w-[200px] px-3 py-2.5 font-semibold">Materi</th>
                                                    <th className="w-[1%] px-5 py-2.5 text-right font-semibold">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {g.items.map((r, i) => (
                                                    <ProgramTableRow
                                                        key={r.p.id_program_pelatihan}
                                                        no={i + 1}
                                                        row={r}
                                                        color={c}
                                                        descOpen={openDesc === r.p.id_program_pelatihan}
                                                        onToggleDesc={() => toggleDesc(r.p.id_program_pelatihan)}
                                                        onOpenMateri={() => setMateriOf(r.p)}
                                                        onSuccess={fetchProgramPelatihan}
                                                        materiLoading={loadingMateri}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile: daftar */}
                                    <div className="md:hidden border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {g.items.map((r) => (
                                            <ProgramCard
                                                key={r.p.id_program_pelatihan}
                                                row={r}
                                                color={c}
                                                descOpen={openDesc === r.p.id_program_pelatihan}
                                                onToggleDesc={() => toggleDesc(r.p.id_program_pelatihan)}
                                                onOpenMateri={() => setMateriOf(r.p)}
                                                onSuccess={fetchProgramPelatihan}
                                                materiLoading={loadingMateri}
                                            />
                                        ))}
                                    </div>
                                </Collapse>
                            </section>
                        );
                    })}
                </div>
            )}

            {/* ─── Drawer materi ──────────────────────────────────────────── */}
            <MateriProgramPanel
                programName={materiOf?.name_indo ?? null}
                subtitle={materiOf ? [materiOf.abbrv_name, materiOf.name_english].filter(Boolean).join(" · ") : undefined}
                onClose={() => {
                    setMateriOf(null);
                    if (window.location.search.includes("materi=")) window.history.replaceState(null, "", window.location.pathname);
                }}
                onSaved={setEntry}
            />
        </div>
    );
}

/* ============================ ROW: TABEL (DESKTOP) ============================ */

type RowProps = {
    row: Row;
    color: RumpunColor;
    descOpen: boolean;
    onToggleDesc: () => void;
    onOpenMateri: () => void;
    onSuccess: () => void;
    materiLoading: boolean;
};

function ProgramTableRow({ no, row, color, descOpen, onToggleDesc, onOpenMateri, onSuccess, materiLoading }: RowProps & { no: number }) {
    const { p, materi, canManage } = row;
    return (
        <>
            <tr className={`group transition-colors ${descOpen ? "bg-slate-50 dark:bg-slate-800/40" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"}`}>
                <td className="px-5 py-3.5 text-center align-top text-xs font-medium text-slate-400 tabular-nums">{no}</td>

                <td className="px-3 py-3.5 align-top">
                    <div className="flex items-start gap-2.5">
                        <span className={`shrink-0 mt-0.5 rounded-md ring-1 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${color.soft}`}>
                            {p.abbrv_name || "PROG"}
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">{p.name_indo}</p>
                            {p.name_english && <p className="text-xs text-slate-400 leading-snug mt-0.5">{p.name_english}</p>}
                        </div>
                    </div>
                </td>

                <td className="px-3 py-3.5 align-top">
                    <MateriCell materi={materi} loading={materiLoading} />
                </td>

                <td className="px-5 py-3 align-top">
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <MateriButton materi={materi} onClick={onOpenMateri} />
                        <DescButton open={descOpen} onClick={onToggleDesc} compact />
                        {canManage && (
                            <div className="flex items-center gap-1 pl-1.5 ml-0.5 border-l border-slate-200 dark:border-slate-800">
                                <ManageProgramPelatihanAction onSuccess={onSuccess} initialData={p} />
                                <DeleteProgramPelatihanAction program={p} onSuccess={onSuccess} />
                            </div>
                        )}
                    </div>
                </td>
            </tr>
            {descOpen && (
                <tr>
                    <td colSpan={4} className="p-0">
                        <Description raw={p.description} />
                    </td>
                </tr>
            )}
        </>
    );
}

/* ============================ ROW: MOBILE ============================ */

function ProgramCard({ row, color, descOpen, onToggleDesc, onOpenMateri, onSuccess, materiLoading }: RowProps) {
    const { p, materi, canManage } = row;
    return (
        <div>
            <div className="p-4 space-y-2.5">
                <div className="flex items-start gap-2">
                    <span className={`shrink-0 rounded-md ring-1 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${color.soft}`}>{p.abbrv_name || "PROG"}</span>
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">{p.name_indo}</p>
                        {p.name_english && <p className="text-xs text-slate-400">{p.name_english}</p>}
                    </div>
                </div>
                <MateriCell materi={materi} loading={materiLoading} />
                <div className="flex flex-wrap items-center gap-1.5">
                    <MateriButton materi={materi} onClick={onOpenMateri} />
                    <DescButton open={descOpen} onClick={onToggleDesc} />
                    {canManage && (
                        <div className="flex items-center gap-1 ml-auto">
                            <ManageProgramPelatihanAction onSuccess={onSuccess} initialData={p} />
                            <DeleteProgramPelatihanAction program={p} onSuccess={onSuccess} />
                        </div>
                    )}
                </div>
            </div>
            {descOpen && <Description raw={p.description} />}
        </div>
    );
}

/* ============================ SEL & TOMBOL (minimalis) ============================ */

function MateriCell({ materi, loading }: { materi: MateriSummary | null; loading: boolean }) {
    if (loading) return <div className="h-8 w-32 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />;

    if (!materi) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Belum ada materi
            </span>
        );
    }

    const jp = materi.theory + materi.practice;
    return (
        <div className="space-y-0.5">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {fmt(materi.materi)} materi · {fmt(jp)} JP
            </p>
            <p className="pl-3 text-[11px] text-slate-400 tabular-nums">
                {materi.kategori} kategori · T {materi.theory} / P {materi.practice}
            </p>
        </div>
    );
}

function MateriButton({ materi, onClick }: { materi: MateriSummary | null; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${materi
                ? "ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                : "bg-[#0B1B3F] text-white hover:bg-blue-700"
                }`}
        >
            <BookOpen className="w-3.5 h-3.5" />
            {materi ? "Kelola" : "Isi Materi"}
        </button>
    );
}

function DescButton({ open, onClick, compact }: { open: boolean; onClick: () => void; compact?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-expanded={open}
            title="Deskripsi sertifikat"
            className={`h-8 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${compact ? "px-2" : "px-3"} ${open
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800"
                }`}
        >
            <FileText className="w-3.5 h-3.5" />
            {!compact && "Deskripsi"}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
    );
}

function Description({ raw }: { raw: string }) {
    const d = useMemo(() => generatedDescriptionCertificateFull(raw), [raw]);
    const block = (label: string, text: string | undefined, italic = false) =>
        text ? (
            <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
                <p className={`text-xs leading-relaxed ${italic ? "italic text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>{text}</p>
            </div>
        ) : null;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {block("Header STTPL (Indonesia)", d.desc_indo || "-")}
                {block("Header STTPL (English)", d.desc_eng || "-", true)}
            </div>
            {(d.body_indo || d.body_eng) && (
                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {block("Isi Kurikulum (Indonesia)", d.body_indo)}
                    {block("Isi Kurikulum (English)", d.body_eng, true)}
                </div>
            )}
        </div>
    );
}

/* ============================ UI KECIL ============================ */

function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">{open && children}</div>
        </div>
    );
}

/** Kartu statistik bergaya hero: navy mesh + ikon besar di kanan + cahaya hover kanan→kiri */
function StatCard({
    label,
    value,
    unit,
    sub,
    icon: Icon,
    accent,
    progress,
    active,
    onClick,
    loading,
}: {
    label: string;
    value: number;
    unit: string;
    sub?: string;
    icon: LucideIcon;
    accent: string;
    progress?: number;
    active?: boolean;
    onClick?: () => void;
    loading?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 ${onClick ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
            style={{ boxShadow: active ? `0 18px 40px -16px ${accent}` : undefined }}
        >
            <div
                className="absolute inset-0 -z-10 opacity-90"
                style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }}
            />
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

            <div
                className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
                style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
            />

            <Icon
                aria-hidden
                strokeWidth={1.5}
                className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
                style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
            />

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>
            {loading ? (
                <div className="mt-2 h-9 w-20 rounded-lg bg-white/15 animate-pulse" />
            ) : (
                <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{fmt(value)}</span>
                    <span className="text-[10px] font-bold uppercase text-sky-100/70">{unit}</span>
                </div>
            )}

            {progress !== undefined && !loading && (
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
            {sub && <p className="mt-2 text-[11px] font-medium text-blue-100/60 truncate">{sub}</p>}
        </button>
    );
}

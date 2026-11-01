"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
    Book,
    Folder,
    FolderOpen,
    ChevronRight,
    Layers,
    Search,
    SlidersHorizontal,
    X,
    ArrowUpRight,
    Building2,
    Paperclip,
    PieChart,
    LayoutGrid,
    FolderTree,
    RefreshCw,
    ChevronsDownUp,
    ChevronsUpDown,
    BookOpen,
    BadgeCheck,
    FilePen,
    AlertTriangle,
    LucideIcon,
} from "lucide-react";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import AddModulAction from "@/commons/actions/modul/AddModulAction";
import UpdateModulAction from "@/commons/actions/modul/UpdateModulAction";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsModulPelatihan from "./StatsModulPelatihan";

/* ============================ TYPES & HELPERS ============================ */

type Modul = React.ComponentProps<typeof UpdateModulAction>["materiPelatihan"];

type Row = {
    m: Modul;
    year: string;
    cluster: string;
    produsen: string;
    files: number;
    verified: boolean;
    canEdit: boolean;
    haystack: string;
};

const OTHER = "Lainnya";
const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);

/** Urutan tahun: terbaru dulu, "Lainnya" paling akhir */
const byYearDesc = (a: string, b: string) => {
    const na = parseInt(a, 10), nb = parseInt(b, 10);
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return nb - na;
};
const byName = (a: string, b: string) => (a === OTHER ? 1 : b === OTHER ? -1 : a.localeCompare(b));

/* ============================ PAGE ============================ */

export default function TableModulPelatihan() {
    const pathname = usePathname() || "";
    const base = `/admin/${pathname.includes("lemdiklat") ? "lemdiklat" : "pusat"}`;

    const { data: rawData, loading, error, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Modul") as ReturnType<typeof useFetchDataMateriPelatihanMasyarakat> & { error?: unknown };
    const data = useMemo(() => (Array.isArray(rawData) ? rawData : []), [rawData]);
    const { unitKerjas, loading: loadingUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja();

    const [session] = useState(() => ({
        idUnitKerja: Cookies.get("IDUnitKerja") || "",
        isSuperAdmin: (Cookies.get("Access") || "").includes("superAdmin"),
    }));

    // Muat data saat halaman dibuka (sebelumnya modul tidak pernah di-fetch di sini)
    useEffect(() => {
        fetchModulPelatihan();
    }, [fetchModulPelatihan]);

    useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    /* ---------- Filter state ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [filterBidang, setFilterBidang] = useState("");
    const [filterTahun, setFilterTahun] = useState("");
    const [filterProdusen, setFilterProdusen] = useState("");
    const [filterVerified, setFilterVerified] = useState<"" | "verified" | "draft">("");
    const [onlyNoFile, setOnlyNoFile] = useState(false);
    const [view, setView] = useState<"folder" | "grid">("folder");
    const [showStats, setShowStats] = useState(false);

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

    /* ---------- Lookup unit kerja ---------- */
    const unitName = useMemo(() => {
        const map = new Map<string, string>();
        (unitKerjas || []).forEach((u: UnitKerja) => map.set(String(u.id_unit_kerja), u.nama));
        return map;
    }, [unitKerjas]);

    /* ---------- Normalisasi data SEKALI ---------- */
    const rows = useMemo<Row[]>(
        () =>
            (data as Modul[]).map((m) => {
                const produsenId = String(m.DeskripsiMateriPelatihan ?? "");
                const produsen = unitName.get(produsenId) || "Tidak diketahui";
                const year = (m.Tahun || "").trim() || OTHER;
                const cluster = (m.BidangMateriPelatihan || "").trim() || OTHER;
                return {
                    m,
                    year,
                    cluster,
                    produsen,
                    files: Array.isArray(m.ModulPelatihan) ? m.ModulPelatihan.length : 0,
                    verified: m.IsVerified === "Verified",
                    canEdit: session.isSuperAdmin || (!!session.idUnitKerja && produsenId === session.idUnitKerja),
                    haystack: [m.NamaMateriPelatihan, m.BidangMateriPelatihan, produsen, m.Tahun, m.IdMateriPelatihan].filter(Boolean).join(" ").toLowerCase(),
                };
            }),
        [data, unitName, session]
    );

    const options = useMemo(() => {
        const bidang = new Set<string>(), tahun = new Set<string>(), produsen = new Set<string>();
        rows.forEach((r) => {
            bidang.add(r.cluster);
            tahun.add(r.year);
            if (r.m.DeskripsiMateriPelatihan) produsen.add(String(r.m.DeskripsiMateriPelatihan));
        });
        return {
            bidang: Array.from(bidang).sort(byName),
            tahun: Array.from(tahun).sort(byYearDesc),
            // hanya unit kerja yang benar-benar punya modul
            produsen: Array.from(produsen)
                .map((id) => ({ id, nama: unitName.get(id) || `Unit #${id}` }))
                .sort((a, b) => a.nama.localeCompare(b.nama)),
        };
    }, [rows, unitName]);

    /* ---------- Filter + grouping + ringkasan (1 loop) ---------- */
    const { filtered, tree, summary } = useMemo(() => {
        const out: Row[] = [];
        const groups = new Map<string, Map<string, Row[]>>();
        let baseCount = 0, verified = 0, files = 0, tanpaFile = 0;

        for (const r of rows) {
            if (filterBidang && r.cluster !== filterBidang) continue;
            if (filterTahun && r.year !== filterTahun) continue;
            if (filterProdusen && String(r.m.DeskripsiMateriPelatihan ?? "") !== filterProdusen) continue;
            if (q && !r.haystack.includes(q)) continue;

            // Ringkasan kartu dihitung sebelum filter status/lampiran → angka tetap stabil saat kartu diklik
            baseCount++;
            if (r.verified) verified++;
            files += r.files;
            if (r.files === 0) tanpaFile++;

            if (filterVerified === "verified" && !r.verified) continue;
            if (filterVerified === "draft" && r.verified) continue;
            if (onlyNoFile && r.files > 0) continue;

            out.push(r);
            if (!groups.has(r.year)) groups.set(r.year, new Map());
            const g = groups.get(r.year)!;
            if (!g.has(r.cluster)) g.set(r.cluster, []);
            g.get(r.cluster)!.push(r);
        }

        const sortRows = (a: Row, b: Row) => (a.m.NamaMateriPelatihan || "").localeCompare(b.m.NamaMateriPelatihan || "");

        const treeArr = Array.from(groups.entries())
            .sort(([a], [b]) => byYearDesc(a, b))
            .map(([year, clusters]) => {
                const cl = Array.from(clusters.entries())
                    .sort(([a], [b]) => byName(a, b))
                    .map(([name, items]) => ({
                        name,
                        items: items.sort(sortRows),
                        verified: items.filter((i) => i.verified).length,
                    }));
                const total = cl.reduce((s, c) => s + c.items.length, 0);
                const ver = cl.reduce((s, c) => s + c.verified, 0);
                return { year, clusters: cl, total, verified: ver };
            });

        out.sort((a, b) => byYearDesc(a.year, b.year) || sortRows(a, b));

        return { filtered: out, tree: treeArr, summary: { total: baseCount, verified, draft: baseCount - verified, files, tanpaFile } };
    }, [rows, filterBidang, filterTahun, filterProdusen, filterVerified, onlyNoFile, q]);

    /* ---------- State folder terbuka ---------- */
    const [openYears, setOpenYears] = useState<Set<string>>(new Set());
    const [openClusters, setOpenClusters] = useState<Set<string>>(new Set());
    const initialized = useRef(false);

    // Default: tahun terbaru terbuka
    useEffect(() => {
        if (initialized.current || tree.length === 0) return;
        initialized.current = true;
        setOpenYears(new Set([tree[0].year]));
    }, [tree]);

    const hasFilter = !!(filterBidang || filterTahun || filterProdusen || filterVerified || onlyNoFile || q);
    // Saat mencari/memfilter, semua folder hasil otomatis terbuka
    const forceOpen = hasFilter;

    const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) =>
        set((prev) => {
            const n = new Set(prev);
            n.has(key) ? n.delete(key) : n.add(key);
            return n;
        });

    const expandAll = () => {
        setOpenYears(new Set(tree.map((t) => t.year)));
        setOpenClusters(new Set(tree.flatMap((t) => t.clusters.map((c) => `${t.year}|${c.name}`))));
    };
    const collapseAll = () => {
        setOpenYears(new Set());
        setOpenClusters(new Set());
    };

    const clearFilters = () => {
        setFilterBidang("");
        setFilterTahun("");
        setFilterProdusen("");
        setFilterVerified("");
        setOnlyNoFile(false);
        setSearch("");
    };

    const chips = [
        filterBidang && { key: "bidang", label: filterBidang, clear: () => setFilterBidang("") },
        filterProdusen && { key: "produsen", label: unitName.get(filterProdusen) || "Produsen", clear: () => setFilterProdusen("") },
        filterVerified && { key: "status", label: filterVerified === "verified" ? "Disahkan" : "Draf", clear: () => setFilterVerified("") },
        onlyNoFile && { key: "nofile", label: "Tanpa lampiran", clear: () => setOnlyNoFile(false) },
    ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

    const initialLoading = (loading || loadingUnitKerja) && data.length === 0;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5 pb-10">
            {/* ─── Statistik (gaya hero) ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="Total Modul"
                            value={summary.total}
                            unit="Modul"
                            sub={filterTahun ? (filterTahun === OTHER ? "tanpa tahun" : `tahun ${filterTahun}`) : "semua tahun"}
                            icon={BookOpen}
                            accent="#3B82F6"
                            active={!filterVerified && !onlyNoFile}
                            onClick={() => {
                                setFilterVerified("");
                                setOnlyNoFile(false);
                            }}
                        />
                        <StatCard
                            label="Disahkan"
                            value={summary.verified}
                            unit="Modul"
                            sub={`${pct(summary.verified, summary.total)}% telah diverifikasi`}
                            icon={BadgeCheck}
                            accent="#10B981"
                            progress={pct(summary.verified, summary.total)}
                            active={filterVerified === "verified"}
                            onClick={() => setFilterVerified(filterVerified === "verified" ? "" : "verified")}
                        />
                        <StatCard
                            label="Draf"
                            value={summary.draft}
                            unit="Modul"
                            sub={summary.draft ? "menunggu pengesahan" : "tidak ada draf"}
                            icon={FilePen}
                            accent="#F59E0B"
                            progress={pct(summary.draft, summary.total)}
                            active={filterVerified === "draft"}
                            onClick={() => setFilterVerified(filterVerified === "draft" ? "" : "draft")}
                        />
                        <StatCard
                            label="Lampiran"
                            value={summary.files}
                            unit="Berkas"
                            sub={summary.tanpaFile ? `${fmt(summary.tanpaFile)} modul belum ada lampiran — klik` : "semua modul berlampiran"}
                            icon={Paperclip}
                            accent="#8B5CF6"
                            active={onlyNoFile}
                            onClick={summary.tanpaFile || onlyNoFile ? () => setOnlyNoFile((v) => !v) : undefined}
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
                        placeholder="Cari judul modul, rumpun, produsen, atau ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-12 w-full h-11 bg-slate-50 border-none dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
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
                    {/* View toggle */}
                    <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800">
                        {[
                            { v: "folder", icon: <FolderTree className="w-4 h-4" />, label: "Folder" },
                            { v: "grid", icon: <LayoutGrid className="w-4 h-4" />, label: "Grid" },
                        ].map((o) => (
                            <button
                                key={o.v}
                                type="button"
                                onClick={() => setView(o.v as "folder" | "grid")}
                                title={`Tampilan ${o.label}`}
                                className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${view === o.v ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {o.icon}
                                <span className="hidden sm:inline">{o.label}</span>
                            </button>
                        ))}
                    </div>

                    <FilterDropdown
                        filterBidang={filterBidang}
                        setFilterBidang={setFilterBidang}
                        bidangOptions={options.bidang}
                        filterProdusen={filterProdusen}
                        setFilterProdusen={setFilterProdusen}
                        produsenOptions={options.produsen}
                        filterVerified={filterVerified}
                        setFilterVerified={setFilterVerified}
                        activeCount={chips.filter((c) => c.key !== "nofile").length}
                        clearFilters={() => {
                            setFilterBidang("");
                            setFilterProdusen("");
                            setFilterVerified("");
                        }}
                    />

                    <ToolbarButton onClick={() => setShowStats((v) => !v)} active={showStats} title="Tampilkan statistik">
                        <PieChart className="w-4 h-4" />
                        <span className="hidden sm:inline">Statistik</span>
                    </ToolbarButton>

                    <ToolbarButton onClick={() => fetchModulPelatihan()} disabled={loading} title="Muat ulang">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </ToolbarButton>

                    {session.isSuperAdmin && <AddModulAction onSuccess={fetchModulPelatihan} />}
                </div>
            </div>

            {/* ─── Statistik (opsional) ──────────────────────────────────── */}
            <div className={`grid transition-[grid-template-rows] duration-300 ${showStats ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">{showStats && <StatsModulPelatihan data={data} stats={stats} />}</div>
            </div>

            {/* ─── Tahun (pill) + chips ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
                    {["", ...options.tahun].map((y) => {
                        const active = filterTahun === y;
                        return (
                            <button
                                key={y || "all"}
                                type="button"
                                onClick={() => setFilterTahun(active && y ? "" : y)}
                                className={`h-8 px-3.5 rounded-full text-[11px] font-bold whitespace-nowrap ring-1 transition-all ${active
                                    ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300"
                                    }`}
                            >
                                {y ? (y === OTHER ? "Tanpa Tahun" : y) : "Semua Tahun"}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {chips.map((c) => (
                        <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold max-w-[220px]">
                            <span className="truncate">{c.label}</span>
                            <button type="button" onClick={c.clear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus filter ${c.label}`}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {hasFilter && (
                        <button type="button" onClick={clearFilters} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 ml-1">
                            Reset semua
                        </button>
                    )}
                    {view === "folder" && tree.length > 0 && !forceOpen && (
                        <div className="flex items-center gap-1 ml-2">
                            <button type="button" onClick={expandAll} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1">
                                <ChevronsUpDown className="w-3.5 h-3.5" /> Buka semua
                            </button>
                            <button type="button" onClick={collapseAll} className="h-8 px-2.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 flex items-center gap-1">
                                <ChevronsDownUp className="w-3.5 h-3.5" /> Tutup semua
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Konten ─────────────────────────────────────────────────── */}
            {initialLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : error && data.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center gap-2 rounded-[2rem] border border-dashed border-rose-200 bg-white dark:bg-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Gagal memuat data modul</p>
                    <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                    <button type="button" onClick={() => fetchModulPelatihan()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4" /> Coba lagi
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center gap-2 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Folder className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{hasFilter ? "Tidak ada modul yang cocok" : "Belum ada modul"}</p>
                    <p className="text-xs text-slate-400">{hasFilter ? "Coba ubah kata kunci atau filter." : "Modul yang diunggah akan tampil di sini."}</p>
                    {hasFilter && (
                        <button type="button" onClick={clearFilters} className="mt-2 h-9 px-4 rounded-xl ring-1 ring-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                            Hapus semua filter
                        </button>
                    )}
                </div>
            ) : view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((r) => (
                        <ModulCard key={r.m.IdMateriPelatihan} row={r} base={base} onSuccess={fetchModulPelatihan} showMeta />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {tree.map((t) => {
                        const yearOpen = forceOpen || openYears.has(t.year);
                        return (
                            <section key={t.year} className="rounded-[1.5rem] bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                                {/* Folder tahun */}
                                <button
                                    type="button"
                                    onClick={() => toggle(setOpenYears, t.year)}
                                    aria-expanded={yearOpen}
                                    className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <div className={`relative isolate overflow-hidden w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${yearOpen ? "bg-[#0B1B3F] text-white shadow-lg shadow-blue-600/25" : "bg-blue-50 text-blue-600 dark:bg-blue-950/40"}`}>
                                        {yearOpen && <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%)]" />}
                                        {yearOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                                {t.year === OTHER ? "Tanpa Tahun" : `Tahun ${t.year}`}
                                            </h3>
                                            <span className="text-[11px] font-bold text-slate-400">{fmt(t.total)} modul · {t.clusters.length} rumpun</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 max-w-sm">
                                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${pct(t.verified, t.total)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 tabular-nums whitespace-nowrap">{pct(t.verified, t.total)}% disahkan</span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${yearOpen ? "rotate-90" : ""}`} />
                                </button>

                                {/* Isi tahun */}
                                <Collapse open={yearOpen}>
                                    <div className="px-4 md:px-5 pb-5 space-y-2">
                                        {t.clusters.map((c) => {
                                            const key = `${t.year}|${c.name}`;
                                            const clOpen = forceOpen || openClusters.has(key);
                                            return (
                                                <div key={key} className="rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggle(setOpenClusters, key)}
                                                        aria-expanded={clOpen}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white dark:hover:bg-slate-800/60 transition-colors"
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${clOpen ? "bg-blue-600 text-white" : "bg-white text-blue-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"}`}>
                                                            <Layers className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{c.name === OTHER ? "Tanpa Rumpun" : c.name}</p>
                                                            <p className="text-[10px] font-semibold text-slate-400">
                                                                {fmt(c.items.length)} modul · <span className="text-emerald-600">{fmt(c.verified)} disahkan</span>
                                                            </p>
                                                        </div>
                                                        <span className="hidden sm:inline-flex h-6 min-w-[28px] px-2 items-center justify-center rounded-full bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-[10px] font-black text-slate-600 tabular-nums">
                                                            {c.items.length}
                                                        </span>
                                                        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${clOpen ? "rotate-90" : ""}`} />
                                                    </button>

                                                    <Collapse open={clOpen}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3 pt-1">
                                                            {c.items.map((r) => (
                                                                <ModulCard key={r.m.IdMateriPelatihan} row={r} base={base} onSuccess={fetchModulPelatihan} />
                                                            ))}
                                                        </div>
                                                    </Collapse>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Collapse>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ============================ KOMPONEN KECIL ============================ */

/** Animasi buka/tutup ringan; isi hanya dirender saat terbuka */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">{open && children}</div>
        </div>
    );
}

function ModulCard({ row, base, onSuccess, showMeta }: { row: Row; base: string; onSuccess: () => void; showMeta?: boolean }) {
    const { m, produsen, files, verified, canEdit } = row;

    return (
        <article className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 transition-all duration-300 hover:ring-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                    <Book className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                <RiVerifiedBadgeFill className="w-3 h-3" /> Disahkan
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                Draf
                            </span>
                        )}
                        {showMeta && (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                                {row.year === OTHER ? "Tanpa Tahun" : row.year} · {row.cluster === OTHER ? "Tanpa Rumpun" : row.cluster}
                            </span>
                        )}
                    </div>
                    <h5 className="text-[13px] font-black text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" title={m.NamaMateriPelatihan}>
                        {m.NamaMateriPelatihan}
                    </h5>
                </div>
                {canEdit && (
                    <div className="shrink-0">
                        <UpdateModulAction onSuccess={onSuccess} materiPelatihan={m} />
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] font-semibold text-slate-500">
                <p className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate" title={produsen}>{produsen}</span>
                </p>
                <p className={`flex items-center gap-1.5 ${files === 0 ? "text-amber-600" : ""}`}>
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    {files === 0 ? "Belum ada lampiran" : `${fmt(files)} berkas lampiran`}
                </p>
            </div>

            <div className="flex-1 min-h-3" />
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 tabular-nums">#{m.IdMateriPelatihan}</span>
                <Link
                    href={`${base}/master/modul/${m.IdMateriPelatihan}`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0B1B3F] text-white text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Buka Modul <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </article>
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

            {/* Cahaya lembut kanan → kiri saat hover / aktif */}
            <div
                className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
                style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
            />

            {/* Ikon besar sebagai background di kanan */}
            <Icon
                aria-hidden
                strokeWidth={1.5}
                className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
                style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
            />

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{fmt(value)}</span>
                <span className="text-[10px] font-bold uppercase text-sky-100/70">{unit}</span>
            </div>

            {progress !== undefined && (
                <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
                </div>
            )}
            {sub && <p className="mt-2 text-[11px] font-medium text-blue-100/60 truncate">{sub}</p>}
        </button>
    );
}

function ToolbarButton({ children, active, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
    return (
        <button
            type="button"
            {...props}
            className={`h-11 px-4 rounded-2xl text-xs font-bold flex items-center gap-2 ring-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${active
                ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                : `bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-transparent hover:ring-slate-200 ${className}`
                }`}
        >
            {children}
        </button>
    );
}

/* ============================ FILTER ============================ */

function FilterSelect({
    label,
    value,
    onChange,
    options,
    allLabel,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    allLabel: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
            <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
                <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-transparent font-semibold text-xs">
                    <SelectValue placeholder={allLabel} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl max-h-64">
                    <SelectItem value="all" className="text-xs font-bold">{allLabel}</SelectItem>
                    {options.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function FilterDropdown({
    filterBidang,
    setFilterBidang,
    bidangOptions,
    filterProdusen,
    setFilterProdusen,
    produsenOptions,
    filterVerified,
    setFilterVerified,
    activeCount,
    clearFilters,
}: {
    filterBidang: string;
    setFilterBidang: (v: string) => void;
    bidangOptions: string[];
    filterProdusen: string;
    setFilterProdusen: (v: string) => void;
    produsenOptions: { id: string; nama: string }[];
    filterVerified: "" | "verified" | "draft";
    setFilterVerified: (v: "" | "verified" | "draft") => void;
    activeCount: number;
    clearFilters: () => void;
}) {
    const active = activeCount > 0;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={`h-11 px-4 rounded-2xl font-bold text-xs flex items-center gap-2 ring-1 transition-all ${active
                        ? "bg-[#0B1B3F] text-white ring-[#0B1B3F] shadow-md shadow-blue-900/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-transparent hover:ring-slate-200"
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                    {active && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-sky-400 text-[#0B1B3F] text-[10px] font-black flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-5 space-y-4 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-none bg-white/95 backdrop-blur-xl" align="end">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Filter Modul</h4>
                    {active && (
                        <button type="button" onClick={clearFilters} className="text-[11px] font-bold text-rose-500 hover:text-rose-600">
                            Reset
                        </button>
                    )}
                </div>

                <FilterSelect
                    label="Rumpun Pelatihan"
                    value={filterBidang}
                    onChange={setFilterBidang}
                    options={bidangOptions.map((b) => ({ value: b, label: b === OTHER ? "Tanpa Rumpun" : b }))}
                    allLabel="Semua Rumpun"
                />

                <FilterSelect
                    label="Produsen"
                    value={filterProdusen}
                    onChange={setFilterProdusen}
                    options={produsenOptions.map((p) => ({ value: p.id, label: p.nama }))}
                    allLabel="Semua Produsen"
                />

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status Pengesahan</label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-50">
                        {[
                            { v: "", label: "Semua" },
                            { v: "verified", label: "Disahkan" },
                            { v: "draft", label: "Draf" },
                        ].map((o) => (
                            <button
                                key={o.v || "all"}
                                type="button"
                                onClick={() => setFilterVerified(o.v as "" | "verified" | "draft")}
                                className={`h-8 rounded-lg text-[11px] font-bold transition-all ${filterVerified === o.v ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

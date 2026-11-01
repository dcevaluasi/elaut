"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
    TbShieldCheck, TbShip, TbSettings, TbFish, TbLeaf, TbGlobe,
    TbAnchor, TbBuildingFactory, TbUsersGroup, TbEngine, TbBook,
} from "react-icons/tb";
import { IconType } from "react-icons";
import {
    Search, X, RefreshCw, Trash2, Layers, BookOpen, BarChart3, AlertTriangle,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, LucideIcon,
} from "lucide-react";

import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { elautBaseUrl } from "@/constants/urls";
import ManageRumpunPelatihanAction from "@/commons/actions/master/rumpun-pelatihan/ManageRumpunPelatihanAction";
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
    AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Toast from "@/commons/Toast";

/* ============================ KONSTANTA & HELPERS ============================ */

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

const toTime = (s?: string) => {
    const t = s ? new Date(s).getTime() : NaN;
    return isNaN(t) ? 0 : t;
};
const formatDate = (s?: string) => {
    const t = toTime(s);
    return t ? new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
};

type SortKey = "id" | "name" | "programs" | "created" | "updated";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 12;

type Rumpun = {
    id_rumpun_pelatihan: number;
    name: string;
    programs?: unknown[];
    created?: string;
    updated?: string;
    [k: string]: unknown;
};

type Row = { r: Rumpun; programCount: number; created: number; updated: number; haystack: string };

/* ============================ PAGE ============================ */

export default function TableRumpunPelatihan() {
    const { data, loading, error, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();
    const [isSuperAdmin] = useState(() => (Cookies.get("Access") || "").includes("superAdmin"));

    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [onlyEmpty, setOnlyEmpty] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    /* ---------- Normalisasi sekali per data ---------- */
    const rows = useMemo<Row[]>(
        () =>
            (Array.isArray(data) ? (data as Rumpun[]) : []).map((r) => ({
                r,
                programCount: Array.isArray(r.programs) ? r.programs.length : 0,
                created: toTime(r.created),
                updated: toTime(r.updated),
                haystack: `${r.name ?? ""} ${r.id_rumpun_pelatihan ?? ""}`.toLowerCase(),
            })),
        [data]
    );

    /* ---------- Statistik (semua data) ---------- */
    const stats = useMemo(() => {
        let programs = 0, empty = 0, max = 0;
        for (const x of rows) {
            programs += x.programCount;
            if (x.programCount === 0) empty++;
            if (x.programCount > max) max = x.programCount;
        }
        return { total: rows.length, programs, empty, max, avg: rows.length ? Math.round((programs / rows.length) * 10) / 10 : 0 };
    }, [rows]);

    /* ---------- Filter + sort ---------- */
    const filtered = useMemo(() => {
        const out = rows.filter((x) => (!q || x.haystack.includes(q)) && (!onlyEmpty || x.programCount === 0));
        const dir = sortDir === "asc" ? 1 : -1;
        const val = (x: Row): number | string =>
            sortKey === "id" ? Number(x.r.id_rumpun_pelatihan) :
                sortKey === "name" ? (x.r.name || "").toLowerCase() :
                    sortKey === "programs" ? x.programCount :
                        sortKey === "created" ? x.created : x.updated;
        return out.sort((a, b) => {
            const va = val(a), vb = val(b);
            return (typeof va === "string" ? va.localeCompare(vb as string) : va - (vb as number)) * dir;
        });
    }, [rows, q, onlyEmpty, sortKey, sortDir]);

    useEffect(() => setPage(1), [q, onlyEmpty, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const fromIdx = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
    const toIdx = Math.min(safePage * PAGE_SIZE, filtered.length);
    const colCount = isSuperAdmin ? 5 : 4;
    const hasFilter = !!search || onlyEmpty;
    const initialLoading = loading && rows.length === 0;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir(key === "programs" || key === "updated" || key === "created" ? "desc" : "asc");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`${elautBaseUrl}/rumpun_pelatihan/delete_rumpun_pelatihan?id=${id}`, {
                method: "DELETE",
                // sebelumnya tanpa token → server menolak (401)
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            await fetchRumpunPelatihan();
            Toast.fire({ icon: "success", title: "Berhasil!", text: `Klaster "${name}" berhasil dihapus.` });
        } catch {
            Toast.fire({ icon: "error", title: "Gagal!", text: "Gagal menghapus klaster pelatihan." });
        } finally {
            setDeletingId(null);
        }
    };

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5 pb-16 w-full">
            {/* ─── Statistik (gaya hero) ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="Total Klaster"
                            value={stats.total}
                            unit="Klaster"
                            sub="rumpun kategori pelatihan"
                            icon={Layers}
                            accent="#3B82F6"
                            active={!onlyEmpty}
                            onClick={() => setOnlyEmpty(false)}
                        />
                        <StatCard label="Total Program" value={stats.programs} unit="Program" sub="terhubung ke klaster" icon={BookOpen} accent="#06B6D4" />
                        <StatCard
                            label="Rata-rata"
                            value={stats.avg}
                            unit="Program / klaster"
                            sub={`terbanyak ${fmt(stats.max)} program`}
                            icon={BarChart3}
                            accent="#8B5CF6"
                        />
                        <StatCard
                            label="Klaster Kosong"
                            value={stats.empty}
                            unit="Klaster"
                            sub={stats.empty ? "belum punya program — klik" : "semua klaster terisi"}
                            icon={AlertTriangle}
                            accent="#F59E0B"
                            progress={pct(stats.empty, stats.total)}
                            active={onlyEmpty}
                            onClick={stats.empty || onlyEmpty ? () => setOnlyEmpty((v) => !v) : undefined}
                        />
                    </>
                )}
            </div>

            {/* ─── Toolbar ────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari nama klaster atau ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 border-none pr-12 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search ? (
                        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400">/</kbd>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fetchRumpunPelatihan()}
                        disabled={loading}
                        title="Muat ulang"
                        className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    {isSuperAdmin && <ManageRumpunPelatihanAction onSuccess={fetchRumpunPelatihan} />}
                </div>
            </div>

            {hasFilter && (
                <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-slate-500">
                    <span className="mr-1">
                        <b className="text-slate-800 dark:text-white tabular-nums">{fmt(filtered.length)}</b> dari {fmt(stats.total)} klaster
                    </span>
                    {onlyEmpty && (
                        <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                            Klaster kosong
                            <button type="button" onClick={() => setOnlyEmpty(false)} className="p-0.5 rounded-full hover:bg-blue-100" aria-label="Hapus filter">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setOnlyEmpty(false);
                        }}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600 ml-1"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* ─── Tabel (minimalis) ──────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                <SortTh label="Klaster" col="name" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-5" />
                                <SortTh label="Program" col="programs" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="w-[220px]" />
                                <SortTh label="Dibuat" col="created" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="w-[130px]" />
                                <SortTh label="Diperbarui" col="updated" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="w-[130px]" />
                                {isSuperAdmin && <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={colCount} className="px-5 py-3">
                                            <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : error && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="py-16">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Gagal memuat data klaster</p>
                                            <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                                            <button type="button" onClick={() => fetchRumpunPelatihan()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5">
                                                <RefreshCw className="w-4 h-4" /> Coba lagi
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="py-16">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Search className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Klaster tidak ditemukan" : "Belum ada klaster"}</p>
                                            <p className="text-xs text-slate-400">{hasFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan klaster melalui tombol di atas."}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((x) => {
                                    const Icon = RUMPUN_ICONS[x.r.name] || TbBook;
                                    const c = colorOf(x.r.name);
                                    const barPct = stats.max ? (x.programCount / stats.max) * 100 : 0;
                                    return (
                                        <tr key={x.r.id_rumpun_pelatihan} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="pl-5 pr-3 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                                                    <div className={`w-9 h-9 rounded-xl ring-1 flex items-center justify-center shrink-0 ${c.soft}`}>
                                                        <Icon className={`w-[18px] h-[18px] ${c.icon}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">{x.r.name}</p>
                                                        <p className="text-[10px] text-slate-400 tabular-nums">ID {x.r.id_rumpun_pelatihan}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3.5">
                                                {x.programCount === 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Belum ada program
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`inline-flex min-w-[78px] justify-center rounded-lg ring-1 px-2 py-0.5 text-[11px] font-bold tabular-nums ${c.soft}`}>
                                                            {fmt(x.programCount)} program
                                                        </span>
                                                        <div className="h-1 flex-1 max-w-[100px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${barPct}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-3 py-3.5 text-xs text-slate-500 tabular-nums whitespace-nowrap">{formatDate(x.r.created)}</td>
                                            <td className="px-3 py-3.5 text-xs text-slate-500 tabular-nums whitespace-nowrap">{formatDate(x.r.updated)}</td>

                                            {isSuperAdmin && (
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <ManageRumpunPelatihanAction onSuccess={fetchRumpunPelatihan} initialData={x.r as any} />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    title="Hapus klaster"
                                                                    disabled={deletingId === x.r.id_rumpun_pelatihan}
                                                                    className="h-9 w-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors disabled:opacity-50"
                                                                >
                                                                    {deletingId === x.r.id_rumpun_pelatihan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-3xl max-w-md">
                                                                <AlertDialogHeader className="space-y-3">
                                                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </div>
                                                                    <AlertDialogTitle className="font-black text-lg text-slate-900">Hapus klaster pelatihan?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-sm text-slate-500">
                                                                        Klaster <b className="text-slate-900">{x.r.name}</b> akan dihapus permanen.
                                                                        {x.programCount > 0 && (
                                                                            <span className="mt-2 flex items-start gap-1.5 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                                                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                                                {fmt(x.programCount)} program masih terhubung ke klaster ini.
                                                                            </span>
                                                                        )}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="mt-4 gap-2">
                                                                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(x.r.id_rumpun_pelatihan, x.r.name)}
                                                                        className="rounded-xl bg-rose-600 hover:bg-rose-700"
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500">
                            <b className="text-slate-800 dark:text-white tabular-nums">{fromIdx}–{toIdx}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
                        </p>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-600 tabular-nums">{safePage} / {totalPages}</span>
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================ UI KECIL ============================ */

function SortTh({
    label,
    col,
    sortKey,
    sortDir,
    onSort,
    className = "",
}: {
    label: string;
    col: SortKey;
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (k: SortKey) => void;
    className?: string;
}) {
    const active = sortKey === col;
    return (
        <th className={`px-3 py-3 font-semibold ${className}`} aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
            <button type="button" onClick={() => onSort(col)} className={`inline-flex items-center gap-1 uppercase tracking-widest transition-colors ${active ? "text-slate-800 dark:text-white" : "hover:text-slate-600"}`}>
                {label}
                <span className="inline-flex flex-col">
                    <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && sortDir === "asc" ? "opacity-100" : "opacity-30"}`} />
                    <ChevronDown className={`w-2.5 h-2.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-30"}`} />
                </span>
            </button>
        </th>
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

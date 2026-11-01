"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
    TbBuildingSkyscraper,
    TbBuildingCommunity,
    TbBuildingCottage,
    TbSearch,
    TbMapPin,
    TbPhone,
    TbTrash,
    TbX,
    TbRefresh,
    TbChevronLeft,
    TbChevronRight,
    TbChevronUp,
    TbChevronDown,
    TbAlertTriangle,
    TbLoader2,
    TbCircleCheck,
} from "react-icons/tb";
import { IconType } from "react-icons";

import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import ManageUnitKerjaAction from "@/commons/actions/unit-kerja/ManageUnitKerjaAction";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ============================ HELPERS ============================ */

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);
const PAGE_SIZES = [10, 25, 50];

/** Format pimpinan: {Nama}{JabatanIndo}{JabatanEng}{Lokasi} */
const parseLeadership = (raw?: string) => {
    if (!raw) return { name: "-", job: "" };
    const parts = raw.match(/\{([^}]+)\}/g)?.map((p) => p.replace(/[{}]/g, ""));
    if (parts && parts.length >= 2) return { name: parts[0], job: parts[1] };
    return { name: raw, job: "" };
};

const TYPE_STYLE: Record<string, { icon: IconType; soft: string; iconCls: string }> = {
    "UPT KKP": { icon: TbBuildingSkyscraper, soft: "bg-blue-50 ring-blue-200 text-blue-700", iconCls: "text-blue-600" },
    "UPT NON KKP": { icon: TbBuildingCommunity, soft: "bg-indigo-50 ring-indigo-200 text-indigo-700", iconCls: "text-indigo-600" },
};
const OTHER_TYPE = { icon: TbBuildingCottage, soft: "bg-emerald-50 ring-emerald-200 text-emerald-700", iconCls: "text-emerald-600" };
const typeStyle = (t?: string) => TYPE_STYLE[t || ""] ?? OTHER_TYPE;

const isActive = (s?: string) => (s || "").toLowerCase() === "active" || (s || "").toLowerCase() === "aktif";

type Row = { u: UnitKerja; leader: { name: string; job: string }; active: boolean; haystack: string };
type SortKey = "nama" | "tipe" | "status";

/* ============================ PAGE ============================ */

const TableDataUnitKerja = () => {
    const { unitKerjas, loading, error, fetchUnitKerjaData } = useFetchDataUnitKerja();

    useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    return <UnitKerjaTable data={unitKerjas || []} loading={loading} error={error} fetchData={fetchUnitKerjaData} />;
};

type Props = {
    data: UnitKerja[];
    loading: boolean;
    error?: unknown;
    fetchData: () => unknown;
};

function UnitKerjaTable({ data, loading, error, fetchData }: Props) {
    const [session] = useState(() => {
        const id = Cookies.get("IDUnitKerja") || "";
        return {
            isSuperAdmin: (Cookies.get("Access") || "").includes("superAdmin"),
            // akun UPT hanya melihat unitnya sendiri (0 / 8 = pusat)
            ownUnit: id && id !== "0" && id !== "8" ? id : "",
        };
    });

    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [typeFilter, setTypeFilter] = useState("");
    const [onlyActive, setOnlyActive] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("nama");
    const [sortAsc, setSortAsc] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
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
            data
                .filter((u) => !session.ownUnit || String(u.id_unit_kerja ?? "") === session.ownUnit)
                .map((u) => {
                    const leader = parseLeadership(u.pimpinan);
                    return {
                        u,
                        leader,
                        active: isActive(u.status),
                        haystack: [u.nama, u.tipe, u.alamat, u.call_center, leader.name, leader.job, u.id_unit_kerja].filter(Boolean).join(" ").toLowerCase(),
                    };
                }),
        [data, session.ownUnit]
    );

    /* ---------- Statistik + opsi tipe ---------- */
    const { stats, types } = useMemo(() => {
        const byType = new Map<string, number>();
        let active = 0;
        for (const r of rows) {
            const t = r.u.tipe || "Lainnya";
            byType.set(t, (byType.get(t) || 0) + 1);
            if (r.active) active++;
        }
        return {
            stats: { total: rows.length, kkp: byType.get("UPT KKP") || 0, nonKkp: byType.get("UPT NON KKP") || 0, active },
            types: Array.from(byType.entries()).sort((a, b) => a[0].localeCompare(b[0])),
        };
    }, [rows]);

    /* ---------- Filter + sort ---------- */
    const filtered = useMemo(() => {
        const out = rows.filter(
            (r) =>
                (!q || r.haystack.includes(q)) &&
                (!typeFilter || (r.u.tipe || "Lainnya") === typeFilter) &&
                (!onlyActive || r.active)
        );
        const dir = sortAsc ? 1 : -1;
        return out.sort((a, b) => {
            const va = sortKey === "nama" ? a.u.nama : sortKey === "tipe" ? a.u.tipe : a.u.status;
            const vb = sortKey === "nama" ? b.u.nama : sortKey === "tipe" ? b.u.tipe : b.u.status;
            return (va || "").localeCompare(vb || "") * dir || (a.u.nama || "").localeCompare(b.u.nama || "");
        });
    }, [rows, q, typeFilter, onlyActive, sortKey, sortAsc]);

    useEffect(() => setPage(1), [q, typeFilter, onlyActive, sortKey, sortAsc, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
    const fromIdx = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
    const toIdx = Math.min(safePage * pageSize, filtered.length);
    const hasFilter = !!search || !!typeFilter || onlyActive;
    const initialLoading = loading && data.length === 0;

    const sortBy = (k: SortKey) => {
        if (sortKey === k) setSortAsc((v) => !v);
        else {
            setSortKey(k);
            setSortAsc(true);
        }
    };

    const clearAll = () => {
        setSearch("");
        setTypeFilter("");
        setOnlyActive(false);
    };

    const handleDelete = async (u: UnitKerja) => {
        setDeletingId(u.id_unit_kerja);
        try {
            const res = await fetch(`${elautBaseUrl}/unit-kerja/deleteUnitKerja?id=${u.id_unit_kerja}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}`, "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            await fetchData();
            Toast.fire({ icon: "success", title: "Berhasil!", text: `Unit "${u.nama}" berhasil dihapus.` });
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal!", text: "Gagal menghapus unit kerja." });
        } finally {
            setDeletingId(null);
        }
    };

    const colCount = 6;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5 pb-20 mt-4">
            {/* ─── Statistik (gaya hero) ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard
                            label="Total Unit Kerja"
                            value={stats.total}
                            unit="Unit"
                            sub={session.ownUnit ? "unit kerja Anda" : "terdaftar di sistem"}
                            icon={TbBuildingSkyscraper}
                            accent="#3B82F6"
                            active={!typeFilter && !onlyActive}
                            onClick={() => {
                                setTypeFilter("");
                                setOnlyActive(false);
                            }}
                        />
                        <StatCard
                            label="UPT KKP"
                            value={stats.kkp}
                            unit="Unit"
                            sub={`${pct(stats.kkp, stats.total)}% dari total`}
                            icon={TbBuildingSkyscraper}
                            accent="#0EA5E9"
                            progress={pct(stats.kkp, stats.total)}
                            active={typeFilter === "UPT KKP"}
                            onClick={() => setTypeFilter(typeFilter === "UPT KKP" ? "" : "UPT KKP")}
                        />
                        <StatCard
                            label="UPT Non KKP"
                            value={stats.nonKkp}
                            unit="Unit"
                            sub={`${pct(stats.nonKkp, stats.total)}% dari total`}
                            icon={TbBuildingCommunity}
                            accent="#6366F1"
                            progress={pct(stats.nonKkp, stats.total)}
                            active={typeFilter === "UPT NON KKP"}
                            onClick={() => setTypeFilter(typeFilter === "UPT NON KKP" ? "" : "UPT NON KKP")}
                        />
                        <StatCard
                            label="Status Aktif"
                            value={stats.active}
                            unit="Unit"
                            sub={stats.total - stats.active ? `${fmt(stats.total - stats.active)} tidak aktif` : "semua aktif"}
                            icon={TbCircleCheck}
                            accent="#10B981"
                            progress={pct(stats.active, stats.total)}
                            active={onlyActive}
                            onClick={() => setOnlyActive((v) => !v)}
                        />
                    </>
                )}
            </div>

            {/* ─── Toolbar ────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
                <div className="relative flex-1 group">
                    <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Cari nama unit, alamat, kontak, atau pimpinan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-12 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {search ? (
                        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                            <TbX className="w-4 h-4" />
                        </button>
                    ) : (
                        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-400">/</kbd>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
                        <SelectTrigger className={`h-11 w-[170px] rounded-2xl border-0 text-xs font-bold ${typeFilter ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800"}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all" className="text-xs font-bold">Semua Tipe</SelectItem>
                            {types.map(([t, n]) => (
                                <SelectItem key={t} value={t} className="text-xs">
                                    {t} <span className="text-slate-400">({fmt(n)})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <button
                        type="button"
                        onClick={() => fetchData()}
                        disabled={loading}
                        title="Muat ulang"
                        className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40"
                    >
                        <TbRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    {session.isSuperAdmin && <ManageUnitKerjaAction onSuccess={fetchData} />}
                </div>
            </div>

            {hasFilter && (
                <div className="flex flex-wrap items-center gap-1.5 px-1 text-xs text-slate-500">
                    <span className="mr-1">
                        <b className="text-slate-800 dark:text-white tabular-nums">{fmt(filtered.length)}</b> dari {fmt(stats.total)} unit
                    </span>
                    {typeFilter && <Chip label={typeFilter} onClear={() => setTypeFilter("")} />}
                    {onlyActive && <Chip label="Status aktif" onClear={() => setOnlyActive(false)} />}
                    <button type="button" onClick={clearAll} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 ml-1">
                        Reset semua
                    </button>
                </div>
            )}

            {/* ─── Tabel ──────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                <th className="w-12 pl-5 pr-2 py-3 text-center font-semibold">No</th>
                                <SortTh label="Unit Kerja" active={sortKey === "nama"} asc={sortAsc} onClick={() => sortBy("nama")} className="min-w-[260px]" />
                                <th className="px-3 py-3 font-semibold min-w-[220px]">Alamat & Kontak</th>
                                <th className="px-3 py-3 font-semibold min-w-[200px]">Pimpinan</th>
                                <SortTh label="Status" active={sortKey === "status"} asc={sortAsc} onClick={() => sortBy("status")} />
                                <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={colCount} className="px-5 py-3">
                                            <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : error && data.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="py-16">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                                                <TbAlertTriangle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Gagal memuat data unit kerja</p>
                                            <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                                            <button type="button" onClick={() => fetchData()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold flex items-center gap-1.5">
                                                <TbRefresh className="w-4 h-4" /> Coba lagi
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={colCount} className="py-16">
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <TbSearch className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Unit kerja tidak ditemukan" : "Belum ada unit kerja"}</p>
                                            <p className="text-xs text-slate-400">{hasFilter ? "Coba ubah kata kunci atau filter." : "Tambahkan unit kerja melalui tombol di atas."}</p>
                                            {hasFilter && (
                                                <button type="button" onClick={clearAll} className="mt-2 h-9 px-4 rounded-xl ring-1 ring-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                                                    Hapus semua filter
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map(({ u, leader, active }, i) => {
                                    const t = typeStyle(u.tipe);
                                    const Icon = t.icon;
                                    return (
                                        <tr key={u.id_unit_kerja} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="pl-5 pr-2 py-3.5 text-center text-xs font-medium text-slate-400 tabular-nums align-top">{fmt(fromIdx + i)}</td>

                                            {/* Unit */}
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-9 h-9 rounded-xl ring-1 flex items-center justify-center shrink-0 ${t.soft}`}>
                                                        <Icon className={`w-[18px] h-[18px] ${t.iconCls}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">{u.nama}</p>
                                                        <span className={`mt-1 inline-flex rounded-md ring-1 px-1.5 py-0.5 text-[10px] font-bold ${t.soft}`}>{u.tipe || "Lainnya"}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Alamat & kontak */}
                                            <td className="px-3 py-3.5 align-top">
                                                <p className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 max-w-[280px]">
                                                    <TbMapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                                                    <span className="line-clamp-2" title={u.alamat}>{u.alamat || "Alamat tidak tersedia"}</span>
                                                </p>
                                                {u.call_center ? (
                                                    <a href={`tel:${u.call_center}`} className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600">
                                                        <TbPhone className="w-3.5 h-3.5 text-slate-400" /> {u.call_center}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-300">
                                                        <TbPhone className="w-3.5 h-3.5" /> -
                                                    </p>
                                                )}
                                            </td>

                                            {/* Pimpinan */}
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-start gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                                                        {leader.name !== "-" ? leader.name.trim().charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[220px]" title={leader.name}>{leader.name}</p>
                                                        {leader.job && <p className="text-[11px] text-slate-400 truncate max-w-[220px]" title={leader.job}>{leader.job}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3.5 align-top">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                    {active ? "Aktif" : u.status || "Tidak aktif"}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-3 align-top">
                                                <div className="flex items-center justify-end gap-1">
                                                    <ManageUnitKerjaAction onSuccess={fetchData} unitKerja={u} />
                                                    {session.isSuperAdmin && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    title="Hapus unit kerja"
                                                                    disabled={deletingId === u.id_unit_kerja}
                                                                    className="h-9 w-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors disabled:opacity-50"
                                                                >
                                                                    {deletingId === u.id_unit_kerja ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbTrash className="w-4 h-4" />}
                                                                </button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-3xl max-w-md">
                                                                <AlertDialogHeader className="space-y-3">
                                                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                                                        <TbTrash className="w-5 h-5" />
                                                                    </div>
                                                                    <AlertDialogTitle className="font-black text-lg text-slate-900">Hapus unit kerja?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-sm text-slate-500">
                                                                        Unit <b className="text-slate-900">{u.nama}</b> akan dihapus permanen. Data pelatihan, instruktur, atau modul yang terhubung ke unit ini bisa kehilangan referensi.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter className="mt-4 gap-2">
                                                                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(u)} className="rounded-xl bg-rose-600 hover:bg-rose-700">
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                                <b className="text-slate-800 dark:text-white tabular-nums">{fromIdx}–{toIdx}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
                            </span>
                            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-[88px] rounded-lg text-xs font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {PAGE_SIZES.map((s) => (
                                        <SelectItem key={s} value={String(s)} className="text-xs">{s} / hal</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                                <TbChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-600 tabular-nums">{safePage} / {totalPages}</span>
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                                <TbChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ============================ UI KECIL ============================ */

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
            {label}
            <button type="button" onClick={onClear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus filter ${label}`}>
                <TbX className="w-3 h-3" />
            </button>
        </span>
    );
}

function SortTh({ label, active, asc, onClick, className = "" }: { label: string; active: boolean; asc: boolean; onClick: () => void; className?: string }) {
    return (
        <th className={`px-3 py-3 font-semibold ${className}`} aria-sort={active ? (asc ? "ascending" : "descending") : "none"}>
            <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 uppercase tracking-widest transition-colors ${active ? "text-slate-800 dark:text-white" : "hover:text-slate-600"}`}>
                {label}
                <span className="inline-flex flex-col">
                    <TbChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && asc ? "opacity-100" : "opacity-30"}`} />
                    <TbChevronDown className={`w-2.5 h-2.5 ${active && !asc ? "opacity-100" : "opacity-30"}`} />
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
    icon: IconType;
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

export default TableDataUnitKerja;

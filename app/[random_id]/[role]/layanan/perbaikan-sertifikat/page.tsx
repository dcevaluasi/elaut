"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import Toast from "@/commons/Toast";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { encryptValue } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RiShieldFlashLine } from "react-icons/ri";
import {
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FileText,
    Check,
    X,
    ExternalLink,
    Tag,
    Send,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Loader,
    LucideIcon,
} from "lucide-react";

/* ============================ TYPES ============================ */

export interface PerbaikanSertifikatItem {
    idDoc: string;
    TiketPerbaikan?: string;
    NoSertifikat: string;
    Nama: string;
    IdUsers: number | string;
    IdUserPelatihan: number | string;
    KodePelatihan: string;
    IdPelatihan: number | string;
    NamaPelatihan: string;
    JenisPerbaikan: string;
    PerbaikanSudahTerbit?: string[];
    PerbaikanLainnya?: string;
    PerbaikanSeharusnya: string;
    Status: "Pending" | "Diproses" | "Selesai" | "Ditolak" | string;
    CatatanAdmin?: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

type StatusKey = "Pending" | "Diproses" | "Selesai" | "Ditolak";

/* ============================ KONSTANTA ============================ */

const COLLECTION = "perbaikan-sertifikat";
const PAGE_SIZE = 10;
const STATUSES: StatusKey[] = ["Pending", "Diproses", "Selesai", "Ditolak"];

const STATUS: Record<StatusKey, { icon: LucideIcon; accent: string; dot: string; text: string; soft: string }> = {
    Pending: { icon: Clock, accent: "#F59E0B", dot: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50 ring-amber-200 text-amber-700" },
    Diproses: { icon: Loader, accent: "#3B82F6", dot: "bg-blue-500", text: "text-blue-600", soft: "bg-blue-50 ring-blue-200 text-blue-700" },
    Selesai: { icon: CheckCircle2, accent: "#10B981", dot: "bg-emerald-500", text: "text-emerald-600", soft: "bg-emerald-50 ring-emerald-200 text-emerald-700" },
    Ditolak: { icon: XCircle, accent: "#F43F5E", dot: "bg-rose-500", text: "text-rose-600", soft: "bg-rose-50 ring-rose-200 text-rose-700" },
};

/** Normalisasi status (case-insensitive) → kunci baku; default Pending */
const normStatus = (s?: string): StatusKey => STATUSES.find((k) => k.toLowerCase() === (s || "").trim().toLowerCase()) || "Pending";

const fmt = (n: number) => n.toLocaleString("id-ID");
const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });
const parseDate = (s?: string) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
};
const fmtDate = (s?: string) => {
    const d = parseDate(s);
    return d ? DATE_FMT.format(d) : "-";
};
const fmtTime = (s?: string) => {
    const d = parseDate(s);
    return d ? TIME_FMT.format(d) : "";
};
const ticketOf = (i: PerbaikanSertifikatItem) => i.TiketPerbaikan || i.idDoc.slice(0, 8);

/* ============================ PAGE ============================ */

export default function PerbaikanSertifikatPage() {
    const pathname = usePathname();
    const basePath = pathname?.includes("pusat") ? "pusat" : "lemdiklat";
    const detailHref = useCallback(
        (i: PerbaikanSertifikatItem) =>
            i.KodePelatihan && i.IdPelatihan ? `/admin/${basePath}/pelatihan/detail/${i.KodePelatihan}/${encryptValue(String(i.IdPelatihan))}` : null,
        [basePath]
    );

    /* ---------- Data ---------- */
    const [dataList, setDataList] = useState<PerbaikanSertifikatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1 request saja (tanpa orderBy → tidak butuh index & tidak ada request ganda), urut di client
            const snap = await getDocs(collection(getFirestore(firebaseApp), COLLECTION));
            const list = snap.docs.map((d) => ({ ...(d.data() as PerbaikanSertifikatItem), idDoc: d.id }));
            list.sort((a, b) => (parseDate(b.CreatedAt)?.getTime() || 0) - (parseDate(a.CreatedAt)?.getTime() || 0));
            setDataList(list);
        } catch (e: any) {
            console.error("Error fetching perbaikan-sertifikat:", e);
            setError(e?.message || "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ---------- Normalisasi sekali ---------- */
    const rows = useMemo(
        () =>
            dataList.map((item) => ({
                item,
                status: normStatus(item.Status),
                haystack: `${item.TiketPerbaikan ?? ""} ${item.idDoc} ${item.NoSertifikat ?? ""} ${item.Nama ?? ""} ${item.NamaPelatihan ?? ""} ${item.KodePelatihan ?? ""} ${item.JenisPerbaikan ?? ""}`.toLowerCase(),
            })),
        [dataList]
    );

    const counts = useMemo(() => {
        const c: Record<StatusKey, number> = { Pending: 0, Diproses: 0, Selesai: 0, Ditolak: 0 };
        rows.forEach((r) => c[r.status]++);
        return c;
    }, [rows]);

    /* ---------- Filter ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [statusFilter, setStatusFilter] = useState<StatusKey | "">("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => rows.filter((r) => (!statusFilter || r.status === statusFilter) && (!q || r.haystack.includes(q))), [rows, q, statusFilter]);
    useEffect(() => setPage(1), [q, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const fromIdx = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
    const hasFilter = !!(search || statusFilter);

    // Shortcut "/" fokus ke pencarian
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
                e.preventDefault();
                document.getElementById("search-perbaikan")?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ---------- Modal kelola ---------- */
    const [selected, setSelected] = useState<PerbaikanSertifikatItem | null>(null);
    const [newStatus, setNewStatus] = useState<StatusKey>("Pending");
    const [catatan, setCatatan] = useState("");
    const [saving, setSaving] = useState(false);

    const openManage = (item: PerbaikanSertifikatItem) => {
        setSelected(item);
        setNewStatus(normStatus(item.Status));
        setCatatan(item.CatatanAdmin || "");
    };

    const unchanged = !!selected && normStatus(selected.Status) === newStatus && (selected.CatatanAdmin || "") === catatan.trim();
    const needNote = newStatus === "Ditolak" && !catatan.trim();

    const save = async () => {
        if (!selected || unchanged) return;
        if (needNote) {
            Toast.fire({ icon: "warning", title: "Isi alasan penolakan pada catatan admin" });
            return;
        }
        setSaving(true);
        try {
            const fields = { Status: newStatus, CatatanAdmin: catatan.trim(), UpdatedAt: new Date().toISOString() };
            await setDoc(doc(getFirestore(firebaseApp), COLLECTION, selected.idDoc), fields, { merge: true });
            setDataList((prev) => prev.map((i) => (i.idDoc === selected.idDoc ? { ...i, ...fields } : i)));
            Toast.fire({ icon: "success", title: `Tiket #${ticketOf(selected)} → ${newStatus}` });
            setSelected(null);
        } catch (e) {
            console.error("Error updating status:", e);
            Toast.fire({ icon: "error", title: "Gagal memperbarui status, coba lagi" });
        } finally {
            setSaving(false);
        }
    };

    const initialLoading = loading && dataList.length === 0;
    const selesaiPct = rows.length ? (counts.Selesai / rows.length) * 100 : 0;

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-5">
                <HeaderPageLayoutAdminElaut
                    title="Layanan Perbaikan Sertifikat"
                    description="Kelola dan proses pengajuan perbaikan data sertifikat elektronik peserta pelatihan E-LAUT."
                    icon={<RiShieldFlashLine className="text-3xl" />}
                />

                {/* ---------- Stats ---------- */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                    {initialLoading ? (
                        [0, 1, 2, 3, 4].map((i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                    ) : (
                        <>
                            <StatCard
                                label="Total Pengajuan"
                                value={fmt(rows.length)}
                                unit="Tiket"
                                sub={`${selesaiPct.toFixed(0)}% telah selesai`}
                                icon={FileText}
                                accent="#6366F1"
                                progress={selesaiPct}
                                active={!statusFilter}
                                onClick={() => setStatusFilter("")}
                                className="col-span-2 lg:col-span-1"
                            />
                            {STATUSES.map((s) => (
                                <StatCard
                                    key={s}
                                    label={s}
                                    value={fmt(counts[s])}
                                    unit="Tiket"
                                    sub={s === "Pending" ? (counts.Pending ? "perlu ditindaklanjuti" : "tidak ada antrean") : `${rows.length ? ((counts[s] / rows.length) * 100).toFixed(0) : 0}% dari total`}
                                    icon={STATUS[s].icon}
                                    accent={STATUS[s].accent}
                                    active={statusFilter === s}
                                    onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* ---------- Toolbar ---------- */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm space-y-2.5">
                    <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                            <input
                                id="search-perbaikan"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari tiket, no. STTPL, nama, pelatihan..."
                                className="pl-11 border-none pr-16 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {search ? (
                                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                                    <X className="w-4 h-4" />
                                </button>
                            ) : (
                                <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-[10px] font-bold text-slate-400">/</kbd>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide max-w-full">
                                {(["", ...STATUSES] as (StatusKey | "")[]).map((s) => (
                                    <button
                                        key={s || "all"}
                                        type="button"
                                        onClick={() => setStatusFilter(s)}
                                        className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${statusFilter === s ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                                    >
                                        {s || "Semua"} <span className="opacity-60 tabular-nums">{s ? counts[s] : rows.length}</span>
                                    </button>
                                ))}
                            </div>
                            <button type="button" onClick={fetchData} disabled={loading} title="Muat ulang" className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>
                    {hasFilter && (
                        <div className="flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
                            {search && <Chip label={`"${search}"`} onClear={() => setSearch("")} />}
                            {statusFilter && <Chip label={`Status: ${statusFilter}`} onClear={() => setStatusFilter("")} />}
                            <button type="button" onClick={() => { setSearch(""); setStatusFilter(""); }} className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 px-1">
                                Reset semua
                            </button>
                            <span className="ml-auto text-[11px] text-slate-400"><b className="text-slate-700 tabular-nums">{fmt(filtered.length)}</b> hasil</span>
                        </div>
                    )}
                </div>

                {/* ---------- Tabel ---------- */}
                <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                    <th className="w-12 pl-5 pr-2 py-3 text-center font-semibold">No</th>
                                    <th className="px-3 py-3 font-semibold w-[140px]">Tiket</th>
                                    <th className="px-3 py-3 font-semibold min-w-[200px]">Peserta</th>
                                    <th className="px-3 py-3 font-semibold min-w-[240px]">Pelatihan</th>
                                    <th className="px-3 py-3 font-semibold min-w-[220px]">Perbaikan</th>
                                    <th className="px-3 py-3 font-semibold w-[120px]">Status</th>
                                    <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {initialLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={7} className="px-5 py-3">
                                                <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : error && dataList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">Gagal memuat data</p>
                                                <p className="text-xs text-slate-400 max-w-sm">{error}</p>
                                                <button type="button" onClick={fetchData} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold">Coba lagi</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Pengajuan tidak ditemukan" : "Belum ada pengajuan perbaikan"}</p>
                                                {hasFilter && (
                                                    <button type="button" onClick={() => { setSearch(""); setStatusFilter(""); }} className="text-xs font-semibold text-blue-600 hover:underline">
                                                        Reset filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map(({ item, status }, i) => {
                                        const href = detailHref(item);
                                        return (
                                            <tr key={item.idDoc} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{fromIdx + i}</td>
                                                <td className="px-3 py-3.5 align-top">
                                                    <p className="font-mono text-xs font-bold text-blue-600">#{ticketOf(item)}</p>
                                                    <p className="text-[11px] text-slate-400 tabular-nums">{fmtDate(item.CreatedAt)} {fmtTime(item.CreatedAt)}</p>
                                                </td>
                                                <td className="px-3 py-3.5 align-top">
                                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{item.Nama || "-"}</p>
                                                    <p className="font-mono text-[11px] text-slate-400">{item.NoSertifikat || "-"}</p>
                                                </td>
                                                <td className="px-3 py-3.5 align-top max-w-xs">
                                                    {href ? (
                                                        <Link href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600" title="Buka detail pelatihan">
                                                            <span className="line-clamp-2">{item.NamaPelatihan}</span>
                                                            <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    ) : (
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.NamaPelatihan || "-"}</p>
                                                    )}
                                                    {item.KodePelatihan && <p className="font-mono text-[10px] text-slate-400">{item.KodePelatihan}</p>}
                                                </td>
                                                <td className="px-3 py-3.5 align-top max-w-xs">
                                                    <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                                        <Tag className="w-3 h-3 text-slate-400" /> {item.JenisPerbaikan || "-"}
                                                    </p>
                                                    {!!item.PerbaikanSudahTerbit?.length && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {item.PerbaikanSudahTerbit.slice(0, 3).map((t) => (
                                                                <span key={t} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">{t}</span>
                                                            ))}
                                                            {item.PerbaikanSudahTerbit.length > 3 && <span className="text-[10px] text-slate-400">+{item.PerbaikanSudahTerbit.length - 3}</span>}
                                                        </div>
                                                    )}
                                                    {item.PerbaikanLainnya && <p className="mt-1 text-[11px] text-slate-400 italic line-clamp-1">&ldquo;{item.PerbaikanLainnya}&rdquo;</p>}
                                                </td>
                                                <td className="px-3 py-3.5 align-top">
                                                    <StatusPill s={status} />
                                                    {item.UpdatedAt && <p className="mt-1 text-[10px] text-slate-400">diubah {fmtDate(item.UpdatedAt)}</p>}
                                                </td>
                                                <td className="px-5 py-3 align-top text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openManage(item)}
                                                        className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${status === "Pending" ? "bg-[#0B1B3F] text-white hover:bg-blue-700" : "ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"}`}
                                                    >
                                                        {status === "Pending" ? "Proses" : "Kelola"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ---------- Pagination ---------- */}
                {filtered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                        <span>
                            <b className="text-slate-800 dark:text-white tabular-nums">{fromIdx}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
                        </span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-semibold tabular-nums">{safePage} / {totalPages}</span>
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------- Dialog kelola ---------- */}
                <Dialog open={!!selected} onOpenChange={(o) => !o && !saving && setSelected(null)}>
                    <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-2xl">
                        {selected && (
                            <>
                                {/* Header hero */}
                                <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-6 py-5">
                                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
                                    <DialogHeader className="text-left space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Kelola Perbaikan · #{ticketOf(selected)}</p>
                                        <DialogTitle className="text-lg font-black text-white">{selected.Nama}</DialogTitle>
                                        <DialogDescription className="text-xs text-blue-100/70">
                                            <span className="font-mono">{selected.NoSertifikat}</span> · diajukan {fmtDate(selected.CreatedAt)} {fmtTime(selected.CreatedAt)}
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-5 text-xs">
                                    {/* Detail */}
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                        <div className="sm:col-span-2">
                                            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pelatihan</dt>
                                            <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                                                {detailHref(selected) ? (
                                                    <Link href={detailHref(selected)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blue-600">
                                                        {selected.NamaPelatihan} <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                ) : (
                                                    selected.NamaPelatihan || "-"
                                                )}
                                                {selected.KodePelatihan && <span className="ml-2 font-mono text-[10px] text-slate-400">{selected.KodePelatihan}</span>}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Jenis perbaikan</dt>
                                            <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">{selected.JenisPerbaikan || "-"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Status saat ini</dt>
                                            <dd className="mt-1"><StatusPill s={normStatus(selected.Status)} /></dd>
                                        </div>
                                        {!!selected.PerbaikanSudahTerbit?.length && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Bagian yang salah</dt>
                                                <dd className="mt-1 flex flex-wrap gap-1">
                                                    {selected.PerbaikanSudahTerbit.map((t) => (
                                                        <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">{t}</span>
                                                    ))}
                                                </dd>
                                            </div>
                                        )}
                                        {selected.PerbaikanLainnya && (
                                            <div className="sm:col-span-2">
                                                <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Lainnya</dt>
                                                <dd className="mt-0.5 text-slate-700 dark:text-slate-300">{selected.PerbaikanLainnya}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Perbaikan seharusnya (dari peserta)</p>
                                        <blockquote className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 border-l-4 border-blue-500 whitespace-pre-line">
                                            {selected.PerbaikanSeharusnya || <span className="text-slate-400">-</span>}
                                        </blockquote>
                                    </div>

                                    {/* Pilih status */}
                                    <div>
                                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                            Status baru <span className="text-rose-500">*</span>
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {STATUSES.map((s) => {
                                                const active = newStatus === s;
                                                const Icon = STATUS[s].icon;
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => setNewStatus(s)}
                                                        className={`h-11 px-3 rounded-xl ring-1 text-xs font-bold flex items-center justify-between gap-2 transition-all ${active ? `${STATUS[s].soft} ring-2 shadow-sm` : "ring-slate-200 dark:ring-slate-700 text-slate-500 hover:bg-slate-50"}`}
                                                    >
                                                        <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {s}</span>
                                                        {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Catatan */}
                                    <div>
                                        <div className="flex items-baseline justify-between mb-1.5">
                                            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                                Catatan admin {newStatus === "Ditolak" && <span className="text-rose-500">* wajib bila ditolak</span>}
                                            </p>
                                            <span className="text-[10px] text-slate-400 tabular-nums">{catatan.length}/500</span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            maxLength={500}
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            placeholder={newStatus === "Ditolak" ? "Tuliskan alasan penolakan..." : "Contoh: Sertifikat perbaikan telah terbit."}
                                            className={`w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 text-[13px] outline-none focus:ring-2 focus:ring-blue-500/30 resize-none placeholder:text-slate-400 ${needNote ? "ring-rose-300" : "ring-slate-200 dark:ring-slate-700"}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                    <button type="button" onClick={() => setSelected(null)} disabled={saving} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={save}
                                        disabled={saving || unchanged || needNote}
                                        className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {saving ? "Menyimpan…" : unchanged ? "Tidak ada perubahan" : "Simpan Status"}
                                    </button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </LayoutAdminElaut>
    );
}

/* ============================ UI ============================ */

function StatusPill({ s }: { s: StatusKey }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS[s].text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS[s].dot}`} /> {s}
        </span>
    );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-[11px] font-semibold">
            {label}
            <button type="button" onClick={onClear} className="p-0.5 rounded-full hover:bg-blue-100" aria-label={`Hapus ${label}`}>
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

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
    className = "",
}: {
    label: string;
    value: string;
    unit: string;
    sub?: string;
    icon: LucideIcon;
    accent: string;
    progress?: number;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 hover:-translate-y-0.5 ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"} ${className}`}
            style={{ boxShadow: active ? `0 18px 40px -16px ${accent}` : undefined }}
        >
            <div className="absolute inset-0 -z-10 opacity-90" style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }} />
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
                <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{value}</span>
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

"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import getDocument from "@/firebase/firestore/getData";
import addData from "@/firebase/firestore/addData";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { generateTimestamp } from "@/utils/time";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { PengajuanPenetapanP2MKP, P2MKP } from "@/types/p2mkp";
import { HistoryTraining } from "@/types/product";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Trash2,
    Loader2,
    Eye,
    MapPin,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    ShieldCheck,
    Briefcase,
    Gavel,
    X,
    Globe,
    Tag,
    ChevronLeft,
    ChevronRight,
    Phone,
    RefreshCw,
    Calendar,
    ClipboardCheck,
    LucideIcon,
} from "lucide-react";

/* ============================ KONSTANTA & HELPERS ============================ */

type StatusKey = "Diajukan" | "Approved" | "Perbaikan";
const STATUSES: StatusKey[] = ["Diajukan", "Approved", "Perbaikan"];

const STATUS: Record<StatusKey, { icon: LucideIcon; accent: string; dot: string; text: string; label: string }> = {
    Diajukan: { icon: Clock, accent: "#F59E0B", dot: "bg-amber-500", text: "text-amber-600", label: "Diajukan" },
    Approved: { icon: CheckCircle2, accent: "#10B981", dot: "bg-emerald-500", text: "text-emerald-600", label: "Approved" },
    Perbaikan: { icon: AlertCircle, accent: "#F43F5E", dot: "bg-rose-500", text: "text-rose-600", label: "Perbaikan" },
};

const normStatus = (s?: string): StatusKey => {
    const v = (s || "").trim().toLowerCase();
    if (v === "approved") return "Approved";
    if (v === "perbaikan") return "Perbaikan";
    return "Diajukan"; // "", "pending", "diajukan"
};

const KLASIFIKASI_TONE = (k: string) => {
    const v = k.toLowerCase();
    if (v.includes("utama")) return { dot: "bg-violet-500", cls: "bg-violet-50 text-violet-700 ring-violet-200" };
    if (v.includes("madya")) return { dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
    if (v.includes("mula")) return { dot: "bg-blue-500", cls: "bg-blue-50 text-blue-700 ring-blue-200" };
    return { dot: "bg-slate-400", cls: "bg-slate-50 text-slate-700 ring-slate-200" };
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const lc = (s?: string) => (s || "").trim().toLowerCase();
const authHeader = () => ({ Authorization: `Bearer ${Cookies.get("XSRF091")}` });
const uniqSorted = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

/** Ambil waktu dibuat dari field yang tersedia (API bisa beda penamaan) */
const createdOf = (r: any): number => {
    const v = r?.created_at ?? r?.CreatedAt ?? r?.createdAt ?? r?.tanggal_pengajuan ?? r?.updated_at;
    if (!v) return 0;
    const t = typeof v === "number" ? v : Date.parse(String(v).replace(" ", "T"));
    return isNaN(t) ? 0 : t;
};
const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const daysAgo = (t: number) => Math.floor((Date.now() - t) / 86_400_000);
const relLabel = (t: number) => {
    const d = daysAgo(t);
    return d <= 0 ? "Hari ini" : d === 1 ? "Kemarin" : d < 7 ? `${d} hari lalu` : DATE_FMT.format(t);
};

type SortKey = "terbaru" | "terlama" | "prioritas";

type Row = {
    raw: PengajuanPenetapanP2MKP;
    master?: P2MKP;
    id: string;
    nama: string;
    nib: string;
    pj: string;
    telp: string;
    kota: string;
    provinsi: string;
    kepemilikan: string;
    klasifikasi: string;
    status: StatusKey;
    isNew: boolean;
    created: number;
    idNum: number;
    haystack: string;
};

/* ============================ COMPONENT ============================ */

const TableDataPenetapanP2MKP = () => {
    const { data: pengajuanData, loading: loadingPengajuan, error: errorPengajuan, fetchPengajuanData } = useFetchDataPengajuanPenetapan();
    const { data: p2mkpData, loading: loadingP2MKP, error: errorP2MKP } = useFetchDataP2MKP();
    const pathname = usePathname();

    const loading = loadingPengajuan || loadingP2MKP;
    const error = (errorPengajuan || errorP2MKP) as unknown;

    /* ---------- Join + normalisasi sekali ---------- */
    const rows: Row[] = useMemo(() => {
        if (!pengajuanData) return [];
        const masterMap = new Map((p2mkpData || []).map((p) => [String(p.IdPpmkp), p]));
        const out: Row[] = [];
        for (const r of pengajuanData) {
            const m = masterMap.get(String(r.id_Ppmkp));
            if (!(r.id_Ppmkp || r.nama_Ppmkp || m)) continue; // pengajuan tanpa lembaga diabaikan
            const anyM = m as any;
            const nama = r.nama_ppmkp || r.nama_Ppmkp || m?.nama_ppmkp || m?.nama_Ppmkp || "P2MKP Terdaftar";
            const nib = m?.nib || "";
            const pj = m?.nama_penanggung_jawab || r.nama_penanggung_jawab || "";
            const kota = (m?.kota || r.kota || "").trim();
            const provinsi = (m?.provinsi || r.provinsi || "").trim();
            const kepemilikan = (m?.status_kepemilikan || "").trim();
            const klasifikasi = (anyM?.klasifikasi || m?.klasiikasi || "").trim();
            out.push({
                raw: r,
                master: m,
                id: String(r.IdPengajuanPenetapanPpmkp),
                nama,
                nib,
                pj,
                telp: m?.no_telp || "",
                kota,
                provinsi,
                kepemilikan,
                klasifikasi,
                status: normStatus(r.status),
                isNew: !m?.status,
                created: createdOf(r),
                idNum: Number(r.IdPengajuanPenetapanPpmkp) || 0,
                haystack: `${nama} ${nib} ${pj} ${kota} ${provinsi} ${kepemilikan} ${klasifikasi}`.toLowerCase(),
            });
        }
        return out;
    }, [pengajuanData, p2mkpData]);

    const counts = useMemo(() => {
        const c: Record<StatusKey, number> = { Diajukan: 0, Approved: 0, Perbaikan: 0 };
        rows.forEach((r) => c[r.status]++);
        return c;
    }, [rows]);

    /* ---------- Filter ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [status, setStatus] = useState<StatusKey | "">("");
    const [kepemilikan, setKepemilikan] = useState("");
    const [klasifikasi, setKlasifikasi] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [kota, setKota] = useState("");
    const [sort, setSort] = useState<SortKey>("terbaru");

    const options = useMemo(
        () => ({
            kepemilikan: uniqSorted(rows.map((r) => r.kepemilikan)),
            klasifikasi: uniqSorted(rows.map((r) => r.klasifikasi)),
            provinsi: uniqSorted(rows.map((r) => r.provinsi)),
        }),
        [rows]
    );
    const kotaOptions = useMemo(() => uniqSorted(rows.filter((r) => !provinsi || lc(r.provinsi) === lc(provinsi)).map((r) => r.kota)), [rows, provinsi]);

    const filtered = useMemo(() => {
        const fk = lc(kepemilikan), fkl = lc(klasifikasi), fp = lc(provinsi), fko = lc(kota);
        const list = rows.filter(
            (r) =>
                (!status || r.status === status) &&
                (!fk || lc(r.kepemilikan) === fk) &&
                (!fkl || lc(r.klasifikasi) === fkl) &&
                (!fp || lc(r.provinsi) === fp) &&
                (!fko || lc(r.kota) === fko) &&
                (!q || r.haystack.includes(q))
        );
        // Terbaru: pakai tanggal dibuat, fallback ID (auto-increment = urutan input)
        const newest = (a: Row, b: Row) => b.created - a.created || b.idNum - a.idNum;
        const order: Record<StatusKey, number> = { Diajukan: 0, Perbaikan: 1, Approved: 2 };
        if (sort === "terlama") list.sort((a, b) => -newest(a, b));
        else if (sort === "prioritas") list.sort((a, b) => order[a.status] - order[b.status] || newest(a, b));
        else list.sort(newest);
        return list;
    }, [rows, q, status, kepemilikan, klasifikasi, provinsi, kota, sort]);

    // 5 pengajuan terbaru (untuk sorotan "baru masuk")
    const latestIds = useMemo(() => {
        const s = [...rows].sort((a, b) => b.created - a.created || b.idNum - a.idNum).slice(0, 5);
        return new Set(s.map((r) => r.id));
    }, [rows]);

    const resetAll = () => {
        setSearch("");
        setStatus("");
        setKepemilikan("");
        setKlasifikasi("");
        setProvinsi("");
        setKota("");
    };
    const hasFilter = !!(search || status || kepemilikan || klasifikasi || provinsi || kota);

    /* ---------- Pagination ---------- */
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    useEffect(() => setPage(1), [q, status, kepemilikan, klasifikasi, provinsi, kota, perPage, sort]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    const pageRows = filtered.slice(start, start + perPage);

    // "/" → fokus pencarian
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
                e.preventDefault();
                document.getElementById("search-penetapan")?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ---------- Hapus ---------- */
    const [toDelete, setToDelete] = useState<Row | null>(null);
    const [deleting, setDeleting] = useState(false);
    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`${elautBaseUrl}/p2mkp/delete_pengjuan_penetapan_p2mkp?id=${toDelete.id}`, { headers: authHeader() });
            Toast.fire({ icon: "success", title: "Pengajuan penetapan dihapus" });
            setToDelete(null);
            fetchPengajuanData();
        } catch (err: any) {
            console.error("Error deleting submission:", err);
            Toast.fire({ icon: "error", title: "Gagal menghapus", text: err?.response?.data?.message || "Terjadi kesalahan." });
        } finally {
            setDeleting(false);
        }
    };

    /* ---------- Review ---------- */
    const [review, setReview] = useState<Row | null>(null);
    const [master, setMaster] = useState<P2MKP | null>(null);
    const [history, setHistory] = useState<HistoryTraining | null>(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [catatan, setCatatan] = useState("");
    const [tahun, setTahun] = useState(String(new Date().getFullYear()));
    const [updating, setUpdating] = useState<StatusKey | null>(null);
    const reqId = useRef(0);

    const openReview = useCallback(async (row: Row) => {
        const my = ++reqId.current; // abaikan respons usang bila user ganti baris cepat
        setReview(row);
        setMaster(row.master || null);
        setHistory(null);
        setCatatan("");
        setTahun(row.raw.tahun_penetapan || String(new Date().getFullYear()));
        setLoadingReview(true);
        const [m, h] = await Promise.allSettled([
            axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_by_id?id=${row.raw.id_Ppmkp}`, { headers: authHeader() }),
            getDocument("historical-training-notes", String(row.raw.id_Ppmkp)),
        ]);
        if (my !== reqId.current) return;
        if (m.status === "fulfilled") setMaster(m.value.data?.data || row.master || null);
        else Toast.fire({ icon: "error", title: "Gagal memuat data master lembaga" });
        if (h.status === "fulfilled") setHistory((h.value as any)?.data as HistoryTraining);
        setLoadingReview(false);
    }, []);

    const submitReview = async (next: "Approved" | "Perbaikan") => {
        if (!review || !catatan.trim()) return;
        if (!/^\d{4}$/.test(tahun.trim())) {
            Toast.fire({ icon: "warning", title: "Tahun penetapan harus 4 digit" });
            return;
        }
        setUpdating(next);
        try {
            await axios.put(
                `${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${review.id}`,
                { status: next, tahun_penetapan: tahun.trim() },
                { headers: authHeader() }
            );

            const idPpmkp = String(review.raw.id_Ppmkp);
            const snap = await getDoc(doc(getFirestore(firebaseApp), "historical-training-notes", idPpmkp));
            const existing = snap.exists() ? snap.data().historical || [] : [];
            await addData("historical-training-notes", idPpmkp, {
                historical: [
                    ...existing,
                    {
                        created_at: generateTimestamp(),
                        id: idPpmkp,
                        notes: catatan.trim(),
                        role: Cookies.get("Role") || "Pusat",
                        upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker") || "Pusat"}`,
                    },
                ],
                status: "Done",
            });

            Toast.fire({ icon: "success", title: next === "Approved" ? "Pengajuan disetujui" : "Dikembalikan untuk perbaikan" });
            setReview(null);
            fetchPengajuanData();
        } catch (err: any) {
            console.error("Error updating status:", err);
            Toast.fire({ icon: "error", title: "Gagal memperbarui", text: err?.response?.data?.message || "Terjadi kesalahan sistem." });
        } finally {
            setUpdating(null);
        }
    };

    const initialLoading = loading && rows.length === 0;
    const approvedPct = rows.length ? (counts.Approved / rows.length) * 100 : 0;

    /* ============================ RENDER ============================ */

    return (
        <div className="space-y-5 pb-10 mt-6">
            {/* ---------- Stats ---------- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    [0, 1, 2, 3].map((i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                ) : (
                    <>
                        <StatCard label="Total Pengajuan" value={fmt(rows.length)} unit="Lembaga" sub={`${approvedPct.toFixed(0)}% telah ditetapkan`} icon={Gavel} accent="#3B82F6" progress={approvedPct} active={!status} onClick={() => setStatus("")} />
                        <StatCard label="Menunggu Review" value={fmt(counts.Diajukan)} unit="Pengajuan" sub={counts.Diajukan ? "perlu ditindaklanjuti" : "tidak ada antrean"} icon={Clock} accent={STATUS.Diajukan.accent} active={status === "Diajukan"} onClick={() => setStatus(status === "Diajukan" ? "" : "Diajukan")} />
                        <StatCard label="Approved" value={fmt(counts.Approved)} unit="Lembaga" sub="sertifikat penetapan tersedia" icon={CheckCircle2} accent={STATUS.Approved.accent} active={status === "Approved"} onClick={() => setStatus(status === "Approved" ? "" : "Approved")} />
                        <StatCard label="Perlu Perbaikan" value={fmt(counts.Perbaikan)} unit="Revisi" sub="menunggu perbaikan lembaga" icon={AlertCircle} accent={STATUS.Perbaikan.accent} active={status === "Perbaikan"} onClick={() => setStatus(status === "Perbaikan" ? "" : "Perbaikan")} />
                    </>
                )}
            </div>

            {/* ---------- Toolbar ---------- */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm space-y-2.5">
                <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                        <input
                            id="search-penetapan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari lembaga, NIB, penanggung jawab, atau lokasi..."
                            className="pl-11 pr-14 border-none w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
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
                                    onClick={() => setStatus(s)}
                                    className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${status === s ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                                >
                                    {s || "Semua"} <span className="opacity-60 tabular-nums">{s ? counts[s] : rows.length}</span>
                                </button>
                            ))}
                        </div>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            title="Urutkan"
                            className="h-11 shrink-0 border-none rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-600 outline-none hover:ring-1 hover:ring-slate-200"
                        >
                            <option value="terbaru">Terbaru</option>
                            <option value="terlama">Terlama</option>
                            <option value="prioritas">Prioritas status</option>
                        </select>
                        <button type="button" onClick={() => fetchPengajuanData()} disabled={loading} title="Muat ulang" className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <FilterSelect icon={Briefcase} placeholder="Semua kepemilikan" value={kepemilikan} onChange={setKepemilikan} options={options.kepemilikan} />
                    <FilterSelect icon={Tag} placeholder="Semua klasifikasi" value={klasifikasi} onChange={setKlasifikasi} options={options.klasifikasi} />
                    <FilterSelect
                        icon={Globe}
                        placeholder="Semua provinsi"
                        value={provinsi}
                        onChange={(v) => {
                            setProvinsi(v);
                            setKota("");
                        }}
                        options={options.provinsi}
                    />
                    <FilterSelect icon={MapPin} placeholder={provinsi ? "Semua kota/kab" : "Semua kota/kab"} value={kota} onChange={setKota} options={kotaOptions} />
                </div>

                {hasFilter && (
                    <div className="flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
                        {search && <Chip label={`"${search}"`} onClear={() => setSearch("")} />}
                        {status && <Chip label={`Status: ${status}`} onClear={() => setStatus("")} />}
                        {kepemilikan && <Chip label={kepemilikan} onClear={() => setKepemilikan("")} />}
                        {klasifikasi && <Chip label={klasifikasi} onClear={() => setKlasifikasi("")} />}
                        {provinsi && <Chip label={provinsi} onClear={() => { setProvinsi(""); setKota(""); }} />}
                        {kota && <Chip label={kota} onClear={() => setKota("")} />}
                        <button type="button" onClick={resetAll} className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 px-1">
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
                                <th className="px-3 py-3 font-semibold min-w-[260px]">Lembaga P2MKP</th>
                                <th className="px-3 py-3 font-semibold min-w-[170px]">Klasifikasi</th>
                                <th className="px-3 py-3 font-semibold min-w-[190px]">Penanggung Jawab</th>
                                <th className="px-3 py-3 font-semibold w-[150px]">Status</th>
                                <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-3">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : error && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16">
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Gagal memuat data penetapan</p>
                                            <p className="text-xs text-slate-400 max-w-sm">{String((error as any)?.message || error)}</p>
                                            <button type="button" onClick={() => fetchPengajuanData()} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold">Coba lagi</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16">
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Gavel className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Pengajuan tidak ditemukan" : "Belum ada pengajuan penetapan"}</p>
                                            {hasFilter && (
                                                <button type="button" onClick={resetAll} className="text-xs font-semibold text-blue-600 hover:underline">Reset filter</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((r, i) => {
                                    const tone = r.klasifikasi ? KLASIFIKASI_TONE(r.klasifikasi) : null;
                                    return (
                                        <tr key={r.id} className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 ${latestIds.has(r.id) && r.status === "Diajukan" ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}>
                                            <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{start + i + 1}</td>
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-semibold text-slate-400">NIB {r.nib || "—"}</span>
                                                    {latestIds.has(r.id) && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-px rounded-md bg-[#0B1B3F] text-white text-[9px] font-black uppercase">
                                                            <span className="w-1 h-1 rounded-full bg-sky-300 animate-pulse" /> Terbaru
                                                        </span>
                                                    )}
                                                    {r.isNew && <span className="px-1.5 py-px rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100 text-[9px] font-black uppercase">Baru</span>}
                                                </div>
                                                <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{r.nama}</p>
                                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                                    <MapPin className="w-3 h-3 shrink-0" /> {[r.kota, r.provinsi].filter(Boolean).join(", ") || "-"}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                {tone ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ring-1 text-[11px] font-semibold ${tone.cls}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} /> {r.klasifikasi}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-300 italic">Belum ditetapkan</span>
                                                )}
                                                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Briefcase className="w-3 h-3 text-slate-400" /> {r.kepemilikan || "Perorangan"}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-[#0B1B3F] text-sky-100 flex items-center justify-center text-[11px] font-black shrink-0">
                                                        {(r.pj || "P").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{r.pj || "-"}</p>
                                                        {r.telp && (
                                                            <a href={`tel:${r.telp}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600">
                                                                <Phone className="w-3 h-3" /> {r.telp}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                <StatusPill s={r.status} />
                                                {r.created > 0 && <p className="mt-0.5 text-[10px] text-slate-400" title={new Date(r.created).toLocaleString("id-ID")}>Diajukan {relLabel(r.created)}</p>}
                                                <p className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                                                    <span className="inline-flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {r.raw.tahun_penetapan || "-"}</span>
                                                    <span className="inline-flex items-center gap-0.5"><Building2 className="w-3 h-3" /> {r.raw.is_lpk === "Ya" ? "LPK" : "Non-LPK"}</span>
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 align-top">
                                                <div className="flex items-center justify-end gap-1">
                                                    {r.status === "Approved" ? (
                                                        <P2MKPCertificateAction p2mkp={r.raw as unknown as P2MKP} />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openReview(r)}
                                                            className={`h-8 px-3 rounded-lg text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${r.status === "Diajukan" ? "bg-[#0B1B3F] text-white hover:bg-blue-700" : "ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                                        >
                                                            <ClipboardCheck className="w-3.5 h-3.5" /> Review
                                                        </button>
                                                    )}
                                                    <Link href={`${pathname}/${r.id}`} title="Detail" aria-label="Detail" className="h-8 w-8 rounded-lg text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button type="button" onClick={() => setToDelete(r)} title="Hapus" aria-label="Hapus" className="h-8 w-8 rounded-lg text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ---------- Pagination ---------- */}
                {filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                            <span>
                                <b className="text-slate-800 dark:text-white tabular-nums">{start + 1}–{Math.min(start + perPage, filtered.length)}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
                            </span>
                            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 px-2 w-full text-xs border-none font-semibold outline-none ring-1 ring-slate-200 dark:ring-slate-700">
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={n}>{n} / hal</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {pageList(safePage, totalPages).map((p, i) =>
                                p === "…" ? (
                                    <span key={`e${i}`} className="px-1 text-slate-300">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold tabular-nums ${p === safePage ? "bg-[#0B1B3F] text-white" : "hover:bg-slate-100 text-slate-600"}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---------- Dialog Review ---------- */}
            <Dialog open={!!review} onOpenChange={(o) => !o && !updating && setReview(null)}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border-0 bg-white dark:bg-slate-900 shadow-2xl">
                    {review && (
                        <>
                            <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-6 py-5">
                                <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
                                <ShieldCheck aria-hidden strokeWidth={1.5} className="absolute -right-4 -bottom-6 -z-10 w-28 h-28 -rotate-12 text-sky-300 opacity-20" />
                                <DialogHeader className="text-left space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Review Penetapan P2MKP</p>
                                    <DialogTitle className="text-lg font-black text-white leading-snug">{master?.nama_ppmkp || master?.nama_Ppmkp || review.nama}</DialogTitle>
                                    <DialogDescription className="text-xs text-blue-100/70 flex items-center gap-2">
                                        <span className="font-mono">NIB {master?.nib || review.nib || "—"}</span> · <StatusPill s={review.status} light />
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-6 text-xs">
                                {/* Profil lembaga */}
                                {loadingReview && !master ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
                                    </div>
                                ) : (
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                        <Info label="Penanggung jawab" value={master?.nama_penanggung_jawab || review.pj} />
                                        <Info label="Kontak" value={master?.no_telp || review.telp} />
                                        <Info label="Klasifikasi" value={review.klasifikasi || "Belum ditetapkan"} />
                                        <Info label="Kepemilikan" value={review.kepemilikan || "Perorangan"} />
                                        <Info
                                            className="sm:col-span-2"
                                            label="Alamat operasional"
                                            value={[master?.alamat, master?.kelurahan, master?.kecamatan, master?.kota || review.kota, master?.provinsi || review.provinsi, master?.kode_pos].filter(Boolean).join(", ")}
                                        />
                                    </dl>
                                )}

                                {/* Riwayat */}
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                        Riwayat catatan verifikasi
                                        {loadingReview && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </p>
                                    {history?.historical?.length ? (
                                        <ol className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-1.5 space-y-3">
                                            {history.historical.map((h, idx) => (
                                                <li key={idx} className="pl-4 relative">
                                                    <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{h.upt}</p>
                                                        <p className="text-[10px] text-slate-400">{h.created_at}</p>
                                                    </div>
                                                    <p className="mt-0.5 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{h.notes || "-"}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        !loadingReview && <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-[11px] text-slate-400">Belum ada catatan historis untuk lembaga ini</p>
                                    )}
                                </div>

                                {/* Form */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tahun penetapan</label>
                                        <input
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={tahun}
                                            onChange={(e) => setTahun(e.target.value.replace(/\D/g, ""))}
                                            className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-3">
                                        <div className="flex items-baseline justify-between">
                                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                                Evaluasi & rekomendasi <span className="text-rose-500">*</span>
                                            </label>
                                            <span className="text-[10px] text-slate-400">wajib untuk approve / revisi</span>
                                        </div>
                                        <textarea
                                            rows={4}
                                            value={catatan}
                                            onChange={(e) => setCatatan(e.target.value)}
                                            placeholder="Tuliskan evaluasi kelayakan atau alasan perbaikan..."
                                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-[13px] leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/30 resize-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setReview(null)} disabled={!!updating} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitReview("Perbaikan")}
                                    disabled={!!updating || !catatan.trim()}
                                    className="h-11 px-5 rounded-xl ring-1 ring-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {updating === "Perbaikan" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />} Kembalikan untuk Revisi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => submitReview("Approved")}
                                    disabled={!!updating || !catatan.trim()}
                                    className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {updating === "Approved" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ---------- Konfirmasi hapus ---------- */}
            <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && !deleting && setToDelete(null)}>
                <AlertDialogContent className="rounded-3xl max-w-md">
                    <AlertDialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <AlertDialogTitle className="font-black text-lg text-slate-900">Hapus pengajuan?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500">
                            Pengajuan penetapan <b className="text-slate-900">{toDelete?.nama}</b> akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl" disabled={deleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TableDataPenetapanP2MKP;

/* ============================ UI ============================ */

function pageList(cur: number, total: number): (number | "…")[] {
    const out: (number | "…")[] = [];
    for (let p = 1; p <= total; p++) {
        if (p === 1 || p === total || Math.abs(p - cur) <= 1) {
            const prev = out[out.length - 1];
            if (typeof prev === "number" && p - prev > 1) out.push("…");
            out.push(p);
        }
    }
    return out;
}

function StatusPill({ s, light }: { s: StatusKey; light?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${light ? "text-white" : STATUS[s].text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS[s].dot}`} /> {STATUS[s].label}
        </span>
    );
}

function Info({ label, value, className = "" }: { label: string; value?: string; className?: string }) {
    return (
        <div className={className}>
            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</dd>
        </div>
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

function FilterSelect({ icon: Icon, placeholder, value, onChange, options }: { icon: LucideIcon; placeholder: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div className="relative">
            <Icon className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${value ? "text-sky-200" : "text-slate-400"}`} />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!options.length}
                className={`w-full border-none h-10 pl-9 pr-3 rounded-xl text-xs font-semibold outline-none truncate transition-colors disabled:opacity-50 ${value ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}
            >
                <option value="">{placeholder}</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
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
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 hover:-translate-y-0.5 ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
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

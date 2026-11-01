"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { getAllFeedbacks, getAllMaklumatPelayanan, saveMaklumatPelayanan, updateMaklumatPelayanan, deleteMaklumatPelayanan } from "@/utils/feedback";
import { getRegulasi, createRegulasi, updateRegulasi, deleteRegulasi, RegulasiData } from "@/utils/regulasi";
import { getDirectImageUrl } from "@/utils/imageHelper";
import Toast from "@/commons/Toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { IoAlbumsOutline } from "react-icons/io5";
import {
    MessageSquare,
    Star,
    TrendingUp,
    TrendingDown,
    Image as ImageIcon,
    Calendar,
    Building,
    Search,
    X,
    Plus,
    Book,
    Upload,
    Pencil,
    Trash2,
    ExternalLink,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    FileText,
    LucideIcon,
} from "lucide-react";

/* ============================ TYPES ============================ */

interface FeedbackData {
    id: string;
    nama: string;
    asalInstansi: string;
    masukanSaran: string;
    ratings?: Partial<Record<RatingKey, number>>;
    createdAt?: { seconds: number; nanoseconds: number };
}

interface MaklumatPelayanan {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt?: { seconds: number; nanoseconds: number };
}

type RatingKey =
    | "kemudahanAkses"
    | "kemudahanPenggunaan"
    | "kecepatan"
    | "desainTampilan"
    | "kelengkapanFitur"
    | "kejelasanInformasi"
    | "responsifMobile"
    | "kepuasanKeseluruhan";

type RegulasiForm = Omit<RegulasiData, "id" | "created_at" | "updated_at">;

/* ============================ KONSTANTA & HELPERS ============================ */

const RATING_QUESTIONS: { key: RatingKey; label: string }[] = [
    { key: "kemudahanAkses", label: "Kemudahan Akses" },
    { key: "kemudahanPenggunaan", label: "Kemudahan Penggunaan" },
    { key: "kecepatan", label: "Kecepatan" },
    { key: "desainTampilan", label: "Desain & Tampilan" },
    { key: "kelengkapanFitur", label: "Kelengkapan Fitur" },
    { key: "kejelasanInformasi", label: "Kejelasan Informasi" },
    { key: "responsifMobile", label: "Responsif Mobile" },
    { key: "kepuasanKeseluruhan", label: "Kepuasan Keseluruhan" },
];

const KATEGORI_REGULASI = [
    "Undang-Undang",
    "Peraturan Pemerintah",
    "Peraturan Menteri",
    "Keputusan Menteri",
    "Peraturan Kepala Badan",
    "Keputusan Kepala Badan",
    "Peraturan Kepala Pusat",
    "Keputusan Kepala Pusat",
    "Edaran",
];
const STATUS_REGULASI = ["Berlaku", "Dicabut", "Harmonisasi", "Draft"];

const EMPTY_MAKLUMAT = { title: "", description: "", imageUrl: "" };
const EMPTY_REGULASI: RegulasiForm = {
    kategori_regulasi: "",
    tanggal_pengundangan: "",
    tahun: "",
    no_peraturan: "",
    judul: "",
    ruang_lingkup: "",
    sumber: "",
    status: "",
    perubahan_turunan_terkait: "",
    file: "",
};

const PAGE_SIZE = 10;
const fmt = (n: number) => n.toLocaleString("id-ID");

const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const TIME_FMT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });
const toDate = (ts?: { seconds: number }) => (ts?.seconds ? new Date(ts.seconds * 1000) : null);
const fmtDate = (ts?: { seconds: number }) => {
    const d = toDate(ts);
    return d ? DATE_FMT.format(d) : "-";
};
const fmtTime = (ts?: { seconds: number }) => {
    const d = toDate(ts);
    return d ? TIME_FMT.format(d) : "";
};

const avgRating = (r?: FeedbackData["ratings"]) => {
    const v = Object.values(r || {}).filter((x): x is number => typeof x === "number" && x > 0);
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : 0;
};

type Band = "kurang" | "cukup" | "baik" | "sangat";
const bandOf = (r: number): Band | null => (r === 0 ? null : r <= 2.5 ? "kurang" : r <= 3.5 ? "cukup" : r <= 4.5 ? "baik" : "sangat");
const BAND: Record<Band, { label: string; dot: string; text: string }> = {
    kurang: { label: "Kurang", dot: "bg-rose-500", text: "text-rose-600" },
    cukup: { label: "Cukup", dot: "bg-amber-500", text: "text-amber-600" },
    baik: { label: "Baik", dot: "bg-blue-500", text: "text-blue-600" },
    sangat: { label: "Sangat Baik", dot: "bg-emerald-500", text: "text-emerald-600" },
};

const getRegulasiFileUrl = (fileName?: string) => {
    if (!fileName) return "";
    if (fileName.startsWith("http")) return fileName;
    return `https://elaut-bppsdm.kkp.go.id/api-elaut/public/regulasi_pelatihan/${fileName}`;
};

const statusTone = (s?: string) => {
    const v = (s || "Berlaku").toLowerCase();
    if (v === "dicabut") return "bg-rose-500";
    if (v === "draft") return "bg-slate-400";
    if (v === "harmonisasi") return "bg-amber-500";
    return "bg-emerald-500";
};

/* ============================ PAGE ============================ */

type ConfirmState = { title: string; description: React.ReactNode; onConfirm: () => Promise<void> | void } | null;

export default function LayananPage() {
    /* ---------- Data ---------- */
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [maklumatList, setMaklumatList] = useState<MaklumatPelayanan[]>([]);
    const [regulasiList, setRegulasiList] = useState<RegulasiData[]>([]);
    const [loading, setLoading] = useState({ feedback: true, maklumat: true, regulasi: true });

    const fetchFeedbacks = useCallback(async () => {
        setLoading((l) => ({ ...l, feedback: true }));
        try {
            setFeedbacks(((await getAllFeedbacks()) as FeedbackData[]) || []);
        } catch (e) {
            console.error("Error fetching feedbacks:", e);
        } finally {
            setLoading((l) => ({ ...l, feedback: false }));
        }
    }, []);

    const fetchMaklumat = useCallback(async () => {
        setLoading((l) => ({ ...l, maklumat: true }));
        try {
            setMaklumatList(((await getAllMaklumatPelayanan()) as MaklumatPelayanan[]) || []);
        } catch (e) {
            console.error("Error fetching maklumat:", e);
        } finally {
            setLoading((l) => ({ ...l, maklumat: false }));
        }
    }, []);

    const fetchRegulasi = useCallback(async () => {
        setLoading((l) => ({ ...l, regulasi: true }));
        try {
            setRegulasiList((await getRegulasi()) || []);
        } catch (e) {
            console.error("Error fetching regulasi:", e);
        } finally {
            setLoading((l) => ({ ...l, regulasi: false }));
        }
    }, []);

    useEffect(() => {
        // paralel
        fetchFeedbacks();
        fetchMaklumat();
        fetchRegulasi();
    }, [fetchFeedbacks, fetchMaklumat, fetchRegulasi]);

    /* ---------- Konfirmasi global ---------- */
    const [confirm, setConfirm] = useState<ConfirmState>(null);
    const [confirming, setConfirming] = useState(false);

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-2">
                <HeaderPageLayoutAdminElaut
                    title="Layanan & Publikasi"
                    description="Monitoring masukan pengguna, publikasi maklumat pelayanan, dan regulasi pelatihan."
                    icon={<IoAlbumsOutline className="text-3xl" />}
                />

                <Tabs defaultValue="masukan-saran" className="w-full mt-4">
                    <TabBar
                        tabs={[
                            { value: "masukan-saran", label: "Masukan & Saran", sub: "Feedback pengguna", icon: MessageSquare, accent: "#3B82F6", count: feedbacks.length },
                            { value: "maklumat-pelayanan", label: "Maklumat", sub: "Publikasi layanan", icon: ImageIcon, accent: "#06B6D4", count: maklumatList.length },
                            { value: "regulasi", label: "Regulasi", sub: "Hukum & kebijakan", icon: Book, accent: "#8B5CF6", count: regulasiList.length },
                        ]}
                    />

                    <TabsContent value="masukan-saran" className="mt-5 outline-none">
                        <FeedbackTab data={feedbacks} loading={loading.feedback} onRefresh={fetchFeedbacks} />
                    </TabsContent>

                    <TabsContent value="maklumat-pelayanan" className="mt-5 outline-none">
                        <MaklumatTab data={maklumatList} loading={loading.maklumat} onRefresh={fetchMaklumat} onConfirm={setConfirm} />
                    </TabsContent>

                    <TabsContent value="regulasi" className="mt-5 outline-none">
                        <RegulasiTab data={regulasiList} loading={loading.regulasi} onRefresh={fetchRegulasi} onConfirm={setConfirm} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Konfirmasi hapus (pengganti window.confirm) */}
            <AlertDialog open={!!confirm} onOpenChange={(o) => !o && !confirming && setConfirm(null)}>
                <AlertDialogContent className="rounded-3xl max-w-md">
                    <AlertDialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <AlertDialogTitle className="font-black text-lg text-slate-900">{confirm?.title}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500">{confirm?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl" disabled={confirming}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={confirming}
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!confirm) return;
                                setConfirming(true);
                                try {
                                    await confirm.onConfirm();
                                    setConfirm(null);
                                } finally {
                                    setConfirming(false);
                                }
                            }}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700"
                        >
                            {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </LayoutAdminElaut>
    );
}

/* ============================ TAB: MASUKAN & SARAN ============================ */

function FeedbackTab({ data, loading, onRefresh }: { data: FeedbackData[]; loading: boolean; onRefresh: () => void }) {
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [band, setBand] = useState<Band | "">("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<FeedbackData | null>(null);

    // Normalisasi sekali: rata-rata dihitung sekali per item, urut terbaru
    const rows = useMemo(
        () =>
            data
                .map((f) => {
                    const avg = avgRating(f.ratings);
                    return { f, avg, band: bandOf(avg), haystack: `${f.nama ?? ""} ${f.asalInstansi ?? ""} ${f.masukanSaran ?? ""}`.toLowerCase() };
                })
                .sort((a, b) => (b.f.createdAt?.seconds || 0) - (a.f.createdAt?.seconds || 0)),
        [data]
    );

    const stats = useMemo(() => {
        const rated = rows.filter((r) => r.avg > 0).map((r) => r.avg);
        const counts: Record<Band, number> = { kurang: 0, cukup: 0, baik: 0, sangat: 0 };
        rows.forEach((r) => r.band && counts[r.band]++);
        return {
            total: rows.length,
            avg: rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0,
            max: rated.length ? Math.max(...rated) : 0,
            min: rated.length ? Math.min(...rated) : 0, // sebelumnya Infinity bila semua 0
            counts,
        };
    }, [rows]);

    const filtered = useMemo(() => rows.filter((r) => (!q || r.haystack.includes(q)) && (!band || r.band === band)), [rows, q, band]);

    useEffect(() => setPage(1), [q, band]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const fromIdx = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
    const initialLoading = loading && data.length === 0;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {initialLoading ? (
                    <StatSkeletons />
                ) : (
                    <>
                        <StatCard label="Total Masukan" value={fmt(stats.total)} unit="Masukan" sub="dari pengguna E-LAUT" icon={MessageSquare} accent="#3B82F6" active={!band} onClick={() => setBand("")} />
                        <StatCard label="Rata-rata Rating" value={stats.avg.toFixed(1)} unit="/ 5.0" sub={stats.avg ? BAND[bandOf(stats.avg)!].label : "belum ada rating"} icon={Star} accent="#F59E0B" progress={(stats.avg / 5) * 100} />
                        <StatCard label="Rating Tertinggi" value={stats.max.toFixed(1)} unit="/ 5.0" sub={`${fmt(stats.counts.sangat)} masukan sangat baik`} icon={TrendingUp} accent="#10B981" active={band === "sangat"} onClick={() => setBand(band === "sangat" ? "" : "sangat")} />
                        <StatCard label="Rating Terendah" value={stats.min.toFixed(1)} unit="/ 5.0" sub={`${fmt(stats.counts.kurang)} masukan kurang — klik`} icon={TrendingDown} accent="#F43F5E" active={band === "kurang"} onClick={() => setBand(band === "kurang" ? "" : "kurang")} />
                    </>
                )}
            </div>

            <Toolbar search={search} setSearch={setSearch} placeholder="Cari nama, instansi, atau isi masukan..." onRefresh={onRefresh} loading={loading}>
                <Segmented
                    value={band}
                    onChange={(v) => setBand(v as Band | "")}
                    options={[
                        { v: "", label: "Semua" },
                        ...(Object.keys(BAND) as Band[]).map((k) => ({ v: k, label: `${BAND[k].label} (${stats.counts[k]})` })),
                    ]}
                />
            </Toolbar>

            <TableShell>
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        <th className="w-12 pl-5 pr-2 py-3 text-center font-semibold">No</th>
                        <th className="px-3 py-3 font-semibold w-[150px]">Tanggal</th>
                        <th className="px-3 py-3 font-semibold min-w-[200px]">Pengirim</th>
                        <th className="px-3 py-3 font-semibold min-w-[260px]">Masukan</th>
                        <th className="px-3 py-3 font-semibold w-[150px]">Penilaian</th>
                        <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {initialLoading ? (
                        <SkeletonRows cols={6} />
                    ) : pageRows.length === 0 ? (
                        <EmptyRow cols={6} icon={MessageSquare} title={search || band ? "Masukan tidak ditemukan" : "Belum ada masukan"} />
                    ) : (
                        pageRows.map(({ f, avg, band: b }, i) => (
                            <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelected(f)}>
                                <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{fromIdx + i}</td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtDate(f.createdAt)}</p>
                                    <p className="text-[11px] text-slate-400 tabular-nums">{fmtTime(f.createdAt)}</p>
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{f.nama || "-"}</p>
                                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <Building className="w-3 h-3" /> {f.asalInstansi || "-"}
                                    </p>
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-md">{f.masukanSaran || <span className="text-slate-300">Tanpa komentar</span>}</p>
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    {b ? (
                                        <div className="leading-tight">
                                            <p className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-white tabular-nums">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {avg.toFixed(1)}
                                            </p>
                                            <p className={`flex items-center gap-1 text-[11px] font-medium ${BAND[b].text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${BAND[b].dot}`} /> {BAND[b].label}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-300">N/A</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 align-top text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelected(f);
                                        }}
                                        className="h-8 px-3 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </TableShell>
            <Pager page={safePage} totalPages={totalPages} total={filtered.length} onChange={setPage} />

            {selected && <FeedbackModal f={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function FeedbackModal({ f, onClose }: { f: FeedbackData; onClose: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const avg = avgRating(f.ratings);
    const b = bandOf(avg);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header bergaya hero */}
                <div className="relative isolate overflow-hidden bg-[#0B1B3F] text-white px-6 py-5">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Detail Masukan</p>
                            <h2 className="mt-1 text-lg font-black truncate">{f.nama || "-"}</h2>
                            <p className="text-xs text-blue-100/70 flex items-center gap-1">
                                <Building className="w-3.5 h-3.5" /> {f.asalInstansi || "-"} · {fmtDate(f.createdAt)} {fmtTime(f.createdAt)}
                            </p>
                        </div>
                        <button onClick={onClose} className="rounded-xl p-2 text-blue-100/70 hover:bg-white/10 hover:text-white" aria-label="Tutup">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/15 px-3 py-2">
                        <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <span className="text-xl font-black tabular-nums">{avg ? avg.toFixed(1) : "N/A"}</span>
                        <span className="text-xs text-blue-100/70">/ 5.0 {b ? `· ${BAND[b].label}` : ""}</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Masukan & saran</p>
                        <blockquote className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 border-l-4 border-blue-500">
                            {f.masukanSaran || <span className="text-slate-400">Tanpa komentar.</span>}
                        </blockquote>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Skor indikator</p>
                        <div className="space-y-2.5">
                            {RATING_QUESTIONS.map((qq) => {
                                const v = f.ratings?.[qq.key] ?? 0;
                                return (
                                    <div key={qq.key} className="flex items-center gap-3">
                                        <span className="w-44 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">{qq.label}</span>
                                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${(v / 5) * 100}%` }} />
                                        </div>
                                        <span className="w-8 text-right text-xs font-bold tabular-nums text-slate-700 dark:text-slate-200">{v > 0 ? v : "-"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================ TAB: MAKLUMAT ============================ */

function MaklumatTab({
    data,
    loading,
    onRefresh,
    onConfirm,
}: {
    data: MaklumatPelayanan[];
    loading: boolean;
    onRefresh: () => void;
    onConfirm: (c: ConfirmState) => void;
}) {
    const [form, setForm] = useState(EMPTY_MAKLUMAT);
    const [editing, setEditing] = useState<MaklumatPelayanan | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imgError, setImgError] = useState(false);

    const sorted = useMemo(() => [...data].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [data]);

    const open = (m?: MaklumatPelayanan) => {
        setEditing(m || null);
        setForm(m ? { title: m.title, description: m.description, imageUrl: m.imageUrl } : EMPTY_MAKLUMAT);
        setImgError(false);
        setShowForm(true);
    };
    const close = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_MAKLUMAT);
    };

    const valid = form.title.trim() && form.description.trim() && form.imageUrl.trim();

    const save = async () => {
        if (!valid) {
            Toast.fire({ icon: "warning", title: "Lengkapi judul, deskripsi, dan URL gambar" });
            return;
        }
        setSaving(true);
        try {
            const payload = { title: form.title.trim(), description: form.description.trim(), imageUrl: form.imageUrl.trim() };
            if (editing) await updateMaklumatPelayanan(editing.id, payload);
            else await saveMaklumatPelayanan(payload);
            Toast.fire({ icon: "success", title: editing ? "Maklumat diperbarui" : "Maklumat dipublikasikan" });
            close();
            onRefresh();
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal menyimpan maklumat" });
        } finally {
            setSaving(false);
        }
    };

    const remove = (m: MaklumatPelayanan) =>
        onConfirm({
            title: "Hapus maklumat?",
            description: (
                <>
                    Maklumat <b className="text-slate-900">{m.title}</b> akan dihapus dari publikasi.
                </>
            ),
            onConfirm: async () => {
                try {
                    await deleteMaklumatPelayanan(m.id);
                    Toast.fire({ icon: "success", title: "Maklumat dihapus" });
                    onRefresh();
                } catch {
                    Toast.fire({ icon: "error", title: "Gagal menghapus maklumat" });
                }
            },
        });

    const initialLoading = loading && data.length === 0;

    return (
        <div className="space-y-5">
            <SectionBar icon={ImageIcon} title="Maklumat Pelayanan" desc={`${fmt(data.length)} publikasi standar pelayanan`} onRefresh={onRefresh} loading={loading}>
                {!showForm && <PrimaryButton onClick={() => open()} icon={Plus}>Tambah Maklumat</PrimaryButton>}
            </SectionBar>

            {showForm && (
                <FormCard title={editing ? "Ubah Maklumat" : "Maklumat Baru"} onClose={close}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Field label="Judul publikasi" required>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Maklumat Pelayanan Utama" className={inputCls} />
                            </Field>
                            <Field label="Deskripsi" required hint={`${form.description.length} karakter`}>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Isi maklumat secara singkat dan jelas..." className={`${inputCls} h-auto min-h-[120px] py-3`} />
                            </Field>
                            <Field label="URL gambar" required hint="Mendukung link Google Drive / gambar langsung">
                                <input
                                    value={form.imageUrl}
                                    onChange={(e) => {
                                        setForm({ ...form, imageUrl: e.target.value });
                                        setImgError(false);
                                    }}
                                    placeholder="https://..."
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">Pratinjau</span>
                            <div className="flex-1 min-h-[220px] rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-dashed ring-slate-200 dark:ring-slate-700 overflow-hidden flex items-center justify-center">
                                {form.imageUrl && !imgError ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={getDirectImageUrl(form.imageUrl)} alt="Pratinjau" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 text-center px-4">
                                        <ImageIcon className="w-10 h-10 opacity-40" />
                                        <p className="text-xs font-medium">{imgError ? "Gambar tidak dapat dimuat, periksa URL." : "Menunggu URL gambar"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <FormActions onCancel={close} onSave={save} saving={saving} disabled={!valid} label={editing ? "Simpan Perubahan" : "Publikasikan"} />
                </FormCard>
            )}

            {initialLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <EmptyBox icon={ImageIcon} title="Belum ada maklumat dipublikasikan" />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sorted.map((m) => (
                        <article key={m.id} className="group flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm hover:shadow-lg transition-shadow">
                            <div className="relative w-full sm:w-48 h-44 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getDirectImageUrl(m.imageUrl)}
                                    alt={m.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => (e.currentTarget.src = "/illustrations/placeholder.png")}
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-2 p-5">
                                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" /> {fmtDate(m.createdAt)}
                                </p>
                                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">{m.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{m.description}</p>
                                <div className="mt-auto pt-3 flex items-center justify-end gap-1">
                                    <a href={getDirectImageUrl(m.imageUrl)} target="_blank" rel="noreferrer" className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1">
                                        <ExternalLink className="w-3.5 h-3.5" /> Gambar
                                    </a>
                                    <IconBtn title="Ubah" onClick={() => open(m)} icon={Pencil} tone="amber" />
                                    <IconBtn title="Hapus" onClick={() => remove(m)} icon={Trash2} tone="rose" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ============================ TAB: REGULASI ============================ */

function RegulasiTab({
    data,
    loading,
    onRefresh,
    onConfirm,
}: {
    data: RegulasiData[];
    loading: boolean;
    onRefresh: () => void;
    onConfirm: (c: ConfirmState) => void;
}) {
    const [form, setForm] = useState<RegulasiForm>(EMPTY_REGULASI);
    const [editing, setEditing] = useState<RegulasiData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [kategori, setKategori] = useState("");
    const [page, setPage] = useState(1);

    const rows = useMemo(
        () =>
            [...data]
                .sort((a, b) => Number(b.tahun || 0) - Number(a.tahun || 0) || (a.judul || "").localeCompare(b.judul || ""))
                .map((r) => ({ r, haystack: `${r.no_peraturan ?? ""} ${r.judul ?? ""} ${r.kategori_regulasi ?? ""} ${r.tahun ?? ""} ${r.ruang_lingkup ?? ""}`.toLowerCase() })),
        [data]
    );
    const kategoriCounts = useMemo(() => {
        const m = new Map<string, number>();
        data.forEach((r) => r.kategori_regulasi && m.set(r.kategori_regulasi, (m.get(r.kategori_regulasi) || 0) + 1));
        return m;
    }, [data]);

    const filtered = useMemo(() => rows.filter((x) => (!q || x.haystack.includes(q)) && (!kategori || x.r.kategori_regulasi === kategori)), [rows, q, kategori]);
    useEffect(() => setPage(1), [q, kategori]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    const fromIdx = filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;

    const open = (item?: RegulasiData) => {
        setEditing(item || null);
        setForm(
            item
                ? {
                    kategori_regulasi: item.kategori_regulasi || "",
                    tanggal_pengundangan: item.tanggal_pengundangan || "",
                    tahun: item.tahun || "",
                    no_peraturan: item.no_peraturan || "",
                    judul: item.judul || "",
                    ruang_lingkup: item.ruang_lingkup || "",
                    sumber: item.sumber || "",
                    status: item.status || "",
                    perubahan_turunan_terkait: item.perubahan_turunan_terkait || "",
                    file: item.file || "",
                }
                : EMPTY_REGULASI
        );
        setFile(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const close = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_REGULASI);
        setFile(null);
    };

    const set = <K extends keyof RegulasiForm>(k: K, v: RegulasiForm[K]) => setForm((f) => ({ ...f, [k]: v }));
    const valid = form.judul.trim() && form.no_peraturan.trim() && form.kategori_regulasi;

    const save = async () => {
        if (!valid) {
            Toast.fire({ icon: "warning", title: "Lengkapi kategori, nomor, dan judul peraturan" });
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            (Object.keys(form) as (keyof RegulasiForm)[]).forEach((k) => {
                if (k !== "file") fd.append(k, String(form[k] ?? ""));
            });
            if (file) fd.append("file", file);
            else if (form.file) fd.append("file", form.file);

            if (editing?.id) {
                fd.append("id", String(editing.id));
                await updateRegulasi(fd);
            } else {
                await createRegulasi(fd);
            }
            Toast.fire({ icon: "success", title: editing ? "Regulasi diperbarui" : "Regulasi ditambahkan" });
            close();
            onRefresh();
        } catch (e: any) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal menyimpan regulasi", text: e?.message });
        } finally {
            setSaving(false);
        }
    };

    const remove = (item: RegulasiData) =>
        onConfirm({
            title: "Hapus regulasi?",
            description: (
                <>
                    <b className="text-slate-900">{item.no_peraturan}</b> — {item.judul} akan dihapus permanen.
                </>
            ),
            onConfirm: async () => {
                if (!item.id) return;
                try {
                    await deleteRegulasi(item.id);
                    Toast.fire({ icon: "success", title: "Regulasi dihapus" });
                    onRefresh();
                } catch (e: any) {
                    Toast.fire({ icon: "error", title: "Gagal menghapus regulasi", text: e?.message });
                }
            },
        });

    const initialLoading = loading && data.length === 0;

    return (
        <div className="space-y-5">
            <SectionBar icon={Book} title="Regulasi Pelatihan" desc={`${fmt(data.length)} dasar hukum & kebijakan pelatihan`} onRefresh={onRefresh} loading={loading}>
                {!showForm && <PrimaryButton onClick={() => open()} icon={Plus}>Tambah Regulasi</PrimaryButton>}
            </SectionBar>

            {showForm && (
                <FormCard title={editing ? "Ubah Regulasi" : "Regulasi Baru"} onClose={close}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Kategori" required>
                            <select value={form.kategori_regulasi} onChange={(e) => set("kategori_regulasi", e.target.value)} className={inputCls}>
                                <option value="">Pilih kategori</option>
                                {KATEGORI_REGULASI.map((k) => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Nomor peraturan" required>
                            <input value={form.no_peraturan} onChange={(e) => set("no_peraturan", e.target.value)} placeholder="Nomor 12 Tahun 2023" className={inputCls} />
                        </Field>
                        <Field label="Tahun">
                            <input type="number" inputMode="numeric" value={form.tahun} onChange={(e) => set("tahun", e.target.value)} placeholder="2023" className={inputCls} />
                        </Field>
                        <Field label="Judul / tentang" required className="lg:col-span-3">
                            <input value={form.judul} onChange={(e) => set("judul", e.target.value)} placeholder="Judul lengkap peraturan" className={inputCls} />
                        </Field>
                        <Field label="Ruang lingkup" className="lg:col-span-3">
                            <textarea value={form.ruang_lingkup} onChange={(e) => set("ruang_lingkup", e.target.value)} placeholder="Ruang lingkup peraturan..." className={`${inputCls} h-auto min-h-[90px] py-3`} />
                        </Field>
                        <Field label="Tanggal pengundangan">
                            <input type="date" value={form.tanggal_pengundangan} onChange={(e) => set("tanggal_pengundangan", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Status">
                            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                                <option value="">Pilih status</option>
                                {STATUS_REGULASI.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Sumber">
                            <input value={form.sumber} onChange={(e) => set("sumber", e.target.value)} placeholder="LN.2023/No.12" className={inputCls} />
                        </Field>
                        <Field label="Perubahan / turunan terkait" className="lg:col-span-2">
                            <input value={form.perubahan_turunan_terkait} onChange={(e) => set("perubahan_turunan_terkait", e.target.value)} placeholder="Catatan peraturan turunan..." className={inputCls} />
                        </Field>
                        <Field label="File dokumen" hint="PDF / DOC / DOCX">
                            <label htmlFor="upload-regulasi" className={`${inputCls} flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-100`}>
                                <span className="truncate text-slate-500">{file ? file.name : form.file ? "File tersimpan — pilih untuk ganti" : "Pilih dokumen"}</span>
                                <Upload className={`w-4 h-4 shrink-0 ${file || form.file ? "text-emerald-600" : "text-slate-400"}`} />
                            </label>
                            <input id="upload-regulasi" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            {!file && form.file && (
                                <a href={getRegulasiFileUrl(form.file)} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                                    <ExternalLink className="w-3 h-3" /> Lihat dokumen saat ini
                                </a>
                            )}
                        </Field>
                    </div>
                    <FormActions onCancel={close} onSave={save} saving={saving} disabled={!valid} label={editing ? "Simpan Perubahan" : "Simpan Regulasi"} />
                </FormCard>
            )}

            <Toolbar search={search} setSearch={setSearch} placeholder="Cari nomor, judul, kategori, atau tahun..." onRefresh={onRefresh} loading={loading}>
                <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className={`h-11 rounded-2xl px-3 text-xs font-bold outline-none ${kategori ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600"}`}
                >
                    <option value="">Semua kategori</option>
                    {Array.from(kategoriCounts.entries()).map(([k, n]) => (
                        <option key={k} value={k}>{k} ({n})</option>
                    ))}
                </select>
            </Toolbar>

            <TableShell>
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        <th className="w-12 pl-5 pr-2 py-3 text-center font-semibold">No</th>
                        <th className="px-3 py-3 font-semibold min-w-[320px]">Regulasi</th>
                        <th className="px-3 py-3 font-semibold w-[200px]">Kategori</th>
                        <th className="px-3 py-3 font-semibold w-[120px]">Status</th>
                        <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {initialLoading ? (
                        <SkeletonRows cols={5} />
                    ) : pageRows.length === 0 ? (
                        <EmptyRow cols={5} icon={Book} title={search || kategori ? "Regulasi tidak ditemukan" : "Belum ada regulasi"} />
                    ) : (
                        pageRows.map(({ r }, i) => (
                            <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{fromIdx + i}</td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-[11px] font-semibold text-slate-500">{r.no_peraturan}</p>
                                    <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{r.judul}</p>
                                    {r.file ? (
                                        <a href={getRegulasiFileUrl(r.file)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline">
                                            <FileText className="w-3 h-3" /> Lihat dokumen
                                        </a>
                                    ) : (
                                        <p className="mt-1 text-[11px] text-slate-300">Tanpa dokumen</p>
                                    )}
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{r.kategori_regulasi || "-"}</p>
                                    <p className="text-[11px] text-slate-400 tabular-nums">Tahun {r.tahun || "-"}</p>
                                </td>
                                <td className="px-3 py-3.5 align-top">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusTone(r.status)}`} /> {r.status || "Berlaku"}
                                    </span>
                                </td>
                                <td className="px-5 py-3 align-top">
                                    <div className="flex justify-end gap-1">
                                        <IconBtn title="Ubah" onClick={() => open(r)} icon={Pencil} tone="amber" />
                                        <IconBtn title="Hapus" onClick={() => remove(r)} icon={Trash2} tone="rose" />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </TableShell>
            <Pager page={safePage} totalPages={totalPages} total={filtered.length} onChange={setPage} />
        </div>
    );
}

/* ============================ UI BERSAMA ============================ */

const inputCls =
    "w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal";

function TabBar({ tabs }: { tabs: { value: string; label: string; sub: string; icon: LucideIcon; accent: string; count: number }[] }) {
    // Tab bar navy — tab aktif kaca (glassmorphism) + ikon besar di latar, sama dengan DashboardMainView
    return (
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />
            <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="bg-transparent h-auto p-1.5 grid grid-cols-3 gap-1.5 min-w-[520px] w-full">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        return (
                            <TabsTrigger
                                key={t.value}
                                value={t.value}
                                style={{ ["--accent" as string]: t.accent }}
                                className="group relative isolate overflow-hidden justify-start rounded-[1.35rem] py-3 px-4 text-blue-100/70 font-bold ring-1 ring-transparent transition-all duration-300 outline-none
                                    hover:text-white hover:bg-white/[0.06]
                                    focus-visible:ring-2 focus-visible:ring-sky-300/60
                                    data-[state=active]:text-white data-[state=active]:bg-white/[0.12] data-[state=active]:backdrop-blur-xl data-[state=active]:ring-white/25
                                    data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-12px_var(--accent)]"
                            >
                                {/* Glow aksen kanan → kiri */}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-50 group-data-[state=active]:opacity-100"
                                    style={{ background: `linear-gradient(to left, ${t.accent}59 0%, ${t.accent}1f 40%, transparent 80%)` }}
                                />
                                {/* Kilau kaca */}
                                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                                {/* Ikon besar di latar */}
                                <Icon
                                    aria-hidden
                                    strokeWidth={1.5}
                                    className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-[0.08] transition-all duration-500 ease-out group-hover:opacity-20 group-hover:-rotate-6 group-data-[state=active]:opacity-35 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-6"
                                    style={{ color: t.accent, filter: `drop-shadow(0 0 16px ${t.accent}80)` }}
                                />

                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/15 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 group-data-[state=active]:[background:var(--accent)] group-data-[state=active]:shadow-[0_6px_16px_-4px_var(--accent)]">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm tracking-tight whitespace-nowrap flex items-center gap-1.5">
                                            {t.label}
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/10 group-data-[state=active]:bg-white/20 tabular-nums">{fmt(t.count)}</span>
                                        </span>
                                        <span className="hidden sm:block mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-blue-100/45 group-data-[state=active]:text-sky-100/80">{t.sub}</span>
                                    </div>
                                </div>

                                {/* Garis aksen bawah */}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 scale-x-50 transition-all duration-300 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-x-100"
                                    style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }}
                                />
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>
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
            disabled={!onClick}
            className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 ${onClick ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
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

const StatSkeletons = () => (
    <>
        {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
        ))}
    </>
);

function Toolbar({
    search,
    setSearch,
    placeholder,
    onRefresh,
    loading,
    children,
}: {
    search: string;
    setSearch: (v: string) => void;
    placeholder: string;
    onRefresh: () => void;
    loading: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="pl-11 pr-10 w-full h-11 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 placeholder:font-normal"
                />
                {search && (
                    <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200" aria-label="Hapus pencarian">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {children}
                <button type="button" onClick={onRefresh} disabled={loading} title="Muat ulang" className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>
        </div>
    );
}

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
    return (
        <div className="flex items-center p-1 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-x-auto scrollbar-hide max-w-full">
            {options.map((o) => (
                <button
                    key={o.v || "all"}
                    type="button"
                    onClick={() => onChange(o.v)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${value === o.v ? "bg-[#0B1B3F] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function SectionBar({
    icon: Icon,
    title,
    desc,
    onRefresh,
    loading,
    children,
}: {
    icon: LucideIcon;
    title: string;
    desc: string;
    onRefresh: () => void;
    loading: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
                <div className="relative isolate overflow-hidden w-12 h-12 rounded-2xl bg-[#0B1B3F] text-sky-100 flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%)]" />
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-xs text-slate-500">{desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button type="button" onClick={onRefresh} disabled={loading} title="Muat ulang" className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                {children}
            </div>
        </div>
    );
}

function PrimaryButton({ onClick, icon: Icon, children }: { onClick: () => void; icon: LucideIcon; children: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className="h-11 px-5 rounded-2xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 transition-colors">
            <Icon className="w-4 h-4" /> {children}
        </button>
    );
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">{title}</h3>
                <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup form">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-5 md:p-6 space-y-6">{children}</div>
        </div>
    );
}

function FormActions({ onCancel, onSave, saving, disabled, label }: { onCancel: () => void; onSave: () => void; saving: boolean; disabled?: boolean; label: string }) {
    return (
        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onCancel} disabled={saving} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                Batal
            </button>
            <button type="button" onClick={onSave} disabled={saving || disabled} className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {saving ? "Menyimpan…" : label}
            </button>
        </div>
    );
}

function Field({ label, required, hint, className = "", children }: { label: string; required?: boolean; hint?: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-baseline justify-between gap-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
                {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function IconBtn({ title, onClick, icon: Icon, tone }: { title: string; onClick: () => void; icon: LucideIcon; tone: "amber" | "rose" }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`h-8 w-8 rounded-lg text-slate-400 flex items-center justify-center transition-colors ${tone === "amber" ? "hover:bg-amber-50 hover:text-amber-600" : "hover:bg-rose-50 hover:text-rose-600"}`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}

function TableShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1.75rem] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">{children}</table>
            </div>
        </div>
    );
}

const SkeletonRows = ({ cols }: { cols: number }) => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
                <td colSpan={cols} className="px-5 py-3">
                    <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </td>
            </tr>
        ))}
    </>
);

const EmptyRow = ({ cols, icon: Icon, title }: { cols: number; icon: LucideIcon; title: string }) => (
    <tr>
        <td colSpan={cols} className="py-16">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
            </div>
        </td>
    </tr>
);

const EmptyBox = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => (
    <div className="py-16 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</p>
    </div>
);

function Pager({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (p: number) => void }) {
    if (total <= PAGE_SIZE) return null;
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
                <b className="text-slate-800 dark:text-white tabular-nums">{from}–{to}</b> dari <b className="tabular-nums">{fmt(total)}</b>
            </span>
            <div className="flex items-center gap-1">
                <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Sebelumnya">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-semibold tabular-nums">{page} / {totalPages}</span>
                <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="h-8 w-8 rounded-lg hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center" aria-label="Berikutnya">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

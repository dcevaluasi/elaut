"use client";

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { getAllVideoPelatihans, saveVideoPelatihan, updateVideoPelatihan, deleteVideoPelatihan } from "@/utils/videoPelatihan";
import { UPT } from "@/constants/nomenclatures";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import Toast from "@/commons/Toast";
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
    Youtube,
    Search,
    X,
    Plus,
    Calendar,
    PlaySquare,
    MousePointerClick,
    MessageSquare,
    Pencil,
    Trash2,
    Eye,
    RefreshCw,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Flame,
    Building2,
    Layers,
    AlertCircle,
    ExternalLink,
    LucideIcon,
} from "lucide-react";

/* ============================ TYPES ============================ */

interface VideoPelatihanData {
    id: string;
    namaPelatihan: string;
    linkPelatihan: string;
    idPelatihan: string;
    programPelatihan: string;
    jenisProgramPelatihan: string;
    penyelenggara: string;
    videoClicked: number;
    responses: any[];
    descriptionVideo: string;
    createdAt: { seconds: number; nanoseconds: number };
}

type VideoForm = Pick<VideoPelatihanData, "namaPelatihan" | "linkPelatihan" | "idPelatihan" | "programPelatihan" | "jenisProgramPelatihan" | "penyelenggara" | "descriptionVideo">;
type SortKey = "terbaru" | "populer" | "terlama";

/* ============================ HELPERS ============================ */

const EMPTY_FORM: VideoForm = {
    namaPelatihan: "",
    linkPelatihan: "",
    idPelatihan: "",
    programPelatihan: "",
    jenisProgramPelatihan: "",
    penyelenggara: "",
    descriptionVideo: "",
};

const PAGE_SIZE = 10;
const fmt = (n: number) => n.toLocaleString("id-ID");
const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const fmtDate = (ts?: { seconds: number }) => (ts?.seconds ? DATE_FMT.format(new Date(ts.seconds * 1000)) : "-");

const YT_RE = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]{11}).*/;
/** ID YouTube 11 karakter; "" bila tidak valid (sebelumnya mengembalikan URL → thumbnail rusak) */
const ytId = (url?: string) => {
    if (!url) return "";
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
    return url.match(YT_RE)?.[2] || "";
};
const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

/* ============================ PAGE ============================ */

export default function VideoPelatihanAdminPage() {
    /* ---------- Data ---------- */
    const [videos, setVideos] = useState<VideoPelatihanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: dataRumpun } = useFetchDataRumpunPelatihan();

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setVideos(((await getAllVideoPelatihans()) as VideoPelatihanData[]) || []);
        } catch (e: any) {
            console.error("Error fetching videos:", e);
            setError(e?.message || "Gagal memuat video");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    /* ---------- Normalisasi sekali ---------- */
    const rows = useMemo(
        () =>
            videos.map((v) => ({
                v,
                yid: ytId(v.linkPelatihan),
                clicks: v.videoClicked || 0,
                resp: v.responses?.length || 0,
                created: v.createdAt?.seconds || 0,
                haystack: `${v.namaPelatihan ?? ""} ${v.penyelenggara ?? ""} ${v.programPelatihan ?? ""} ${v.jenisProgramPelatihan ?? ""} ${v.descriptionVideo ?? ""}`.toLowerCase(),
            })),
        [videos]
    );

    const stats = useMemo(() => {
        let clicks = 0, resp = 0;
        let top: (typeof rows)[number] | null = null;
        rows.forEach((r) => {
            clicks += r.clicks;
            resp += r.resp;
            if (!top || r.clicks > top.clicks) top = r;
        });
        return { clicks, resp, top: top as (typeof rows)[number] | null };
    }, [rows]);

    const latestIds = useMemo(() => new Set([...rows].sort((a, b) => b.created - a.created).slice(0, 3).map((r) => r.v.id)), [rows]);

    /* ---------- Filter ---------- */
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [penyelenggara, setPenyelenggara] = useState("");
    const [klaster, setKlaster] = useState("");
    const [sort, setSort] = useState<SortKey>("terbaru");
    const [page, setPage] = useState(1);

    const options = useMemo(() => {
        const p = new Set<string>(), k = new Set<string>();
        videos.forEach((v) => {
            if (v.penyelenggara) p.add(v.penyelenggara);
            if (v.jenisProgramPelatihan) k.add(v.jenisProgramPelatihan);
        });
        return { penyelenggara: Array.from(p).sort(), klaster: Array.from(k).sort() };
    }, [videos]);

    const filtered = useMemo(() => {
        const list = rows.filter(
            (r) => (!penyelenggara || r.v.penyelenggara === penyelenggara) && (!klaster || r.v.jenisProgramPelatihan === klaster) && (!q || r.haystack.includes(q))
        );
        if (sort === "populer") list.sort((a, b) => b.clicks - a.clicks || b.created - a.created);
        else if (sort === "terlama") list.sort((a, b) => a.created - b.created);
        else list.sort((a, b) => b.created - a.created);
        return list;
    }, [rows, q, penyelenggara, klaster, sort]);

    useEffect(() => setPage(1), [q, penyelenggara, klaster, sort]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);
    const hasFilter = !!(search || penyelenggara || klaster);
    const resetAll = () => {
        setSearch("");
        setPenyelenggara("");
        setKlaster("");
    };

    // "/" → fokus pencarian
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) {
                e.preventDefault();
                document.getElementById("search-video")?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ---------- Form ---------- */
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<VideoPelatihanData | null>(null);
    const [form, setForm] = useState<VideoForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const rumpunOf = useCallback((name: string) => dataRumpun?.find((r) => (r.name || r.nama_rumpun_pelatihan) === name) || null, [dataRumpun]);
    const selectedRumpun = useMemo(() => (form.jenisProgramPelatihan ? rumpunOf(form.jenisProgramPelatihan) : null), [form.jenisProgramPelatihan, rumpunOf]);
    const formYid = ytId(form.linkPelatihan);

    const openForm = (v?: VideoPelatihanData) => {
        setEditing(v || null);
        setForm(
            v
                ? {
                    namaPelatihan: v.namaPelatihan || "",
                    linkPelatihan: v.linkPelatihan || "",
                    idPelatihan: v.idPelatihan || "",
                    programPelatihan: v.programPelatihan || "",
                    jenisProgramPelatihan: v.jenisProgramPelatihan || "",
                    penyelenggara: v.penyelenggara || "",
                    descriptionVideo: v.descriptionVideo || "",
                }
                : EMPTY_FORM
        );
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_FORM);
    };

    const set = <K extends keyof VideoForm>(k: K, val: VideoForm[K]) => setForm((f) => ({ ...f, [k]: val }));
    const valid = !!form.namaPelatihan.trim() && !!formYid;

    const save = async () => {
        if (!form.namaPelatihan.trim()) return Toast.fire({ icon: "warning", title: "Nama pelatihan wajib diisi" });
        if (!formYid) return Toast.fire({ icon: "warning", title: "Link YouTube tidak valid" });
        setSaving(true);
        try {
            const payload = { ...form, namaPelatihan: form.namaPelatihan.trim(), linkPelatihan: form.linkPelatihan.trim(), idPelatihan: formYid, descriptionVideo: form.descriptionVideo.trim() };
            if (editing) await updateVideoPelatihan(editing.id, payload);
            else await saveVideoPelatihan(payload);
            Toast.fire({ icon: "success", title: editing ? "Video diperbarui" : "Video ditambahkan" });
            closeForm();
            fetchVideos();
        } catch (e) {
            console.error("Error saving video:", e);
            Toast.fire({ icon: "error", title: "Gagal menyimpan video" });
        } finally {
            setSaving(false);
        }
    };

    /* ---------- Hapus & detail ---------- */
    const [toDelete, setToDelete] = useState<VideoPelatihanData | null>(null);
    const [deleting, setDeleting] = useState(false);
    const confirmDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await deleteVideoPelatihan(toDelete.id);
            setVideos((prev) => prev.filter((v) => v.id !== toDelete.id)); // optimis, tanpa refetch
            Toast.fire({ icon: "success", title: "Video dihapus" });
            setToDelete(null);
        } catch (e) {
            console.error("Error deleting video:", e);
            Toast.fire({ icon: "error", title: "Gagal menghapus video" });
        } finally {
            setDeleting(false);
        }
    };

    const [selected, setSelected] = useState<VideoPelatihanData | null>(null);
    useEffect(() => {
        if (!selected) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected]);

    const initialLoading = loading && videos.length === 0;

    /* ============================ RENDER ============================ */

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-5">
                <HeaderPageLayoutAdminElaut title="Manajemen Video Pelatihan" description="Kelola video pelatihan gratis yang tampil di E-LAUT." icon={<Youtube className="text-3xl" />} />

                {/* ---------- Stats ---------- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {initialLoading ? (
                        [0, 1, 2, 3].map((i) => <div key={i} className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />)
                    ) : (
                        <>
                            <StatCard label="Total Video" value={fmt(videos.length)} unit="Video" sub={`${options.penyelenggara.length} penyelenggara`} icon={PlaySquare} accent="#3B82F6" active={sort === "terbaru" && !hasFilter} onClick={() => { resetAll(); setSort("terbaru"); }} />
                            <StatCard label="Total Penayangan" value={fmt(stats.clicks)} unit="Klik" sub={`rata-rata ${videos.length ? fmt(Math.round(stats.clicks / videos.length)) : 0} / video`} icon={MousePointerClick} accent="#F43F5E" active={sort === "populer"} onClick={() => setSort(sort === "populer" ? "terbaru" : "populer")} />
                            <StatCard label="Respons Feedback" value={fmt(stats.resp)} unit="Ulasan" sub="dari penonton video" icon={MessageSquare} accent="#10B981" />
                            <StatCard
                                label="Terpopuler"
                                value={fmt(stats.top?.clicks || 0)}
                                unit="Klik"
                                sub={stats.top?.v.namaPelatihan || "belum ada data"}
                                icon={Flame}
                                accent="#F59E0B"
                                onClick={stats.top ? () => setSelected(stats.top!.v) : undefined}
                            />
                        </>
                    )}
                </div>

                {/* ---------- Form ---------- */}
                {showForm && (
                    <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">{editing ? "Ubah Video" : "Tambah Video Baru"}</h3>
                                <p className="text-xs text-slate-500">Tempel link YouTube, ID & pratinjau terisi otomatis.</p>
                            </div>
                            <button type="button" onClick={closeForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup form">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Nama pelatihan" required className="sm:col-span-2">
                                    <input value={form.namaPelatihan} onChange={(e) => set("namaPelatihan", e.target.value)} placeholder="Contoh: Teknik Pembenihan Lele" className={inputCls} />
                                </Field>
                                <Field label="Link YouTube" required className="sm:col-span-2" hint={form.linkPelatihan && !formYid ? "Link tidak dikenali" : formYid ? `ID: ${formYid}` : undefined} hintTone={form.linkPelatihan && !formYid ? "error" : "ok"}>
                                    <input value={form.linkPelatihan} onChange={(e) => set("linkPelatihan", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={`${inputCls} ${form.linkPelatihan && !formYid ? "ring-rose-300" : ""}`} />
                                </Field>
                                <Field label="Klaster pelatihan">
                                    <select
                                        value={form.jenisProgramPelatihan}
                                        onChange={(e) => setForm((f) => ({ ...f, jenisProgramPelatihan: e.target.value, programPelatihan: "" }))}
                                        className={inputCls}
                                    >
                                        <option value="">Pilih klaster</option>
                                        {dataRumpun?.map((r) => {
                                            const name = r.name || r.nama_rumpun_pelatihan || "";
                                            return <option key={r.id_rumpun_pelatihan} value={name}>{r.nama_rumpun_pelatihan || r.name}</option>;
                                        })}
                                    </select>
                                </Field>
                                <Field label="Program pelatihan">
                                    <select value={form.programPelatihan} onChange={(e) => set("programPelatihan", e.target.value)} disabled={!selectedRumpun} className={`${inputCls} disabled:opacity-50`}>
                                        <option value="">{selectedRumpun ? "Pilih program" : "Pilih klaster dulu"}</option>
                                        {selectedRumpun?.programs?.map((p) => (
                                            <option key={p.id_program_pelatihan} value={p.name_indo || String(p.id_program_pelatihan)}>{p.name_indo}</option>
                                        ))}
                                        {/* jaga nilai lama yang tidak ada di daftar */}
                                        {form.programPelatihan && !selectedRumpun?.programs?.some((p) => (p.name_indo || String(p.id_program_pelatihan)) === form.programPelatihan) && (
                                            <option value={form.programPelatihan}>{form.programPelatihan}</option>
                                        )}
                                    </select>
                                </Field>
                                <Field label="Penyelenggara" className="sm:col-span-2">
                                    <select value={form.penyelenggara} onChange={(e) => set("penyelenggara", e.target.value)} className={inputCls}>
                                        <option value="">Pilih penyelenggara</option>
                                        {UPT.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Deskripsi" className="sm:col-span-2" hint={`${form.descriptionVideo.length} karakter`}>
                                    <textarea value={form.descriptionVideo} onChange={(e) => set("descriptionVideo", e.target.value)} placeholder="Ringkasan materi yang dipelajari..." className={`${inputCls} h-auto min-h-[110px] py-3`} />
                                </Field>
                            </div>
                            <div className="lg:col-span-2 flex flex-col gap-2">
                                <span className="text-[11px] font-semibold text-slate-500">Pratinjau</span>
                                <div className="aspect-video rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden flex items-center justify-center">
                                    {formYid ? (
                                        <iframe src={`https://www.youtube.com/embed/${formYid}`} className="w-full h-full" allowFullScreen title="Pratinjau video" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Youtube className="w-10 h-10 opacity-40" />
                                            <p className="text-xs font-medium">Menunggu link YouTube</p>
                                        </div>
                                    )}
                                </div>
                                {form.namaPelatihan && <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{form.namaPelatihan}</p>}
                                {(form.programPelatihan || form.penyelenggara) && <p className="text-[11px] text-slate-400">{[form.programPelatihan, form.penyelenggara].filter(Boolean).join(" · ")}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end px-5 md:px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={closeForm} disabled={saving} className="h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                                Batal
                            </button>
                            <button type="button" onClick={save} disabled={saving || !valid} className="h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {saving ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Tambah Video"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ---------- Toolbar ---------- */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-2.5 shadow-sm space-y-2.5">
                    <div className="flex flex-col lg:flex-row gap-2.5 lg:items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                            <input
                                id="search-video"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul, program, atau penyelenggara..."
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
                        <div className="flex flex-wrap items-center gap-2">
                            <FilterSelect icon={Layers} placeholder="Semua klaster" value={klaster} onChange={setKlaster} options={options.klaster} />
                            <FilterSelect icon={Building2} placeholder="Semua penyelenggara" value={penyelenggara} onChange={setPenyelenggara} options={options.penyelenggara} />
                            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} title="Urutkan" className="h-11 border-none rounded-2xl bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-600 outline-none hover:ring-1 hover:ring-slate-200">
                                <option value="terbaru">Terbaru</option>
                                <option value="populer">Terpopuler</option>
                                <option value="terlama">Terlama</option>
                            </select>
                            <button type="button" onClick={fetchVideos} disabled={loading} title="Muat ulang" className="h-11 w-11 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:ring-1 hover:ring-slate-200 disabled:opacity-40">
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>
                            {!showForm && (
                                <button type="button" onClick={() => openForm()} className="h-11 px-5 shrink-0 rounded-2xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-900/20 transition-colors">
                                    <Plus className="w-4 h-4" /> Tambah Video
                                </button>
                            )}
                        </div>
                    </div>
                    {hasFilter && (
                        <div className="flex flex-wrap items-center gap-1.5 px-1 pb-0.5">
                            {search && <Chip label={`"${search}"`} onClear={() => setSearch("")} />}
                            {klaster && <Chip label={klaster} onClear={() => setKlaster("")} />}
                            {penyelenggara && <Chip label={penyelenggara} onClear={() => setPenyelenggara("")} />}
                            <button type="button" onClick={resetAll} className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 px-1">Reset semua</button>
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
                                    <th className="px-3 py-3 font-semibold min-w-[340px]">Video</th>
                                    <th className="px-3 py-3 font-semibold min-w-[200px]">Program & Penyelenggara</th>
                                    <th className="px-3 py-3 font-semibold w-[130px]">Traffic</th>
                                    <th className="w-[1%] px-5 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {initialLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-5 py-3">
                                                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : error && videos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">Gagal memuat video</p>
                                                <p className="text-xs text-slate-400 max-w-sm">{error}</p>
                                                <button type="button" onClick={fetchVideos} className="mt-2 h-9 px-4 rounded-xl bg-[#0B1B3F] text-white text-xs font-bold">Coba lagi</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pageRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16">
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Youtube className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hasFilter ? "Video tidak ditemukan" : "Belum ada video pelatihan"}</p>
                                                {hasFilter ? (
                                                    <button type="button" onClick={resetAll} className="text-xs font-semibold text-blue-600 hover:underline">Reset filter</button>
                                                ) : (
                                                    !showForm && <button type="button" onClick={() => openForm()} className="text-xs font-semibold text-blue-600 hover:underline">Tambah video pertama</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageRows.map(({ v, yid, clicks, resp }, i) => (
                                        <tr key={v.id} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="pl-5 pr-2 py-3.5 text-center text-xs text-slate-400 tabular-nums align-top">{start + i + 1}</td>
                                            <td className="px-3 py-3.5 align-top">
                                                <div className="flex items-start gap-3">
                                                    <button type="button" onClick={() => setSelected(v)} className="relative w-28 aspect-video shrink-0 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 dark:ring-slate-700" aria-label="Putar video">
                                                        {yid ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={ytThumb(yid)} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                        ) : (
                                                            <Youtube className="w-6 h-6 text-slate-300 m-auto absolute inset-0" />
                                                        )}
                                                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors">
                                                            <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <PlaySquare className="w-4 h-4 text-rose-600" />
                                                            </span>
                                                        </span>
                                                    </button>
                                                    <div className="min-w-0">
                                                        {latestIds.has(v.id) && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-px mb-0.5 rounded-md bg-[#0B1B3F] text-white text-[9px] font-black uppercase">
                                                                <span className="w-1 h-1 rounded-full bg-sky-300 animate-pulse" /> Terbaru
                                                            </span>
                                                        )}
                                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{v.namaPelatihan}</p>
                                                        <p className="text-[11px] text-slate-400 line-clamp-1">{v.descriptionVideo || "Tanpa deskripsi"}</p>
                                                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                                            <Calendar className="w-3 h-3" /> {fmtDate(v.createdAt)}
                                                            {!yid && <span className="ml-1 text-rose-500 font-semibold">· link tidak valid</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">{v.programPelatihan || "Umum"}</p>
                                                {v.jenisProgramPelatihan && <p className="text-[11px] text-slate-400">{v.jenisProgramPelatihan}</p>}
                                                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                    <Building2 className="w-3 h-3 text-slate-400" /> {v.penyelenggara || "E-LAUT"}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3.5 align-top">
                                                <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white tabular-nums">
                                                    <MousePointerClick className="w-3.5 h-3.5 text-rose-500" /> {fmt(clicks)}
                                                </p>
                                                <p className="flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums">
                                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {fmt(resp)} ulasan
                                                </p>
                                                {stats.clicks > 0 && (
                                                    <div className="mt-1.5 h-1 w-20 rounded-full bg-slate-100 overflow-hidden">
                                                        <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.min(100, (clicks / (stats.top?.clicks || 1)) * 100)}%` }} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 align-top">
                                                <div className="flex justify-end gap-1">
                                                    <IconBtn title="Lihat" onClick={() => setSelected(v)} icon={Eye} tone="blue" />
                                                    <IconBtn title="Ubah" onClick={() => openForm(v)} icon={Pencil} tone="amber" />
                                                    <IconBtn title="Hapus" onClick={() => setToDelete(v)} icon={Trash2} tone="rose" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                            <span>
                                <b className="text-slate-800 dark:text-white tabular-nums">{start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}</b> dari <b className="tabular-nums">{fmt(filtered.length)}</b>
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
                </div>
            </div>

            {/* ---------- Modal detail ---------- */}
            {selected && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="relative aspect-video bg-black">
                            {ytId(selected.linkPelatihan) ? (
                                <iframe src={`https://www.youtube.com/embed/${ytId(selected.linkPelatihan)}?autoplay=1`} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" allowFullScreen title={selected.namaPelatihan} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Link video tidak valid</div>
                            )}
                            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 rounded-full p-2 bg-black/50 text-white hover:bg-black/70" aria-label="Tutup">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">{selected.jenisProgramPelatihan || "Video Pelatihan"}</p>
                                <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white leading-snug">{selected.namaPelatihan}</h2>
                                <p className="mt-2 text-sm text-slate-500 leading-relaxed whitespace-pre-line">{selected.descriptionVideo || "Belum ada deskripsi."}</p>
                            </div>
                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
                                <Info label="Penyelenggara" value={selected.penyelenggara} />
                                <Info label="Program" value={selected.programPelatihan} />
                                <Info label="Penayangan" value={`${fmt(selected.videoClicked || 0)} klik`} />
                                <Info label="Respons" value={`${fmt(selected.responses?.length || 0)} ulasan`} />
                            </dl>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <a href={selected.linkPelatihan} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                                    <ExternalLink className="w-3.5 h-3.5" /> Buka di YouTube
                                </a>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { const v = selected; setSelected(null); openForm(v); }} className="h-10 px-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5">
                                        <Pencil className="w-3.5 h-3.5" /> Ubah
                                    </button>
                                    <button type="button" onClick={() => setSelected(null)} className="h-10 px-5 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Konfirmasi hapus ---------- */}
            <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && !deleting && setToDelete(null)}>
                <AlertDialogContent className="rounded-3xl max-w-md">
                    <AlertDialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <AlertDialogTitle className="font-black text-lg text-slate-900">Hapus video?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500">
                            Video <b className="text-slate-900">{toDelete?.namaPelatihan}</b> beserta data klik & responsnya akan dihapus.
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
        </LayoutAdminElaut>
    );
}

/* ============================ UI ============================ */

const inputCls =
    "w-full h-11 px-3.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal";

function Field({ label, required, hint, hintTone, className = "", children }: { label: string; required?: boolean; hint?: string; hintTone?: "ok" | "error"; className?: string; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-baseline justify-between gap-2">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
                {hint && <span className={`text-[10px] font-medium ${hintTone === "error" ? "text-rose-500" : hintTone === "ok" ? "text-emerald-600 font-mono" : "text-slate-400"}`}>{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-slate-800 dark:text-slate-200">{value || "-"}</dd>
        </div>
    );
}

function IconBtn({ title, onClick, icon: Icon, tone }: { title: string; onClick: () => void; icon: LucideIcon; tone: "blue" | "amber" | "rose" }) {
    const t = tone === "blue" ? "hover:bg-blue-50 hover:text-blue-600" : tone === "amber" ? "hover:bg-amber-50 hover:text-amber-600" : "hover:bg-rose-50 hover:text-rose-600";
    return (
        <button type="button" title={title} aria-label={title} onClick={onClick} className={`h-8 w-8 rounded-lg text-slate-400 flex items-center justify-center transition-colors ${t}`}>
            <Icon className="w-4 h-4" />
        </button>
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
                className={`max-w-[200px] border-none h-11 pl-9 pr-3 rounded-2xl text-xs font-bold outline-none truncate transition-colors disabled:opacity-50 ${value ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"}`}
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

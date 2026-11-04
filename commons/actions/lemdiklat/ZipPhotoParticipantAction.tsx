"use client";

import React, { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import ActionModal from "../ActionModal";
import {
    TbAlertTriangle, TbCheck, TbCircleCheck, TbCircleX, TbFileZip, TbLoader2, TbPhoto, TbPhotoUp,
    TbRefresh, TbTrash, TbUpload, TbX,
} from "react-icons/tb";

type UserPelatihan = {
    IdUsers: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

type Props = {
    users: UserPelatihan[];
    onSuccess?: () => void;
};

type IconType = React.ComponentType<{ className?: string }>;

const MAX_ZIP_MB = 50;
const IMAGE_EXT = ["jpg", "jpeg", "png"];
const CONCURRENCY = 3;

type ItemStatus = "siap" | "mengunggah" | "berhasil" | "gagal";
type Item = { id: number; fileName: string; name: string; blob: Blob; preview: string; status: ItemStatus };
type Skipped = { fileName: string; reason: string };
type Analysis = { items: Item[]; skipped: Skipped[]; missing: UserPelatihan[] };

const nameOf = (u?: UserPelatihan) => (u?.Nama || u?.NamaPeserta || u?.nama || (u ? `ID ${u.IdUsers}` : "-")) as string;

/** Baca isi ZIP → cocokkan "<IdUsers>.jpg|png" dengan peserta (tanpa mengunggah apa pun). */
async function analyzeZip(file: File, users: UserPelatihan[]): Promise<Analysis> {
    const zip = await JSZip.loadAsync(file, { checkCRC32: true });
    const byId = new Map(users.map((u) => [Number(u.IdUsers), u]));
    const items: Item[] = [];
    const skipped: Skipped[] = [];
    const seen = new Set<number>();

    for (const entry of Object.values(zip.files)) {
        if (entry.dir) continue;
        const base = entry.name.split("/").pop() || "";
        if (!base || base.startsWith(".") || entry.name.startsWith("__MACOSX/")) continue; // file sistem macOS/hidden

        const ext = base.split(".").pop()?.toLowerCase() || "";
        if (!IMAGE_EXT.includes(ext)) {
            skipped.push({ fileName: base, reason: "Bukan gambar JPG/PNG" });
            continue;
        }
        const stem = base.replace(/\.[^/.]+$/, "").trim();
        if (!/^\d+$/.test(stem)) {
            skipped.push({ fileName: base, reason: "Nama file harus ID peserta (angka)" });
            continue;
        }
        const id = Number(stem);
        const user = byId.get(id);
        if (!user) {
            skipped.push({ fileName: base, reason: "ID tidak terdaftar di pelatihan ini" });
            continue;
        }
        if (seen.has(id)) {
            skipped.push({ fileName: base, reason: `Duplikat untuk ID ${id}` });
            continue;
        }
        seen.add(id);
        const raw = await entry.async("blob");
        const blob = new Blob([raw], { type: ext === "png" ? "image/png" : "image/jpeg" });
        items.push({ id, fileName: base, name: nameOf(user), blob, preview: URL.createObjectURL(blob), status: "siap" });
    }

    items.sort((a, b) => a.name.localeCompare(b.name));
    const missing = users.filter((u) => !seen.has(Number(u.IdUsers)));
    return { items, skipped, missing };
}

export default function ZipPhotoParticipantAction({ users, onSuccess }: Props) {
    const canManage = !!Cookies.get("Access")?.includes("createPelatihan") && users.length > 0;

    const [isOpen, setIsOpen] = useState(false);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [fatal, setFatal] = useState("");
    const [uploading, setUploading] = useState(false);
    const [drag, setDrag] = useState(false);
    const [tab, setTab] = useState<"cocok" | "lewati" | "tanpa">("cocok");

    // Bersihkan object URL pratinjau hanya saat ZIP diganti / komponen dilepas
    // (bukan tiap update status, agar pratinjau tidak hilang saat mengunggah)
    const [previews, setPreviews] = useState<string[]>([]);
    useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

    const counts = useMemo(() => {
        const it = analysis?.items ?? [];
        return {
            cocok: it.length,
            berhasil: it.filter((i) => i.status === "berhasil").length,
            gagal: it.filter((i) => i.status === "gagal").length,
            pending: it.filter((i) => i.status === "siap" || i.status === "gagal").length,
        };
    }, [analysis]);
    const done = counts.berhasil + counts.gagal;
    const progress = counts.cocok ? Math.round((done / counts.cocok) * 100) : 0;
    const step = !zipFile ? 1 : uploading || done > 0 ? 3 : 2;

    if (!canManage) return null;

    const reset = () => {
        setPreviews([]);
        setZipFile(null);
        setAnalysis(null);
        setFatal("");
        setTab("cocok");
    };

    const close = () => {
        if (uploading) return;
        const hadSuccess = counts.berhasil > 0;
        setIsOpen(false);
        reset();
        if (hadSuccess) onSuccess?.();
    };

    const pick = async (f?: File | null) => {
        if (!f) return;
        if (!f.name.toLowerCase().endsWith(".zip")) return void Toast.fire({ icon: "error", title: "Format tidak sesuai", text: "Unggah file berformat .zip" });
        if (f.size > MAX_ZIP_MB * 1024 * 1024) return void Toast.fire({ icon: "error", title: "File terlalu besar", text: `Maksimal ${MAX_ZIP_MB} MB per unggahan.` });
        reset();
        setZipFile(f);
        setAnalyzing(true);
        try {
            const a = await analyzeZip(f, users);
            setPreviews(a.items.map((i) => i.preview));
            setAnalysis(a);
            setTab(a.items.length ? "cocok" : "lewati");
            if (!a.items.length) setFatal("Tidak ada foto yang cocok dengan ID peserta.");
        } catch {
            setFatal("ZIP tidak dapat dibaca. Pastikan file tidak rusak.");
        } finally {
            setAnalyzing(false);
        }
    };

    const setStatus = (id: number, status: ItemStatus) =>
        setAnalysis((a) => (a ? { ...a, items: a.items.map((i) => (i.id === id ? { ...i, status } : i)) } : a));

    const upload = async () => {
        if (!analysis) return;
        const queue = analysis.items.filter((i) => i.status === "siap" || i.status === "gagal");
        if (!queue.length) return;
        setUploading(true);
        let ok = 0;
        let fail = 0;

        const worker = async () => {
            while (queue.length) {
                const item = queue.shift()!;
                setStatus(item.id, "mengunggah");
                try {
                    const fd = new FormData();
                    fd.append("Fotos", item.blob, item.fileName);
                    fd.append("Ktps", "");
                    fd.append("KKs", "");
                    fd.append("Ijazahs", "");
                    fd.append("SuratKesehatans", "");
                    await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/users/updateUsersNoJwt?id=${item.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                    setStatus(item.id, "berhasil");
                    ok++;
                } catch (e) {
                    console.error(`Gagal upload ${item.fileName}`, e);
                    setStatus(item.id, "gagal");
                    fail++;
                }
            }
        };
        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
        setUploading(false);

        // Hitungan dari variabel lokal (dulu memakai state lama → angka di toast selalu 0)
        Toast.fire({
            icon: fail ? (ok ? "warning" : "error") : "success",
            title: fail ? `${ok} berhasil, ${fail} gagal` : "Foto peserta diperbarui",
            text: fail ? "Klik \"Ulangi yang gagal\" untuk mencoba lagi." : `${ok} foto berhasil diunggah.`,
        });
    };

    const allDone = !!analysis && counts.cocok > 0 && counts.berhasil === counts.cocok;

    return (
        <>
            {/* Tombol putih — sama dengan aksi lain */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <TbPhotoUp className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-6" />
                Upload Foto Massal
            </button>

            <ActionModal open={isOpen} onClose={close} labelledBy="zip-foto-title" maxWidth="max-w-3xl">
                {/* Header hero */}
                <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#6366F1_0%,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    <TbFileZip aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-indigo-300 opacity-20" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/90">Foto Massal</p>
                            <h2 id="zip-foto-title" className="mt-1 text-base md:text-lg font-black text-white leading-snug">Unggah pas foto peserta dari ZIP</h2>
                            <p className="text-xs text-blue-100/70">
                                Nama file = ID peserta, mis. <span className="font-mono text-white">12345.jpg</span>. Isi ZIP diperiksa dulu sebelum diunggah.
                            </p>
                        </div>
                        <button type="button" onClick={close} disabled={uploading} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                            <TbX className="w-4 h-4" />
                        </button>
                    </div>

                    <ol className="mt-4 grid grid-cols-3 gap-2">
                        {["Pilih ZIP", "Periksa", "Unggah"].map((label, i) => {
                            const n = i + 1;
                            const isDone = step > n || (n === 3 && allDone);
                            const active = step === n && !isDone;
                            return (
                                <li key={label} className={`rounded-xl px-2.5 py-2 ring-1 backdrop-blur-md ${active ? "bg-white/15 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "bg-white/[0.06] ring-white/10"}`}>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${isDone ? "bg-emerald-500 text-white" : active ? "bg-white text-[#0B1B3F]" : "bg-white/10 text-blue-100/60"}`}>
                                            {isDone ? <TbCheck className="w-3 h-3" /> : n}
                                        </span>
                                        <span className={`text-[11px] font-bold truncate ${active ? "text-white" : "text-blue-100/60"}`}>{label}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-5 space-y-4">
                    {/* File ZIP */}
                    {zipFile ? (
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-10 h-10 shrink-0 rounded-xl bg-[#0B1B3F] text-indigo-200 flex items-center justify-center">
                                    <TbFileZip className="w-5 h-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate" title={zipFile.name}>{zipFile.name}</p>
                                    <p className="text-[11px] text-slate-500 tabular-nums">
                                        {(zipFile.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                                        {analyzing ? <span className="inline-flex items-center gap-1"><TbLoader2 className="w-3 h-3 animate-spin" /> Memeriksa isi…</span> : `${analysis?.items.length ?? 0} foto cocok`}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={reset} disabled={uploading} title="Ganti ZIP" className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center disabled:opacity-40">
                                <TbTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="zip-upload"
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDrag(true);
                            }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDrag(false);
                                pick(e.dataTransfer.files?.[0]);
                            }}
                            className={`flex flex-col items-center justify-center gap-2 h-44 px-6 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${drag ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50/40"}`}
                        >
                            <span className="w-12 h-12 rounded-xl bg-[#0B1B3F] text-indigo-200 flex items-center justify-center shadow-md">
                                <TbUpload className="w-5 h-5" />
                            </span>
                            <p className="text-[13px] font-bold text-slate-800 dark:text-white">{drag ? "Lepaskan file di sini" : "Klik atau seret file ZIP ke sini"}</p>
                            <p className="text-[11px] text-slate-500">Isi: foto JPG/PNG bernama ID peserta · maks {MAX_ZIP_MB} MB</p>
                            <input
                                id="zip-upload"
                                type="file"
                                accept=".zip,application/zip"
                                className="sr-only"
                                onChange={(e) => {
                                    pick(e.target.files?.[0]);
                                    e.target.value = "";
                                }}
                            />
                        </label>
                    )}

                    {analyzing && <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />)}</div>}

                    {fatal && !analyzing && (
                        <p className="flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3.5 py-3 text-xs font-semibold text-rose-700">
                            <TbAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {fatal}
                        </p>
                    )}

                    {analysis && !analyzing && (
                        <>
                            {/* Ringkasan */}
                            <div className="grid grid-cols-3 gap-2">
                                <Stat label="Foto cocok" value={analysis.items.length} tone="emerald" active={tab === "cocok"} onClick={() => setTab("cocok")} />
                                <Stat label="Dilewati" value={analysis.skipped.length} tone={analysis.skipped.length ? "rose" : "slate"} active={tab === "lewati"} onClick={() => setTab("lewati")} />
                                <Stat label="Peserta tanpa foto" value={analysis.missing.length} tone={analysis.missing.length ? "amber" : "slate"} active={tab === "tanpa"} onClick={() => setTab("tanpa")} />
                            </div>

                            {/* Progres */}
                            {(uploading || done > 0) && (
                                <div className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 p-3.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                        <span className="text-slate-600 dark:text-slate-300">{uploading ? "Mengunggah foto…" : allDone ? "Semua foto berhasil diunggah" : "Unggahan selesai"}</span>
                                        <span className="tabular-nums text-slate-500">
                                            {done}/{counts.cocok} · {progress}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${counts.cocok ? (counts.berhasil / counts.cocok) * 100 : 0}%` }} />
                                        <div className="h-full bg-rose-500 transition-all" style={{ width: `${counts.cocok ? (counts.gagal / counts.cocok) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Daftar per tab */}
                            {tab === "cocok" &&
                                (analysis.items.length ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 [&>*]:min-w-0">
                                        {analysis.items.map((it) => (
                                            <figure key={it.id} className={`relative overflow-hidden rounded-xl ring-1 bg-white dark:bg-slate-900 ${it.status === "berhasil" ? "ring-emerald-300" : it.status === "gagal" ? "ring-rose-300" : "ring-slate-200 dark:ring-slate-700"}`}>
                                                <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={it.preview} alt={`Foto ${it.name}`} className="absolute inset-0 w-full h-full object-cover" />
                                                    <span className={`absolute top-1.5 right-1.5 grid place-items-center w-6 h-6 rounded-full shadow ${it.status === "berhasil" ? "bg-emerald-500 text-white" : it.status === "gagal" ? "bg-rose-500 text-white" : it.status === "mengunggah" ? "bg-white text-indigo-600" : "bg-white/90 text-slate-500"}`}>
                                                        {it.status === "berhasil" ? <TbCheck className="w-3.5 h-3.5" /> : it.status === "gagal" ? <TbX className="w-3.5 h-3.5" /> : it.status === "mengunggah" ? <TbLoader2 className="w-3.5 h-3.5 animate-spin" /> : <TbPhoto className="w-3.5 h-3.5" />}
                                                    </span>
                                                </div>
                                                <figcaption className="px-2 py-1.5">
                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate" title={it.name}>{it.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono truncate">{it.fileName}</p>
                                                </figcaption>
                                            </figure>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty icon={TbPhoto} text="Tidak ada foto yang cocok." />
                                ))}

                            {tab === "lewati" &&
                                (analysis.skipped.length ? (
                                    <ul className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {analysis.skipped.map((s, i) => (
                                            <li key={`${s.fileName}-${i}`} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                                <span className="min-w-0 text-xs font-mono text-slate-700 dark:text-slate-200 truncate" title={s.fileName}>{s.fileName}</span>
                                                <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600"><TbCircleX className="w-3.5 h-3.5" /> {s.reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Empty icon={TbCircleCheck} text="Tidak ada file yang dilewati." />
                                ))}

                            {tab === "tanpa" &&
                                (analysis.missing.length ? (
                                    <ul className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {analysis.missing.map((u) => (
                                            <li key={u.IdUsers} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                                <span className="min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{nameOf(u)}</span>
                                                <span className="shrink-0 font-mono text-[11px] text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-md px-1.5 py-0.5">{u.IdUsers}.jpg</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Empty icon={TbCircleCheck} text="Semua peserta punya foto di ZIP ini." />
                                ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <p className="min-w-0 text-[11px] text-slate-400 truncate">
                        {!analysis ? "Belum ada ZIP" : allDone ? `${counts.berhasil} foto tersimpan` : counts.gagal && !uploading ? `${counts.gagal} foto gagal` : `${counts.pending} foto siap diunggah`}
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={close} disabled={uploading} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                            {allDone ? "Selesai" : "Batal"}
                        </button>
                        {!allDone && (
                            <button
                                type="button"
                                onClick={upload}
                                disabled={!analysis || !counts.pending || uploading || analyzing}
                                className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                            >
                                {uploading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : counts.gagal ? <TbRefresh className="w-4 h-4" /> : <TbUpload className="w-4 h-4" />}
                                {uploading ? `Mengunggah ${done}/${counts.cocok}…` : counts.gagal && counts.pending === counts.gagal ? `Ulangi ${counts.gagal} yang gagal` : `Unggah ${counts.pending} foto`}
                            </button>
                        )}
                    </div>
                </div>
            </ActionModal>
        </>
    );
}

/* ===================== UI ===================== */

const TONE = {
    slate: "bg-white dark:bg-slate-900 text-slate-800 dark:text-white ring-slate-200 dark:ring-slate-700",
    emerald: "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-900/40",
    rose: "bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 ring-rose-200 dark:ring-rose-900/40",
    amber: "bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-900/40",
} as const;

function Stat({ label, value, tone, active, onClick }: { label: string; value: number; tone: keyof typeof TONE; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} aria-pressed={active} className={`text-left rounded-xl ring-1 px-3 py-2 transition-all ${TONE[tone]} ${active ? "ring-2 ring-[#0B1B3F] dark:ring-white shadow-sm" : "hover:shadow-sm"}`}>
            <p className="text-[10px] font-semibold opacity-70 truncate">{label}</p>
            <p className="text-xl font-black tabular-nums">{value.toLocaleString("id-ID")}</p>
        </button>
    );
}

function Empty({ icon: Icon, text }: { icon: IconType; text: string }) {
    return (
        <div className="flex flex-col items-center gap-2 py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <Icon className="w-6 h-6 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">{text}</p>
        </div>
    );
}

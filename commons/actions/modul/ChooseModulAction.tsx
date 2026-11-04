"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { createPortal } from "react-dom";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { findNameUnitKerjaById } from "@/utils/unitkerja";
import {
    TbArrowLeft, TbBook, TbBooks, TbChecks, TbChevronDown, TbDownload, TbLoader2,
    TbPlayerPlay, TbRefresh, TbSearch, TbX, TbAlertTriangle,
} from "react-icons/tb";

interface ChooseModulActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

type IconType = React.ComponentType<{ className?: string }>;

/** Status penerbitan yang masih boleh mengubah perangkat: Draft, Perbaikan Verifikator, Perbaikan SPV */
const EDITABLE_STATUS = ["0", "3", "1.2"];
const TYPE_OPTIONS = [
    { v: "", l: "Semua tipe" },
    { v: "1", l: "Modul" },
    { v: "2", l: "Bahan Ajar" },
];
const yearOf = (m: MateriPelatihan) => parseInt(String(m.Tahun || m.NamaPenderitaMateriPelatihan || ""), 10) || 0;
const fileUrl = (name: string) => `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${name}`;

const ChooseModulAction: React.FC<ChooseModulActionProps> = ({ idPelatihan, currentData, onSuccess }) => {
    const canManage = !!Cookies.get("Access")?.includes("createPelatihan") && EDITABLE_STATUS.includes(String(currentData?.StatusPenerbitan ?? ""));
    const currentId = String(currentData?.ModuleMateri ?? "").trim();
    const hasCurrent = !!currentId && currentId !== "0";

    const { data: modulPelatihan, loading: loadingModul, error: errorModul, fetchModulPelatihan } = useFetchDataMateriPelatihanMasyarakat();
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [filterBidang, setFilterBidang] = useState("");
    const [filterType, setFilterType] = useState("");
    const [selected, setSelected] = useState<MateriPelatihan | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Unit kerja hanya dimuat saat dialog dibuka
    useEffect(() => {
        if (isOpen && !unitKerjas?.length) fetchUnitKerjaData();
    }, [isOpen, unitKerjas?.length, fetchUnitKerjaData]);

    const producerOf = (m: MateriPelatihan) => findNameUnitKerjaById(unitKerjas, m.DeskripsiMateriPelatihan)?.name || "-";

    const bidangOptions = useMemo(() => Array.from(new Set((modulPelatihan ?? []).map((m) => m.BidangMateriPelatihan).filter(Boolean))).sort(), [modulPelatihan]);

    const filtered = useMemo(
        () =>
            (modulPelatihan ?? [])
                .filter(
                    (m) =>
                        (!q || `${m.NamaMateriPelatihan} ${m.BidangMateriPelatihan}`.toLowerCase().includes(q)) &&
                        (!filterBidang || m.BidangMateriPelatihan === filterBidang) &&
                        (!filterType || m.BerlakuSampai === filterType)
                )
                // perangkat terpasang di atas, lalu tahun terbaru
                .sort((a, b) => Number(String(b.IdMateriPelatihan) === currentId) - Number(String(a.IdMateriPelatihan) === currentId) || yearOf(b) - yearOf(a)),
        [modulPelatihan, q, filterBidang, filterType, currentId]
    );

    const currentModul = useMemo(() => (modulPelatihan ?? []).find((m) => String(m.IdMateriPelatihan) === currentId) || null, [modulPelatihan, currentId]);
    const hasFilter = !!(search || filterBidang || filterType);

    if (!canManage) return null;

    const resetFilters = () => {
        setSearch("");
        setFilterBidang("");
        setFilterType("");
    };

    const close = () => {
        if (saving) return;
        setIsOpen(false);
        setSelected(null);
        setExpanded(null);
        resetFilters();
    };

    const handleSubmit = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                { ModuleMateri: String(selected.IdMateriPelatihan) },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );
            Toast.fire({ icon: "success", title: "Perangkat pelatihan disimpan", text: selected.NamaMateriPelatihan });
            setSaving(false);
            close();
            onSuccess?.();
        } catch {
            setSaving(false);
            Toast.fire({ icon: "error", title: "Gagal menyimpan", text: "Terjadi kesalahan saat memperbarui pelatihan." });
        }
    };

    const isSameAsCurrent = !!selected && String(selected.IdMateriPelatihan) === currentId;

    return (
        <>
            {/* Tombol putih — sama dengan aksi lain */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <TbBooks className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-6" />
                {hasCurrent ? "Ganti" : "Pilih"} Perangkat Pelatihan
                {hasCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Perangkat sudah dipilih" />}
            </button>

            <Modal open={isOpen} onClose={close} labelledBy="choose-modul-title">
                {/* Header hero */}
                <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#6366F1_0%,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    <TbBooks aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-indigo-300 opacity-20" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/90">Perangkat Pelatihan</p>
                            <h2 id="choose-modul-title" className="mt-1 text-base md:text-lg font-black text-white leading-snug">
                                {selected ? "Periksa isi perangkat" : "Pilih modul / bahan ajar"}
                            </h2>
                            <p className="text-xs text-blue-100/70 truncate">{currentData?.NamaPelatihan || "Perangkat dipakai peserta selama pelatihan."}</p>
                        </div>
                        <button type="button" onClick={close} disabled={saving} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                            <TbX className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl bg-white/[0.08] ring-1 ring-white/15 backdrop-blur px-3 py-1.5 text-[11px] font-semibold">
                        <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${hasCurrent ? "bg-emerald-400" : "bg-amber-300"}`} />
                        <span className="truncate">{hasCurrent ? `Terpasang: ${currentModul?.NamaMateriPelatihan ?? `#${currentId}`}` : "Belum ada perangkat dipilih"}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                    {!selected ? (
                        <>
                            {/* Toolbar */}
                            <div className="shrink-0 p-4 md:px-5 pb-3 grid grid-cols-2 md:flex md:flex-row gap-2">
                                <div className="relative col-span-2 md:flex-1">
                                    <TbSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama perangkat atau bidang…"
                                        className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border-none dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                    {search && (
                                        <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                                            <TbX className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <select value={filterBidang} onChange={(e) => setFilterBidang(e.target.value)} className={selectCls(!!filterBidang)}>
                                    <option value="">Semua bidang</option>
                                    {bidangOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls(!!filterType)}>
                                    {TYPE_OPTIONS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                                </select>
                            </div>
                            <div className="shrink-0 px-4 md:px-5 pb-2 flex items-center justify-between text-[11px] text-slate-400">
                                <span>{loadingModul ? "Memuat perangkat…" : `${filtered.length} perangkat`}</span>
                                {hasFilter && <button type="button" onClick={resetFilters} className="font-semibold text-blue-600 hover:underline">Reset filter</button>}
                            </div>

                            {/* Daftar */}
                            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 md:px-5 pb-4">
                                {loadingModul && !modulPelatihan?.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />)}
                                    </div>
                                ) : errorModul ? (
                                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                                        <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><TbAlertTriangle className="w-5 h-5" /></span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Perangkat gagal dimuat</p>
                                        <button type="button" onClick={() => fetchModulPelatihan?.()} className="h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-50">
                                            <TbRefresh className="w-4 h-4" /> Coba lagi
                                        </button>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-14 text-center">
                                        <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center"><TbBook className="w-5 h-5" /></span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada perangkat ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 [&>*]:min-w-0">
                                        {filtered.map((m) => {
                                            const isCurrent = String(m.IdMateriPelatihan) === currentId;
                                            const count = m.ModulPelatihan?.length ?? 0;
                                            return (
                                                <button
                                                    key={m.IdMateriPelatihan}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelected(m);
                                                        setExpanded(null);
                                                    }}
                                                    className={`group relative isolate overflow-hidden min-w-0 w-full flex flex-col text-left rounded-2xl p-4 ring-1 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isCurrent ? "bg-white dark:bg-slate-900 ring-emerald-300 dark:ring-emerald-800" : "bg-white dark:bg-slate-900 ring-slate-200/80 dark:ring-slate-800 hover:ring-blue-200"}`}
                                                >
                                                    <TbBooks aria-hidden className="pointer-events-none absolute -right-4 -bottom-5 -z-10 w-24 h-24 -rotate-12 text-indigo-500 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity" />
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="relative isolate overflow-hidden grid place-items-center w-10 h-10 rounded-xl bg-[#0B1B3F] text-white shrink-0">
                                                            <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#6366F1_0%,transparent_70%)]" />
                                                            <TbBook className="w-4 h-4" />
                                                        </span>
                                                        <div className="flex flex-wrap justify-end gap-1">
                                                            {isCurrent && <span className="rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-1.5 py-0.5 text-[10px] font-bold">Terpasang</span>}
                                                            <span className="rounded-md bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{m.BerlakuSampai === "2" ? "Bahan Ajar" : "Modul"}</span>
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 break-words">{m.NamaMateriPelatihan}</p>
                                                    <p className="mt-0.5 text-[11px] font-semibold text-indigo-600 truncate">{m.BidangMateriPelatihan || "-"}</p>
                                                    <p className="mt-2 text-[11px] text-slate-500 truncate">Produsen: {producerOf(m)}</p>
                                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                                        <span className="text-slate-500 tabular-nums">
                                                            {yearOf(m) || "-"} · <b className={count ? "text-slate-700 dark:text-slate-200" : "text-rose-500"}>{count} materi</b>
                                                        </span>
                                                        <span className="font-bold text-blue-600 inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                                                            Lihat isi <TbChevronDown className="w-3.5 h-3.5 -rotate-90" />
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Detail perangkat */
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-5 space-y-4">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50"
                            >
                                <TbArrowLeft className="w-4 h-4" /> Kembali ke daftar
                            </button>

                            <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">{selected.BidangMateriPelatihan}</p>
                                <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white leading-snug break-words">{selected.NamaMateriPelatihan}</h3>
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <Meta label="Tipe" value={selected.BerlakuSampai === "2" ? "Bahan Ajar" : "Modul"} />
                                    <Meta label="Tahun" value={String(yearOf(selected) || "-")} />
                                    <Meta label="Materi" value={`${selected.ModulPelatihan?.length ?? 0} unit`} />
                                    <Meta label="Produsen" value={producerOf(selected)} />
                                </div>
                            </section>

                            <Section title="Daftar materi modul" icon={TbBook}>
                                {selected.ModulPelatihan?.length ? (
                                    <ul className="divide-y divide-slate-100 dark:divide-slate-800 -m-4">
                                        {selected.ModulPelatihan.map((modul: ModulPelatihan, i) => {
                                            const open = expanded === modul.IdModulPelatihan;
                                            const bahan = modul.BahanTayang ?? [];
                                            return (
                                                <li key={modul.IdModulPelatihan}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpanded(open ? null : modul.IdModulPelatihan)}
                                                        aria-expanded={open}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                                    >
                                                        <span className="text-[11px] font-bold text-slate-400 tabular-nums w-5">{i + 1}</span>
                                                        <span className="flex-1 min-w-0 text-[13px] font-semibold text-slate-800 dark:text-white break-words">{modul.NamaModulPelatihan}</span>
                                                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{bahan.length} bahan</span>
                                                        <TbChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-blue-600" : ""}`} />
                                                    </button>
                                                    {open && (
                                                        <div className="px-4 pb-3 pl-4 sm:pl-12 animate-in fade-in-50 slide-in-from-top-1">
                                                            {bahan.length === 0 ? (
                                                                <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-3 text-center text-[11px] text-slate-400">Belum ada bahan tayang / ajar</p>
                                                            ) : (
                                                                <ul className="space-y-1.5">
                                                                    {bahan.map((bt) => {
                                                                        const href = bt.BahanTayang ? fileUrl(bt.BahanTayang) : bt.LinkVideo;
                                                                        return (
                                                                            <li key={bt.IdBahanTayang} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                                                                                <span className="min-w-0">
                                                                                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{bt.NamaBahanTayang}</span>
                                                                                    {bt.CreateAt && <span className="block text-[10px] text-slate-400">{bt.CreateAt}</span>}
                                                                                </span>
                                                                                {href && (
                                                                                    <a href={href} target="_blank" rel="noopener noreferrer" className="h-8 px-2.5 shrink-0 rounded-lg bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-[11px] font-bold text-blue-600 inline-flex items-center gap-1 hover:bg-blue-50">
                                                                                        {bt.BahanTayang ? <TbDownload className="w-3.5 h-3.5" /> : <TbPlayerPlay className="w-3.5 h-3.5" />}
                                                                                        {bt.BahanTayang ? "Unduh" : "Video"}
                                                                                    </a>
                                                                                )}
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="flex items-start gap-2 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2.5 text-xs text-amber-800">
                                        <TbAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Perangkat ini belum memiliki materi modul.
                                    </p>
                                )}
                            </Section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <p className="min-w-0 text-[11px] text-slate-400 truncate">
                        {selected ? (isSameAsCurrent ? "Perangkat ini sudah terpasang" : <>Dipilih: <b className="text-slate-700 dark:text-slate-200">{selected.NamaMateriPelatihan}</b></>) : "Klik perangkat untuk melihat isinya"}
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={close} disabled={saving} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selected || saving || isSameAsCurrent}
                            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                        >
                            {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbChecks className="w-4 h-4" />}
                            {saving ? "Menyimpan…" : "Gunakan Perangkat"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

/* ===================== UI ===================== */

/**
 * Modal sendiri (portal ke <body>) — tidak bergantung pada kelas bawaan DialogContent
 * (top-50%/translate, grid, max-w-lg) yang membuat dialog besar meluber di layar.
 * Panel selalu muat di viewport: tinggi = layar − padding, isi tengah yang di-scroll.
 */
function Modal({ open, onClose, labelledBy, children }: { open: boolean; onClose: () => void; labelledBy: string; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open || !mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in-0 duration-200" onClick={onClose} />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className="relative flex flex-col w-full max-w-4xl h-full max-h-[860px] min-h-0 min-w-0 overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-950 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

const selectCls = (active: boolean) =>
    `h-11 w-full min-w-0 md:w-48 rounded-xl px-3 text-xs font-bold outline-none ring-1 cursor-pointer ${active ? "bg-[#0B1B3F] text-white ring-[#0B1B3F]" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700"}`;

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200/70 dark:ring-slate-700 px-3 py-2 min-w-0">
            <p className="text-[10px] font-semibold text-slate-400">{label}</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={value}>{value}</p>
        </div>
    );
}

function Section({ title, icon: Icon, children }: { title: string; icon: IconType; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#6366F1_0%,transparent_70%)]" />
                    <Icon className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

export default ChooseModulAction;

"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataInstrukturChoose } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { arrayToString, stringToArray } from "@/utils/input";
import { findNameUnitKerjaById } from "@/utils/unitkerja";
import ActionModal from "../ActionModal";
import { TbAlertTriangle, TbCheck, TbChecks, TbLoader2, TbRefresh, TbSearch, TbUser, TbUsers, TbX } from "react-icons/tb";

interface ChooseInstrukturActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

/** Status penerbitan yang masih boleh mengubah instruktur: Draft, Perbaikan Verifikator, Perbaikan SPV */
const EDITABLE_STATUS = ["0", "3", "1.2"];
const uniq = (arr: (string | undefined | null)[]) => Array.from(new Set(arr.filter(Boolean) as string[])).sort();
const initials = (n = "") => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const sameIds = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x));

const ChooseInstrukturAction: React.FC<ChooseInstrukturActionProps> = ({ idPelatihan, currentData, onSuccess }) => {
    const canManage = !!Cookies.get("Access")?.includes("createPelatihan") && EDITABLE_STATUS.includes(String(currentData?.StatusPenerbitan ?? ""));
    const currentIds = useMemo(() => (stringToArray(currentData?.Instruktur || "") || []).map(Number).filter((n) => !isNaN(n) && n > 0), [currentData?.Instruktur]);

    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData } = useFetchDataInstrukturChoose();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>(currentIds);
    const [saving, setSaving] = useState(false);
    const [onlySelected, setOnlySelected] = useState(false);

    const [search, setSearch] = useState("");
    const q = useDeferredValue(search.trim().toLowerCase());
    const [filterKeahlian, setFilterKeahlian] = useState("");
    const [filterJabatan, setFilterJabatan] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterUnitKerja, setFilterUnitKerja] = useState("");

    // Data dimuat saat dialog dibuka (bukan saat halaman tampil)
    useEffect(() => {
        if (!isOpen) return;
        if (!instrukturs?.length) fetchInstrukturData();
        if (!unitKerjas?.length) fetchUnitKerjaData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    /* ---------- Normalisasi sekali ---------- */
    const rows = useMemo(
        () =>
            (instrukturs ?? []).map((i) => {
                const unit = findNameUnitKerjaById(unitKerjas, String(i.id_lemdik ?? ""))?.name || "-";
                return {
                    i,
                    unit,
                    haystack: [i.nama, i.bidang_keahlian, i.jenjang_jabatan, i.status, i.pendidikkan_terakhir, i.no_telpon, unit].filter(Boolean).join(" ").toLowerCase(),
                };
            }),
        [instrukturs, unitKerjas]
    );
    const byId = useMemo(() => new Map(rows.map((r) => [r.i.IdInstruktur, r])), [rows]);

    const options = useMemo(
        () => ({
            keahlian: uniq((instrukturs ?? []).map((d) => d.bidang_keahlian)),
            jabatan: uniq((instrukturs ?? []).map((d) => d.jenjang_jabatan)),
            status: uniq((instrukturs ?? []).map((d) => d.status)),
            unit: Array.from(new Map((instrukturs ?? []).map((d) => [String(d.id_lemdik), byId.get(d.IdInstruktur)?.unit || "-"])).entries()).sort((a, b) => a[1].localeCompare(b[1])),
        }),
        [instrukturs, byId]
    );

    const filtered = useMemo(() => {
        const sel = new Set(selectedIds);
        return rows.filter(
            ({ i, haystack }) =>
                (!onlySelected || sel.has(i.IdInstruktur)) &&
                (!q || haystack.includes(q)) &&
                (!filterKeahlian || i.bidang_keahlian === filterKeahlian) &&
                (!filterJabatan || i.jenjang_jabatan === filterJabatan) &&
                (!filterStatus || i.status === filterStatus) &&
                (!filterUnitKerja || String(i.id_lemdik) === filterUnitKerja)
        );
    }, [rows, selectedIds, onlySelected, q, filterKeahlian, filterJabatan, filterStatus, filterUnitKerja]);

    const hasFilter = !!(search || filterKeahlian || filterJabatan || filterStatus || filterUnitKerja || onlySelected);
    const dirty = !sameIds(selectedIds, currentIds);

    if (!canManage) return null;

    const resetFilters = () => {
        setSearch("");
        setFilterKeahlian("");
        setFilterJabatan("");
        setFilterStatus("");
        setFilterUnitKerja("");
        setOnlySelected(false);
    };

    const openModal = () => {
        setSelectedIds(currentIds); // selalu mulai dari instruktur yang sudah terpasang
        setIsOpen(true);
    };

    const close = () => {
        if (saving) return;
        setIsOpen(false);
        resetFilters();
    };

    const toggle = (id: number) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                { Instruktur: arrayToString(selectedIds) },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );
            Toast.fire({ icon: "success", title: "Instruktur disimpan", text: `${selectedIds.length} instruktur/pelatih ditetapkan.` });
            setSaving(false);
            close();
            onSuccess?.();
        } catch {
            setSaving(false);
            Toast.fire({ icon: "error", title: "Gagal menyimpan", text: "Terjadi kesalahan saat memperbarui pelatihan." });
        }
    };

    return (
        <>
            {/* Tombol putih — sama dengan aksi lain */}
            <button
                type="button"
                onClick={openModal}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <TbUsers className="w-4 h-4 text-teal-600 transition-transform duration-300 group-hover:-rotate-6" />
                {currentIds.length ? "Ubah" : "Pilih"} Instruktur/Pelatih
                {currentIds.length > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-500 text-white text-[10px] font-black inline-flex items-center justify-center tabular-nums">{currentIds.length}</span>}
            </button>

            <ActionModal open={isOpen} onClose={close} labelledBy="choose-instruktur-title" maxWidth="max-w-5xl">
                {/* Header hero */}
                <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#14B8A6_0%,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    <TbUsers aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-teal-300 opacity-20" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/90">Instruktur / Pelatih</p>
                            <h2 id="choose-instruktur-title" className="mt-1 text-base md:text-lg font-black text-white leading-snug">Tetapkan tenaga pelatih</h2>
                            <p className="text-xs text-blue-100/70 truncate">{currentData?.NamaPelatihan || "Klik kartu untuk memilih atau membatalkan."}</p>
                        </div>
                        <button type="button" onClick={close} disabled={saving} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                            <TbX className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Terpilih (chip) */}
                    <div className="mt-4 flex items-center gap-2 min-w-0">
                        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/[0.08] ring-1 ring-white/15 backdrop-blur px-3 py-1.5 text-[11px] font-semibold">
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedIds.length ? "bg-emerald-400" : "bg-amber-300"}`} />
                            {selectedIds.length} terpilih
                        </span>
                        <div className="flex-1 min-w-0 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                            {selectedIds.map((id) => {
                                const r = byId.get(id);
                                return (
                                    <span key={id} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-white/[0.12] ring-1 ring-white/20 pl-2 pr-1 py-1 text-[11px] font-semibold">
                                        <span className="max-w-[160px] truncate">{r?.i.nama ?? `#${id}`}</span>
                                        <button type="button" onClick={() => toggle(id)} aria-label={`Hapus ${r?.i.nama ?? id}`} className="h-5 w-5 rounded-md hover:bg-white/20 flex items-center justify-center">
                                            <TbX className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="shrink-0 p-4 md:px-5 pb-2 grid grid-cols-2 lg:flex gap-2">
                    <div className="relative col-span-2 lg:flex-1">
                        <TbSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, keahlian, unit kerja…"
                            className="w-full h-11 pl-10 pr-9 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal border-none"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                                <TbX className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <NSelect value={filterKeahlian} onChange={setFilterKeahlian} placeholder="Semua keahlian" options={options.keahlian.map((x) => [x, x])} />
                    <NSelect value={filterJabatan} onChange={setFilterJabatan} placeholder="Semua jabatan" options={options.jabatan.map((x) => [x, x])} />
                    <NSelect value={filterStatus} onChange={setFilterStatus} placeholder="Semua status" options={options.status.map((x) => [x, x])} />
                    <NSelect value={filterUnitKerja} onChange={setFilterUnitKerja} placeholder="Semua unit kerja" options={options.unit} />
                </div>
                <div className="shrink-0 px-4 md:px-5 pb-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                        <span>{loadingInstruktur && !rows.length ? "Memuat instruktur…" : `${filtered.length} dari ${rows.length} instruktur`}</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                            <input type="checkbox" checked={onlySelected} onChange={(e) => setOnlySelected(e.target.checked)} className="accent-[#0B1B3F]" />
                            Hanya yang terpilih
                        </label>
                    </div>
                    {hasFilter && <button type="button" onClick={resetFilters} className="font-semibold text-blue-600 hover:underline">Reset filter</button>}
                </div>

                {/* Daftar */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-6 md:px-5 pb-4 mt-5">
                    {loadingInstruktur && !rows.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />)}
                        </div>
                    ) : errorInstruktur ? (
                        <div className="flex flex-col items-center gap-3 py-14 text-center">
                            <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><TbAlertTriangle className="w-5 h-5" /></span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Data instruktur gagal dimuat</p>
                            <button type="button" onClick={() => fetchInstrukturData()} className="h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-50">
                                <TbRefresh className="w-4 h-4" /> Coba lagi
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-14 text-center">
                            <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center"><TbUser className="w-5 h-5" /></span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada instruktur ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 [&>*]:min-w-0">
                            {filtered.map(({ i, unit }) => {
                                const on = selectedIds.includes(i.IdInstruktur);
                                return (
                                    <button
                                        key={i.IdInstruktur}
                                        type="button"
                                        onClick={() => toggle(i.IdInstruktur)}
                                        aria-pressed={on}
                                        className={`group relative isolate overflow-hidden min-w-0 w-full text-left rounded-2xl p-4 ring-1 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${on ? "bg-teal-50/60 dark:bg-teal-950/20 ring-2 ring-teal-400" : "bg-white dark:bg-slate-900 ring-slate-200/80 dark:ring-slate-800 hover:ring-blue-200"}`}
                                    >
                                        <TbUser aria-hidden className="pointer-events-none absolute -right-4 -bottom-5 -z-10 w-24 h-24 -rotate-12 text-teal-500 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity" />
                                        <div className="flex items-start gap-3">
                                            <span className={`relative isolate overflow-hidden grid place-items-center w-10 h-10 rounded-xl shrink-0 text-xs font-black ${on ? "bg-teal-500 text-white" : "bg-[#0B1B3F] text-white"}`}>
                                                {!on && <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#14B8A6_0%,transparent_70%)]" />}
                                                {on ? <TbCheck className="w-5 h-5" /> : initials(i.nama)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 break-words">{i.nama}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{unit}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {i.bidang_keahlian && <span className="max-w-full truncate rounded-md bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-100 dark:ring-teal-900/40 px-1.5 py-0.5 text-[10px] font-bold">{i.bidang_keahlian}</span>}
                                            {i.jenjang_jabatan && <span className="max-w-full truncate rounded-md bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{i.jenjang_jabatan}</span>}
                                            {i.status && <span className="rounded-md bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{i.status}</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <p className="min-w-0 text-[11px] text-slate-400 truncate">
                        {!selectedIds.length ? "Pilih minimal satu instruktur" : dirty ? `${selectedIds.length} instruktur akan ditetapkan` : "Belum ada perubahan"}
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={close} disabled={saving} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving || !selectedIds.length || !dirty}
                            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                        >
                            {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbChecks className="w-4 h-4" />}
                            {saving ? "Menyimpan…" : `Simpan${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
                        </button>
                    </div>
                </div>
            </ActionModal>
        </>
    );
};

function NSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: [string, string][] }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-11 border-none w-full min-w-0 lg:w-40 rounded-xl px-3 text-xs font-bold outline-none ring-1  cursor-pointer truncate ${value ? "bg-[#0B1B3F] text-white ring-[#0B1B3F]" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700"}`}
        >
            <option value="">{placeholder}</option>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
    );
}

export default ChooseInstrukturAction;

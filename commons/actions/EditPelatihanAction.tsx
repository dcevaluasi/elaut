"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
    TbEditCircle, TbX, TbMapPin, TbCheck, TbLoader2, TbSchool, TbLayoutGrid, TbFileText, TbCurrencyDollar,
    TbBuildingCommunity, TbDeviceLaptop, TbClock, TbAlertCircle, TbRotate, TbStar, TbHierarchy,
} from "react-icons/tb";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { UPT } from "@/constants/nomenclatures";
import { DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN, JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN, SEKTOR_PELATIHAN } from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import ManageProgramPelatihanAction from "./master/program-pelatihan/ManageProgramPelatihanAction";

interface EditPelatihanActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

interface FormState {
    NamaPelatihan: string;
    LokasiPelatihan: string;
    JenisProgram: string;
    BidangPelatihan: string;
    Program: string;
    JenisPelatihan: string;
    DukunganProgramTerobosan: string;
    PenyelenggaraPelatihan: string;
    PelaksanaanPelatihan: string;
    TanggalMulaiPelatihan: string;
    TanggalBerakhirPelatihan: string;
    HargaPelatihan: number;
}

const EDITABLE_STATUS = ["0", "1.2", "3"];
const BERBAYAR = "PNBP/BLU - Berbayar";

const toDateInput = (v?: string) => (v ? String(v).slice(0, 10) : "");
const fromData = (d?: PelatihanMasyarakat): FormState => ({
    NamaPelatihan: d?.NamaPelatihan || "",
    LokasiPelatihan: d?.LokasiPelatihan || "",
    JenisProgram: d?.JenisProgram || "",
    BidangPelatihan: d?.BidangPelatihan || "",
    Program: d?.Program || "",
    JenisPelatihan: d?.JenisPelatihan || "",
    DukunganProgramTerobosan: d?.DukunganProgramTerobosan || "",
    PenyelenggaraPelatihan: d?.PenyelenggaraPelatihan || "",
    PelaksanaanPelatihan: d?.PelaksanaanPelatihan || "",
    TanggalMulaiPelatihan: toDateInput(d?.TanggalMulaiPelatihan),
    TanggalBerakhirPelatihan: toDateInput(d?.TanggalBerakhirPelatihan),
    HargaPelatihan: Number(d?.HargaPelatihan) || 0,
});

const DATE_FMT = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const durasi = (a: string, b: string) => (a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) + 1 : 0);

/* ============================ KOMPONEN ============================ */

const EditPelatihanAction: React.FC<EditPelatihanActionProps> = ({ idPelatihan, currentData, onSuccess }) => {
    const [hasAccess] = useState(() => !!Cookies.get("Access")?.includes("createPelatihan"));
    const canEdit = hasAccess && EDITABLE_STATUS.includes(String(currentData?.StatusPenerbitan ?? ""));
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(() => fromData(currentData));
    const [tried, setTried] = useState(false);
    const [saving, setSaving] = useState(false);

    const { data: dataRumpun, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();

    // Isi ulang dari data terbaru setiap kali dibuka
    const initial = useMemo(() => fromData(currentData), [currentData]);
    useEffect(() => {
        if (open) {
            setForm(initial);
            setTried(false);
        }
    }, [open, initial]);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

    const rumpunName = (r: any) => r?.name || r?.nama_rumpun_pelatihan || "";
    const selectedRumpun = useMemo(() => dataRumpun?.find((r) => rumpunName(r) === form.BidangPelatihan) || null, [dataRumpun, form.BidangPelatihan]);
    const programOptions = useMemo(() => {
        const list = (selectedRumpun?.programs || []).map((p) => p.name_indo).filter(Boolean) as string[];
        // jaga nilai lama yang tidak ada di daftar
        if (form.Program && !list.includes(form.Program)) list.unshift(form.Program);
        return list;
    }, [selectedRumpun, form.Program]);

    /* ---------- Validasi & perubahan ---------- */
    const errors = {
        NamaPelatihan: !form.NamaPelatihan.trim(),
        BidangPelatihan: !form.BidangPelatihan,
        Program: !form.Program,
        Tanggal: !!form.TanggalMulaiPelatihan && !!form.TanggalBerakhirPelatihan && form.TanggalBerakhirPelatihan < form.TanggalMulaiPelatihan,
        HargaPelatihan: form.JenisPelatihan === BERBAYAR && !(form.HargaPelatihan > 0),
    };
    const invalid = Object.values(errors).some(Boolean);
    const changedKeys = (Object.keys(form) as (keyof FormState)[]).filter((k) => form[k] !== initial[k]);
    const dirty = changedKeys.length > 0;
    const err = (k: keyof typeof errors) => tried && errors[k];

    const requestClose = () => {
        if (saving) return;
        if (dirty && !window.confirm("Perubahan belum disimpan. Tutup tanpa menyimpan?")) return;
        setOpen(false);
    };

    const submit = async () => {
        setTried(true);
        if (invalid) {
            Toast.fire({ icon: "warning", title: "Periksa kembali isian yang ditandai" });
            return;
        }
        if (!dirty) return;
        setSaving(true);
        try {
            await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                { ...form, NamaPelatihan: form.NamaPelatihan.trim(), LokasiPelatihan: form.LokasiPelatihan.trim(), HargaPelatihan: form.JenisPelatihan === BERBAYAR ? form.HargaPelatihan : 0 },
                { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
            );
            Toast.fire({ icon: "success", title: "Informasi pelatihan diperbarui", text: `${changedKeys.length} isian berubah` });
            setOpen(false);
            onSuccess?.();
        } catch (e: any) {
            console.error("ERROR UPDATE PELATIHAN:", e);
            Toast.fire({ icon: "error", title: "Gagal memperbarui", text: e?.response?.data?.message || "Terjadi kesalahan, coba lagi." });
        } finally {
            setSaving(false);
        }
    };

    if (!canEdit) return null;

    const hari = durasi(form.TanggalMulaiPelatihan, form.TanggalBerakhirPelatihan);
    const changed = (k: keyof FormState) => form[k] !== initial[k];

    return (
        <>
            {/* Tombol putih, selaras tombol aksi lain */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <TbEditCircle className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:-rotate-12" />
                Edit Informasi
            </button>

            <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : requestClose())}>
                <DialogContent
                    onInteractOutside={(e) => dirty && e.preventDefault()}
                    className="w-[calc(100vw-1.5rem)] sm:w-full max-w-3xl sm:max-w-3xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
                >
                    {/* Header hero */}
                    <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#F59E0B_0%,transparent_60%)] opacity-80" />
                        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                        <TbEditCircle aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-amber-300 opacity-20" />

                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Edit Informasi Pelatihan</p>
                                <DialogTitle className="mt-1 text-base md:text-lg font-black text-white leading-snug line-clamp-2 break-words">
                                    {form.NamaPelatihan || "Tanpa nama"}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-blue-100/70">
                                    Kode <span className="font-mono text-sky-200">{currentData?.KodePelatihan || "-"}</span> · Stage {currentData?.StatusPenerbitan || "0"}
                                </DialogDescription>
                            </div>
                            <button type="button" onClick={requestClose} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20">
                                <TbX className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg ring-1 ${dirty ? "bg-amber-400/20 ring-amber-300/40 text-amber-100" : "bg-white/10 ring-white/15 text-blue-100/70"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dirty ? "bg-amber-300" : "bg-white/40"}`} />
                                {dirty ? `${changedKeys.length} isian diubah` : "Belum ada perubahan"}
                            </span>
                            {hari > 0 && <span className="inline-flex items-center h-7 px-2.5 rounded-lg bg-white/10 ring-1 ring-white/15 text-blue-100/80">{hari} hari pelaksanaan</span>}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5 space-y-4">
                        <Section no="01" title="Identitas" desc="Nama & lokasi kegiatan" icon={TbSchool}>
                            <Field label="Nama kegiatan" required className="md:col-span-2" error={err("NamaPelatihan") ? "Wajib diisi" : undefined} changed={changed("NamaPelatihan")}>
                                <input value={form.NamaPelatihan} onChange={(e) => set("NamaPelatihan", e.target.value.toUpperCase())} placeholder="NAMA KEGIATAN PELATIHAN" className={inputCls(err("NamaPelatihan"))} />
                            </Field>
                            <Field label="Lokasi" icon={TbMapPin} changed={changed("LokasiPelatihan")}>
                                <input value={form.LokasiPelatihan} onChange={(e) => set("LokasiPelatihan", e.target.value)} placeholder="BPPP Medan / Online" className={inputCls()} />
                            </Field>
                            <Field label="Penyelenggara" icon={TbBuildingCommunity} changed={changed("PenyelenggaraPelatihan")}>
                                <NativeSelect value={form.PenyelenggaraPelatihan} onChange={(v) => set("PenyelenggaraPelatihan", v)} options={UPT} placeholder="Pilih penyelenggara" />
                            </Field>
                        </Section>

                        <Section no="02" title="Klasifikasi" desc="Sektor, klaster & program" icon={TbLayoutGrid}>
                            <Field label="Sektor" icon={TbHierarchy} changed={changed("JenisProgram")}>
                                <NativeSelect value={form.JenisProgram} onChange={(v) => set("JenisProgram", v)} options={SEKTOR_PELATIHAN} placeholder="Pilih sektor" />
                            </Field>
                            <Field label="Klaster" required error={err("BidangPelatihan") ? "Wajib dipilih" : undefined} changed={changed("BidangPelatihan")}>
                                <NativeSelect
                                    value={form.BidangPelatihan}
                                    onChange={(v) => setForm((f) => ({ ...f, BidangPelatihan: v, Program: v === initial.BidangPelatihan ? initial.Program : "" }))}
                                    options={(dataRumpun || []).map(rumpunName).filter(Boolean)}
                                    placeholder={dataRumpun ? "Pilih klaster" : "Memuat klaster…"}
                                    error={err("BidangPelatihan")}
                                />
                            </Field>
                            <Field label="Program" required icon={TbFileText} className="md:col-span-2" error={err("Program") ? "Wajib dipilih" : undefined} changed={changed("Program")}>
                                <div className="flex gap-2">
                                    <div className="flex-1 min-w-0">
                                        <NativeSelect
                                            value={form.Program}
                                            onChange={(v) => set("Program", v)}
                                            options={programOptions}
                                            placeholder={form.BidangPelatihan ? (programOptions.length ? "Pilih program" : "Belum ada program di klaster ini") : "Pilih klaster dulu"}
                                            disabled={!form.BidangPelatihan}
                                            error={err("Program")}
                                        />
                                    </div>
                                    <ManageProgramPelatihanAction
                                        onSuccess={() => {
                                            fetchRumpunPelatihan();
                                            Toast.fire({ icon: "success", title: "Program pelatihan ditambahkan" });
                                        }}
                                    />
                                </div>
                            </Field>
                        </Section>

                        <Section no="03" title="Pelaksanaan & Pembiayaan" desc="Metode, sumber dana & program prioritas" icon={TbDeviceLaptop}>
                            <Field label="Metode pelaksanaan" className="md:col-span-2" changed={changed("PelaksanaanPelatihan")}>
                                <Choice options={JENIS_PELAKSANAAN} value={form.PelaksanaanPelatihan} onChange={(v) => set("PelaksanaanPelatihan", v)} />
                            </Field>
                            <Field label="Sumber pembiayaan" className="md:col-span-2" changed={changed("JenisPelatihan")}>
                                <Choice options={JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN} value={form.JenisPelatihan} onChange={(v) => set("JenisPelatihan", v)} />
                            </Field>
                            {form.JenisPelatihan === BERBAYAR && (
                                <Field label="Biaya per peserta" required icon={TbCurrencyDollar} error={err("HargaPelatihan") ? "Isi biaya pelatihan" : undefined} changed={changed("HargaPelatihan")}>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                                        <input
                                            inputMode="numeric"
                                            value={form.HargaPelatihan ? new Intl.NumberFormat("id-ID").format(form.HargaPelatihan) : ""}
                                            onChange={(e) => set("HargaPelatihan", Number(e.target.value.replace(/\D/g, "")) || 0)}
                                            placeholder="0"
                                            className={`${inputCls(err("HargaPelatihan"))} pl-10 font-bold tabular-nums`}
                                        />
                                    </div>
                                </Field>
                            )}
                            <Field label="Dukungan program terobosan" icon={TbStar} className={form.JenisPelatihan === BERBAYAR ? "" : "md:col-span-2"} changed={changed("DukunganProgramTerobosan")}>
                                <NativeSelect value={form.DukunganProgramTerobosan} onChange={(v) => set("DukunganProgramTerobosan", v)} options={DUKUNGAN_PROGRAM_TEROBOSAN} placeholder="Pilih dukungan program" />
                            </Field>
                        </Section>

                        <Section no="04" title="Jadwal" desc="Waktu pelaksanaan" icon={TbClock}>
                            <Field label="Tanggal mulai" changed={changed("TanggalMulaiPelatihan")}>
                                <input
                                    type="date"
                                    value={form.TanggalMulaiPelatihan}
                                    onChange={(e) => set("TanggalMulaiPelatihan", e.target.value)}
                                    className={inputCls()}
                                />
                            </Field>
                            <Field label="Tanggal berakhir" error={err("Tanggal") ? "Tidak boleh sebelum tanggal mulai" : undefined} changed={changed("TanggalBerakhirPelatihan")}>
                                <input
                                    type="date"
                                    min={form.TanggalMulaiPelatihan || undefined}
                                    value={form.TanggalBerakhirPelatihan}
                                    onChange={(e) => set("TanggalBerakhirPelatihan", e.target.value)}
                                    className={inputCls(err("Tanggal"))}
                                />
                            </Field>
                            {hari > 0 && !errors.Tanggal && (
                                <p className="md:col-span-2 -mt-1 text-xs text-slate-500">
                                    {DATE_FMT.format(new Date(form.TanggalMulaiPelatihan))} – {DATE_FMT.format(new Date(form.TanggalBerakhirPelatihan))} · <b className="text-slate-800 dark:text-white">{hari} hari</b>
                                </p>
                            )}
                        </Section>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            {tried && invalid ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
                                    <TbAlertCircle className="w-4 h-4" /> Ada isian yang perlu diperbaiki
                                </span>
                            ) : (
                                dirty && (
                                    <button type="button" onClick={() => setForm(initial)} disabled={saving} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
                                        <TbRotate className="w-3.5 h-3.5" /> Kembalikan semula
                                    </button>
                                )
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={requestClose} disabled={saving} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={saving || !dirty}
                                className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                            >
                                {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />}
                                {saving ? "Menyimpan…" : dirty ? "Simpan Perubahan" : "Tidak ada perubahan"}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

/* ============================ UI ============================ */

type IconType = React.ElementType;

const inputCls = (error?: boolean) =>
    `w-full h-11 px-3.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 ring-1 ${error ? "ring-rose-300 bg-rose-50/40" : "ring-slate-200 dark:ring-slate-700"} text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal transition disabled:opacity-50`;

function Section({ no, title, desc, icon: Icon, children }: { no: string; title: string; desc: string; icon: IconType; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%)]" />
                    <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Bagian {no}</p>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                </div>
                <p className="ml-auto hidden sm:block text-[11px] text-slate-400">{desc}</p>
            </header>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

function Field({ label, required, icon: Icon, error, changed, className = "", children }: { label: string; required?: boolean; icon?: IconType; error?: string; changed?: boolean; className?: string; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 min-w-0 ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
                {changed && <span className="text-[10px] font-bold text-amber-600">diubah</span>}
            </div>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
                    <TbAlertCircle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}

function NativeSelect({ value, onChange, options, placeholder, disabled, error }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string; disabled?: boolean; error?: boolean }) {
    // nilai lama yang tidak ada di daftar tetap ditampilkan
    const opts = value && !options.includes(value) ? [value, ...options] : options;
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`${inputCls(error)} truncate`}>
            <option value="">{placeholder}</option>
            {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
            ))}
        </select>
    );
}

function Choice({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
            {options.map((o) => {
                const active = value === o;
                return (
                    <button
                        key={o}
                        type="button"
                        onClick={() => onChange(o)}
                        aria-pressed={active}
                        className={`flex-1 min-w-[120px] h-9 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${active ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-white dark:hover:bg-slate-700"}`}
                    >
                        {active && <TbCheck className="w-3.5 h-3.5" />} {o}
                    </button>
                );
            })}
        </div>
    );
}

export default EditPelatihanAction;

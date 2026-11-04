"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { User } from "@/types/user";
import { KABUPATENS, PROVINCES } from "@/constants/regions";
import {
    TbAlertTriangle, TbBuilding, TbCalendar, TbCamera, TbCheck, TbChevronDown, TbFileText, TbGenderBigender,
    TbId, TbLoader2, TbMail, TbMapPin, TbPhone, TbRefresh, TbSchool, TbTrash, TbUser, TbUserEdit, TbX,
    TbExternalLink, TbFileTypePdf, TbPhotoOff, TbUpload, TbCircleCheck, TbCircleX, TbClockHour4,
} from "react-icons/tb";
import AppDialog from "./AppDialog";

interface EditPesertaActionProps {
    idPelatihan?: string;
    idPeserta: string;
    onSuccess?: () => void;
    /** "icon" = tombol ikon kecil untuk dipakai di tabel */
    variant?: "button" | "icon";
}

type IconType = React.ComponentType<{ className?: string }>;

type Form = {
    nama: string;
    nik: string;
    noTelpon: string;
    email: string;
    alamat: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: string;
    pendidikanTerakhir: string;
    institusi: string;
    provinsi: string;
    kabupaten: string;
};

const EMPTY: Form = { nama: "", nik: "", noTelpon: "", email: "", alamat: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "", pendidikanTerakhir: "", institusi: "", provinsi: "", kabupaten: "" };

/** Sama dengan daftar valid di Import Peserta */
const PENDIDIKAN = ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Di/Dii/DIII", "DIV/S1", "S2", "S3", "Tidak Bersekolah", "Tidak Diketahui"];
const JENIS_KELAMIN: [string, string][] = [["L", "Laki-laki"], ["P", "Perempuan"]];

// ⚠️ Kunci ini terlihat di browser. Sebaiknya endpoint "NoJwt" diganti endpoint ber-JWT admin.
const API_KEY = process.env.NEXT_PUBLIC_ELAUT_NOJWT_KEY || "EL@uTs3rv3R";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const toForm = (u: User): Form => ({
    nama: u.Nama || "",
    nik: u.Nik?.toString() || "",
    noTelpon: u.NoTelpon?.toString() || "",
    email: u.Email || "",
    alamat: u.Alamat || "",
    tempatLahir: u.TempatLahir || "",
    tanggalLahir: u.TanggalLahir || "",
    jenisKelamin: u.JenisKelamin || "",
    pendidikanTerakhir: u.PendidikanTerakhir || "",
    institusi: u.Status || "",
    provinsi: u.Provinsi || "",
    kabupaten: u.Kota || "",
});

const validate = (f: Form): Partial<Record<keyof Form, string>> => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!f.nama.trim()) e.nama = "Nama wajib diisi";
    if (!/^\d{16}$/.test(f.nik.trim())) e.nik = "NIK harus 16 digit angka";
    if (f.email && !EMAIL_RE.test(f.email.trim())) e.email = "Format email tidak valid";
    if (f.noTelpon && !/^\+?\d{9,15}$/.test(f.noTelpon.replace(/[\s-]/g, ""))) e.noTelpon = "9–15 digit angka";
    if (f.jenisKelamin && !["L", "P"].includes(f.jenisKelamin)) e.jenisKelamin = "Pilih L atau P";
    return e;
};

const EditPesertaAction: React.FC<EditPesertaActionProps> = ({ idPeserta, onSuccess, variant = "button" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [current, setCurrent] = useState<User | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [form, setForm] = useState<Form>(EMPTY);
    const [initial, setInitial] = useState<Form>(EMPTY);
    const [foto, setFoto] = useState<File | null>(null);
    const [ktp, setKtp] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [tried, setTried] = useState(false);

    const load = useCallback(async () => {
        setStatus("loading");
        try {
            const res = await axios.get<User>(`${elautBaseUrl}/users/getUsersByIdNoJwt?id=${idPeserta}`, { headers: { "x-api-key": API_KEY } });
            const f = toForm(res.data);
            setCurrent(res.data);
            setForm(f);
            setInitial(f);
            setStatus("ready");
        } catch (e) {
            console.error(e);
            setStatus("error");
        }
    }, [idPeserta]);

    useEffect(() => {
        if (isOpen) load();
    }, [isOpen, load]);

    const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

    // Kab/Kota mengikuti provinsi bila data region punya field provinsi
    const kabOptions = useMemo(() => {
        const all = KABUPATENS as unknown as { kabupaten: string; provinsi?: string }[];
        const hasProv = all.some((k) => k.provinsi);
        const list = hasProv && form.provinsi ? all.filter((k) => k.provinsi === form.provinsi) : all;
        const names = Array.from(new Set(list.map((k) => k.kabupaten)));
        if (form.kabupaten && !names.includes(form.kabupaten)) names.unshift(form.kabupaten);
        return names;
    }, [form.provinsi, form.kabupaten]);

    // Nilai lama yang tidak ada di daftar tetap ditampilkan agar tidak hilang
    const pendidikanOptions = useMemo(
        () => (form.pendidikanTerakhir && !PENDIDIKAN.includes(form.pendidikanTerakhir) ? [form.pendidikanTerakhir, ...PENDIDIKAN] : PENDIDIKAN),
        [form.pendidikanTerakhir]
    );

    const errors = useMemo(() => validate(form), [form]);
    const err = (k: keyof Form) => (tried ? errors[k] : undefined);
    const dirty = !!foto || !!ktp || (Object.keys(form) as (keyof Form)[]).some((k) => form[k] !== initial[k]);

    const close = () => {
        if (saving) return;
        setIsOpen(false);
        setFoto(null);
        setKtp(null);
        setTried(false);
    };

    const handleSubmit = async () => {
        setTried(true);
        if (Object.keys(errors).length) {
            Toast.fire({ icon: "warning", title: "Periksa kembali isian", text: Object.values(errors).join(", ") });
            return;
        }
        const fd = new FormData();
        fd.append("Nama", form.nama.trim());
        fd.append("Nik", form.nik.trim());
        fd.append("NoTelpon", form.noTelpon.trim());
        fd.append("Email", form.email.trim());
        fd.append("Alamat", form.alamat.trim());
        fd.append("TempatLahir", form.tempatLahir.trim());
        fd.append("TanggalLahir", form.tanggalLahir.trim());
        fd.append("JenisKelamin", form.jenisKelamin);
        fd.append("PendidikanTerakhir", form.pendidikanTerakhir);
        fd.append("Status", form.institusi.trim());
        fd.append("Provinsi", form.provinsi);
        fd.append("Kota", form.kabupaten);
        if (foto) fd.append("Fotos", foto);
        if (ktp) fd.append("Ktps", ktp);

        setSaving(true);
        try {
            await axios.put(`${elautBaseUrl}/users/updateUsersNoJwt?id=${idPeserta}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            Toast.fire({ icon: "success", title: "Data peserta diperbarui", text: form.nama });
            setSaving(false);
            close();
            onSuccess?.();
        } catch (e) {
            console.error("ERROR UPDATE PESERTA:", e);
            setSaving(false);
            Toast.fire({ icon: "error", title: "Gagal menyimpan", text: "Terjadi kesalahan saat memperbarui peserta." });
        }
    };

    const errCount = tried ? Object.keys(errors).length : 0;

    return (
        <>
            {variant === "icon" ? (
                <button type="button" onClick={() => setIsOpen(true)} title="Edit peserta" aria-label="Edit peserta" className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 inline-flex items-center justify-center shadow-sm transition-all">
                    <TbUserEdit className="w-4 h-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                    <TbUserEdit className="w-4 h-4 text-blue-600 transition-transform duration-300 group-hover:-rotate-6" />
                    Edit Peserta
                </button>
            )}

            <AppDialog open={isOpen} onClose={close} title="Edit peserta" maxWidth="sm:max-w-2xl" locked={saving}>
                {/* Header hero */}
                <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    <TbUserEdit aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-sky-300 opacity-20" />

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/90">Edit Peserta</p>
                            <h2 id="edit-peserta-title" className="mt-1 text-base md:text-lg font-black text-white leading-snug truncate">{current?.Nama || "Data peserta"}</h2>
                            <p className="text-xs text-blue-100/70 tabular-nums">{current?.Nik ? `NIK ${current.Nik}` : "Perbarui data registrasi dan dokumen peserta."}</p>
                        </div>
                        <button type="button" onClick={close} disabled={saving} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                            <TbX className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-4 md:p-5 space-y-4">
                    {status === "loading" || status === "idle" ? (
                        <div className="space-y-3">
                            {[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />)}
                        </div>
                    ) : status === "error" ? (
                        <div className="flex flex-col items-center gap-3 py-14 text-center">
                            <span className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><TbAlertTriangle className="w-5 h-5" /></span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Data peserta gagal dimuat</p>
                            <button type="button" onClick={load} className="h-9 px-3.5 rounded-xl bg-white ring-1 ring-slate-200 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-slate-50">
                                <TbRefresh className="w-4 h-4" /> Coba lagi
                            </button>
                        </div>
                    ) : (
                        <>
                            <Section no="01" title="Identitas" icon={TbId} accent="#3B82F6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Field label="Nama lengkap" icon={TbUser} required error={err("nama")}>
                                        <input value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama sesuai KTP" className={inputCls(!!err("nama"))} />
                                    </Field>
                                    <Field label="NIK" icon={TbId} required error={err("nik")} hint={`${form.nik.length}/16`}>
                                        <input value={form.nik} inputMode="numeric" maxLength={16} onChange={(e) => set("nik", e.target.value.replace(/\D/g, ""))} placeholder="16 digit NIK" className={`${inputCls(!!err("nik"))} font-mono tracking-wider`} />
                                    </Field>
                                    <Field label="Jenis kelamin" icon={TbGenderBigender} error={err("jenisKelamin")}>
                                        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                            {JENIS_KELAMIN.map(([v, l]) => (
                                                <button key={v} type="button" onClick={() => set("jenisKelamin", v)} aria-pressed={form.jenisKelamin === v} className={`h-9 rounded-lg text-xs font-bold transition-all ${form.jenisKelamin === v ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-white dark:hover:bg-slate-700"}`}>
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Pendidikan terakhir" icon={TbSchool}>
                                        <NSelect value={form.pendidikanTerakhir} onChange={(v) => set("pendidikanTerakhir", v)} placeholder="Pilih pendidikan" options={pendidikanOptions} />
                                    </Field>
                                    <Field label="Tempat lahir" icon={TbMapPin}>
                                        <input value={form.tempatLahir} onChange={(e) => set("tempatLahir", e.target.value)} placeholder="Kota kelahiran" className={inputCls(false)} />
                                    </Field>
                                    <Field label="Tanggal lahir" icon={TbCalendar} hint="mis. 15 APRIL 1990">
                                        <input value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} placeholder="15 APRIL 1990" className={inputCls(false)} />
                                    </Field>
                                </div>
                            </Section>

                            <Section no="02" title="Kontak & domisili" icon={TbMapPin} accent="#10B981">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Field label="No. telepon / WA" icon={TbPhone} error={err("noTelpon")}>
                                        <input value={form.noTelpon} inputMode="tel" onChange={(e) => set("noTelpon", e.target.value)} placeholder="0812…" className={`${inputCls(!!err("noTelpon"))} tabular-nums`} />
                                    </Field>
                                    <Field label="Email" icon={TbMail} error={err("email")}>
                                        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" className={inputCls(!!err("email"))} />
                                    </Field>
                                    <Field label="Provinsi" icon={TbMapPin}>
                                        <NSelect value={form.provinsi} onChange={(v) => setForm((f) => ({ ...f, provinsi: v, kabupaten: v !== f.provinsi ? "" : f.kabupaten }))} placeholder="Pilih provinsi" options={PROVINCES.map((p) => p.provinsi)} />
                                    </Field>
                                    <Field label="Kabupaten / kota" icon={TbMapPin}>
                                        <NSelect value={form.kabupaten} onChange={(v) => set("kabupaten", v)} placeholder="Pilih kabupaten/kota" options={kabOptions} />
                                    </Field>
                                    <Field label="Alamat lengkap" icon={TbMapPin} className="md:col-span-2">
                                        <textarea rows={2} value={form.alamat} onChange={(e) => set("alamat", e.target.value)} placeholder="Jalan, RT/RW, kelurahan, kecamatan…" className={`${inputCls(false)} h-auto py-2.5 resize-none`} />
                                    </Field>
                                    <Field label="Instansi / institusi" icon={TbBuilding} className="md:col-span-2">
                                        <input value={form.institusi} onChange={(e) => set("institusi", e.target.value)} placeholder="Nama instansi atau sekolah" className={inputCls(false)} />
                                    </Field>
                                </div>
                            </Section>

                            <Section
                                no="03"
                                title="Dokumen"
                                icon={TbFileText}
                                accent="#8B5CF6"
                                aside={(() => {
                                    const n = [current?.Foto, current?.Ktp].filter(fileOk).length;
                                    return (
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black tabular-nums ring-1 ${n === 2 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : n ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`}>
                                            {n}/2 tersedia
                                        </span>
                                    );
                                })()}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <DocCard label="Pas foto" icon={TbCamera} accept="image/*" file={foto} onPick={setFoto} current={current?.Foto} portrait />
                                    <DocCard label="KTP / identitas" icon={TbId} accept="image/*,.pdf" file={ktp} onPick={setKtp} current={current?.Ktp} />
                                </div>
                            </Section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <p className={`min-w-0 text-[11px] truncate ${errCount ? "text-rose-500" : "text-slate-400"}`}>
                        {errCount ? `${errCount} isian perlu diperbaiki` : dirty ? "Ada perubahan belum disimpan" : "Belum ada perubahan"}
                    </p>
                    <div className="flex gap-2">
                        <button type="button" onClick={close} disabled={saving} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving || status !== "ready" || !dirty}
                            className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                        >
                            {saving ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />}
                            {saving ? "Menyimpan…" : "Simpan Perubahan"}
                        </button>
                    </div>
                </div>
            </AppDialog>
        </>
    );
};

/* ===================== UI ===================== */

const inputCls = (invalid: boolean) =>
    `w-full h-11 px-3.5 border-none rounded-xl bg-slate-50 dark:bg-slate-800 ring-1 ${invalid ? "ring-rose-300 bg-rose-50/40" : "ring-slate-200 dark:ring-slate-700"} text-sm font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 placeholder:font-normal transition`;

function Section({ no, title, icon: Icon, accent, aside, children }: { no: string; title: string; icon: IconType; accent: string; aside?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                    <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
                    <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Bagian {no}</p>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                </div>
                {aside && <div className="ml-auto">{aside}</div>}
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

function Field({ label, icon: Icon, required, error, hint, className = "", children }: { label: string; icon?: IconType; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={`space-y-1.5 min-w-0 ${className}`}>
            <div className="flex items-baseline justify-between gap-2">
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />} {label} {required && <span className="text-rose-500">*</span>}
                </label>
                {hint && <span className="text-[10px] text-slate-400 tabular-nums">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
        </div>
    );
}

function NSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
    return (
        <div className="relative">
            <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls(false)} appearance-none pr-9 cursor-pointer ${value ? "" : "text-slate-400"}`}>
                <option value="">{placeholder}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <TbChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
    );
}

/* ---------- Dokumen ---------- */

const pathOf = (v = "") => v.split("?")[0].split("#")[0];
/** Ada file bila nilainya bukan kosong / bukan folder ("…/") dan punya ekstensi */
const fileOk = (v?: string) => !!v && !v.trim().endsWith("/") && /\.[a-z0-9]{2,5}$/i.test(pathOf(v.trim()));
const isImageName = (v = "") => /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(pathOf(v));
const isPdfName = (v = "") => /\.pdf$/i.test(pathOf(v));
const fileNameOf = (v = "") => decodeURIComponent(pathOf(v).split("/").pop() || v);

type DocState = "baru" | "ada" | "rusak" | "kosong";
const STATE_UI: Record<DocState, { label: string; icon: IconType; cls: string }> = {
    baru: { label: "Baru · belum disimpan", icon: TbClockHour4, cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/40" },
    ada: { label: "Tersedia", icon: TbCircleCheck, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/40" },
    rusak: { label: "File tidak dapat dibuka", icon: TbPhotoOff, cls: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/40" },
    kosong: { label: "Belum ada", icon: TbCircleX, cls: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/40" },
};

/**
 * Kartu dokumen dengan pratinjau besar + status jelas:
 * Tersedia (hijau) · Belum ada (merah) · File rusak/tidak dapat dibuka (merah) · Baru dipilih (kuning).
 */
function DocCard({ label, icon: Icon, accept, file, onPick, current, portrait }: { label: string; icon: IconType; accept: string; file: File | null; onPick: (f: File | null) => void; current?: string; portrait?: boolean }) {
    const id = `pick-${label.replace(/\W+/g, "-").toLowerCase()}`;
    const url = (current || "").trim();
    const hasCurrent = fileOk(url);
    const canOpen = hasCurrent && /^https?:\/\//i.test(url);
    const [broken, setBroken] = useState(false);
    const [drag, setDrag] = useState(false);
    useEffect(() => setBroken(false), [url]);

    const preview = useMemo(() => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null), [file]);
    useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

    const state: DocState = file ? "baru" : !hasCurrent ? "kosong" : broken ? "rusak" : "ada";
    const ui = STATE_UI[state];
    const imgSrc = preview || (!file && canOpen && isImageName(url) && !broken ? url : null);
    const showPdf = file ? file.type === "application/pdf" || isPdfName(file.name) : hasCurrent && isPdfName(url);
    const name = file ? file.name : hasCurrent ? fileNameOf(url) : "";

    return (
        <div className={`min-w-0 overflow-hidden rounded-2xl ring-1 bg-white dark:bg-slate-900 ${state === "kosong" || state === "rusak" ? "ring-rose-200 dark:ring-rose-900/40" : state === "baru" ? "ring-amber-200 dark:ring-amber-900/40" : "ring-slate-200 dark:ring-slate-700"}`}>
            {/* Judul + status */}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white min-w-0">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{label}</span>
                </span>
                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${ui.cls}`}>
                    <ui.icon className="w-3 h-3" /> {ui.label}
                </span>
            </div>

            {/* Pratinjau (juga area klik / seret file) */}
            <label
                htmlFor={id}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    onPick(e.dataTransfer.files?.[0] || null);
                }}
                title={hasCurrent || file ? "Klik atau seret file untuk mengganti" : "Klik atau seret file untuk mengunggah"}
                className={`group relative block ${portrait ? "aspect-[3/4] max-h-64" : "aspect-[16/10]"} mx-3 rounded-xl overflow-hidden cursor-pointer ${drag ? "ring-2 ring-blue-400" : ""} ${imgSrc ? "bg-slate-900" : state === "kosong" ? "bg-rose-50/50 dark:bg-rose-950/10 border-2 border-dashed border-rose-200 dark:border-rose-900/40" : "bg-slate-50 dark:bg-slate-800"}`}
            >
                {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={label} onError={() => !file && setBroken(true)} className="absolute inset-0 w-full h-full object-contain" />
                ) : showPdf ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-rose-600">
                        <TbFileTypePdf className="w-12 h-12" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Dokumen PDF</span>
                    </span>
                ) : state === "rusak" ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-rose-500 px-4 text-center">
                        <TbPhotoOff className="w-10 h-10" />
                        <span className="text-[11px] font-bold">Gambar gagal dimuat</span>
                        <span className="text-[10px] text-rose-400">Tautan rusak atau file terhapus — unggah ulang</span>
                    </span>
                ) : hasCurrent ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                        <TbFileText className="w-10 h-10" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">File tersimpan</span>
                    </span>
                ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                        <span className="w-11 h-11 rounded-xl bg-[#0B1B3F] text-sky-200 flex items-center justify-center shadow-md">
                            <TbUpload className="w-5 h-5" />
                        </span>
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300">{label} belum diunggah</span>
                        <span className="text-[10px] text-slate-500">Klik atau seret file ke sini</span>
                    </span>
                )}

                {/* Overlay ganti saat hover (bila sudah ada isi) */}
                {(imgSrc || showPdf || hasCurrent || file) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 group-hover:bg-slate-950/45 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow">
                            <TbUpload className="w-3.5 h-3.5" /> Ganti file
                        </span>
                    </span>
                )}
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={(e) => {
                        onPick(e.target.files?.[0] || null);
                        e.target.value = "";
                    }}
                />
            </label>

            {/* Nama file + aksi */}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="min-w-0 text-[11px] text-slate-500 truncate" title={name}>
                    {name || <span className="text-slate-400">Tidak ada file</span>}
                    {file && <span className="text-slate-400"> · {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
                </span>
                <span className="flex shrink-0 gap-1">
                    {file ? (
                        <button type="button" onClick={() => onPick(null)} className="h-7 px-2 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center gap-1">
                            <TbTrash className="w-3.5 h-3.5" /> Batal
                        </button>
                    ) : canOpen ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="h-7 px-2 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 inline-flex items-center gap-1">
                            <TbExternalLink className="w-3.5 h-3.5" /> Lihat
                        </a>
                    ) : null}
                </span>
            </div>
        </div>
    );
}

export default EditPesertaAction;

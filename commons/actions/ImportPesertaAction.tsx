"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FiUploadCloud } from "react-icons/fi";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbX, TbCheck, TbLoader2, TbDownload, TbTrash, TbAlertTriangle, TbCircleCheck, TbRefresh, TbFileSpreadsheet, TbListCheck } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import * as XLSX from "xlsx";
import Toast from "@/commons/Toast";
import { downloadFormatPesertaPelatihan } from "@/constants/urls";


interface ImportPesertaActionProps {
    idPelatihan: string;
    statusApproval: string;
    onSuccess?: () => void;
    onAddHistory?: (message: string) => void;
    /** Opsional: daftar NIK peserta yang sudah terdaftar di pelatihan ini */
    existingNIK?: string[];
}

/* ===================== VALIDASI ===================== */

type FieldKey = "nik" | "nama" | "tanggalLahir" | "jenisKelamin" | "pendidikan" | "alamat" | "provinsi" | "kabupaten" | "noTelpon";

// Alias nama kolom header excel (dinormalisasi: lowercase, tanpa spasi/simbol)
const COLUMN_ALIASES: Record<FieldKey, string[]> = {
    nik: ["nik", "noktp", "nomorktp", "nomorinduk", "nomorindukkependudukan"],
    nama: ["nama", "namalengkap", "namapeserta"],
    tanggalLahir: ["tanggallahir", "tgllahir", "tanggallahirddmmmmyyyy"],
    jenisKelamin: ["jeniskelamin", "jk", "kelamin", "gender", "jeniskelaminlp"],
    pendidikan: ["pendidikanterakhir", "pendidikan", "pendterakhir", "pendidikanterakhirpeserta"],
    alamat: ["alamat", "alamatlengkap"],
    provinsi: ["provinsi", "prov"],
    kabupaten: ["kabupaten", "kabupatenkota", "kota", "kabkota", "kab"],
    noTelpon: ["notelpon", "notelp", "nohp", "nomortelepon", "notelepon", "nomorhp", "telepon", "telpon", "nowa", "nomortelpon"],
};

const FIELD_LABEL: Record<FieldKey, string> = {
    nik: "NIK",
    nama: "Nama",
    tanggalLahir: "Tanggal Lahir",
    jenisKelamin: "Jenis Kelamin",
    pendidikan: "Pendidikan Terakhir",
    alamat: "Alamat",
    provinsi: "Provinsi",
    kabupaten: "Kabupaten",
    noTelpon: "No Telpon",
};

/** Nilai valid Jenis Kelamin */
const JENIS_KELAMIN = ["L", "P"];

/** Nilai valid Pendidikan Terakhir (dicocokkan tanpa membedakan huruf besar/kecil & spasi) */
const PENDIDIKAN = [
    "SD/Sederajat",
    "SMP/Sederajat",
    "SMA/Sederajat",
    "Di/Dii/DIII",
    "DIV/S1",
    "S2",
    "S3",
    "Tidak Bersekolah",
    "Tidak Diketahui",
];
const normPend = (v: string) => v.toUpperCase().replace(/\s+/g, "");
const PENDIDIKAN_SET = new Set(PENDIDIKAN.map(normPend));

const BULAN = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER",
];

// Kode provinsi resmi Dukcapil
const KODE_PROVINSI = new Set([
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "21",
    "31", "32", "33", "34", "35", "36",
    "51", "52", "53",
    "61", "62", "63", "64", "65",
    "71", "72", "73", "74", "75", "76",
    "81", "82",
    "91", "92", "93", "94", "95", "96",
]);

const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Parse "15 APRIL 2026" -> Date, null jika format salah / tanggal tidak ada */
const parseTanggalLahir = (value: string): Date | null => {
    const match = value.match(/^(\d{1,2}) ([A-Z]+) (\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = BULAN.indexOf(match[2]);
    const year = Number(match[3]);
    if (month === -1) return null;
    const date = new Date(year, month, day);
    // cek tanggal benar-benar ada (mis. 31 FEBRUARI)
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return date;
};

/** Validasi struktur NIK, return pesan error atau null */
const validateNIK = (nik: string): string | null => {
    if (!/^\d+$/.test(nik)) {
        return "NIK harus berisi angka saja (pastikan kolom NIK berformat Text di Excel)";
    }
    if (nik.length !== 16) return `NIK harus 16 digit (saat ini ${nik.length} digit)`;
    if (!KODE_PROVINSI.has(nik.substring(0, 2))) return "Kode provinsi pada NIK tidak valid";
    if (nik.substring(2, 4) === "00" || nik.substring(4, 6) === "00") return "Kode kabupaten/kecamatan pada NIK tidak valid";

    let dd = Number(nik.substring(6, 8));
    const mm = Number(nik.substring(8, 10));
    if (dd > 40) dd -= 40; // perempuan: tanggal + 40
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return "Bagian tanggal lahir pada NIK tidak valid";
    if (nik.substring(12) === "0000") return "Nomor urut NIK tidak valid";
    // Tidak dicocokkan dengan kolom Tanggal Lahir
    return null;
};

interface RowError {
    row: number; // nomor baris di excel
    nama: string;
    messages: string[];
}

interface ValidationResult {
    totalRows: number;
    errors: RowError[];
    fatal?: string; // error struktur file (header tidak ada, dll)
}

const validateExcel = async (file: File, existingNIK: string[] = []): Promise<ValidationResult> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return { totalRows: 0, errors: [], fatal: "Sheet tidak ditemukan pada file" };

    // raw:false -> ambil teks persis seperti tampil di Excel
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    if (rows.length < 2) return { totalRows: 0, errors: [], fatal: "File tidak berisi data peserta" };

    // Mapping header -> index kolom
    const headers = rows[0].map((h) => normalizeHeader(String(h)));
    const colIndex = {} as Record<FieldKey, number>;
    const missing: string[] = [];
    (Object.keys(COLUMN_ALIASES) as FieldKey[]).forEach((key) => {
        const idx = headers.findIndex((h) => COLUMN_ALIASES[key].includes(h));
        if (idx === -1) missing.push(FIELD_LABEL[key]);
        colIndex[key] = idx;
    });
    if (missing.length) {
        return { totalRows: 0, errors: [], fatal: `Kolom tidak ditemukan: ${missing.join(", ")}. Gunakan template resmi.` };
    }

    const errors: RowError[] = [];
    const nikSeen = new Map<string, number>();
    const nikTerdaftar = new Set(existingNIK.map((n) => String(n).trim()));
    let totalRows = 0;

    rows.slice(1).forEach((row, i) => {
        const excelRow = i + 2;
        const get = (key: FieldKey) => String(row[colIndex[key]] ?? "").trim();

        // lewati baris kosong
        if (row.every((cell) => String(cell ?? "").trim() === "")) return;
        totalRows++;

        const messages: string[] = [];

        // Field wajib
        (["nama", "alamat", "provinsi", "kabupaten", "noTelpon"] as FieldKey[]).forEach((key) => {
            if (!get(key)) messages.push(`${FIELD_LABEL[key]} wajib diisi`);
        });

        // Tanggal lahir
        const tglRaw = get("tanggalLahir");
        let tglLahir: Date | null = null;
        if (!tglRaw) {
            messages.push("Tanggal Lahir wajib diisi");
        } else {
            tglLahir = parseTanggalLahir(tglRaw);
            if (!tglLahir) {
                messages.push(`Format Tanggal Lahir "${tglRaw}" salah, contoh yang benar: 15 APRIL 2026`);
            } else if (tglLahir > new Date()) {
                messages.push("Tanggal Lahir tidak boleh melebihi hari ini");
            }
        }

        // Jenis kelamin: hanya L / P
        const jk = get("jenisKelamin").toUpperCase();
        if (!jk) messages.push("Jenis Kelamin wajib diisi");
        else if (!JENIS_KELAMIN.includes(jk)) messages.push(`Jenis Kelamin "${get("jenisKelamin")}" tidak valid, isi L atau P`);

        // Pendidikan terakhir: sesuai daftar
        const pend = get("pendidikan");
        if (!pend) messages.push("Pendidikan Terakhir wajib diisi");
        else if (!PENDIDIKAN_SET.has(normPend(pend))) messages.push(`Pendidikan Terakhir "${pend}" tidak valid, pilih: ${PENDIDIKAN.join(", ")}`);

        // NIK
        const nik = get("nik").replace(/\s/g, "");
        if (!nik) {
            messages.push("NIK wajib diisi");
        } else {
            const nikError = validateNIK(nik);
            if (nikError) messages.push(nikError);
            if (nikSeen.has(nik)) messages.push(`NIK duplikat dengan baris ${nikSeen.get(nik)}`);
            else nikSeen.set(nik, excelRow);
            if (nikTerdaftar.has(nik)) messages.push("NIK sudah terdaftar sebagai peserta pelatihan ini");
        }

        // No telpon (opsional cek format angka)
        const telp = get("noTelpon");
        if (telp && !/^\+?\d{9,15}$/.test(telp.replace(/[\s-]/g, ""))) {
            messages.push("No Telpon tidak valid (9-15 digit angka)");
        }

        if (messages.length) errors.push({ row: excelRow, nama: get("nama") || "-", messages });
    });

    if (totalRows === 0) return { totalRows: 0, errors: [], fatal: "File tidak berisi data peserta" };
    return { totalRows, errors };
};

/* ===================== COMPONENT ===================== */

type IconType = React.ElementType;

const ImportPesertaAction: React.FC<ImportPesertaActionProps> = ({ idPelatihan, statusApproval, onSuccess, onAddHistory, existingNIK = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileExcel, setFileExcel] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    const isValid = !!validation && !validation.fatal && validation.errors.length === 0;
    const errorCount = validation?.errors.length ?? 0;
    const validCount = validation && !validation.fatal ? validation.totalRows - errorCount : 0;
    const step = !fileExcel ? 1 : !isValid ? 2 : 3;

    const resetFile = () => {
        setFileExcel(null);
        setValidation(null);
    };

    const close = () => {
        if (loading) return;
        setIsOpen(false);
        resetFile();
    };

    const processFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            Toast.fire({ icon: "error", title: "Format tidak sesuai", text: "Unggah file berformat .xlsx" });
            return;
        }
        setFileExcel(file);
        setValidation(null);
        setValidating(true);
        try {
            setValidation(await validateExcel(file, existingNIK));
        } catch {
            setValidation({ totalRows: 0, errors: [], fatal: "File tidak dapat dibaca, pastikan file Excel tidak rusak" });
        } finally {
            setValidating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) processFile(e.target.files[0]);
        e.target.value = ""; // agar file yang sama bisa dipilih ulang
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) processFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!fileExcel || !isValid) return;
        const formData = new FormData();
        formData.append("IdPelatihan", idPelatihan);
        formData.append("file", fileExcel);
        try {
            setLoading(true);
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/exportPesertaPelatihan`, formData, {
                headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
            });
            onAddHistory?.("Telah mengupload data peserta kelas");
            Toast.fire({ icon: "success", title: "Peserta berhasil diimport", text: `${validation?.totalRows ?? 0} peserta ditambahkan.` });
            setIsOpen(false);
            resetFile();
            onSuccess?.();
        } catch (error: any) {
            Toast.fire({ icon: "error", title: "Gagal mengunggah", text: error?.response?.data?.message || "Terjadi kesalahan saat upload file." });
            onSuccess?.();
        } finally {
            setLoading(false);
        }
    };

    /** Unduh daftar kesalahan sebagai Excel agar mudah diperbaiki */
    const downloadErrors = () => {
        if (!validation?.errors.length) return;
        const ws = XLSX.utils.json_to_sheet(validation.errors.map((e) => ({ Baris: e.row, Nama: e.nama, Masalah: e.messages.join("; ") })));
        ws["!cols"] = [{ wch: 8 }, { wch: 32 }, { wch: 90 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kesalahan");
        XLSX.writeFile(wb, `Kesalahan_Import_${fileExcel?.name.replace(/\.xlsx$/i, "") || "Peserta"}.xlsx`);
    };

    return (
        <>
            {/* Tombol putih, selaras tombol aksi lain */}
            <button
                type="button"
                onClick={() => {
                    if (statusApproval === "Selesai") {
                        Toast.fire({ icon: "error", title: "Pelatihan sudah ditutup", text: "Tidak dapat menambahkan peserta lagi." });
                        return;
                    }
                    setIsOpen(true);
                }}
                className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
                <PiMicrosoftExcelLogoFill className="w-4 h-4 text-emerald-600 transition-transform duration-300 group-hover:-rotate-12" />
                Import Peserta
            </button>

            <Dialog open={isOpen} onOpenChange={(o) => (o ? setIsOpen(true) : close())}>
                <DialogContent
                    onInteractOutside={(e) => loading && e.preventDefault()}
                    className="w-[calc(100vw-1.5rem)] sm:w-full max-w-2xl sm:max-w-2xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
                >
                    {/* Header hero */}
                    <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#10B981_0%,transparent_60%)] opacity-80" />
                        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                        <PiMicrosoftExcelLogoFill aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-emerald-300 opacity-20" />

                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">Import Peserta</p>
                                <DialogTitle className="mt-1 text-base md:text-lg font-black text-white leading-snug">Unggah data peserta dari Excel</DialogTitle>
                                <DialogDescription className="text-xs text-blue-100/70">Data diperiksa otomatis sebelum diunggah — tidak ada yang tersimpan sampai valid.</DialogDescription>
                            </div>
                            <button type="button" onClick={close} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20">
                                <TbX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Progres langkah */}
                        <ol className="mt-4 grid grid-cols-3 gap-2">
                            {["Template", "Unggah & periksa", "Simpan"].map((label, i) => {
                                const n = i + 1;
                                const done = step > n;
                                const active = step === n;
                                return (
                                    <li key={label} className={`rounded-xl px-2.5 py-2 ring-1 backdrop-blur-md ${active ? "bg-white/15 ring-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "bg-white/[0.06] ring-white/10"}`}>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${done ? "bg-emerald-500 text-white" : active ? "bg-white text-[#0B1B3F]" : "bg-white/10 text-blue-100/60"}`}>
                                                {done ? <TbCheck className="w-3 h-3" /> : n}
                                            </span>
                                            <span className={`text-[11px] font-bold truncate ${active ? "text-white" : "text-blue-100/60"}`}>{label}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5 space-y-4">
                        {/* 01 Template */}
                        <Section no="01" title="Unduh template" icon={TbFileSpreadsheet}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Template Import Peserta (.xlsx)</p>
                                    <p className="text-[11px] text-slate-500">
                                        Kolom wajib: NIK, Nama, Tanggal Lahir (<span className="font-mono">15 APRIL 2026</span>), Jenis Kelamin (<span className="font-mono">L/P</span>), Pendidikan Terakhir, Alamat, Provinsi, Kabupaten, No Telpon.
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Pendidikan Terakhir: <span className="font-medium text-slate-700 dark:text-slate-300">{PENDIDIKAN.join(" · ")}</span>
                                    </p>
                                </div>
                                <Link
                                    target="_blank"
                                    href={downloadFormatPesertaPelatihan}
                                    className="h-9 px-3.5 shrink-0 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 hover:bg-slate-50"
                                >
                                    <TbDownload className="w-4 h-4 text-emerald-600" /> Unduh template
                                </Link>
                            </div>
                        </Section>

                        {/* 02 Upload */}
                        <Section no="02" title="Unggah file" icon={FiUploadCloud}>
                            {fileExcel ? (
                                <div className={`flex items-center justify-between gap-3 rounded-xl p-3 ring-1 ${validating ? "ring-slate-200 bg-slate-50 dark:bg-slate-800 dark:ring-slate-700" : isValid ? "ring-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:ring-emerald-900/40" : "ring-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:ring-rose-900/40"}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                            <PiMicrosoftExcelLogoFill className="w-5 h-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">{fileExcel.name}</p>
                                            <p className="text-[11px] text-slate-500">
                                                {(fileExcel.size / 1024).toFixed(1)} KB ·{" "}
                                                {validating ? (
                                                    <span className="inline-flex items-center gap-1"><TbLoader2 className="w-3 h-3 animate-spin" /> Memeriksa…</span>
                                                ) : isValid ? (
                                                    <span className="font-semibold text-emerald-600">Siap diunggah</span>
                                                ) : (
                                                    <span className="font-semibold text-rose-600">Belum valid</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <label htmlFor="file-upload-replace" title="Ganti file" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 flex items-center justify-center cursor-pointer">
                                            <TbRefresh className="w-4 h-4" />
                                            <input id="file-upload-replace" type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
                                        </label>
                                        <button type="button" onClick={resetFile} title="Hapus file" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center">
                                            <TbTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    htmlFor="file-upload"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center gap-2 h-36 px-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${isDragging ? "border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-500/10" : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400 hover:bg-emerald-50/40"}`}
                                >
                                    <span className="w-11 h-11 rounded-xl bg-[#0B1B3F] text-emerald-300 flex items-center justify-center shadow-md">
                                        <FiUploadCloud className="w-5 h-5" />
                                    </span>
                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{isDragging ? "Lepaskan file di sini" : "Klik atau seret file Excel ke sini"}</p>
                                    <p className="text-[11px] text-slate-400">Hanya <b className="text-emerald-600">.xlsx</b></p>
                                    <input id="file-upload" type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
                                </label>
                            )}
                        </Section>

                        {/* 03 Hasil pemeriksaan */}
                        {fileExcel && (
                            <Section no="03" title="Hasil pemeriksaan" icon={TbListCheck}>
                                {validating ? (
                                    <div className="space-y-2">
                                        {[0, 1].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                                    </div>
                                ) : validation?.fatal ? (
                                    <div className="flex items-start gap-2.5 rounded-xl ring-1 ring-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:ring-rose-900/40 px-3.5 py-3 text-rose-700 dark:text-rose-300">
                                        <TbAlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <p className="text-xs font-semibold">{validation.fatal}</p>
                                    </div>
                                ) : validation ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            <MiniStat label="Total baris" value={validation.totalRows} tone="slate" />
                                            <MiniStat label="Valid" value={validCount} tone="emerald" />
                                            <MiniStat label="Bermasalah" value={errorCount} tone={errorCount ? "rose" : "slate"} />
                                        </div>

                                        {isValid ? (
                                            <div className="flex items-center gap-2.5 rounded-xl ring-1 ring-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:ring-emerald-900/40 px-3.5 py-3 text-emerald-700 dark:text-emerald-300">
                                                <TbCircleCheck className="w-4 h-4 shrink-0" />
                                                <p className="text-xs font-semibold">Semua {validation.totalRows} data valid. Klik <b>Unggah Peserta</b> untuk menyimpan.</p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl ring-1 ring-rose-200 dark:ring-rose-900/40 overflow-hidden">
                                                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-rose-50/70 dark:bg-rose-950/20">
                                                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                                                        <TbAlertTriangle className="w-4 h-4" /> {errorCount} baris perlu diperbaiki
                                                    </p>
                                                    <button type="button" onClick={downloadErrors} className="h-8 px-3 rounded-lg bg-white dark:bg-slate-900 ring-1 ring-rose-200 dark:ring-rose-900/40 text-[11px] font-bold text-rose-700 dark:text-rose-300 inline-flex items-center gap-1.5 hover:bg-rose-50">
                                                        <TbDownload className="w-3.5 h-3.5" /> Unduh daftar kesalahan
                                                    </button>
                                                </div>
                                                <ul className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                                    {validation.errors.map((err) => (
                                                        <li key={err.row} className="px-3.5 py-2.5">
                                                            <p className="flex items-center gap-2 text-xs">
                                                                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px] font-black tabular-nums">Baris {err.row}</span>
                                                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{err.nama}</span>
                                                            </p>
                                                            <ul className="mt-1 ml-1 space-y-0.5">
                                                                {err.messages.map((m, i) => (
                                                                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 break-words">
                                                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-rose-400 shrink-0" /> {m}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </Section>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] text-slate-400">{isValid ? `${validation?.totalRows} peserta siap diunggah` : fileExcel ? "Perbaiki file lalu unggah ulang" : "Belum ada file"}</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={close} disabled={loading} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!isValid || loading || validating}
                                className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
                            >
                                {loading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />}
                                {loading ? "Mengunggah…" : "Unggah Peserta"}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

/* ===================== UI ===================== */

function Section({ no, title, icon: Icon, children }: { no: string; title: string; icon: IconType; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#10B981_0%,transparent_70%)]" />
                    <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Langkah {no}</p>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                </div>
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

const TONE = {
    slate: "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white ring-slate-200 dark:ring-slate-700",
    emerald: "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 ring-emerald-100 dark:ring-emerald-900/40",
    rose: "bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 ring-rose-100 dark:ring-rose-900/40",
} as const;

function MiniStat({ label, value, tone }: { label: string; value: number; tone: keyof typeof TONE }) {
    return (
        <div className={`rounded-xl ring-1 px-3 py-2 ${TONE[tone]}`}>
            <p className="text-[10px] font-semibold opacity-70">{label}</p>
            <p className="text-xl font-black tabular-nums">{value.toLocaleString("id-ID")}</p>
        </div>
    );
}

export default ImportPesertaAction;

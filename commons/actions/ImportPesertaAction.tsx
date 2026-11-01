"use client";

import React, { useState } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FiUploadCloud } from "react-icons/fi";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbX, TbCheck, TbLoader2, TbDownload, TbTrash, TbAlertTriangle, TbCircleCheck } from "react-icons/tb";
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

type FieldKey = "nik" | "nama" | "tanggalLahir" | "alamat" | "provinsi" | "kabupaten" | "noTelpon";

// Alias nama kolom header excel (dinormalisasi: lowercase, tanpa spasi/simbol)
const COLUMN_ALIASES: Record<FieldKey, string[]> = {
    nik: ["nik", "noktp", "nomorktp", "nomorinduk", "nomorindukkependudukan"],
    nama: ["nama", "namalengkap", "namapeserta"],
    tanggalLahir: ["tanggallahir", "tgllahir", "tanggallahirddmmmmyyyy"],
    alamat: ["alamat", "alamatlengkap"],
    provinsi: ["provinsi", "prov"],
    kabupaten: ["kabupaten", "kabupatenkota", "kota", "kabkota", "kab"],
    noTelpon: ["notelpon", "notelp", "nohp", "nomortelepon", "notelepon", "nomorhp", "telepon", "telpon", "nowa", "nomortelpon"],
};

const FIELD_LABEL: Record<FieldKey, string> = {
    nik: "NIK",
    nama: "Nama",
    tanggalLahir: "Tanggal Lahir",
    alamat: "Alamat",
    provinsi: "Provinsi",
    kabupaten: "Kabupaten",
    noTelpon: "No Telpon",
};

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
const validateNIK = (nik: string, tglLahir: Date | null): string | null => {
    if (!/^\d+$/.test(nik)) {
        return "NIK harus berisi angka saja (pastikan kolom NIK berformat Text di Excel)";
    }
    if (nik.length !== 16) return `NIK harus 16 digit (saat ini ${nik.length} digit)`;
    if (!KODE_PROVINSI.has(nik.substring(0, 2))) return "Kode provinsi pada NIK tidak valid";
    if (nik.substring(2, 4) === "00" || nik.substring(4, 6) === "00") return "Kode kabupaten/kecamatan pada NIK tidak valid";

    let dd = Number(nik.substring(6, 8));
    const mm = Number(nik.substring(8, 10));
    const yy = Number(nik.substring(10, 12));
    if (dd > 40) dd -= 40; // perempuan: tanggal + 40
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return "Bagian tanggal lahir pada NIK tidak valid";
    if (nik.substring(12) === "0000") return "Nomor urut NIK tidak valid";

    // Cocokkan dengan tanggal lahir
    if (tglLahir) {
        const sama =
            tglLahir.getDate() === dd &&
            tglLahir.getMonth() + 1 === mm &&
            tglLahir.getFullYear() % 100 === yy;
        if (!sama) return "Tanggal lahir pada NIK tidak sesuai dengan kolom Tanggal Lahir";
    }
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

        // NIK
        const nik = get("nik").replace(/\s/g, "");
        if (!nik) {
            messages.push("NIK wajib diisi");
        } else {
            const nikError = validateNIK(nik, tglLahir);
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

const ImportPesertaAction: React.FC<ImportPesertaActionProps> = ({
    idPelatihan,
    statusApproval,
    onSuccess,
    onAddHistory,
    existingNIK = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileExcel, setFileExcel] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);

    const isValid = !!validation && !validation.fatal && validation.errors.length === 0;

    const resetFile = () => {
        setFileExcel(null);
        setValidation(null);
    };

    const processFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith(".xlsx")) {
            Toast.fire({ icon: "error", title: "Format Tidak Sesuai", text: "Mohon unggah file dengan format .xlsx" });
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
        if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
        e.target.value = ""; // agar file yang sama bisa dipilih ulang
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
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

            Toast.fire({ icon: "success", title: "Berhasil!", text: "Peserta pelatihan berhasil diimport." });

            setIsOpen(false);
            resetFile();
            onSuccess?.();
        } catch (error) {
            Toast.fire({ icon: "error", title: "Gagal!", text: "Terjadi kesalahan saat upload file." });
            onSuccess?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) resetFile();
            }}
        >
            {/* Trigger Button */}
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (statusApproval === "Selesai") {
                            Toast.fire({
                                icon: "error",
                                title: "Ups!!!",
                                text: "Pelatihan sudah ditutup, tidak dapat menambahkan lagi!",
                            });
                        } else {
                            setIsOpen(true);
                        }
                    }}
                    className="h-11 px-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                    <PiMicrosoftExcelLogoFill className="h-5 w-5 shrink-0 text-emerald-600 hover:text-white transition-colors" />
                    <span>Import Data Peserta</span>
                </Button>
            </AlertDialogTrigger>

            {/* Dialog Content */}
            <AlertDialogContent className="w-full max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.25)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 shrink-0">
                            <PiMicrosoftExcelLogoFill size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                    Import Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Import Peserta Pelatihan
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            resetFile();
                        }}
                        className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <TbX size={22} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-8 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Step 1: Download Template */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">1</span>
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Unduh Template Format Excel
                            </h3>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                    <PiMicrosoftExcelLogoFill size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">Template Import Peserta (.xlsx)</p>
                                    <p className="text-[11px] font-medium text-slate-400">Gunakan format resmi untuk menghindari kesalahan data</p>
                                </div>
                            </div>
                            <Link
                                target="_blank"
                                href={downloadFormatPesertaPelatihan}
                                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all shrink-0 hover:-translate-y-0.5"
                            >
                                <TbDownload size={16} />
                                Unduh Template
                            </Link>
                        </div>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">2</span>
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Upload File Excel Data Peserta <span className="text-rose-500">*</span>
                            </h3>
                        </div>

                        {fileExcel ? (
                            <div
                                className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${validation && !isValid
                                    ? "bg-rose-500/10 border-rose-500/30"
                                    : "bg-emerald-500/10 border-emerald-500/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                        <PiMicrosoftExcelLogoFill size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-800 dark:text-white truncate">{fileExcel.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                                            {(fileExcel.size / 1024).toFixed(1)} KB •{" "}
                                            {validating
                                                ? "Memeriksa data..."
                                                : isValid
                                                    ? <span className="text-emerald-600 dark:text-emerald-400">File Siap Diupload</span>
                                                    : <span className="text-rose-600 dark:text-rose-400">Data Belum Valid</span>}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetFile}
                                    className="w-9 h-9 rounded-xl hover:bg-rose-100 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors shrink-0"
                                >
                                    <TbTrash size={18} />
                                </button>
                            </div>
                        ) : (
                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                htmlFor="file-upload"
                                className={`flex flex-col items-center justify-center h-40 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging
                                    ? "border-emerald-500 bg-emerald-500/10 ring-4 ring-emerald-500/10"
                                    : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                                    <FiUploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1 text-center">
                                    Klik atau seret file Excel ke sini
                                </p>
                                <p className="text-[11px] font-medium text-slate-400">
                                    Format yang didukung: <span className="font-bold text-emerald-600">.xlsx</span>
                                </p>
                                <input id="file-upload" type="file" className="hidden" accept=".xlsx" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    {/* Step 3: Hasil Pengecekan */}
                    {fileExcel && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">3</span>
                                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Hasil Pengecekan Data
                                </h3>
                            </div>

                            {validating && (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center gap-3 text-xs font-bold text-slate-500">
                                    <TbLoader2 className="w-4 h-4 animate-spin" /> Memeriksa data peserta...
                                </div>
                            )}

                            {validation?.fatal && (
                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs font-bold text-rose-600 dark:text-rose-400">
                                    <TbAlertTriangle className="w-5 h-5 shrink-0" /> {validation.fatal}
                                </div>
                            )}

                            {validation && !validation.fatal && isValid && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    <TbCircleCheck className="w-5 h-5 shrink-0" />
                                    Semua data valid ({validation.totalRows} peserta). Silakan klik Upload Peserta.
                                </div>
                            )}

                            {validation && !validation.fatal && validation.errors.length > 0 && (
                                <div className="rounded-2xl border border-rose-500/30 overflow-hidden">
                                    <div className="px-4 py-3 bg-rose-500/10 flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400">
                                        <TbAlertTriangle className="w-4 h-4" />
                                        {validation.errors.length} dari {validation.totalRows} baris bermasalah. Perbaiki file lalu upload ulang.
                                    </div>
                                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                                        {validation.errors.map((err) => (
                                            <div key={err.row} className="px-4 py-3 text-xs">
                                                <p className="font-black text-slate-800 dark:text-white mb-1">
                                                    Baris {err.row} <span className="font-medium text-slate-400">• {err.nama}</span>
                                                </p>
                                                <ul className="list-disc pl-5 space-y-0.5 text-rose-600 dark:text-rose-400 font-medium">
                                                    {err.messages.map((m, i) => (
                                                        <li key={i}>{m}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            resetFile();
                        }}
                        disabled={loading}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        disabled={!isValid || loading || validating}
                        onClick={handleUpload}
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <TbLoader2 className="w-4 h-4 animate-spin" />
                                <span>Mengunggah...</span>
                            </>
                        ) : (
                            <>
                                <TbCheck className="w-4 h-4" />
                                <span>Upload Peserta</span>
                            </>
                        )}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ImportPesertaAction;
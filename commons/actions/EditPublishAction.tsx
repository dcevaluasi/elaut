"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    LayoutGrid,
    Calendar,
    Users,
    Rocket,
    Save,
    X,
    Megaphone,
    Clock,
    Target
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { Textarea } from "@/components/ui/textarea";
import { PelatihanMasyarakat } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface EditPublishActionProps {
    idPelatihan: string;
    currentDetail?: string;
    currentFoto?: string;
    currentData?: PelatihanMasyarakat;
    tanggalPendaftaran?: string[];
    onSuccess?: () => void;
}

const EditPublishAction: React.FC<EditPublishActionProps> = ({
    idPelatihan,
    currentDetail,
    currentFoto,
    currentData,
    tanggalPendaftaran,
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tanggalMulai, setTanggalMulai] = useState(tanggalPendaftaran?.[0] || "");
    const [tanggalAkhir, setTanggalAkhir] = useState(tanggalPendaftaran?.[1] || "");
    const [detailPelatihan, setDetailPelatihan] = useState(currentDetail || "");
    const [fotoPelatihan, setFotoPelatihan] = useState<File | null>(null);
    const [kuotaPelatihan, setKuotaPelatihan] = useState(currentData?.KoutaPelatihan || "")
    const [asalPelatihan, setAsalPelatihan] = useState(currentData?.AsalPelatihan || "No Mandiri")
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSubmit = async () => {
        if (!detailPelatihan && !fotoPelatihan) {
            Toast.fire({
                icon: "warning",
                title: "Form Kosong",
                text: "Harap isi detail atau unggah foto pelatihan terlebih dahulu.",
            });
            return;
        }

        const formData = new FormData();
        if (tanggalMulai) formData.append("TanggalMulaiPendaftaran", tanggalMulai);
        if (tanggalAkhir) formData.append("TanggalAkhirPendaftaran", tanggalAkhir);
        if (detailPelatihan) formData.append("DetailPelatihan", detailPelatihan);
        if (fotoPelatihan) formData.append("photo_pelatihan", fotoPelatihan);
        formData.append("AsalPelatihan", asalPelatihan);
        formData.append("KoutaPelatihan", kuotaPelatihan)

        try {
            setLoading(true);
            setUploadProgress(0);
            await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                    onUploadProgress: (event) => {
                        if (event.total) {
                            setUploadProgress(Math.round((event.loaded * 100) / event.total));
                        }
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Informasi pelatihan berhasil diperbarui.",
            });
            setFotoPelatihan(null);
            setIsOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const FormLabel = ({ icon: Icon, label, required }: { icon: any, label: string, required?: boolean }) => (
        <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                {label} {required && <span className="text-rose-500">*</span>}
            </span>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-10 flex items-center gap-3 rounded-xl px-4 shadow-sm transition-all border-indigo-200 dark:border-indigo-800 text-indigo-600  font-black uppercase tracking-wider text-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 group"
                >
                    <Megaphone className="h-4 w-4 transition-transform group-hover:rotate-12 text-indigo-500/10" />
                    <span>Edit Informasi Publish</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-[95vw] h-[95vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col">
                <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />

                    <DialogHeader className="p-6 md:p-8 pb-4 relative z-10 shrink-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-5">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center text-2xl md:text-3xl shadow-xl shadow-indigo-500/20 shrink-0">
                                <Megaphone className="w-7 h-7 md:w-8 md:h-8 text-indigo-500" />
                            </div>
                            <div className="space-y-0.5 md:space-y-1">
                                <DialogTitle className="font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                                    Informasi Publish & Promosi
                                </DialogTitle>
                                <DialogDescription className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Sesuaikan tampilan visual dan naratif pelatihan untuk portal publik E-LAUT
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 px-6 md:px-8">
                        <div className="space-y-8 pb-10">
                            {/* Section 1: Timeline & Capacity */}
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase font-black text-[8px] md:text-[9px] px-3 py-1">Timeline & Kapasitas</Badge>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <FormLabel icon={Calendar} label="Mulai Pendaftaran" />
                                        <input
                                            type="date"
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            value={tanggalMulai}
                                            onChange={(e) => setTanggalMulai(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={Clock} label="Akhir Pendaftaran" />
                                        <input
                                            type="date"
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            value={tanggalAkhir}
                                            onChange={(e) => setTanggalAkhir(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={Users} label="Kuota Peserta" />
                                        <input
                                            type="text"
                                            placeholder="Contoh: 30 Orang"
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            value={kuotaPelatihan}
                                            onChange={(e) => setKuotaPelatihan(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Narrative Description */}
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20 uppercase font-black text-[8px] md:text-[9px] px-3 py-1">Deskripsi & Narasi</Badge>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>
                                <div className="relative group">
                                    <Textarea
                                        value={detailPelatihan}
                                        onChange={(e) => setDetailPelatihan(e.target.value)}
                                        placeholder="Tuliskan deskripsi lengkap pelatihan di sini... (Contoh: Materi yang akan dipelajari, target peserta, dan output pelatihan)"
                                        className="min-h-[200px] w-full p-6 rounded-[1.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-inner"
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                        <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-slate-400 border-slate-200 dark:border-slate-800">
                                            {detailPelatihan.length} Karakter
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Visual Marketing */}
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20 uppercase font-black text-[8px] md:text-[9px] px-3 py-1">Visual & Flyer</Badge>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <FlyerUploader
                                        file={fotoPelatihan}
                                        onChange={setFotoPelatihan}
                                        currentUrl={currentFoto}
                                        disabled={loading}
                                        progress={uploadProgress}
                                    />
                                    <div className="flex flex-col justify-center gap-3 md:gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600">
                                                <Target className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Status Pelatihan</p>
                                                <p className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{currentData?.Status || "Draft"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Public Enrollment Options */}
                            <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 group hover:border-indigo-300 dark:hover:border-indigo-900 transition-all shadow-inner">
                                <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform group-hover:scale-105 group-hover:rotate-3">
                                    <Rocket className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-indigo-600 text-white uppercase font-black text-[8px] md:text-[9px] px-3 py-0.5 pointer-events-none tracking-tighter">Pendaftaran Mandiri</Badge>
                                        <input
                                            id="isSpecific"
                                            type="checkbox"
                                            checked={asalPelatihan === "Mandiri"}
                                            onChange={(e) => setAsalPelatihan(e.target.checked ? "Mandiri" : "No Mandiri")}
                                            className="h-4 w-4 md:h-5 md:w-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                    <p className="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                                        Aktifkan opsi ini jika pelatihan ini dapat dicari dan didaftarkan secara mandiri oleh masyarakat umum melalui portal publik E-LAUT.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 md:p-8 pt-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 relative z-10 shrink-0">
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto h-11 md:h-12 px-8 md:px-10 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        ></motion.div>
                                        <span>
                                            {fotoPelatihan && uploadProgress > 0
                                                ? `Mengunggah ${uploadProgress}%`
                                                : "Menyimpan..."}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPublishAction;

import {
    AlertCircle,
    ExternalLink,
    RefreshCw,
    Trash2,
    Undo2,
    UploadCloud,
} from "lucide-react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

interface FlyerUploaderProps {
    /** Newly selected file (not saved yet) */
    file: File | null;
    onChange: (file: File | null) => void;
    /** URL of the flyer that is currently published */
    currentUrl?: string;
    disabled?: boolean;
    /** 0–100, shown over the preview while a new file is being uploaded */
    progress?: number;
    maxSizeMB?: number;
}

const FlyerUploader: React.FC<FlyerUploaderProps> = ({
    file,
    onChange,
    currentUrl,
    disabled = false,
    progress = 0,
    maxSizeMB = 5,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepth = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentFailed, setCurrentFailed] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        setCurrentFailed(false);
    }, [currentUrl]);

    const openDialog = () => {
        if (!disabled) inputRef.current?.click();
    };

    const validate = (f: File): string | null => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
            return "Format file tidak didukung. Pilih gambar PNG, JPG, atau WEBP.";
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
            return `Ukuran file ${formatSize(f.size)} melebihi batas ${maxSizeMB} MB. Perkecil ukuran gambar lalu coba lagi.`;
        }
        return null;
    };

    const handlePick = (picked?: File) => {
        if (!picked) return;
        const message = validate(picked);
        if (message) {
            setError(message);
            return;
        }
        setError(null);
        onChange(picked);
    };

    const handleRemove = () => {
        setError(null);
        onChange(null);
    };

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        dragDepth.current += 1;
        setIsDragging(true);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // required, otherwise the browser blocks dropping
        e.dataTransfer.dropEffect = disabled ? "none" : "copy";
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        if (disabled) return;
        handlePick(e.dataTransfer.files?.[0]);
    };

    const displayUrl = previewUrl ?? (currentUrl && !currentFailed ? currentUrl : null);
    const showProgress = !!file && disabled && progress > 0;

    const frameClass = isDragging
        ? "border-solid border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
        : displayUrl
            ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            : "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-indigo-400";

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="sr-only"
                tabIndex={-1}
                disabled={disabled}
                onChange={(e) => {
                    const picked = e.target.files?.[0];
                    e.target.value = ""; // lets the same file be chosen again after removing it
                    handlePick(picked);
                }}
            />

            <div
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative overflow-hidden rounded-[2rem] border-2 transition-colors ${frameClass}`}
            >
                {displayUrl ? (
                    <>
                        <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                            <img
                                src={displayUrl}
                                alt={file ? "Pratinjau flyer baru" : "Flyer pelatihan saat ini"}
                                className="h-full w-full object-contain"
                                onError={() => {
                                    if (!file) setCurrentFailed(true);
                                }}
                            />
                            <Badge
                                className={`absolute left-3 top-3 border-0 px-3 py-1 text-[11px] font-bold shadow-sm ${file
                                    ? "bg-emerald-500 text-white hover:bg-emerald-500"
                                    : "bg-white/90 text-slate-700 hover:bg-white/90"
                                    }`}
                            >
                                {file ? "Flyer baru (belum disimpan)" : "Flyer saat ini"}
                            </Badge>

                            {showProgress && (
                                <div
                                    role="status"
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/70 px-8 text-white"
                                >
                                    <p className="text-sm font-bold">Mengunggah flyer… {progress}%</p>
                                    <div
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={progress}
                                        className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/20"
                                    >
                                        <div
                                            className="h-full rounded-full bg-emerald-400 transition-[width] duration-200"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {isDragging && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-indigo-600/90 text-white">
                                    <p className="text-sm font-bold">Lepaskan file untuk mengganti flyer</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                {file ? (
                                    <>
                                        <p
                                            className="truncate text-sm font-bold text-slate-800 dark:text-slate-100"
                                            title={file.name}
                                        >
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatSize(file.size)}. Klik “Simpan perubahan” untuk menerapkan.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                            Flyer yang tampil di portal
                                        </p>
                                        <a
                                            href={currentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Buka ukuran penuh
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </>
                                )}
                            </div>

                            <div className="flex shrink-0 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={openDialog}
                                    disabled={disabled}
                                    className="gap-2 rounded-xl"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Ganti
                                </Button>
                                {file && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemove}
                                        disabled={disabled}
                                        className="gap-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10"
                                    >
                                        {currentUrl && !currentFailed ? (
                                            <Undo2 className="h-4 w-4" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        {currentUrl && !currentFailed ? "Batalkan" : "Hapus"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                        aria-label="Pilih file flyer pelatihan"
                        onClick={openDialog}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openDialog();
                            }
                        }}
                        className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
                    >
                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-transform ${isDragging ? "scale-110" : ""
                                }`}
                        >
                            <UploadCloud className="h-7 w-7" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {isDragging ? "Lepaskan file di sini" : "Seret flyer ke sini"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                atau klik untuk memilih dari perangkat Anda
                            </p>
                        </div>

                        <span className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
                            Pilih file
                        </span>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            PNG, JPG, atau WEBP. Maksimal {maxSizeMB} MB.
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
};


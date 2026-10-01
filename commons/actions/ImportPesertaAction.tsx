"use client";

import React, { useState } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FiUploadCloud, FiFileText } from "react-icons/fi";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { TbX, TbCheck, TbLoader2, TbDownload, TbInfoCircle, TbTrash } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import Toast from "@/commons/Toast";
import { downloadFormatPesertaPelatihan, urlPetunjukUploadPesertaPelatihan } from "@/constants/urls";

interface ImportPesertaActionProps {
    idPelatihan: string;
    statusApproval: string;
    onSuccess?: () => void;
    onAddHistory?: (message: string) => void;
}

const ImportPesertaAction: React.FC<ImportPesertaActionProps> = ({
    idPelatihan,
    statusApproval,
    onSuccess,
    onAddHistory,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fileExcel, setFileExcel] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileExcel(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith(".xlsx")) {
                setFileExcel(file);
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Format Tidak Sesuai",
                    text: "Mohon unggah file dengan format .xlsx",
                });
            }
        }
    };

    const truncateText = (text: string, maxLength = 35, suffix = "...") =>
        text.length > maxLength ? text.substring(0, maxLength) + suffix : text;

    const handleUpload = async () => {
        if (!fileExcel) return;

        const formData = new FormData();
        formData.append("IdPelatihan", idPelatihan);
        formData.append("file", fileExcel);

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/exportPesertaPelatihan`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            if (onAddHistory) {
                onAddHistory("Telah mengupload data peserta kelas");
            }

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Peserta pelatihan berhasil diimport.",
            });

            setIsOpen(false);
            setFileExcel(null);
            if (onSuccess) onSuccess();
        } catch (error) {
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat upload file.",
            });
            if (onSuccess) onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
            <AlertDialogContent className="w-full max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.25)] z-[999999] flex flex-col">
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
                        onClick={() => setIsOpen(false)}
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
                            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                        <PiMicrosoftExcelLogoFill size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                                            {fileExcel.name}
                                        </p>
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
                                            {(fileExcel.size / 1024).toFixed(1)} KB • File Siap Diupload
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFileExcel(null)}
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
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx"
                                    onChange={handleFileChange}
                                />
                            </label>
                        )}
                    </div>


                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        disabled={!fileExcel || loading}
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


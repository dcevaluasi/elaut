"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { elautBaseUrl, urlFileSuratPemberitahuan } from "@/constants/urls";
import axios from "axios";
import Toast from "@/commons/Toast";
import Cookies from "js-cookie";
import { FiUploadCloud, FiFileText } from "react-icons/fi";
import { TbX, TbCheck, TbLoader2, TbExternalLink, TbDownload, TbTrash, TbFileCheck } from "react-icons/tb";
import Link from "next/link";
import { PelatihanMasyarakat } from "@/types/product";

interface UploadSuratButtonProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData?: () => void;
}

const UploadSuratButton: React.FC<UploadSuratButtonProps> = ({
  idPelatihan,
  pelatihan,
  handleFetchingData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
        Toast.fire({
          icon: "error",
          title: "Oopsss!",
          text: "File harus berformat PDF!",
        });
        return;
      }
      setFile(selectedFile);
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
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(selectedFile);
      } else {
        Toast.fire({
          icon: "error",
          title: "Oopsss!",
          text: "File harus berformat PDF!",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("SuratPemberitahuan", file);

    try {
      await axios.put(`${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.fire({
        icon: "success",
        title: "Yeayyy!",
        text: "Berhasil mengupload surat pemberitahuan pelatihan!",
      });

      handleFetchingData?.();
      setIsOpen(false);
      setFile(null);
    } catch {
      Toast.fire({
        icon: "error",
        title: "Oopsss!",
        text: "Gagal mengupload surat pemberitahuan!",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        {Cookies.get("Access")?.includes("createPelatihan") &&
          (pelatihan?.StatusPenerbitan === "0" || pelatihan?.StatusPenerbitan === "3" || pelatihan?.StatusPenerbitan === "1.2") && (
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-11 px-5 rounded-2xl border border-purple-400/40 bg-purple-500/5 hover:bg-purple-600 text-purple-600 hover:text-white dark:text-purple-400 font-black text-xs  tracking-wider flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 cursor-pointer"
              >
                <FiUploadCloud className="h-5 w-5 shrink-0" />
                <span>{pelatihan?.SuratPemberitahuan != "" ? 'Edit' : 'Upload'} Surat Pemberitahuan</span>
                {pelatihan?.SuratPemberitahuan != "" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Button>
            </AlertDialogTrigger>
          )}

        <AlertDialogContent className="w-full max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.25)] z-[999999] flex flex-col">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20 shrink-0">
                <FiUploadCloud size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                    Surat Pemberitahuan Mode
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                  Pemberitahuan Pelaksanaan Pelatihan
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

          {/* Body */}
          <div className="p-8 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Existing File Card if available */}
            {pelatihan?.SuratPemberitahuan && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <TbFileCheck size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Surat Pemberitahuan Terupload</p>
                    <p className="text-[11px] font-medium text-slate-400">File sudah pernah diunggah sebelumnya</p>
                  </div>
                </div>
                <Link
                  href={`${urlFileSuratPemberitahuan}/${pelatihan?.SuratPemberitahuan}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  <TbExternalLink size={15} />
                  Lihat Surat
                </Link>
              </div>
            )}

            {/* Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Upload File Surat Pemberitahuan (PDF) <span className="text-rose-500">*</span>
              </label>

              {file ? (
                <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <FiFileText size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • File Siap Diupload
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
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
                  htmlFor="surat-file-upload"
                  className={`flex flex-col items-center justify-center h-40 px-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging
                    ? "border-purple-500 bg-purple-500/10 ring-4 ring-purple-500/10"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1 text-center">
                    Klik atau seret file PDF ke sini
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Format yang didukung: <span className="font-bold text-purple-600">PDF (.pdf)</span>
                  </p>
                  <input
                    id="surat-file-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {/* Format Reference */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <FiFileText size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Format Acuan Surat Pemberitahuan</p>
                  <p className="text-[11px] font-medium text-slate-400">Unduh atau lihat sampel format resmi surat</p>
                </div>
              </div>
              <Link
                href="https://drive.google.com/file/d/1UgueTM2mgScHViD7IZAXiNIyzSKYXTQo/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              >
                <TbExternalLink size={15} />
                Lihat Format
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
              className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <Button
              variant="outline"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="h-12 px-8 bg-purple-600 text-slate-400 hover:bg-purple-700 text-purpl  rounded-xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-600/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUploading ? (
                <>
                  <TbLoader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <TbCheck className="w-4 h-4" />
                  <span>Upload Surat</span>
                </>
              )}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UploadSuratButton;


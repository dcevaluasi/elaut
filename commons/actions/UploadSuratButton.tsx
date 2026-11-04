"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { elautBaseUrl, urlFileSuratPemberitahuan } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { PelatihanMasyarakat } from "@/types/product";
import { TbX, TbCheck, TbLoader2, TbExternalLink, TbTrash, TbFileCheck, TbFileText, TbCloudUpload, TbFileDescription } from "react-icons/tb";

interface UploadSuratButtonProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat;
  handleFetchingData?: () => void;
}

type IconType = React.ComponentType<{ className?: string }>;

const FORMAT_URL = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/suratPemberitahuan/c2lnbmVkX19QZW1iZXJpdGFodWFuX2tlZ2lhdGFuX3BlbGF0aWhhbl9NUE1fQ1BJQl8xMy0xNV9Pa3RvYmVyXzIwMjZfMjAyNjEwMDIxMDUyMjYucGRm";
/** Status penerbitan yang masih boleh mengubah surat: Draft, Perbaikan Verifikator, Perbaikan SPV */
const EDITABLE_STATUS = ["0", "3", "1.2"];

const isPdf = (f: File) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
const fmtSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

const UploadSuratButton: React.FC<UploadSuratButtonProps> = ({ idPelatihan, pelatihan, handleFetchingData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const canManage = !!Cookies.get("Access")?.includes("createPelatihan") && EDITABLE_STATUS.includes(String(pelatihan?.StatusPenerbitan ?? ""));
  // Dulu `!= ""` → undefined/null terbaca "sudah ada"
  const existing = (pelatihan?.SuratPemberitahuan || "").trim();
  const hasExisting = !!existing;

  if (!canManage) return null;

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!isPdf(f)) {
      Toast.fire({ icon: "error", title: "Format tidak didukung", text: "File surat harus berformat PDF." });
      return;
    }
    setFile(f);
  };

  const close = () => {
    if (isUploading) return;
    setIsOpen(false);
    setFile(null);
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("SuratPemberitahuan", file);
    try {
      await axios.put(`${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`, formData, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}`, "Content-Type": "multipart/form-data" },
      });
      Toast.fire({ icon: "success", title: hasExisting ? "Surat diperbarui" : "Surat diunggah", text: "Surat pemberitahuan pelatihan berhasil disimpan." });
      handleFetchingData?.();
      setIsOpen(false);
      setFile(null);
    } catch {
      Toast.fire({ icon: "error", title: "Gagal mengunggah", text: "Surat pemberitahuan belum tersimpan. Coba lagi." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Tombol putih — sama dengan Edit / Import Peserta */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50 hover:ring-slate-300 dark:hover:bg-slate-800 transition-colors"
      >
        <TbCloudUpload className="w-4 h-4 text-violet-600 transition-transform duration-300 group-hover:-translate-y-0.5" />
        {hasExisting ? "Ganti" : "Upload"} Surat Pemberitahuan
        {hasExisting && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Surat sudah diunggah" />}
      </button>

      <Dialog open={isOpen} onOpenChange={(o) => (o ? setIsOpen(true) : close())}>
        <DialogContent
          onInteractOutside={(e) => isUploading && e.preventDefault()}
          className="w-[calc(100vw-1.5rem)] sm:w-full max-w-xl sm:max-w-xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden rounded-3xl sm:rounded-3xl border-0 bg-slate-50 dark:bg-slate-950 shadow-2xl [&>button]:hidden"
        >
          {/* Header hero */}
          <div className="relative isolate shrink-0 overflow-hidden bg-[#0B1B3F] text-white px-5 md:px-6 py-5">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#8B5CF6_0%,transparent_60%)] opacity-80" />
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <TbFileDescription aria-hidden className="pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 text-violet-300 opacity-20" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/90">Surat Pemberitahuan</p>
                <DialogTitle className="mt-1 text-base md:text-lg font-black text-white leading-snug">Pemberitahuan pelaksanaan pelatihan</DialogTitle>
                <DialogDescription className="text-xs text-blue-100/70 truncate">{pelatihan?.NamaPelatihan || "Unggah surat resmi dalam format PDF."}</DialogDescription>
              </div>
              <button type="button" onClick={close} disabled={isUploading} aria-label="Tutup" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center hover:bg-white/20 disabled:opacity-40">
                <TbX className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/[0.08] ring-1 ring-white/15 backdrop-blur px-3 py-1.5 text-[11px] font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full ${hasExisting ? "bg-emerald-400" : "bg-amber-300"}`} />
              {hasExisting ? "Surat sudah diunggah — unggah file baru untuk mengganti" : "Belum ada surat diunggah"}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-5 space-y-4">
            {/* 01 Format */}
            <Section no="01" title="Gunakan format acuan" icon={TbFileText} accent="#3B82F6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Format resmi surat pemberitahuan</p>
                  <p className="text-[11px] text-slate-500">Isi sesuai format, tanda tangani, lalu simpan sebagai PDF.</p>
                </div>
                <Link href={FORMAT_URL} target="_blank" rel="noopener noreferrer" className="h-9 px-3.5 shrink-0 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 hover:bg-slate-50">
                  <TbExternalLink className="w-4 h-4" /> Lihat format
                </Link>
              </div>
            </Section>

            {/* 02 Unggah */}
            <Section no="02" title={hasExisting ? "Ganti file surat" : "Unggah file surat"} icon={TbCloudUpload} accent="#8B5CF6">
              {hasExisting && !file && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 ring-1 ring-emerald-100 dark:ring-emerald-900/40 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <TbFileCheck className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Surat saat ini</p>
                      <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70 truncate" title={existing}>{existing}</p>
                    </div>
                  </div>
                  <Link href={`${urlFileSuratPemberitahuan}/${existing}`} target="_blank" rel="noopener noreferrer" className="h-8 px-3 shrink-0 rounded-lg bg-white dark:bg-slate-900 ring-1 ring-emerald-200 dark:ring-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 hover:bg-emerald-50">
                    <TbExternalLink className="w-3.5 h-3.5" /> Lihat
                  </Link>
                </div>
              )}

              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/20 ring-1 ring-violet-200 dark:ring-violet-900/40 px-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-[#0B1B3F] text-violet-200 flex items-center justify-center shrink-0 shadow-md">
                      <TbFileText className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</p>
                      <p className="text-[11px] text-violet-700/80 dark:text-violet-300/80 tabular-nums">{fmtSize(file.size)} · siap diunggah</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFile(null)} disabled={isUploading} aria-label="Hapus file" className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center disabled:opacity-40">
                    <TbTrash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="surat-file-upload"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    pick(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 h-36 px-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${isDragging ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20" : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-violet-400 hover:bg-violet-50/40"}`}
                >
                  <span className="w-11 h-11 rounded-xl bg-[#0B1B3F] text-violet-200 flex items-center justify-center shadow-md">
                    <TbCloudUpload className="w-5 h-5" />
                  </span>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">{isDragging ? "Lepaskan file di sini" : "Klik atau seret file PDF ke sini"}</p>
                  <p className="text-[11px] text-slate-500">Hanya format <b>PDF</b></p>
                  <input
                    id="surat-file-upload"
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => {
                      pick(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </Section>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-6 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">{file ? "File siap diunggah" : "Belum ada file dipilih"}</p>
            <div className="flex gap-2">
              <button type="button" onClick={close} disabled={isUploading} className="flex-1 sm:flex-none h-11 px-5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 disabled:opacity-40"
              >
                {isUploading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbCheck className="w-4 h-4" />}
                {isUploading ? "Mengunggah…" : hasExisting ? "Ganti Surat" : "Unggah Surat"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ===================== UI ===================== */

function Section({ no, title, icon: Icon, accent, children }: { no: string; title: string; icon: IconType; accent: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="relative isolate flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
          <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
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

export default UploadSuratButton;

"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { PelatihanMasyarakat } from "@/types/product";
import { TbAlertTriangle, TbLoader2, TbTrash } from "react-icons/tb";

interface DeletePelatihanActionProps {
  idPelatihan: string;
  pelatihan: PelatihanMasyarakat | null;
  handleFetchingData?: () => void;
}

const DeletePelatihanAction: React.FC<DeletePelatihanActionProps> = ({ idPelatihan, pelatihan, handleFetchingData }) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Hanya pelatihan Draft yang masih kosong boleh dihapus (aman bila data belum termuat)
  const peserta = pelatihan?.UserPelatihan?.length ?? 0;
  const materi = pelatihan?.MateriPelatihan?.length ?? 0;
  const canDelete =
    !!pelatihan &&
    peserta === 0 &&
    materi === 0 &&
    pelatihan.Status !== "Publish" &&
    String(pelatihan.StatusPenerbitan ?? "") === "0" &&
    !!Cookies.get("Access")?.includes("createPelatihan");

  if (!canDelete) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${elautBaseUrl}/lemdik/deletePelatihan?id=${idPelatihan}`, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
      });
      Toast.fire({ icon: "success", title: "Pelatihan dihapus", text: pelatihan?.NamaPelatihan });
      setOpen(false);
      // Kembali ke daftar pelatihan sesuai level admin yang sedang aktif
      const base = pathname?.match(/^\/admin\/[^/]+/)?.[0] ?? "/admin/lemdiklat";
      router.push(`${base}/pelatihan`);
    } catch (error) {
      console.error(error);
      Toast.fire({ icon: "error", title: "Gagal menghapus", text: "Terjadi kesalahan server. Coba lagi beberapa saat." });
      handleFetchingData?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Tombol putih — sama dengan aksi lain, aksen merah */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Hapus pelatihan (hanya Draft tanpa peserta & materi)"
        className="group h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-rose-600 inline-flex items-center gap-1.5 shadow-sm hover:bg-rose-50 hover:ring-rose-200 dark:hover:bg-rose-950/30 transition-colors"
      >
        <TbTrash className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12" />
        Hapus Pelatihan
      </button>

      <AlertDialog open={open} onOpenChange={(o) => !deleting && setOpen(o)}>
        <AlertDialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 gap-0">
          <AlertDialogHeader className="space-y-3 p-6 pb-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <TbTrash className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-slate-900 dark:text-white">Hapus pelatihan ini?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-slate-500">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Pelatihan</p>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-white leading-snug">{pelatihan?.NamaPelatihan || "-"}</p>
                  {pelatihan?.KodePelatihan && <p className="text-[11px] text-slate-400 font-mono">{pelatihan.KodePelatihan}</p>}
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 ring-1 ring-rose-100 dark:ring-rose-900/40 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <TbAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  Data dihapus permanen dan tidak dapat dikembalikan.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <AlertDialogCancel disabled={deleting} className="h-11 rounded-xl">
              Batal
            </AlertDialogCancel>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="h-11 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {deleting ? <TbLoader2 className="w-4 h-4 animate-spin" /> : <TbTrash className="w-4 h-4" />}
              {deleting ? "Menghapus…" : "Ya, hapus"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletePelatihanAction;

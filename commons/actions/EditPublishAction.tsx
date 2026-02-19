"use client";

import React, { useState } from "react";
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
    FileImage,
    Rocket,
    Save,
    X,
    UploadCloud,
    Megaphone,
    Clock,
    Target
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { Editor } from "@tinymce/tinymce-react";
import { PelatihanMasyarakat } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
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
    const [tanggalMulai, setTanggalMulai] = useState(tanggalPendaftaran![0] || "");
    const [tanggalAkhir, setTanggalAkhir] = useState(tanggalPendaftaran![1] || "");
    const [detailPelatihan, setDetailPelatihan] = useState(currentDetail || "");
    const [fotoPelatihan, setFotoPelatihan] = useState<File | null>(null);
    const [kuotaPelatihan, setKuotaPelatihan] = useState(currentData?.KoutaPelatihan || "")
    const [asalPelatihan, setAsalPelatihan] = useState(currentData?.AsalPelatihan || "No Mandiri")
    const [loading, setLoading] = useState(false);

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
            const response = await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Informasi pelatihan berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
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

            <DialogContent className="max-w-4xl w-[95vw] h-[95vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl z-[99999] flex flex-col">
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
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            value={tanggalMulai}
                                            onChange={(e) => setTanggalMulai(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={Clock} label="Akhir Pendaftaran" />
                                        <input
                                            type="date"
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            value={tanggalAkhir}
                                            onChange={(e) => setTanggalAkhir(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={Users} label="Kuota Peserta" />
                                        <input
                                            type="text"
                                            placeholder="Contoh: 30 Orang"
                                            className="w-full h-10 md:h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs md:text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
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
                                <div className="rounded-[1.25rem] md:rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:shadow-md">
                                    <Editor
                                        apiKey={process.env.NEXT_PUBLIC_TINY_MCE_KEY}
                                        value={detailPelatihan}
                                        onEditorChange={(content: string) => setDetailPelatihan(content)}
                                        init={{
                                            height: 250,
                                            menubar: false,
                                            plugins: "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount",
                                            toolbar: "undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat",
                                            content_style: "body { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #334155; }",
                                            skin: "oxide",
                                            content_css: "default"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Section 3: Visual Marketing */}
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20 uppercase font-black text-[8px] md:text-[9px] px-3 py-1">Visual & Flyer</Badge>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label htmlFor="flyerUpload" className="group/upload relative block w-full h-[150px] md:h-[180px] rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500 transition-all cursor-pointer overflow-hidden shadow-inner">
                                            <input
                                                id="flyerUpload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setFotoPelatihan(e.target.files ? e.target.files[0] : null)}
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 mb-2 md:mb-3 flex items-center justify-center transition-transform group-hover/upload:scale-110 group-hover/upload:rotate-6">
                                                    <UploadCloud className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                                <p className="text-[9px] md:text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest leading-none mb-1 md:mb-2">
                                                    {fotoPelatihan ? fotoPelatihan.name : "Unggah Flyer Baru"}
                                                </p>
                                                <p className="text-[8px] md:text-xs font-medium text-slate-400 dark:text-slate-500 italic">Maksimal 5MB (JPG, PNG)</p>
                                            </div>
                                        </label>
                                    </div>
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
                                        {currentFoto && (
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600">
                                                    <FileImage className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none text-left">Asset Visual</p>
                                                    <a href={currentFoto} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs font-black text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/30 underline-offset-4 hover:text-indigo-700 transition-colors">
                                                        Lihat Flyer Aktif
                                                    </a>
                                                </div>
                                            </div>
                                        )}
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
                                        />
                                        <span>Menyimpan...</span>
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

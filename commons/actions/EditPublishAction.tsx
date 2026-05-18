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
import { Textarea } from "@/components/ui/textarea";
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
    const [tanggalMulai, setTanggalMulai] = useState(tanggalPendaftaran?.[0] || "");
    const [tanggalAkhir, setTanggalAkhir] = useState(tanggalPendaftaran?.[1] || "");
    const [detailPelatihan, setDetailPelatihan] = useState(currentDetail || "");
    const [fotoPelatihan, setFotoPelatihan] = useState<File | null>(null);
    const [kuotaPelatihan, setKuotaPelatihan] = useState(currentData?.KoutaPelatihan || "")
    const [asalPelatihan, setAsalPelatihan] = useState(currentData?.AsalPelatihan || "No Mandiri")
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
        if (!fotoPelatihan) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(fotoPelatihan);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [fotoPelatihan]);

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
                                    <div>
                                        <label htmlFor="flyerUpload" className="group/upload relative block w-full h-[200px] md:h-[240px] rounded-[2.5rem] border-[3px] border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group">
                                            {/* Background Pattern */}
                                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                            
                                            <input
                                                id="flyerUpload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setFotoPelatihan(e.target.files ? e.target.files[0] : null)}
                                            />
                                            
                                            <AnimatePresence mode="wait">
                                                {previewUrl ? (
                                                    <motion.div 
                                                        key="preview"
                                                        initial={{ opacity: 0, scale: 1.1 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="absolute inset-0 w-full h-full"
                                                    >
                                                        <img 
                                                            src={previewUrl} 
                                                            alt="Preview" 
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-8">
                                                            <div className="flex gap-3 scale-90 group-hover:scale-100 transition-transform duration-500">
                                                                <div className="bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                                                    Ganti Gambar
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setFotoPelatihan(null);
                                                                    }}
                                                                    className="bg-rose-500/20 backdrop-blur-xl p-2.5 rounded-2xl border border-rose-500/30 text-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-2xl group/btn"
                                                                >
                                                                    <X className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="empty"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                                                    >
                                                        <div className="relative mb-6">
                                                            {/* Decorative Glow */}
                                                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                                            
                                                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-indigo-500/40">
                                                                <UploadCloud className="w-8 h-8 md:w-10 md:h-10 text-indigo-100" />
                                                                
                                                                {/* Floating Badge */}
                                                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 animate-bounce">
                                                                    <div className="w-4 h-4 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] leading-none">
                                                                Unggah Flyer
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic max-w-[200px] mx-auto leading-relaxed">
                                                                Drag & drop atau klik untuk memilih file visual pelatihan
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="mt-8 px-8 py-2.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform active:scale-95">
                                                            Pilih File
                                                        </div>
                                                        
                                                        <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                                            <span>PNG</span>
                                                            <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                                            <span>JPG</span>
                                                            <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                                            <span>MAX 5MB</span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
                                        ></motion.div>
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

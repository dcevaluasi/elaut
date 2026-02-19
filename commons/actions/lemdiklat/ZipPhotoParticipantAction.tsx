"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FolderArchive, UploadCloud, Images, FileArchive, Check, AlertCircle, Save, X } from "lucide-react";
import JSZip from "jszip";
import axios from "axios";
import Toast from "@/commons/Toast";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

type UserPelatihan = {
    IdUsers: number;
    [key: string]: any;
};

type Props = {
    users: UserPelatihan[];
    onSuccess: any;
};

export default function ZipPhotoParticipantAction({ users, onSuccess }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const handleZipUpload = async (zipFile: File, users: UserPelatihan[]) => {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile, { checkCRC32: true });

        const fileNames = Object.keys(zipContent.files);
        const imageFiles = fileNames.filter((f) => {
            const ext = f.split(".").pop()?.toLowerCase();
            return ext && ["jpg", "jpeg", "png"].includes(ext);
        });

        // Some logical change to match expectation of total files if needed, 
        // but keeping existing logic: imageFiles.length / 2 might be specific to current impl?
        // Actually, looking at previous code line 50: setTotalFiles(imageFiles.length / 2);
        // I will keep it as is if that was the intended logic, though imageFiles.length usually makes more sense.
        // Let's assume there's a reason for / 2 (maybe double files in zip?).
        setTotalFiles(imageFiles.length);
        setUploadedCount(0);

        for (const fileName of imageFiles) {
            const file = zipContent.files[fileName];
            if (!file || file.dir) continue;

            const baseName = fileName.split("/").pop();
            if (!baseName) continue;

            const id = parseInt(baseName.replace(/\.[^/.]+$/, ""), 10);
            if (isNaN(id)) continue;

            const matchedUser = users.find((user) => user.IdUsers === id);
            if (!matchedUser) {
                console.warn(`⚠️ No user matched for file: ${fileName}`);
                continue;
            }

            try {
                const fileBlob = await file.async("blob");

                const formData = new FormData();
                formData.append("Fotos", fileBlob, baseName);
                formData.append("Ktps", "");
                formData.append("KKs", "");
                formData.append("Ijazahs", "");
                formData.append("SuratKesehatans", "");

                await axios.put(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/users/updateUsersNoJwt?id=${id}`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setUploadedCount((prev) => prev + 1);
            } catch (err) {
                console.error(`❌ Failed uploading ${fileName}`, err);
                Toast.fire({
                    icon: "error",
                    title: `Gagal upload foto ${baseName}`,
                });
            }
        }
    };

    const handleSubmitZipUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            await handleZipUpload(selectedFile, users);
            Toast.fire({
                icon: "success",
                title: `Berhasil!`,
                text: `Sinkronisasi selesai. ${uploadedCount} foto berhasil diperbarui.`,
            });
            onSuccess();
            setIsOpen(false);
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
    };

    const progress = totalFiles > 0 ? (uploadedCount / totalFiles) * 100 : 0;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {(Cookies.get("Access")?.includes("createPelatihan") &&
                users.length > 0) && (
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="group h-10 flex items-center gap-2.5 rounded-xl px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-600 dark:text-slate-400 font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 shadow-sm"
                        >
                            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Images className="h-4 w-4" />
                            </div>
                            <span>Upload Foto Massal</span>
                        </Button>
                    </DialogTrigger>
                )}

            <DialogContent className="w-[95vw] md:w-full max-w-lg p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/50 dark:border-slate-800 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl z-[99999]">
                <div className="flex flex-col">
                    <DialogHeader className="p-8 pb-4 space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20">
                                <FolderArchive />
                            </div>
                            <div className="space-y-2 text-center md:text-left">
                                <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-tight">
                                    Upload Foto Peserta
                                </DialogTitle>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Format: ZIP ARCHIVE</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                Fitur ini akan mengekstrak file gambar dari arsip ZIP dan mencocokkannya dengan ID Peserta. Pastikan penamaan file adalah <code className="text-indigo-600 dark:text-indigo-400 font-black px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md">ID_USER.png/jpg</code>.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="px-8 py-4 space-y-6">
                        {/* Custom Upload Zone */}
                        <div className="relative group/upload h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-indigo-500/50 overflow-hidden">
                            <input
                                id="zip-upload"
                                type="file"
                                accept=".zip"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center gap-3 text-slate-400 group-hover/upload:text-indigo-600 transition-all text-center px-6 text-xs">
                                {selectedFile ? (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-2">
                                            <FileArchive className="w-8 h-8" />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-[#5e636e] dark:text-[#9ea4b0]">
                                            {selectedFile.name}
                                        </span>
                                        <span className="opacity-60 font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Siap Proses</span>
                                    </motion.div>
                                ) : (
                                    <>
                                        <UploadCloud className="w-10 h-10 mb-1 opacity-40 group-hover/upload:opacity-100 transition-opacity" />
                                        <span className="font-black uppercase tracking-widest text-slate-400 leading-none">Klik atau Seret File ZIP ke Sini</span>
                                        <span className="opacity-60 font-medium tracking-tight">Maksimal 50MB per unggahan</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <AnimatePresence>
                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3 p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10"
                                >
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                        <span>Progres Sinkronisasi Data...</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2 rounded-full" />
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {uploadedCount} dari {totalFiles} Foto Berhasil Diproses
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={isUploading}
                                className="w-full sm:w-auto h-12 px-8 rounded-2xl text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Tutup
                            </Button>
                            <Button
                                onClick={handleSubmitZipUpload}
                                disabled={!selectedFile || isUploading}
                                className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isUploading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Sedang Mengupload...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Upload</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

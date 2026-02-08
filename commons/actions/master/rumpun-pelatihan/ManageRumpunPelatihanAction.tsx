"use client";

import React, { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { TbPlus, TbPencil, TbCategory, TbChecks, TbX } from "react-icons/tb";
import { RumpunPelatihan } from "@/types/program";

const ManageRumpunPelatihanAction: React.FC<{
    onSuccess?: () => void;
    initialData?: RumpunPelatihan; // kalau ada berarti edit
}> = ({ onSuccess, initialData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nama, setNama] = useState("");
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode && initialData) {
            setNama(initialData.name);
        } else {
            setNama("");
        }
    }, [isEditMode, initialData, isOpen]);

    const clearForm = () => {
        setNama("");
    };

    const handleSubmit = async () => {
        const form = { Name: nama };

        try {
            setLoading(true);
            if (isEditMode && initialData) {
                await axios.put(
                    `${elautBaseUrl}/rumpun_pelatihan/update_rumpun_pelatihan?id=${initialData.id_rumpun_pelatihan}`,
                    form
                );
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: `Rumpun pelatihan berhasil diperbarui.`,
                });
            } else {
                await axios.post(
                    `${elautBaseUrl}/rumpun_pelatihan/create_rumpun_pelatihan`,
                    form
                );
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: `Rumpun pelatihan baru berhasil ditambahkan.`,
                });
            }

            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            clearForm();
        } catch (error) {
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat ${isEditMode ? "memperbarui" : "menambahkan"
                    } rumpun pelatihan!`,
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {isEditMode ? (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all border-yellow-500 text-yellow-500 hover:text-white hover:bg-amber-500"
                    >
                        <TbPencil className="h-5 w-5" />
                        <span>Edit Klaster Pelatihan</span>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                    >
                        <TbPlus className="h-5 w-5" />
                        <span>Tambah Klaster Pelatihan</span>
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[95vw] max-w-[95vw] h-[90vh] p-0 bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbCategory size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${isEditMode ? "bg-amber-500" : "bg-emerald-500"} animate-pulse`} />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    {isEditMode ? "Modification Mode" : "Registration Mode"}
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                {isEditMode ? "Edit Klaster Pelatihan" : "Tambah Klaster Pelatihan"}
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <TbX size={22} />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Klaster</label>
                            <div className="relative group">
                                <TbCategory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Contoh: TEKNOLOGI PENANGKAPAN IKAN"
                                    className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 uppercase"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button onClick={() => setIsOpen(false)} disabled={loading} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> {isEditMode ? "Update Data" : "Confirm Entry"}</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ManageRumpunPelatihanAction;

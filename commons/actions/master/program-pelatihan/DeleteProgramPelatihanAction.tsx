"use client";

import React, { useState } from "react";
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
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { ProgramPelatihan } from "@/types/program";
import { TbTrash, TbAlertTriangle } from "react-icons/tb";

const DeleteProgramPelatihanAction: React.FC<{
    program: ProgramPelatihan;
    onSuccess?: () => void;
}> = ({ program, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${elautBaseUrl}/program_pelatihan/delete_program_pelatihan?id=${program.id_program_pelatihan}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Program pelatihan berhasil dihapus.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            setLoading(false);
            setIsOpen(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menghapus program.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 group/del border border-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all shadow-sm cursor-pointer"
                >
                    <TbTrash size={18} />
                </div>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md p-0 bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999]">
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center animate-pulse">
                            <TbAlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <AlertDialogTitle className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            Hapus Program?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium text-slate-500">
                            Anda akan menghapus program <span className="font-bold text-slate-800 dark:text-slate-200">"{program?.name_indo}"</span>. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 pt-0 border-t-0 gap-3 justify-center">
                    <AlertDialogCancel
                        disabled={loading}
                        className="h-12 px-8 rounded-2xl border-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 w-full"
                    >
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="h-12 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Menghapus...
                            </div>
                        ) : (
                            "Ya, Hapus"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteProgramPelatihanAction;

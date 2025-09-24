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
import { TbPlus, TbPencil } from "react-icons/tb";
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

            <AlertDialogContent className="max-w-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isEditMode
                            ? "Edit Klaster Pelatihan"
                            : "Tambah Klaster Pelatihan Baru"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isEditMode
                            ? "Perbarui data klaster pelatihan berikut."
                            : "Isi data berikut untuk menambahkan klaster pelatihan baru."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Nama Klaster
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={loading}
                    >
                        {loading
                            ? "Menyimpan..."
                            : isEditMode
                                ? "Perbarui"
                                : "Simpan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ManageRumpunPelatihanAction;

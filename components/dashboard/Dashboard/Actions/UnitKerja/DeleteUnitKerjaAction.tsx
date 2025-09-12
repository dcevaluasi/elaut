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
import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { TbTrash } from "react-icons/tb";
import { UnitKerja } from "@/types/master";

const DeleteUnitKerjaAction: React.FC<{
    unitKerja: UnitKerja;
    onSuccess?: () => void;
}> = ({ unitKerja, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${elautBaseUrl}/unit-kerja/deleteUnitKerja?id=${unitKerja.id_unit_kerja}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Data unit kerja berhasil dihapus.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menghapus unit kerja.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-3 py-1.5 shadow-sm text-sm text-rose-500 hover:text-white border-rose-500 hover:bg-rose-500"
                >
                    <TbTrash className="h-4 w-4" />
                    Hapus
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Data {unitKerja?.nama}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Menghapus data akan bersifat permanent, apakah anda yakin untuk menghapus data unit kerja berikut ?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menghapus..." : "Hapus"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteUnitKerjaAction;

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
import { Instruktur } from "@/types/instruktur";
import { TbTrash } from "react-icons/tb";

const DeleteInstrukturAction: React.FC<{
    instruktur: Instruktur;
    onSuccess?: () => void;
}> = ({ instruktur, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${elautBaseUrl}/deleteInstruktur/${instruktur.IdInstruktur}`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Data instruktur berhasil dihapus.",
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
                text: "Terjadi kesalahan saat menghapus instruktur.",
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
                    <AlertDialogTitle>Hapus Data {instruktur?.nama}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Menghapus data akan bersifat permanent, apakah anda yakin untuk menghapus data instruktur berikut ?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <Button
                        variant="default"
                        onClick={handleUpdate}
                        className="bg-rose-600 hover:bg-rose-600 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menghapus..." : "Hapus"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteInstrukturAction;

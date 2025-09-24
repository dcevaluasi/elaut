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
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { TbPlus } from "react-icons/tb";

const AddProgramPelatihanAction: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nama, setNama] = useState("");
    const [idRumpunPelatihan, setIdRumpunPelatihan] = useState("");
    const [namaEng, setNamaEng] = useState("");
    const [nameSingkatan, setNameSingkatan] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const clearForm = () => {
        setIdRumpunPelatihan("")
        setNama("");
        setNamaEng("")
        setNameSingkatan("")
        setDescription("")
    };

    const handleSubmit = async () => {
        const form = {
            IDRumpunPelatihan: idRumpunPelatihan,
            NameIndo: nama,
            NameEnglish: namaEng,
            AbbrvName: nameSingkatan,
            Description: description
        };

        try {
            setLoading(true);
            const response = await axios.post(
                `${elautBaseUrl}/program_pelatihan/create_program_pelatihan`,
                form
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `Program pelatihan baru berhasil ditambahkan.`,
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            clearForm();
        } catch (error) {
            setLoading(false);
            clearForm();
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat menambahkan program pelatihan!`,
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                >
                    <TbPlus className="h-5 w-5" />
                    <span>Tambah Klaster Pelatihan</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Klaster Pelatihan Baru</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isi data berikut untuk menambahkan klaster pelatihan baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Judul Klaster Pelatihan Pelatihan
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
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddProgramPelatihanAction;

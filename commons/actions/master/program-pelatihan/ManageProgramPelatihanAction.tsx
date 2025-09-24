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
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { ProgramPelatihan, RumpunPelatihan } from "@/types/program";

const ManageProgramPelatihanAction: React.FC<{
    onSuccess?: () => void;
    initialData?: ProgramPelatihan;
}> = ({ onSuccess, initialData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [idRumpunPelatihan, setIdRumpunPelatihan] = useState("");
    const [nama, setNama] = useState("");
    const [namaEng, setNamaEng] = useState("");
    const [nameSingkatan, setNameSingkatan] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const { data: rumpunData, loading: rumpunLoading, error } = useFetchDataRumpunPelatihan();

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode && initialData) {
            setIdRumpunPelatihan(initialData.id_rumpun_pelatihan.toString());
            setNama(initialData.name_indo);
            setNamaEng(initialData.name_english);
            setNameSingkatan(initialData.abbrv_name);
            setDescription(initialData.description);
        } else {
            clearForm();
        }
    }, [isEditMode, initialData, isOpen]);

    const clearForm = () => {
        setIdRumpunPelatihan("");
        setNama("");
        setNamaEng("");
        setNameSingkatan("");
        setDescription("");
    };

    const handleSubmit = async () => {
        const form = {
            IDRumpunPelatihan: idRumpunPelatihan,
            NameIndo: nama,
            NameEnglish: namaEng,
            AbbrvName: nameSingkatan,
            Description: description,
        };

        try {
            setLoading(true);
            if (isEditMode && initialData) {
                await axios.put(
                    `${elautBaseUrl}/program_pelatihan/update_program_pelatihan?id=${initialData.id_program_pelatihan}`,
                    form
                );
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Program pelatihan berhasil diperbarui.",
                });
            } else {
                const res = await axios.post(
                    `${elautBaseUrl}/program_pelatihan/create_program_pelatihan`,
                    form
                );
                console.log({ res })
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Program pelatihan baru berhasil ditambahkan.",
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
                    } program pelatihan!`,
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {isEditMode ? (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500"
                    >
                        <TbPencil className="h-5 w-5" />
                        <span>Edit Program Pelatihan</span>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                    >
                        <TbPlus className="h-5 w-5" />
                        <span>Tambah Program Pelatihan</span>
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isEditMode
                            ? "Edit Program Pelatihan"
                            : "Tambah Program Pelatihan Baru"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isEditMode
                            ? "Perbarui data program pelatihan berikut."
                            : "Isi data berikut untuk menambahkan program pelatihan baru."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-3 overflow-y-auto pr-2">
                    {/* Pilih Rumpun Pelatihan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Rumpun Pelatihan
                        </label>
                        <select
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={idRumpunPelatihan}
                            onChange={(e) => setIdRumpunPelatihan(e.target.value)}
                            disabled={rumpunLoading}
                        >
                            <option value="">-- Pilih Rumpun Pelatihan --</option>
                            {rumpunData?.map((rumpun: RumpunPelatihan) => (
                                <option
                                    key={rumpun.id_rumpun_pelatihan}
                                    value={rumpun.id_rumpun_pelatihan}
                                >
                                    {rumpun.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nama Indo */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Nama (Indonesia)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>

                    {/* Nama English */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Nama (English)
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={namaEng}
                            onChange={(e) => setNamaEng(e.target.value)}
                        />
                    </div>

                    {/* Singkatan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Singkatan
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nameSingkatan}
                            onChange={(e) => setNameSingkatan(e.target.value)}
                        />
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Deskripsi
                        </label>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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

export default ManageProgramPelatihanAction;

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { moduleBaseUrl } from "@/constants/urls";
import { TbPencil } from "react-icons/tb";
import { MateriPelatihan } from "@/types/module";
import {
    PROGRAM_KELAUTAN,
    PROGRAM_PERIKANAN_ADMIN,
    RUMPUN_PELATIHAN,
} from "@/constants/pelatihan";

const UpdateModulAction: React.FC<{
    materiPelatihan: MateriPelatihan;
    onSuccess?: () => void;
}> = ({ materiPelatihan, onSuccess }) => {
    const pathname = usePathname();
    const isBahanAjar = pathname.includes("bahan-ajar");
    const label = isBahanAjar ? "Bahan Ajar" : "Modul";

    const [isOpen, setIsOpen] = useState(false);

    // Controlled states (prefill data lama)
    const [nama, setNama] = useState(materiPelatihan.NamaMateriPelatihan || "");
    const [deskripsiMateriPelatihan, setDeskripsiMateriPelatihan] = useState(
        materiPelatihan.DeskripsiMateriPelatihan || ""
    );
    const [berlakuSampai, setBerlakuSampai] = useState(
        materiPelatihan.BerlakuSampai || ""
    );
    const [isVerified, setIsVerified] = useState(
        materiPelatihan.IsVerified || "No Verified"
    );
    const [bidangMateriPelatihan, setBidangMateriPelatihan] = useState(
        materiPelatihan.BidangMateriPelatihan || ""
    );
    const [jamPelajaran, setJamPelajaran] = useState(
        materiPelatihan.JamPelajaran || ""
    );
    const [tahun, setTahun] = useState(
        materiPelatihan.NamaPenderitaMateriPelatihan || ""
    );

    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        const form = {
            nama_materi_pelatihan: nama,
            deskripsi_materi_pelatihan: deskripsiMateriPelatihan,
            berlaku_sampai: berlakuSampai,
            tahun: tahun,
            bidang_materi_pelatihan: bidangMateriPelatihan,
            jam_pelajaran: jamPelajaran,
            is_verified: isVerified
        };

        try {
            setLoading(true);
            const response = await axios.put(
                `${moduleBaseUrl}/materi-pelatihan/updateMateriPelatihan?id=${materiPelatihan.IdMateriPelatihan}`,
                form,
            );

            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `Data materi/${label.toLowerCase()} pelatihan berhasil diperbarui.`,
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat memperbarui materi/${label.toLowerCase()} pelatihan.`,
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500"
                >
                    <TbPencil className="h-4 w-4" />
                    Edit
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Data {label} Pelatihan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ubah data {label.toLowerCase()} pelatihan berikut sesuai kebutuhan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Nama Materi/{label} Pelatihan
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>

                    {/* Deskripsi */}
                    {/* <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
              value={deskripsiMateriPelatihan}
              onChange={(e) => setDeskripsiMateriPelatihan(e.target.value)}
            />
          </div> */}

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Bidang Pelatihan
                        </label>
                        <Select
                            value={bidangMateriPelatihan}
                            onValueChange={(value) => setBidangMateriPelatihan(value)}
                        >
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih bidang" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                {RUMPUN_PELATIHAN.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Jam Pelajaran
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={jamPelajaran}
                            onChange={(e) => setJamPelajaran(e.target.value)}
                        />
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleUpdate}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Update"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UpdateModulAction;

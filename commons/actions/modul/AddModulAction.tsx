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
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { moduleBaseUrl } from "@/constants/urls";
import { TbPlus } from "react-icons/tb";
import { RUMPUN_PELATIHAN } from "@/constants/pelatihan";
import { years } from "@/utils/time";

const AddModulAction: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const pathname = usePathname();
    const isBahanAjar = pathname.includes("bahan-ajar");
    const label = isBahanAjar ? "Bahan Ajar" : "Modul";

    const [isOpen, setIsOpen] = useState(false);
    const [nama, setNama] = useState("");
    const idUnitKerja = Cookies.get("IDUnitKerja");
    const [berlakuSampai, setBerlakuSampai] = useState("");
    const [bidangMateriPelatihan, setBidangMateriPelatihan] = useState("");
    const [jamPelajaran, setJamPelajaran] = useState("");
    const [tahun, setTahun] = useState("");
    const [loading, setLoading] = useState(false);

    const clearForm = () => {
        setNama("");
        setBerlakuSampai("");
        setBidangMateriPelatihan("");
        setJamPelajaran("");
        setTahun("");
    };

    const handleSubmit = async () => {
        const form = {
            nama_materi_pelatihan: nama,
            deskripsi_materi_pelatihan: idUnitKerja,
            berlaku_sampai: isBahanAjar ? "2" : "1", // 👈 BerlakuSampai sesuai
            bidang_materi_pelatihan: bidangMateriPelatihan,
            jam_pelajaran: jamPelajaran,
            tahun: tahun,
            is_verified: "No Verified",
        };

        try {
            setLoading(true);
            const response = await axios.post(
                `${moduleBaseUrl}/materi-pelatihan/createMateriPelatihan`,
                form
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: `${label} baru berhasil ditambahkan.`,
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            clearForm();
            console.log("CREATE: ", response);
        } catch (error) {
            console.error("ERROR CREATE: ", error);
            setLoading(false);
            clearForm();
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat menambahkan ${label.toLowerCase()}.`,
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
                    <span>Tambah {label}</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tambah {label} Baru</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isi data berikut untuk menambahkan {label.toLowerCase()} baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Judul {label} Pelatihan
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                        <p className="text-gray-700 text-xs mt-1">
                            {label == "Bahan Ajar" && "*Contoh Penamaan : Bahan Ajar Pelatihan Budidaya Udang Vaname"}
                        </p>
                    </div>

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

                    <div className="flex gap-2 w-full">
                        <div className="w-full space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Jam Pelajaran
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={jamPelajaran}
                                onChange={(e) => setJamPelajaran(e.target.value)}
                            />
                            <p className="text-gray-700 text-xs mt-1">
                                *Hanya tuliskan angka saja
                            </p>
                        </div>

                        <div className="w-full space-y-1">
                            <label className="text-sm font-medium text-gray-700">Tahun</label>
                            <Select
                                value={tahun}
                                onValueChange={(value) => setTahun(value)}
                            >
                                <SelectTrigger className="w-full text-base py-5 mt-0">
                                    <SelectValue placeholder="Pilih tahun" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[9999999]">
                                    {years.map((item) => (
                                        <SelectItem key={item} value={item.toString()}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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

export default AddModulAction;

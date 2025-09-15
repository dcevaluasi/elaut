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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/components/toast";
import { moduleBaseUrl } from "@/constants/urls";
import { TbPlus } from "react-icons/tb";
import { PROGRAM_AKP, PROGRAM_KELAUTAN, PROGRAM_PERIKANAN_ADMIN, RUMPUN_PELATIHAN } from "@/constants/pelatihan";

const AddModulAction: React.FC<{ onSuccess?: () => void }> = ({
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState("");
    const idUnitKerja = Cookies.get('IDUnitKerja');
    const [berlakuSampai, setBerlakuSampai] = useState("");
    const [bidangMateriPelatihan, setBidangMateriPelatihan] = useState("");
    const [jamPelajaran, setJamPelajaran] = useState("");
    const [tahun, setTahun] = useState("")

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
            berlaku_sampai: berlakuSampai,
            bidang_materi_pelatihan: bidangMateriPelatihan,
            jam_pelajaran: jamPelajaran,
            tahun: tahun
        };

        try {
            setLoading(true);
            const response = await axios.post(
                `${moduleBaseUrl}/materi-pelatihan/createMateriPelatihan`,
                form,
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Modul baru berhasil ditambahkan.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("CREATE MODUL: ", response);
            clearForm()
        } catch (error) {
            console.error("ERROR CREATE MODUL: ", error);
            setLoading(false);
            clearForm()
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menambahkan modul.",
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
                    <span>Tambah Modul/Perangkat</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Modul/Perangkat Baru</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isi data berikut untuk menambahkan modul baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Nama Materi Modul/Perangkat Pelatihan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>

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
                        <label className="text-sm font-medium text-gray-700">Bidang Pelatihan</label>
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
                        <label className="text-sm font-medium text-gray-700">Jam Pelajaran</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={jamPelajaran}
                            onChange={(e) => setJamPelajaran(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tahun</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={tahun}
                            onChange={(e) => setTahun(e.target.value)}
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

export default AddModulAction;

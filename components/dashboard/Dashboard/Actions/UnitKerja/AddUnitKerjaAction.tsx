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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { TbPlus } from "react-icons/tb";

const AddUnitKerjaAction: React.FC<{ onSuccess?: () => void }> = ({
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState("");
    const [alamat, setAlamat] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [pimpinan, setPimpinan] = useState("");
    const [callCenter, setCallCenter] = useState("");
    const [tipe, setTipe] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(false);

    const clearForm = () => {
        setNama("");
        setAlamat("");
        setLokasi("");
        setPimpinan("");
        setCallCenter("");
        setTipe("");
        setStatus("");
    };

    const handleSubmit = async () => {
        const form = {
            nama,
            alamat,
            lokasi,
            pimpinan,
            call_center: callCenter,
            tipe,
            status
        };

        try {
            setLoading(true);
            const response = await axios.post(
                `${elautBaseUrl}/unit-kerja/createUnitKerja`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Unit Kerja baru berhasil ditambahkan.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            clearForm()
        } catch (error) {
            console.error("ERROR CREATE UNIT KERJA: ", error);
            setLoading(false);
            clearForm()
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menambahkan unit kerja.",
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
                    <span>Tambah Unit Kerja</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Unit Kerja Baru</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isi data berikut untuk menambahkan unit kerja baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] flex flex-col gap-1 overflow-y-auto pr-2">
                    {/* Nama */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Nama</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Alamat</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Lokasi</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={lokasi}
                            onChange={(e) => setLokasi(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Pimpinan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={pimpinan}
                            onChange={(e) => setPimpinan(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Call Center/Kontak PTSP</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={callCenter}
                            onChange={(e) => setCallCenter(e.target.value)}
                        />
                    </div>


                    {/* Pendidikan Terakhir */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tipe</label>
                        <Select
                            value={tipe}
                            onValueChange={(value) => setTipe(value)}
                        >
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999999]">
                                <SelectItem value="UPT KKP">
                                    UPT KKP
                                </SelectItem>
                                <SelectItem value="UPT NON KKP">
                                    UPT NON KKP
                                </SelectItem>
                                <SelectItem value="P2MKP">
                                    P2MKP
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                <SelectItem value="Active">Aktif</SelectItem>
                                <SelectItem value="No Active">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
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

export default AddUnitKerjaAction;

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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { TbPencil } from "react-icons/tb";
import { UnitKerja } from "@/types/master";

const UpdateUnitKerjaAction: React.FC<{
    unitKerja: UnitKerja;
    onSuccess?: () => void;
}> = ({ unitKerja, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Controlled states (prefill data lama)
    const [nama, setNama] = useState(unitKerja.nama || "");
    const [alamat, setAlamat] = useState(unitKerja.alamat || "");
    const [lokasi, setLokasi] = useState(unitKerja.lokasi || "");
    const [pimpinan, setPimpinan] = useState(unitKerja.pimpinan || "");
    const [callCenter, setCallCenter] = useState(unitKerja.call_center || "");
    const [tipe, setTipe] = useState(unitKerja.tipe || "");
    const [status, setStatus] = useState(unitKerja.status || "Active");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
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
            const response = await axios.put(
                `${elautBaseUrl}/unit-kerja/updateUnitKerja?id=${unitKerja.id_unit_kerja}`,
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
                text: "Data unit kerja berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("UPDATE UNIT KERJA: ", response);
        } catch (error) {
            console.error("ERROR UPDATE UNIT KERJA: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui unit kerja.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-3 py-1.5 shadow-sm text-sm text-gray-500 hover:text-white border-gray-500 hover:bg-gray-500"
                >
                    <TbPencil className="h-4 w-4" />
                    Edit
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Data Unit Kerja</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ubah data unit kerja berikut sesuai kebutuhan.
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

export default UpdateUnitKerjaAction;

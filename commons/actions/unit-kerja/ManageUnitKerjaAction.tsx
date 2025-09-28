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
import { TbPencil, TbPlus } from "react-icons/tb";
import { UnitKerja } from "@/types/master";

type Props = {
    unitKerja?: UnitKerja;
    onSuccess?: () => void;
};

const ManageUnitKerjaAction: React.FC<Props> = ({ unitKerja, onSuccess }) => {
    const isUpdate = !!unitKerja;
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState(unitKerja?.nama || "");
    const [alamat, setAlamat] = useState(unitKerja?.alamat || "");
    const [lokasi, setLokasi] = useState(unitKerja?.lokasi || "");
    const [pimpinan, setPimpinan] = useState(unitKerja?.pimpinan || "");
    const [callCenter, setCallCenter] = useState(unitKerja?.call_center || "");
    const [tipe, setTipe] = useState(unitKerja?.tipe || "");
    const [status, setStatus] = useState(unitKerja?.status || "Active");
    const [loading, setLoading] = useState(false);

    const [namaPimpinan, setNamaPimpinan] = useState("");
    const [jabatanIndo, setJabatanIndo] = useState("");
    const [jabatanEng, setJabatanEng] = useState("");
    const [lokasiPimpinan, setLokasiPimpinan] = useState("");

    useEffect(() => {
        if (pimpinan) {
            const parts = pimpinan.match(/\{([^}]+)\}/g)?.map((p) => p.replace(/[{}]/g, ""));
            if (parts && parts.length >= 4) {
                setNamaPimpinan(parts[0]);
                setJabatanIndo(parts[1]);
                setJabatanEng(parts[2]);
                setLokasiPimpinan(parts[3]);
            }
        }
    }, [pimpinan]);

    const clearForm = () => {
        setNama("");
        setAlamat("");
        setLokasi("");
        setPimpinan("");
        setCallCenter("");
        setTipe("");
        setStatus("Active");
        setNamaPimpinan("");
        setJabatanIndo("");
        setJabatanEng("");
        setLokasiPimpinan("");
    };

    const handleSubmit = async () => {
        const combined = `{${namaPimpinan}}{${jabatanIndo}}{${jabatanEng}}{${lokasiPimpinan}}`;
        const form = {
            nama,
            alamat,
            lokasi,
            pimpinan: combined,
            call_center: callCenter,
            tipe,
            status,
        };

        try {
            setLoading(true);
            if (isUpdate) {
                await axios.put(
                    `${elautBaseUrl}/unit-kerja/updateUnitKerja?id=${unitKerja?.id_unit_kerja}`,
                    form,
                    { headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } }
                );
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Data unit kerja berhasil diperbarui.",
                });
            } else {
                await axios.post(`${elautBaseUrl}/unit-kerja/createUnitKerja`, form, {
                    headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
                });
                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Unit kerja baru berhasil ditambahkan.",
                });
            }

            setIsOpen(false);
            if (!isUpdate) clearForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("ERROR SUBMIT UNIT KERJA: ", error);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: `Terjadi kesalahan saat ${isUpdate ? "memperbarui" : "menambahkan"} unit kerja.`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {isUpdate ? (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-3 py-1.5 shadow-sm text-sm text-gray-500 hover:text-white border-gray-500 hover:bg-gray-500"
                    >
                        <TbPencil className="h-4 w-4" />
                        Edit
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                    >
                        <TbPlus className="h-5 w-5" />
                        <span>Tambah Unit Kerja</span>
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isUpdate ? "Edit Data Unit Kerja" : "Tambah Unit Kerja Baru"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isUpdate
                            ? "Ubah data unit kerja berikut sesuai kebutuhan."
                            : "Isi data berikut untuk menambahkan unit kerja baru."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Form isi */}
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

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Nama Pimpinan</label>
                            <input
                                type="text"
                                value={namaPimpinan}
                                onChange={(e) => setNamaPimpinan(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Jabatan (Indonesia)</label>
                            <input
                                type="text"
                                value={jabatanIndo}
                                onChange={(e) => setJabatanIndo(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Jabatan (English)</label>
                            <input
                                type="text"
                                value={jabatanEng}
                                onChange={(e) => setJabatanEng(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Lokasi Penandatanganan (Contoh: Bitung, Ambon)</label>
                            <input
                                type="text"
                                value={lokasiPimpinan}
                                onChange={(e) => setLokasiPimpinan(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 text-sm"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Call Center/Kontak PTSP</label>
                        <input
                            type="text"
                            placeholder="62..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={callCenter}
                            onChange={(e) => setCallCenter(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tipe</label>
                        <Select value={tipe} onValueChange={setTipe}>
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="top" className="z-[9999999]">                                <SelectItem value="UPT KKP">UPT KKP</SelectItem>
                                <SelectItem value="UPT NON KKP">UPT NON KKP</SelectItem>
                                <SelectItem value="P2MKP">P2MKP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                        className={isUpdate ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : isUpdate ? "Update" : "Simpan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ManageUnitKerjaAction;

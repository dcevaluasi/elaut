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
import { TbEditCircle } from "react-icons/tb";
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
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { PelatihanMasyarakat } from "@/types/product";
import { AKP_CERTIFICATIONS, AQUACULTURE_CERTIFICATIONS, OCEAN_CERTIFICATIONS } from "@/constants/serkom";
import { ESELON_1, ESELON_2, ESELON_3, UPT } from "@/constants/nomenclatures";

interface EditPelatihanActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

const EditPelatihanAction: React.FC<EditPelatihanActionProps> = ({
    idPelatihan,
    currentData,
    onSuccess,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // controlled states
    const [program, setProgram] = useState(currentData?.Program || "");
    const [ttdSertifikat, setTtdSertifikat] = useState(currentData?.TtdSertifikat || "");
    const [jenisProgram, setJenisProgram] = useState(currentData?.JenisProgram || "");
    const [jenisPelatihan, setJenisPelatihan] = useState(currentData?.JenisPelatihan || "");
    const [dukunganProgramTerobosan, setDukunganProgramTerobosan] = useState(
        currentData?.DukunganProgramTerobosan || ""
    );
    const [penyelenggaraPelatihan, setPenyelenggaraPelatihan] = useState(
        currentData?.PenyelenggaraPelatihan || ""
    );
    const [tanggalMulaiPelatihan, setTanggalMulaiPelatihan] = useState(
        currentData?.TanggalMulaiPelatihan || ""
    );
    const [tanggalBerakhirPelatihan, setTanggalBerakhirPelatihan] = useState(
        currentData?.TanggalBerakhirPelatihan || ""
    );
    const [lokasiPelatihan, setLokasiPelatihan] = useState(currentData?.LokasiPelatihan || "");
    const [pelaksanaanPelatihan, setPelaksanaanPelatihan] = useState(
        currentData?.PelaksanaanPelatihan || ""
    );
    const [hargaPelatihan, setHargaPelatihan] = useState(currentData?.HargaPelatihan || 0);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const form = {
            Program: program,
            JenisProgram: jenisProgram,
            JenisPelatihan: jenisPelatihan,
            DukunganProgramTerobosan: dukunganProgramTerobosan,
            PenyelenggaraPelatihan: penyelenggaraPelatihan,
            TanggalMulaiPelatihan: tanggalMulaiPelatihan,
            TanggalBerakhirPelatihan: tanggalBerakhirPelatihan,
            LokasiPelatihan: lokasiPelatihan,
            PelaksanaanPelatihan: pelaksanaanPelatihan,
            HargaPelatihan: hargaPelatihan,
            TtdSertifikat: ttdSertifikat,
        };

        try {
            setLoading(true);
            const response = await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
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
                text: "Informasi pelatihan berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("UPDATE PELATIHAN: ", response);
        } catch (error) {
            console.error("ERROR UPDATE PELATIHAN: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {
                    (Cookies.get("Access")?.includes("createPelatihan") &&
                        (currentData?.StatusPenerbitan === "0" || currentData?.StatusPenerbitan === "3" || currentData?.StatusPenerbitan === "1.2")) && <Button
                            variant="outline"
                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500"
                        >
                        <TbEditCircle className="h-5 w-5" />
                        <span>Edit Informasi Pelatihan</span>
                    </Button>
                }
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Informasi Pelatihan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perbarui data utama pelatihan berikut sesuai kebutuhan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 max-h-[70vh] gap-3 overflow-y-auto pr-2 grid grid-cols-2">
                    {/* Jenis Program */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Bidang</label>
                        <Select value={jenisProgram} onValueChange={setJenisProgram}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih bidang" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                <SelectItem value="Awak Kapal Perikanan">Awak Kapal Perikanan</SelectItem>
                                <SelectItem value="Perikanan">Perikanan</SelectItem>
                                <SelectItem value="Kelautan">Kelautan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Program */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Program</label>
                        <Select value={program} onValueChange={setProgram}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih program" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5} >
                                <SelectGroup>
                                    <SelectLabel>Pilih Program Pelatihan</SelectLabel>
                                    {jenisProgram === "Awak Kapal Perikanan" &&
                                        AKP_CERTIFICATIONS.map((item, idx) => (
                                            <SelectItem key={idx} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    {jenisProgram === "Perikanan" &&
                                        AQUACULTURE_CERTIFICATIONS.map((item, idx) => (
                                            <SelectItem key={idx} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                    {jenisProgram === "Kelautan" &&
                                        OCEAN_CERTIFICATIONS.map((item, idx) => (
                                            <SelectItem key={idx} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Jenis Pelatihan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Jenis Pelatihan</label>
                        <Select value={jenisPelatihan} onValueChange={setJenisPelatihan}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih jenis pelatihan" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                <SelectItem value="Aspirasi">Aspirasi</SelectItem>
                                <SelectItem value="PNBP/BLU">PNBP/BLU</SelectItem>
                                <SelectItem value="Reguler">Reguler</SelectItem>
                                <SelectItem value="Kerja Sama">Kerja Sama</SelectItem>
                                <SelectItem value="Satuan Pendidikan">Satuan Pendidikan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dukungan Program Terobosan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Dukungan Program Terobosan</label>
                        <Select value={dukunganProgramTerobosan} onValueChange={setDukunganProgramTerobosan}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih dukungan program" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                <SelectItem value="Non Terobosan">Non Terobosan</SelectItem>
                                <SelectItem value="Konservasi">Konservasi</SelectItem>
                                <SelectItem value="PIT">PIT</SelectItem>
                                <SelectItem value="Kalaju/Kalamo">Kalaju/Kalamo</SelectItem>
                                <SelectItem value="KPB">KPB</SelectItem>
                                <SelectItem value="Budidaya">Budidaya</SelectItem>
                                <SelectItem value="Pengawasan Pesisir">Pengawasan Pesisir</SelectItem>
                                <SelectItem value="BCL">BCL</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Penyelenggara */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Penyelenggara</label>
                        <Select value={penyelenggaraPelatihan} onValueChange={setPenyelenggaraPelatihan}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih penyelenggara" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                {UPT.map((item, idx) => (
                                    <SelectItem key={idx} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pelaksanaan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Pelaksanaan</label>
                        <Select value={pelaksanaanPelatihan} onValueChange={setPelaksanaanPelatihan}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih pelaksanaan pelatihan" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Offline/Klasikal">Klasikal</SelectItem>
                                <SelectItem value="Online+Offline/Blended">Blended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tanggal Mulai */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tanggal Mulai</label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            value={tanggalMulaiPelatihan}
                            onChange={(e) => setTanggalMulaiPelatihan(e.target.value)}
                        />
                    </div>

                    {/* Tanggal Berakhir */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                        <input
                            type="date"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            value={tanggalBerakhirPelatihan}
                            onChange={(e) => setTanggalBerakhirPelatihan(e.target.value)}
                        />
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-gray-700">Lokasi Pelatihan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            value={lokasiPelatihan}
                            onChange={(e) => setLokasiPelatihan(e.target.value)}
                        />
                    </div>

                    {/* Harga */}
                    <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-gray-700">Harga Pelatihan</label>
                        <input
                            type="number"
                            min={0}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            value={hargaPelatihan}
                            onChange={(e) => setHargaPelatihan(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex mb-1 w-full flex-col gap-1 -mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penandatangan Sertifikat
                    </label>
                    <Select
                        value={ttdSertifikat}
                        onValueChange={setTtdSertifikat}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Penandatangan" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[9999999]">
                            <SelectItem value={ESELON_1.fullName}>{ESELON_1.abbrv}</SelectItem>
                            <SelectItem value={ESELON_2.fullName}>{ESELON_2.abbrv}</SelectItem>
                            <SelectItem value={ESELON_3.fullName}>{ESELON_3.abbrv}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditPelatihanAction;

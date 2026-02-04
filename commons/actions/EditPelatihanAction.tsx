"use client";

import React, { ChangeEvent, useState } from "react";
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
import Toast from "@/commons/Toast";
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
import { DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN, JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN, PELAKSANAAN_PELATIHAN, SEKTOR_PELATIHAN } from "@/constants/pelatihan";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { ProgramPelatihan, RumpunPelatihan } from "@/types/program";
import ManageProgramPelatihanAction from "./master/program-pelatihan/ManageProgramPelatihanAction";

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


    const {
        data: dataRumpunPelatihan,
        loading: loadingRumpunPelatihan,
        error: errorRumpunPelatihan,
        fetchRumpunPelatihan
    } = useFetchDataRumpunPelatihan();

    const [program, setProgram] = useState(currentData?.Program || "");
    const [bidang, setBidang] = useState(currentData?.BidangPelatihan || "");

    const [selectedRumpunPelatihan, setSelectedRumpunPelatihan] = useState<RumpunPelatihan | null>(null);

    // update selected when data or bidang changes
    React.useEffect(() => {
        if (dataRumpunPelatihan && bidang) {
            const found = dataRumpunPelatihan.find(item => item.name === bidang) || null;
            setSelectedRumpunPelatihan(found);
        }
    }, [dataRumpunPelatihan, bidang]);


    // controlled states
    const [namaPelatihan, setNamaPelatihan] = useState(currentData?.NamaPelatihan || "");
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
            NamaPelatihan: namaPelatihan,
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
            BidangPelatihan: bidang,
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

                <div className="py-2 max-h-[70vh] gap-3 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2">
                    {/* Nama Kegiatan */}
                    <div className="space-y-1">
                        <label
                            className="block text-gray-600 text-sm font-medium mb-1"
                            htmlFor="namaKegiatan"
                        >
                            Nama Kegiatan{" "}
                            <span className="text-rose-600">*</span>
                        </label>
                        <input
                            id="namaKegiatan"
                            type="text"
                            className="form-input w-full text-black border-gray-300 rounded-md"
                            placeholder="Masukkan nama kegiatan"
                            required
                            value={namaPelatihan}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setNamaPelatihan(e.target.value)
                            }
                        />
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-1 ">
                        <label className="text-sm font-medium text-gray-700">Lokasi Pelatihan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            value={lokasiPelatihan}
                            onChange={(e) => setLokasiPelatihan(e.target.value)}
                        />
                    </div>

                    {/* Sektor */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Sektor</label>
                        <Select value={jenisProgram} onValueChange={setJenisProgram}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih sektor" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                {
                                    SEKTOR_PELATIHAN.map((item) => (
                                        <SelectItem value={item}>{item}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Klaster */}
                    <div className="space-y-1">
                        <div className="w-full">
                            <label
                                className="block text-gray-600 text-sm font-medium mb-1"
                                htmlFor="jensiPelatihan"
                            >
                                Klaster Pelatihan{" "}
                                <span className="text-rose-600">*</span>
                            </label>
                            <Select
                                value={bidang}
                                onValueChange={(value) => {
                                    setBidang(value)
                                    const selected = dataRumpunPelatihan.find((item) => item.name === value || item.name == bidang)
                                    setSelectedRumpunPelatihan(selected ?? null)
                                }}
                            >
                                <SelectTrigger className="w-full text-sm py-2">
                                    <SelectValue placeholder="Pilih klaster" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                    {dataRumpunPelatihan.map((item) => (
                                        <SelectItem key={item.id_rumpun_pelatihan} value={item.name}>
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Program */}
                    {
                        (selectedRumpunPelatihan !== null || program !== "") &&
                        <div className="space-y-1 col-span-2">
                            <div className="w-full">
                                <label
                                    className="block text-gray-600 text-sm font-medium mb-1"
                                    htmlFor="asalPesertaPelatihan"
                                >
                                    Judul/Program Pelatihan (Klaster {bidang}){" "}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <div className="flex flex-row gap-2">
                                    <Select
                                        value={program}
                                        onValueChange={(value: string) => {
                                            if (value === "__add_new__") {
                                                // open your modal instead of setting program
                                                document.getElementById("trigger-add-program")?.click();
                                            } else {
                                                setProgram(value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full text-base py-5">
                                            <SelectValue placeholder={`Pilih program klaster ${bidang}`} />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                            {selectedRumpunPelatihan?.programs.map((item: ProgramPelatihan) => (
                                                <SelectItem
                                                    key={item.id_program_pelatihan}
                                                    value={item.name_indo}
                                                >
                                                    {item.name_indo}
                                                </SelectItem>
                                            ))}
                                            {/* Divider */}
                                            <div className="border-t my-2"></div>
                                            {/* Tambah Program as SelectItem */}
                                            <SelectItem value="__add_new__" className="text-gray-500">
                                                ➕ Tambah Program Pelatihan (* Apabila tidak ditemukan program pelatihan yang sesuai)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <ManageProgramPelatihanAction
                                        onSuccess={() => {
                                            fetchRumpunPelatihan();
                                            alert("✅ Program pelatihan berhasil ditambahkan");
                                        }}
                                    />
                                </div>

                            </div>
                        </div>
                    }

                    {/* Jenis Pelatihan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Jenis Pelatihan</label>
                        <Select value={jenisPelatihan} onValueChange={setJenisPelatihan}>
                            <SelectTrigger className="w-full text-sm py-2">
                                <SelectValue placeholder="Pilih jenis pelatihan" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[999999]" sideOffset={5}>
                                {
                                    JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN.map((item) => (
                                        <SelectItem value={item}>{item}</SelectItem>
                                    ))
                                }
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
                                {
                                    DUKUNGAN_PROGRAM_TEROBOSAN.map((item) => (
                                        <SelectItem value={item}>{item}</SelectItem>
                                    ))
                                }
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
                                {
                                    JENIS_PELAKSANAAN.map((item) => (
                                        <SelectItem value={item}>{item}</SelectItem>
                                    ))
                                }
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

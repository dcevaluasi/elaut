"use client";

import React, { useMemo, useState } from "react";
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
import { TbArrowLeft, TbArrowRight, TbBook, TbChevronDown, TbChevronUp } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl, moduleBaseUrl } from "@/constants/urls";
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
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";
import { truncateText } from "@/utils";

interface ChooseModulActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

const ChooseModulAction: React.FC<ChooseModulActionProps> = ({
    idPelatihan,
    currentData,
    onSuccess,
}) => {
    /**
        * Modul Pelatihan 
        */
    const { data: modulPelatihan, loading: loadingModulPelatihan, error: errorModulPelatihan, fetchModulPelatihan, stats: statsModulPelatihan } = useFetchDataMateriPelatihanMasyarakat();

    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return modulPelatihan.filter(item =>
            item.NamaMateriPelatihan.toLowerCase().includes(search.toLowerCase())
        ).sort((a, b) => {
            const yearA = parseInt(a.NamaPenderitaMateriPelatihan, 10) || 0;
            const yearB = parseInt(b.NamaPenderitaMateriPelatihan, 10) || 0;
            return yearB - yearA; // descending
        })
    }, [search, modulPelatihan])

    const [expanded, setExpanded] = useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpanded(expanded === id ? null : id)
    }

    const [isOpen, setIsOpen] = useState(false);

    const [idModulPelatihan, setIdModulPelatihan] = useState(currentData?.ModuleMateri || "")
    const [selectedModulPelatihan, setSelectedModulPelatihan] = useState<MateriPelatihan | null>(null)
    const [hargaPelatihan, setHargaPelatihan] = useState(currentData?.HargaPelatihan || 0);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const form = {
            ModuleMateri: idModulPelatihan,
            HargaPelatihan: hargaPelatihan,
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
            setExpanded(null)
            setIdModulPelatihan("")
            setSelectedModulPelatihan(null)
            if (onSuccess) onSuccess();
        } catch (error) {
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
        }
    };

    if (loadingModulPelatihan)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (errorModulPelatihan)
        return <p className="text-center text-red-500 py-10">{errorModulPelatihan}</p>;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {
                    (Cookies.get("Access")?.includes("createPelatihan") &&
                        (currentData?.StatusPenerbitan === "0" || currentData?.StatusPenerbitan === "3" || currentData?.StatusPenerbitan === "1.2")) && <Button
                            variant="outline"
                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                        >
                        <TbBook className="h-5 w-5" />
                        <span>{currentData?.ModuleMateri != "" ? "Update" : "Pilih"} Modul Pelatihan</span>
                    </Button>
                }
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl !max-h-[60vh]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Cari dan Pilih Modul Pelatihan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Modul yang dipilih akan menjadi perangkat pelatihan yang muncul di halaman pengguna (Masyarakat) sehingga mereka dapat mengakses modul, bahan ajar atau bahan tayang dengan mudah
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ScrollArea className="py-2 max-h-[60vh] gap-3  pr-2 grid grid-cols-1">
                    <div className="flex w-full gap-2">
                        <Input
                            placeholder="Cari modul pelatihan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mt-2 text-sm"
                        />
                        {selectedModulPelatihan != null && <Button
                            variant="outline"
                            onClick={() => { setSelectedModulPelatihan(null); setIdModulPelatihan("") }}
                            className="flex items-center gap-2 w-fit rounded-lg px-3 shadow-md transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 mt-2 text-xs"
                        >
                            <span>Kembali</span>
                            <TbArrowLeft className="h-2 w-2" />
                        </Button>}
                    </div>

                    <div className="flex-1 mt-3 pr-2" >
                        <div className="space-y-3">
                            {
                                selectedModulPelatihan == null ? <>
                                    {filtered.length > 0 ? (
                                        filtered.map((item) => (
                                            <div
                                                key={item.IdMateriPelatihan}
                                                className="border rounded-xl p-3 shadow-sm hover:shadow transition bg-white"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-medium text-sm text-gray-800 truncate">
                                                        {item.NamaMateriPelatihan}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.BidangMateriPelatihan}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Tahun :  {item.NamaPenderitaMateriPelatihan}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Produsen :  {item.DeskripsiMateriPelatihan}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Jumlah Materi :  {item.ModulPelatihan.length} Materi
                                                    </p>
                                                </div>

                                                <div className="flex w-full items-end justify-between">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => { setSelectedModulPelatihan(item); setIdModulPelatihan(item.IdMateriPelatihan.toString()) }}
                                                        className="flex items-center gap-2 w-fit rounded-lg px-3 shadow-md transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 mt-2 text-xs"
                                                    >
                                                        <span>Pilih Modul</span>
                                                        <TbArrowRight className="h-2 w-2" />
                                                    </Button>

                                                    {/* <p className="text-xs text-gray-600 line-clamp-2">
                                                * Harap dicek terlebih dahulu modul yang dipilih, apakah terdapat bahan ajar/tidak, jika belum maka harap upload bahan ajar sendiri
                                            </p> */}
                                                </div>

                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 text-sm py-6">
                                            Tidak ada materi ditemukan
                                        </p>
                                    )}</> : <>
                                    <div className="space-y-4">
                                        <div className="border rounded-xl p-4 bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                {selectedModulPelatihan.NamaMateriPelatihan}
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                <Badge className="bg-blue-500">{selectedModulPelatihan.BidangMateriPelatihan}</Badge>
                                                <div>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Tahun :  {selectedModulPelatihan.NamaPenderitaMateriPelatihan}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Produsen :  {selectedModulPelatihan.DeskripsiMateriPelatihan}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Jumlah Materi :  {selectedModulPelatihan.ModulPelatihan.length} Materi
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Daftar Modul */}
                                        <div>
                                            <h4 className="font-medium text-sm mb-2 text-gray-700">
                                                Materi Modul
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedModulPelatihan.ModulPelatihan.length > 0 ? (
                                                    selectedModulPelatihan.ModulPelatihan.map((modul: ModulPelatihan) => (
                                                        <div
                                                            key={modul.IdModulPelatihan}
                                                            onClick={() => toggleExpand(modul.IdModulPelatihan)}
                                                            className="border rounded-lg p-3 bg-white shadow-sm hover:bg-gray-50 transition cursor-pointer"
                                                        >
                                                            {/* Header */}
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-sm font-medium text-gray-800">
                                                                    {modul.NamaModulPelatihan}
                                                                </p>
                                                                {expanded === modul.IdModulPelatihan ? (
                                                                    <TbChevronUp className="w-4 h-4 text-gray-500" />
                                                                ) : (
                                                                    <TbChevronDown className="w-4 h-4 text-gray-500" />
                                                                )}
                                                            </div>

                                                            {/* Expanded Content */}
                                                            {expanded === modul.IdModulPelatihan && (
                                                                <div className="mt-2 text-xs text-gray-600 space-y-1 animate-in fade-in-50 slide-in-from-top-1">
                                                                    <p className="text-xs font-medium text-gray-600">
                                                                        Bahan Tayang/Bahan Ajar
                                                                    </p>
                                                                    {
                                                                        modul.BahanTayang.length == 0 ? <tr>
                                                                            <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                                                                Tidak ada data ditemukan
                                                                            </td>
                                                                        </tr> : <>
                                                                            <table className="w-full text-xs text-left border">
                                                                                <thead className="bg-gray-100 text-gray-700 uppercase">
                                                                                    <tr className="text-xs text-center">
                                                                                        <th className="px-3 py-2 border text-xs">No</th>
                                                                                        <th className="px-3 py-2 border text-xs">Action</th>
                                                                                        <th className="px-3 py-2 border text-xs">Nama</th>
                                                                                        <th className="px-3 py-2 border text-xs">File</th>
                                                                                        <th className="px-3 py-2 border text-xs">Produsen</th>
                                                                                        <th className="px-3 py-2 border text-xs">Tanggal Upload</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {modul.BahanTayang.map((row_bt, index) => (
                                                                                        <tr key={row_bt.IdBahanTayang}>
                                                                                            <td className="px-3 py-2 border">{index + 1}</td>
                                                                                            <td className="px-3 py-2 border"></td>
                                                                                            <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                                            <td className="px-3 py-2 border"> <a
                                                                                                href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="  text-blue-500  underline "
                                                                                            >
                                                                                                {truncateText(row_bt.BahanTayang, 50, '...')}
                                                                                            </a></td>
                                                                                            <td className="px-3 py-2 border">{row_bt.Creator || "-"}</td>
                                                                                            <td className="px-3 py-2 border">{row_bt.CreateAt}</td>
                                                                                        </tr>))}
                                                                                </tbody>
                                                                            </table>
                                                                        </>

                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">Belum ada modul.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </ScrollArea>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={loading || idModulPelatihan == ""}
                    >
                        {loading ? "Menyimpan..." : "Pilih Modul"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ChooseModulAction;

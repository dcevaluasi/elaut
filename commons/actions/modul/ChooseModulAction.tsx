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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { TbArrowLeft, TbArrowRight, TbBook, TbChevronDown, TbChevronUp } from "react-icons/tb";
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
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";
import { truncateText } from "@/utils";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

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

    const [filterBidang, setFilterBidang] = useState("");
    const [filterType, setFilterType] = useState("");
    const bidangOptions = Array.from(new Set(modulPelatihan.map(item => item.BidangMateriPelatihan)));
    const typeOptions = ["Modul", "Bahan Ajar"]

    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return modulPelatihan
            .filter(item => item.NamaMateriPelatihan.toLowerCase().includes(search.toLowerCase()))
            .filter(item => filterBidang === "" || item.BidangMateriPelatihan === filterBidang)
            .filter(item => filterType === "" || item.BerlakuSampai === (filterType === "Modul" ? "1" : "2"))

            .sort((a, b) => {
                const yearA = parseInt(a.NamaPenderitaMateriPelatihan, 10) || 0;
                const yearB = parseInt(b.NamaPenderitaMateriPelatihan, 10) || 0;
                return yearB - yearA; // 
            });
    }, [search, filterBidang, filterType, modulPelatihan]);


    const [expanded, setExpanded] = useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpanded(expanded === id ? null : id)
    }

    const clearFilters = () => {
        setFilterBidang("")
        setFilterType("")
        setSearch("")
    }


    const [isOpen, setIsOpen] = useState(false);

    const [idModulPelatihan, setIdModulPelatihan] = useState(currentData?.ModuleMateri || "")
    const [selectedModulPelatihan, setSelectedModulPelatihan] = useState<MateriPelatihan | null>(null)

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const form = {
            ModuleMateri: idModulPelatihan,
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
                        <span>{currentData?.ModuleMateri != "" ? "Update" : "Pilih"} Perangkat Pelatihan</span>
                    </Button>
                }
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl !max-h-[60vh]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Cari dan Pilih Perangkat Pelatihan</AlertDialogTitle>
                    <AlertDialogDescription>
                        Modul yang dipilih akan menjadi perangkat pelatihan yang muncul di halaman pengguna (Masyarakat) sehingga mereka dapat mengakses modul. Dalam hal penambahan bahan lainnya kamu dapat melakukannya setelah memilih modul, apabila tidak tersedia modul yang dicari maka silahkan menuju <Link target="_blank" className="underline text-blue-500" href={`/admin/lemdiklat/master/bahan-ajar`}>Menu Bahan Ajar</Link> untuk mengupload bahan ajar versi Lembaga Diklat mu!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex w-full gap-2 items-end">
                    {
                        selectedModulPelatihan == null && <>
                            <Input
                                placeholder="Cari perangkat pelatihan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mt-2 text-sm flex-1"
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center py-4 gap-2">
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 p-3 space-y-3 z-[999999]" >
                                    <DropdownMenuLabel className="text-sm font-semibold">Filter Data</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Bidang</label>
                                        <Select value={filterBidang} onValueChange={setFilterBidang}>
                                            <SelectTrigger className="w-48 text-sm mt-2 py-5">
                                                <SelectValue placeholder="Filter Bidang" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[999999]" position="popper">
                                                {bidangOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Tipe Perangkat</label>
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger className="w-48 text-sm mt-2 py-5">
                                                <SelectValue placeholder="Filter Bidang" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[999999]" position="popper">
                                                {typeOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Clear Button */}
                                    <Button
                                        onClick={clearFilters}
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-2 text-xs"
                                    >
                                        Reset Filter
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    }

                    {selectedModulPelatihan != null && (
                        <Button
                            variant="outline"
                            onClick={() => { setSelectedModulPelatihan(null); setIdModulPelatihan("") }}
                            className="flex items-center gap-2 py-5 w-fit rounded-lg px-3 shadow-md transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 mt-2 text-sm"
                        >
                            <span>Kembali</span>
                            <TbArrowLeft className="h-4 w-4 flex-shrink-0" />
                        </Button>
                    )}
                </div>
                <ScrollArea className="py-2 gap-3  pr-2 grid grid-cols-1 h-[50vh]">
                    <div className="flex-1 pr-2" >
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
                                            Tidak ada perangkat ditemukan
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
                                                Materi
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

                                                                                        <th className="px-3 py-2 border text-xs">Nama</th>
                                                                                        <th className="px-3 py-2 border text-xs">File</th>

                                                                                        <th className="px-3 py-2 border text-xs">Tanggal Upload</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {modul.BahanTayang.map((row_bt, index) => (
                                                                                        <tr key={row_bt.IdBahanTayang}>
                                                                                            <td className="px-3 py-2 border">{index + 1}</td>

                                                                                            <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                                            <td className="px-3 py-2 border"> <a
                                                                                                href={
                                                                                                    row_bt.BahanTayang
                                                                                                        ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`
                                                                                                        : row_bt.LinkVideo
                                                                                                }
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="text-blue-500 underline"
                                                                                            >

                                                                                                {row_bt.BahanTayang == "" ? truncateText(row_bt.LinkVideo, 30, '...') : truncateText(row_bt.BahanTayang, 30, '...')}
                                                                                            </a></td>

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
                                                    <p className="text-xs text-gray-500 italic">Belum ada perangkat.</p>
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
                    <AlertDialogCancel disabled={loading} onClick={() => {
                        setIdModulPelatihan("")
                        setSelectedModulPelatihan(null)
                        setFilterBidang("")
                    }}>Batal</AlertDialogCancel>
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

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
import { TbArrowLeft, TbArrowRight, TbBook, TbChecks, TbChevronDown, TbChevronUp, TbX } from "react-icons/tb";
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
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { findNameUnitKerjaById, findUnitKerjaById } from "@/utils/unitkerja";

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

    const idUnitKerja = Cookies.get('IDUnitKerja')

    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()
    React.useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

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

            <AlertDialogContent className="w-full max-w-5xl h-fit max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbBook size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Selection Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Pilih Perangkat Pelatihan
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <TbX size={22} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-6">
                    {
                        selectedModulPelatihan == null ? (
                            <>
                                {/* Search & Filter Section */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1 group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"></path>
                                                <path d="M21 21l-6 -6"></path>
                                            </svg>
                                        </div>
                                        <Input
                                            placeholder="Cari perangkat pelatihan..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full h-12 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex items-center justify-center h-12 px-6 rounded-2xl border-gray-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-all gap-2 bg-transparent text-slate-600 dark:text-slate-400 font-bold"
                                            >
                                                <SlidersHorizontal className="w-4 h-4" />
                                                <span>Filter ({[filterBidang, filterType].filter(Boolean).length})</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 p-3 space-y-3 z-[999999] rounded-2xl" align="end">
                                            <DropdownMenuLabel className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Filter Data</DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Bidang</label>
                                                <Select value={filterBidang} onValueChange={setFilterBidang}>
                                                    <SelectTrigger className="w-full h-10 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-xs">
                                                        <SelectValue placeholder="Pilih Bidang" />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[999999]" position="popper">
                                                        {bidangOptions.map(opt => (
                                                            <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipe Perangkat</label>
                                                <Select value={filterType} onValueChange={setFilterType}>
                                                    <SelectTrigger className="w-full h-10 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-xs">
                                                        <SelectValue placeholder="Pilih Tipe" />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[999999]" position="popper">
                                                        {typeOptions.map(opt => (
                                                            <SelectItem key={opt} value={opt} className="text-xs font-semibold">
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button
                                                onClick={clearFilters}
                                                size="sm"
                                                variant="ghost"
                                                className="w-full mt-2 h-10 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                            >
                                                Reset Filter
                                            </Button>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Results Grid */}
                                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
                                    {filtered.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filtered.map((item) => {
                                                const { isMatch, name } = findUnitKerjaById(unitKerjas, idUnitKerja)
                                                const { name: nameUK } = findNameUnitKerjaById(unitKerjas, item.DeskripsiMateriPelatihan)
                                                return (
                                                    <div
                                                        key={item.IdMateriPelatihan}
                                                        className="relative group p-5 rounded-2xl border transition-all bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer flex flex-col justify-between min-h-[180px]"
                                                        onClick={() => { setSelectedModulPelatihan(item); setIdModulPelatihan(item.IdMateriPelatihan.toString()) }}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                                    <TbBook size={20} />
                                                                </div>
                                                                <Badge variant="outline" className="rounded-lg px-2 py-1 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[10px] uppercase font-bold text-slate-500">
                                                                    {item.BidangMateriPelatihan}
                                                                </Badge>
                                                            </div>

                                                            <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2 text-sm leading-tight uppercase">
                                                                {item.NamaMateriPelatihan}
                                                            </h3>

                                                            <div className="space-y-1 mt-3">
                                                                <p className="text-xs font-medium text-slate-400 line-clamp-1">
                                                                    Produsen: {isMatch && item.DeskripsiMateriPelatihan == idUnitKerja ? name : nameUK}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                    <span className="font-semibold text-slate-400">Tahun: <span className="text-slate-600 dark:text-slate-300">{item.Tahun}</span></span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <span className="font-semibold text-slate-400">Materi: <span className="text-slate-600 dark:text-slate-300">{item.ModulPelatihan.length}</span></span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end mt-4">
                                                            <div className="flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
                                                                Pilih Detail <TbArrowRight size={14} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                            <TbBook size={40} className="mb-2 opacity-20" />
                                            <p className="text-sm font-semibold">Tidak ada perangkat ditemukan</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Module Detail View */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={() => { setSelectedModulPelatihan(null); setIdModulPelatihan("") }}
                                            className="group flex items-center gap-2 h-10 px-4 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors text-xs font-bold uppercase tracking-wider"
                                        >
                                            <TbArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                                            Kembali
                                        </Button>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">
                                            {selectedModulPelatihan.NamaMateriPelatihan}
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <Badge className="bg-blue-500 hover:bg-blue-600 border-none rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                                {selectedModulPelatihan.BidangMateriPelatihan}
                                            </Badge>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                <span>Tahun: {selectedModulPelatihan.NamaPenderitaMateriPelatihan}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span>Produsen: {selectedModulPelatihan.DeskripsiMateriPelatihan}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span>Materi: {selectedModulPelatihan.ModulPelatihan.length} Item</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* List Modul / Materi */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="h-6 w-1 rounded-full bg-emerald-500" />
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                                Daftar Materi Modul
                                            </h4>
                                        </div>

                                        <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                            {selectedModulPelatihan.ModulPelatihan.length > 0 ? (
                                                selectedModulPelatihan.ModulPelatihan.map((modul: ModulPelatihan) => (
                                                    <div
                                                        key={modul.IdModulPelatihan}
                                                        onClick={() => toggleExpand(modul.IdModulPelatihan)}
                                                        className={`border rounded-xl p-4 transition-all cursor-pointer ${expanded === modul.IdModulPelatihan
                                                            ? "bg-white dark:bg-white/5 border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20"
                                                            : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-blue-200"
                                                            }`}
                                                    >
                                                        {/* Header */}
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${expanded === modul.IdModulPelatihan ? "bg-blue-100 text-blue-600" : "bg-gray-50 text-gray-400"}`}>
                                                                    <TbBook size={16} />
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                                    {modul.NamaModulPelatihan}
                                                                </p>
                                                            </div>
                                                            {expanded === modul.IdModulPelatihan ? (
                                                                <TbChevronUp className="w-5 h-5 text-blue-500" />
                                                            ) : (
                                                                <TbChevronDown className="w-5 h-5 text-slate-400" />
                                                            )}
                                                        </div>

                                                        {/* Expanded Content */}
                                                        {expanded === modul.IdModulPelatihan && (
                                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 animate-in fade-in-50 slide-in-from-top-1">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                                    Bahan Tayang / Ajar
                                                                </p>
                                                                {
                                                                    modul.BahanTayang.length == 0 ? (
                                                                        <div className="text-center py-4 text-xs font-medium text-slate-400 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-white/10">
                                                                            Tidak ada bahan ajar ditemukan
                                                                        </div>
                                                                    ) : (
                                                                        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                                                                            <table className="w-full text-xs text-left">
                                                                                <thead className="bg-gray-50 dark:bg-white/5 text-slate-500 font-bold uppercase border-b border-gray-100 dark:border-white/5">
                                                                                    <tr>
                                                                                        <th className="px-4 py-3 w-12 text-center">No</th>
                                                                                        <th className="px-4 py-3">Nama Bahan</th>
                                                                                        <th className="px-4 py-3">File / Link</th>
                                                                                        <th className="px-4 py-3 w-32">Tanggal</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                                                                    {modul.BahanTayang.map((row_bt, index) => (
                                                                                        <tr key={row_bt.IdBahanTayang} className="hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors">
                                                                                            <td className="px-4 py-3 text-center font-medium text-slate-500">{index + 1}</td>
                                                                                            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{row_bt.NamaBahanTayang}</td>
                                                                                            <td className="px-4 py-3">
                                                                                                <a
                                                                                                    href={
                                                                                                        row_bt.BahanTayang
                                                                                                            ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`
                                                                                                            : row_bt.LinkVideo
                                                                                                    }
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold hover:underline decoration-2 underline-offset-2 transition-all"
                                                                                                >
                                                                                                    <TbBook size={14} />
                                                                                                    {row_bt.BahanTayang === "" ? "Lihat Video" : "Download File"}
                                                                                                </a>
                                                                                            </td>
                                                                                            <td className="px-4 py-3 text-slate-500 font-medium">{row_bt.CreateAt}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 text-slate-400 italic bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                                    Belum ada materi modul.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button
                        onClick={() => {
                            setIdModulPelatihan("");
                            setSelectedModulPelatihan(null);
                            setFilterBidang("");
                            setIsOpen(false);
                        }}
                        disabled={loading}
                        className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium hidden sm:flex">
                        {selectedModulPelatihan && <span>Anda memilih: <strong className="text-slate-800 dark:text-white">{selectedModulPelatihan.NamaMateriPelatihan}</strong></span>}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || idModulPelatihan == ""}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? "Menyimpan..." : <><TbChecks size={18} /> Confirm Selection</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ChooseModulAction;

"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { TbArrowLeft, TbArrowRight, TbBook, TbChevronDown, TbChevronUp, TbTrash, TbUser, TbX, TbChecks, TbSearch, TbFilter } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";

import { PelatihanMasyarakat } from "@/types/product";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFetchDataInstrukturChoose } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Instruktur } from "@/types/instruktur";
import { arrayToString, stringToArray } from "@/utils/input";
import { findNameUnitKerjaById } from "@/utils/unitkerja";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { FilterDropdown } from "@/components/dashboard/Pelatihan/Table/TableDataPelatih";
import { countInstrukturFromPelatihans } from "@/utils/instruktur";

interface ChooseInstrukturActionProps {
    idPelatihan: string;
    currentData?: PelatihanMasyarakat;
    onSuccess?: () => void;
}

const ChooseInstrukturAction: React.FC<ChooseInstrukturActionProps> = ({
    idPelatihan,
    currentData,
    onSuccess,
}) => {
    /**
        * Instruktur Pelatihan 
        */
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()

    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData } = useFetchDataInstrukturChoose()

    const [selectedIdInstruktur, setSelectedIdInstruktur] = useState<number[]>(stringToArray(currentData?.Instruktur || "") || [])
    const [selectedInstruktur, setSelectedInstruktur] = useState<Instruktur[]>([])

    useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])


    const [search, setSearch] = useState("")
    const [filterKeahlian, setFilterKeahlian] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [filterPendidikan, setFilterPendidikan] = useState("")
    const [filterJabatan, setFilterJabatan] = useState("")
    const [filterUnitKerja, setFilterUnitKerja] = useState("")

    const bidangKeahlianOptions = [...new Set(instrukturs.map(d => d.bidang_keahlian).filter(Boolean))]
    const statusOptions = [...new Set(instrukturs.map(d => d.status).filter(Boolean))]
    const pendidikanOptions = [...new Set(instrukturs.map(d => d.pendidikkan_terakhir).filter(Boolean))]
    const jabatanOptions = [...new Set(instrukturs.map(d => d.jenjang_jabatan).filter(Boolean))]
    const unitKerjaOptions = unitKerjas

    // Filtering logic
    const filteredData = useMemo(() => {
        return instrukturs.filter((row) => {
            const matchesSearch = !search || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
            const matchesKeahlian = !filterKeahlian || row.bidang_keahlian === filterKeahlian
            const matchesStatus = !filterStatus || row.status === filterStatus
            const matchesPendidikan = !filterPendidikan || row.pendidikkan_terakhir === filterPendidikan
            const matchesJabatan = !filterJabatan || row.jenjang_jabatan === filterJabatan
            const matchesUnitKerja = !filterUnitKerja || row.id_lemdik.toString() === filterUnitKerja

            return matchesSearch && matchesKeahlian && matchesStatus && matchesPendidikan && matchesJabatan && matchesUnitKerja
        })
    }, [instrukturs, search, filterKeahlian, filterStatus, filterPendidikan, filterJabatan, filterUnitKerja])

    const clearFilters = () => {
        setFilterKeahlian("")
        setFilterStatus("")
        setFilterPendidikan("")
        setFilterJabatan("")
        setFilterUnitKerja("")
        setSearch("")
    }


    const [isOpen, setIsOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const convertedSelectedIdInstruktur = arrayToString(selectedIdInstruktur)
        const form = {
            Instruktur: convertedSelectedIdInstruktur,
        };

        try {
            setLoading(true);
            await axios.put(
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

            if (onSuccess) onSuccess();
        } catch (error) {

            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui pelatihan.",
            });
        } finally {
            setSelectedIdInstruktur([])
            setSelectedInstruktur([])
            setIsOpen(false);
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                {
                    (Cookies.get("Access")?.includes("createPelatihan") &&
                        (currentData?.StatusPenerbitan === "0" || currentData?.StatusPenerbitan === "3" || currentData?.StatusPenerbitan === "1.2")) && <Button
                            variant="outline"
                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-teal-500 text-teal-500 hover:text-white hover:bg-teal-500"
                        >
                        <TbUser className="h-5 w-5" />
                        <span>{currentData?.Instruktur != "" ? "Update" : "Pilih"} Instruktur/Pelatih</span>
                    </Button>
                }
            </AlertDialogTrigger>

            <AlertDialogContent className="w-full max-w-5xl h-fit max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbUser size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Selection Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Pilih Instruktur
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <TbX size={22} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-6">
                    {/* Search & Filter Section */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <TbSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <Input
                                placeholder="Cari instruktur/pelatih..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-12 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                            />
                        </div>
                        <FilterDropdown
                            filterKeahlian={filterKeahlian}
                            setFilterKeahlian={setFilterKeahlian}
                            bidangKeahlianOptions={bidangKeahlianOptions}
                            filterJabatan={filterJabatan}
                            setFilterJabatan={setFilterJabatan}
                            jabatanOptions={jabatanOptions}
                            filterPendidikan={filterPendidikan}
                            setFilterPendidikan={setFilterPendidikan}
                            pendidikanOptions={pendidikanOptions}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            statusOptions={statusOptions}
                            filterUnitKerja={filterUnitKerja}
                            setFilterUnitKerja={setFilterUnitKerja}
                            unitKerjaOptions={unitKerjaOptions}
                            clearFilters={clearFilters}
                        />
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2">
                        {filteredData.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredData.map((item) => {
                                    const { name: nameUnitKerja } = findNameUnitKerjaById(unitKerjas, item.id_lemdik.toString())
                                    const isSelected = selectedIdInstruktur.includes(item.IdInstruktur);

                                    return (
                                        <div
                                            key={item.IdInstruktur}
                                            onClick={() => {
                                                if (!isSelected) {
                                                    setSelectedInstruktur((prev) => [...prev, item]);
                                                    setSelectedIdInstruktur((prev) => [...prev, item.IdInstruktur])
                                                }
                                            }}
                                            className={`relative group p-5 rounded-2xl border transition-all cursor-pointer ${isSelected
                                                ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30 ring-2 ring-blue-500/20"
                                                : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <TbUser size={20} />
                                                </div>
                                                <Badge variant="outline" className="rounded-lg px-2 py-1 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-[10px] uppercase font-bold text-slate-500">
                                                    {item.bidang_keahlian}
                                                </Badge>
                                            </div>

                                            <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1">{item.nama}</h3>
                                            <p className="text-xs font-medium text-slate-400 mb-4 line-clamp-1">{nameUnitKerja}</p>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-400">Jabatan:</span>
                                                    <span className="truncate">{item.jenjang_jabatan}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-400">Telp:</span>
                                                    <span>{item.no_telpon}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                <TbUser size={40} className="mb-2 opacity-20" />
                                <p className="text-sm font-semibold">Tidak ada instruktur ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Selected List Section */}
                    {selectedInstruktur.length > 0 && (
                        <div className="pt-6 border-t border-dashed border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-6 w-1 rounded-full bg-emerald-500" />
                                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    Instruktur Terpilih ({selectedInstruktur.length})
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {selectedInstruktur.map((instruktur: Instruktur) => (
                                    <div
                                        key={instruktur.IdInstruktur}
                                        className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl"
                                    >
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{instruktur.nama}</span>
                                        <button
                                            onClick={() => {
                                                setSelectedInstruktur((prev) => prev.filter((i) => i.IdInstruktur !== instruktur.IdInstruktur));
                                                setSelectedIdInstruktur((prev) => prev.filter((i) => i !== instruktur.IdInstruktur));
                                            }}
                                            className="h-6 w-6 rounded-lg hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-slate-400 transition-colors"
                                        >
                                            <TbX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button onClick={() => { setSelectedIdInstruktur([]); setSelectedInstruktur([]); setIsOpen(false); }} disabled={loading} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedIdInstruktur.length == 0}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> Confirm Selection</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ChooseInstrukturAction;

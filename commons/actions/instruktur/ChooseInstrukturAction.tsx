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
import { TbArrowLeft, TbArrowRight, TbBook, TbChevronDown, TbChevronUp, TbTrash, TbUser, TbX } from "react-icons/tb";
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

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Cari dan Pilih Instruktur/Pelatih</AlertDialogTitle>
                    <AlertDialogDescription>
                        Instruktur/Pelatih yang akan dipilih dipastikan ketersedian dalam hal mengajar dalam pelaksanaan pelatihan, apabila dirasa perlu Instruktur/Pelatih eksternal harap untuk berkoordinasi dengan tim pusat.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ScrollArea className="py-2 gap-3  pr-2 grid grid-cols-1 h-[50vh]">
                    <div className="flex w-full gap-2 items-center">
                        <Input
                            placeholder="Cari instruktur/pelatih..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mt-2 text-sm"
                        />
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

                    <div className="flex-1 mt-3 pr-2" >
                        <div className={`space-y-3 ${selectedInstruktur.length != 0 ? "h-[20vh] overflow-y-scroll" : "max-h-[40vh] overflow-y-scroll"}`}>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => {
                                    const { name: nameUnitKerja } = findNameUnitKerjaById(unitKerjas, item.id_lemdik.toString())

                                    return (
                                        <div
                                            key={item.IdInstruktur}
                                            className="border rounded-xl p-3 shadow-sm hover:shadow transition bg-white"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-medium text-sm text-gray-800 truncate">
                                                    {item.nama}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.bidang_keahlian}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    Unit Kerja : {nameUnitKerja}
                                                </p>
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    Email :  {item.email}
                                                </p>
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    No Telpon :  {item.no_telpon}
                                                </p>
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    Jabatan dan Pangkat/Golongan :  {item.jenjang_jabatan} - {item.pelatihan_pelatih}
                                                </p>
                                            </div>

                                            <div className="flex w-full items-end justify-between">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => { setSelectedInstruktur((prev) => [...prev, item]); setSelectedIdInstruktur((prev) => [...prev, item.IdInstruktur]) }}
                                                    className="flex items-center gap-2 w-fit rounded-lg px-3 shadow-md transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500 mt-2 text-xs"
                                                >
                                                    <span>Pilih Instruktur</span>
                                                    <TbArrowRight className="h-2 w-2" />
                                                </Button>
                                            </div>

                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-6">
                                    Tidak ada instruktur/pelatih ditemukan
                                </p>
                            )}

                        </div>
                    </div>
                </ScrollArea>


                {
                    selectedInstruktur.length == 0 ? <>
                    </> : <ScrollArea className="py-2 gap-3  pr-2 grid grid-cols-1 h-40">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Instruktur Terpilih
                                    <span className="ml-1 text-gray-500 font-normal">
                                        ({selectedInstruktur.length})
                                    </span>
                                </h4>

                                {selectedInstruktur.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic">
                                        Belum ada instruktur yang dipilih.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedInstruktur.map((instruktur: Instruktur) => (
                                            <div
                                                key={instruktur.IdInstruktur}
                                                className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-1.5 rounded-full shadow-sm hover:bg-rose-100 transition-colors"
                                            >
                                                <span className="font-medium uppercase">{instruktur.nama}</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedInstruktur((prev) =>
                                                            prev.filter((i) => i.IdInstruktur !== instruktur.IdInstruktur)
                                                        );
                                                        setSelectedIdInstruktur((prev) =>
                                                            prev.filter((i) => i !== instruktur.IdInstruktur)
                                                        );
                                                    }}
                                                    className="hover:text-rose-500 focus:outline-none"
                                                >
                                                    <TbX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>


                    </ScrollArea>
                }



                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} onClick={() => {
                        setSelectedIdInstruktur([])
                        setSelectedInstruktur([])
                    }}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={loading || selectedIdInstruktur.length == 0}
                    >
                        {loading ? "Menyimpan..." : "Pilih Instruktur"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ChooseInstrukturAction;

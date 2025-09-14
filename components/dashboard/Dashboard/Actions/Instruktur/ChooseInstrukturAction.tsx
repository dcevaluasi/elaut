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
import { TbArrowLeft, TbArrowRight, TbBook, TbChevronDown, TbChevronUp, TbTrash, TbUser } from "react-icons/tb";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Instruktur } from "@/types/instruktur";
import { arrayToString, stringToArray } from "@/utils/input";

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
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData, stats } = useFetchDataInstruktur()

    const [selectedIdInstruktur, setSelectedIdInstruktur] = useState<number[]>(stringToArray(currentData?.Instruktur || "") || [])
    const [selectedInstruktur, setSelectedInstruktur] = useState<Instruktur[]>([])

    useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return instrukturs.filter(item =>
            item.nama.toLowerCase().includes(search.toLowerCase())
        )
    }, [search, instrukturs])


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
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-teal-500 text-teal-500 hover:text-white hover:bg-teal-500"
                >
                    <TbUser className="h-5 w-5" />
                    <span>{currentData?.ModuleMateri != "" ? "Update" : "Pilih"} Instruktur/Pelatih</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Cari dan Pilih Instruktur/Pelatih</AlertDialogTitle>
                    <AlertDialogDescription>
                        Instruktur/Pelatih yang akan dipilih dipastikan ketersedian dalam hal mengajar dalam pelaksanaan pelatihan, apabila dirasa perlu Instruktur/Pelatih eksternal harap untuk berkoordinasi dengan tim pusat.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <ScrollArea className="py-2 max-h-[65vh] gap-3  pr-2 grid grid-cols-1">
                    <div className="flex w-full gap-2">
                        <Input
                            placeholder="Cari instruktur/pelatih..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="mt-2 text-sm"
                        />
                    </div>

                    <div className="flex-1 mt-3 pr-2" >
                        <div className={`space-y-3 ${selectedInstruktur.length != 0 ? "max-h-[35vh] overflow-y-auto" : "h-full"}`}>
                            {filtered.length > 0 ? (
                                filtered.map((item) => (
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
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-6">
                                    Tidak ada instruktur/pelatih ditemukan
                                </p>
                            )}

                        </div>

                        {
                            selectedInstruktur.length == 0 ? <>
                            </> : <>
                                <div className="space-y-4 mt-10">
                                    <div>
                                        <h4 className="font-medium text-sm mb-2 text-gray-700">
                                            Instruktur Terpilih
                                        </h4>
                                        <div className="space-y-2">
                                            <table className="w-full text-xs text-left border">
                                                <thead className="bg-gray-100 text-gray-700 uppercase">
                                                    <tr className="text-xs text-center">
                                                        <th className="px-3 py-2 border text-xs">No</th>
                                                        <th className="px-3 py-2 border text-xs">Action</th>
                                                        <th className="px-3 py-2 border text-xs">Nama</th>
                                                        <th className="px-3 py-2 border text-xs">Informasi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedInstruktur.map((instruktur: Instruktur, index: number) => (
                                                        <tr key={instruktur.IdInstruktur}>
                                                            <td className="px-2 py-2 border text-center">{index + 1}</td>
                                                            <td className="px-2 py-2 border">
                                                                <div className="flex items-center justify-center w-full">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => { setSelectedInstruktur((prev) => prev.filter((i) => i.IdInstruktur !== instruktur.IdInstruktur)); setSelectedIdInstruktur((prev) => prev.filter((i) => i !== instruktur.IdInstruktur)) }}
                                                                        className="flex items-center gap-2 w-fit rounded-lg px-3 shadow-md transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 text-xs"
                                                                    >
                                                                        <span>Urungkan</span>
                                                                        <TbTrash className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                            <td className="px-2 py-2 border">{instruktur.nama}</td>
                                                            <td className="px-2 py-2 border">
                                                                <div>
                                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                                        Email :  {instruktur.email}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                                        No Telpon :  {instruktur.no_telpon}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                                        Bidang Keahlian :  {instruktur.bidang_keahlian}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                                        Jabatan dan Pangkat/Golongan :  {instruktur.jenjang_jabatan} - {instruktur.pelatihan_pelatih}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>))}
                                                </tbody>
                                            </table>

                                        </div>
                                    </div>

                                </div>
                            </>
                        }
                    </div>
                </ScrollArea>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
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

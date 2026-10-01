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
import { TbEditCircle, TbX, TbCalendar, TbMapPin, TbTag, TbCurrencyDollar, TbBuildingBank, TbCheck, TbLoader2 } from "react-icons/tb";
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
import { UPT } from "@/constants/nomenclatures";
import { DUKUNGAN_PROGRAM_TEROBOSAN, JENIS_PELAKSANAAN, JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN, SEKTOR_PELATIHAN } from "@/constants/pelatihan";
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
                        (currentData?.StatusPenerbitan === "0" || currentData?.StatusPenerbitan === "3" || currentData?.StatusPenerbitan === "1.2")) && (
                            <Button
                                variant="outline"
                                className="h-11 px-5 rounded-2xl border border-amber-400/40 bg-amber-500/5 hover:bg-amber-500 text-amber-600 hover:text-white dark:text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                            >
                                <TbEditCircle className="h-5 w-5 shrink-0" />
                                <span>Edit Informasi Pelatihan</span>
                            </Button>
                        )
                }
            </AlertDialogTrigger>

            <AlertDialogContent className="w-full max-w-4xl h-fit max-h-[92vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.25)] z-[999999] flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20 shrink-0">
                            <TbEditCircle size={26} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                    Edit Pelatihan Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Edit Informasi Pelatihan
                            </h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                    >
                        <TbX size={22} />
                    </button>
                </div>

                {/* Body Form */}
                <div className="p-8 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* Section 1: Informasi Utama */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="h-5 w-1 rounded-full bg-amber-500" />
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Informasi Utama Pelatihan
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nama Kegiatan */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Nama Kegiatan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
                                    placeholder="Masukkan nama kegiatan pelatihan"
                                    required
                                    value={namaPelatihan}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNamaPelatihan(e.target.value)}
                                />
                            </div>

                            {/* Lokasi */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Lokasi Pelatihan
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
                                        placeholder="Lokasi / Alamat Pelaksanaan"
                                        value={lokasiPelatihan}
                                        onChange={(e) => setLokasiPelatihan(e.target.value)}
                                    />
                                    <TbMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                </div>
                            </div>

                            {/* Sektor */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Sektor Pelatihan
                                </label>
                                <Select value={jenisProgram} onValueChange={setJenisProgram}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih sektor" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {SEKTOR_PELATIHAN.map((item, idx) => (
                                            <SelectItem key={idx} value={item} className="text-sm font-semibold">
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Klaster & Program */}
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="h-5 w-1 rounded-full bg-amber-500" />
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Klaster & Program Pelatihan
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Klaster */}
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Klaster Pelatihan <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    value={bidang}
                                    onValueChange={(value) => {
                                        setBidang(value);
                                        const selected = dataRumpunPelatihan.find((item) => item.name === value || item.name == bidang);
                                        setSelectedRumpunPelatihan(selected ?? null);
                                    }}
                                >
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih klaster pelatihan" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {dataRumpunPelatihan.map((item) => (
                                            <SelectItem key={item.id_rumpun_pelatihan} value={item.name} className="text-sm font-semibold">
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Program / Judul */}
                            {(selectedRumpunPelatihan !== null || program !== "") && (
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Judul / Program Pelatihan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex flex-row gap-2">
                                        <Select
                                            value={program}
                                            onValueChange={(value: string) => {
                                                if (value === "__add_new__") {
                                                    document.getElementById("trigger-add-program")?.click();
                                                } else {
                                                    setProgram(value);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                                <SelectValue placeholder={`Pilih program klaster ${bidang}`} />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                                {selectedRumpunPelatihan?.programs.map((item: ProgramPelatihan) => (
                                                    <SelectItem
                                                        key={item.id_program_pelatihan}
                                                        value={item.name_indo}
                                                        className="text-sm font-semibold"
                                                    >
                                                        {item.name_indo}
                                                    </SelectItem>
                                                ))}
                                                <div className="border-t border-slate-100 dark:border-white/10 my-1" />
                                                <SelectItem value="__add_new__" className="text-amber-600 font-bold">
                                                    ➕ Tambah Program Pelatihan Baru
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <ManageProgramPelatihanAction
                                            onSuccess={() => {
                                                fetchRumpunPelatihan();
                                                Toast.fire({
                                                    icon: "success",
                                                    title: "Berhasil!",
                                                    text: "Program pelatihan berhasil ditambahkan",
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Kategori & Pelaksanaan */}
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="h-5 w-1 rounded-full bg-amber-500" />
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Klasifikasi & Penyelenggara
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Jenis Pelatihan */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Jenis Pelatihan
                                </label>
                                <Select value={jenisPelatihan} onValueChange={setJenisPelatihan}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih jenis pelatihan" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN.map((item, idx) => (
                                            <SelectItem key={idx} value={item} className="text-sm font-semibold">
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dukungan Program Terobosan */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Dukungan Program Terobosan
                                </label>
                                <Select value={dukunganProgramTerobosan} onValueChange={setDukunganProgramTerobosan}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih dukungan program" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {DUKUNGAN_PROGRAM_TEROBOSAN.map((item, idx) => (
                                            <SelectItem key={idx} value={item} className="text-sm font-semibold">
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Penyelenggara */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Penyelenggara
                                </label>
                                <Select value={penyelenggaraPelatihan} onValueChange={setPenyelenggaraPelatihan}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih penyelenggara" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {UPT.map((item, idx) => (
                                            <SelectItem key={idx} value={item} className="text-sm font-semibold">
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Pelaksanaan */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Metode Pelaksanaan
                                </label>
                                <Select value={pelaksanaanPelatihan} onValueChange={setPelaksanaanPelatihan}>
                                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-semibold text-sm text-slate-800 dark:text-white">
                                        <SelectValue placeholder="Pilih pelaksanaan" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[999999] rounded-xl" sideOffset={5}>
                                        {JENIS_PELAKSANAAN.map((item, idx) => (
                                            <SelectItem key={idx} value={item} className="text-sm font-semibold">
                                                {item}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Tanggal & Biaya */}
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="h-5 w-1 rounded-full bg-amber-500" />
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                Jadwal & Biaya Pelatihan
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tanggal Mulai */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                    value={tanggalMulaiPelatihan}
                                    onChange={(e) => setTanggalMulaiPelatihan(e.target.value)}
                                />
                            </div>

                            {/* Tanggal Berakhir */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Tanggal Berakhir
                                </label>
                                <input
                                    type="date"
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                    value={tanggalBerakhirPelatihan}
                                    onChange={(e) => setTanggalBerakhirPelatihan(e.target.value)}
                                />
                            </div>

                            {/* Harga */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Harga Pelatihan (Rp)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                                    value={hargaPelatihan}
                                    onChange={(e) => setHargaPelatihan(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/80 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button
                        onClick={() => setIsOpen(false)}
                        disabled={loading}
                        className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <TbLoader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <TbCheck className="w-4 h-4" />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EditPelatihanAction;


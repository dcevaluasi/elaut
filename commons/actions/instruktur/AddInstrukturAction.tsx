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
import { TbPlus } from "react-icons/tb";
import { UK_ESELON_1, UK_ESELON_2 } from "@/constants/unitkerja";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { RumpunPelatihan } from "@/types/program";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";

const AddInstrukturAction: React.FC<{ onSuccess?: () => void }> = ({
    onSuccess,
}) => {
    const { data: dataRumpunPelatihan, loading: loadingRumpunPelatihan, error: errorRumpunPelatihan, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();

    const [isOpen, setIsOpen] = useState(false);

    // Controlled states (semua field dari JSON)
    const [nama, setNama] = useState("");
    const [noTelpon, setNoTelpon] = useState("");
    const [email, setEmail] = useState("");
    const [nip, setNip] = useState("");
    const [jenisPelatih, setJenisPelatih] = useState("");
    const [jenjangJabatan, setJenjangJabatan] = useState("");
    const [bidangKeahlian, setBidangKeahlian] = useState("");
    const [metodologiPelatihan, setMetodologiPelatihan] = useState("");
    const [pelatihanPelatih, setPelatihanPelatih] = useState("");
    const [kompetensiTeknis, setKompetensiTeknis] = useState("");
    const [managementOfTraining, setManagementOfTraining] = useState("");
    const [trainingOfficerCourse, setTrainingOfficerCourse] = useState("");
    const [linkSertifikat, setLinkSertifikat] = useState("");
    const [status, setStatus] = useState("Active");
    const [eselon1, setEselon1] = useState("")
    const [eselon2, setEselon2] = useState("")
    const [idLemdik, setIdLemdik] = useState(0)
    const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");

    const [loading, setLoading] = useState(false);

    const clearForm = () => {
        setNama("");
        setNoTelpon("");
        setEmail("");
        setNip("");
        setJenisPelatih("");
        setJenjangJabatan("");
        setBidangKeahlian("");
        setMetodologiPelatihan("");
        setPelatihanPelatih("");
        setKompetensiTeknis("");
        setManagementOfTraining("");
        setTrainingOfficerCourse("");
        setLinkSertifikat("");
        setStatus("Active");
        setEselon1("")
        setIdLemdik(0)
        setEselon2("")
        setPendidikanTerakhir("");
    };

    const handleSubmit = async () => {
        const form = {
            nama,
            id_lemdik: idLemdik,
            no_telpon: noTelpon,
            email: email,
            nip: nip,
            jenis_pelatih: jenisPelatih,
            jenjang_jabatan: jenjangJabatan,
            bidang_keahlian: bidangKeahlian,
            metodologi_pelatihan: metodologiPelatihan,
            pelatihan_pelatih: pelatihanPelatih,
            kompetensi_teknis: kompetensiTeknis,
            management_of_training: managementOfTraining,
            training_officer_course: trainingOfficerCourse,
            link_data_dukung_sertifikat: linkSertifikat,
            status,
            eselon1,
            eselon2,
            pendidikkan_terakhir: pendidikanTerakhir,
        };

        try {
            setLoading(true);
            const response = await axios.post(
                `${elautBaseUrl}/createInstruktur`,
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
                text: "Instruktur baru berhasil ditambahkan.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("CREATE INSTRUKTUR: ", response);
            clearForm()
        } catch (error) {
            console.error("ERROR CREATE INSTRUKTUR: ", error);
            setLoading(false);
            clearForm()
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menambahkan instruktur.",
            });
        }
    };

    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()

    React.useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                >
                    <TbPlus className="h-5 w-5" />
                    <span>Tambah Instruktur</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Tambah Instruktur Baru</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isi data berikut untuk menambahkan instruktur baru.
                    </AlertDialogDescription>
                </AlertDialogHeader>

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

                    <div className="grid grid-cols-3 gap-2">
                        {/* NIP */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">NIP</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={nip}
                                onChange={(e) => setNip(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* No Telpon */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">No Telpon</label>
                            <input
                                type="url"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={noTelpon}
                                onChange={(e) => setNoTelpon(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Unit Kerja</label>
                        <Select value={idLemdik?.toString()} onValueChange={(value) => setIdLemdik(parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                {
                                    unitKerjas?.map((item, index) => (
                                        <SelectItem value={item.id_unit_kerja.toString()}>{item.nama}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Jenjang Jabatan */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Jenjang Jabatan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={jenjangJabatan}
                            onChange={(e) => setJenjangJabatan(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Pangkat/Golongan</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={pelatihanPelatih}
                            onChange={(e) => setPelatihanPelatih(e.target.value)}
                        />
                    </div>

                    {/* Bidang Keahlian */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Bidang Keahlian</label>
                        <select
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={bidangKeahlian}
                            onChange={(e) => setBidangKeahlian(e.target.value)}
                            disabled={loadingRumpunPelatihan}
                        >
                            <option value="">-- Pilih Bidang Pelatihan --</option>
                            {dataRumpunPelatihan?.map((rumpun: RumpunPelatihan) => (
                                <option
                                    key={rumpun.id_rumpun_pelatihan}
                                    value={rumpun.name}
                                >
                                    {rumpun.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Management of Training */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Link Management of Training (MoT)</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={managementOfTraining}
                                onChange={(e) => setManagementOfTraining(e.target.value)}
                            />
                        </div>

                        {/* Training Officer Course */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Link Trainer of Training (ToT)</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={trainingOfficerCourse}
                                onChange={(e) => setTrainingOfficerCourse(e.target.value)}
                            />
                        </div>

                        {/* Link Sertifikat */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Link Sertifikat Lainnya</label>
                            <input
                                type="url"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={linkSertifikat}
                                onChange={(e) => setLinkSertifikat(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999]">
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="No Active">Non Active</SelectItem>
                                <SelectItem value="Tugas Belajar">Tugas Belajar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pendidikan Terakhir */}
                    <div className="col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Pendidikan Terakhir</label>
                        <Select
                            value={pendidikanTerakhir}
                            onValueChange={(value) => setPendidikanTerakhir(value)}
                        >
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih pendidikan terakhir" />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[9999999999]">
                                <SelectItem value="Tidak/Belum Sekolah">
                                    Tidak/Belum Sekolah
                                </SelectItem>
                                <SelectItem value="SD">
                                    SD
                                </SelectItem>
                                <SelectItem value="SMP">
                                    SMP
                                </SelectItem>
                                <SelectItem value="SMA">
                                    SMA/SMK
                                </SelectItem>
                                <SelectItem value="D1">
                                    D1
                                </SelectItem>
                                <SelectItem value="D2">
                                    D2
                                </SelectItem>
                                <SelectItem value="D3">
                                    D3
                                </SelectItem>
                                <SelectItem value="D4">
                                    D4
                                </SelectItem>
                                <SelectItem value="S1">
                                    S1
                                </SelectItem>
                                <SelectItem value="S2">
                                    S2
                                </SelectItem>
                                <SelectItem value="S3">
                                    S3
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <div className="w-full">
                            <label className="text-sm font-medium text-gray-700">Eselon I</label>
                            <Select
                                value={eselon1}
                                onValueChange={(v) => setEselon1(v)}
                            >
                                <SelectTrigger >
                                    <SelectValue placeholder="Pilih Eselon I" className="truncate" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[9999999] truncate">
                                    {
                                        UK_ESELON_1.map((eselon1, index) => (
                                            <SelectItem className='truncate' value={eselon1.name} key={eselon1.id}>{eselon1.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        {
                            eselon1 != '' && <div className="w-full">
                                <label className="text-sm font-medium text-gray-700">Eselon II</label>
                                <Select
                                    value={eselon2}
                                    onValueChange={(v) => setEselon2(v)}
                                >
                                    <SelectTrigger >
                                        <SelectValue placeholder="Pilih Eselon II" className="truncate" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999999] truncate">
                                        {UK_ESELON_2[eselon1 as keyof typeof UK_ESELON_2]?.map(
                                            (eselon2: string, index: number) => (
                                                <SelectItem className="truncate" value={eselon2} key={index}>
                                                    {eselon2}
                                                </SelectItem>
                                            )
                                        )}

                                    </SelectContent>
                                </Select>
                            </div>
                        }
                    </div>

                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddInstrukturAction;

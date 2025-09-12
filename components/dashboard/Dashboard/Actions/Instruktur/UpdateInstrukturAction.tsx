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
import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { TbPencil } from "react-icons/tb";
import { Instruktur } from "@/types/instruktur";

const UpdateInstrukturAction: React.FC<{
    instruktur: Instruktur;
    onSuccess?: () => void;
}> = ({ instruktur, onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Controlled states (prefill data lama)
    const [nama, setNama] = useState(instruktur.nama || "");
    const [noTelpon, setNoTelpon] = useState(instruktur.no_telpon || "");
    const [email, setEmail] = useState(instruktur.email || "");
    const [nip, setNip] = useState(instruktur.nip || "");
    const [jenisPelatih, setJenisPelatih] = useState(instruktur.jenis_pelatih || "");
    const [jenjangJabatan, setJenjangJabatan] = useState(instruktur.jenjang_jabatan || "");
    const [bidangKeahlian, setBidangKeahlian] = useState(instruktur.bidang_keahlian || "");
    const [metodologiPelatihan, setMetodologiPelatihan] = useState(instruktur.metodologi_pelatihan || "");
    const [pelatihanPelatih, setPelatihanPelatih] = useState(instruktur.pelatihan_pelatih || "");
    const [kompetensiTeknis, setKompetensiTeknis] = useState(instruktur.kompetensi_teknis || "");
    const [managementOfTraining, setManagementOfTraining] = useState(instruktur.management_of_training || "");
    const [trainingOfficerCourse, setTrainingOfficerCourse] = useState(instruktur.training_officer_course || "");
    const [linkSertifikat, setLinkSertifikat] = useState(instruktur.link_data_dukung_sertifikat || "");
    const [status, setStatus] = useState(instruktur.status || "Active");
    const [pendidikanTerakhir, setPendidikanTerakhir] = useState(instruktur.pendidikkan_terakhir || "");

    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        const form = {
            nama,
            no_telpon: noTelpon,
            email,
            nip,
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
            pendidikkan_terakhir: pendidikanTerakhir,
        };

        try {
            setLoading(true);
            const response = await axios.put(
                `${elautBaseUrl}/updateInstruktur/${instruktur.IdInstruktur}`,
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
                text: "Data instruktur berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("UPDATE INSTRUKTUR: ", response);
        } catch (error) {
            console.error("ERROR UPDATE INSTRUKTUR: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui instruktur.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-3 py-1.5 shadow-sm text-sm text-gray-500 hover:text-white border-gray-500 hover:bg-gray-500"
                >
                    <TbPencil className="h-4 w-4" />
                    Edit
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Data Instruktur</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ubah data instruktur berikut sesuai kebutuhan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* isi form → sama seperti AddInstrukturAction, tapi sudah prefill */}
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
                        <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 p-2 text-sm"
                            value={bidangKeahlian}
                            onChange={(e) => setBidangKeahlian(e.target.value)}
                        />
                    </div>

                    {/* Link */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Management of Training */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Management of Training</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={managementOfTraining}
                                onChange={(e) => setManagementOfTraining(e.target.value)}
                            />
                        </div>

                        {/* Training Officer Course */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Training Officer Course</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                                value={trainingOfficerCourse}
                                onChange={(e) => setTrainingOfficerCourse(e.target.value)}
                            />
                        </div>

                        {/* Link Sertifikat */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Link Sertifikat</label>
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
                                <SelectItem value="Active">Aktif</SelectItem>
                                <SelectItem value="No Active">Nonaktif</SelectItem>
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
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleUpdate}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Update"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UpdateInstrukturAction;

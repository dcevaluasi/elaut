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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TbEditCircle } from "react-icons/tb";
import axios from "axios";
import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KABUPATENS, PROVINCES } from "@/constants/regions";

interface EditPesertaActionProps {
    idPelatihan: string;
    idPeserta: string;
    onSuccess?: () => void;
}

const EditPesertaAction: React.FC<EditPesertaActionProps> = ({
    idPelatihan,
    idPeserta,
    onSuccess,
}) => {
    const [currentData, setCurrentData] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState("");
    const [nik, setNik] = useState("");
    const [noTelpon, setNoTelpon] = useState("");
    const [email, setEmail] = useState("");
    const [alamat, setAlamat] = useState("");
    const [tempatLahir, setTempatLahir] = useState("");
    const [tanggalLahir, setTanggalLahir] = useState("");
    const [jenisKelamin, setJenisKelamin] = useState("");
    const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");
    const [institusi, setInstitusi] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [kabupaten, setKabupaten] = useState("");
    const [foto, setFoto] = useState<File | null>(null);
    const [ktp, setKtp] = useState<File | null>(null);

    const handleFetchDetailPeserta = async () => {
        try {
            const response = await axios.get(
                `${elautBaseUrl}/users/getUsersByIdNoJwt?id=${idPeserta}`,
                {
                    headers: {
                        "x-api-key": "EL@uTs3rv3R",
                    },
                }
            );
            setCurrentData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        handleFetchDetailPeserta();
    }, []);

    React.useEffect(() => {
        if (currentData) {
            setNama(currentData.Nama || "");
            setNik(currentData.Nik?.toString() || "");
            setNoTelpon(currentData.NoTelpon?.toString() || "");
            setEmail(currentData.Email || "");
            setAlamat(currentData.Alamat || "");
            setTempatLahir(currentData.TempatLahir || "");
            setTanggalLahir(currentData.TanggalLahir || "");
            setJenisKelamin(currentData.JenisKelamin || "");
            setPendidikanTerakhir(currentData.PendidikanTerakhir || "");
            setInstitusi(currentData.Status || "");
            setProvinsi(currentData.Provinsi || "");
            setKabupaten(currentData.Kota || "");
        }
    }, [currentData]);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("Nama", nama);
        formData.append("Nik", nik);
        formData.append("NoTelpon", noTelpon);
        formData.append("Email", email);
        formData.append("Alamat", alamat);
        formData.append("TempatLahir", tempatLahir);
        formData.append("TanggalLahir", tanggalLahir);
        formData.append("JenisKelamin", jenisKelamin);
        formData.append("PendidikanTerakhir", pendidikanTerakhir);
        formData.append("Status", institusi);
        formData.append("Provinsi", provinsi);
        formData.append("Kota", kabupaten);

        if (foto) formData.append("Fotos", foto);
        if (ktp) formData.append("Ktps", ktp);

        try {
            setLoading(true);
            const response = await axios.put(
                `${elautBaseUrl}/users/updateUsersNoJwt?id=${idPeserta}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            Toast.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Informasi peserta berhasil diperbarui.",
            });
            setIsOpen(false);
            setLoading(false);
            if (onSuccess) onSuccess();
            console.log("UPDATE PESERTA: ", response);
        } catch (error) {
            console.error("ERROR UPDATE PESERTA: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat memperbarui peserta.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>

                <Button
                    variant="outline"
                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500"
                >
                    <TbEditCircle className="h-5 w-5" />
                    <span>Edit Informasi Peserta</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-3xl space-y-2">
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Informasi Peserta</AlertDialogTitle>
                    <AlertDialogDescription>
                        Perbarui data utama peserta berikut sesuai kebutuhan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* FORM FIELDS */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Nama</Label>
                        <Input value={nama} onChange={(e) => setNama(e.target.value)} />
                    </div>
                    <div>
                        <Label>NIK</Label>
                        <Input value={nik} onChange={(e) => setNik(e.target.value)} />
                    </div>
                    <div>
                        <Label>No. Telepon</Label>
                        <Input
                            value={noTelpon}
                            onChange={(e) => setNoTelpon(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <Label>Tempat Lahir</Label>
                        <Input
                            value={tempatLahir}
                            onChange={(e) => setTempatLahir(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Tanggal Lahir</Label>
                        <Input
                            type="string"
                            value={tanggalLahir}
                            onChange={(e) => setTanggalLahir(e.target.value)}
                        />
                    </div>
                    <div className="">
                        <Label>Alamat</Label>
                        <Input value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                    </div>
                    <div>
                        <Label>Institusi</Label>
                        <Input
                            value={institusi}
                            onChange={(e) => setInstitusi(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Jenis Kelamin</Label>
                        <Select
                            value={jenisKelamin || undefined}
                            onValueChange={(value) => setJenisKelamin(value)}
                        >
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                            <SelectContent position="popper" className='z-[9999999]'>
                                <SelectItem value="L">Laki - Laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Pendidikan Terakhir</Label>
                        <Select
                            value={pendidikanTerakhir}
                            onValueChange={(value) => setPendidikanTerakhir(value)}
                        >
                            <SelectTrigger className="w-full text-base py-4">
                                <SelectValue placeholder="Pilih pendidikan terakhir" />
                            </SelectTrigger>
                            <SelectContent position="popper" className='z-[9999999]'>
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
                                <SelectItem value="DI/DII/DIII">
                                    DI/DII/DIII
                                </SelectItem>
                                <SelectItem value="DIV">
                                    DIV
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
                    <div>
                        <Label>Provinsi</Label>
                        {
                            PROVINCES.length != 0 && <Select value={provinsi} onValueChange={(value) => setProvinsi(value)}>
                                <SelectTrigger className="w-full text-base py-4">
                                    <SelectValue placeholder="Pilih provinsi" />
                                </SelectTrigger>
                                <SelectContent position="popper" className='z-[9999999]'>
                                    {
                                        PROVINCES.map((province, i) => (
                                            <SelectItem key={i} value={province.provinsi} >{province.provinsi}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        }
                    </div>
                    <div>
                        <Label>Kabupaten</Label>
                        {
                            KABUPATENS.length != 0 && <Select value={kabupaten} onValueChange={(value) => setKabupaten(value)}>
                                <SelectTrigger className="w-full text-base py-4">
                                    <SelectValue placeholder="Pilih kabupaten/kota" />
                                </SelectTrigger>
                                <SelectContent position="popper" className='z-[9999999]'>
                                    {
                                        KABUPATENS.map((regency, i) => (
                                            <SelectItem key={i} value={regency.kabupaten} >{regency.kabupaten}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        }
                    </div>

                    <div>
                        <Label>Foto</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFoto(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div>
                        <Label>KTP</Label>
                        <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setKtp(e.target.files?.[0] || null)}
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

export default EditPesertaAction;

"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TbEditCircle, TbUser, TbMail, TbPhone, TbMapPin, TbCalendar, TbBuilding, TbChevronDown, TbCamera, TbFileText, TbGenderMale, TbSchool, TbId } from "react-icons/tb";
import axios from "axios";
import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { User } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KABUPATENS, PROVINCES } from "@/constants/regions";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, User as UserIcon, X, Check, Save, Info, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        if (isOpen) {
            handleFetchDetailPeserta();
        }
    }, [isOpen]);

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

    const FormLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </label>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="group h-10 flex items-center gap-2.5 rounded-xl px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-600 dark:text-slate-400 font-bold text-xs hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm"
                >
                    <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                    </div>
                    <span>Dukumen Peserta</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw]  md:w-full max-w-4xl p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-white/50 dark:border-slate-800 rounded-3xl md:rounded-[3rem] overflow-hidden shadow-2xl z-[99999]">
                <div className="flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-8 pb-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20">
                                <Edit3 />
                            </div>
                            <div>
                                <DialogTitle className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">Edit Informasi Peserta</DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lakukan pembaruan data registrasi dan dokumen kelengkapan peserta.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1  px-8 py-4">
                        <div className="space-y-10 pb-8">
                            {/* Identity Section */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-full">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Profil
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <FormLabel icon={TbUser}>Nama Lengkap</FormLabel>
                                        <Input
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbId}>Nomor Induk Kependudukan (NIK)</FormLabel>
                                        <Input
                                            value={nik}
                                            onChange={(e) => setNik(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="16 digit NIK"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-full">
                                    <div className="w-2 h-2 rounded-full bg-emerald-600" /> Kontak & Domisili
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <FormLabel icon={TbPhone}>Nomor Telepon/WA</FormLabel>
                                        <Input
                                            value={noTelpon}
                                            onChange={(e) => setNoTelpon(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="0812..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbMail}>Email Aktif</FormLabel>
                                        <Input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="nama@email.com"
                                        />
                                    </div>
                                    <div className="space-y-1 lg:col-span-1">
                                        <FormLabel icon={TbMapPin}>Provinsi</FormLabel>
                                        <Select value={provinsi} onValueChange={setProvinsi}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Pilih provinsi" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999] rounded-2xl border-white/20 backdrop-blur-3xl shadow-2xl">
                                                {PROVINCES.map((p, i) => (
                                                    <SelectItem key={i} value={p.provinsi} className="rounded-xl my-1">{p.provinsi}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbMapPin}>Kabupaten/Kota</FormLabel>
                                        <Select value={kabupaten} onValueChange={setKabupaten}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Pilih kabupaten" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999] rounded-2xl border-white/20 backdrop-blur-3xl shadow-2xl">
                                                {KABUPATENS.map((k, i) => (
                                                    <SelectItem key={i} value={k.kabupaten} className="rounded-xl my-1">{k.kabupaten}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <FormLabel icon={TbMapPin}>Alamat Lengkap</FormLabel>
                                        <Input
                                            value={alamat}
                                            onChange={(e) => setAlamat(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="Jl. Nama Jalan No. XX..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio & Education Section */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-full">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" /> Bio & Pendidikan
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <FormLabel icon={TbCalendar}>Tempat Lahir</FormLabel>
                                        <Input
                                            value={tempatLahir}
                                            onChange={(e) => setTempatLahir(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="Kota Kelahiran"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbCalendar}>Tanggal Lahir</FormLabel>
                                        <Input
                                            value={tanggalLahir}
                                            onChange={(e) => setTanggalLahir(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbGenderMale}>Jenis Kelamin</FormLabel>
                                        <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Pilih gender" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999] rounded-2xl border-white/20 backdrop-blur-3xl shadow-2xl">
                                                <SelectItem value="L" className="rounded-xl my-1">Laki-Laki</SelectItem>
                                                <SelectItem value="P" className="rounded-xl my-1">Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <FormLabel icon={TbSchool}>Pendidikan Terakhir</FormLabel>
                                        <Select value={pendidikanTerakhir} onValueChange={setPendidikanTerakhir}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Pendidikan" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999] rounded-2xl border-white/20 backdrop-blur-3xl shadow-2xl">
                                                {["Tidak/Belum Sekolah", "SD", "SMP", "SMA", "DI/DII/DIII", "DIV", "S1", "S2", "S3"].map((lv) => (
                                                    <SelectItem key={lv} value={lv === "SMA" ? "SMA/SMK" : lv} className="rounded-xl my-1">{lv === "SMA" ? "SMA/SMK" : lv}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <FormLabel icon={TbBuilding}>Instansi/Institusi</FormLabel>
                                        <Input
                                            value={institusi}
                                            onChange={(e) => setInstitusi(e.target.value)}
                                            className="h-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="Nama instansi atau sekolah"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-6">
                                <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] pb-3 border-b border-slate-100 dark:border-slate-800 w-full">
                                    <div className="w-2 h-2 rounded-full bg-rose-600" /> Dokumen Digital
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group/upload h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/50 overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFoto(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover/upload:text-blue-600 transition-all">
                                            {foto ? <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-xl"><Check className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{foto.name}</span></div> : <><TbCamera className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-widest leading-none">Unggah Pas Foto </span></>}
                                        </div>
                                    </div>
                                    <div className="relative group/upload h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center transition-all hover:bg-white dark:hover:bg-slate-900 hover:border-blue-500/50 overflow-hidden">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setKtp(e.target.files?.[0] || null)}
                                            accept="image/*,.pdf"
                                        />
                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover/upload:text-blue-600 transition-all">
                                            {ktp ? <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-xl"><Check className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">{ktp.name}</span></div> : <><TbFileText className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-widest leading-none">Unggah Scan KTP/Identitas</span></>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center justify-end gap-4 w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                                className="h-12 px-8 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="h-12 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                        <span>Proses Sinkronisasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditPesertaAction;

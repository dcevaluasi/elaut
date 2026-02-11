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
} from "@/components/ui/select";
import {
    TbPlus,
    TbUser,
    TbId,
    TbMail,
    TbPhone,
    TbBuildingSkyscraper,
    TbBriefcase,
    TbSchool,
    TbCertificate,
    TbLink,
    TbActivity,
    TbX,
    TbChecks
} from "react-icons/tb";
import { UK_ESELON_1, UK_ESELON_2 } from "@/constants/unitkerja";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { RumpunPelatihan } from "@/types/program";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";

const AddInstrukturAction: React.FC<{ onSuccess?: () => void }> = ({
    onSuccess,
}) => {
    const { data: dataRumpunPelatihan, loading: loadingRumpunPelatihan } = useFetchDataRumpunPelatihan();
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();

    React.useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Controlled states
    const [nama, setNama] = useState("");
    const [noTelpon, setNoTelpon] = useState("");
    const [email, setEmail] = useState("");
    const [nip, setNip] = useState("");
    const [jenisPelatih, setJenisPelatih] = useState("");
    const [jenjangJabatan, setJenjangJabatan] = useState("");
    const [bidangKeahlian, setBidangKeahlian] = useState("");
    const [metodologiPelatihan, setMetodologiPelatihan] = useState("");
    const [pelatihanPelatih, setPelatihanPelatih] = useState(""); // This seems to be used for Pangkat/Golongan based on previous code
    const [kompetensiTeknis, setKompetensiTeknis] = useState("");
    const [managementOfTraining, setManagementOfTraining] = useState("");
    const [trainingOfficerCourse, setTrainingOfficerCourse] = useState("");
    const [linkSertifikat, setLinkSertifikat] = useState("");
    const [status, setStatus] = useState("Active");
    const [eselon1, setEselon1] = useState("");
    const [eselon2, setEselon2] = useState("");
    const [idLemdik, setIdLemdik] = useState<number | undefined>(undefined);
    const [pendidikanTerakhir, setPendidikanTerakhir] = useState("");

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
        setEselon1("");
        setIdLemdik(undefined);
        setEselon2("");
        setPendidikanTerakhir("");
    };

    const handleSubmit = async () => {
        const form = {
            nama,
            id_lemdik: idLemdik || 0,
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
            clearForm();
        } catch (error) {
            console.error("ERROR CREATE INSTRUKTUR: ", error);
            setLoading(false);
            Toast.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan saat menambahkan instruktur.",
            });
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all">
                    <TbPlus className="mr-2 h-5 w-5" />
                    Tambah Instruktur
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-full max-w-5xl h-fit max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbUser size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Registration Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Tambah Instruktur Baru
                            </h2>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <TbX size={22} />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="gap-6">
                        {/* --- Section 1: Profil Utama --- */}
                        <div className="md:col-span-12">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-8 w-1 rounded-full bg-blue-500" />
                                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Profil Utama</h4>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <TbUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="Masukkan nama lengkap (gelar opsional)"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">NIP</label>
                                <div className="relative group">
                                    <TbId className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="Nomor Induk Pegawai"
                                        value={nip}
                                        onChange={(e) => setNip(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                <div className="relative group">
                                    <TbMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="Masukkan alamat email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">No. Telepon / WhatsApp</label>
                                <div className="relative group">
                                    <TbPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="08xxxxxxxxxx"
                                        value={noTelpon}
                                        onChange={(e) => setNoTelpon(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* --- Section 2: Unit Kerja & Jabatan --- */}
                        <div className="md:col-span-12 mt-4">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-8 w-1 rounded-full bg-emerald-500" />
                                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Kepegawaian</h4>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Unit Kerja (Lemdik)</label>
                                <Select value={idLemdik?.toString()} onValueChange={(value) => setIdLemdik(parseInt(value))}>
                                    <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10">
                                        <div className="flex items-center gap-3">
                                            <TbBuildingSkyscraper className="text-slate-400" size={20} />
                                            <SelectValue placeholder="Pilih Unit Kerja" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80 z-[9999999]">
                                        {unitKerjas?.map((item, index) => (
                                            <SelectItem key={index} value={item.id_unit_kerja.toString()} className="font-semibold text-xs py-3">{item.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jenjang Jabatan</label>
                                <div className="relative group">
                                    <TbBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="Contoh: Widyaiswara Ahli Madya"
                                        value={jenjangJabatan}
                                        onChange={(e) => setJenjangJabatan(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pangkat / Golongan</label>
                                <div className="relative group">
                                    <TbActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="Contoh: Pembina (IV/a)"
                                        value={pelatihanPelatih}
                                        onChange={(e) => setPelatihanPelatih(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className=" space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pendidikan Terakhir</label>
                                <Select value={pendidikanTerakhir} onValueChange={setPendidikanTerakhir}>
                                    <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10">
                                        <div className="flex items-center gap-3">
                                            <TbSchool className="text-slate-400" size={20} />
                                            <SelectValue placeholder="Pilih Pendidikan" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999999]">
                                        {["SMA/SMK", "D3", "S1", "S2", "S3"].map((level) => (
                                            <SelectItem key={level} value={level} className="font-semibold text-xs py-3">{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                        {/* --- Section 3: Kompetensi & Sertifikasi --- */}
                        <div className="md:col-span-12 mt-4">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="h-8 w-1 rounded-full bg-violet-500" />
                                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Kompetensi & Sertifikasi</h4>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">
                            <div className="md:col-span-12 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Bidang Keahlian</label>
                                <Select value={bidangKeahlian} onValueChange={setBidangKeahlian}>
                                    <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-violet-500/10">
                                        <div className="flex items-center gap-3">
                                            <TbCertificate className="text-slate-400" size={20} />
                                            <SelectValue placeholder="Pilih Bidang Keahlian" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80 z-[9999999]">
                                        {dataRumpunPelatihan?.map((rumpun: RumpunPelatihan) => (
                                            <SelectItem key={rumpun.id_rumpun_pelatihan} value={rumpun.name} className="font-semibold text-xs py-3">{rumpun.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Link MoT</label>
                                <div className="relative group">
                                    <TbLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="URL Sertifikat MoT"
                                        value={managementOfTraining}
                                        onChange={(e) => setManagementOfTraining(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Link ToT</label>
                                <div className="relative group">
                                    <TbLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="URL Sertifikat ToT"
                                        value={trainingOfficerCourse}
                                        onChange={(e) => setTrainingOfficerCourse(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Link Sertifikat Lainnya</label>
                                <div className="relative group">
                                    <TbLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        className="w-full h-14 pl-12 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-300"
                                        placeholder="URL Data Dukung"
                                        value={linkSertifikat}
                                        onChange={(e) => setLinkSertifikat(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="md:col-span-12 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status Keaktifan</label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 dark:bg-white/5 border-transparent font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                        <TbUserCheck className={status === "Active" ? "text-emerald-500" : "text-slate-400"} size={20} />
                                        <SelectValue placeholder="Pilih Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="z-[9999999]">
                                    <SelectItem value="Active" className="font-semibold text-xs py-3">Active</SelectItem>
                                    <SelectItem value="No Active" className="font-semibold text-xs py-3">Non Active / Pensiun</SelectItem>
                                    <SelectItem value="Tugas Belajar" className="font-semibold text-xs py-3">Tugas Belajar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[32px]">
                    <button onClick={() => setIsOpen(false)} disabled={loading} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> Confirm Entry</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// Helper for status icon
function TbUserCheck({ className, size }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
            <path d="M15 19l2 2l4 -4" />
        </svg>
    );
}

export default AddInstrukturAction;

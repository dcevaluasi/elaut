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
    TbPencil,
    TbUser,
    TbId,
    TbMail,
    TbPhone,
    TbBuildingSkyscraper,
    TbBriefcase,
    TbActivity,
    TbSchool,
    TbCertificate,
    TbLink,
    TbUserCheck,
    TbX,
    TbChecks
} from "react-icons/tb";
import { Instruktur } from "@/types/instruktur";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UK_ESELON_1, UK_ESELON_2 } from "@/constants/unitkerja";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { RumpunPelatihan } from "@/types/program";

const UpdateInstrukturAction: React.FC<{
    instruktur: Instruktur;
    onSuccess?: () => void;
}> = ({ instruktur, onSuccess }) => {
    const { data: dataRumpunPelatihan, loading: loadingRumpunPelatihan } = useFetchDataRumpunPelatihan();
    const { unitKerjas, fetchUnitKerjaData } = useFetchDataUnitKerja();

    React.useEffect(() => {
        fetchUnitKerjaData();
    }, [fetchUnitKerjaData]);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
    const [idLemdik, setIdLemdik] = useState<number | undefined>(instruktur?.id_lemdik ? Number(instruktur.id_lemdik) : undefined);
    const [eselon1, setEselon1] = useState(instruktur.eselon_1 || "");
    const [eselon2, setEselon2] = useState(instruktur.eselon_2 || "");

    const handleUpdate = async () => {
        const form = {
            nama,
            no_telpon: noTelpon,
            email,
            id_lemdik: idLemdik,
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
            eselon_1: eselon1,
            eselon_2: eselon2,
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
                <div
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full gap-2 text-slate-700 dark:text-slate-200 font-medium"
                >
                    <TbPencil className="h-4 w-4 text-blue-500" />
                    Edit Data
                </div>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-full max-w-5xl h-fit max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.2)] z-[999999] flex flex-col">
                {/* Header */}
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-white/5">
                            <TbPencil size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                    Modification Mode
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                                Edit Data Instruktur
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
                                        placeholder="Masukkan nama lengkap"
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
                                        placeholder="email@example.com"
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
                                        {["Tidak/Belum Sekolah", "SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"].map((level) => (
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
                        onClick={handleUpdate}
                        disabled={loading}
                        className="group relative h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : <><TbChecks size={18} /> Update Data</>}
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default UpdateInstrukturAction;

"use client";

import React from "react";
import {
    Accordion,
} from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import { MdLock, MdOutlineVerifiedUser, MdOutlinePhotoCamera, MdOutlineDescription } from "react-icons/md";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import { truncateText } from "@/utils";
import Link from "next/link";
import { IoBookOutline, IoDocumentOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import { TbCalendar, TbCategory, TbChevronDown, TbChevronUp, TbClock, TbMapPin, TbPencilCheck, TbPencilCog, TbPencilX, TbRocket, TbSchool, TbSend, TbSettings, TbSignature, TbStar, TbTag, TbCertificate, TbBuildingSkyscraper, TbHierarchy, TbCash, TbUserCode, TbUserShare, TbExternalLink, TbLayoutGrid, TbUsers } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { isMoreThanToday } from "@/utils/time";
import { LuSignature } from "react-icons/lu";
import { countUserWithStatus, countValidKeterangan } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { Badge } from "@/components/ui/badge";
import { ModulPelatihan } from "@/types/module";
import { stringToArray } from "@/utils/input";
import AccordionSection from "@/components/reusables/AccordionSection";
import InfoItem from "@/components/reusables/InfoItem";
import { JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN } from "@/constants/pelatihan";
import UploadSuratButton from "@/commons/actions/UploadSuratButton";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import EditPelatihanAction from "@/commons/actions/EditPelatihanAction";
import DeletePelatihanAction from "@/commons/actions/DeletePelatihanAction";
import ChooseModulAction from "@/commons/actions/modul/ChooseModulAction";
import ChooseInstrukturAction from "@/commons/actions/instruktur/ChooseInstrukturAction";
import ImportPesertaAction from "@/commons/actions/ImportPesertaAction";
import { ValidateParticipantAction } from "@/commons/actions/lemdiklat/ValidateParticipantAction";
import EditPublishAction from "@/commons/actions/EditPublishAction";
import HistoryButton from "@/commons/actions/HistoryButton";
import PublishButton from "@/commons/actions/PublishButton";
import { Button } from "@/components/ui/button";
import Toast from "@/commons/Toast";
import ZipPhotoParticipantAction from "@/commons/actions/lemdiklat/ZipPhotoParticipantAction";
import TTDeDetail from "./TTDeDetail";
import { LayoutGrid, Users, FileText, GraduationCap, Share2, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle, Clock, Send, Trash2, Edit3, History, Download, Settings, Info, Lock } from "lucide-react";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void
}

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData } = useFetchDataInstrukturSelected(stringToArray(data?.Instruktur))

    /**
     * Modul Pelatihan 
     */
    const { data: modulPelatihan, loading: loadingModulPelatihans, error: errorModulPelatihans, refetch: fetchModulPelatihans } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri)
    const [expanded, setExpanded] = React.useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpanded(expanded === id ? null : id)
    }

    const DetailCard = ({ label, value, icon: Icon, theme = "blue" }: { label: string; value?: string; icon: any; theme?: string }) => {
        const themes: any = {
            blue: "from-blue-50 to-indigo-50 text-blue-600 border-blue-100/50 dark:from-blue-500/5 dark:to-indigo-500/5 dark:border-blue-500/10",
            amber: "from-amber-50 to-orange-50 text-amber-600 border-amber-100/50 dark:from-amber-500/5 dark:to-orange-500/5 dark:border-amber-500/10",
            emerald: "from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100/50 dark:from-emerald-500/5 dark:to-teal-500/5 dark:border-emerald-500/10",
            rose: "from-rose-50 to-pink-50 text-rose-600 border-rose-100/50 dark:from-rose-500/5 dark:to-pink-500/5 dark:border-rose-500/10",
            indigo: "from-indigo-50 to-violet-50 text-indigo-600 border-indigo-100/50 dark:from-indigo-500/5 dark:to-violet-500/5 dark:border-indigo-500/10",
            slate: "from-slate-50 to-slate-100 text-slate-600 border-slate-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700",
        };

        return (
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className={`group flex flex-col p-4 md:p-5 bg-gradient-to-br ${themes[theme]} rounded-2xl md:rounded-3xl border backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5`}
            >
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">{label}</span>
                </div>
                {value?.includes('</p>') ? (
                    <div className="prose prose-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-none font-bold">
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                    </div>
                ) : (
                    <span className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 tracking-tight">
                        {value || "-"}
                    </span>
                )}
            </motion.div>
        );
    };

    React.useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    return (
        <div className="w-full space-y-4 md:space-y-6 py-2">
            {/* Administrative Control Center */}
            <div className="relative group">
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700" />
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
                    <div className="px-6 md:px-8 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 overflow-hidden relative group/icon">
                                <LayoutGrid className="relative z-10 group-hover/icon:rotate-12 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg md:text-xl text-slate-900 dark:text-white tracking-tight">Pusat Kontrol Pelaksanaan</h3>
                                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">Kelola status, verifikasi, dan alur kerja pelaksanaan pelatihan</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <HistoryButton
                                pelatihan={data!}
                                statusPelatihan={data?.Status ?? ""}
                                idPelatihan={data!.IdPelatihan.toString()}
                                handleFetchingData={fetchData}
                            />
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-4">
                        {/* Action Toolbar */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">

                                <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800"></div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                {
                                    Cookies.get('Access')?.includes('createPelatihan') &&
                                    <>
                                        <UploadSuratButton
                                            idPelatihan={String(data.IdPelatihan)}
                                            pelatihan={data}
                                            handleFetchingData={fetchData}
                                        />

                                        {data.SuratPemberitahuan !== "" && (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") ? (
                                            data?.UserPelatihan?.length !== 0 && data?.SuratPemberitahuan !== "" ? (
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Kirim ke SPV"
                                                    description="Apakah Anda yakin ingin mengirim pelaksanaan ini ke SPV untuk proses verifikasi lebih lanjut?"
                                                    buttonLabel="Kirim ke SPV"
                                                    icon={Send}
                                                    buttonColor="blue"
                                                    onSuccess={fetchData}
                                                    status={"1"}
                                                    pelatihan={data}
                                                />
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="h-12 flex items-center gap-3 rounded-[1.25rem] px-8 shadow-sm transition-all border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                    onClick={() => {
                                                        Toast.fire({
                                                            icon: "warning",
                                                            title: "Lengkapi Data",
                                                            html: `
                                                                <div class="text-left mt-2 space-y-1 text-sm text-slate-600">
                                                                    ${data?.ModuleMateri === "" ? "• Module Materi belum diisi" : ""}
                                                                    ${!data?.UserPelatihan || data?.UserPelatihan.length === 0 ? "• Peserta pelatihan belum ditambahkan" : ""}
                                                                    ${data?.SuratPemberitahuan === "" ? "• Surat Pemberitahuan belum tersedia" : ""}
                                                                </div>
                                                            `,
                                                        });
                                                    }}
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Kirim ke SPV
                                                </Button>
                                            )
                                        ) : null}

                                        {
                                            (data.SuratPemberitahuan != "" && data.StatusPenerbitan == "3") &&
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Kirim ke Verifikator"
                                                description="Perbaiki permohonan pelaksanaan sesuai catatan Verifikator"
                                                buttonLabel="Kirim ke Verifikator"
                                                icon={Send}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"2"}
                                                pelatihan={data}
                                            />
                                        }

                                        {
                                            ((data.StatusPenerbitan == "4" || data.StatusPenerbitan == "1.1") && isMoreThanToday(data.TanggalBerakhirPelatihan)) &&
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Tutup Pelatihan"
                                                description="Dengan menutup pelatihan ini, proses selanjutnya adalah penerbitan STTPL. Segala data terkait pelatihan tidak dapat diedit!"
                                                buttonLabel="Tutup Pelatihan"
                                                icon={Clock}
                                                buttonColor="neutral"
                                                onSuccess={fetchData}
                                                status={"5"}
                                                pelatihan={data}
                                            />
                                        }

                                        {
                                            data.StatusPenerbitan == "5" &&
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Ajukan Penerbitan STTPL"
                                                description="Ayoo! Segera ajukan penerbitan STTPL, siapkan dokumen kelengkapan sebelum proses pengajuan!"
                                                buttonLabel="Ajukan Penerbitan STTPL"
                                                icon={CheckCircle2}
                                                buttonColor="blue"
                                                onSuccess={fetchData}
                                                status={"6"}
                                                pelatihan={data}
                                            />
                                        }
                                    </>
                                }

                                {
                                    (Cookies.get('Access')?.includes('supervisePelaksanaan') && data.StatusPenerbitan == "1") && <>
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Perbaikan Pelaksanaan"
                                            description="Berikan catatan perbaikan kepada operator untuk dikoreksi kembali."
                                            buttonLabel="Minta Perbaikan"
                                            icon={AlertCircle}
                                            buttonColor="rose"
                                            onSuccess={fetchData}
                                            status={"1.2"}
                                            pelatihan={data}
                                        />
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Pilih Verifikator"
                                            description="Segera menunjuk verifikator dalam melakukan verifikasi pelaksanaan pelatihan"
                                            buttonLabel="Pilih Verifikator"
                                            icon={TbSettings}
                                            buttonColor="teal"
                                            onSuccess={fetchData}
                                            status={"2"}
                                            pelatihan={data}
                                        /></>
                                }

                                {
                                    (Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan == "2") &&
                                    <>
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Perbaikan Pelaksanaan"
                                            description="Segera melakukan verifikasi pelaksanaan diklat, pastikan perangkat dan kelengkapan administrasi pelatihan sesuai dan lengkap"
                                            buttonLabel="Minta Perbaikan"
                                            icon={Trash2}
                                            buttonColor="rose"
                                            onSuccess={fetchData}
                                            status={"3"}
                                            pelatihan={data}
                                        />
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Setujui Pelaksanaan"
                                            description="Pastikan semua data sudah benar sebelum menyetujui pelaksanaan pelatihan ini."
                                            buttonLabel="Setujui Pelaksanaan"
                                            icon={ShieldCheck}
                                            buttonColor="teal"
                                            onSuccess={fetchData}
                                            status={"4"}
                                            pelatihan={data}
                                        /></>
                                }
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status & Verifikasi</span>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800"></div>
                            </div>

                            {
                                data.SuratPemberitahuan == "" ?
                                    <div className="py-10 w-full bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex items-center flex-col justify-center gap-4 group">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-400/20 blur-2xl rounded-full scale-150 animate-pulse" />
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800 relative z-10">
                                                <Lock className='w-8 h-8 text-slate-300' />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1 max-w-md">
                                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Menunggu Administrasi</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed italic">
                                                Harap mengupload surat pemberitahuan pelaksanaan pelatihan (Paling Lambat H-3) untuk mengaktifkan tahapan verifikasi selanjutnya.
                                            </p>
                                        </div>
                                    </div> :
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${adminPusatData != null ? 'lg:grid-cols-3' : ''} gap-4`}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={`flex flex-col p-5 ${color} rounded-[2rem] shadow-2xl shadow-blue-500/20 border border-white/20 transition-all overflow-hidden relative group`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            <span className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] mb-2 relative z-10 text-white">Status Saat Ini</span>
                                            <span className="flex items-center gap-3 text-white font-black text-base relative z-10">
                                                {icon}
                                                {label}
                                            </span>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                        >
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-600 transition-colors">Surat Pemberitahuan</span>
                                            <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-base font-black text-blue-600 dark:text-blue-400 truncate flex items-center gap-2 hover:translate-x-1 transition-transform">
                                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                                    <FileText className="w-4 h-4 shrink-0" />
                                                </div>
                                                <span className="underline decoration-blue-500/30 underline-offset-4">{truncateText(data?.SuratPemberitahuan, 15, '...')}</span>
                                            </Link>
                                        </motion.div>

                                        {
                                            adminPusatData != null && (
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                                >
                                                    <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-600 transition-colors">Verifikator Pusat</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 font-black">
                                                            {adminPusatData!.Nama.charAt(0)}
                                                        </div>
                                                        <span className="text-base font-black text-slate-800 dark:text-white tracking-tight">
                                                            {adminPusatData!.Nama}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )
                                        }
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <Accordion
                type="multiple"
                className="w-full space-y-4"
                defaultValue={["pins", "publish", "peserta", "perangkat", "instruktur"]}
            >
                {/* General Info */}
                <AccordionSection value="pins" title="Informasi Umum Pelatihan" icon={<TbSchool className="text-blue-600" />} description="Kelola data dasar pelatihan, sumber pembiayaan, dan detail teknis pelaksanaan.">
                    <div className="flex flex-col w-full gap-8">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
                            <EditPelatihanAction
                                idPelatihan={data.IdPelatihan.toString()}
                                currentData={data}
                                onSuccess={fetchData} />

                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

                            <DeletePelatihanAction
                                idPelatihan={data!.IdPelatihan.toString()}
                                pelatihan={data}
                                handleFetchingData={fetchData}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <DetailCard label="Kode Kelas" value={data.KodePelatihan} icon={TbTag} theme="blue" />
                            <DetailCard label="Sektor" value={data.JenisProgram} icon={TbHierarchy} theme="indigo" />
                            <DetailCard label="Klaster" value={`${data?.BidangPelatihan}`} icon={TbCategory} theme="amber" />
                            <DetailCard label="Program" value={`${data.Program}`} icon={TbRocket} theme="emerald" />
                            <DetailCard label="Pembiayaan" value={data.JenisPelatihan} icon={TbCash} theme="rose" />
                            <DetailCard label="Penyelenggara" value={data.PenyelenggaraPelatihan} icon={TbBuildingSkyscraper} theme="slate" />
                            <DetailCard label="Terobosan" value={data.DukunganProgramTerobosan} icon={TbStar} theme="amber" />
                            <DetailCard label="Mulai" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} icon={TbCalendar} theme="blue" />
                            <DetailCard label="Selesai" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} icon={TbClock} theme="blue" />
                            <DetailCard label="Lokasi" value={data.LokasiPelatihan} icon={TbMapPin} theme="emerald" />
                            {data?.JenisPelatihan == JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && (
                                <DetailCard label="Biaya" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} icon={TbCash} theme="rose" />
                            )}
                            <DetailCard label="Pelaksanaan" value={data.PelaksanaanPelatihan} icon={TbSchool} theme="indigo" />
                            <DetailCard label="Penandatangan" value={data.TtdSertifikat} icon={TbSignature} theme="slate" />
                        </div>
                    </div>
                </AccordionSection>

                {/* Publish and Promotion */}
                {
                    (Cookies.get('Access')?.includes('createPelatihan')) &&
                    <AccordionSection value="publish" title="Publish Informasi & Promosi" icon={<TbLayoutGrid className="text-indigo-600" />} description="Sesuaikan tampilan informasi pelatihan di website utama untuk menarik minat calon peserta.">
                        <div className="flex flex-col w-full gap-6">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
                                <EditPublishAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentDetail={data.DetailPelatihan}
                                    currentFoto={data.FotoPelatihan}
                                    tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                    currentData={data}
                                    onSuccess={fetchData} />
                                {
                                    data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                                            {data!.Status == "Publish" ? (
                                                <PublishButton
                                                    title="Take Down"
                                                    statusPelatihan={data?.Status ?? ""}
                                                    idPelatihan={data!.IdPelatihan.toString()}
                                                    handleFetchingData={fetchData}
                                                />
                                            ) : (
                                                <PublishButton
                                                    title="Publish"
                                                    statusPelatihan={data?.Status ?? ""}
                                                    idPelatihan={data!.IdPelatihan.toString()}
                                                    handleFetchingData={fetchData}
                                                />
                                            )}
                                        </div>
                                    )
                                }
                            </div>

                            {data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="w-full lg:w-[350px] flex-shrink-0">
                                        <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white dark:border-slate-800 aspect-[3/4.5] bg-slate-100 dark:bg-slate-800">
                                            <Image
                                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                                                alt={data.NamaPelatihan}
                                                src={replaceUrl(data.FotoPelatihan)}
                                                fill
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-center">
                                                    <p className="text-white text-xs font-black tracking-widest uppercase">Flyer Utama Aktif</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <DetailCard label="Pendaftaran Dibuka" value={generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} icon={TbCalendar} theme="blue" />
                                            <DetailCard label="Pendaftaran Ditutup" value={generateTanggalPelatihan(data.TanggalAkhirPendaftaran!)} icon={TbClock} theme="rose" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-inner h-full flex flex-col gap-3 group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                                                    <MdOutlineDescription className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deskripsi Publikasi</span>
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold tracking-tight first-letter:text-3xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-1">
                                                {data.DetailPelatihan}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 w-full bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-xl relative z-10 group-hover:rotate-6 transition-transform">
                                            <TbUserShare className="w-10 h-10" />
                                        </div>
                                    </div>
                                    <div className="text-center max-w-sm space-y-1">
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-xl">Promosi Belum Tersedia</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                                            Lengkapi flyer visual dan deskripsi naratif untuk mulai mempromosikan kelas ini di portal utama E-LAUT.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AccordionSection>
                }

                {/* Training Materials */}
                <AccordionSection value="perangkat" title="Perangkat & Modul" icon={<TbUserCode className="text-emerald-600" />} description="Kelola modul pembelajaran, bahan tayang, dan materi pendukung lainnya yang akan diakses oleh peserta.">
                    <div className="flex flex-col w-full gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
                            {
                                ((data?.StatusPenerbitan == "0" || data?.StatusPenerbitan == "1.2" || data?.StatusPenerbitan == "3") && Cookies.get('Access')?.includes('createPelatihan')) &&
                                <ChooseModulAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentData={data}
                                    onSuccess={fetchData} />
                            }
                        </div>

                        {data.ModuleMateri == "" ? (
                            <div className="py-10 w-full bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-xl relative z-10 group-hover:rotate-6 transition-transform">
                                        <TbUserCode className="w-10 h-10" />
                                    </div>
                                </div>
                                <div className="text-center max-w-sm space-y-1">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-xl">Perangkat Belum Dipilih</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                                        Silahkan mapping modul pelatihan dari Master Modul sebagai standar kompetensi pengajaran kelas ini.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl border border-blue-400/30"
                                >
                                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md uppercase font-black text-[10px] px-4 py-1.5 rounded-full">{modulPelatihan?.BidangMateriPelatihan}</Badge>
                                                <div className="h-px w-8 bg-white/30" />
                                                <span className="text-xs font-black text-blue-100 uppercase tracking-widest leading-none">TAHUN PROGRAM {modulPelatihan?.Tahun}</span>
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight max-w-3xl drop-shadow-md">{modulPelatihan?.NamaMateriPelatihan}</h3>
                                            <div className="flex items-center gap-2 text-blue-100/80 font-bold text-sm bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                                <Settings className="w-4 h-4" />
                                                <span>PRODUSEN: {modulPelatihan?.DeskripsiMateriPelatihan}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center lg:items-end bg-white/10 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md min-w-[150px]">
                                            <span className="text-[10px] font-black text-blue-100/60 uppercase tracking-[0.2em] mb-1">TOTAL UNIT MODUL</span>
                                            <span className="text-5xl font-black tabular-nums leading-none tracking-tighter">{modulPelatihan?.ModulPelatihan?.length || 0}</span>
                                        </div>
                                    </div>
                                    {/* Abstract Decorations */}
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_white/10_0%,_transparent_70%)] rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />
                                </motion.div>

                                <div className="grid grid-cols-1 gap-4">
                                    {modulPelatihan?.ModulPelatihan?.map((modul: ModulPelatihan, idx: number) => (
                                        <motion.div
                                            key={modul.IdModulPelatihan}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => toggleExpand(modul.IdModulPelatihan)}
                                            className={`group bg-white dark:bg-slate-900 rounded-[2rem] border ${expanded === modul.IdModulPelatihan ? 'border-blue-200 dark:border-blue-800 shadow-2xl shadow-blue-500/5' : 'border-slate-100 dark:border-slate-800 shadow-sm'} p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none`}
                                        >
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${expanded === modul.IdModulPelatihan ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 rotate-3' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'}`}>
                                                        <GraduationCap className="shrink-0 w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-black text-lg tracking-tight transition-colors ${expanded === modul.IdModulPelatihan ? 'text-blue-600' : 'text-slate-800 dark:text-white group-hover:text-blue-600'}`}>{modul.NamaModulPelatihan}</h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">UNIT LOKASI:</span>
                                                                <Link href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`} target="_blank" className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20">
                                                                    <Download className="w-3.5 h-3.5" /> DOWNLOAD MODUL
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${expanded === modul.IdModulPelatihan ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                    <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${expanded === modul.IdModulPelatihan ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expanded === modul.IdModulPelatihan && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid gap-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                                                                    <TbRocket className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Bahan Penunjang & Media Belajar Digital</span>
                                                            </div>

                                                            {modul.BahanTayang.length === 0 ? (
                                                                <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                                                                    <p className="text-xs text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest italic tracking-tight">Belum ada bahan tayang tambahan</p>
                                                                </div>
                                                            ) : (
                                                                <div className="grid sm:grid-cols-2 gap-4">
                                                                    {modul.BahanTayang.map((row_bt, idx) => (
                                                                        <motion.div
                                                                            key={idx}
                                                                            whileHover={{ x: 5 }}
                                                                            className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all"
                                                                        >
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
                                                                                    <FileText className="w-5 h-5" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{row_bt.NamaBahanTayang}</p>
                                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">{row_bt.CreateAt}</p>
                                                                                </div>
                                                                            </div>
                                                                            <Link
                                                                                href={row_bt.BahanTayang ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}` : row_bt.LinkVideo}
                                                                                target="_blank"
                                                                                className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100 dark:border-blue-500/20"
                                                                            >
                                                                                <TbExternalLink className="w-5 h-5" />
                                                                            </Link>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-500/20 flex items-start gap-5 shadow-inner">
                                    <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex-shrink-0 animate-bounce-slow">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    {
                                        Cookies.get('Role') == 'Pengelola UPT' && <div className="space-y-1">
                                            <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Catatan Sinkronisasi</p>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold tracking-tight italic">
                                                Penambahan perangkat belajar baru dilakukan melalui menu <span className="text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-4 cursor-pointer">MASTER MODUL</span>. Segala perubahan data media pada master akan otomatis terupdate secara realtime pada dashboard pelatihan ini.
                                            </p>
                                        </div>
                                    }

                                </div>
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* SDM - Instructors */}
                <AccordionSection value="instruktur" title="Tenaga Pelatih & Instruktur" icon={<TbUsers className="text-amber-600" />} description="Daftar tenaga pengajar ahli yang ditugaskan untuk menyampaikan materi dalam pelatihan ini.">
                    <div className="flex flex-col w-full gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
                            <ChooseInstrukturAction
                                idPelatihan={data.IdPelatihan.toString()}
                                currentData={data}
                                onSuccess={fetchData} />
                        </div>

                        {data?.Instruktur == "" ? (
                            <div className="py-10 w-full bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-xl relative z-10 group-hover:rotate-6 transition-transform">
                                        <HiOutlineUserGroup className="w-10 h-10" />
                                    </div>
                                </div>
                                <div className="text-center max-w-sm space-y-1">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-xl">Instruktur Belum Mapping</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                                        {data?.TtdSertifikat?.includes('Kepala Balai') ? 'Silahkan tentukan tim pengajar dari SDM Internal Lembaga Anda.' : 'Menunggu penunjukan tim instruktur ahli dari Manajemen Pusat.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {instrukturs?.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -8 }}
                                        className="relative group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="relative z-10 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:scale-150 transition-transform duration-500" />
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-black shadow-xl relative z-10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                                            {item.nama.charAt(0)}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white dark:border-slate-900 z-20 flex items-center justify-center pointer-events-none">
                                                            <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight group-hover:text-blue-600 transition-colors leading-tight">{item.nama}</h3>
                                                        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                                                            <TbCertificate className="w-3.5 h-3.5 text-blue-600" />
                                                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">{item.bidang_keahlian || "AHLI MATERI"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group/data">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 group-hover/data:text-blue-500 transition-colors">IDENTITAS NIP</p>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{item.nip}</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-inner group/data">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 group-hover/data:text-blue-500 transition-colors">KONTAK RESMI</p>
                                                    <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{item.no_telpon}</p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner group/meta">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-400 shadow-sm">
                                                        <TbBuildingSkyscraper className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Penugasan & Unit Kerja</p>
                                                </div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white leading-relaxed tracking-tight">{item.jenjang_jabatan}</p>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-tight">{item.eselon_1}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium italic truncate">{item.eselon_2}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Abstract Background Decoration */}
                                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Participants - Users */}
                {
                    parseInt(data?.StatusPenerbitan) < 5 &&
                    <AccordionSection value="peserta" title="Manajemen Peserta Pelatihan" icon={<TbUsers className="text-rose-600" />} description="Daftar peserta yang terdaftar dalam pelatihan. Lakukan validasi data atau import peserta baru di sini.">
                        <div className="flex flex-col w-full gap-6">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-2xl w-fit border border-slate-100 dark:border-slate-800">
                                {
                                    (data?.StatusPenerbitan == "0" || data?.StatusPenerbitan == "1.2" || data?.StatusPenerbitan == "3") &&
                                    <ImportPesertaAction
                                        idPelatihan={data?.IdPelatihan.toString()}
                                        statusApproval={data?.StatusApproval}
                                        onSuccess={fetchData}
                                        onAddHistory={(msg) =>
                                            handleAddHistoryTrainingInExisting(data!, msg, Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`)
                                        }
                                    />
                                }
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                                <ZipPhotoParticipantAction users={data?.UserPelatihan} onSuccess={fetchData} />
                                {
                                    (data?.UserPelatihan.length != 0 && countValidKeterangan(data?.UserPelatihan) < data?.UserPelatihan.length) && (
                                        <>
                                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                                            <ValidateParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                        </>
                                    )
                                }
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500"
                                >
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 leading-none">Total Peserta Terdaftar</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-5xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{data?.UserPelatihan?.length || 0}</p>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Orang</span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl border border-blue-100 dark:border-blue-500/20 shadow-xl shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            <Users className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500"
                                >
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 leading-none">Status Validasi System</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-5xl font-black text-emerald-600 tabular-nums tracking-tighter">{countValidKeterangan(data?.UserPelatihan)}</p>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">VALID</span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                                </motion.div>
                            </div>

                            <div className="relative group/table mt-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/5">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent dark:from-slate-800/20 -z-10" />
                                <div className="p-2">
                                    <UserPelatihanTable pelatihan={data} data={data?.UserPelatihan || []} onSuccess={fetchData} />
                                </div>
                            </div>
                        </div>
                    </AccordionSection>
                }
            </Accordion>
        </div>
    );
};

export default PelatihanDetail;

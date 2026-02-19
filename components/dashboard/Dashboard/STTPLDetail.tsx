"use client";

import React, { useRef } from "react";
import {
    Accordion,
} from "@/components/ui/accordion";
import AccordionSection from "@/components/reusables/AccordionSection";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import { MdLock, MdOutlineVerifiedUser, MdOutlinePhotoCamera, MdOutlineDescription } from "react-icons/md";
import Cookies from "js-cookie";
import Link from "next/link";
import { urlFileBeritaAcara, urlFileLapwas } from "@/constants/urls";
import { TbPencilCheck, TbPencilX, TbSend, TbSettings, TbLayoutGrid, TbArrowRight, TbDownload, TbPrinter, TbCertificate, TbShieldCheck, TbTimeline, TbExternalLink, TbUsers } from "react-icons/tb";
import { LuSignature } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { FaPrint } from "react-icons/fa";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import { countUserWithCertificate, countUserWithDraftCertificate, countUserWithNoStatus, countUserWithPassed } from "@/utils/counter";
import TTDeDetail from "./TTDeDetail";
import { ESELON1, ESELON_1 } from "@/constants/nomenclatures";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { downloadAndZipPDFs } from "@/utils/file";
import { FaRegFolderOpen } from "react-icons/fa6";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import { PassedParticipantAction } from "@/commons/actions/lemdiklat/PassedParticipantAction";
import HistoryButton from "@/commons/actions/HistoryButton";
import { truncateText } from "@/utils";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { Progress } from "@/components/ui/progress";
import Toast from "@/commons/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ShieldCheck, FileText, Download, Printer, Settings, ChevronRight, CheckCircle2, AlertCircle, Info, Lock } from "lucide-react";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void
}

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)
    const [isPrinting, setIsPrinting] = React.useState(false)
    const [progress, setProgress] = React.useState<number>(0);
    const [counter, setCounter] = React.useState<number>(0);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);

    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);

    if (refs.current.length !== data.UserPelatihan.length) {
        refs.current = data.UserPelatihan.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    const handleDownloadAll = async () => {
        setIsUploading(true);
        setProgress(0);

        for (let i = 0; i < refs.current.length; i++) {
            await refs.current[i].current?.downloadPdf?.();

            setProgress(((i + 1) / refs.current.length) * 100);
            setCounter(i + 1);
        }
        setIsUploading(false);
    };


    const [isZipping, setIsZipping] = React.useState(false)
    const handleDownloadZip = async () => {
        setIsZipping(true)
        try {
            await downloadAndZipPDFs(
                data.UserPelatihan,
                `(${data!.Program}) ${data!.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(data!.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data!.TanggalBerakhirPelatihan)}`,
            )
        } catch (err) {
            console.error('Download failed:', err)
        } finally {
            setIsZipping(false)
        }
    }

    return (
        <div className="w-full space-y-6 md:space-y-8 py-2 md:py-4">
            <Accordion
                type="multiple"
                className="w-full space-y-6 md:space-y-8"
                defaultValue={["meta", "peserta"]}
            >
                {/* Metadata Section */}
                <AccordionSection
                    value="meta"
                    title="Metadata & Alur Kerja Sertifikasi"
                    icon={<TbSettings className="text-blue-600" />}
                    description="Kelola metadata penerbitan, dokumen pengawasan, dan alur persetujuan STTPL digital."
                >
                    <div className="flex flex-col w-full gap-6 md:gap-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Tindakan Persetujuan</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                {
                                    Cookies.get('Access')?.includes('createPelatihan') &&
                                    <>
                                        {(data.StatusPenerbitan === "5") ? (
                                            countUserWithNoStatus(data?.UserPelatihan) == 0 ? (
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Ajukan Penerbitan STTPL"
                                                    description="Ayoo! Segera ajukan penerbitan STTPL, siapkan dokumen kelengkapan sebelum proses pengajuan!"
                                                    buttonLabel="Ajukan Penerbitan STTPL"
                                                    icon={LuSignature}
                                                    buttonColor={"blue"}
                                                    onSuccess={fetchData}
                                                    status={"6"}
                                                    pelatihan={data}
                                                />
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="h-11 md:h-12 flex items-center gap-3 rounded-[1.125rem] md:rounded-[1.25rem] px-6 md:px-8 shadow-sm transition-all border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                    onClick={() => {
                                                        Toast.fire({
                                                            icon: "warning",
                                                            title: "Lengkapi Status Peserta Terlebih Dahulu",
                                                            html: `
                                                                <ul style="text-align:left; margin-top:8px;" class="space-y-1 text-sm text-slate-600">
                                                                    ${data?.BeritaAcara === "" ? "<li>• Laporan pelaksanaan belum diupload</li>" : ""}
                                                                    ${countUserWithPassed(data?.UserPelatihan) !== data?.UserPelatihan.length ? "<li>• Kelulusan peserta belum disetujui seluruhnya</li>" : ""}
                                                                </ul>
                                                            `,
                                                        });
                                                    }}
                                                >
                                                    <LuSignature className="h-5 w-5" />
                                                    Ajukan Penerbitan STTPL
                                                </Button>
                                            )
                                        ) : null}

                                        {
                                            (data.StatusPenerbitan == "7" || data.StatusPenerbitan == "9") &&
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Kirim ke Verifikator"
                                                description="Perbaiki pengajuan penerbitan STTPL sesuai catatan Verifikator"
                                                buttonLabel="Send to Verifikator"
                                                icon={TbSend}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"6"}
                                                pelatihan={data}
                                            />
                                        }
                                    </>
                                }

                                {Cookies.get("Access")?.includes("verifyCertificate") &&
                                    data.StatusPenerbitan == "6" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Perbaikan"
                                                description="Segera melakukan verifikasi pengajuan penerbitan STTPL, kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Perbaikan Penerbitan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status="7"
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description="Segera melakukan verifikasi pengajuan penerbitan STTPL, kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="blue"
                                                onSuccess={fetchData}
                                                status={data?.TtdSertifikat.includes("Kepala Balai") ? "7A" : "8"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}

                                {Cookies.get("Access")?.includes("approveKabalai") &&
                                    data.StatusPenerbitan == "7A" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description={"Segera melakukan approval pengajuan penerbitan STTPL"}
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"7B"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}

                                {Cookies.get("Access")?.includes("approveKapus") &&
                                    data.StatusPenerbitan == "8" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description={
                                                    data?.TtdSertifikat == ESELON_1.fullName
                                                        ? "Segera melakukan approval untuk diteruskan kepada Kepala BPPSDM KP"
                                                        : "Segera melakukan approval pengajuan penerbitan STTPL"
                                                }
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={data?.TtdSertifikat == ESELON_1.fullName ? "12" : "10"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}

                                {
                                    (Cookies.get('Access')?.includes('approveKabadan') && data.StatusPenerbitan == "12") && <>
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Approve Penerbitan"
                                            description={data?.TtdSertifikat == ESELON_1.fullName ? "Segera melakukan approval untuk diteruskan kepada Kepala BPPSDM KP" : "Segera melakukan approval pengajuan penerbitan STTPL"}
                                            buttonLabel="Approve Penerbitan"
                                            icon={TbPencilCheck}
                                            buttonColor="green"
                                            onSuccess={fetchData}
                                            status={"14"}
                                            pelatihan={data}
                                        /></>
                                }
                            </div>
                        </div>

                        {/* Status Cards */}
                        <div className="w-full space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Status & Verifikasi</span>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-slate-800"></div>
                            </div>

                            {
                                data.SuratPemberitahuan == "" ?
                                    <div className="py-12 md:py-20 w-full bg-slate-50/50 dark:bg-slate-950/30 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center flex-col justify-center gap-6 md:gap-8 group">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-slate-400/10 blur-3xl rounded-full scale-150 animate-pulse" />
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-xl relative z-10">
                                                <Lock className='w-10 h-10 md:w-12 md:h-12' />
                                            </div>
                                        </div>
                                        <div className="text-center max-w-sm space-y-2 md:space-y-3">
                                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-lg md:text-xl">Tahapan Terkunci</h4>
                                            <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic px-6">
                                                Harap mengupload surat pemberitahuan pelaksanaan dan menunggu verifikasi operasional agar dapat memproses sertifikasi.
                                            </p>
                                        </div>
                                    </div> :
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Status Chip */}
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className={`flex flex-col p-6 ${color} rounded-[2.5rem] shadow-2xl shadow-blue-500/20 border border-white/20 transition-all relative overflow-hidden group`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2 relative z-10 text-white">Status Penerbitan</span>
                                            <span className="flex items-center gap-3 text-white font-black text-base relative z-10">
                                                {icon}
                                                {label}
                                            </span>
                                        </motion.div>

                                        {/* Penandatangan */}
                                        <motion.div
                                            whileHover={{ y: -5 }}
                                            className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                                                    <TbCertificate className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Penandatangan</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-snug">
                                                {data?.TtdSertifikat}
                                            </span>
                                        </motion.div>

                                        {/* Berita Acara */}
                                        {data?.BeritaAcara != "" && (
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Dokumen Penerbitan</span>
                                                </div>
                                                <Link target="_blank" href={`${urlFileBeritaAcara}/${data?.BeritaAcara}`} className="text-sm font-black text-blue-600 dark:text-blue-400 truncate hover:translate-x-1 transition-transform inline-flex items-center gap-2 underline decoration-blue-500/30 underline-offset-4">
                                                    {truncateText(data?.BeritaAcara, 15, '...')}
                                                    <TbDownload className="w-4 h-4 shrink-0" />
                                                </Link>
                                            </motion.div>
                                        )}

                                        {/* Memo Pusat / Lapwas */}
                                        {data?.MemoPusat != "" && (
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600">
                                                        <TbShieldCheck className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Pengawasan STTPL</span>
                                                </div>
                                                <Link target="_blank" href={`${urlFileLapwas}/${data?.MemoPusat}`} className="text-sm font-black text-amber-600 hover:translate-x-1 transition-transform inline-flex items-center gap-2 underline decoration-amber-500/30 underline-offset-4">
                                                    Lihat Dokumen Lapwas
                                                    <TbExternalLink className="w-4 h-4 shrink-0" />
                                                </Link>
                                            </motion.div>
                                        )}

                                        {/* Verifikator */}
                                        {adminPusatData != null && (
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verifikator</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                                    {adminPusatData.Nama}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                            }

                            {/* History Trigger */}
                            <div className="flex justify-end">
                                <HistoryButton
                                    pelatihan={data!}
                                    statusPelatihan={data?.Status ?? ""}
                                    idPelatihan={data!.IdPelatihan.toString()}
                                    handleFetchingData={fetchData}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* Signing Hub */}
                {
                    Cookies.get('Role')?.includes(data?.TtdSertifikat) && Cookies.get('Access')?.includes('isSigning') && (parseInt(data.StatusPenerbitan) >= 7 && parseInt(data.StatusPenerbitan) <= 15) && (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 rounded-[3rem] blur-2xl" />
                            <TTDeDetail data={data} fetchData={fetchData} />
                        </div>
                    )
                }

                {/* Participant Selection & STTPL Rendering */}
                {
                    !Cookies.get('Access')?.includes('isSigning') &&
                    <AccordionSection
                        value="peserta"
                        title="Daftar Peserta & Penerbitan STTPL"
                        icon={<TbUsers className="text-rose-600" />}
                        description="Pantau kelulusan peserta, hasil verifikasi data, dan kelola proses pencetakan sertifikat digital."
                    >
                        <div className="flex flex-col w-full gap-6 md:gap-8">
                            <div className="flex flex-wrap items-center gap-3">
                                {
                                    countUserWithNoStatus(data?.UserPelatihan) != 0 && <PassedParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                }

                                {countUserWithCertificate(data.UserPelatihan) == data.UserPelatihan.length && (
                                    <Button
                                        onClick={handleDownloadZip}
                                        disabled={isZipping}
                                        variant="outline"
                                        className="h-12 flex items-center gap-3 rounded-[1.25rem] px-8 shadow-sm transition-all border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>
                                            {isZipping ? 'Zipping System...' : 'Download ZIP e-STTPL'}
                                        </span>
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <MetricCard label="Target Kuota" value={data.KoutaPelatihan} color="blue" icon={<TbUsers />} />
                                <MetricCard label="Total Register" value={data.UserPelatihan.length.toString()} color="slate" icon={<TbLayoutGrid />} />
                                <MetricCard label="Kelulusan" value={`${countUserWithPassed(data.UserPelatihan)}/${data.UserPelatihan.length}`} color="emerald" icon={<TbPencilCheck />} />
                                <MetricCard label="e-STTPL Terbit" value={`${countUserWithCertificate(data?.UserPelatihan)}/${data?.UserPelatihan.length}`} color="amber" icon={<RiVerifiedBadgeFill />} />
                            </div>

                            <div className="w-full space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600">
                                            <TbLayoutGrid className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Data Tabel Peserta</h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Printing Mode Toggle can go here if needed later */}
                                    </div>
                                </div>

                                <div className="relative group/table bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/5 p-2">
                                    {isPrinting ? (
                                        <div className="space-y-6 p-6">
                                            {isUploading && (
                                                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/55 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-inner">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Generating Digital Vault...</span>
                                                        <span className="text-xs font-black text-slate-500 tabular-nums">{Math.round(progress)}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <p className="text-[11px] text-slate-500 text-center font-bold tracking-tight">Memproses {counter} dari {data.UserPelatihan.length} Berkas STTPL</p>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <Button
                                                    onClick={handleDownloadAll}
                                                    variant="outline"
                                                    disabled={isUploading}
                                                    className="h-12 flex items-center gap-3 rounded-[1.25rem] px-8 shadow-sm transition-all border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wider text-xs hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-black"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    <span>{isUploading ? 'Syncing...' : 'Download File Massal'}</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsPrinting(false)}
                                                    className="text-slate-500 font-black text-xs uppercase tracking-widest hover:text-rose-500"
                                                >
                                                    Tutup Mode Print
                                                </Button>
                                            </div>

                                            <div className="grid gap-4">
                                                {data.UserPelatihan.map((item, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-xs">
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight">{item.Nama}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold tracking-[0.1em] mt-0.5">{item.NoRegistrasi}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {item.FileSertifikat?.includes('signed') && (
                                                                <Link
                                                                    target="_blank"
                                                                    href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                >
                                                                    <RiVerifiedBadgeFill className="h-4 w-4" />
                                                                    Lihat e-STTPL
                                                                </Link>
                                                            )}
                                                            <DialogSertifikatPelatihan
                                                                ref={refs.current[i]}
                                                                pelatihan={data}
                                                                userPelatihan={item}
                                                                handleFetchingData={fetchData}
                                                                isPrint={isPrinting}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <UserPelatihanTable pelatihan={data} data={data.UserPelatihan} onSuccess={fetchData} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </AccordionSection>
                }
            </Accordion>
        </div>
    );
};

const MetricCard = ({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/10",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10",
        amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/10",
        slate: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:border-slate-700",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`flex flex-col p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group overflow-hidden relative`}
        >
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 leading-none">{label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center text-2xl border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};

export default STTPLDetail;

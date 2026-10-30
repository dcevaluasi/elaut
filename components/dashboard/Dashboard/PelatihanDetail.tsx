"use client";

import React, { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import Link from "next/link";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import {
    TbSchool, TbCalendar, TbCategory, TbClock, TbMapPin, TbRocket,
    TbSettings, TbSignature, TbTag, TbCertificate, TbBuildingSkyscraper,
    TbHierarchy, TbCash, TbUserCode, TbExternalLink, TbLayoutGrid,
    TbUsers, TbStar, TbCheck, TbLock, TbAlertCircle, TbUpload,
    TbFileText, TbUserStar, TbSend, TbChevronDown, TbChevronUp,
    TbCircleCheck, TbInfoCircle, TbDownload,
} from "react-icons/tb";
import { isMoreThanToday } from "@/utils/time";
import { countValidKeterangan } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { Badge } from "@/components/ui/badge";
import { ModulPelatihan } from "@/types/module";
import { stringToArray } from "@/utils/input";
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
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import {
    Users, FileText, GraduationCap, ShieldCheck, CheckCircle2,
    AlertCircle, Clock, Send, Trash2, Download, Lock,
    Globe, Calendar, Building, UserCheck,
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
    onSwitchToSttpl?: () => void;
}

// ─── Info Item ────────────────────────────────────────────────────────────────
const InfoItem = ({ label, value, icon: Icon }: { label: string; value?: string | number; icon: any }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {value !== undefined && value !== null && value !== "" ? String(value) : "—"}
            </p>
        </div>
    </div>
);

// ─── Step Status Types ────────────────────────────────────────────────────────
type StepState = "done" | "active" | "locked";

interface TimelineStep {
    id: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    state: StepState;
    lockReason?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PelatihanDetail: React.FC<Props> = ({ data, fetchData, onSwitchToSttpl }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan);
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan);
    const { instrukturs, fetchInstrukturData } = useFetchDataInstrukturSelected(stringToArray(data?.Instruktur));
    const { data: modulPelatihan } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri);
    const [expandedModul, setExpandedModul] = useState<number | null>(null);
    const [openSteps, setOpenSteps] = useState<number[]>([0, 1, 2, 3, 4, 5]);
    const [infoExpanded, setInfoExpanded] = useState(true);

    React.useEffect(() => { fetchInstrukturData(); }, [fetchInstrukturData]);

    const isAdmin = Cookies.get('Access')?.includes('createPelatihan');
    const isSPV = Cookies.get('Access')?.includes('supervisePelaksanaan');
    const isVerifikator = Cookies.get('Access')?.includes('verifyPelaksanaan');
    const canEdit = data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2" || data.StatusPenerbitan === "3";

    // ── Readiness checks ────────────────────────────────────────────────────
    const hasSurat = !!(data.SuratPemberitahuan && data.SuratPemberitahuan !== "");
    const hasModul = !!(data.ModuleMateri && data.ModuleMateri !== "");
    const hasInstruktur = !!(data.Instruktur && data.Instruktur !== "");
    const hasPeserta = !!(data.UserPelatihan && data.UserPelatihan.length > 0);
    const canSubmitSPV = hasSurat && hasModul && hasInstruktur && hasPeserta;

    const toggleStep = (id: number) =>
        setOpenSteps(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    // ── Step definitions ─────────────────────────────────────────────────────
    const steps: TimelineStep[] = [
        {
            id: 0,
            title: "Informasi Pelatihan",
            subtitle: "Detail, jadwal & legalitas kegiatan",
            icon: <TbInfoCircle />,
            state: "done",
        },
        {
            id: 1,
            title: "Surat Pemberitahuan",
            subtitle: hasSurat ? "Dokumen telah diunggah" : "Upload dokumen resmi kegiatan",
            icon: <TbFileText />,
            state: hasSurat ? "done" : "active",
        },
        {
            id: 2,
            title: "Perangkat Pelatihan",
            subtitle: hasModul ? `Modul dipilih` : "Pilih modul & materi pembelajaran",
            icon: <TbUserCode />,
            state: !hasSurat ? "locked" : hasModul ? "done" : "active",
            lockReason: "Upload Surat Pemberitahuan terlebih dahulu",
        },
        {
            id: 3,
            title: "Tenaga Pelatih",
            subtitle: hasInstruktur ? `${instrukturs?.length || 0} instruktur dipetakan` : "Tetapkan instruktur pengajar",
            icon: <TbUserStar />,
            state: !hasModul ? "locked" : hasInstruktur ? "done" : "active",
            lockReason: "Pilih perangkat pelatihan terlebih dahulu",
        },
        {
            id: 4,
            title: "Data Peserta",
            subtitle: hasPeserta ? `${data.UserPelatihan?.length} peserta terdaftar` : "Import & validasi peserta",
            icon: <HiOutlineUserGroup />,
            state: !hasInstruktur ? "locked" : hasPeserta ? "done" : "active",
            lockReason: "Tetapkan instruktur terlebih dahulu",
        },
        {
            id: 5,
            title: "Ajukan ke SPV",
            subtitle: canSubmitSPV
                ? (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") ? "Siap diajukan ke SPV" : "Sudah diajukan"
                : "Lengkapi semua langkah di atas",
            icon: <TbSend />,
            state: !canSubmitSPV ? "locked" : (data.StatusPenerbitan !== "0" && data.StatusPenerbitan !== "1.2") ? "done" : "active",
            lockReason: "Lengkapi semua data pelatihan terlebih dahulu",
        },
    ];

    const completedCount = steps.filter(s => s.state === "done").length;

    return (
        <div className="w-full space-y-6 py-1">

            {/* ── Action row (Edit / Delete / SPV / Verifikator actions) ────── */}
            {(isAdmin || isSPV || isVerifikator) && (
                <div className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Aksi:</span>

                    {isAdmin && (
                        <>
                            <EditPelatihanAction idPelatihan={data.IdPelatihan.toString()} currentData={data} onSuccess={fetchData} />
                            <DeletePelatihanAction idPelatihan={data.IdPelatihan.toString()} pelatihan={data} handleFetchingData={fetchData} />
                        </>
                    )}

                    {/* Kirim ke SPV */}
                    {/* {isAdmin && data.SuratPemberitahuan !== "" && (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") && (
                        data.UserPelatihan?.length !== 0 ? (
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Kirim ke SPV" description="Kirim pelaksanaan ini ke SPV untuk verifikasi" buttonLabel="Kirim ke SPV" icon={Send} buttonColor="blue" onSuccess={fetchData} status="1" pelatihan={data} />
                        ) : (
                            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-blue-200 text-blue-600 font-bold text-xs hover:bg-blue-50"
                                onClick={() => Toast.fire({ icon: "warning", title: "Lengkapi Data", text: "Pastikan peserta sudah ditambahkan sebelum mengajukan ke SPV." })}>
                                <Send className="h-3.5 w-3.5 mr-1.5" /> Kirim ke SPV
                            </Button>
                        )
                    )} */}

                    {/* Kirim ke Verifikator */}
                    {isAdmin && data.SuratPemberitahuan !== "" && data.StatusPenerbitan === "3" && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Kirim ke Verifikator" description="Kirim perbaikan ke Verifikator" buttonLabel="Kirim ke Verifikator" icon={Send} buttonColor="teal" onSuccess={fetchData} status="2" pelatihan={data} />
                    )}

                    {/* Tutup Pelatihan */}
                    {isAdmin && (data.StatusPenerbitan === "4" || data.StatusPenerbitan === "1.1") && isMoreThanToday(data.TanggalBerakhirPelatihan) && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Tutup Pelatihan" description="Tutup pelatihan dan mulai penerbitan STTPL." buttonLabel="Tutup Pelatihan" icon={Clock} buttonColor="neutral" onSuccess={fetchData} status="5" pelatihan={data} />
                    )}


                    {/* SPV Actions */}
                    {isSPV && data.StatusPenerbitan === "1" && (
                        <>
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Minta Perbaikan" description="Berikan catatan perbaikan." buttonLabel="Minta Perbaikan" icon={AlertCircle} buttonColor="rose" onSuccess={fetchData} status="1.2" pelatihan={data} />
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Pilih Verifikator" description="Tunjuk verifikator pelaksanaan." buttonLabel="Pilih Verifikator" icon={TbSettings} buttonColor="teal" onSuccess={fetchData} status="2" pelatihan={data} />
                        </>
                    )}

                    {/* Verifikator Actions */}
                    {isVerifikator && data.StatusPenerbitan === "2" && (
                        <>
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Minta Perbaikan" description="Minta perbaikan kelengkapan administrasi." buttonLabel="Minta Perbaikan" icon={Trash2} buttonColor="rose" onSuccess={fetchData} status="3" pelatihan={data} />
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Setujui Pelaksanaan" description="Setujui pelaksanaan pelatihan ini." buttonLabel="Setujui Pelaksanaan" icon={ShieldCheck} buttonColor="teal" onSuccess={fetchData} status="4" pelatihan={data} />
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

                {/* ── LEFT: Vertical Timeline ─────────────────────────────── */}
                <div className="space-y-0">
                    {/* Progress header */}
                    <div className="flex items-center justify-between mb-5 px-1">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Tahapan Persiapan</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">{completedCount} dari {steps.length} langkah selesai</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(completedCount / steps.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{Math.round((completedCount / steps.length) * 100)}%</span>
                        </div>
                    </div>

                    {/* Timeline items */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-white/[0.05]" />

                        <div className="space-y-3">
                            {steps.map((step, idx) => {
                                const isOpen = openSteps.includes(step.id);
                                const isDone = step.state === "done";
                                const isActive = step.state === "active";
                                const isLocked = step.state === "locked";

                                return (
                                    <div key={step.id} className="relative pl-16">
                                        {/* Dot */}
                                        <div className={`absolute left-3.5 top-4 w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${isDone ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : isActive ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"}`}>
                                            {isDone
                                                ? <TbCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                                : isLocked
                                                    ? <TbLock className="w-2.5 h-2.5 text-slate-400" />
                                                    : <span className="text-[9px] font-black text-white">{idx + 1}</span>}
                                        </div>

                                        {/* Card */}
                                        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isDone ? "border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10" : isActive ? "border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10 shadow-sm" : "border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/30 opacity-60"}`}>

                                            {/* Card header (always visible) */}
                                            <button
                                                type="button"
                                                onClick={() => !isLocked && toggleStep(step.id)}
                                                disabled={isLocked}
                                                className="w-full flex items-center justify-between p-4 text-left disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                                                        {step.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-xs font-black uppercase tracking-tight ${isDone ? "text-emerald-700 dark:text-emerald-400" : isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400"}`}>
                                                                {step.title}
                                                            </p>
                                                            {isDone && <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">✓ Selesai</span>}
                                                            {isActive && <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 animate-pulse">● Perlu Aksi</span>}
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{step.subtitle}</p>
                                                        {isLocked && step.lockReason && (
                                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-semibold">
                                                                <TbLock className="w-2.5 h-2.5" /> {step.lockReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {!isLocked && (
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isOpen ? "bg-slate-200 dark:bg-white/10" : "bg-slate-100 dark:bg-white/5"}`}>
                                                        {isOpen ? <TbChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <TbChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Card body */}
                                            <AnimatePresence>
                                                {isOpen && !isLocked && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/[0.04] pt-3">

                                                            {/* ── STEP 0: Full Info ──────────────────── */}
                                                            {step.id === 0 && (
                                                                <div className="space-y-4">
                                                                    <InfoSection title="Identitas & Program" icon={TbTag}>
                                                                        <InfoItem label="Kode Pelatihan" value={data.KodePelatihan} icon={TbTag} />
                                                                        <InfoItem label="Nama Pelatihan (ID)" value={data.NamaPelatihan} icon={TbSchool} />
                                                                        <InfoItem label="Nama Pelatihan (EN)" value={data.NamaPelathanInggris} icon={Globe} />
                                                                        <InfoItem label="Sektor / Jenis Program" value={data.JenisProgram} icon={TbHierarchy} />
                                                                        <InfoItem label="Klaster / Bidang" value={data.BidangPelatihan} icon={TbCategory} />
                                                                        <InfoItem label="Program Utama" value={data.Program} icon={TbRocket} />
                                                                        <InfoItem label="Program Terobosan KKP" value={data.DukunganProgramTerobosan} icon={TbStar} />
                                                                    </InfoSection>

                                                                    <InfoSection title="Jadwal Pelaksanaan" icon={TbCalendar}>
                                                                        <InfoItem label="Tanggal Mulai" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} icon={TbCalendar} />
                                                                        <InfoItem label="Tanggal Selesai" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} icon={TbClock} />
                                                                        <InfoItem label="Mulai Pendaftaran" value={data.TanggalMulaiPendaftaran ? generateTanggalPelatihan(data.TanggalMulaiPendaftaran) : "-"} icon={TbCalendar} />
                                                                        <InfoItem label="Tutup Pendaftaran" value={data.TanggalAkhirPendaftaran ? generateTanggalPelatihan(data.TanggalAkhirPendaftaran!) : "-"} icon={TbClock} />
                                                                    </InfoSection>

                                                                    <InfoSection title="Penyelenggara & Pembiayaan" icon={TbBuildingSkyscraper}>
                                                                        <InfoItem label="Lembaga Penyelenggara" value={data.PenyelenggaraPelatihan} icon={TbBuildingSkyscraper} />
                                                                        <InfoItem label="Lokasi Pelaksanaan" value={data.LokasiPelatihan} icon={TbMapPin} />
                                                                        <InfoItem label="Metode Pelaksanaan" value={data.PelaksanaanPelatihan} icon={TbSchool} />
                                                                        <InfoItem label="Sumber Pembiayaan" value={data.JenisPelatihan} icon={TbCash} />
                                                                        {data.JenisPelatihan === JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && (
                                                                            <InfoItem label="Biaya / Peserta" value={`Rp ${data.HargaPelatihan?.toLocaleString()}`} icon={TbCash} />
                                                                        )}
                                                                        <InfoItem label="Kuota Peserta" value={data.KoutaPelatihan ? `${data.KoutaPelatihan} Orang` : "-"} icon={Users} />
                                                                    </InfoSection>

                                                                    <InfoSection title="Legalitas & Sertifikasi" icon={TbCertificate}>
                                                                        <InfoItem label="Penandatangan Sertifikat" value={data.TtdSertifikat} icon={TbSignature} />
                                                                        <InfoItem label="Dibuat Pada" value={data.CreateAt ? generateTanggalPelatihan(data.CreateAt) : "-"} icon={Calendar} />
                                                                    </InfoSection>
                                                                </div>
                                                            )}

                                                            {/* ── STEP 1: Surat Pemberitahuan ───────── */}
                                                            {step.id === 1 && (
                                                                <div className="space-y-3">
                                                                    <div className={`p-4 rounded-xl border ${hasSurat ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30"}`}>
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hasSurat ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
                                                                                <TbFileText className="w-5 h-5" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                                                    {hasSurat ? "Surat Pemberitahuan telah diunggah" : "Surat Pemberitahuan belum diunggah"}
                                                                                </p>
                                                                                {hasSurat && (
                                                                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{data.SuratPemberitahuan}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {isAdmin && (
                                                                            <UploadSuratButton
                                                                                idPelatihan={String(data.IdPelatihan)}
                                                                                pelatihan={data}
                                                                                handleFetchingData={fetchData}
                                                                            />
                                                                        )}
                                                                        {hasSurat && (
                                                                            <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data.SuratPemberitahuan}`}
                                                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm">
                                                                                <FileText className="w-3.5 h-3.5" /> Lihat Surat
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* ── STEP 2: Perangkat Pelatihan ───────── */}
                                                            {step.id === 2 && (
                                                                <div className="space-y-3">
                                                                    {canEdit && isAdmin && (
                                                                        <ChooseModulAction idPelatihan={data.IdPelatihan.toString()} currentData={data} onSuccess={fetchData} />
                                                                    )}
                                                                    {!hasModul ? (
                                                                        <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                                                            <TbUserCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                                            <p className="text-xs font-bold text-slate-400">Modul pelatihan belum dipilih</p>
                                                                            <p className="text-[11px] text-slate-300 mt-1">Pilih paket modul menggunakan tombol di atas</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                                                                            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                                                <div>
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{modulPelatihan?.BidangMateriPelatihan} • {modulPelatihan?.Tahun}</p>
                                                                                    <p className="text-xs font-black text-slate-800 dark:text-white">{modulPelatihan?.NamaMateriPelatihan}</p>
                                                                                </div>
                                                                                <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none text-xs">
                                                                                    {modulPelatihan?.ModulPelatihan?.length || 0} Modul
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                                                {modulPelatihan?.ModulPelatihan?.map((modul: ModulPelatihan) => (
                                                                                    <div key={modul.IdModulPelatihan} className="p-3">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{modul.NamaModulPelatihan}</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Link href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`} target="_blank" className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                                                                                    <Download className="w-3 h-3" /> Modul
                                                                                                </Link>
                                                                                                <button type="button" onClick={() => setExpandedModul(expandedModul === modul.IdModulPelatihan ? null : modul.IdModulPelatihan)} className="text-slate-400 hover:text-slate-600 p-0.5">
                                                                                                    <TbChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedModul === modul.IdModulPelatihan ? "rotate-180" : ""}`} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        {expandedModul === modul.IdModulPelatihan && modul.BahanTayang?.map((bt, i) => (
                                                                                            <div key={i} className="ml-5 mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                                                                                                <span>• {bt.NamaBahanTayang}</span>
                                                                                                <Link href={bt.BahanTayang ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${bt.BahanTayang}` : bt.LinkVideo} target="_blank" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                                                                                    Lihat <TbExternalLink className="w-3 h-3" />
                                                                                                </Link>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* ── STEP 3: Instruktur ────────────────── */}
                                                            {step.id === 3 && (
                                                                <div className="space-y-3">
                                                                    <ChooseInstrukturAction idPelatihan={data.IdPelatihan.toString()} currentData={data} onSuccess={fetchData} />
                                                                    {!hasInstruktur ? (
                                                                        <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                                                            <TbUserStar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                                            <p className="text-xs font-bold text-slate-400">Instruktur belum dipetakan</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                                                            {instrukturs?.map((item, idx) => (
                                                                                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                                                                                    <div className="flex items-center gap-2.5">
                                                                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                                                                                            {item.nama.charAt(0)}
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-xs font-black text-slate-800 dark:text-white">{item.nama}</p>
                                                                                            <p className="text-[10px] text-slate-400">{item.jenjang_jabatan} · {item.eselon_1}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-none text-[10px]">
                                                                                        {item.bidang_keahlian || "Instruktur"}
                                                                                    </Badge>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* ── STEP 4: Peserta ───────────────────── */}
                                                            {step.id === 4 && parseInt(data?.StatusPenerbitan) < 5 && (
                                                                <div className="space-y-3">
                                                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
                                                                        <div className="flex items-center gap-2">
                                                                            {canEdit && (
                                                                                <ImportPesertaAction
                                                                                    idPelatihan={data.IdPelatihan.toString()}
                                                                                    statusApproval={data.StatusApproval}
                                                                                    onSuccess={fetchData}
                                                                                    onAddHistory={(msg) => handleAddHistoryTrainingInExisting(data!, msg, Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`)}
                                                                                />
                                                                            )}
                                                                            <ZipPhotoParticipantAction users={data.UserPelatihan} onSuccess={fetchData} />
                                                                            {data.UserPelatihan?.length !== 0 && countValidKeterangan(data.UserPelatihan) < data.UserPelatihan?.length && (
                                                                                <ValidateParticipantAction data={data.UserPelatihan} onSuccess={fetchData} />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                                            <span>Total: <strong className="text-blue-600">{data.UserPelatihan?.length || 0}</strong></span>
                                                                            <span className="text-slate-300">|</span>
                                                                            <span>Valid: <strong className="text-emerald-600">{countValidKeterangan(data.UserPelatihan)}</strong></span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                                                                        <UserPelatihanTable pelatihan={data} data={data.UserPelatihan || []} onSuccess={fetchData} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* ── STEP 5: Ajukan ke SPV ────────────── */}
                                                            {step.id === 5 && (
                                                                <div className="space-y-3">
                                                                    {/* Checklist */}
                                                                    <div className="space-y-2">
                                                                        {[
                                                                            { label: "Surat Pemberitahuan diunggah", done: hasSurat },
                                                                            { label: "Perangkat / modul dipilih", done: hasModul },
                                                                            { label: "Instruktur ditetapkan", done: hasInstruktur },
                                                                            { label: "Peserta pelatihan diimpor", done: hasPeserta },
                                                                        ].map((item, i) => (
                                                                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.done ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30" : "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30"}`}>
                                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-500" : "bg-rose-400"}`}>
                                                                                    {item.done ? <TbCheck className="w-3 h-3 text-white" /> : <TbAlertCircle className="w-3 h-3 text-white" />}
                                                                                </div>
                                                                                <span className={`text-xs font-bold ${item.done ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{item.label}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {isAdmin && (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") && canSubmitSPV && (
                                                                        <SendNoteAction
                                                                            idPelatihan={data.IdPelatihan.toString()}
                                                                            title="Kirim ke SPV"
                                                                            description="Ajukan pelaksanaan ke SPV untuk diverifikasi."
                                                                            buttonLabel="Ajukan ke SPV Sekarang"
                                                                            icon={Send}
                                                                            buttonColor="blue"
                                                                            onSuccess={fetchData}
                                                                            status="1"
                                                                            pelatihan={data}
                                                                        />
                                                                    )}

                                                                    {!canSubmitSPV && (
                                                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold text-center py-2">
                                                                            Lengkapi semua langkah di atas sebelum mengajukan ke SPV.
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Sidebar ────────────────────────────────────── */}
                <div className="space-y-4 lg:sticky lg:top-24">

                    {/* Readiness Summary Card */}
                    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TbCircleCheck className="text-blue-500 w-4 h-4" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">Kesiapan Kelas</h3>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: "Surat Pemberitahuan", done: hasSurat },
                                { label: "Perangkat Pelatihan", done: hasModul },
                                { label: "Tenaga Pelatih", done: hasInstruktur },
                                { label: "Data Peserta", done: hasPeserta },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.done ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                                        {item.done ? "✓ Ada" : "Belum"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-slate-500">Progress</span>
                                <span className="font-black text-slate-700 dark:text-white">{[hasSurat, hasModul, hasInstruktur, hasPeserta].filter(Boolean).length}/4</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${([hasSurat, hasModul, hasInstruktur, hasPeserta].filter(Boolean).length / 4) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Peserta</p>
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{data.UserPelatihan?.length || 0}</p>
                            <p className="text-[10px] text-blue-500 mt-0.5">Terdaftar</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Valid</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{countValidKeterangan(data.UserPelatihan)}</p>
                            <p className="text-[10px] text-emerald-500 mt-0.5">Terverifikasi</p>
                        </div>
                    </div>

                    {/* Promosi & Publikasi */}
                    {isAdmin && (
                        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TbLayoutGrid className="text-indigo-500 w-4 h-4" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">Publikasi Portal</h3>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <EditPublishAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentDetail={data.DetailPelatihan}
                                    currentFoto={data.FotoPelatihan}
                                    tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                    currentData={data}
                                    onSuccess={fetchData}
                                />
                                {data.FotoPelatihan !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && (
                                    <PublishButton
                                        title={data.Status === "Publish" ? "Take Down" : "Publish"}
                                        statusPelatihan={data.Status ?? ""}
                                        idPelatihan={data.IdPelatihan.toString()}
                                        handleFetchingData={fetchData}
                                    />
                                )}
                            </div>
                            {data.FotoPelatihan !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? (
                                <div className="flex gap-3">
                                    <div className="w-16 h-20 rounded-xl overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-800">
                                        <Image className="object-cover" alt={data.NamaPelatihan} src={replaceUrl(data.FotoPelatihan)} fill />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deskripsi:</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 font-medium">{data.DetailPelatihan || "Belum ada deskripsi."}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[11px] text-slate-400 italic text-center py-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    Flyer & deskripsi belum diatur
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── InfoSection helper ───────────────────────────────────────────────────────
function InfoSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-100 dark:border-white/[0.04] bg-white dark:bg-slate-900/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/70 dark:bg-white/[0.02]">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h4>
            </div>
            <div className="px-4 py-1">{children}</div>
        </div>
    );
}

export default PelatihanDetail;

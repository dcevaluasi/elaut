"use client";

import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo, splitCityAndDate } from "@/utils/text";
import Cookies from "js-cookie";
import Link from "next/link";
import { urlFileBeritaAcara, urlFileLapwas } from "@/constants/urls";
import {
    TbPencilCheck, TbPencilX, TbSend, TbSettings, TbDownload,
    TbCertificate, TbShieldCheck, TbUsers, TbFileText,
    TbCheck, TbLock, TbChevronDown, TbChevronUp, TbCircleCheck,
    TbFileSpreadsheet, TbSignature, TbClipboardCheck, TbRocket,
    TbAlertCircle, TbExternalLink,
} from "react-icons/tb";
import { LuSignature } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import {
    countUserWithCertificate, countUserWithNoStatus, countUserWithPassed,
} from "@/utils/counter";
import TTDeDetail from "./TTDeDetail";
import { ESELON_1 } from "@/constants/nomenclatures";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { downloadAndZipPDFs } from "@/utils/file";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import { PassedParticipantAction } from "@/commons/actions/lemdiklat/PassedParticipantAction";
import { truncateText } from "@/utils";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { Progress } from "@/components/ui/progress";
import Toast from "@/commons/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, FileText, Download, Printer, CheckCircle2,
    Lock, Award, Users, FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
}

type StepState = "done" | "active" | "locked";

// ─── Small helper ─────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 shrink-0 mt-0.5">{label}</p>
        <p className="text-xs font-bold text-slate-800 dark:text-white min-w-0 flex-1">{value || "—"}</p>
    </div>
);

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan);
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [progress, setProgress] = React.useState<number>(0);
    const [counter, setCounter] = React.useState<number>(0);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);
    const [isZipping, setIsZipping] = React.useState(false);
    const [openSteps, setOpenSteps] = React.useState<number[]>([0, 1, 2, 3, 4]);

    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);
    if (refs.current.length !== data.UserPelatihan.length) {
        refs.current = data.UserPelatihan.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    const toggleStep = (id: number) =>
        setOpenSteps(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    // ── Derived state ─────────────────────────────────────────────────────────
    const statusNum = parseFloat(data.StatusPenerbitan) || 0;
    const totalPeserta = data.UserPelatihan.length;
    const allPassed = countUserWithNoStatus(data.UserPelatihan) === 0 && totalPeserta > 0;
    const passedCount = countUserWithPassed(data.UserPelatihan);
    const certCount = countUserWithCertificate(data.UserPelatihan);
    const allCertified = certCount === totalPeserta && totalPeserta > 0;
    const inSigningFlow = ["7A", "7B", "7C", "7D", "8", "9", "10", "11", "12", "13", "14", "15"].includes(data.StatusPenerbitan);
    const signingDone = ["7C", "10", "14"].includes(data.StatusPenerbitan) || allCertified;
    const isSttplSubmitted = statusNum >= 6;
    const isVerified = statusNum > 6;

    const isAdmin = Cookies.get('Access')?.includes('createPelatihan');
    const isVerifikator = Cookies.get('Access')?.includes('verifyCertificate');
    const isKabalai = Cookies.get('Access')?.includes('approveKabalai');
    const isKapus = Cookies.get('Access')?.includes('approveKapus');
    const isKabadan = Cookies.get('Access')?.includes('approveKabadan');
    const isSigning = Cookies.get('Access')?.includes('isSigning');

    // ── Utilities ─────────────────────────────────────────────────────────────
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

    const handleDownloadZip = async () => {
        setIsZipping(true);
        try {
            await downloadAndZipPDFs(
                data.UserPelatihan,
                `(${data.Program}) ${data.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(data.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}`,
            );
        } catch (err) { console.error(err); }
        finally { setIsZipping(false); }
    };

    const handleDownloadExcel = () => {
        const rows = data.UserPelatihan.map((item, idx) => {
            let tempatLahir = (item as any).TempatLahir ?? "-";
            let tanggalLahir = (item as any).TanggalLahir ?? "-";
            if (item.TempatTanggalLahir) {
                try {
                    const result = splitCityAndDate(item.TempatTanggalLahir);
                    if (result.city && result.city !== "-") tempatLahir = result.city;
                    if (result.date && result.date !== "-") tanggalLahir = result.date;
                } catch {
                    const commaMatch = item.TempatTanggalLahir.match(/^([^,]+),?\s*(.*)$/);
                    if (commaMatch?.[2]) { tempatLahir = commaMatch[1].trim(); tanggalLahir = commaMatch[2].trim(); }
                    else { tempatLahir = item.TempatTanggalLahir; }
                }
            }
            return {
                No: idx + 1,
                Nama: item.Nama ?? (item as any).User?.Nama ?? "-",
                NIK: (item as any).Nik ?? (item as any).User?.Nik ?? "-",
                "No Telpon": (item as any).NoTelpon ?? (item as any).User?.NoTelpon ?? "-",
                "Kabupaten / Kota": (item as any).Kota ?? (item as any).Kabupaten ?? "-",
                Provinsi: item.Provinsi ?? (item as any).User?.Provinsi ?? "-",
                Alamat: (item as any).Alamat ?? (item as any).User?.Alamat ?? "-",
                "Tempat Lahir": tempatLahir,
                "Tanggal Lahir": tanggalLahir,
                "Jenis Kelamin": item.JenisKelamin ?? "-",
                "Pendidikan Terakhir": item.PendidikanTerakhir ?? "-",
                "No STTPL": item.NoRegistrasi ?? (item as any).NoSertifikat ?? "-",
                "Link File STTPL": item.FileSertifikat ? `https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}` : "-",
            };
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 6 }, { wch: 35 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 40 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 30 }, { wch: 65 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Peserta STTPL");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), `Daftar_Peserta_STTPL_${data.NamaPelatihan ?? "Pelatihan"}.xlsx`);
        Toast.fire({ icon: "success", title: "Berhasil!", text: "File Excel berhasil diunduh." });
    };

    // ── Timeline steps ────────────────────────────────────────────────────────
    interface SttplStep { id: number; title: string; subtitle: string; icon: React.ReactNode; state: StepState; lockReason?: string; }
    const steps: SttplStep[] = [
        {
            id: 0, icon: <TbClipboardCheck />,
            title: "Kelulusan Peserta",
            subtitle: allPassed ? `${passedCount} peserta telah diverifikasi kelulusannya` : `${countUserWithNoStatus(data.UserPelatihan)} peserta belum ditentukan kelulusannya`,
            state: allPassed ? "done" : "active",
        },
        {
            id: 1, icon: <LuSignature />,
            title: "Ajukan Penerbitan STTPL",
            subtitle: isSttplSubmitted ? "Pengajuan telah dikirim" : allPassed ? "Siap diajukan ke Pusat" : "Verifikasi kelulusan peserta terlebih dahulu",
            state: isSttplSubmitted ? "done" : allPassed ? "active" : "locked",
            lockReason: "Semua peserta harus ditentukan kelulusannya",
        },
        {
            id: 2, icon: <TbShieldCheck />,
            title: "Verifikasi Pusat",
            subtitle: isVerified ? "Telah diverifikasi Pusat" : data.StatusPenerbitan === "6" ? "Menunggu verifikasi Pusat" : "Belum diajukan",
            state: isVerified ? "done" : data.StatusPenerbitan === "6" ? "active" : "locked",
            lockReason: "Ajukan penerbitan STTPL terlebih dahulu",
        },
        {
            id: 3, icon: <TbSignature />,
            title: "Penandatanganan Digital (BSrE)",
            subtitle: signingDone ? "Proses penandatanganan selesai" : inSigningFlow ? `Status: ${getStatusInfo(data.StatusPenerbitan).label}` : "Menunggu verifikasi Pusat",
            state: signingDone ? "done" : inSigningFlow ? "active" : "locked",
            lockReason: "Verifikasi Pusat harus selesai lebih dahulu",
        },
        {
            id: 4, icon: <TbCertificate />,
            title: "e-STTPL Terbit",
            subtitle: allCertified ? `Semua ${totalPeserta} e-STTPL telah terbit` : signingDone ? `${certCount} dari ${totalPeserta} e-STTPL terbit` : "Proses penandatanganan belum selesai",
            state: allCertified ? "done" : signingDone ? "active" : "locked",
            lockReason: "Penandatanganan BSrE harus selesai lebih dahulu",
        },
    ];

    const completedCount = steps.filter(s => s.state === "done").length;

    return (
        <div className="w-full space-y-6 py-1">

            {/* ── Action Row ──────────────────────────────────────────────── */}
            {(isAdmin || isVerifikator || isKabalai || isKapus || isKabadan) && (
                <div className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Aksi:</span>


                    {/* Re-ajukan ke Verifikator */}
                    {isAdmin && (data.StatusPenerbitan === "7" || data.StatusPenerbitan === "9") && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Kirim ke Verifikator" description="Perbaiki pengajuan penerbitan STTPL" buttonLabel="Kirim ke Verifikator" icon={TbSend} buttonColor="teal" onSuccess={fetchData} status="6" pelatihan={data} />
                    )}

                    {/* Verifikator actions */}
                    {isVerifikator && data.StatusPenerbitan === "6" && (
                        <>
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Perbaikan" description="Berikan catatan perbaikan" buttonLabel="Perbaikan Penerbitan" icon={TbPencilX} buttonColor="rose" onSuccess={fetchData} status="7" pelatihan={data} />
                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Approve Penerbitan" description="Setujui pengajuan penerbitan STTPL" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="blue" onSuccess={fetchData} status={data.TtdSertifikat.includes("Kepala Balai") ? "7A" : "8"} pelatihan={data} />
                        </>
                    )}

                    {/* Kabalai */}
                    {isKabalai && data.StatusPenerbitan === "7A" && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Approve Penerbitan" description="Approval pengajuan penerbitan STTPL" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="teal" onSuccess={fetchData} status="7B" pelatihan={data} />
                    )}

                    {/* Kapus */}
                    {isKapus && data.StatusPenerbitan === "8" && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Approve Penerbitan" description={data.TtdSertifikat === ESELON_1.fullName ? "Diteruskan ke Kabadan" : "Approval penerbitan STTPL"} buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="teal" onSuccess={fetchData} status={data.TtdSertifikat === ESELON_1.fullName ? "12" : "10"} pelatihan={data} />
                    )}

                    {/* Kabadan */}
                    {isKabadan && data.StatusPenerbitan === "12" && (
                        <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Approve Penerbitan" description="Approval penerbitan STTPL Kepala BPPSDM KP" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="green" onSuccess={fetchData} status="14" pelatihan={data} />
                    )}
                </div>
            )}

            {/* TTDe block for active signers */}
            {Cookies.get('Role')?.includes(data?.TtdSertifikat) && isSigning && (parseInt(data.StatusPenerbitan) >= 7 && parseInt(data.StatusPenerbitan) <= 15) && (
                <div className="relative group">
                    <TTDeDetail data={data} fetchData={fetchData} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                {/* ── LEFT: Vertical Timeline ────────────────────────────── */}
                <div>
                    {/* Progress header */}
                    <div className="flex items-center justify-between mb-5 px-1">
                        <div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Tahapan Penerbitan e-STTPL</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">{completedCount} dari {steps.length} tahap selesai</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(completedCount / steps.length) * 100}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-600 dark:text-slate-300">{Math.round((completedCount / steps.length) * 100)}%</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
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
                                        <div className={`absolute left-3.5 top-4 w-5 h-5 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${isDone ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : isActive ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-500/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"}`}>
                                            {isDone ? <TbCheck className="w-3 h-3 text-white" strokeWidth={3} />
                                                : isLocked ? <TbLock className="w-2.5 h-2.5 text-slate-400" />
                                                    : <span className="text-[9px] font-black text-white">{idx + 1}</span>}
                                        </div>

                                        {/* Card */}
                                        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isDone ? "border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/10" : isActive ? "border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/10 shadow-sm" : "border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-900/30 opacity-60"}`}>

                                            {/* Card header */}
                                            <button type="button" onClick={() => !isLocked && toggleStep(step.id)} disabled={isLocked} className="w-full flex items-center justify-between p-4 text-left disabled:cursor-not-allowed">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                                                        {step.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-xs font-black uppercase tracking-tight ${isDone ? "text-emerald-700 dark:text-emerald-400" : isActive ? "text-indigo-700 dark:text-indigo-400" : "text-slate-400"}`}>
                                                                {step.title}
                                                            </p>
                                                            {isDone && <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">✓ Selesai</span>}
                                                            {isActive && <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 animate-pulse">● Berlangsung</span>}
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
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                        <div className="px-4 pb-4 border-t border-slate-100 dark:border-white/[0.04] pt-3 space-y-3">

                                                            {/* ── STEP 0: Kelulusan Peserta ─────────── */}
                                                            {step.id === 0 && (
                                                                <div className="space-y-3">
                                                                    {/* Metadata row */}
                                                                    {(data.TtdSertifikat || data.BeritaAcara || data.MemoPusat || adminPusatData) && (
                                                                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                                            {data.TtdSertifikat && <InfoRow label="Penandatangan" value={data.TtdSertifikat} />}
                                                                            {adminPusatData && <InfoRow label="Verifikator" value={adminPusatData.Nama} />}
                                                                            {data.BeritaAcara && (
                                                                                <div className="flex items-center gap-2 py-2 border-b border-slate-100 dark:border-white/[0.04]">
                                                                                    <p className="text-[10px] font-black uppercase text-slate-400 w-32 shrink-0">Berita Acara</p>
                                                                                    <Link target="_blank" href={`${urlFileBeritaAcara}/${data.BeritaAcara}`} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                                                                        <TbFileText className="w-3.5 h-3.5" /> {truncateText(data.BeritaAcara, 15, "...")}
                                                                                    </Link>
                                                                                </div>
                                                                            )}
                                                                            {data.MemoPusat && (
                                                                                <div className="flex items-center gap-2 py-2">
                                                                                    <p className="text-[10px] font-black uppercase text-slate-400 w-32 shrink-0">Memo Lapwas</p>
                                                                                    <Link target="_blank" href={`${urlFileLapwas}/${data.MemoPusat}`} className="text-xs font-bold text-amber-600 flex items-center gap-1 hover:underline">
                                                                                        <TbShieldCheck className="w-3.5 h-3.5" /> Dokumen Lapwas
                                                                                    </Link>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* PassedParticipant action */}
                                                                    {countUserWithNoStatus(data.UserPelatihan) !== 0 && !isSigning && (
                                                                        <PassedParticipantAction data={data.UserPelatihan} onSuccess={fetchData} />
                                                                    )}

                                                                    {/* Checklist */}
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {[
                                                                            { label: "Total Peserta", val: totalPeserta, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30" },
                                                                            { label: "Peserta Lulus", val: passedCount, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30" },
                                                                            { label: "Belum Ditentukan", val: countUserWithNoStatus(data.UserPelatihan), color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30" },
                                                                            { label: "e-STTPL Terbit", val: certCount, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30" },
                                                                        ].map((m, i) => (
                                                                            <div key={i} className={`rounded-xl border p-3 ${m.color}`}>
                                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">{m.label}</p>
                                                                                <p className="text-2xl font-black tabular-nums">{m.val}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* ── STEP 1: Ajukan STTPL ──────────────── */}
                                                            {step.id === 1 && (
                                                                <div className="space-y-3">
                                                                    {[
                                                                        { label: "Semua peserta ditentukan kelulusannya", done: allPassed },
                                                                        { label: "Status pelatihan: Pelaporan Penyelenggaraan (Stage 5)", done: data.StatusPenerbitan === "5" || isSttplSubmitted },
                                                                    ].map((c, i) => (
                                                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${c.done ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30" : "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30"}`}>
                                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.done ? "bg-emerald-500" : "bg-rose-400"}`}>
                                                                                {c.done ? <TbCheck className="w-3 h-3 text-white" /> : <TbAlertCircle className="w-3 h-3 text-white" />}
                                                                            </div>
                                                                            <span className={`text-xs font-bold ${c.done ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{c.label}</span>
                                                                        </div>
                                                                    ))}

                                                                    {isSttplSubmitted ? (
                                                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                                                            <TbCircleCheck className="w-4 h-4" /> Pengajuan telah dikirim ke Pusat
                                                                        </div>
                                                                    ) : allPassed ? (
                                                                        countUserWithNoStatus(data.UserPelatihan) === 0 ? (
                                                                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Ajukan Penerbitan STTPL" description="Ajukan penerbitan STTPL untuk pelatihan ini." buttonLabel="Ajukan Penerbitan STTPL Sekarang" icon={LuSignature} buttonColor="blue" onSuccess={fetchData} status="6" pelatihan={data} />
                                                                        ) : null
                                                                    ) : (
                                                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold text-center py-2">Lengkapi kelulusan peserta terlebih dahulu</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* ── STEP 2: Verifikasi Pusat ──────────── */}
                                                            {step.id === 2 && (
                                                                <div className="space-y-3">
                                                                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${data.StatusPenerbitan === "6" ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30" : isVerified ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30" : "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"}`}>
                                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${data.StatusPenerbitan === "6" ? "bg-amber-400 text-white" : isVerified ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-500"}`}>
                                                                            <TbShieldCheck className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                                                                                {data.StatusPenerbitan === "6" ? "Menunggu verifikasi Pusat BPPSDM KP" : isVerified ? "Verifikasi Pusat selesai" : "—"}
                                                                            </p>
                                                                            {adminPusatData && <p className="text-[11px] text-slate-500 mt-0.5">Verifikator: {adminPusatData.Nama}</p>}
                                                                        </div>
                                                                    </div>
                                                                    {/* Verifikator actions inline */}
                                                                    {isVerifikator && data.StatusPenerbitan === "6" && (
                                                                        <div className="flex gap-2">
                                                                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Perbaikan" description="Berikan catatan perbaikan" buttonLabel="Minta Perbaikan" icon={TbPencilX} buttonColor="rose" onSuccess={fetchData} status="7" pelatihan={data} />
                                                                            <SendNoteAction idPelatihan={data.IdPelatihan.toString()} title="Approve" description="Setujui pengajuan penerbitan STTPL" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="blue" onSuccess={fetchData} status={data.TtdSertifikat.includes("Kepala Balai") ? "7A" : "8"} pelatihan={data} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* ── STEP 3: Penandatanganan BSrE ─────── */}
                                                            {step.id === 3 && (
                                                                <div className="space-y-3">
                                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                                        <InfoRow label="Penandatangan" value={data.TtdSertifikat} />
                                                                        <InfoRow label="Status BSrE" value={getStatusInfo(data.StatusPenerbitan).label} />
                                                                    </div>
                                                                    {signingDone && (
                                                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                                                            <TbCheck className="w-4 h-4" /> Penandatanganan BSrE selesai
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* ── STEP 4: e-STTPL Terbit ────────────── */}
                                                            {step.id === 4 && !isSigning && (
                                                                <div className="space-y-3">
                                                                    {/* Toolbar */}
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button variant="ghost" size="sm" onClick={() => setIsPrinting(!isPrinting)} className="h-8 px-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600">
                                                                            <Printer className="w-3.5 h-3.5 mr-1" /> {isPrinting ? "Kembali ke Tabel" : "Mode Cetak Massal"}
                                                                        </Button>
                                                                        {allCertified && (
                                                                            <Button onClick={handleDownloadZip} disabled={isZipping} variant="outline" size="sm" className="h-8 px-3 rounded-xl border-indigo-200 text-indigo-600 font-bold text-xs hover:bg-indigo-50">
                                                                                <Download className="h-3.5 w-3.5 mr-1" />{isZipping ? "Membentuk ZIP..." : "Download ZIP e-STTPL"}
                                                                            </Button>
                                                                        )}
                                                                        {(["11", "15"].includes(data.StatusPenerbitan)) && totalPeserta > 0 && (
                                                                            <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="h-8 px-3 rounded-xl border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-50 gap-1.5">
                                                                                <TbFileSpreadsheet className="h-4 w-4" /> Download Excel
                                                                            </Button>
                                                                        )}
                                                                    </div>

                                                                    {/* Table / Print view */}
                                                                    {isPrinting ? (
                                                                        <div className="space-y-3">
                                                                            {isUploading && (
                                                                                <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border">
                                                                                    <div className="flex justify-between text-xs">
                                                                                        <span className="font-bold text-blue-600 uppercase">Mengunduh e-STTPL...</span>
                                                                                        <span className="font-mono font-bold text-slate-600">{Math.round(progress)}%</span>
                                                                                    </div>
                                                                                    <Progress value={progress} className="h-2 rounded-full" />
                                                                                    <p className="text-[10px] text-slate-400 text-center">Memproses {counter} dari {totalPeserta} berkas</p>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex items-center justify-between">
                                                                                <Button onClick={handleDownloadAll} size="sm" disabled={isUploading} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold">
                                                                                    <Printer className="h-3.5 w-3.5 mr-1.5" />{isUploading ? "Proses Unduh..." : "Download Cetak Massal"}
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" onClick={() => setIsPrinting(false)} className="text-xs font-bold text-slate-500 hover:text-rose-500">Tutup Mode Print</Button>
                                                                            </div>
                                                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                                                {data.UserPelatihan.map((item, i) => (
                                                                                    <div key={i} className="py-2.5 flex flex-col items-center justify-between text-xs gap-3">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                                                                                            <div>
                                                                                                <p className="font-black text-slate-900 dark:text-white uppercase">{item.Nama}</p>
                                                                                                <p className="text-[10px] text-slate-400">{item.NoRegistrasi}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2 w-full">
                                                                                            {item.FileSertifikat?.includes('signed') && (
                                                                                                <Link target="_blank" href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`} className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg text-[10px] font-bold hover:underline">
                                                                                                    <RiVerifiedBadgeFill className="h-3.5 w-3.5" /> e-STTPL
                                                                                                </Link>
                                                                                            )}
                                                                                            <DialogSertifikatPelatihan ref={refs.current[i]} pelatihan={data} userPelatihan={item} handleFetchingData={fetchData} isPrint={isPrinting} />
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                                                                            <UserPelatihanTable pelatihan={data} data={data.UserPelatihan} onSuccess={fetchData} />
                                                                        </div>
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

                {/* ── RIGHT: Sidebar ─────────────────────────────────────── */}
                <div className="space-y-4 lg:sticky lg:top-24">

                    {/* Progress card */}
                    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TbCircleCheck className="text-indigo-500 w-4 h-4" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-white">Status Penerbitan</h3>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: "Kelulusan Peserta", done: allPassed },
                                { label: "Pengajuan STTPL", done: isSttplSubmitted },
                                { label: "Verifikasi Pusat", done: isVerified },
                                { label: "Penandatanganan BSrE", done: signingDone },
                                { label: "e-STTPL Terbit", done: allCertified },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.done ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>
                                        {item.done ? "✓ Selesai" : "Belum"}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-slate-500">Progress</span>
                                <span className="font-black text-slate-700 dark:text-white">{completedCount}/{steps.length}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / steps.length) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Peserta</p>
                            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{totalPeserta}</p>
                            <p className="text-[10px] text-indigo-500 mt-0.5">Terdaftar</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">e-STTPL</p>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{certCount}</p>
                            <p className="text-[10px] text-emerald-500 mt-0.5">Terbit</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Lulus</p>
                            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{passedCount}</p>
                            <p className="text-[10px] text-amber-500 mt-0.5">Terverifikasi</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Belum</p>
                            <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{countUserWithNoStatus(data.UserPelatihan)}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Ditentukan</p>
                        </div>
                    </div>

                    {/* Current stage info */}
                    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-white/[0.05] shadow-sm p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status Saat Ini</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${getStatusInfo(data.StatusPenerbitan).color} text-white`}>
                            {React.cloneElement(getStatusInfo(data.StatusPenerbitan).icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
                            {getStatusInfo(data.StatusPenerbitan).label}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Kode: {data.StatusPenerbitan}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default STTPLDetail;

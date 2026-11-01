"use client";

import React, { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Cookies from "js-cookie";
import Link from "next/link";
import {
    TbPencilCheck, TbPencilX, TbSend, TbCertificate, TbShieldCheck, TbFileText, TbCheck, TbLock,
    TbCircleCheck, TbFileSpreadsheet, TbSignature, TbClipboardCheck, TbAlertCircle, TbArrowRight, TbArrowLeft,
} from "react-icons/tb";
import { LuSignature } from "react-icons/lu";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { Download, Printer, Loader2, X } from "lucide-react";

import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo, splitCityAndDate } from "@/utils/text";
import { urlFileBeritaAcara, urlFileLapwas } from "@/constants/urls";
import { ESELON_1 } from "@/constants/nomenclatures";
import { countUserWithCertificate, countUserWithNoStatus, countUserWithPassed } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { downloadAndZipPDFs } from "@/utils/file";
import { truncateText } from "@/utils";
import Toast from "@/commons/Toast";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import { PassedParticipantAction } from "@/commons/actions/lemdiklat/PassedParticipantAction";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import TTDeDetail from "./TTDeDetail";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
}

type StepState = "done" | "active" | "locked";
type IconType = React.ComponentType<{ className?: string }>;

interface SttplStep {
    id: number;
    title: string;
    subtitle: string;
    icon: IconType;
    accent: string;
    state: StepState;
    lockReason?: string;
}

const SIGNING_FLOW = ["7A", "7B", "7C", "7D", "8", "9", "10", "11", "12", "13", "14", "15"];
const SIGNING_DONE = ["7C", "10", "14"];
const CERT_BASE = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde";

/* ============================ KOMPONEN ============================ */

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan);

    const [isPrinting, setIsPrinting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [counter, setCounter] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isZipping, setIsZipping] = useState(false);

    const peserta = useMemo(() => data.UserPelatihan || [], [data.UserPelatihan]);

    // Ref per peserta untuk unduh massal
    const refs = useRef<React.RefObject<DialogSertifikatHandle>[]>([]);
    if (refs.current.length !== peserta.length) {
        refs.current = peserta.map((_, i) => refs.current[i] ?? React.createRef<DialogSertifikatHandle>());
    }

    /* ---------- Hak akses (sekali) ---------- */
    const [acc] = useState(() => ({ access: Cookies.get("Access") || "", role: Cookies.get("Role") || "" }));
    const isAdmin = acc.access.includes("createPelatihan");
    const isVerifikator = acc.access.includes("verifyCertificate");
    const isKabalai = acc.access.includes("approveKabalai");
    const isKapus = acc.access.includes("approveKapus");
    const isKabadan = acc.access.includes("approveKabadan");
    const isSigning = acc.access.includes("isSigning");

    /* ---------- Turunan (dihitung sekali) ---------- */
    const status = String(data.StatusPenerbitan ?? "");
    const statusNum = parseFloat(status) || 0;
    const statusInfo = getStatusInfo(status);
    const ttd = data.TtdSertifikat || "";
    const id = data.IdPelatihan.toString();

    const counts = useMemo(
        () => ({ belum: countUserWithNoStatus(peserta), lulus: countUserWithPassed(peserta), cert: countUserWithCertificate(peserta) }),
        [peserta]
    );
    const total = peserta.length;
    const allPassed = total > 0 && counts.belum === 0;
    const allCertified = total > 0 && counts.cert === total;
    const inSigningFlow = SIGNING_FLOW.includes(status);
    const signingDone = SIGNING_DONE.includes(status) || allCertified;
    const isSubmitted = statusNum >= 6;
    const isVerified = statusNum > 6;
    const showTTDe = isSigning && !!ttd && acc.role.includes(ttd) && statusNum >= 7 && statusNum <= 15;

    /* ---------- Langkah ---------- */
    const steps: SttplStep[] = [
        {
            id: 0, title: "Kelulusan Peserta", icon: TbClipboardCheck, accent: "#3B82F6",
            subtitle: allPassed ? `${counts.lulus} peserta lulus` : `${counts.belum} peserta belum ditentukan`,
            state: allPassed ? "done" : "active",
        },
        {
            id: 1, title: "Ajukan Penerbitan", icon: LuSignature as IconType, accent: "#8B5CF6",
            subtitle: isSubmitted ? "Pengajuan telah dikirim" : allPassed ? "Siap diajukan ke Pusat" : "Tentukan kelulusan dulu",
            state: isSubmitted ? "done" : allPassed ? "active" : "locked", lockReason: "Semua peserta harus ditentukan kelulusannya",
        },
        {
            id: 2, title: "Verifikasi Pusat", icon: TbShieldCheck, accent: "#06B6D4",
            subtitle: isVerified ? "Telah diverifikasi" : status === "6" ? "Menunggu verifikasi" : "Belum diajukan",
            state: isVerified ? "done" : status === "6" ? "active" : "locked", lockReason: "Ajukan penerbitan STTPL dulu",
        },
        {
            id: 3, title: "TTD Digital (BSrE)", icon: TbSignature, accent: "#10B981",
            subtitle: signingDone ? "Penandatanganan selesai" : inSigningFlow ? statusInfo.label : "Menunggu verifikasi",
            state: signingDone ? "done" : inSigningFlow ? "active" : "locked", lockReason: "Verifikasi Pusat harus selesai dulu",
        },
        {
            id: 4, title: "e-STTPL Terbit", icon: TbCertificate, accent: "#F59E0B",
            subtitle: allCertified ? `Semua ${total} e-STTPL terbit` : signingDone ? `${counts.cert} dari ${total} terbit` : "Menunggu penandatanganan",
            state: allCertified ? "done" : signingDone ? "active" : "locked", lockReason: "Penandatanganan BSrE harus selesai dulu",
        },
    ];
    const completed = steps.filter((s) => s.state === "done").length;
    const pct = Math.round((completed / steps.length) * 100);
    const firstActive = steps.find((s) => s.state === "active")?.id;

    const [current, setCurrent] = useState<number>(() => firstActive ?? 4);
    const step = steps[current];

    /* ---------- Aksi kontekstual ---------- */
    const approveVerifStatus = ttd.includes("Kepala Balai") ? "7A" : "8";
    const nextHint =
        isVerifikator && status === "6" ? "Periksa pengajuan e-STTPL lalu approve atau minta perbaikan."
            : isKabalai && status === "7A" ? "Setujui penerbitan untuk lanjut ke TTD BSrE Kabalai."
                : isKapus && status === "8" ? "Setujui penerbitan e-STTPL."
                    : isKabadan && status === "12" ? "Setujui penerbitan e-STTPL Kepala BPPSDM KP."
                        : isAdmin && (status === "7" || status === "9") ? "Perbaiki pengajuan lalu kirim kembali ke verifikator."
                            : isAdmin && !allPassed ? `Tentukan kelulusan ${counts.belum} peserta.`
                                : isAdmin && allPassed && !isSubmitted ? "Kelulusan lengkap — ajukan penerbitan STTPL."
                                    : null;
    const showActionBar = isAdmin || isVerifikator || isKabalai || isKapus || isKabadan;

    /* ---------- Unduhan ---------- */
    const handleDownloadAll = async () => {
        setIsDownloading(true);
        setProgress(0);
        setCounter(0);
        try {
            for (let i = 0; i < refs.current.length; i++) {
                await refs.current[i].current?.downloadPdf?.();
                setProgress(((i + 1) / refs.current.length) * 100);
                setCounter(i + 1);
            }
            Toast.fire({ icon: "success", title: "Semua e-STTPL diunduh" });
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Sebagian unduhan gagal" });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadZip = async () => {
        setIsZipping(true);
        try {
            await downloadAndZipPDFs(
                peserta,
                `(${data.Program}) ${data.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(data.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data.TanggalBerakhirPelatihan)}`
            );
        } catch (e) {
            console.error(e);
            Toast.fire({ icon: "error", title: "Gagal membuat ZIP" });
        } finally {
            setIsZipping(false);
        }
    };

    const handleDownloadExcel = () => {
        const rows = peserta.map((item: any, idx) => {
            let tempatLahir = item.TempatLahir ?? "-";
            let tanggalLahir = item.TanggalLahir ?? "-";
            if (item.TempatTanggalLahir) {
                try {
                    const r = splitCityAndDate(item.TempatTanggalLahir);
                    if (r.city && r.city !== "-") tempatLahir = r.city;
                    if (r.date && r.date !== "-") tanggalLahir = r.date;
                } catch {
                    const m = String(item.TempatTanggalLahir).match(/^([^,]+),?\s*(.*)$/);
                    if (m?.[2]) {
                        tempatLahir = m[1].trim();
                        tanggalLahir = m[2].trim();
                    } else tempatLahir = item.TempatTanggalLahir;
                }
            }
            return {
                No: idx + 1,
                Nama: item.Nama ?? item.User?.Nama ?? "-",
                NIK: item.Nik ?? item.User?.Nik ?? "-",
                "No Telpon": item.NoTelpon ?? item.User?.NoTelpon ?? "-",
                "Kabupaten / Kota": item.Kota ?? item.Kabupaten ?? "-",
                Provinsi: item.Provinsi ?? item.User?.Provinsi ?? "-",
                Alamat: item.Alamat ?? item.User?.Alamat ?? "-",
                "Tempat Lahir": tempatLahir,
                "Tanggal Lahir": tanggalLahir,
                "Jenis Kelamin": item.JenisKelamin ?? "-",
                "Pendidikan Terakhir": item.PendidikanTerakhir ?? "-",
                "No STTPL": item.NoRegistrasi ?? item.NoSertifikat ?? "-",
                "Link File STTPL": item.FileSertifikat ? `${CERT_BASE}/${item.FileSertifikat}` : "-",
            };
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [6, 35, 20, 18, 22, 22, 40, 22, 18, 16, 22, 30, 65].map((wch) => ({ wch }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Peserta STTPL");
        saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), `Daftar_Peserta_STTPL_${data.NamaPelatihan ?? "Pelatihan"}.xlsx`);
        Toast.fire({ icon: "success", title: "File Excel diunduh" });
    };

    /* ============================ RENDER ============================ */

    return (
        <div className="w-full space-y-5">
            {/* ---------- Bar aksi ---------- */}
            {showActionBar && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-3 md:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="relative isolate flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                            <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#8B5CF6_0%,transparent_70%)]" />
                            <TbArrowRight className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Langkah berikutnya</p>
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{nextHint || "Tidak ada aksi yang menunggu Anda."}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (status === "7" || status === "9") && (
                            <SendNoteAction idPelatihan={id} title="Kirim ke Verifikator" description="Perbaiki pengajuan penerbitan STTPL" buttonLabel="Kirim ke Verifikator" icon={TbSend} buttonColor="teal" onSuccess={fetchData} status="6" pelatihan={data} />
                        )}
                        {isVerifikator && status === "6" && (
                            <>
                                <SendNoteAction idPelatihan={id} title="Perbaikan" description="Berikan catatan perbaikan" buttonLabel="Minta Perbaikan" icon={TbPencilX} buttonColor="rose" onSuccess={fetchData} status="7" pelatihan={data} />
                                <SendNoteAction idPelatihan={id} title="Approve Penerbitan" description="Setujui pengajuan penerbitan STTPL" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="blue" onSuccess={fetchData} status={approveVerifStatus} pelatihan={data} />
                            </>
                        )}
                        {isKabalai && status === "7A" && (
                            <SendNoteAction idPelatihan={id} title="Approve Penerbitan" description="Approval pengajuan penerbitan STTPL" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="teal" onSuccess={fetchData} status="7B" pelatihan={data} />
                        )}
                        {isKapus && status === "8" && (
                            <SendNoteAction
                                idPelatihan={id}
                                title="Approve Penerbitan"
                                description={ttd === ESELON_1.fullName ? "Diteruskan ke Kabadan" : "Approval penerbitan STTPL"}
                                buttonLabel="Approve Penerbitan"
                                icon={TbPencilCheck}
                                buttonColor="teal"
                                onSuccess={fetchData}
                                status={ttd === ESELON_1.fullName ? "12" : "10"}
                                pelatihan={data}
                            />
                        )}
                        {isKabadan && status === "12" && (
                            <SendNoteAction idPelatihan={id} title="Approve Penerbitan" description="Approval penerbitan STTPL Kepala BPPSDM KP" buttonLabel="Approve Penerbitan" icon={TbPencilCheck} buttonColor="green" onSuccess={fetchData} status="14" pelatihan={data} />
                        )}
                    </div>
                </div>
            )}

            {/* ---------- Panel TTDe untuk penandatangan ---------- */}
            {showTTDe && <TTDeDetail data={data} fetchData={fetchData} />}

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:gap-5 items-start">
                {/* ---------- KIRI: timeline navy ---------- */}
                <aside className="lg:sticky lg:top-24 relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_0%_0%,#7C3AED_0%,transparent_60%),radial-gradient(70%_50%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
                    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
                    <TbCertificate aria-hidden className="pointer-events-none absolute -right-6 -bottom-8 -z-10 w-40 h-40 -rotate-12 text-violet-300 opacity-10" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Penerbitan e-STTPL</p>
                    <div className="mt-1 flex items-baseline justify-between">
                        <h2 className="text-xl font-black tracking-tight">{completed}/{steps.length} selesai</h2>
                        <span className="text-sm font-black tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#A78BFA,#fff)" }} />
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-blue-100/70">
                        Stage <span className="font-mono font-bold text-white">{status || "-"}</span> · {statusInfo.label}
                    </p>

                    <ol className="mt-5 flex lg:block gap-2 lg:space-y-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0 scrollbar-hide">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const sel = i === current;
                            const done = s.state === "done";
                            const locked = s.state === "locked";
                            const needs = s.state === "active";
                            const last = i === steps.length - 1;
                            return (
                                <li key={s.id} className="relative shrink-0 min-w-[210px] lg:min-w-0">
                                    {!last && (
                                        <span className="hidden lg:block absolute left-[25px] top-[50px] bottom-[-6px] w-[2px] rounded-full bg-white/10 overflow-hidden">
                                            <span className="block w-full bg-gradient-to-b from-emerald-400 to-sky-400 transition-all duration-500" style={{ height: done ? "100%" : "0%" }} />
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setCurrent(i)}
                                        aria-current={sel ? "step" : undefined}
                                        className={`group relative isolate w-full flex items-start gap-3 rounded-2xl p-2.5 text-left transition-all duration-300 overflow-hidden ${sel ? "bg-white/[0.12] backdrop-blur-xl ring-1 ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "hover:bg-white/[0.06]"} ${locked && !sel ? "opacity-60" : ""}`}
                                    >
                                        {sel && <span aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${s.accent}59 0%, ${s.accent}1f 45%, transparent 85%)` }} />}
                                        <span
                                            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 ${done ? "bg-emerald-500 ring-emerald-300/40 text-white" : sel || needs ? "text-white ring-white/30" : "bg-white/10 ring-white/10 text-sky-100/70"}`}
                                            style={!done && (sel || needs) ? { background: s.accent, boxShadow: `0 6px 18px -4px ${s.accent}` } : undefined}
                                        >
                                            {done ? <TbCheck className="w-[18px] h-[18px]" /> : locked ? <TbLock className="w-4 h-4" /> : <Icon className="w-[18px] h-[18px]" />}
                                        </span>
                                        <span className="min-w-0 flex-1 pt-0.5">
                                            <span className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/45">Tahap {i + 1}</span>
                                                {done && <span className="text-[9px] font-bold text-emerald-300">Selesai</span>}
                                                {needs && <span className="text-[9px] font-bold text-amber-300">Berlangsung</span>}
                                            </span>
                                            <span className={`block text-sm font-bold ${sel ? "text-white" : "text-blue-50/90"}`}>{s.title}</span>
                                            <span className="block text-[11px] text-blue-100/55 truncate">{locked ? s.lockReason : s.subtitle}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    {/* Statistik ringkas */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {[
                            { label: "Peserta", val: total, cls: "text-white" },
                            { label: "Lulus", val: counts.lulus, cls: "text-emerald-300" },
                            { label: "Belum", val: counts.belum, cls: counts.belum ? "text-amber-300" : "text-white/60" },
                            { label: "e-STTPL", val: counts.cert, cls: "text-violet-200" },
                        ].map((m) => (
                            <div key={m.label} className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/50">{m.label}</p>
                                <p className={`text-xl font-black tabular-nums ${m.cls}`}>{m.val.toLocaleString("id-ID")}</p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ---------- KANAN: panel tahap terpilih ---------- */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden flex flex-col min-w-0">
                    <div className="flex items-center gap-3.5 px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="relative isolate flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0B1B3F] text-white shadow-md">
                            <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${step.accent} 0%, transparent 75%)` }} />
                            <step.icon className="w-[22px] h-[22px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tahap {current + 1} dari {steps.length}</p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{step.title}</h3>
                            <p className="text-xs text-slate-500 truncate">{step.subtitle}</p>
                        </div>
                        {step.state === "done" && <span className="hidden sm:inline-flex shrink-0 items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 text-[11px] font-bold"><TbCheck className="w-3.5 h-3.5" /> Selesai</span>}
                        {step.state === "active" && <span className="hidden sm:inline-flex shrink-0 items-center h-7 px-2.5 rounded-lg bg-[#0B1B3F] text-white text-[11px] font-bold">Berlangsung</span>}
                    </div>

                    <div key={current} className="flex-1 p-5 md:p-6 animate-in fade-in slide-in-from-right-2 duration-300">
                        {step.state === "locked" ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-center">
                                <span className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center"><TbLock className="w-5 h-5" /></span>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tahap ini masih terkunci</p>
                                    <p className="text-xs text-slate-500">{step.lockReason}</p>
                                </div>
                                {firstActive !== undefined && (
                                    <button type="button" onClick={() => setCurrent(firstActive)} className="h-9 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5">
                                        Ke tahap {firstActive + 1}: {steps[firstActive].title} <TbArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* TAHAP 0 — Kelulusan */}
                                {step.id === 0 && (
                                    <div className="space-y-4">
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-800 p-4">
                                            <Info label="Penandatangan" value={ttd} />
                                            <Info label="Verifikator" value={adminPusatData?.Nama} />
                                            <div>
                                                <dt className="text-[10px] text-slate-400">Berita Acara</dt>
                                                <dd className="mt-0.5">
                                                    {data.BeritaAcara ? (
                                                        <Link target="_blank" href={`${urlFileBeritaAcara}/${data.BeritaAcara}`} className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                                                            <TbFileText className="w-3.5 h-3.5" /> {truncateText(data.BeritaAcara, 22, "…")}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">—</span>
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] text-slate-400">Memo Lapwas</dt>
                                                <dd className="mt-0.5">
                                                    {data.MemoPusat ? (
                                                        <Link target="_blank" href={`${urlFileLapwas}/${data.MemoPusat}`} className="text-xs font-semibold text-amber-600 hover:underline inline-flex items-center gap-1">
                                                            <TbShieldCheck className="w-3.5 h-3.5" /> Dokumen Lapwas
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-slate-300">—</span>
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        {/* Bar kelulusan */}
                                        <div>
                                            <div className="flex items-baseline justify-between text-xs mb-1.5">
                                                <span className="font-semibold text-slate-600 dark:text-slate-300">Kelulusan ditentukan</span>
                                                <span className="tabular-nums text-slate-500"><b className="text-slate-900 dark:text-white">{total - counts.belum}</b> / {total}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                                                <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${total ? (counts.lulus / total) * 100 : 0}%` }} />
                                                <div className="h-full bg-rose-400 transition-all duration-700" style={{ width: `${total ? ((total - counts.belum - counts.lulus) / total) * 100 : 0}%` }} />
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-slate-500">
                                                <Legend dot="bg-emerald-500" label={`Lulus ${counts.lulus}`} />
                                                <Legend dot="bg-rose-400" label={`Tidak lulus ${Math.max(0, total - counts.belum - counts.lulus)}`} />
                                                <Legend dot="bg-slate-300" label={`Belum ${counts.belum}`} />
                                            </div>
                                        </div>

                                        {counts.belum > 0 && !isSigning && <PassedParticipantAction data={peserta} onSuccess={fetchData} />}

                                        <div className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
                                            <UserPelatihanTable pelatihan={data} data={peserta} onSuccess={fetchData} />
                                        </div>
                                    </div>
                                )}

                                {/* TAHAP 1 — Ajukan */}
                                {step.id === 1 && (
                                    <div className="space-y-3">
                                        <Checklist
                                            items={[
                                                { label: "Semua peserta ditentukan kelulusannya", done: allPassed, onClick: () => setCurrent(0) },
                                                { label: "Pelaporan penyelenggaraan (stage 5)", done: status === "5" || isSubmitted },
                                            ]}
                                        />
                                        {isSubmitted ? (
                                            <Notice tone="violet" icon={TbCircleCheck} text="Pengajuan telah dikirim ke Pusat." />
                                        ) : allPassed && isAdmin ? (
                                            <SendNoteAction idPelatihan={id} title="Ajukan Penerbitan STTPL" description="Ajukan penerbitan STTPL untuk pelatihan ini." buttonLabel="Ajukan Penerbitan STTPL Sekarang" icon={LuSignature} buttonColor="blue" onSuccess={fetchData} status="6" pelatihan={data} />
                                        ) : null}
                                    </div>
                                )}

                                {/* TAHAP 2 — Verifikasi Pusat */}
                                {step.id === 2 && (
                                    <div className="space-y-3">
                                        <Notice
                                            tone={isVerified ? "emerald" : "amber"}
                                            icon={TbShieldCheck}
                                            text={isVerified ? "Verifikasi Pusat selesai." : "Menunggu verifikasi Pusat BPPSDM KP."}
                                            sub={adminPusatData?.Nama ? `Verifikator: ${adminPusatData.Nama}` : undefined}
                                        />
                                        {isVerifikator && status === "6" && <p className="text-[11px] text-slate-500">Gunakan tombol <b>Approve</b> atau <b>Minta Perbaikan</b> pada bar aksi di atas.</p>}
                                    </div>
                                )}

                                {/* TAHAP 3 — BSrE */}
                                {step.id === 3 && (
                                    <div className="space-y-3">
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl ring-1 ring-slate-200/80 dark:ring-slate-800 p-4">
                                            <Info label="Penandatangan" value={ttd} />
                                            <Info label="Status BSrE" value={statusInfo.label} />
                                        </dl>
                                        {signingDone && <Notice tone="emerald" icon={TbCheck} text="Penandatanganan BSrE selesai." />}
                                        {showTTDe && <p className="text-[11px] text-slate-500">Panel penandatanganan Anda ada di atas.</p>}
                                    </div>
                                )}

                                {/* TAHAP 4 — e-STTPL */}
                                {step.id === 4 && (
                                    <div className="space-y-3">
                                        {!isSigning && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <ToolBtn onClick={() => setIsPrinting((p) => !p)} icon={isPrinting ? X : Printer} active={isPrinting}>
                                                    {isPrinting ? "Tutup mode cetak" : "Mode cetak massal"}
                                                </ToolBtn>
                                                {allCertified && (
                                                    <ToolBtn onClick={handleDownloadZip} icon={isZipping ? Loader2 : Download} disabled={isZipping} spin={isZipping}>
                                                        {isZipping ? "Membuat ZIP…" : "Unduh ZIP e-STTPL"}
                                                    </ToolBtn>
                                                )}
                                                {["11", "15"].includes(status) && total > 0 && (
                                                    <ToolBtn onClick={handleDownloadExcel} icon={TbFileSpreadsheet}>Unduh Excel</ToolBtn>
                                                )}
                                                <span className="ml-auto text-xs text-slate-500">
                                                    <b className="text-slate-900 dark:text-white tabular-nums">{counts.cert}</b> / {total} terbit
                                                </span>
                                            </div>
                                        )}

                                        {isPrinting && !isSigning ? (
                                            <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800 p-3">
                                                    {isDownloading ? (
                                                        <div className="flex-1">
                                                            <div className="flex justify-between text-xs mb-1.5">
                                                                <span className="font-semibold text-slate-700 dark:text-slate-200">Mengunduh {counter} dari {total}…</span>
                                                                <span className="font-mono font-bold text-slate-500">{Math.round(progress)}%</span>
                                                            </div>
                                                            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                                <div className="h-full rounded-full bg-[#0B1B3F] transition-all" style={{ width: `${progress}%` }} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500">Unduh seluruh e-STTPL sebagai PDF terpisah.</p>
                                                    )}
                                                    <button type="button" onClick={handleDownloadAll} disabled={isDownloading} className="h-10 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} Unduh semua
                                                    </button>
                                                </div>
                                                <ul className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                                    {peserta.map((item, i) => (
                                                        <li key={i} className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center tabular-nums">{i + 1}</span>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.Nama}</p>
                                                                    <p className="font-mono text-[10px] text-slate-400">{item.NoRegistrasi || "—"}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.FileSertifikat?.includes("signed") && (
                                                                    <Link target="_blank" href={`${CERT_BASE}/${item.FileSertifikat}`} className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 text-[11px] font-bold hover:underline">
                                                                        <RiVerifiedBadgeFill className="w-3.5 h-3.5" /> e-STTPL
                                                                    </Link>
                                                                )}
                                                                <DialogSertifikatPelatihan ref={refs.current[i]} pelatihan={data} userPelatihan={item} handleFetchingData={fetchData} isPrint={isPrinting} />
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
                                                <UserPelatihanTable pelatihan={data} data={peserta} onSuccess={fetchData} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Navigasi */}
                    <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                        <button type="button" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="h-10 px-3.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 disabled:invisible">
                            <TbArrowLeft className="w-4 h-4" /> Sebelumnya
                        </button>
                        <div className="flex items-center gap-1.5" aria-hidden>
                            {steps.map((s, i) => (
                                <span key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#0B1B3F] dark:bg-sky-400" : s.state === "done" ? "w-1.5 bg-emerald-400" : "w-1.5 bg-slate-200 dark:bg-slate-700"}`} />
                            ))}
                        </div>
                        <button type="button" onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))} disabled={current === steps.length - 1} className="h-10 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-1.5 disabled:invisible">
                            Berikutnya <TbArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================ UI ============================ */

function Info({ label, value }: { label: string; value?: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-[10px] text-slate-400">{label}</dt>
            <dd className={`mt-0.5 text-xs font-semibold break-words ${value ? "text-slate-800 dark:text-slate-200" : "text-slate-300"}`}>{value || "—"}</dd>
        </div>
    );
}

function Legend({ dot, label }: { dot: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} /> {label}
        </span>
    );
}

function Checklist({ items }: { items: { label: string; done: boolean; onClick?: () => void }[] }) {
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((c) => (
                <li key={c.label}>
                    <button
                        type="button"
                        onClick={() => !c.done && c.onClick?.()}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl ring-1 text-left ${c.done ? "bg-emerald-50/60 ring-emerald-100 dark:bg-emerald-950/20 dark:ring-emerald-900/40 cursor-default" : "bg-rose-50/60 ring-rose-100 hover:ring-rose-200 dark:bg-rose-950/20 dark:ring-rose-900/40"}`}
                    >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white ${c.done ? "bg-emerald-500" : "bg-rose-400"}`}>
                            {c.done ? <TbCheck className="w-3 h-3" /> : <TbAlertCircle className="w-3 h-3" />}
                        </span>
                        <span className={`text-xs font-semibold ${c.done ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{c.label}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

const NOTICE_TONE = {
    emerald: "bg-emerald-50/60 ring-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:ring-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-50/60 ring-amber-100 text-amber-700 dark:bg-amber-950/20 dark:ring-amber-900/40 dark:text-amber-300",
    violet: "bg-violet-50/60 ring-violet-100 text-violet-700 dark:bg-violet-950/20 dark:ring-violet-900/40 dark:text-violet-300",
} as const;

function Notice({ tone, icon: Icon, text, sub }: { tone: keyof typeof NOTICE_TONE; icon: IconType; text: string; sub?: string }) {
    return (
        <div className={`flex items-start gap-2.5 rounded-xl ring-1 px-3.5 py-3 ${NOTICE_TONE[tone]}`}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
                <p className="text-xs font-bold">{text}</p>
                {sub && <p className="text-[11px] opacity-80">{sub}</p>}
            </div>
        </div>
    );
}

function ToolBtn({ onClick, icon: Icon, children, disabled, active, spin }: { onClick: () => void; icon: IconType; children: React.ReactNode; disabled?: boolean; active?: boolean; spin?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 ${active ? "bg-[#0B1B3F] text-white" : "ring-1 ring-slate-200 dark:ring-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
        >
            <Icon className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} /> {children}
        </button>
    );
}

export default STTPLDetail;

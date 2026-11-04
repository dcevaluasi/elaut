"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import {
    TbSchool, TbCalendar, TbCategory, TbClock, TbMapPin, TbRocket, TbSettings, TbSignature, TbTag,
    TbCertificate, TbBuildingSkyscraper, TbHierarchy, TbCash, TbUserCode, TbExternalLink, TbStar,
    TbCheck, TbLock, TbAlertCircle, TbFileText, TbUserStar, TbSend, TbChevronDown, TbInfoCircle,
    TbSpeakerphone, TbArrowRight, TbArrowLeft,
} from "react-icons/tb";
import { HiOutlineUserGroup } from "react-icons/hi2";
import {
    Users, FileText, GraduationCap, ShieldCheck, AlertCircle, Clock, Send, Trash2, Download, Globe, Calendar,
} from "lucide-react";

import { PelatihanMasyarakat } from "@/types/product";
import { ModulPelatihan } from "@/types/module";
import { generateTanggalPelatihan } from "@/utils/text";
import { replaceUrl } from "@/lib/utils";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import { JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN } from "@/constants/pelatihan";
import { isMoreThanToday } from "@/utils/time";
import { countValidKeterangan } from "@/utils/counter";
import { stringToArray } from "@/utils/input";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";

import UserPelatihanTable from "./Tables/UserPelatihanTable";
import UploadSuratButton from "@/commons/actions/UploadSuratButton";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import EditPelatihanAction from "@/commons/actions/EditPelatihanAction";
import DeletePelatihanAction from "@/commons/actions/DeletePelatihanAction";
import ChooseModulAction from "@/commons/actions/modul/ChooseModulAction";
import ChooseInstrukturAction from "@/commons/actions/instruktur/ChooseInstrukturAction";
import ImportPesertaAction from "@/commons/actions/ImportPesertaAction";
import { ValidateParticipantAction } from "@/commons/actions/lemdiklat/ValidateParticipantAction";
import EditPublishAction from "@/commons/actions/EditPublishAction";
import PublishButton from "@/commons/actions/PublishButton";
import ZipPhotoParticipantAction from "@/commons/actions/lemdiklat/ZipPhotoParticipantAction";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
    onSwitchToSttpl?: () => void;
}

type StepState = "done" | "active" | "locked";
type IconType = React.ComponentType<{ className?: string }>;

interface TimelineStep {
    id: number;
    title: string;
    subtitle: string;
    icon: IconType;
    accent: string;
    state: StepState;
    lockReason?: string;
}

const EMPTY_FOTO = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/";
const stageNum = (s?: string) => {
    const n = parseFloat(String(s ?? ""));
    return isNaN(n) ? 0 : n;
};

/* ============================ KOMPONEN ============================ */

const PelatihanDetail: React.FC<Props> = ({ data, fetchData, onSwitchToSttpl }) => {
    const { instrukturs, fetchInstrukturData } = useFetchDataInstrukturSelected(stringToArray(data?.Instruktur));
    const { data: modulPelatihan } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri);

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    // Hak akses dibaca sekali
    const [access] = useState(() => Cookies.get("Access") || "");
    const isAdmin = access.includes("createPelatihan");
    const isSPV = access.includes("supervisePelaksanaan");
    const isVerifikator = access.includes("verifyPelaksanaan");

    const status = String(data.StatusPenerbitan ?? "");
    const stage = stageNum(status);
    const canEdit = status === "0" || status === "1.2" || status === "3" || status === "";
    const isDraftOrRevisi = status === "0" || status === "1.2" || status === "";
    const id = data.IdPelatihan.toString();

    /* ---------- Kesiapan ---------- */
    const peserta = data.UserPelatihan || [];
    const totalPeserta = peserta.length;
    const validPeserta = useMemo(() => countValidKeterangan(peserta), [peserta]);
    const hasSurat = !!data.SuratPemberitahuan;
    const hasModul = !!data.ModuleMateri;
    const hasInstruktur = !!data.Instruktur;
    const hasPeserta = totalPeserta > 0;
    const allValid = hasPeserta && validPeserta >= totalPeserta; // wajib semua valid sebelum ke SPV
    const belumValid = Math.max(0, totalPeserta - validPeserta);
    const readiness = [
        { label: "Surat Pemberitahuan", done: hasSurat, step: 1 },
        { label: "Perangkat Pelatihan", done: hasModul, step: 2 },
        { label: "Tenaga Pelatih", done: hasInstruktur, step: 3 },
        { label: hasPeserta && !allValid ? `Validasi Peserta (${belumValid} belum valid)` : "Data Peserta Valid", done: allValid, step: 4 },
    ];
    const readyCount = readiness.filter((r) => r.done).length;
    const canSubmitSPV = readyCount === 4;

    /* ---------- Langkah ---------- */
    const steps: TimelineStep[] = [
        { id: 0, title: "Informasi Pelatihan", subtitle: "Detail, jadwal & legalitas", icon: TbInfoCircle, accent: "#64748B", state: "done" },
        { id: 1, title: "Surat Pemberitahuan", subtitle: hasSurat ? "Dokumen telah diunggah" : "Unggah dokumen resmi kegiatan", icon: TbFileText, accent: "#3B82F6", state: hasSurat ? "done" : "active" },
        { id: 2, title: "Perangkat Pelatihan", subtitle: hasModul ? modulPelatihan?.NamaMateriPelatihan || "Modul dipilih" : "Pilih modul & materi", icon: TbUserCode, accent: "#8B5CF6", state: !hasSurat ? "locked" : hasModul ? "done" : "active", lockReason: "Unggah Surat Pemberitahuan dulu" },
        { id: 3, title: "Tenaga Pelatih", subtitle: hasInstruktur ? `${instrukturs?.length || 0} instruktur dipetakan` : "Tetapkan instruktur", icon: TbUserStar, accent: "#06B6D4", state: !hasModul ? "locked" : hasInstruktur ? "done" : "active", lockReason: "Pilih perangkat pelatihan dulu" },
        { id: 4, title: "Data Peserta", subtitle: !hasPeserta ? "Import & validasi peserta" : allValid ? `${totalPeserta} peserta · semua valid` : `${belumValid} dari ${totalPeserta} belum valid`, icon: HiOutlineUserGroup as IconType, accent: "#10B981", state: !hasInstruktur ? "locked" : allValid ? "done" : "active", lockReason: "Tetapkan instruktur dulu" },
        {
            id: 5,
            title: "Ajukan ke SPV",
            subtitle: !canSubmitSPV ? "Lengkapi semua langkah" : isDraftOrRevisi ? "Siap diajukan" : "Sudah diajukan",
            icon: TbSend,
            accent: "#F59E0B",
            state: !canSubmitSPV ? "locked" : isDraftOrRevisi ? "active" : "done",
            lockReason: hasPeserta && !allValid ? `Validasi semua peserta dulu (${belumValid} belum valid)` : "Lengkapi semua data pelatihan dulu",
        },
    ];
    const completedCount = steps.filter((s) => s.state === "done").length;
    const firstActive = steps.find((s) => s.state === "active")?.id;

    // Langkah terpilih (default: yang perlu aksi), panel kanan menampilkan isinya
    const [current, setCurrent] = useState<number>(() => firstActive ?? 4);
    const focusStep = (sid: number) => {
        setCurrent(sid);
        requestAnimationFrame(() => document.getElementById("detail-steps")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    const step = steps[current];
    const progressPct = Math.round((completedCount / steps.length) * 100);

    const [expandedModul, setExpandedModul] = useState<number | null>(null);

    /* ---------- Aksi kontekstual ---------- */
    const showActions = isAdmin || isSPV || isVerifikator;
    const nextHint =
        isSPV && status === "1" ? "Tinjau kelengkapan lalu pilih verifikator atau minta perbaikan."
            : isVerifikator && status === "2" ? "Periksa administrasi lalu setujui atau minta perbaikan."
                : isAdmin && status === "3" ? "Perbaiki sesuai catatan, lalu kirim kembali ke verifikator."
                    : isAdmin && isDraftOrRevisi && hasPeserta && !allValid && readyCount === 3 ? `Validasi ${belumValid} peserta yang belum valid sebelum diajukan ke SPV.`
                        : isAdmin && isDraftOrRevisi && !canSubmitSPV ? `Lengkapi ${4 - readyCount} data persiapan untuk diajukan ke SPV.`
                            : isAdmin && isDraftOrRevisi && canSubmitSPV ? "Semua data lengkap — ajukan ke SPV."
                                : null;

    const hasFoto = !!data.FotoPelatihan && data.FotoPelatihan !== EMPTY_FOTO;

    /* ============================ RENDER ============================ */

    return (
        <div className="w-full space-y-5">
            {/* ---------- Bar aksi ---------- */}
            {showActions && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-3 md:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="relative isolate flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100">
                            <span className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%)]" />
                            <TbArrowRight className="w-5 h-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Langkah berikutnya</p>
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{nextHint || "Tidak ada aksi yang menunggu Anda."}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && status === "3" && hasSurat && (
                            <SendNoteAction idPelatihan={id} title="Kirim ke Verifikator" description="Kirim perbaikan ke Verifikator" buttonLabel="Kirim ke Verifikator" icon={Send} buttonColor="teal" onSuccess={fetchData} status="2" pelatihan={data} />
                        )}
                        {isAdmin && (status === "4" || status === "1.1") && isMoreThanToday(data.TanggalBerakhirPelatihan) && (
                            <SendNoteAction idPelatihan={id} title="Tutup Pelatihan" description="Tutup pelatihan dan mulai penerbitan STTPL." buttonLabel="Tutup Pelatihan" icon={Clock} buttonColor="neutral" onSuccess={fetchData} status="5" pelatihan={data} />
                        )}
                        {isSPV && status === "1" && (
                            <>
                                <SendNoteAction idPelatihan={id} title="Minta Perbaikan" description="Berikan catatan perbaikan." buttonLabel="Minta Perbaikan" icon={AlertCircle} buttonColor="rose" onSuccess={fetchData} status="1.2" pelatihan={data} />
                                <SendNoteAction idPelatihan={id} title="Pilih Verifikator" description="Tunjuk verifikator pelaksanaan." buttonLabel="Pilih Verifikator" icon={TbSettings} buttonColor="teal" onSuccess={fetchData} status="2" pelatihan={data} />
                            </>
                        )}
                        {isVerifikator && status === "2" && (
                            <>
                                <SendNoteAction idPelatihan={id} title="Minta Perbaikan" description="Minta perbaikan kelengkapan administrasi." buttonLabel="Minta Perbaikan" icon={Trash2} buttonColor="rose" onSuccess={fetchData} status="3" pelatihan={data} />
                                <SendNoteAction idPelatihan={id} title="Setujui Pelaksanaan" description="Setujui pelaksanaan pelatihan ini." buttonLabel="Setujui Pelaksanaan" icon={ShieldCheck} buttonColor="teal" onSuccess={fetchData} status="4" pelatihan={data} />
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <span className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                                <EditPelatihanAction idPelatihan={id} currentData={data} onSuccess={fetchData} />
                                <DeletePelatihanAction idPelatihan={id} pelatihan={data} handleFetchingData={fetchData} />
                            </>
                        )}
                        {stage >= 5 && onSwitchToSttpl && (
                            <button type="button" onClick={onSwitchToSttpl} className="h-9 px-3.5 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5">
                                Ke e-STTPL <TbArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div id="detail-steps" className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 lg:gap-5 items-start scroll-mt-28">
                {/* ---------- KIRI: timeline vertikal (navy, seperti FormPelatihan) ---------- */}
                <div className="space-y-4 lg:sticky lg:top-24">
                    <aside className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
                        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(70%_50%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
                        <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
                        <TbSchool aria-hidden className="pointer-events-none absolute -right-6 -bottom-8 -z-10 w-40 h-40 -rotate-12 text-sky-300 opacity-10" />

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">Tahapan Persiapan</p>
                        <div className="mt-1 flex items-baseline justify-between">
                            <h2 className="text-xl font-black tracking-tight">{completedCount}/{steps.length} selesai</h2>
                            <span className="text-sm font-black tabular-nums">{progressPct}%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#38BDF8,#fff)" }} />
                        </div>

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
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/45">Langkah {i + 1}</span>
                                                    {done && <span className="text-[9px] font-bold text-emerald-300">Selesai</span>}
                                                    {needs && <span className="text-[9px] font-bold text-amber-300">Perlu aksi</span>}
                                                </span>
                                                <span className={`block text-sm font-bold ${sel ? "text-white" : "text-blue-50/90"}`}>{s.title}</span>
                                                <span className="block text-[11px] text-blue-100/55 truncate">{locked ? s.lockReason : s.subtitle}</span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>

                        {/* Statistik peserta ringkas */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/50">Peserta</p>
                                <p className="text-xl font-black tabular-nums">{totalPeserta.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/50">Valid</p>
                                <p className="text-xl font-black tabular-nums text-emerald-300">
                                    {validPeserta.toLocaleString("id-ID")}
                                    {totalPeserta > 0 && <span className="ml-1 text-[10px] font-bold text-blue-100/50">{Math.round((validPeserta / totalPeserta) * 100)}%</span>}
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Publikasi */}
                    {isAdmin && (
                        <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm p-4">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                                    <TbSpeakerphone className="w-4 h-4 text-violet-500" /> Publikasi Portal
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${data.Status === "Publish" ? "text-emerald-600" : "text-slate-400"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${data.Status === "Publish" ? "bg-emerald-500" : "bg-slate-300"}`} />
                                    {data.Status === "Publish" ? "Tayang" : "Belum tayang"}
                                </span>
                            </div>
                            {hasFoto ? (
                                <div className="flex gap-3 mb-3">
                                    <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                                        <Image className="object-cover" alt={data.NamaPelatihan} src={replaceUrl(data.FotoPelatihan)} fill sizes="64px" />
                                    </div>
                                    <p className="flex-1 min-w-0 text-xs text-slate-600 dark:text-slate-400 line-clamp-4">{data.DetailPelatihan || "Belum ada deskripsi."}</p>
                                </div>
                            ) : (
                                <p className="mb-3 py-4 text-center text-[11px] text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">Flyer & deskripsi belum diatur</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <EditPublishAction
                                    idPelatihan={id}
                                    currentDetail={data.DetailPelatihan}
                                    currentFoto={data.FotoPelatihan}
                                    tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                    currentData={data}
                                    onSuccess={fetchData}
                                />
                                {hasFoto && (
                                    <PublishButton title={data.Status === "Publish" ? "Take Down" : "Publish"} statusPelatihan={data.Status ?? ""} idPelatihan={id} handleFetchingData={fetchData} />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------- KANAN: panel langkah terpilih ---------- */}
                <div className="rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm overflow-hidden flex flex-col min-w-0">
                    {/* Header langkah */}
                    <div className="flex items-center gap-3.5 px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="relative isolate flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0B1B3F] text-white shadow-md">
                            <span className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${step.accent} 0%, transparent 75%)` }} />
                            <step.icon className="w-[22px] h-[22px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Langkah {current + 1} dari {steps.length}</p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{step.title}</h3>
                            <p className="text-xs text-slate-500 truncate">{step.subtitle}</p>
                        </div>
                        {step.state === "done" && <span className="hidden sm:inline-flex shrink-0 items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 text-[11px] font-bold"><TbCheck className="w-3.5 h-3.5" /> Selesai</span>}
                        {step.state === "active" && <span className="hidden sm:inline-flex shrink-0 items-center h-7 px-2.5 rounded-lg bg-[#0B1B3F] text-white text-[11px] font-bold">Perlu aksi</span>}
                    </div>

                    <div key={current} className="flex-1 p-5 md:p-6 animate-in fade-in slide-in-from-right-2 duration-300">
                        {step.state === "locked" ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-center">
                                <span className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center"><TbLock className="w-5 h-5" /></span>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Langkah ini masih terkunci</p>
                                    <p className="text-xs text-slate-500">{step.lockReason}</p>
                                </div>
                                {firstActive !== undefined && (
                                    <button type="button" onClick={() => setCurrent(firstActive)} className="h-9 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5">
                                        Ke langkah {firstActive + 1}: {steps[firstActive].title} <TbArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* STEP 0 */}
                                {step.id === 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <InfoSection title="Identitas & Program" icon={TbTag}>
                                            <InfoItem label="Kode Pelatihan" value={data.KodePelatihan} icon={TbTag} mono />
                                            <InfoItem label="Nama (EN)" value={data.NamaPelathanInggris} icon={Globe} />
                                            <InfoItem label="Sektor" value={data.JenisProgram} icon={TbHierarchy} />
                                            <InfoItem label="Klaster" value={data.BidangPelatihan} icon={TbCategory} />
                                            <InfoItem label="Program" value={data.Program} icon={TbRocket} />
                                            <InfoItem label="Program Terobosan" value={data.DukunganProgramTerobosan} icon={TbStar} />
                                        </InfoSection>
                                        <InfoSection title="Jadwal" icon={TbCalendar}>
                                            <InfoItem label="Mulai" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} icon={TbCalendar} />
                                            <InfoItem label="Selesai" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} icon={TbClock} />
                                            <InfoItem label="Buka Pendaftaran" value={data.TanggalMulaiPendaftaran ? generateTanggalPelatihan(data.TanggalMulaiPendaftaran) : ""} icon={TbCalendar} />
                                            <InfoItem label="Tutup Pendaftaran" value={data.TanggalAkhirPendaftaran ? generateTanggalPelatihan(data.TanggalAkhirPendaftaran) : ""} icon={TbClock} />
                                        </InfoSection>
                                        <InfoSection title="Penyelenggara & Pembiayaan" icon={TbBuildingSkyscraper}>
                                            <InfoItem label="Penyelenggara" value={data.PenyelenggaraPelatihan} icon={TbBuildingSkyscraper} />
                                            <InfoItem label="Lokasi" value={data.LokasiPelatihan} icon={TbMapPin} />
                                            <InfoItem label="Metode" value={data.PelaksanaanPelatihan} icon={TbSchool} />
                                            <InfoItem label="Pembiayaan" value={data.JenisPelatihan} icon={TbCash} />
                                            {data.JenisPelatihan === JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && (
                                                <InfoItem label="Biaya / Peserta" value={`Rp ${Number(data.HargaPelatihan || 0).toLocaleString("id-ID")}`} icon={TbCash} />
                                            )}
                                            <InfoItem label="Kuota" value={data.KoutaPelatihan ? `${data.KoutaPelatihan} orang` : ""} icon={Users} />
                                        </InfoSection>
                                        <InfoSection title="Legalitas" icon={TbCertificate}>
                                            <InfoItem label="Penandatangan" value={data.TtdSertifikat} icon={TbSignature} />
                                            <InfoItem label="Dibuat" value={data.CreateAt ? generateTanggalPelatihan(data.CreateAt) : ""} icon={Calendar} />
                                        </InfoSection>
                                    </div>
                                )}

                                {/* STEP 1 */}
                                {step.id === 1 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className={`flex-1 flex items-center gap-3 p-3 rounded-xl ring-1 ${hasSurat ? "bg-emerald-50/60 ring-emerald-100 dark:bg-emerald-950/20 dark:ring-emerald-900/40" : "bg-amber-50/60 ring-amber-100 dark:bg-amber-950/20 dark:ring-amber-900/40"}`}>
                                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${hasSurat ? "bg-emerald-500" : "bg-amber-500"}`}>
                                                <TbFileText className="w-5 h-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{hasSurat ? "Surat telah diunggah" : "Surat belum diunggah"}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{hasSurat ? data.SuratPemberitahuan : "Format PDF, ditandatangani pimpinan unit."}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {isAdmin && <UploadSuratButton idPelatihan={id} pelatihan={data} handleFetchingData={fetchData} />}
                                            {hasSurat && (
                                                <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data.SuratPemberitahuan}`} className="h-9 px-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5" /> Lihat Surat
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2 */}
                                {step.id === 2 && (
                                    <div className="space-y-3">
                                        {canEdit && isAdmin && <ChooseModulAction idPelatihan={id} currentData={data} onSuccess={fetchData} />}
                                        {!hasModul ? (
                                            <EmptyHint icon={TbUserCode} title="Modul belum dipilih" desc="Pilih paket modul menggunakan tombol di atas." />
                                        ) : (
                                            <div className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
                                                <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600">{modulPelatihan?.BidangMateriPelatihan} · {modulPelatihan?.Tahun}</p>
                                                        <p className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{modulPelatihan?.NamaMateriPelatihan || "Memuat modul…"}</p>
                                                    </div>
                                                    <span className="shrink-0 text-[11px] font-bold text-slate-500">{modulPelatihan?.ModulPelatihan?.length || 0} modul</span>
                                                </div>
                                                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {modulPelatihan?.ModulPelatihan?.map((m: ModulPelatihan) => {
                                                        const exp = expandedModul === m.IdModulPelatihan;
                                                        return (
                                                            <li key={m.IdModulPelatihan} className="px-3.5 py-2.5">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <button type="button" onClick={() => setExpandedModul(exp ? null : m.IdModulPelatihan)} className="flex items-center gap-2 min-w-0 text-left">
                                                                        <GraduationCap className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{m.NamaModulPelatihan}</span>
                                                                        {!!m.BahanTayang?.length && <TbChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${exp ? "rotate-180" : ""}`} />}
                                                                    </button>
                                                                    <Link href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${m.FileModule}`} target="_blank" className="shrink-0 text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                                                                        <Download className="w-3 h-3" /> Unduh
                                                                    </Link>
                                                                </div>
                                                                {exp && (
                                                                    <ul className="ml-5 mt-1.5 space-y-1">
                                                                        {m.BahanTayang?.map((bt, i) => (
                                                                            <li key={i} className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                                                                                <span className="truncate">• {bt.NamaBahanTayang}</span>
                                                                                <Link href={bt.BahanTayang ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${bt.BahanTayang}` : bt.LinkVideo} target="_blank" className="shrink-0 text-blue-600 hover:underline inline-flex items-center gap-0.5">
                                                                                    Lihat <TbExternalLink className="w-3 h-3" />
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3 */}
                                {step.id === 3 && (
                                    <div className="space-y-3">
                                        <ChooseInstrukturAction idPelatihan={id} currentData={data} onSuccess={fetchData} />
                                        {!hasInstruktur ? (
                                            <EmptyHint icon={TbUserStar} title="Instruktur belum dipetakan" />
                                        ) : (
                                            <ul className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                                {instrukturs?.map((it, i) => (
                                                    <li key={i} className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="w-8 h-8 rounded-lg bg-[#0B1B3F] text-sky-100 font-black flex items-center justify-center text-xs shrink-0">{it.nama?.charAt(0)}</span>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{it.nama}</p>
                                                                <p className="text-[10px] text-slate-400 truncate">{[it.jenjang_jabatan, it.eselon_1].filter(Boolean).join(" · ")}</p>
                                                            </div>
                                                        </div>
                                                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">{it.bidang_keahlian || "Instruktur"}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* STEP 4 — tabel selalu tampil, aksi hanya sebelum stage 5 */}
                                {step.id === 4 && (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {stage < 5 && canEdit && (
                                                    <ImportPesertaAction
                                                        idPelatihan={id}
                                                        statusApproval={data.StatusApproval}
                                                        onSuccess={fetchData}
                                                        onAddHistory={(msg) => handleAddHistoryTrainingInExisting(data, msg, Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`)}
                                                    />
                                                )}
                                                <ZipPhotoParticipantAction users={data.UserPelatihan} onSuccess={fetchData} />
                                                {stage < 5 && hasPeserta && validPeserta < totalPeserta && <ValidateParticipantAction data={data.UserPelatihan} onSuccess={fetchData} />}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="text-slate-500">Total <b className="text-slate-900 dark:text-white tabular-nums">{totalPeserta}</b></span>
                                                <span className="text-slate-500">Valid <b className="text-emerald-600 tabular-nums">{validPeserta}</b></span>
                                                {totalPeserta > validPeserta && <span className="text-slate-500">Belum <b className="text-amber-600 tabular-nums">{totalPeserta - validPeserta}</b></span>}
                                            </div>
                                        </div>
                                        <div className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                                            <UserPelatihanTable pelatihan={data} data={peserta} onSuccess={fetchData} />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 5 */}
                                {step.id === 5 && (
                                    <div className="space-y-3">
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {readiness.map((r) => (
                                                <li key={r.label}>
                                                    <button
                                                        type="button"
                                                        onClick={() => !r.done && focusStep(r.step)}
                                                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl ring-1 text-left ${r.done ? "bg-emerald-50/60 ring-emerald-100 dark:bg-emerald-950/20 dark:ring-emerald-900/40 cursor-default" : "bg-rose-50/60 ring-rose-100 hover:ring-rose-200 dark:bg-rose-950/20 dark:ring-rose-900/40"}`}
                                                    >
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white ${r.done ? "bg-emerald-500" : "bg-rose-400"}`}>
                                                            {r.done ? <TbCheck className="w-3 h-3" /> : <TbAlertCircle className="w-3 h-3" />}
                                                        </span>
                                                        <span className={`text-xs font-semibold ${r.done ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{r.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        {isAdmin && isDraftOrRevisi && canSubmitSPV && (
                                            <SendNoteAction idPelatihan={id} title="Kirim ke SPV" description="Ajukan pelaksanaan ke SPV untuk diverifikasi." buttonLabel="Ajukan ke SPV Sekarang" icon={Send} buttonColor="blue" onSuccess={fetchData} status="1" pelatihan={data} />
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Navigasi langkah */}
                    <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                            disabled={current === 0}
                            className="h-10 px-3.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 disabled:invisible"
                        >
                            <TbArrowLeft className="w-4 h-4" /> Sebelumnya
                        </button>
                        <div className="flex items-center gap-1.5" aria-hidden>
                            {steps.map((s, i) => (
                                <span key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#0B1B3F] dark:bg-sky-400" : s.state === "done" ? "w-1.5 bg-emerald-400" : "w-1.5 bg-slate-200 dark:bg-slate-700"}`} />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
                            disabled={current === steps.length - 1}
                            className="h-10 px-4 rounded-xl bg-[#0B1B3F] hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-1.5 disabled:invisible"
                        >
                            Berikutnya <TbArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ============================ UI ============================ */

function InfoSection({ title, icon: Icon, children }: { title: string; icon: IconType; children: React.ReactNode }) {
    return (
        <div className="rounded-xl ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{title}</h4>
            </div>
            <dl className="px-3.5 py-1 divide-y divide-slate-100 dark:divide-slate-800">{children}</dl>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, mono }: { label: string; value?: string | number | null; icon: IconType; mono?: boolean }) {
    const empty = value === undefined || value === null || value === "";
    return (
        <div className="flex items-start gap-2.5 py-2">
            <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
                <dt className="text-[10px] text-slate-400">{label}</dt>
                <dd className={`text-xs font-semibold break-words ${empty ? "text-slate-300" : "text-slate-800 dark:text-slate-200"} ${mono ? "font-mono" : ""}`}>{empty ? "—" : String(value)}</dd>
            </div>
        </div>
    );
}

function EmptyHint({ icon: Icon, title, desc }: { icon: IconType; title: string; desc?: string }) {
    return (
        <div className="py-6 flex flex-col items-center gap-1.5 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Icon className="w-7 h-7 text-slate-300" />
            <p className="text-xs font-bold text-slate-500">{title}</p>
            {desc && <p className="text-[11px] text-slate-400">{desc}</p>}
        </div>
    );
}

export default PelatihanDetail;

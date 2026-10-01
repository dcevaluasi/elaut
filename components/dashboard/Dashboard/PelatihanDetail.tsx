"use client";

import React, { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import { truncateText } from "@/utils";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import Link from "next/link";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import {
    TbSchool,
    TbCalendar,
    TbCategory,
    TbClock,
    TbMapPin,
    TbRocket,
    TbSettings,
    TbSignature,
    TbTag,
    TbCertificate,
    TbBuildingSkyscraper,
    TbHierarchy,
    TbCash,
    TbUserCode,
    TbUserShare,
    TbExternalLink,
    TbLayoutGrid,
    TbUsers,
    TbStar
} from "react-icons/tb";
import { isMoreThanToday } from "@/utils/time";
import { countValidKeterangan } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { useFetchDataInstrukturSelected } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { Badge } from "@/components/ui/badge";
import { ModulPelatihan } from "@/types/module";
import { stringToArray } from "@/utils/input";
import AccordionSection from "@/components/reusables/AccordionSection";
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
    LayoutGrid,
    Users,
    FileText,
    GraduationCap,
    ShieldCheck,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Clock,
    Send,
    Trash2,
    Download,
    Lock,
    UserCheck,
    Globe,
    Calendar,
    Building
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { MdOutlineDescription } from "react-icons/md";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
}

type ColorScheme = "blue" | "indigo" | "emerald" | "amber" | "rose" | "violet" | "teal" | "cyan" | "slate";

const ColorfulInfoItem = ({
    label,
    value,
    icon: Icon,
    colorScheme = "blue"
}: {
    label: string;
    value?: string | number;
    icon: any;
    colorScheme?: ColorScheme;
}) => {
    const schemes: Record<ColorScheme, { bg: string; border: string; iconBg: string; text: string }> = {
        blue: {
            bg: "bg-blue-50/70 dark:bg-blue-950/40",
            border: "border-blue-200/80 dark:border-blue-900/50",
            iconBg: "bg-blue-600 text-white",
            text: "text-blue-950 dark:text-blue-100",
        },
        indigo: {
            bg: "bg-indigo-50/70 dark:bg-indigo-950/40",
            border: "border-indigo-200/80 dark:border-indigo-900/50",
            iconBg: "bg-indigo-600 text-white",
            text: "text-indigo-950 dark:text-indigo-100",
        },
        emerald: {
            bg: "bg-emerald-50/70 dark:bg-emerald-950/40",
            border: "border-emerald-200/80 dark:border-emerald-900/50",
            iconBg: "bg-emerald-600 text-white",
            text: "text-emerald-950 dark:text-emerald-100",
        },
        amber: {
            bg: "bg-amber-50/70 dark:bg-amber-950/40",
            border: "border-amber-200/80 dark:border-amber-900/50",
            iconBg: "bg-amber-600 text-white",
            text: "text-amber-950 dark:text-amber-100",
        },
        rose: {
            bg: "bg-rose-50/70 dark:bg-rose-950/40",
            border: "border-rose-200/80 dark:border-rose-900/50",
            iconBg: "bg-rose-600 text-white",
            text: "text-rose-950 dark:text-rose-100",
        },
        violet: {
            bg: "bg-violet-50/70 dark:bg-violet-950/40",
            border: "border-violet-200/80 dark:border-violet-900/50",
            iconBg: "bg-violet-600 text-white",
            text: "text-violet-950 dark:text-violet-100",
        },
        teal: {
            bg: "bg-teal-50/70 dark:bg-teal-950/40",
            border: "border-teal-200/80 dark:border-teal-900/50",
            iconBg: "bg-teal-600 text-white",
            text: "text-teal-950 dark:text-teal-100",
        },
        cyan: {
            bg: "bg-cyan-50/70 dark:bg-cyan-950/40",
            border: "border-cyan-200/80 dark:border-cyan-900/50",
            iconBg: "bg-cyan-600 text-white",
            text: "text-cyan-950 dark:text-cyan-100",
        },
        slate: {
            bg: "bg-slate-100/70 dark:bg-slate-900",
            border: "border-slate-200 dark:border-slate-800",
            iconBg: "bg-slate-700 text-white",
            text: "text-slate-900 dark:text-white",
        }
    };

    const style = schemes[colorScheme] || schemes.blue;

    return (
        <div className={`p-3 rounded-2xl border ${style.bg} ${style.border} flex items-center gap-3 transition-all hover:shadow-sm`}>
            <div className={`w-8 h-8 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider block leading-none mb-1">
                    {label}
                </span>
                <span className={`text-xs font-black truncate block ${style.text}`}>
                    {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
                </span>
            </div>
        </div>
    );
};

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan);
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan);
    const { instrukturs, fetchInstrukturData } = useFetchDataInstrukturSelected(stringToArray(data?.Instruktur));
    const { data: modulPelatihan } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri);

    const [expandedModul, setExpandedModul] = useState<number | null>(null);

    const toggleExpandModul = (id: number) => {
        setExpandedModul(expandedModul === id ? null : id);
    };

    React.useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    return (
        <div className="w-full space-y-4 py-1">

            {/* Accordions */}
            <Accordion
                type="multiple"
                className="w-full space-y-3"
                defaultValue={["pins", "publish", "peserta", "perangkat", "instruktur"]}
            >
                {/* General Info - Grouped Data Specification Grid */}
                <AccordionSection
                    value="pins"
                    title="Informasi Umum Pelatihan"
                    icon={<TbSchool className="text-blue-600" />}
                    description="Rincian lengkap data pelatihan, pembiayaan, lokasi, jadwal, dan dokumen legalitas."
                >
                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                            <EditPelatihanAction
                                idPelatihan={data.IdPelatihan.toString()}
                                currentData={data}
                                onSuccess={fetchData}
                            />
                            <DeletePelatihanAction
                                idPelatihan={data!.IdPelatihan.toString()}
                                pelatihan={data}
                                handleFetchingData={fetchData}
                            />

                            {/* Action Buttons & Summary Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                                <div className="flex flex-wrap items-center gap-2">
                                    {Cookies.get('Access')?.includes('createPelatihan') && (
                                        <>
                                            <UploadSuratButton
                                                idPelatihan={String(data.IdPelatihan)}
                                                pelatihan={data}
                                                handleFetchingData={fetchData}
                                            />

                                            {data.SuratPemberitahuan !== "" && (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") ? (
                                                data?.UserPelatihan?.length !== 0 ? (
                                                    <SendNoteAction
                                                        idPelatihan={data.IdPelatihan.toString()}
                                                        title="Kirim ke SPV"
                                                        description="Apakah Anda yakin ingin mengirim pelaksanaan ini ke SPV untuk verifikasi?"
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
                                                        size="sm"
                                                        className="h-9 px-4 rounded-xl border-blue-200 text-blue-600 font-bold text-xs hover:bg-blue-50"
                                                        onClick={() => {
                                                            Toast.fire({
                                                                icon: "warning",
                                                                title: "Lengkapi Data Pelatihan",
                                                                html: `
                                                        <div class="text-left mt-2 space-y-1 text-xs text-slate-600">
                                                            ${data?.ModuleMateri === "" ? "• Modul/Materi belum diisi" : ""}
                                                            ${!data?.UserPelatihan || data?.UserPelatihan.length === 0 ? "• Peserta pelatihan belum ditambahkan" : ""}
                                                            ${data?.SuratPemberitahuan === "" ? "• Surat Pemberitahuan belum diupload" : ""}
                                                        </div>
                                                    `,
                                                            });
                                                        }}
                                                    >
                                                        <Send className="h-3.5 w-3.5 mr-1" />
                                                        Kirim ke SPV
                                                    </Button>
                                                )
                                            ) : null}

                                            {data.SuratPemberitahuan !== "" && data.StatusPenerbitan === "3" && (
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
                                            )}

                                            {(data.StatusPenerbitan === "4" || data.StatusPenerbitan === "1.1") && isMoreThanToday(data.TanggalBerakhirPelatihan) && (
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Tutup Pelatihan"
                                                    description="Dengan menutup pelatihan ini, proses selanjutnya adalah penerbitan STTPL."
                                                    buttonLabel="Tutup Pelatihan"
                                                    icon={Clock}
                                                    buttonColor="neutral"
                                                    onSuccess={fetchData}
                                                    status={"5"}
                                                    pelatihan={data}
                                                />
                                            )}

                                            {data.StatusPenerbitan === "5" && (
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Ajukan Penerbitan STTPL"
                                                    description="Segera ajukan penerbitan STTPL untuk pelatihan ini."
                                                    buttonLabel="Ajukan Penerbitan STTPL"
                                                    icon={CheckCircle2}
                                                    buttonColor="blue"
                                                    onSuccess={fetchData}
                                                    status={"6"}
                                                    pelatihan={data}
                                                />
                                            )}
                                        </>
                                    )}

                                    {Cookies.get('Access')?.includes('supervisePelaksanaan') && data.StatusPenerbitan === "1" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Perbaikan Pelaksanaan"
                                                description="Berikan catatan perbaikan kepada operator."
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
                                                description="Menunjuk verifikator verifikasi pelaksanaan"
                                                buttonLabel="Pilih Verifikator"
                                                icon={TbSettings}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"2"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}

                                    {Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan === "2" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Perbaikan Pelaksanaan"
                                                description="Minta perbaikan kelengkapan administrasi"
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
                                                description="Setujui pelaksanaan pelatihan ini."
                                                buttonLabel="Setujui Pelaksanaan"
                                                icon={ShieldCheck}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"4"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Group 1: Identitas & Program Pelatihan */}
                        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                <TbTag className="w-4 h-4 text-blue-600" />
                                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                                    Identitas & Program Pelatihan
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                <ColorfulInfoItem label="Kode Pelatihan / Kelas" value={data.KodePelatihan} icon={TbTag} colorScheme="blue" />
                                <ColorfulInfoItem label="Nama Pelatihan (ID)" value={data.NamaPelatihan} icon={TbSchool} colorScheme="indigo" />
                                <ColorfulInfoItem label="Nama Pelatihan (EN)" value={data.NamaPelathanInggris} icon={Globe} colorScheme="violet" />
                                <ColorfulInfoItem label="Sektor / Jenis Program" value={data.JenisProgram} icon={TbHierarchy} colorScheme="indigo" />
                                <ColorfulInfoItem label="Klaster / Bidang" value={data?.BidangPelatihan} icon={TbCategory} colorScheme="amber" />
                                <ColorfulInfoItem label="Program Utama" value={data.Program} icon={TbRocket} colorScheme="emerald" />
                                <ColorfulInfoItem label="Program Terobosan KKP" value={data.DukunganProgramTerobosan} icon={TbStar} colorScheme="amber" />
                            </div>
                        </div>

                        {/* Group 2: Waktu & Jadwal Pelaksanaan */}
                        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                <TbCalendar className="w-4 h-4 text-emerald-600" />
                                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                                    Waktu & Jadwal Pelaksanaan
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <ColorfulInfoItem label="Tanggal Mulai Diklat" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} icon={TbCalendar} colorScheme="blue" />
                                <ColorfulInfoItem label="Tanggal Selesai Diklat" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} icon={TbClock} colorScheme="blue" />
                                <ColorfulInfoItem label="Mulai Pendaftaran" value={data.TanggalMulaiPendaftaran ? generateTanggalPelatihan(data.TanggalMulaiPendaftaran) : "-"} icon={TbCalendar} colorScheme="teal" />
                                <ColorfulInfoItem label="Tutup Pendaftaran" value={data.TanggalAkhirPendaftaran || data.TanggalBerakhirPendaftaran ? generateTanggalPelatihan(data.TanggalAkhirPendaftaran || data.TanggalBerakhirPendaftaran!) : "-"} icon={TbClock} colorScheme="rose" />
                            </div>
                        </div>

                        {/* Group 3: Penyelenggara & Pembiayaan */}
                        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                <TbBuildingSkyscraper className="w-4 h-4 text-violet-600" />
                                <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                                    Penyelenggara, Pembiayaan & Akses
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                <ColorfulInfoItem label="Lembaga Penyelenggara" value={data.PenyelenggaraPelatihan} icon={TbBuildingSkyscraper} colorScheme="cyan" />
                                <ColorfulInfoItem label="Sumber Pembiayaan" value={data.JenisPelatihan} icon={TbCash} colorScheme="rose" />
                                {data?.JenisPelatihan === JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && (
                                    <ColorfulInfoItem label="Biaya Pelatihan" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} icon={TbCash} colorScheme="rose" />
                                )}
                                <ColorfulInfoItem label="Kuota Peserta" value={data.KoutaPelatihan ? `${data.KoutaPelatihan} Orang` : "-"} icon={Users} colorScheme="violet" />
                                <ColorfulInfoItem label="Lokasi Pelaksanaan" value={data.LokasiPelatihan} icon={TbMapPin} colorScheme="emerald" />
                                <ColorfulInfoItem label="Metode Pelaksanaan" value={data.PelaksanaanPelatihan} icon={TbSchool} colorScheme="indigo" />
                                <ColorfulInfoItem label="Asal Pelatihan" value={data.AsalPelatihan} icon={Building} colorScheme="cyan" />
                            </div>
                        </div>

                        {/* Group 4: Legalitas, Sertifikasi & Surat Pemberitahuan */}
                        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <TbCertificate className="w-4 h-4 text-amber-600" />
                                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                                        Legalitas, Sertifikasi & Dokumen Pelatihan
                                    </h4>
                                </div>
                            </div>

                            {/* Surat Pemberitahuan Card inside Informasi Umum */}
                            <div className="p-3.5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-widest block leading-none mb-0.5">
                                            Surat Pemberitahuan Pelatihan
                                        </span>
                                        {data?.SuratPemberitahuan ? (
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block max-w-xs">
                                                {data?.SuratPemberitahuan}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                <Lock className="w-3.5 h-3.5" /> Surat Pemberitahuan belum diunggah
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {data?.SuratPemberitahuan && (
                                        <Link
                                            target="_blank"
                                            href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`}
                                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Lihat Surat Pemberitahuan</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                                <ColorfulInfoItem label="Penandatangan Sertifikat" value={data.TtdSertifikat} icon={TbSignature} colorScheme="slate" />
                                <ColorfulInfoItem label="Jenis Sertifikat" value={data.JenisSertifikat} icon={TbCertificate} colorScheme="teal" />
                                <ColorfulInfoItem label="Uji Kompetensi" value={data.UjiKompotensi} icon={ShieldCheck} colorScheme="amber" />
                                <ColorfulInfoItem label="Judul/Deskripsi Sertifikat" value={data.DeskripsiSertifikat} icon={FileText} colorScheme="blue" />
                                <ColorfulInfoItem label="Dibuat Pada" value={data.CreateAt ? generateTanggalPelatihan(data.CreateAt) : "-"} icon={Calendar} colorScheme="slate" />
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                {/* Promotion & Publish Section */}
                {Cookies.get('Access')?.includes('createPelatihan') && (
                    <AccordionSection
                        value="publish"
                        title="Promosi & Publikasi Portal"
                        icon={<TbLayoutGrid className="text-indigo-600" />}
                        description="Tampilan flyer pendaftaran dan rincian promosi."
                    >
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <EditPublishAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentDetail={data.DetailPelatihan}
                                    currentFoto={data.FotoPelatihan}
                                    tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                    currentData={data}
                                    onSuccess={fetchData}
                                />
                                {data?.FotoPelatihan !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && (
                                    <PublishButton
                                        title={data!.Status === "Publish" ? "Take Down" : "Publish"}
                                        statusPelatihan={data?.Status ?? ""}
                                        idPelatihan={data!.IdPelatihan.toString()}
                                        handleFetchingData={fetchData}
                                    />
                                )}
                            </div>

                            {data?.FotoPelatihan !== "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? (
                                <div className="flex flex-col sm:flex-row gap-4 bg-slate-50/80 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4">
                                    <div className="w-28 h-36 rounded-lg overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-800">
                                        <Image
                                            className="w-full h-full object-cover"
                                            alt={data.NamaPelatihan}
                                            src={replaceUrl(data.FotoPelatihan)}
                                            fill
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <ColorfulInfoItem label="Pendaftaran Dibuka" value={generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} icon={TbCalendar} colorScheme="blue" />
                                            <ColorfulInfoItem label="Pendaftaran Ditutup" value={generateTanggalPelatihan(data.TanggalAkhirPendaftaran!)} icon={TbClock} colorScheme="rose" />
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Deskripsi Promosi:</span>
                                            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-snug">
                                                {data.DetailPelatihan || "Belum ada deskripsi."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center text-xs text-slate-400 font-semibold italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    Flyer pendaftaran dan deskripsi publikasi belum diatur.
                                </div>
                            )}
                        </div>
                    </AccordionSection>
                )}

                {/* Modules Section */}
                <AccordionSection
                    value="perangkat"
                    title="Perangkat & Modul Pembelajaran"
                    icon={<TbUserCode className="text-emerald-600" />}
                    description="Daftar modul pengajaran dan bahan tayang pendukung."
                >
                    <div className="space-y-3">
                        {(data?.StatusPenerbitan === "0" || data?.StatusPenerbitan === "1.2" || data?.StatusPenerbitan === "3") && Cookies.get('Access')?.includes('createPelatihan') && (
                            <ChooseModulAction
                                idPelatihan={data.IdPelatihan.toString()}
                                currentData={data}
                                onSuccess={fetchData}
                            />
                        )}

                        {data.ModuleMateri === "" ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                Modul/materi pelatihan belum dipilih.
                            </div>
                        ) : (
                            <div className="bg-slate-50/80 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                                            {modulPelatihan?.BidangMateriPelatihan || "MODUL MATERI"} • TAHUN {modulPelatihan?.Tahun}
                                        </span>
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{modulPelatihan?.NamaMateriPelatihan}</h4>
                                    </div>
                                    <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs">
                                        {modulPelatihan?.ModulPelatihan?.length || 0} Unit Modul
                                    </Badge>
                                </div>

                                <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                                    {modulPelatihan?.ModulPelatihan?.map((modul: ModulPelatihan) => (
                                        <div key={modul.IdModulPelatihan} className="py-2 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                                                    <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <span>{modul.NamaModulPelatihan}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`}
                                                        target="_blank"
                                                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded"
                                                    >
                                                        <Download className="w-3 h-3" /> Modul
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandModul(modul.IdModulPelatihan)}
                                                        className="text-slate-400 hover:text-slate-600 p-0.5"
                                                    >
                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedModul === modul.IdModulPelatihan ? "rotate-180" : ""}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedModul === modul.IdModulPelatihan && (
                                                <div className="pl-6 pt-1 text-xs space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bahan Tayang:</span>
                                                    {modul.BahanTayang?.length === 0 ? (
                                                        <span className="text-slate-400 italic">Tidak ada bahan tayang tambahan.</span>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {modul.BahanTayang?.map((bt, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                                    <span>• {bt.NamaBahanTayang}</span>
                                                                    <Link
                                                                        href={bt.BahanTayang ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${bt.BahanTayang}` : bt.LinkVideo}
                                                                        target="_blank"
                                                                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                                                                    >
                                                                        Lihat <TbExternalLink className="w-3 h-3" />
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Instructors Section */}
                <AccordionSection
                    value="instruktur"
                    title="Tenaga Pelatih & Instruktur"
                    icon={<TbUsers className="text-amber-600" />}
                    description="Tim instruktur pengajar yang ditugaskan."
                >
                    <div className="space-y-3">
                        <ChooseInstrukturAction
                            idPelatihan={data.IdPelatihan.toString()}
                            currentData={data}
                            onSuccess={fetchData}
                        />

                        {data?.Instruktur === "" ? (
                            <div className="py-4 text-center text-xs text-slate-400 font-semibold italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                Instruktur pengajar belum dipetakan.
                            </div>
                        ) : (
                            <div className="bg-slate-50/80 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-200/80 dark:divide-slate-800 overflow-hidden">
                                {instrukturs?.map((item, idx) => (
                                    <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                                                {item.nama.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-900 dark:text-white">{item.nama}</span>
                                                    <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[9px] px-1.5 py-0 border-none">
                                                        {item.bidang_keahlian || "AHLI MATERI"}
                                                    </Badge>
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-medium">{item.jenjang_jabatan} • {item.eselon_1}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                                            <span>NIP: <strong className="text-slate-800 dark:text-slate-200">{item.nip || "-"}</strong></span>
                                            <span>Tel: <strong className="text-slate-800 dark:text-slate-200">{item.no_telpon || "-"}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Participants Section */}
                {parseInt(data?.StatusPenerbitan) < 5 && (
                    <AccordionSection
                        value="peserta"
                        title="Manajemen Peserta Pelatihan"
                        icon={<TbUsers className="text-rose-600" />}
                        description="Daftar peserta terdaftar dan validasi data."
                    >
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    {(data?.StatusPenerbitan === "0" || data?.StatusPenerbitan === "1.2" || data?.StatusPenerbitan === "3") && (
                                        <ImportPesertaAction
                                            idPelatihan={data?.IdPelatihan.toString()}
                                            statusApproval={data?.StatusApproval}
                                            onSuccess={fetchData}
                                            onAddHistory={(msg) =>
                                                handleAddHistoryTrainingInExisting(data!, msg, Cookies.get("Role"), `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`)
                                            }
                                        />
                                    )}
                                    <ZipPhotoParticipantAction users={data?.UserPelatihan} onSuccess={fetchData} />
                                    {data?.UserPelatihan?.length !== 0 && countValidKeterangan(data?.UserPelatihan) < data?.UserPelatihan?.length && (
                                        <ValidateParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <span>Total: <strong className="text-blue-600">{data?.UserPelatihan?.length || 0} Orang</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span>Valid: <strong className="text-emerald-600">{countValidKeterangan(data?.UserPelatihan)} Orang</strong></span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                                <UserPelatihanTable pelatihan={data} data={data?.UserPelatihan || []} onSuccess={fetchData} />
                            </div>
                        </div>
                    </AccordionSection>
                )}
            </Accordion>
        </div>
    );
};

export default PelatihanDetail;

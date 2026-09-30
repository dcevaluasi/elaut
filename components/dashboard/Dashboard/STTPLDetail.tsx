"use client";

import React, { useRef } from "react";
import { Accordion } from "@/components/ui/accordion";
import AccordionSection from "@/components/reusables/AccordionSection";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Cookies from "js-cookie";
import Link from "next/link";
import { urlFileBeritaAcara, urlFileLapwas } from "@/constants/urls";
import {
    TbPencilCheck,
    TbPencilX,
    TbSend,
    TbSettings,
    TbDownload,
    TbCertificate,
    TbShieldCheck,
    TbExternalLink,
    TbUsers,
    TbFileText
} from "react-icons/tb";
import { LuSignature } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import {
    countUserWithCertificate,
    countUserWithNoStatus,
    countUserWithPassed
} from "@/utils/counter";
import TTDeDetail from "./TTDeDetail";
import { ESELON_1 } from "@/constants/nomenclatures";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { downloadAndZipPDFs } from "@/utils/file";
import SendNoteAction from "@/commons/actions/lemdiklat/SendNoteAction";
import { PassedParticipantAction } from "@/commons/actions/lemdiklat/PassedParticipantAction";
import HistoryButton from "@/commons/actions/HistoryButton";
import { truncateText } from "@/utils";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import DialogSertifikatPelatihan, { DialogSertifikatHandle } from "@/components/sertifikat/dialogSertifikatPelatihan";
import { Progress } from "@/components/ui/progress";
import Toast from "@/commons/Toast";
import { motion } from "framer-motion";
import {
    LayoutGrid,
    ShieldCheck,
    FileText,
    Download,
    Printer,
    CheckCircle2,
    Lock,
    Sparkles,
    Award,
    Users,
    FileCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: () => void;
}

const MetricCard = ({ label, value, colorScheme, icon: Icon }: { label: string; value: string; colorScheme: "blue" | "emerald" | "amber" | "indigo"; icon: any }) => {
    const schemes = {
        blue: {
            bg: "bg-blue-50/70 dark:bg-blue-950/40",
            border: "border-blue-200/80 dark:border-blue-900/50",
            iconBg: "bg-blue-600 text-white",
            text: "text-blue-950 dark:text-blue-100",
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
        indigo: {
            bg: "bg-indigo-50/70 dark:bg-indigo-950/40",
            border: "border-indigo-200/80 dark:border-indigo-900/50",
            iconBg: "bg-indigo-600 text-white",
            text: "text-indigo-950 dark:text-indigo-100",
        },
    };

    const style = schemes[colorScheme] || schemes.blue;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className={`p-4 rounded-2xl border ${style.bg} ${style.border} flex items-center justify-between gap-4 transition-all shadow-sm`}
        >
            <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider block leading-none">
                    {label}
                </span>
                <span className={`text-2xl font-black tabular-nums tracking-tight block ${style.text}`}>
                    {value}
                </span>
            </div>
            <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
        </motion.div>
    );
};

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan);
    const { adminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan);
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [progress, setProgress] = React.useState<number>(0);
    const [counter, setCounter] = React.useState<number>(0);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);
    const [isZipping, setIsZipping] = React.useState(false);

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

    const handleDownloadZip = async () => {
        setIsZipping(true);
        try {
            await downloadAndZipPDFs(
                data.UserPelatihan,
                `(${data!.Program}) ${data!.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(data!.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data!.TanggalBerakhirPelatihan)}`,
            );
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <div className="w-full space-y-4 py-1">
            {/* Top Workflow Control Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white leading-none">Penerbitan STTPL Digital</h3>
                                <Badge className={`text-[9px] font-black uppercase ${color} text-white border-none px-2 py-0.5`}>
                                    Stage {data.StatusPenerbitan}
                                </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Status Alur: <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span></p>
                        </div>
                    </div>

                    <HistoryButton
                        pelatihan={data!}
                        statusPelatihan={data?.Status ?? ""}
                        idPelatihan={data!.IdPelatihan.toString()}
                        handleFetchingData={fetchData}
                    />
                </div>

                {/* Workflow Action Buttons Bar */}
                <div className="pt-3 flex flex-wrap items-center gap-2">
                    {Cookies.get('Access')?.includes('createPelatihan') && (
                        <>
                            {data.StatusPenerbitan === "5" && (
                                countUserWithNoStatus(data?.UserPelatihan) === 0 ? (
                                    <SendNoteAction
                                        idPelatihan={data.IdPelatihan.toString()}
                                        title="Ajukan Penerbitan STTPL"
                                        description="Segera ajukan penerbitan STTPL, siapkan dokumen kelengkapan sebelum proses pengajuan!"
                                        buttonLabel="Ajukan Penerbitan STTPL"
                                        icon={LuSignature}
                                        buttonColor="blue"
                                        onSuccess={fetchData}
                                        status={"6"}
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
                                                title: "Lengkapi Status Peserta Terlebih Dahulu",
                                                html: `
                                                    <ul style="text-align:left; margin-top:8px;" class="space-y-1 text-xs text-slate-600">
                                                        ${data?.BeritaAcara === "" ? "<li>• Laporan pelaksanaan belum diupload</li>" : ""}
                                                        ${countUserWithPassed(data?.UserPelatihan) !== data?.UserPelatihan.length ? "<li>• Kelulusan peserta belum disetujui seluruhnya</li>" : ""}
                                                    </ul>
                                                `,
                                            });
                                        }}
                                    >
                                        <LuSignature className="h-4 w-4 mr-1.5" />
                                        Ajukan Penerbitan STTPL
                                    </Button>
                                )
                            )}

                            {(data.StatusPenerbitan === "7" || data.StatusPenerbitan === "9") && (
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
                            )}
                        </>
                    )}

                    {Cookies.get("Access")?.includes("verifyCertificate") && data.StatusPenerbitan === "6" && (
                        <>
                            <SendNoteAction
                                idPelatihan={data.IdPelatihan.toString()}
                                title="Perbaikan"
                                description="Verifikasi pengajuan penerbitan STTPL, berikan catatan perbaikan"
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
                                description="Setujui pengajuan penerbitan STTPL"
                                buttonLabel="Approve Penerbitan"
                                icon={TbPencilCheck}
                                buttonColor="blue"
                                onSuccess={fetchData}
                                status={data?.TtdSertifikat.includes("Kepala Balai") ? "7A" : "8"}
                                pelatihan={data}
                            />
                        </>
                    )}

                    {Cookies.get("Access")?.includes("approveKabalai") && data.StatusPenerbitan === "7A" && (
                        <SendNoteAction
                            idPelatihan={data.IdPelatihan.toString()}
                            title="Approve Penerbitan"
                            description="Melakukan approval pengajuan penerbitan STTPL"
                            buttonLabel="Approve Penerbitan"
                            icon={TbPencilCheck}
                            buttonColor="teal"
                            onSuccess={fetchData}
                            status={"7B"}
                            pelatihan={data}
                        />
                    )}

                    {Cookies.get("Access")?.includes("approveKapus") && data.StatusPenerbitan === "8" && (
                        <SendNoteAction
                            idPelatihan={data.IdPelatihan.toString()}
                            title="Approve Penerbitan"
                            description={
                                data?.TtdSertifikat === ESELON_1.fullName
                                    ? "Approval diteruskan kepada Kepala BPPSDM KP"
                                    : "Approval pengajuan penerbitan STTPL"
                            }
                            buttonLabel="Approve Penerbitan"
                            icon={TbPencilCheck}
                            buttonColor="teal"
                            onSuccess={fetchData}
                            status={data?.TtdSertifikat === ESELON_1.fullName ? "12" : "10"}
                            pelatihan={data}
                        />
                    )}

                    {Cookies.get('Access')?.includes('approveKabadan') && data.StatusPenerbitan === "12" && (
                        <SendNoteAction
                            idPelatihan={data.IdPelatihan.toString()}
                            title="Approve Penerbitan"
                            description="Approval penerbitan STTPL Kepala BPPSDM KP"
                            buttonLabel="Approve Penerbitan"
                            icon={TbPencilCheck}
                            buttonColor="green"
                            onSuccess={fetchData}
                            status={"14"}
                            pelatihan={data}
                        />
                    )}
                </div>
            </div>

            {/* Accordions */}
            <Accordion
                type="multiple"
                className="w-full space-y-3"
                defaultValue={["meta", "peserta"]}
            >
                {/* Metadata & Status Grid */}
                <AccordionSection
                    value="meta"
                    title="Metadata & Persetujuan Dokumen STTPL"
                    icon={<TbSettings className="text-blue-600" />}
                    description="Status penandatanganan, berita acara, dan dokumen pengawasan."
                >
                    <div className="space-y-3">
                        {data.SuratPemberitahuan === "" ? (
                            <div className="py-6 text-center text-xs text-slate-400 font-semibold italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                Harap mengunggah Surat Pemberitahuan Pelatihan terlebih dahulu untuk mengaktifkan alur sertifikasi.
                            </div>
                        ) : (
                            <div className="bg-slate-50/80 dark:bg-slate-950/80 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Pejabat Penandatangan</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{data?.TtdSertifikat || "-"}</span>
                                </div>

                                {data?.BeritaAcara && (
                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Berita Acara Pelaksanaan</span>
                                        <Link target="_blank" href={`${urlFileBeritaAcara}/${data?.BeritaAcara}`} className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{truncateText(data?.BeritaAcara, 15, '...')}</span>
                                        </Link>
                                    </div>
                                )}

                                {data?.MemoPusat && (
                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Memo Lapwas</span>
                                        <Link target="_blank" href={`${urlFileLapwas}/${data?.MemoPusat}`} className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
                                            <TbShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                            <span>Dokumen Lapwas</span>
                                        </Link>
                                    </div>
                                )}

                                {adminPusatData && (
                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1">Verifikator</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">{adminPusatData.Nama}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Signing Hub (If active signer) */}
                {Cookies.get('Role')?.includes(data?.TtdSertifikat) && Cookies.get('Access')?.includes('isSigning') && (parseInt(data.StatusPenerbitan) >= 7 && parseInt(data.StatusPenerbitan) <= 15) && (
                    <div className="relative group">
                        <TTDeDetail data={data} fetchData={fetchData} />
                    </div>
                )}

                {/* Participant Selection & STTPL Table */}
                {!Cookies.get('Access')?.includes('isSigning') && (
                    <AccordionSection
                        value="peserta"
                        title="Daftar Peserta & Status Penerbitan e-STTPL"
                        icon={<TbUsers className="text-rose-600" />}
                        description="Kelola kelulusan peserta, pantau pencetakan e-STTPL, dan unduh berkas digital."
                    >
                        <div className="space-y-3">
                            {/* Action Bar & Quick ZIP download */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    {countUserWithNoStatus(data?.UserPelatihan) !== 0 && (
                                        <PassedParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                    )}

                                    {countUserWithCertificate(data.UserPelatihan) === data.UserPelatihan.length && (
                                        <Button
                                            onClick={handleDownloadZip}
                                            disabled={isZipping}
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4 rounded-xl border-indigo-200 text-indigo-600 font-bold text-xs hover:bg-indigo-50"
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            <span>{isZipping ? 'Membentuk ZIP...' : 'Download ZIP e-STTPL'}</span>
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsPrinting(!isPrinting)}
                                        className="h-8 px-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600"
                                    >
                                        <Printer className="w-3.5 h-3.5 mr-1" />
                                        <span>{isPrinting ? 'Kembali ke Mode Tabel' : 'Mode Cetak Massal'}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                <MetricCard label="Target Kuota" value={data.KoutaPelatihan || "-"} colorScheme="blue" icon={Users} />
                                <MetricCard label="Peserta Terdaftar" value={data.UserPelatihan.length.toString()} colorScheme="indigo" icon={LayoutGrid} />
                                <MetricCard label="Peserta Lulus" value={`${countUserWithPassed(data.UserPelatihan)}/${data.UserPelatihan.length}`} colorScheme="emerald" icon={CheckCircle2} />
                                <MetricCard label="e-STTPL Terbit" value={`${countUserWithCertificate(data?.UserPelatihan)}/${data?.UserPelatihan.length}`} colorScheme="amber" icon={RiVerifiedBadgeFill} />
                            </div>

                            {/* Table / Batch Printing Container */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
                                {isPrinting ? (
                                    <div className="p-4 space-y-4">
                                        {isUploading && (
                                            <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-blue-600 uppercase">Mengunduh Dokumen e-STTPL...</span>
                                                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{Math.round(progress)}%</span>
                                                </div>
                                                <Progress value={progress} className="h-2 rounded-full" />
                                                <p className="text-[10px] text-slate-400 text-center">Memproses {counter} dari {data.UserPelatihan.length} Berkas</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <Button
                                                onClick={handleDownloadAll}
                                                size="sm"
                                                disabled={isUploading}
                                                className="h-9 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold"
                                            >
                                                <Printer className="h-3.5 w-3.5 mr-1.5" />
                                                <span>{isUploading ? 'Proses Unduh...' : 'Download Cetak Massal'}</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsPrinting(false)}
                                                className="text-xs font-bold text-slate-500 hover:text-rose-500"
                                            >
                                                Tutup Mode Print
                                            </Button>
                                        </div>

                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {data.UserPelatihan.map((item, i) => (
                                                <div key={i} className="py-2.5 flex flex-col items-center justify-between text-xs gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white uppercase">{item.Nama}</p>
                                                            <p className="text-[10px] text-slate-400">{item.NoRegistrasi}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full">
                                                        {item.FileSertifikat?.includes('signed') && (
                                                            <Link
                                                                target="_blank"
                                                                href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${item.FileSertifikat}`}
                                                                className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase hover:underline"
                                                            >
                                                                <RiVerifiedBadgeFill className="h-3.5 w-3.5" />
                                                                e-STTPL
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <UserPelatihanTable pelatihan={data} data={data.UserPelatihan} onSuccess={fetchData} />
                                )}
                            </div>
                        </div>
                    </AccordionSection>
                )}
            </Accordion>
        </div>
    );
};

export default STTPLDetail;

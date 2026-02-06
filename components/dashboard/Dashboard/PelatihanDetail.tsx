"use client";

import React from "react";
import {
    Accordion,
} from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import { MdLock } from "react-icons/md";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import { truncateText } from "@/utils";
import Link from "next/link";
import { IoBookOutline, IoDocumentOutline } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import { TbCalendar, TbCategory, TbChevronDown, TbChevronUp, TbClock, TbMapPin, TbPencilCheck, TbPencilCog, TbPencilX, TbRocket, TbSchool, TbSend, TbSettings, TbSignature, TbStar, TbTag, TbCertificate, TbBuildingSkyscraper, TbHierarchy, TbCash, TbUserCode, TbUserShare } from "react-icons/tb";
import { motion } from "framer-motion";
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

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData } = useFetchDataInstrukturSelected(stringToArray(data?.Instruktur))
    console.log({ data })
    /**
     * Modul Pelatihan 
     */
    const { data: modulPelatihan, loading: loadingModulPelatihans, error: errorModulPelatihans, refetch: fetchModulPelatihans } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri)
    const [expanded, setExpanded] = React.useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpanded(expanded === id ? null : id)
    }

    const DetailCard = ({ label, value, icon: Icon, color = "blue" }: { label: string; value?: string; icon: any; color?: string }) => {
        const colors: any = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100",
            emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
            rose: "bg-rose-50 text-rose-600 border-rose-100",
            indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
            slate: "bg-slate-50 text-slate-600 border-slate-100",
        };

        return (
            <div className="group flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${colors[color]} border transition-transform group-hover:scale-110`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
                </div>
                {value?.includes('</p>') ? (
                    <div className="prose prose-sm text-slate-700 leading-relaxed max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                    </div>
                ) : (
                    <span className="text-sm font-bold text-slate-800 line-clamp-2">
                        {value || "-"}
                    </span>
                )}
            </div>
        );
    };

    React.useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    return (
        <div className="w-full space-y-8 py-2">
            {/* Administrative Control Center */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-inner">
                            <TbSettings />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 tracking-tight">Pusat Kontrol Pelaksanaan</h3>
                            <p className="text-xs text-slate-500 font-medium">Kelola status dan verifikasi pelaksanaan pelatihan</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <HistoryButton
                            pelatihan={data!}
                            statusPelatihan={data?.Status ?? ""}
                            idPelatihan={data!.IdPelatihan.toString()}
                            handleFetchingData={fetchData}
                        />
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-col w-full gap-8">
                        {/* Action Toolbar */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tindakan Cepat</span>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
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
                                                    icon={TbSend}
                                                    buttonColor="blue"
                                                    onSuccess={fetchData}
                                                    status={"1"}
                                                    pelatihan={data}
                                                />
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 shadow-sm transition-all border-blue-200 text-blue-600 hover:bg-blue-50"
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
                                                    <TbSend className="h-5 w-5" />
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
                                                icon={TbSend}
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
                                                icon={TbClock}
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
                                                icon={LuSignature}
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
                                            icon={TbPencilX}
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
                                            icon={TbPencilCog}
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
                                            icon={TbPencilX}
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
                                            icon={TbPencilCheck}
                                            buttonColor="teal"
                                            onSuccess={fetchData}
                                            status={"4"}
                                            pelatihan={data}
                                        /></>
                                }
                            </div>
                        </div>

                        {/* Status Grid */}
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Status</span>
                                <div className="h-px flex-1 bg-slate-100"></div>
                            </div>

                            {
                                data.SuratPemberitahuan == "" ?
                                    <div className="py-12 w-full bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center flex-col justify-center gap-3">
                                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <MdLock className='w-7 h-7 text-slate-300' />
                                        </div>
                                        <p className="text-slate-500 text-sm text-center max-w-lg leading-relaxed">
                                            Harap mengupload surat pemberitahuan pelaksanaan pelatihan (Paling Lambat H-3) untuk melanjutkan tahapan verifikasi.
                                        </p>
                                    </div> :
                                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${adminPusatData != null ? 'lg:grid-cols-3' : ''} gap-5`}>
                                        <div className={`flex flex-col p-4 ${color} rounded-2xl shadow-sm border border-white/20 transition-all hover:scale-[1.02]`}>
                                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Status Saat Ini</span>
                                            <span className="flex items-center gap-2 text-white font-bold text-sm">
                                                {icon}
                                                {label}
                                            </span>
                                        </div>

                                        <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors text-xs">Surat Pemberitahuan</span>
                                            <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-sm font-bold text-blue-600 truncate flex items-center gap-1 hover:underline">
                                                <IoDocumentOutline className="shrink-0" />
                                                {truncateText(data?.SuratPemberitahuan, 20, '...')}
                                            </Link>
                                        </div>

                                        {
                                            adminPusatData != null && (
                                                <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors text-xs">Verifikator Pusat</span>
                                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                                        <HiOutlineUserGroup className="shrink-0 text-slate-400" />
                                                        {adminPusatData!.Nama}
                                                    </span>
                                                </div>
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
                defaultValue={["📌 Informasi Umum Pelatihan", "🌐 Publish Informasi dan Promosi", "👥 Peserta Pelatihan", "📑 Perangkat Pelatihan", "🧩 Instruktur atau Pelatih"]}
            >
                <AccordionSection title="📌 Informasi Umum Pelatihan" description="Kelola data dasar pelatihan, sumber pembiayaan, dan detail teknis pelaksanaan.">
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Action:</span>
                                <EditPelatihanAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentData={data}
                                    onSuccess={fetchData} />

                                <DeletePelatihanAction
                                    idPelatihan={data!.IdPelatihan.toString()}
                                    pelatihan={data}
                                    handleFetchingData={fetchData}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DetailCard label="Kode Kelas" value={data.KodePelatihan} icon={TbTag} color="blue" />
                            <DetailCard label="Sektor" value={data.JenisProgram} icon={TbHierarchy} color="indigo" />
                            <DetailCard label="Klaster" value={`${data?.BidangPelatihan}`} icon={TbCategory} color="amber" />
                            <DetailCard label="Program" value={`${data.Program}`} icon={TbRocket} color="emerald" />
                            <DetailCard label="Pembiayaan" value={data.JenisPelatihan} icon={TbCash} color="rose" />
                            <DetailCard label="Penyelenggara" value={data.PenyelenggaraPelatihan} icon={TbBuildingSkyscraper} color="slate" />
                            <DetailCard label="Terobosan" value={data.DukunganProgramTerobosan} icon={TbStar} color="amber" />
                            <DetailCard label="Mulai" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} icon={TbCalendar} color="blue" />
                            <DetailCard label="Selesai" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} icon={TbClock} color="blue" />
                            <DetailCard label="Lokasi" value={data.LokasiPelatihan} icon={TbMapPin} color="emerald" />
                            {data?.JenisPelatihan == JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && (
                                <DetailCard label="Biaya" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} icon={TbCash} color="rose" />
                            )}
                            <DetailCard label="Pelaksanaan" value={data.PelaksanaanPelatihan} icon={TbSchool} color="indigo" />
                            <DetailCard label="Penandatangan" value={data.TtdSertifikat} icon={TbSignature} color="slate" />
                        </div>

                        {parseInt(data?.StatusPenerbitan) >= 5 && (
                            <div className="mt-2 p-1 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                                <div className="bg-white p-5 rounded-[1.4rem] border border-blue-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg border border-blue-400">
                                            <IoDocumentOutline />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surat Pemberitahuan</p>
                                            <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-sm font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                                                {data?.SuratPemberitahuan != '' ? truncateText(data?.SuratPemberitahuan, 40, '...') : "-"}
                                            </Link>
                                        </div>
                                    </div>
                                    <HistoryButton
                                        pelatihan={data!}
                                        statusPelatihan={data?.Status ?? ""}
                                        idPelatihan={data!.IdPelatihan.toString()}
                                        handleFetchingData={fetchData}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Pubish dan Promosi Kelas Pelatihan */}
                {
                    (Cookies.get('Access')?.includes('createPelatihan')) &&
                    <AccordionSection title="🌐 Publish Informasi dan Promosi" description="Sesuaikan tampilan informasi pelatihan di website utama untuk menarik minat calon peserta.">
                        <div className="flex flex-col w-full gap-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Action:</span>
                                    <EditPublishAction
                                        idPelatihan={data.IdPelatihan.toString()}
                                        currentDetail={data.DetailPelatihan}
                                        currentFoto={data.FotoPelatihan}
                                        tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                        currentData={data}
                                        onSuccess={fetchData} />
                                    {
                                        data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && (
                                            data!.Status == "Publish" ? (
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
                                            )
                                        )
                                    }
                                </div>
                            </div>

                            {data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="w-full lg:w-1/3 flex-shrink-0">
                                        <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-slate-100">
                                            <Image
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt={data.NamaPelatihan}
                                                src={replaceUrl(data.FotoPelatihan)}
                                                fill
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                <p className="text-white text-xs font-semibold">Preview Flyer Utama</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <DetailCard label="Pendaftaran Dibuka" value={generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} icon={TbCalendar} color="blue" />
                                            <DetailCard label="Pendaftaran Ditutup" value={generateTanggalPelatihan(data.TanggalAkhirPendaftaran!)} icon={TbClock} color="rose" />
                                        </div>
                                        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 h-full">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Deskripsi Promo</span>
                                            <div className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {data.DetailPelatihan}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-16 w-full bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 border border-slate-100">
                                        <TbUserShare className="w-8 h-8" />
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <h4 className="font-bold text-slate-700 mb-1">Promosi Belum Tersedia</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Lengkapi flyer dan deskripsi pelatihan untuk mulai mempromosikan kelas ini di halaman utama E-LAUT.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </AccordionSection>
                }

                {/* Perangkat Pelatihan */}
                <AccordionSection title="📑 Perangkat Pelatihan" description="Kelola modul pembelajaran, bahan tayang, dan materi pendukung lainnya yang akan diakses oleh peserta.">
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Action:</span>
                                {
                                    ((data?.StatusPenerbitan == "0" || data?.StatusPenerbitan == "1.2" || data?.StatusPenerbitan == "3") && Cookies.get('Access')?.includes('createPelatihan')) &&
                                    <ChooseModulAction
                                        idPelatihan={data.IdPelatihan.toString()}
                                        currentData={data}
                                        onSuccess={fetchData} />
                                }
                            </div>
                        </div>

                        {data.ModuleMateri == "" ? (
                            <div className="py-16 w-full bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 border border-slate-100">
                                    <TbUserCode className="w-8 h-8" />
                                </div>
                                <div className="text-center max-w-sm">
                                    <h4 className="font-bold text-slate-700 mb-1">Perangkat Belum Dipilih</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Silahkan pilih modul pelatihan atau buat modul baru melalui menu master modul pelatihan sebagai perangkat ajar utama.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-lg border border-blue-400">
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-400/30 text-white border-blue-300/40 backdrop-blur-md uppercase tracking-widest text-[10px] px-3 py-1">{modulPelatihan?.BidangMateriPelatihan}</Badge>
                                                <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Tahun {modulPelatihan?.Tahun}</span>
                                            </div>
                                            <h3 className="text-2xl font-extrabold tracking-tight leading-tight max-w-2xl">{modulPelatihan?.NamaMateriPelatihan}</h3>
                                            <p className="text-blue-100/80 text-sm font-medium italic">Produsen: {modulPelatihan?.DeskripsiMateriPelatihan}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-blue-100/60 uppercase tracking-widest">Total Modul</span>
                                            <span className="text-5xl font-black">{modulPelatihan?.ModulPelatihan?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {modulPelatihan?.ModulPelatihan?.map((modul: ModulPelatihan) => (
                                        <div
                                            key={modul.IdModulPelatihan}
                                            onClick={() => toggleExpand(modul.IdModulPelatihan)}
                                            className="group bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                                                        <IoBookOutline className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{modul.NamaModulPelatihan}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FILE MODUL:</span>
                                                            <a href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">Download</a>
                                                        </div>
                                                    </div>
                                                </div>
                                                {expanded === modul.IdModulPelatihan ? <TbChevronUp className="w-6 h-6 text-blue-600" /> : <TbChevronDown className="w-6 h-6 text-slate-300" />}
                                            </div>

                                            {expanded === modul.IdModulPelatihan && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    className="mt-6 pt-6 border-t border-slate-50"
                                                >
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Bahan Penunjang & Media Belajar</span>
                                                    {modul.BahanTayang.length === 0 ? (
                                                        <div className="bg-slate-50/50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                                                            <p className="text-xs text-slate-400 font-medium italic">Belum ada bahan tayang tambahan untuk modul ini</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid gap-3">
                                                            {modul.BahanTayang.map((row_bt, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400">
                                                                            <TbRocket className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-slate-700">{row_bt.NamaBahanTayang}</p>
                                                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{row_bt.CreateAt}</p>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={row_bt.BahanTayang ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}` : row_bt.LinkVideo}
                                                                        target="_blank"
                                                                        className="px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                                                                    >
                                                                        Lihat Materi
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100 flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
                                        <TbSettings className="w-5 h-5" />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        *Untuk menambahkan bahan lainnya sebagai penunjang (video/dokumen), silakan menuju menu <span className="font-bold text-blue-600 underline cursor-pointer">Bahan Ajar</span> atau <span className="font-bold text-blue-600 underline cursor-pointer">Modul Pelatihan</span>. Media yang Anda tambahkan di sana akan otomatis tersinkronisasi dengan modul terkait di halaman ini.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Instruktur/Pelatih */}
                <AccordionSection title="🧩 Instruktur atau Pelatih" description="Daftar tenaga pengajar ahli yang ditugaskan untuk menyampaikan materi dalam pelatihan ini.">
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-white">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Action:</span>
                                <ChooseInstrukturAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentData={data}
                                    onSuccess={fetchData} />
                            </div>
                        </div>

                        {data?.Instruktur == "" ? (
                            <div className="py-16 w-full bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 border border-slate-100">
                                    <HiOutlineUserGroup className="w-8 h-8" />
                                </div>
                                <div className="text-center max-w-sm">
                                    <h4 className="font-bold text-slate-700 mb-1">Instruktur Belum Ditunjuk</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {data?.TtdSertifikat?.includes('Kepala Balai') ? 'Silahkan tentukan instruktur/pelatih dari Lembaga Diklat Anda.' : 'Menunggu penentuan instruktur/pelatih dari Tim Verifikator Pusat.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {instrukturs?.map((item) => (
                                    <div key={item.IdInstruktur} className="relative group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black border border-blue-100 group-hover:scale-110 transition-transform">
                                                        {item.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.nama}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1">{item.bidang_keahlian || "Ahli Materi"}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] uppercase font-bold tracking-widest px-3">Aktif</Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-6">
                                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">NIP</p>
                                                    <p className="text-xs font-bold text-slate-700">{item.nip}</p>
                                                </div>
                                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Telepon</p>
                                                    <p className="text-xs font-bold text-slate-700">{item.no_telpon}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TbCertificate className="w-3 h-3 text-blue-600" />
                                                    <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest">Jabatan & Instansi</p>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-snug">{item.jenjang_jabatan}</p>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1">{item.eselon_1} / {item.eselon_2}</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </AccordionSection>

                {/* Peserta Pelatihan */}
                {
                    parseInt(data?.StatusPenerbitan) < 5 &&
                    <AccordionSection title="👥 Peserta Pelatihan" description="Daftar peserta yang terdaftar dalam pelatihan. Lakukan validasi data atau import peserta baru di sini.">
                        <div className="flex flex-col w-full gap-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Action:</span>
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
                                    <ZipPhotoParticipantAction users={data?.UserPelatihan} onSuccess={fetchData} />
                                    {
                                        (data?.UserPelatihan.length != 0 && countValidKeterangan(data?.UserPelatihan) < data?.UserPelatihan.length) && <ValidateParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                    }
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="group relative overflow-hidden bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Peserta</p>
                                            <p className="text-4xl font-black text-slate-800">{data?.UserPelatihan?.length || 0}</p>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl border border-blue-100 group-hover:scale-110 transition-transform">
                                            <HiOutlineUserGroup />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-40"></div>
                                </div>

                                <div className="group relative overflow-hidden bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Validasi Berhasil</p>
                                            <p className="text-4xl font-black text-emerald-600">{countValidKeterangan(data?.UserPelatihan)}</p>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl border border-emerald-100 group-hover:scale-110 transition-transform">
                                            <TbPencilCheck />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-50 rounded-full opacity-40"></div>
                                </div>
                            </div>

                            <div className="mt-4 bg-white/50 rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                                <UserPelatihanTable pelatihan={data} data={data?.UserPelatihan || []} onSuccess={fetchData} />
                            </div>
                        </div>
                    </AccordionSection>
                }
            </Accordion>
        </div>
    );
};

export default PelatihanDetail;

"use client";

import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import { PublishButton } from "./Actions";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import EditPublishAction from "./Actions/EditPublishAction";
import { MdLock } from "react-icons/md";
import ImportPesertaAction from "./Actions/ImportPesertaAction";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import DeletePelatihanAction from "./Actions/DeletePelatihanAction";
import EditPelatihanAction from "./Actions/EditPelatihanAction";
import { truncateText } from "@/utils";
import Link from "next/link";
import UploadSuratButton from "./Actions/UploadSuratButton";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import SendNoteAction from "./Actions/Lemdiklat/SendNoteAction";
import { TbChevronDown, TbChevronUp, TbClock, TbPencilCheck, TbPencilCog, TbPencilX, TbSend } from "react-icons/tb";
import { isMoreThanToday } from "@/utils/time";
import HistoryButton from "./Actions/HistoryButton";
import { LuSignature } from "react-icons/lu";
import { ValidateParticipantAction } from "./Actions/Lemdiklat/ValidateParticipantAction";
import { countValidKeterangan } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { useFetchDataMateriPelatihanMasyarakat, useFetchDataMateriPelatihanMasyarakatById } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import ChooseModulAction from "./Actions/Modul/ChooseModulAction";
import { Badge } from "@/components/ui/badge";
import { ModulPelatihan } from "@/types/module";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)
    const { instrukturs, loading: loadingInstruktur, error: errorInstruktur, fetchInstrukturData, stats } = useFetchDataInstruktur()

    /**
     * Modul Pelatihan 
     */
    const { data: modulPelatihans, loading: loadingModulPelatihan, error: errorModulPelatihan, fetchModulPelatihan, stats: statsModulPelatihan } = useFetchDataMateriPelatihanMasyarakat();
    const { data: modulPelatihan, loading: loadingModulPelatihans, error: errorModulPelatihans, refetch: fetchModulPelatihans } = useFetchDataMateriPelatihanMasyarakatById(data?.ModuleMateri)
    const [expanded, setExpanded] = React.useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpanded(expanded === id ? null : id)
    }


    React.useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    return (
        <div className="w-full space-y-6 py-5">
            <Accordion
                type="multiple"
                className="w-full space-y-3"
                defaultValue={["📌 Informasi Umum Pelatihan", "🌐 Publish Informasi dan Promosi", "👥 Peserta Pelatihan", "📑 Modul dan Perangkat Pelatihan"]}
            >
                {(parseInt(data?.StatusPenerbitan) < 5) &&
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition">
                            ⚙️ Metadata
                        </div>
                        <div className="px-6 py-4 bg-gray-50">
                            <div className="flex flex-col w-full gap-4">
                                <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                    <p className="font-medium text-gray-600 text-sm">
                                        Action :
                                    </p>
                                    {/* (0) Operator : Send to SPV */}
                                    {
                                        Cookies.get('Access')?.includes('createPelatihan') &&
                                        <>
                                            {/* Upload Surat Pemberitahuan */}
                                            <UploadSuratButton
                                                idPelatihan={String(data.IdPelatihan)}
                                                pelatihan={data}
                                                handleFetchingData={fetchData}
                                            />

                                            {
                                                (data.SuratPemberitahuan != "" && (data.StatusPenerbitan == "0" || data.StatusPenerbitan == "1.2")) &&
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Kirim ke SPV"
                                                    description="Apakah Anda yakin ingin mengirim pelaksanaan ini ke SPV untuk proses verifikasi lebih lanjut?"
                                                    buttonLabel="Send to SPV"
                                                    icon={TbSend}
                                                    buttonColor="blue"
                                                    onSuccess={fetchData}
                                                    status={"1"}
                                                    pelatihan={data}
                                                />
                                            }

                                            {/* (3) Operator : Send to Verifikator After Reject */}
                                            {
                                                (data.SuratPemberitahuan != "" && data.StatusPenerbitan == "3") &&
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Kirim ke Verifikator"
                                                    description="Perbaiki permohonan pelaksanaan sesuai catatan Verifikator"
                                                    buttonLabel="Send to Verifikator"
                                                    icon={TbSend}
                                                    buttonColor="teal"
                                                    onSuccess={fetchData}
                                                    status={"2"}
                                                    pelatihan={data}
                                                />
                                            }

                                            {/* (4) Operator : Close Pelatihan */}
                                            {
                                                ((data.StatusPenerbitan == "4" || data.StatusPenerbitan == "1.1") && isMoreThanToday(data.TanggalBerakhirPelatihan)) &&
                                                <SendNoteAction
                                                    idPelatihan={data.IdPelatihan.toString()}
                                                    title="Tutup Pelatihan"
                                                    description="Dengan menutup pelatihan ini, proses selanjutnya adalah penerbitan STTPL. Segala data terkait pelatihan tidak dapat diedit!"
                                                    buttonLabel="Close Pelatihan"
                                                    icon={TbClock}
                                                    buttonColor="neutral"
                                                    onSuccess={fetchData}
                                                    status={"5"}
                                                    pelatihan={data}
                                                />
                                            }

                                            {/* (5) Operator : Send Penerbitan STTPL */}
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

                                    {/* (1) SPV : Pending  */}
                                    {/* (1) SPV : Pending for Pilih Verifikator  */}
                                    {
                                        (Cookies.get('Access')?.includes('supervisePelaksanaan') && data.StatusPenerbitan == "1") && <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Reject Pelaksanaan"
                                                description="Segera menunjuk verifikator dalam melalukan verifikasi pelaksanaan pelatiha"
                                                buttonLabel="Reject Pelaksanaan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status={"1.2"}
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Pilih Verifikator"
                                                description="Segera menunjuk verifikator dalam melalukan verifikasi pelaksanaan pelatihan"
                                                buttonLabel="Pilih Verifikator"
                                                icon={TbPencilCog}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"2"}
                                                pelatihan={data}
                                            /></>
                                    }

                                    {/* (2) Verifikator : Pending Verifikator for Reject and Approve */}
                                    {
                                        (Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan == "2") &&
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Reject Pelaksanaan"
                                                description="Segera melakukan verifikasi pelaksanaan diklat, pastikan perangkat dan kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Reject Pelaksanaan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status={"3"}
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Pelaksanaan"
                                                description="Segera melakukan verifikasi pelaksanaan diklat, pastikan perangkat dan kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Approve Pelaksanaan"
                                                icon={TbPencilCheck}
                                                buttonColor="teal"
                                                onSuccess={fetchData}
                                                status={"4"}
                                                pelatihan={data}
                                            /></>
                                    }
                                </div>

                                <div className="w-full ">
                                    <p className="font-medium text-gray-600 mb-2 text-sm">
                                        Detail  :
                                    </p>
                                    {
                                        data.SuratPemberitahuan == "" ?
                                            <div className="py-10 w-full max-w-3xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                                <MdLock className='w-14 h-14 text-gray-600' />
                                                <p className="text-gray-500 font-normal text-center">
                                                    Harap mengupload surat pemberitahuan pelaksanaan pelatihan (Paling Lambat H-3 Pelaksaan) dan selanjutnya menunggu verifikasi pelaksanaan agar dapat melanjutkan tahapan berikutnya!
                                                </p>
                                            </div> :
                                            <div className={`grid ${adminPusatData != null ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-4 w-full text-sm`}>
                                                <div className={`flex flex-col p-3 ${color} rounded-lg shadow-sm border border-gray-100 animate-pulse`}>
                                                    <span className="text-xs font-medium text-gray-100">Status</span>
                                                    <span className="flex items-center">{icon}{label}</span>
                                                </div>
                                                <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                                    <span className="text-xs font-medium text-gray-500">Surat Pemberitahuan</span>
                                                    <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-sm font-semibold text-blue-500 mt-1 underline">
                                                        {urlFileSuratPemberitahuan}/{data?.SuratPemberitahuan != '' ? truncateText(data?.SuratPemberitahuan, 10, '...') : "-"}
                                                    </Link>
                                                </div>
                                                {
                                                    adminPusatData != null && <InfoItem label="Verifikator" value={adminPusatData!.Nama} />
                                                }
                                            </div>
                                    }

                                    <HistoryButton
                                        pelatihan={data!}
                                        statusPelatihan={data?.Status ?? ""}
                                        idPelatihan={data!.IdPelatihan.toString()}
                                        handleFetchingData={fetchData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>}

                <AccordionSection title="📌 Informasi Umum Pelatihan">
                    <div className="flex flex-col w-full gap-4">
                        <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                            <p className="font-medium text-gray-600">
                                Action :
                            </p>
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
                        <div className="w-full ">
                            <p className="font-medium text-gray-600 mb-2">
                                Detail  :
                            </p>
                            <SectionGrid>
                                <InfoItem label="Kode Pelatihan" value={data.KodePelatihan} />
                                <InfoItem label="Bidang" value={data.JenisProgram} />
                                <InfoItem label="Program" value={data.Program} />
                                <InfoItem label="Jenis Pelatihan" value={data.JenisPelatihan} />
                                <InfoItem label="Dukungan Program Terobosan" value={data.DukunganProgramTerobosan} />
                                <InfoItem label="Penyelenggara" value={data.PenyelenggaraPelatihan} />
                                <InfoItem label="Mulai Pelatihan" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} />
                                <InfoItem label="Selesai Pelatihan" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} />
                                <InfoItem label="Lokasi" value={data.LokasiPelatihan} />
                                <InfoItem label="Harga" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} />
                                <InfoItem label="Pelaksanaan" value={data.PelaksanaanPelatihan} />
                                <InfoItem label="Penandatangan Sertifikat" value={data.TtdSertifikat} />
                            </SectionGrid>

                            {parseInt(data?.StatusPenerbitan) >= 5 && <>
                                <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border mt-4 border-gray-100">
                                    <span className="text-xs font-medium text-gray-500">Surat Pemberitahuan</span>
                                    <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-sm font-semibold text-blue-500 mt-1 underline">
                                        {urlFileSuratPemberitahuan}/{data?.SuratPemberitahuan != '' ? truncateText(data?.SuratPemberitahuan, 30, '...') : "-"}
                                    </Link>
                                </div>
                                <HistoryButton
                                    pelatihan={data!}
                                    statusPelatihan={data?.Status ?? ""}
                                    idPelatihan={data!.IdPelatihan.toString()}
                                    handleFetchingData={fetchData}
                                /></>}
                        </div>
                    </div>
                </AccordionSection>

                {
                    Cookies.get('Access')?.includes('createPelatihan') && <AccordionSection title="🌐 Publish Informasi dan Promosi">
                        <div className="flex flex-col w-full gap-4">
                            <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                <p className="font-medium text-gray-600">
                                    Action :
                                </p>
                                {
                                    data?.StatusPenerbitan == "0" && <>
                                        <EditPublishAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            currentDetail={data.DetailPelatihan}
                                            currentFoto={data.FotoPelatihan}
                                            tanggalPendaftaran={[data.TanggalMulaiPendaftaran, data.TanggalAkhirPendaftaran!]}
                                            onSuccess={fetchData} />
                                    </>
                                }
                                {
                                    data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" && <>
                                        {
                                            data!.Status == "Publish" ? (
                                                <PublishButton
                                                    title="Take Down"
                                                    statusPelatihan={data?.Status ?? ""}
                                                    idPelatihan={data!.IdPelatihan.toString()}
                                                    handleFetchingData={
                                                        fetchData
                                                    }
                                                />
                                            ) : (
                                                <PublishButton
                                                    title="Publish"
                                                    statusPelatihan={data?.Status ?? ""}
                                                    idPelatihan={data!.IdPelatihan.toString()}
                                                    handleFetchingData={
                                                        fetchData
                                                    }
                                                />
                                            )
                                        }</>
                                }
                            </div>
                            <div className="w-full ">
                                <p className="font-medium text-gray-600 mb-2">
                                    Detail  :
                                </p>
                                {
                                    data?.FotoPelatihan != "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ?
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <InfoItem label="Pendaftaran Dibuka" value={generateTanggalPelatihan(data.TanggalMulaiPendaftaran)} />
                                            <InfoItem label="Pendaftaran Ditutup" value={generateTanggalPelatihan(data.TanggalAkhirPendaftaran!)} />
                                            <div className="flex flex-shrink-0 flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100 h-fit">
                                                <span className="text-xs font-medium text-gray-500">Flyer/Poster</span>
                                                <span className="text-sm font-semibold text-gray-800 mt-1">
                                                    {
                                                        data.FotoPelatihan == "https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/pelatihan/" ? <></> : <Image
                                                            className="w-[400px] h-full object-cover mx-auto flex-shrink-0"
                                                            alt={data.NamaPelatihan}
                                                            src={replaceUrl(data.FotoPelatihan)}
                                                            width={400}
                                                            height={400}
                                                        />
                                                    }
                                                </span>
                                            </div>
                                            <InfoItem label="Deskripsi" value={data.DetailPelatihan} />
                                        </div> : <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                            <MdLock className='w-14 h-14 text-gray-600' />
                                            <p className="text-gray-500 font-normal text-center">
                                                Untuk Melakukan Promosi Melalui Kanal Utama Website E-LAUT, Terlebih Dahulu Untuk Mengatur Informasi Publish Pada Tombol "Edit Informasi Publish". Tahapan Ini Opsional, Apabila Proses Pencarian/Registrasi Peserta Melalui E-LAUT.
                                            </p>
                                        </div>
                                }
                            </div>
                        </div>
                    </AccordionSection>
                }

                {
                    parseInt(data?.StatusPenerbitan) < 5 &&
                    <AccordionSection title="📑 Modul dan Perangkat Pelatihan">
                        <div className="flex flex-col w-full gap-4">
                            <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                <p className="font-medium text-gray-600">
                                    Action :
                                </p>
                                <ChooseModulAction
                                    idPelatihan={data.IdPelatihan.toString()}
                                    currentData={data}
                                    onSuccess={fetchData} />
                            </div>

                            <div className="w-full ">
                                <p className="font-medium text-gray-600 mb-2">
                                    Detail  :
                                </p>
                                <div className="flex flex-col gap-2 w-full">
                                    {
                                        data.ModuleMateri == "" ?
                                            <div className="py-10 w-full max-w-3xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                                <MdLock className='w-14 h-14 text-gray-600' />
                                                <p className="text-gray-500 font-normal text-center">
                                                    Harap memilih modul pelatihan terlebih dahulu, lalu upload bahan ajar/tayang yang diperlukan, apabila tidak tersedia modul yang sesuai, maka pergi ke menu master modul pelatihan dan buat modulmu sendiri lalu upload bahan ajar/tayang mu
                                                </p>
                                            </div> :
                                            <div className="space-y-4">
                                                <div className="border rounded-xl p-4 bg-gray-50">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                                        {modulPelatihan?.NamaMateriPelatihan}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                        <Badge className="bg-blue-500">{modulPelatihan?.BidangMateriPelatihan}</Badge>
                                                        <div>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                Tahun :  {modulPelatihan?.NamaPenderitaMateriPelatihan}
                                                            </p>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                Produsen :  {modulPelatihan?.DeskripsiMateriPelatihan}
                                                            </p>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                Jumlah Materi :  {modulPelatihan?.ModulPelatihan.length} Materi
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Daftar Modul */}
                                                <div>
                                                    <h4 className="font-medium text-sm mb-2 text-gray-700">
                                                        Materi Modul
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {modulPelatihan?.ModulPelatihan?.length || [].length > 0 ? (
                                                            modulPelatihan?.ModulPelatihan.map((modul: ModulPelatihan) => (
                                                                <div
                                                                    key={modul.IdModulPelatihan}
                                                                    onClick={() => toggleExpand(modul.IdModulPelatihan)}
                                                                    className="border rounded-lg p-3 bg-white shadow-sm hover:bg-gray-50 transition cursor-pointer"
                                                                >
                                                                    {/* Header */}
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex gap-0 flex-col leading-none">
                                                                            <p className="text-sm font-medium text-gray-800">
                                                                                {modul.NamaModulPelatihan}
                                                                            </p>

                                                                            <div className="flex flex-col gap-1 mt-2">
                                                                                <div className="flex gap-1 items-center">
                                                                                    <span className="text-gray-600 text-[0.75rem]">File : </span>
                                                                                    <a
                                                                                        href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${modul.FileModule}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-[0.75rem]  text-blue-500 underline truncate"
                                                                                    >
                                                                                        {`${truncateText(process.env.NEXT_PUBLIC_MODULE_FILE_URL + '/' + modul.FileModule, 80, '...')}`}
                                                                                    </a>
                                                                                </div>
                                                                            </div>

                                                                        </div>

                                                                        {expanded === modul.IdModulPelatihan ? (
                                                                            <TbChevronUp className="w-4 h-4 text-gray-500" />
                                                                        ) : (
                                                                            <TbChevronDown className="w-4 h-4 text-gray-500" />
                                                                        )}
                                                                    </div>

                                                                    {/* Expanded Content */}
                                                                    {expanded === modul.IdModulPelatihan && (
                                                                        <div className="mt-2 text-xs text-gray-600 space-y-1 animate-in fade-in-50 slide-in-from-top-1">
                                                                            <p className="text-xs font-medium text-gray-600">
                                                                                Bahan Tayang/Bahan Ajar
                                                                            </p>
                                                                            {
                                                                                modul.BahanTayang.length == 0 ? <tr>
                                                                                    <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                                                                        Belum ada bahan tayang/bahan ajar tersedia
                                                                                    </td>
                                                                                </tr> : <>
                                                                                    <table className="w-full text-xs text-left border">
                                                                                        <thead className="bg-gray-100 text-gray-700 uppercase">
                                                                                            <tr className="text-xs text-center">
                                                                                                <th className="px-3 py-2 border text-xs">No</th>
                                                                                                <th className="px-3 py-2 border text-xs">Action</th>
                                                                                                <th className="px-3 py-2 border text-xs">Nama</th>
                                                                                                <th className="px-3 py-2 border text-xs">File</th>
                                                                                                <th className="px-3 py-2 border text-xs">Produsen</th>
                                                                                                <th className="px-3 py-2 border text-xs">Tanggal Upload</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {modul.BahanTayang.map((row_bt, index) => (
                                                                                                <tr key={row_bt.IdBahanTayang}>
                                                                                                    <td className="px-3 py-2 border">{index + 1}</td>
                                                                                                    <td className="px-3 py-2 border"></td>
                                                                                                    <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                                                    <td className="px-3 py-2 border"> <a
                                                                                                        href={`${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`}
                                                                                                        target="_blank"
                                                                                                        rel="noopener noreferrer"
                                                                                                        className="  text-blue-500  underline "
                                                                                                    >
                                                                                                        {truncateText(row_bt.BahanTayang, 50, '...')}
                                                                                                    </a></td>
                                                                                                    <td className="px-3 py-2 border">{row_bt.Creator || "-"}</td>
                                                                                                    <td className="px-3 py-2 border">{row_bt.CreateAt}</td>
                                                                                                </tr>))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </>

                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">Belum ada modul.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                    }

                                </div>
                            </div >
                        </div >
                    </AccordionSection >
                }

                {
                    parseInt(data?.StatusPenerbitan) < 5 &&
                    <AccordionSection title="👥 Peserta Pelatihan">
                        <div className="flex flex-col w-full gap-4">
                            <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                <p className="font-medium text-gray-600">
                                    Action :
                                </p>
                                {
                                    (data?.StatusPenerbitan == "0" && data?.UserPelatihan?.length == 0) &&
                                    <ImportPesertaAction
                                        idPelatihan={data?.IdPelatihan.toString()}
                                        statusApproval={data?.StatusApproval}
                                        onSuccess={fetchData}
                                        onAddHistory={(msg) =>
                                            handleAddHistoryTrainingInExisting(
                                                data!,
                                                msg,
                                                Cookies.get("Role"),
                                                `${Cookies.get("Nama")} - ${Cookies.get("Satker")}`
                                            )
                                        }
                                    />
                                }

                                {
                                    (data?.UserPelatihan.length != 0 && countValidKeterangan(data?.UserPelatihan) < data?.UserPelatihan.length) && <ValidateParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                                }
                            </div>

                            <div className="w-full ">
                                <p className="font-medium text-gray-600 mb-2">
                                    Detail  :
                                </p>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoItem label="Kuota Peserta" value={data.KoutaPelatihan} />
                                        <InfoItem label="Jumlah Peserta" value={data.UserPelatihan.length.toString()} />
                                    </div>
                                    <UserPelatihanTable pelatihan={data} data={data.UserPelatihan} onSuccess={fetchData} />
                                </div>
                            </div>
                        </div>
                    </AccordionSection>
                }


            </Accordion >
        </div >
    );
};

const AccordionSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <AccordionItem
        value={title}
        className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
    >
        <AccordionTrigger className="px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 transition">
            {title}
        </AccordionTrigger>
        <AccordionContent className="px-6 py-4 bg-gray-50">
            {children}
        </AccordionContent>
    </AccordionItem>
);

const SectionGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{children}</div>
);

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {
            value?.includes('</p>') ?
                <div className="prose  text-gray-800 text-sm leading-relaxed max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: value }} />
                </div> : <span className="text-sm font-semibold text-gray-800 mt-1">
                    {value || "-"}
                </span>
        }
    </div>
);

export default PelatihanDetail;

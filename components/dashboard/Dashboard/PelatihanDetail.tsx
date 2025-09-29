"use client";

import React from "react";
import {
    Accordion,
} from "@/components/ui/accordion";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import Image from "next/image";
import { replaceUrl } from "@/lib/utils";
import { MdLock } from "react-icons/md";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import Cookies from "js-cookie";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import { truncateText } from "@/utils";
import Link from "next/link";
import { urlFileSuratPemberitahuan } from "@/constants/urls";
import { TbChevronDown, TbChevronUp, TbClock, TbPencilCheck, TbPencilCog, TbPencilX, TbSend } from "react-icons/tb";
import { isMoreThanToday } from "@/utils/time";
import { LuSignature } from "react-icons/lu";
import { countValidKeterangan } from "@/utils/counter";
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

    /**
     * Modul Pelatihan 
     */
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
                defaultValue={["Informasi Umum Pelatihan", "Publish Informasi dan Promosi", "Peserta Pelatihan", "Perangkat Pelatihan", "Instruktur/Pelatih"]}
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

                                            {/* 
                                             data?.ModuleMateri != ""
                                             data?.UserPelatihan.length != 0
                                             data?.SuratPemberitahuan != ""
                                             */}

                                            {data.SuratPemberitahuan !== "" && (data.StatusPenerbitan === "0" || data.StatusPenerbitan === "1.2") ? (
                                                data?.UserPelatihan?.length !== 0 && data?.SuratPemberitahuan !== "" ? (
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
                                                ) : <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                                    onClick={() => {
                                                        Toast.fire({
                                                            icon: "warning",
                                                            title: "Lengkapi Data Terlebih Dahulu",
                                                            html: `
          <ul style="text-align:left; margin-top:8px;">
            ${data?.ModuleMateri === "" ? "<li>Module Materi belum diisi</li>" : ""}
            ${!data?.UserPelatihan || data?.UserPelatihan.length === 0
                                                                    ? "<li>Peserta pelatihan belum ditambahkan</li>"
                                                                    : ""
                                                                }
            ${data?.SuratPemberitahuan === "" ? "<li>Surat Pemberitahuan belum tersedia</li>" : ""}
          </ul>
        `,
                                                        });
                                                    }}
                                                >
                                                    <TbSend className="h-5 w-5" />
                                                    Send to SPV
                                                </Button>

                                            ) : null}


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

                <div className="flex w-full flex-col items-start">
                    <div className="group flex gap-x-6">
                        <div className="relative">
                            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200"></div><span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-800"><svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="h-5 w-5"><path d="M17 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30887 3.73061 8.01175 4.92679 7.28679L9.92679 4.25649C11.2011 3.48421 12.7989 3.48421 14.0732 4.25649L19.0732 7.28679C20.2694 8.01175 21 9.30887 21 10.7076V17C21 19.2091 19.2091 21 17 21Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 17H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                        </div>
                        <div className="-translate-y-1.5 pb-8 text-slate-600">
                            <p className=" text-base font-bold text-slate-800 antialiased dark:text-white mt-2">📌 Informasi Kelas Pelatihan</p>
                            <small className="my-2 pb-4 text-sm text-slate-600 antialiased">Dalam proses ini kamu dapat melihat informasi pelatihan yang akan diselenggarakan, pastikan data yang tertera sudah sesuai apabila terdapat penyesuaian, dapat mengklik tombol <b>Edit Informasi Pelatihan</b> untuk mengedit data. Dalam proses ini kamu juga dapat menghapus kelas pelatihan dengan mengklik tombol <b>Hapus Pelatihan</b> dengan kondisi kelas sedang tidak dipublish, belum dikirimkan ke SPV, dan belum ada data peserta yang diinput.</small><AccordionSection title="Informasi Umum Pelatihan">
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <InfoItem label="Kode Kelas Pelatihan" value={data.KodePelatihan} />
                                            <InfoItem label="Sektor Pelatihan" value={data.JenisProgram} />
                                            <InfoItem label="Klaster Pelatihan" value={`${data?.BidangPelatihan}`} />
                                            <InfoItem label="Jenis/Program Pelatihan" value={`${data.Program}`} />
                                            <InfoItem label="Sumber Pembiayaan/Pemenuhan IKU" value={data.JenisPelatihan} />
                                            <InfoItem label="Penyelenggara" value={data.PenyelenggaraPelatihan} />
                                            <InfoItem label="Dukungan Program Terobosan" value={data.DukunganProgramTerobosan} />
                                            <InfoItem label="Tanggal Mulai Pelatihan" value={generateTanggalPelatihan(data.TanggalMulaiPelatihan)} />
                                            <InfoItem label="Tanggal Selesai Pelatihan" value={generateTanggalPelatihan(data.TanggalBerakhirPelatihan)} />
                                            <InfoItem label="Lokasi Pelaksanaan" value={data.LokasiPelatihan} />
                                            {
                                                data?.JenisPelatihan == JENIS_PELATIHAN_BY_SUMBER_PEMBIAYAAN[1] && <InfoItem label="Biaya Pelatihan" value={`Rp ${data.HargaPelatihan.toLocaleString()}`} />
                                            }
                                            <InfoItem label="Pelaksanaan" value={data.PelaksanaanPelatihan} />
                                            <InfoItem label="Penandatangan Sertifikat" value={data.TtdSertifikat} />
                                        </div>

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
                        </div>
                    </div>
                    {/* Pubish dan Promosi Kelas Pelatihan */}
                    {
                        Cookies.get('Access')?.includes('createPelatihan') &&
                        <div data-value=":r15:" className="group flex gap-x-6">
                            <div className="relative">
                                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200"></div><span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-800"><svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="h-5 w-5"><path d="M18 8.4C18 6.70261 17.3679 5.07475 16.2426 3.87452C15.1174 2.67428 13.5913 2 12 2C10.4087 2 8.88258 2.67428 7.75736 3.87452C6.63214 5.07475 6 6.70261 6 8.4C6 15.8667 3 18 3 18H21C21 18 18 15.8667 18 8.4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>
                            </div>
                            <div className="-translate-y-1.5 pb-8 text-slate-600">
                                <p className=" text-base font-bold text-slate-800 antialiased dark:text-white mt-2">🌐 Publish dan Promosi Kelas Pelatihan</p>
                                <small className="my-2 pb-4 text-sm text-slate-600 antialiased">Dalam proses ini kamu dapat mempublish informasi kelas pelatihan ke website utama E-LAUT agar masyarakat/publik dapat mendaftar secara mandiri kelas pelatihan yang dibuka atau hanya sebagai informasi. Dalam memenuhi proses ini, diharapkan dapat menguplaod <b>flyer, deskripsi, serta tanggal pendaftaran</b>. Selanjutnya dapat mengklik tombol <b>Publish</b> dan dapat ditarik kembali informasi yang disebarkan dengan mengklik tombol <b>Take Down</b>.</small>

                                <AccordionSection title="Publish Informasi dan Promosi">
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
                                                        currentData={data}
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
                                                            Untuk Melakukan Promosi Melalui Kanal Utama Website E-LAUT, Terlebih Dahulu Untuk Mengatur Informasi Publish Pada Tombol "Edit Informasi Publish".
                                                        </p>
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                </AccordionSection>
                            </div>
                        </div>
                    }
                    {/* Perangkat Pelatihan */}
                    <div data-value=":r16:" className="group flex gap-x-6">
                        <div className="relative"> <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200"></div><span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-800"><svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="h-5 w-5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div>
                        <div className="-translate-y-1.5 pb-8 text-slate-600">
                            <p className=" text-base font-bold text-slate-800 antialiased dark:text-white mt-2">📑 Perangkat Pelatihan</p>
                            <small className="my-2 pb-4 text-sm text-slate-600 antialiased">Dalam proses ini  <b>diharuskan</b> untuk memilih perangkat yang dapat terdiri dari 1) Modul Pelatihan beserta Bahan Tayangnya atau 2) Bahan Ajar sebagai pengganti Modul Pelatihan. Pastikan perangkat yang dipilih sesuai, apabila tidak terdapat perangkat yang tersedia dapat melakukan pengelolaan data terlebih dahulu di menu Modul atau Bahan Ajar serta pastikan mengupload bahan tayang/ajar jika diperlukan. Modul serta perangkat lainnya yang dipilih akan muncul di perangkat pengguna e-laut.</small>
                            <AccordionSection title="Perangkat Pelatihan">
                                <div className="flex flex-col w-full gap-4">
                                    <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                        <p className="font-medium text-gray-600">
                                            Action :
                                        </p>
                                        {
                                            ((data?.StatusPenerbitan == "0" || data?.StatusPenerbitan == "1.2" || data?.StatusPenerbitan == "3") && Cookies.get('Access')?.includes('createPelatihan')) &&
                                            <ChooseModulAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                currentData={data}
                                                onSuccess={fetchData} />
                                        }
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
                                                                        Tahun :  {modulPelatihan?.Tahun}
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
                                                                                    <p className="text-xs text-gray-600">
                                                                                        Bahan Lainnya
                                                                                    </p>
                                                                                    {
                                                                                        modul.BahanTayang.length == 0 ? <tr>
                                                                                            <td colSpan={18} className="text-center py-6 text-gray-500 italic">
                                                                                                Belum bahan lainnya yang tersedia
                                                                                            </td>
                                                                                        </tr> : <>
                                                                                            <table className="w-full text-xs text-left border">
                                                                                                <thead className="bg-gray-100 text-gray-700 uppercase">
                                                                                                    <tr className="text-xs text-center">
                                                                                                        <th className="px-3 py-2 border text-xs">No</th>

                                                                                                        <th className="px-3 py-2 border text-xs">Nama</th>
                                                                                                        <th className="px-3 py-2 border text-xs">File</th>

                                                                                                        <th className="px-3 py-2 border text-xs">Tanggal Upload</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {modul.BahanTayang.map((row_bt, index) => (
                                                                                                        <tr key={row_bt.IdBahanTayang}>
                                                                                                            <td className="px-3 py-2 border">{index + 1}</td>

                                                                                                            <td className="px-3 py-2 border">{row_bt.NamaBahanTayang}</td>
                                                                                                            <td className="px-3 py-2 border">
                                                                                                                <a
                                                                                                                    href={
                                                                                                                        row_bt.BahanTayang
                                                                                                                            ? `${process.env.NEXT_PUBLIC_MODULE_FILE_URL}/${row_bt.BahanTayang}`
                                                                                                                            : row_bt.LinkVideo
                                                                                                                    }
                                                                                                                    target="_blank"
                                                                                                                    rel="noopener noreferrer"
                                                                                                                    className="text-blue-500 underline"
                                                                                                                >

                                                                                                                    {row_bt.BahanTayang == "" ? truncateText(row_bt.LinkVideo, 30, '...') : truncateText(row_bt.BahanTayang, 30, '...')}
                                                                                                                </a></td>

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

                                                        <p className="text-gray-600 text-xs mt-1">
                                                            *Untuk dapat menambahkan bahan lainnya sebagai penunjang pada tiap materi, silahkan menuju menu <span className="font-semibold">Bahan Ajar</span> jika perangkat yang digunakan versi Lembaga Diklat mu atau ke <span className="font-semibold">Modul Pelatihan</span> jika menggunakan modul
                                                        </p>
                                                    </div>
                                            }

                                        </div>
                                    </div >
                                </div >
                            </AccordionSection >
                        </div>
                    </div>
                    {/* Instruktur/Pelatih */}
                    <div data-value=":r17:" className="group flex gap-x-6">
                        <div className="relative"> <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200"></div><span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-800"><svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="h-5 w-5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div>
                        <div className="-translate-y-1.5 pb-8 text-slate-600">
                            <p className=" text-base font-bold text-slate-800 antialiased dark:text-white mt-2">🧩 Instruktur/Pelatih</p>
                            <small className="my-2 pb-4 text-sm text-slate-600 antialiased">Dalam proses ini <b>diwajibkan</b> memilih instruktur/pelatih yang akan mengajar dalam pelaksanaan pelatihan, apabila data instruktur yang dimaksud tidak tertera maka dapat diabaikan untuk pengisian data instruktur/pelatih. Namun, dalam hal penyelenggarakan pelatihan akan ditandatangani oleh Kepala Pusat Pelatihan KP atau Ka BPPSDM KP maka penunjukkan instruktur akan dilakukan oleh tim verifikator pusat.</small>

                            <AccordionSection title="Instruktur/Pelatih">
                                <div className="flex flex-col w-full gap-4 overflow-x-scroll">
                                    <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                        <p className="font-medium text-gray-600">
                                            Action :
                                        </p>
                                        <ChooseInstrukturAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            currentData={data}
                                            onSuccess={fetchData} />

                                    </div>

                                    <div className="w-full ">
                                        <p className="font-medium text-gray-600 mb-2">
                                            Detail  :
                                        </p>
                                        {data?.Instruktur == "" ? <div className="py-10 w-full max-w-3xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                            <MdLock className='w-14 h-14 text-gray-600' />
                                            <p className="text-gray-500 font-normal text-center">
                                                {data?.TtdSertifikat?.includes('Kepala Balai') ? 'Instruktur/Pelatih belum ditentukan, pemilihan Instruktur ada pada Lembaga Diklat, harap segera menentukan dan mengisi data instruktur' : 'Instruktur/Pelatih belum ditentukan, pemilihan Instruktur ada pada Tim Verifikator Pusat, harap segera menentukan dan mengisi data instruktur'}
                                            </p>
                                        </div> : <div className="flex flex-col gap-2 w-full ">
                                            {instrukturs.map((item) => <div
                                                key={item.IdInstruktur}
                                                className="border rounded-xl p-3 shadow-sm hover:shadow transition bg-white"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-medium text-sm text-gray-800 truncate">
                                                        {item.nama}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.bidang_keahlian}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        NIP :  {item.nip}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Email :  {item.email}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        No Telpon :  {item.no_telpon}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Jabatan dan Pangkat/Golongan :  {item.jenjang_jabatan} - {item.pelatihan_pelatih}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Eselon I :  {item.eselon_1}
                                                    </p>
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        Eselon II :  {item.eselon_2}
                                                    </p>
                                                </div>


                                            </div>)}
                                        </div>}

                                    </div>
                                </div>
                            </AccordionSection>

                        </div>
                    </div>
                    {/* Peserta Pelatihan */}
                    {
                        parseInt(data?.StatusPenerbitan) < 5 && <div data-value=":r17:" className="group flex gap-x-6">
                            <div className="relative"> <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200"></div><span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-800"><svg width="1.5em" height="1.5em" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="h-5 w-5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></span></div>
                            <div className="-translate-y-1.5 pb-8 text-slate-600">
                                <p className=" text-base font-bold text-slate-800 antialiased dark:text-white mt-2">👥 Peserta Pelatihan</p>
                                <small className="my-2 pb-4 text-sm text-slate-600 antialiased">Dalam proses ini, data peserta pelatihan dapat dihasilkan dari dua jalur yakni pendaftaran mandiri peserta (dengan catatan informasi pelatihan telah dipublish di wesite e-laut) dan melalui import file yang berisikan data peserta dengan mengklik tombol <b>Import Data Peserta</b>, dalam hal import hanya dapat dilakukan sekali!</small>

                                <AccordionSection title="Peserta Pelatihan">
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

                                            <ZipPhotoParticipantAction users={data?.UserPelatihan} onSuccess={fetchData} />

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
                            </div>
                        </div>}
                </div>

            </Accordion >
        </div >
    );
};

export default PelatihanDetail;

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
import { TbClock, TbPencilCheck, TbPencilCog, TbPencilX, TbSend } from "react-icons/tb";
import { isMoreThanToday } from "@/utils/time";
import HistoryButton from "./Actions/HistoryButton";
import { LuSignature } from "react-icons/lu";
import { ValidateParticipantAction } from "./Actions/Lemdiklat/ValidateParticipantAction";
import { countValidKeterangan } from "@/utils/counter";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const PelatihanDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)

    return (
        <div className="w-full space-y-6 py-5">
            <Accordion
                type="multiple"
                className="w-full space-y-3"
                defaultValue={["📌 Informasi Umum Pelatihan", "🌐 Publish Informasi dan Promosi", "👥 Peserta Pelatihan", "📑 Modul dan Perangkat Pelatihan"]}
            >
                {(!data?.TtdSertifikat?.includes("Kepala Balai") ? parseInt(data?.StatusPenerbitan) < 5 : parseFloat(data?.StatusPenerbitan) < 1.25) &&
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

                                    {/* (2) Verifikator : Pending Verifikator for Reject */}
                                    {
                                        (Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan == "2") && <SendNoteAction
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
                                    }

                                    {/* (2) Verifikator : Pending Verifikator for Approve */}
                                    {
                                        (Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan == "2") && <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Approve Pelaksanaan"
                                            description="Segera melakukan verifikasi pelaksanaan diklat, pastikan perangkat dan kelengkapan administrasi pelatihan sesuai dan lengkap"
                                            buttonLabel="Approve Pelaksanaan"
                                            icon={TbPencilCheck}
                                            buttonColor="green"
                                            onSuccess={fetchData}
                                            status={"4"}
                                            pelatihan={data}
                                        />
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

                {/* <AccordionSection title="📑 Modul dan Perangkat Pelatihan">
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
                                    <InfoItem label="Modul Pelatihan" value={data.KoutaPelatihan} />
                                    <InfoItem label="Jumlah Peserta" value={data.UserPelatihan.length.toString()} />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionSection> */}

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
            </Accordion>
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

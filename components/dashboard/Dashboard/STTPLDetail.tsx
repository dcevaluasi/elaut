"use client";

import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { MateriPelatihan, PelatihanMasyarakat } from "@/types/product";
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
import { urlFileBeritaAcara, urlFileSuratPemberitahuan } from "@/constants/urls";
import SendNoteAction from "./Actions/Lemdiklat/SendNoteAction";
import { TbCheck, TbClock, TbCursorOff, TbPencilCheck, TbPencilCog, TbPencilX, TbSend } from "react-icons/tb";
import { isToday } from "@/utils/time";
import HistoryButton from "./Actions/HistoryButton";
import { LuSignature } from "react-icons/lu";
import { generatedCurriculumCertificate, generatedDescriptionCertificate } from "@/utils/certificates";
import FormatCertificateAction from "./Actions/FormatCertificateAction";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)

    return (
        <div className="w-full space-y-6 py-5">
            <Accordion
                type="single"
                collapsible
                className="w-full space-y-3"
                defaultValue="📌 Informasi Umum"
            >
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
                                        {
                                            (data.SuratPemberitahuan != "" && data.StatusPenerbitan == "0") &&
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

                                {/* (1) SPV : Pending Pilih Verifikator */}
                                {
                                    (Cookies.get('Access')?.includes('supervisePelaksanaan') && data.StatusPenerbitan == "1") && <SendNoteAction
                                        idPelatihan={data.IdPelatihan.toString()}
                                        title="Pilih Verifikator"
                                        description="Segera menunjuk verifikator dalam melalukan verifikasi pelaksanaan pelatihan"
                                        buttonLabel="Pilih Verifikator"
                                        icon={TbPencilCog}
                                        buttonColor="teal"
                                        onSuccess={fetchData}
                                        status={"2"}
                                        pelatihan={data}
                                    />
                                }

                                {/* (2) Verifikator : Pending Verifikator for Reject */}
                                {
                                    (Cookies.get('Access')?.includes('verifyPelaksanaan') && data.StatusPenerbitan == "2") && <SendNoteAction
                                        idPelatihan={data.IdPelatihan.toString()}
                                        title="Reject Pelaksaan"
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
                                        <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-3">
                                            <MdLock className='w-14 h-14 text-gray-600' />
                                            <p className="text-gray-500 font-normal text-center">
                                                Harap mengupload surat pemberitahuan pelaksanaan pelatihan dan menunggu verifikasi pelaksanaan agar dapat melanjutkan tahapan berikutnya!
                                            </p>
                                        </div> :
                                        <div className="grid grid-cols-3 gap-4 mt-4 w-full text-sm">
                                            <InfoItem label="Status" value={label} />
                                            <InfoItem label="Penandatangan" value={data?.TtdSertifikat} />
                                            <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                                <span className="text-xs font-medium text-gray-500">Dokumen Penerbitan STTPL</span>
                                                <Link target="_blank" href={`${urlFileSuratPemberitahuan}/${data?.SuratPemberitahuan}`} className="text-sm font-semibold text-gray-800 mt-1">
                                                    {urlFileBeritaAcara}/{data?.BeritaAcara != '' ? truncateText(data?.BeritaAcara, 10, '...') : "-"}
                                                </Link>
                                            </div>
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
                </div>

                <AccordionSection title="📑 Format Sertifikat">
                    <div className="flex flex-col w-full gap-4">
                        {
                            parseInt(data?.StatusPenerbitan) >= 8 ? <>
                                <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                    <p className="font-medium text-gray-600">
                                        Action :
                                    </p>
                                    <FormatCertificateAction
                                        idPelatihan={data?.IdPelatihan.toString()}
                                        handleFetchingData={fetchData}
                                        data={data}
                                    />
                                </div>
                                <div className="w-full ">
                                    <p className="font-medium text-gray-600 mb-2">
                                        Detail  :
                                    </p>
                                    {data.DeskripsiSertifikat != "" || data.MateriPelatihan.length != 0 ? <><SectionGrid>
                                        <InfoItem label="Deskripsi Indonesia" value={generatedDescriptionCertificate(data.DeskripsiSertifikat).desc_indo} />
                                        <InfoItem label="Deskripsi Inggris" value={generatedDescriptionCertificate(data.DeskripsiSertifikat).desc_eng} />
                                    </SectionGrid>

                                        <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
                                            <span className="text-xs font-medium text-gray-500">Materi Sertifikat</span>
                                            <div className="overflow-x-auto !text-sm mt-4">
                                                <table className="min-w-full border border-gray-300">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="border p-3 text-sm">No</th>
                                                            <th className="border p-3 text-sm">Nama Materi</th>
                                                            <th className="border p-3 text-sm">Tipe</th>
                                                            <th className="border p-3 text-sm">Jam Teori</th>
                                                            <th className="border p-3 text-sm">Jam Praktek</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.MateriPelatihan!.map((item: MateriPelatihan, index: number) => (
                                                            <tr key={item.IdMateriPelatihan} className="odd:bg-white even:bg-gray-50">
                                                                <td className="border p-3 text-center">{index + 1}</td>
                                                                <td className="border p-3"><div className="flex flex-col">
                                                                    <p className="font-medium">
                                                                        {generatedCurriculumCertificate(item.NamaMateri).curr_indo}</p>
                                                                    <span className="text-xs italic">{generatedCurriculumCertificate(item.NamaMateri).curr_eng}</span></div></td>
                                                                <td className="border p-3 text-center capitalize">{item.Deskripsi}</td>
                                                                <td className="border p-3 text-center">{item.JamTeory}</td>
                                                                <td className="border p-3 text-center">{item.JamPraktek}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div></> : <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                        <MdLock className='w-14 h-14 text-gray-600' />
                                        <p className="text-gray-500 font-normal text-center">
                                            Harap upload materi yang akan tampil di lembar sertifikat serta deskripsi sertifikat, aksi ini hanya dilakukan sekali. Apabila terjadi kesalahan, tidak dapat melakukan perbaikan!
                                        </p>
                                    </div>}
                                </div></> : <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                <MdLock className='w-14 h-14 text-gray-600' />
                                <p className="text-gray-500 font-normal text-center">
                                    Oopsss! Dalam melakukan pengaturan format sertifikat, pengajuan penerbitan STTPL untuk pelaksanaan pelatihan ini harus disetujui pihak Pusat dulu, harap hub verifikator terkait untuk mempercepat proses!
                                </p>
                            </div>
                        }

                    </div>
                </AccordionSection>
            </Accordion>
        </div>
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
            value?.includes('<p>') ?
                <div className="prose  text-gray-800 text-sm leading-relaxed max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: value }} />
                </div> : <span className="text-sm font-semibold text-gray-800 mt-1">
                    {value || "-"}
                </span>
        }
    </div>
);

export default STTPLDetail;

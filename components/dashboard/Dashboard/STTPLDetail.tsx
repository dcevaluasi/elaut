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
import { MdLock } from "react-icons/md";
import Cookies from "js-cookie";
import Link from "next/link";
import { urlFileBeritaAcara } from "@/constants/urls";
import SendNoteAction from "./Actions/Lemdiklat/SendNoteAction";
import { TbPencilCheck, TbPencilX, TbSend } from "react-icons/tb";
import HistoryButton from "./Actions/HistoryButton";
import { LuSignature } from "react-icons/lu";
import { generatedCurriculumCertificate, generatedDescriptionCertificate } from "@/utils/certificates";
import FormatCertificateAction from "./Actions/FormatCertificateAction";
import { DialogFormatSTTPL } from "@/components/sertifikat/dialogFormatSTTPL";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import UserPelatihanTable from "./Tables/UserPelatihanTable";
import { PassedParticipantAction } from "./Actions/Lemdiklat/PassedParticipantAction";
import { countUserWithCertificate, countUserWithNoStatus, countUserWithPassed } from "@/utils/counter";
import TTDeDetail from "./TTDeDetail";
import { ESELON1, ESELON_1 } from "@/constants/nomenclatures";
import { useFetchDataPusatById } from "@/hooks/elaut/pusat/useFetchDataPusatById";
import { downloadAndZipPDFs } from "@/utils/file";
import { FaRegFolderOpen } from "react-icons/fa6";

interface Props {
    data: PelatihanMasyarakat;
    fetchData: any
}

const STTPLDetail: React.FC<Props> = ({ data, fetchData }) => {
    const { label, color, icon } = getStatusInfo(data.StatusPenerbitan)
    const { adminPusatData, loading, error, fetchAdminPusatData } = useFetchDataPusatById(data?.VerifikatorPelatihan)

    /**
      * Zip Download Processing
      */
    const [isZipping, setIsZipping] = React.useState(false)
    const handleDownloadZip = async () => {
        setIsZipping(true)
        try {
            await downloadAndZipPDFs(
                data.UserPelatihan,
                `(${data!.Program}) ${data!.PenyelenggaraPelatihan} - ${generateTanggalPelatihan(data!.TanggalMulaiPelatihan)} - ${generateTanggalPelatihan(data!.TanggalBerakhirPelatihan)}`,
            )
        } catch (err) {
            console.error('Download failed:', err)
        } finally {
            setIsZipping(false)
        }
    }

    return (
        <div className="w-full space-y-6 py-5">
            <Accordion
                type="multiple"
                className="w-full space-y-3"
                defaultValue={["📑 Format Sertifikat", "👥 Peserta Pelatihan"]}
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

                                        {/* (5) Operator : Send Penerbitan STTPL */}
                                        {["5"].includes(data.StatusPenerbitan) && data?.DeskripsiSertifikat !== "" && (
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Ajukan Penerbitan STTPL"
                                                description="Ayoo! Segera ajukan penerbitan STTPL, siapkan dokumen kelengkapan sebelum proses pengajuan!"
                                                buttonLabel="Ajukan Penerbitan STTPL"
                                                icon={LuSignature}
                                                buttonColor={"blue"}
                                                onSuccess={fetchData}
                                                status={"6"}
                                                pelatihan={data}
                                            />
                                        )}


                                        {(data.StatusPenerbitan == "5" && data?.DeskripsiSertifikat == "") && <p className="text-gray-600 text-sm">Harap Mengatur Format Sertifikat Terlebih Dahulu Untuk Melanjutkan Proses Berikutnya!</p>}


                                        {/* (7) | (9) Operator : Send to Verifikator After Reject */}
                                        {
                                            (data.StatusPenerbitan == "7" || data.StatusPenerbitan == "9") &&
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
                                        }
                                    </>
                                }

                                {/* (6) Verifikator : Pending Verifikator for Reject and Approve */}
                                {Cookies.get("Access")?.includes("verifyCertificate") &&
                                    data.StatusPenerbitan == "6" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Reject Penerbitan"
                                                description="Segera melakukan verifikasi pengajuan penerbitan STTPL, kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Reject Penerbitan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status="7"
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description="Segera melakukan verifikasi pengajuan penerbitan STTPL, kelengkapan administrasi pelatihan sesuai dan lengkap"
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="blue"
                                                onSuccess={fetchData}
                                                status="8"
                                                pelatihan={data}
                                            />
                                        </>
                                    )}

                                {/* (8) Kapus : Pending Kabalai for Reject and Approve */}
                                {Cookies.get("Access")?.includes("approveKabalai") &&
                                    data.StatusPenerbitan == "1.3" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Reject Penerbitan"
                                                description="Segera melakukan approval pengajuan penerbitan STTPL"
                                                buttonLabel="Reject Penerbitan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status="1.5"
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description={
                                                    "Segera melakukan approval pengajuan penerbitan STTPL"
                                                }
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="green"
                                                onSuccess={fetchData}
                                                status={"1.4"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}


                                {/* (8) Kapus : Pending Kapus for Reject and Approve */}
                                {Cookies.get("Access")?.includes("approveKapus") &&
                                    data.StatusPenerbitan == "8" && (
                                        <>
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Reject Penerbitan"
                                                description="Segera melakukan approval pengajuan penerbitan STTPL"
                                                buttonLabel="Reject Penerbitan"
                                                icon={TbPencilX}
                                                buttonColor="rose"
                                                onSuccess={fetchData}
                                                status="9"
                                                pelatihan={data}
                                            />
                                            <SendNoteAction
                                                idPelatihan={data.IdPelatihan.toString()}
                                                title="Approve Penerbitan"
                                                description={
                                                    data?.TtdSertifikat == ESELON_1.fullName
                                                        ? "Segera melakukan approval untuk diteruskan kepada Kepala BPPSDM KP"
                                                        : "Segera melakukan approval pengajuan penerbitan STTPL"
                                                }
                                                buttonLabel="Approve Penerbitan"
                                                icon={TbPencilCheck}
                                                buttonColor="green"
                                                onSuccess={fetchData}
                                                status={data?.TtdSertifikat == ESELON_1.fullName ? "12" : "10"}
                                                pelatihan={data}
                                            />
                                        </>
                                    )}


                                {/* (12) Kabadan : Pending Kabadan for Reject and Approve */}
                                {
                                    (Cookies.get('Access')?.includes('approveKabadan') && data.StatusPenerbitan == "12") && <>
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Reject Penerbitan"
                                            description="Segera melakukan approval pengajuan penerbitan STTPL"
                                            buttonLabel="Reject Penerbitan"
                                            icon={TbPencilX}
                                            buttonColor="rose"
                                            onSuccess={fetchData}
                                            status={"13"}
                                            pelatihan={data}
                                        />
                                        <SendNoteAction
                                            idPelatihan={data.IdPelatihan.toString()}
                                            title="Approve Penerbitan"
                                            description={data?.TtdSertifikat == ESELON_1.fullName ? "Segera melakukan approval untuk diteruskan kepada Kepala BPPSDM KP" : "Segera melakukan approval pengajuan penerbitan STTPL"}
                                            buttonLabel="Approve Penerbitan"
                                            icon={TbPencilCheck}
                                            buttonColor="green"
                                            onSuccess={fetchData}
                                            status={"14"}
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
                                        <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-3">
                                            <MdLock className='w-14 h-14 text-gray-600' />
                                            <p className="text-gray-500 font-normal text-center">
                                                Harap mengupload surat pemberitahuan pelaksanaan pelatihan dan menunggu verifikasi pelaksanaan agar dapat melanjutkan tahapan berikutnya!
                                            </p>
                                        </div> :
                                        <div className={`grid ${adminPusatData != null ? "grid-cols-4" : 'grid-cols-3'} gap-4 mt-4 w-full text-sm`}>

                                            <div className={`flex flex-col p-3 ${color} rounded-lg shadow-sm border border-gray-100 animate-pulse`}>
                                                <span className="text-xs font-medium text-gray-100">Status</span>
                                                <span className="flex items-center">{icon}{label}</span>
                                            </div>
                                            <InfoItem label="Penandatangan" value={data?.TtdSertifikat} />
                                            <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                                                <span className="text-xs font-medium text-gray-500">Dokumen Penerbitan STTPL</span>
                                                <Link target="_blank" href={`${urlFileBeritaAcara}/${data?.BeritaAcara}`} className="text-sm font-semibold text-blue-500 mt-1 underline">
                                                    Lihat Dokumen
                                                </Link>
                                            </div>{
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
                </div>

                {
                    Cookies.get('Role')?.includes(data?.TtdSertifikat) && Cookies.get('Access')?.includes('isSigning') && (parseInt(data.StatusPenerbitan) >= 10 && parseInt(data.StatusPenerbitan) <= 15) && <TTDeDetail data={data} fetchData={fetchData} />
                }

                {
                    Cookies.get('Role')?.includes(data?.TtdSertifikat) && Cookies.get('Access')?.includes('isSigning') && (parseFloat(data.StatusPenerbitan) >= 1.4 && parseFloat(data.StatusPenerbitan) <= 1.6) && <TTDeDetail data={data} fetchData={fetchData} />
                }

                {
                    !Cookies.get('Access')?.includes('isSigning') &&
                    <AccordionSection title="📑 Format Sertifikat">
                        <div className="flex flex-col w-full gap-4">
                            <>
                                <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                                    <p className="font-medium text-gray-600">Action :</p>

                                    {data?.StatusPenerbitan == "5" && (
                                        <FormatCertificateAction
                                            idPelatihan={data?.IdPelatihan.toString()}
                                            handleFetchingData={fetchData}
                                            data={data}
                                        />
                                    )}
                                </div>

                                <div className="w-full ">
                                    <p className="font-medium text-gray-600 mb-2">Detail :</p>

                                    {data.DeskripsiSertifikat !== "" || data.MateriPelatihan.length !== 0 ? (
                                        <>
                                            <SectionGrid>
                                                <InfoItem
                                                    label="Deskripsi Indonesia"
                                                    value={
                                                        generatedDescriptionCertificate(data.DeskripsiSertifikat)
                                                            .desc_indo
                                                    }
                                                />
                                                <InfoItem
                                                    label="Deskripsi Inggris"
                                                    value={
                                                        generatedDescriptionCertificate(data.DeskripsiSertifikat)
                                                            .desc_eng
                                                    }
                                                />
                                            </SectionGrid>

                                            <div className="flex flex-col p-3 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
                                                <span className="text-xs font-medium text-gray-500">
                                                    Materi Sertifikat
                                                </span>
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
                                                            {data.MateriPelatihan!.map(
                                                                (item: MateriPelatihan, index: number) => (
                                                                    <tr
                                                                        key={item.IdMateriPelatihan}
                                                                        className="odd:bg-white even:bg-gray-50"
                                                                    >
                                                                        <td className="border p-3 text-center">
                                                                            {index + 1}
                                                                        </td>
                                                                        <td className="border p-3">
                                                                            <div className="flex flex-col">
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        generatedCurriculumCertificate(item.NamaMateri)
                                                                                            .curr_indo
                                                                                    }
                                                                                </p>
                                                                                <span className="text-xs italic">
                                                                                    {
                                                                                        generatedCurriculumCertificate(item.NamaMateri)
                                                                                            .curr_eng
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="border p-3 text-center capitalize">
                                                                            {item.Deskripsi}
                                                                        </td>
                                                                        <td className="border p-3 text-center">
                                                                            {item.JamTeory}
                                                                        </td>
                                                                        <td className="border p-3 text-center">
                                                                            {item.JamPraktek}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <DialogFormatSTTPL pelatihan={data}>
                                                <Button
                                                    variant="outline"
                                                    title="Preview  Sertifikat"
                                                    className="flex items-center w-full mt-4 rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                                >
                                                    <FaSearch className="h-4 w-4 mr-1" /> Preview Sertifikat
                                                </Button>
                                            </DialogFormatSTTPL>
                                        </>
                                    ) : (
                                        <div className="py-10 w-full max-w-2xl mx-auto h-full flex items-center flex-col justify-center gap-1">
                                            <MdLock className="w-14 h-14 text-gray-600" />
                                            <p className="text-gray-500 font-normal text-center">
                                                Harap atur format  sertifikat (materi, deskripsi) yang akan tampil di lembar sertifikat, Pastikan format yang diatur mengikuti petunjuk teknis yang telah diberikan. Kesesuaian akan diverifikasi lebih lanjut oleh Verifikator
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        </div>

                    </AccordionSection>
                }

                <AccordionSection title="👥 Peserta Pelatihan">
                    <div className="flex flex-col w-full gap-4">
                        <div className="w-full flex items-center gap-2 pb-4 border-b border-b-gray-200">
                            <p className="font-medium text-gray-600">
                                Action :
                            </p>

                            {
                                countUserWithNoStatus(data?.UserPelatihan) != 0 && <PassedParticipantAction data={data?.UserPelatihan} onSuccess={fetchData} />
                            }

                            {countUserWithCertificate(data.UserPelatihan) == data.UserPelatihan.length && <Button
                                onClick={handleDownloadZip}
                                disabled={isZipping}
                                variant="outline"
                                className={`flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-indigo-500 text-indigo-500 hover:text-white hover:bg-indigo-500`}
                            >
                                <FaRegFolderOpen className="h-4 w-4" />
                                <span className="text-sm">
                                    {isZipping ? 'Zipping & Downloading...' : 'Download Zip Sertifikat'}
                                </span>
                            </Button>
                            }

                        </div>

                        <div className="w-full ">
                            <p className="font-medium text-gray-600 mb-2">
                                Detail  :
                            </p>
                            <div className="flex flex-col gap-2 w-full">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <InfoItem label="Kuota Peserta" value={data.KoutaPelatihan} />
                                    <InfoItem label="Jumlah Peserta" value={data.UserPelatihan.length.toString()} />
                                    <InfoItem label="Jumlah Kelulusan" value={`${countUserWithPassed(data.UserPelatihan)}/${data.UserPelatihan.length}`} />
                                </div>
                                <UserPelatihanTable pelatihan={data} data={data.UserPelatihan} onSuccess={fetchData} />
                            </div>
                        </div>
                    </div>
                </AccordionSection>
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

import React, { useState } from "react";
import Link from "next/link";
import { RiCheckboxCircleFill, RiInformationFill, RiSendPlaneFill } from "react-icons/ri";
import { BiPaperPlane } from "react-icons/bi";
import { PelatihanMasyarakat } from "@/types/product";
import UploadSuratButton from "../../Dashboard/Actions/UploadSuratButton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    Calendar,
    MapPin,
    Users,
    Tag,
    Building,
    FileText,
    ClipboardList,
    Award,
    CheckCircle2,
    Coins,
    User,
    Info,
    BookOpen
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from "js-cookie";
import TTDSertifikat from "../../Dashboard/pelatihan/TTDSertifikat";
import { IoSend } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi2";
import { elautBaseUrl } from "@/constants/urls";
import axios from "axios";
import Toast from "@/components/toast";
import { handleAddHistoryTrainingInExisting } from "@/firebase/firestore/services";
import { usePathname } from "next/navigation";
import { getStatusInfo } from "@/utils/text";
import { ApprovePelaksanaanSPV } from "../../admin/spv/ApprovalPelaksanaanSPV";

interface TableDataPelatihanMasyarakatProps {
    data: PelatihanMasyarakat[];
    isOperatorBalaiPelatihan?: boolean;
    generateTanggalPelatihan: (date: string) => string;
    encryptValue: (val: string) => string;
    countUserWithDrafCertificate: (users: any[]) => number;
    handleSendToSPVAboutCertificateIssueance: (
        idPelatihan: string,
        pelatihan: PelatihanMasyarakat
    ) => void;
    fetchDataPelatihanMasyarakat: () => void;
}

const TableDataPelatihanMasyarakat: React.FC<TableDataPelatihanMasyarakatProps> = ({
    data,
    isOperatorBalaiPelatihan,
    generateTanggalPelatihan,
    encryptValue,
    countUserWithDrafCertificate,
    handleSendToSPVAboutCertificateIssueance,
    fetchDataPelatihanMasyarakat,
}) => {

    const isVerifikator = Cookies.get('Role')?.includes('Verifikator')


    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPelatihan, setSelectedPelatihan] =
        useState<PelatihanMasyarakat | null>(null);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const accessPermissions = Cookies.get('Access')

    const handleApprovedSertifikatBySPV = async (idPelatihan: string, pelatihan: PelatihanMasyarakat) => {
        const updateData = new FormData()
        updateData.append('PemberitahuanDiterima', '12')


        try {
            await axios.put(
                `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${idPelatihan}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("XSRF091")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            Toast.fire({
                icon: "success",
                title: "Yeayyy!",
                text: "Berhasil mengirimkan informasi pengajuan kepada SPV Pusat!",
            });
            handleAddHistoryTrainingInExisting(pelatihan!, 'Telah Menyetujui Permohonan Penerbitan Sertifikat', Cookies.get('Eselon'), Cookies.get('SATKER_BPPP'))

            fetchDataPelatihanMasyarakat();
        } catch (error) {
            console.error("ERROR GENERATE SERTIFIKAT: ", error);
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: "Gagal mengirimkan informasi pengajuan kepada SPV Pusat!",
            });
            fetchDataPelatihanMasyarakat();
        }
    }



    return (
        <div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-center">No</th>
                            <th className="px-4 py-3 text-left">
                                <div className="flex items-center gap-1">
                                    <BookOpen size={14} className="text-blue-500" /> Nama Pelatihan
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left">Program</th>
                            <th className="px-4 py-3 text-left">Penyelenggara</th>
                            <th className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Calendar size={14} className="text-indigo-500" /> Waktu
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Users size={14} className="text-emerald-500" /> Peserta
                                </div>
                            </th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((pelatihan: PelatihanMasyarakat, index: number) => {
                            if (!pelatihan) return null;

                            const waktuPelaksanaan = pelatihan.TanggalMulaiPelatihan
                                ? `${generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} s.d ${generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan || "")}`
                                : "-";

                            const { label, color, icon } = getStatusInfo(String(pelatihan.StatusPenerbitan));

                            return (
                                <tr
                                    key={pelatihan.IdPelatihan}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 text-center text-gray-500">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{pelatihan.NamaPelatihan}</td>
                                    <td className="px-4 py-3">{pelatihan.Program}</td>
                                    <td className="px-4 py-3">{pelatihan.PenyelenggaraPelatihan}</td>
                                    <td className="px-4 py-3 text-center">{waktuPelaksanaan}</td>
                                    <td className="px-4 py-3 text-center">
                                        {pelatihan.UserPelatihan?.length ?? 0}
                                    </td>
                                    <td className="px-4 h-full">{
                                        <span className={`w-full inline-flex items-center justify-center gap-2 
                       h-full px-5 text-sm font-medium  leading-none  text-center ${color}`}>
                                            {icon}
                                            {label}
                                        </span>}
                                    </td>
                                    {/* Action Buttons */}
                                    <td className="px-4 py-3 flex flex-col gap-2 justify-center items-center h-fit">
                                        {Cookies.get('createPenandatanganan') == '1' &&
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="inline-flex w-full items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border border-neutral-300 bg-white text-neutral-700 
             hover:bg-neutral-100 hover:text-neutral-900 transition-colors 
             shadow-sm"
                                                    onClick={() => setSelectedPelatihan(pelatihan)}
                                                >
                                                    <RiInformationFill size={14} /> Detail
                                                </Button>
                                                <TTDSertifikat dataPelatihan={pelatihan!} handleFetchData={fetchDataPelatihanMasyarakat} />
                                                <Link
                                                    title="Peserta Pelatihan"
                                                    target={"_blank"}
                                                    href={`/admin/pusat/pelatihan/${pelatihan.KodePelatihan
                                                        }/peserta-pelatihan/${encryptValue(
                                                            pelatihan.IdPelatihan.toString()
                                                        )}`}
                                                    className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border bg-green-500 text-white 
             hover:bg-grenn-600 hover:text-white transition-colors  w-full 
             shadow-sm"
                                                >
                                                    <HiUserGroup className="h-3 w-3 text-white" />
                                                    Peserta
                                                </Link>
                                            </>
                                        }




                                        {!isOperatorBalaiPelatihan &&
                                            pelatihan.PemberitahuanDiterima === "Kirim ke SPV" && (
                                                <Button
                                                    size="sm"
                                                    className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border border-neutral-300 bg-white text-neutral-700 
             hover:bg-neutral-100 hover:text-neutral-900 transition-colors w-full  
             shadow-sm"
                                                    onClick={() => {
                                                        const isReady =
                                                            countUserWithDrafCertificate(
                                                                pelatihan.UserPelatihan || []
                                                            ) === pelatihan.UserPelatihan?.length;
                                                        isReady
                                                            ? handleSendToSPVAboutCertificateIssueance(
                                                                String(pelatihan.IdPelatihan),
                                                                pelatihan
                                                            )
                                                            : alert(
                                                                "Oopsss, penyiapan draft sertifikat peserta belum selesai!"
                                                            );
                                                    }}
                                                >
                                                    <RiCheckboxCircleFill className="h-5 w-5 text-indigo-500" size={14} /> Kirim SPV
                                                </Button>
                                            )}

                                        <Link
                                            title="Detail Pelatihan"
                                            target={'_blank'}
                                            href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(
                                                pelatihan.IdPelatihan.toString()
                                            )}`}
                                            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border border-blue-500 bg-blue-500 text-white 
             hover:bg-blue-600  transition-colors  w-full 
             shadow-sm"
                                        >
                                            <RiInformationFill className="h-5 w-5 " />
                                            Review
                                        </Link>




                                        {/* Upload Surat Pemberitahuan Pelatihan */}
                                        {accessPermissions?.includes('createPelatihan') && (
                                            <UploadSuratButton
                                                idPelatihan={String(pelatihan.IdPelatihan)}
                                                pelatihan={pelatihan}
                                                handleFetchingData={fetchDataPelatihanMasyarakat}
                                            />
                                        )}

                                        {/* Approve and Send to Kapuslat */}

                                        {/* {
                                            accessPermissions?.includes('approveSertifikat') &&
                                            <>
                                                <Button
                                                    size="sm"
                                                    title="Approve"
                                                    className="w-full inline-flex items-center justify-center gap-2 
               h-10 px-5 text-sm font-medium rounded-full 
               border border-teal-500 bg-teal-500 text-white 
               hover:bg-teal-600 transition-colors shadow-sm"
                                                    onClick={() => {
                                                        handleApprovedSertifikatBySPV(
                                                            String(pelatihan.IdPelatihan),
                                                            pelatihan
                                                        )
                                                    }}
                                                >
                                                    <RiCheckboxCircleFill className="h-5 w-5 " size={14} />
                                                </Button>
                                            </>
                                        } */}

                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-neutral-600">
                    Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Detail Modal */}
            <DetailPelatihanDialog selectedPelatihan={selectedPelatihan} setSelectedPelatihan={setSelectedPelatihan} generateTanggalPelatihan={generateTanggalPelatihan} />
        </div>
    );
};

function DetailPelatihanDialog({
    selectedPelatihan,
    setSelectedPelatihan,
    generateTanggalPelatihan,
}: {
    selectedPelatihan: PelatihanMasyarakat | null;
    setSelectedPelatihan: (pel: PelatihanMasyarakat | null) => void;
    generateTanggalPelatihan: (tanggal: string) => string;
}) {
    const renderField = (
        label: string,
        value: any,
        Icon: React.ElementType = Info
    ) => (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Icon className="w-4 h-4 text-gray-500 mt-[2px]" />
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                {
                    label.includes('Memo') || label.includes('Berita') || label.includes('Surat') ? <Link href={value} target={'_blank'}><span className="text-sm font-medium text-gray-800">Tautan {label}</span></Link> : <span className="text-sm font-medium text-gray-800">{value || "-"}</span>
                }
            </div>
        </div>
    );

    return (
        <Dialog
            open={!!selectedPelatihan}
            onOpenChange={() => setSelectedPelatihan(null)}
        >
            <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl shadow-lg">
                <DialogHeader className="p-6 border-b bg-gradient-to-r from-indigo-50 to-white">
                    <DialogTitle className="text-lg font-semibold">
                        Detail Pelatihan
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Informasi lengkap tentang pelatihan yang dipilih.
                    </DialogDescription>
                </DialogHeader>

                {selectedPelatihan && (
                    <ScrollArea className="max-h-[70vh] p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            {renderField("Nama Pelatihan", selectedPelatihan.NamaPelatihan, Tag)}
                            {renderField("Program", selectedPelatihan.Program, ClipboardList)}
                            {renderField("Jenis Program", selectedPelatihan.JenisProgram, ClipboardList)}
                            {renderField("Penyelenggara", selectedPelatihan.PenyelenggaraPelatihan, Building)}
                            {renderField(
                                "Tanggal Pelatihan",
                                selectedPelatihan.TanggalMulaiPelatihan
                                    ? `${generateTanggalPelatihan(
                                        selectedPelatihan.TanggalMulaiPelatihan
                                    )} s.d ${generateTanggalPelatihan(
                                        selectedPelatihan.TanggalBerakhirPelatihan || ""
                                    )}`
                                    : "-",
                                Calendar
                            )}
                            {renderField(
                                "Jumlah Peserta",
                                selectedPelatihan.UserPelatihan?.length ?? 0,
                                Users
                            )}
                            {renderField("Instruktur", selectedPelatihan.Instruktur, User)}
                            {renderField("Lokasi", selectedPelatihan.LokasiPelatihan, MapPin)}

                            {renderField("Jenis Pelatihan", selectedPelatihan.JenisPelatihan, Tag)}
                            {renderField("Bidang", selectedPelatihan.BidangPelatihan, Tag)}
                            {renderField(
                                "Dukungan Program Terobosan",
                                selectedPelatihan.DukunganProgramTerobosan,
                                Award
                            )}
                            {renderField(
                                "Pelaksanaan Pelatihan",
                                selectedPelatihan.PelaksanaanPelatihan,
                                ClipboardList
                            )}
                            {renderField("Asal Pelatihan", selectedPelatihan.AsalPelatihan, Tag)}

                            {renderField("Ttd Sertifikat", selectedPelatihan.TtdSertifikat, FileText)}


                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default TableDataPelatihanMasyarakat;

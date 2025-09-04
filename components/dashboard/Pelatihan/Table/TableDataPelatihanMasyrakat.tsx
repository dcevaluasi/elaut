import React, { useState } from "react";
import Link from "next/link";
import { RiCheckboxCircleFill, RiInformationFill, RiSendPlaneFill } from "react-icons/ri";
import { BiPaperPlane } from "react-icons/bi";
import { PelatihanMasyarakat } from "@/types/product";
import UploadSuratButton from "../../Dashboard/Actions/UploadSuratButton";
import { Button } from "@/components/ui/button";

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

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const accessPermissions = Cookies.get('Access')

    return (
        <div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-5 text-center">No</th>
                            <th className="px-4 py-5 text-center">
                                <div className="flex items-center justify-center w-full gap-1">
                                    <BookOpen size={14} className="text-blue-500" /> Nama Pelatihan
                                </div>
                            </th>
                            <th className="px-4 py-5 text-center">Program</th>
                            <th className="px-4 py-5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Users size={14} className="text-emerald-500" /> Peserta
                                </div>
                            </th>
                            <th className="px-4 py-5 text-center">Status</th>
                            <th className="px-4 py-5 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((pelatihan: PelatihanMasyarakat, index: number) => {
                            if (!pelatihan) return null;

                            const waktuPelaksanaan = pelatihan.TanggalMulaiPelatihan
                                ? `${generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} s.d ${generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan || "")}`
                                : "-";

                            const waktuPendaftaran = pelatihan.TanggalMulaiPendaftaran
                                ? `${generateTanggalPelatihan(pelatihan.TanggalMulaiPendaftaran)} s.d ${generateTanggalPelatihan(pelatihan.TanggalAkhirPendaftaran || "")}`
                                : "-";

                            const { label, color, icon } = getStatusInfo(String(pelatihan.StatusPenerbitan));

                            return (
                                <tr
                                    key={pelatihan.IdPelatihan}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 border border-gray-200 text-center text-gray-500">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-4 py-3 border border-gray-200">
                                        <div className="flex flex-col w-full h-full ">
                                            <p className="text-base font-semibold leading-tight">{pelatihan.NamaPelatihan}</p>
                                            <div className="flex flex-col !font-normal">
                                                <span className="text-sm text-gray-400 leading-tight">Pendaftaran : {waktuPendaftaran}</span>
                                                <span className="text-sm text-gray-400 leading-tight">Pelaksanaan : {waktuPelaksanaan}</span>
                                                <span className="text-sm text-gray-400 leading-tight">Lokasi : {pelatihan?.LokasiPelatihan}</span>
                                                <span className="text-sm text-gray-400 leading-tight">Penyelenggara : {pelatihan?.PenyelenggaraPelatihan}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border border-gray-200 text-center">
                                        <div className="flex items-center justify-center w-full h-full">
                                            <p className="font-semibold">{pelatihan.Program}</p>
                                        </div>
                                    </td>


                                    <td className="px-4 py-3 border border-gray-200 text-center">
                                        {pelatihan.UserPelatihan?.length ?? 0}
                                    </td>

                                    <td className={`px-4 py-3 border border-gray-200 text-center flex-shrink-0  ${color}`}>
                                        <span className="flex items-center justify-center w-full h-full  flex-shrink-0"><span className="flex-shrink-0">{icon}</span>{label}</span>

                                    </td>

                                    {/* Action Buttons */}
                                    <td className="px-4 py-3 border border-gray-200">
                                        <div className=" flex flex-col gap-2 justify-center items-center h-full">



                                            {
                                                (Cookies.get('Access')?.includes('isSigning') || Cookies.get('Access')?.includes('verifyPelaksanaan') || Cookies.get('Access')?.includes('supervisePelaksanaan')) && <Link
                                                    title="Review Pelatihan"
                                                    target={'_blank'}
                                                    href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(
                                                        pelatihan.IdPelatihan.toString()
                                                    )}`}
                                                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                                >
                                                    <RiInformationFill className="h-4 w-4 " />
                                                    Review
                                                </Link>
                                            }

                                            {
                                                Cookies.get('Access')?.includes('createPelatihan') && <Link
                                                    title="Kelola Pelatihan"
                                                    target={'_blank'}
                                                    href={`/admin/${usePathname().includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(
                                                        pelatihan.IdPelatihan.toString()
                                                    )}`}
                                                    className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border border-gray-500 text-gray-500 hover:text-white hover:bg-gray-500"
                                                >
                                                    <RiInformationFill className="h-4 w-4 " />
                                                    Manage
                                                </Link>
                                            }
                                        </div>
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
        </div>
    );
};

export default TableDataPelatihanMasyarakat;

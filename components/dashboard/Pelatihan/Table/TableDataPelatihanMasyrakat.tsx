import React, { useState } from "react";
import Link from "next/link";
import { RiInformationFill } from "react-icons/ri";
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
    const [selectedPelatihan, setSelectedPelatihan] =
        useState<PelatihanMasyarakat | null>(null);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((pelatihan, index) => {
                            if (!pelatihan) return null;

                            const waktuPelaksanaan = pelatihan.TanggalMulaiPelatihan
                                ? `${generateTanggalPelatihan(pelatihan.TanggalMulaiPelatihan)} s.d ${generateTanggalPelatihan(pelatihan.TanggalBerakhirPelatihan || "")}`
                                : "-";

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
                                    <td className="px-4 py-3 flex flex-wrap gap-2 justify-center">
                                        {Cookies.get('createPenandatanganan') == '1' ?
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
                                            </> : <Link
                                                title="Detail Pelatihan"
                                                href={`/admin/lemdiklat/pelatihan/detail/${pelatihan.KodePelatihan}/${encryptValue(
                                                    pelatihan.IdPelatihan.toString()
                                                )}`}
                                                className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border border-neutral-300 bg-white text-neutral-700 
             hover:bg-neutral-100 hover:text-neutral-900 transition-colors 
             shadow-sm"
                                            >
                                                <RiInformationFill className="h-5 w-5 text-blue-500" />
                                                Detail
                                            </Link>
                                        }




                                        {!isOperatorBalaiPelatihan &&
                                            pelatihan.PemberitahuanDiterima === "Kirim ke SPV" && (
                                                <Button
                                                    size="sm"
                                                    className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium 
             rounded-full border border-neutral-300 bg-white text-neutral-700 
             hover:bg-neutral-100 hover:text-neutral-900 transition-colors 
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
                                                    <BiPaperPlane className=" text-indigo-500" size={14} /> Kirim ke SPV
                                                </Button>
                                            )}

                                        {isOperatorBalaiPelatihan &&
                                            pelatihan.TtdSertifikat !==
                                            "Kepala Balai Pelatihan dan Penyuluhan Perikanan" && (
                                                <UploadSuratButton
                                                    idPelatihan={String(pelatihan.IdPelatihan)}
                                                    pelatihan={pelatihan}
                                                    handleFetchingData={fetchDataPelatihanMasyarakat}
                                                    suratPemberitahuan={pelatihan.SuratPemberitahuan}
                                                />
                                            )}
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

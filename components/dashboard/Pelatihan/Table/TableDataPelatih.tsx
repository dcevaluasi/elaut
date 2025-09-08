"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Pelatih {
    nama: string;
    id_lemdik: string;
    jenis_pelatih: string;
    jenjang_jabatan: string;
    bidang_keahlian: string;
    metodologi_pelatihan: string;
    pelatihan_pelatih: string;
    kompetensi_teknis: string;
    management_of_training: string;
    training_officer_course: string;
    link_data_dukung_sertifikat: string;
    status: string;
    pendidikkan_terakhir: string;
    eselonI: string;
    eselonII: string;
    no_telpon: string;
    email: string;
    nip: string;
}

interface TableDataPelatihProps {
    data: Pelatih[];
}

const TableDataPelatih: React.FC<TableDataPelatihProps> = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
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
                            <th className="px-4 py-3 text-center">Nama</th>
                            <th className="px-4 py-3 text-center">ID Lemdik</th>
                            <th className="px-4 py-3 text-center">Jenis Pelatih</th>
                            <th className="px-4 py-3 text-center">Jenjang Jabatan</th>
                            <th className="px-4 py-3 text-center">Bidang Keahlian</th>
                            <th className="px-4 py-3 text-center">Metodologi Pelatihan</th>
                            <th className="px-4 py-3 text-center">Pelatihan Pelatih</th>
                            <th className="px-4 py-3 text-center">Kompetensi Teknis</th>
                            <th className="px-4 py-3 text-center">Management of Training</th>
                            <th className="px-4 py-3 text-center">Training Officer Course</th>
                            <th className="px-4 py-3 text-center">Data Dukung Sertifikat</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Pendidikan Terakhir</th>
                            <th className="px-4 py-3 text-center">Eselon I</th>
                            <th className="px-4 py-3 text-center">Eselon II</th>
                            <th className="px-4 py-3 text-center">No. Telp</th>
                            <th className="px-4 py-3 text-center">Email</th>
                            <th className="px-4 py-3 text-center">NIP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-4 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-4 py-2 border">{row.nama}</td>
                                <td className="px-4 py-2 border text-center">
                                    {row.id_lemdik}
                                </td>
                                <td className="px-4 py-2 border">{row.jenis_pelatih}</td>
                                <td className="px-4 py-2 border">{row.jenjang_jabatan}</td>
                                <td className="px-4 py-2 border">{row.bidang_keahlian}</td>
                                <td className="px-4 py-2 border">{row.metodologi_pelatihan}</td>
                                <td className="px-4 py-2 border">{row.pelatihan_pelatih}</td>
                                <td className="px-4 py-2 border">{row.kompetensi_teknis}</td>
                                <td className="px-4 py-2 border">
                                    {row.management_of_training}
                                </td>
                                <td className="px-4 py-2 border">
                                    {row.training_officer_course}
                                </td>
                                <td className="px-4 py-2 border text-blue-600 underline">
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Link
                                    </a>
                                </td>
                                <td className="px-4 py-2 border text-center">{row.status}</td>
                                <td className="px-4 py-2 border">
                                    {row.pendidikkan_terakhir}
                                </td>
                                <td className="px-4 py-2 border">{row.eselonI}</td>
                                <td className="px-4 py-2 border">{row.eselonII}</td>
                                <td className="px-4 py-2 border">{row.no_telpon}</td>
                                <td className="px-4 py-2 border">{row.email}</td>
                                <td className="px-4 py-2 border">{row.nip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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

export default TableDataPelatih;

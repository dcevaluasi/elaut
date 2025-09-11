"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CountStats, useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instruktur } from "@/types/instruktur";
import { Input } from "@/components/ui/input";
import { truncateText } from "@/utils";
import AddInstrukturAction from "../../Dashboard/Actions/AddInstrukturAction";
import { Briefcase, GraduationCap, Layers, Users } from "lucide-react";


const TableDataPelatih = () => {
    const { instrukturs, loading, error, fetchInstrukturData, stats } = useFetchDataInstruktur()

    useEffect(() => {
        fetchInstrukturData()
    }, [fetchInstrukturData])

    return (
        <div>
            <StatsCards data={instrukturs} stats={stats} />
            <InstrukturTable data={instrukturs} fetchData={fetchInstrukturData} />
        </div>
    );
};

type Props = {
    data: Instruktur[]
    fetchData: any
}

function InstrukturTable({ data, fetchData }: Props) {
    const [search, setSearch] = useState("")

    // Filter data by search query
    const filteredData = useMemo(() => {
        if (!search) return data
        return data.filter((row) =>
            Object.values(row).some((val) =>
                String(val).toLowerCase().includes(search.toLowerCase())
            )
        )
    }, [data, search])

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Instruktur</h2>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Cari instruktur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64 py-0 text-sm"
                    />
                    <AddInstrukturAction onSuccess={fetchData} />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-40 px-3 py-3 text-center">Nama</th>
                            <th className="w-28 px-3 py-3 text-center">No. Telp</th>
                            <th className="w-40 px-3 py-3 text-center">Email</th>
                            <th className="w-36 px-3 py-3 text-center">NIP</th>
                            <th className="w-32 px-3 py-3 text-center">Jenjang Jabatan</th>
                            <th className="w-32 px-3 py-3 text-center">Pangkat/Golongan</th>
                            <th className="w-32 px-3 py-3 text-center">Bidang Keahlian</th>
                            <th className="w-40 px-3 py-3 text-center">Management of Training</th>
                            <th className="w-40 px-3 py-3 text-center">Trainer of Training</th>
                            <th className="w-28 px-3 py-3 text-center">Sertifikat</th>
                            <th className="w-24 px-3 py-3 text-center">Status</th>
                            <th className="w-28 px-3 py-3 text-center">Pendidikan Terakhir</th>
                            <th className="w-40 px-3 py-3 text-center">Eselon I</th>
                            <th className="w-40 px-3 py-3 text-center">Eselon II</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={index}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[150px] truncate"
                                    title={row.nama}
                                >
                                    {row.nama}
                                </td>
                                <td className="px-3 py-2 border">{row.no_telpon}</td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.email}
                                >
                                    {row.email}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px]"
                                    title={row.nip}
                                >
                                    {row.nip}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.jenjang_jabatan}</td>
                                <td className="px-3 py-2 border text-center">{row.pelatihan_pelatih}</td>
                                <td className="px-3 py-2 border text-center">{row.bidang_keahlian}</td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] truncate"
                                    title={row.management_of_training}
                                >
                                    {row.management_of_training}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] text-blue-600 underline truncate"
                                    title={row.training_officer_course}
                                >
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer "
                                        className="truncate"
                                    >
                                        {row.training_officer_course}
                                    </a>

                                </td>
                                <td className="px-3 py-2 border text-blue-600 underline text-center truncate">
                                    <a
                                        href={row.link_data_dukung_sertifikat}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate"
                                    >
                                        {truncateText(row.link_data_dukung_sertifikat, 20, '...')}
                                    </a>
                                </td>
                                <td className="px-3 py-2 border text-center">{row.status}</td>
                                <td className="px-3 py-2 border text-center">{row.pendidikkan_terakhir}</td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] truncate"
                                    title={row.eselon_1}
                                >
                                    {row.eselon_1}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px] truncate"
                                    title={row.eselon_2}
                                >
                                    {row.eselon_2}
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td
                                    colSpan={18}
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>
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
    )
}

function StatsCards({ data, stats }: {
    data: Instruktur[]
    stats: CountStats
}) {
    return (
        <div className="space-y-6 my-6">
            {/* Breakdown Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex gap-6 flex-col">
                    {/* Total Data */}
                    <Card className="shadow-sm rounded-xl border border-gray-100 h-fit bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium text-gray-600">
                                Total Instruktur
                            </CardTitle>
                            <Users className="w-5 h-5 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-800">{data.length}</p>
                            <p className="text-xs text-gray-500">Instruktur terdaftar</p>
                        </CardContent>
                    </Card>

                    {/* Pendidikan Terakhir */}
                    <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all h-fit">
                        <CardHeader className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-500" />
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                Pendidikan Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="gap-2 grid grid-cols-2">
                                {Object.entries(stats.pendidikanTerakhir).map(([key, count]) => (
                                    <li
                                        key={key}
                                        className="flex items-center justify-between bg-purple-50 px-3 py-2 rounded-lg text-sm hover:bg-purple-100 transition"
                                    >
                                        <span className="font-medium text-gray-700">{key}</span>
                                        <span className="text-purple-600 font-bold">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Bidang Keahlian */}
                <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                    <CardHeader className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Bidang Keahlian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="gap-2 grid grid-cols-2">
                            {Object.entries(stats.bidangKeahlian).map(([key, count]) => (
                                <li
                                    key={key}
                                    className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition"
                                >
                                    <span className="font-medium text-gray-700">{key}</span>
                                    <span className="text-blue-600 font-bold">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Jenjang Jabatan */}
                <Card className="shadow-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                    <CardHeader className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-500" />
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Jenjang Jabatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="gap-2 grid grid-cols-2">
                            {Object.entries(stats.jenjangJabatan).map(([key, count]) => (
                                <li
                                    key={key}
                                    className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg text-sm hover:bg-green-100 transition"
                                >
                                    <span className="font-medium text-gray-700">{key}</span>
                                    <span className="text-green-600 font-bold">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default TableDataPelatih;

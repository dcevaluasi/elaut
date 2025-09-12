
"use client";

import React, { useState, useMemo } from "react";
import { Book, BookOpen, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import AddInstrukturAction from "../Actions/Instruktur/AddInstrukturAction";
import UpdateModulAction from "../Actions/Modul/UpdateModulAction";
import { TbBook } from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchModulPelatihan } = useFetchDataMateriPelatihanMasyarakat();

    // Filtered & paginated data
    const filteredData = useMemo(
        () =>
            data.filter((item) =>
                item.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [data, searchQuery]
    );

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Metrics
    const totalModul = data.reduce((acc, m) => acc + m.ModulPelatihan.length, 0);
    const totalMateri = data.length;

    if (loading)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="flex w-full gap-4">
                <Card className="h-fit rounded-xl w-full border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium text-gray-600">
                            Total Modul
                        </CardTitle>
                        <Book className="h-5 w-5 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-800">{totalMateri}</p>
                        <p className="text-xs text-gray-500">Modul tersedia</p>
                    </CardContent>
                </Card>
                <Card className="h-fit rounded-xl w-full border border-gray-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium text-gray-600">
                            Total Materi
                        </CardTitle>
                        <File className="h-5 w-5 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-gray-800">{totalModul}</p>
                        <p className="text-xs text-gray-500">Materi tersedia</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Modul Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari modul..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48  py-1 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        <AddInstrukturAction onSuccess={fetchModulPelatihan} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama Modul Pelatihan</th>
                            <th className="w-28 px-3 py-3 text-center">Bidang</th>
                            <th className="w-40 px-3 py-3 text-center">Jumlah Materi</th>
                            <th className="w-36 px-3 py-3 text-center">Diupload pada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.IdMateriPelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                        <UpdateModulAction onSuccess={fetchModulPelatihan} materiPelatihan={row} />
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                (window.location.href = `/admin/lemdiklat/master/modul/${row.IdMateriPelatihan}`)
                                            }
                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-blue-500 text-blue-500 hover:text-white hover:bg-blue-500"
                                        >
                                            <TbBook className="h-4 w-4" />
                                            Detil Modul
                                        </Button>
                                        {/* <DeleteInstrukturAction onSuccess={fetchData} instruktur={row} /> */}
                                    </div>

                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.NamaMateriPelatihan}
                                >
                                    {row.NamaMateriPelatihan}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.BidangMateriPelatihan}
                                >
                                    {row.BidangMateriPelatihan}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.ModulPelatihan.length}</td>
                                <td
                                    className="px-3 py-2 border max-w-[200px]"
                                    title={row.CreateAt}
                                >
                                    {row.CreateAt}
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
    );
}

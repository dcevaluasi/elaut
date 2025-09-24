
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import ManageProgramPelatihanAction from "@/commons/actions/master/program-pelatihan/ManageProgramPelatihanAction";

export default function TableProgramPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchProgramPelatihan } = useFetchDataProgramPelatihan();

    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        return data.filter((row) => {
            const matchesSearch =
                !searchQuery ||
                Object.values(row).some((val) =>
                    String(val ?? "")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                );

            return matchesSearch;
        });
    }, [data, searchQuery]);


    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (loading)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mt-10">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Program Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari program..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48  py-1 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        {
                            Cookies.get('Access')?.includes('superAdmin') && <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} />
                        }

                    </div>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama Indo</th>
                            <th className="w-40 px-3 py-3 text-center">Name English</th>
                            <th className="w-40 px-3 py-3 text-center">Singkatan</th>
                            <th className="w-40 px-3 py-3 text-center">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => {

                            return <tr
                                key={row.id_program_pelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                        <ManageProgramPelatihanAction onSuccess={fetchProgramPelatihan} initialData={row} />
                                    </div>
                                </td>
                                <td className="px-3 py-2 border text-center">{row.name_indo}</td>
                                <td className="px-3 py-2 border text-center">{row.name_english}</td>
                                <td className="px-3 py-2 border text-center">{row.abbrv_name}</td>
                                <td className="px-3 py-2 border text-center">{row.description}</td>
                            </tr>
                        })}
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

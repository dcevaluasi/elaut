"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { BookOpen, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MateriPelatihan, ModulPelatihan } from "@/types/module";
import { generateTanggalPelatihan } from "@/utils/text";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";

export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat();

    // Filtered & paginated data
    const filteredData = useMemo(() => {
        return data.filter((item) =>
            item.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto mt-8 space-y-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 mb-4">
                <Input
                    placeholder="Cari materi pelatihan..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="flex-1"
                />
            </div>

            {/* Table */}
            <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-3 text-center">No</th>
                        <th className="px-4 py-3 text-left flex items-center gap-1">
                            <BookOpen size={14} className="text-blue-500" /> Nama Materi
                        </th>
                        <th className="px-4 py-3 text-left">Bidang</th>
                        <th className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Calendar size={14} className="text-indigo-500" /> Dibuat
                            </div>
                        </th>
                        <th className="px-4 py-3 text-center">Jumlah Modul</th>
                        <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((materi, idx) => (
                        <tr key={materi.IdMateriPelatihan} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-3 text-center text-gray-500">
                                {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td className="px-4 py-3 font-medium">{materi.NamaMateriPelatihan.replace(/-/g, " ")}</td>
                            <td className="px-4 py-3">{materi.BidangMateriPelatihan || "-"}</td>
                            <td className="px-4 py-3 text-center">{materi.CreateAt}</td>
                            <td className="px-4 py-3 text-center">{materi.ModulPelatihan.length}</td>
                            <td className="px-4 py-3 text-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(materi.ModulPelatihan[0]?.BahanTayang, "_blank")}
                                >
                                    Lihat Modul
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Prev
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiInformationFill } from "react-icons/ri";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { FiSearch, FiX } from "react-icons/fi";

export default function TableModulPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    const { data, loading, error } = useFetchDataMateriPelatihanMasyarakat();

    // Filtered & paginated data
    const filteredData = useMemo(
        () =>
            data.filter((item) =>
                item.NamaMateriPelatihan.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [data, searchQuery]
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Metrics
    const totalModul = data.reduce((acc, m) => acc + m.ModulPelatihan.length, 0);
    const totalMateri = data.length;

    if (loading)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto mt-8 space-y-6">
            {/* Metrics */}
            <div className="flex w-full gap-4">
                {/* Total Modul */}
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                >
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Total Modul</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {totalMateri}
                    </span>
                </button>

                {/* Total File Modul */}
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                >
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Total File Modul</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {totalModul}
                    </span>
                </button>
                {/* Search Input */}

                <div className="relative w-full max-w-md">
                    {/* Search Icon */}
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <FiSearch className="w-5 h-5" />
                    </span>

                    {/* Input Field */}
                    <Input
                        placeholder="Cari modul pelatihan..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10 pr-10 py-2 w-full rounded-full border border-gray-300 bg-white text-sm text-gray-700 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />

                    {/* Clear Button */}
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setCurrentPage(1);
                            }}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>




            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-center">No</th>
                            <th className="px-4 py-3 text-left flex items-center gap-1">
                                <BookOpen size={14} className="text-blue-500" /> Nama Modul
                            </th>
                            <th className="px-4 py-3 text-left">Bidang</th>
                            <th className="px-4 py-3 text-center flex items-center justify-center gap-1">
                                <Calendar size={14} className="text-indigo-500" /> Diupload
                            </th>
                            <th className="px-4 py-3 text-center">Jumlah Modul</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((materi, idx) => (
                            <tr
                                key={materi.IdMateriPelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-4 py-3 text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + idx + 1}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {materi.NamaMateriPelatihan.replace(/-/g, " ")}
                                </td>
                                <td className="px-4 py-3">{materi.BidangMateriPelatihan || "-"}</td>
                                <td className="px-4 py-3 text-center">{materi.CreateAt}</td>
                                <td className="px-4 py-3 text-center">{materi.ModulPelatihan.length}</td>
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            (window.location.href = `/admin/lemdiklat/master/modul/${materi.IdMateriPelatihan}`)
                                        }
                                        className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-sm"
                                    >
                                        <RiInformationFill className="h-5 w-5 text-blue-500" /> Detail Modul
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

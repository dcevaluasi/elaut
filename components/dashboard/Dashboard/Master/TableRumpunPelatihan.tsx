
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { useFetchDataRumpunPelatihan } from "@/hooks/elaut/master/useFetchDataRumpunPelatihan";
import { FiTrash2 } from "react-icons/fi";
import { elautBaseUrl } from "@/constants/urls";
import ManageRumpunPelatihanAction from "@/commons/actions/master/rumpun-pelatihan/ManageRumpunPelatihanAction";

export default function TableRumpunPelatihan() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data, loading, error, fetchRumpunPelatihan } = useFetchDataRumpunPelatihan();
    const filteredData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        const query = (searchQuery ?? "").toLowerCase();

        return data.filter((row) => {
            return (
                !query ||
                Object.values(row).some((val) => {
                    if (val == null) return false;
                    if (typeof val === "object") return false;
                    return String(val).toLowerCase().includes(query);
                })
            );
        });
    }, [data, searchQuery]);

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const [namaEdit, setNamaEdit] = useState<string>("")
    const [openEdit, setOpenEdit] = useState<boolean>(false)

    if (loading)
        return <p className="text-center py-10 text-gray-500">Loading...</p>;
    if (error)
        return <p className="text-center text-red-500 py-10">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mt-10">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Klaster Pelatihan</h2>
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Cari klaster..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-48  py-1 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                        {
                            Cookies.get('Access')?.includes('superAdmin') && <ManageRumpunPelatihanAction onSuccess={fetchRumpunPelatihan} />
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
                            <th className="w-40 px-3 py-3 text-center">Nama Klaster</th>
                            <th className="w-40 px-3 py-3 text-center">Jumlah Program Diklat</th>
                            <th className="w-40 px-3 py-3 text-center">Created At</th>
                            <th className="w-40 px-3 py-3 text-center">Updated At</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => {

                            return <tr
                                key={row.id_rumpun_pelatihan}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full items-center justify-center py-2">
                                        <ManageRumpunPelatihanAction onSuccess={fetchRumpunPelatihan} initialData={row} />
                                        <button
                                            onClick={async () => {
                                                const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus klaster pelatihan ini?");
                                                if (!confirmDelete) return;

                                                try {
                                                    const res = await fetch(
                                                        `${elautBaseUrl}/rumpun_pelatihan/delete_rumpun_pelatihan?id=${row.id_rumpun_pelatihan}`,
                                                        { method: "DELETE" }
                                                    );
                                                    if (!res.ok) throw new Error("Gagal menghapus bahan tayang");

                                                    fetchRumpunPelatihan();
                                                    alert("✅ Klaster pelatihan berhasil dihapus");
                                                } catch (error) {
                                                    console.error(error);
                                                    alert("❌ Gagal menghapus klaster pelatihan");
                                                }
                                            }}
                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-2 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 border group"
                                        >
                                            <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                                <td className="px-3 py-2 border text-center">{row.name}</td>
                                <td className="px-3 py-2 border text-center">{row.programs.length}</td>
                                <td className="px-3 py-2 border text-center">{row.created}</td>
                                <td className="px-3 py-2 border text-center">{row.updated}</td>

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

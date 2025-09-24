"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataUnitKerja } from "@/hooks/elaut/unit-kerja/useFetchDataUnitKerja";
import { UnitKerja } from "@/types/master";
import { generatedSignedCertificate } from "@/utils/certificates";
import Cookies from "js-cookie";
import ManageUnitKerjaAction from "@/commons/actions/unit-kerja/ManageUnitKerjaAction";
import { elautBaseUrl } from "@/constants/urls";
import { FiTrash2 } from "react-icons/fi";

const TableDataUnitKerja = () => {
    const { unitKerjas, loading: loadingUnitKerja, error: errorUnitKerja, fetchUnitKerjaData } = useFetchDataUnitKerja()

    useEffect(() => {
        fetchUnitKerjaData()
    }, [fetchUnitKerjaData])

    return (
        <div>
            <UnitKerjaTable data={unitKerjas} fetchData={fetchUnitKerjaData} />
        </div>
    );
};

type Props = {
    data: UnitKerja[]
    fetchData: any
}

function UnitKerjaTable({ data, fetchData }: Props) {
    const [search, setSearch] = useState("")

    const filteredData = useMemo(() => {
        const cookieIdUnitKerja = Cookies.get("IDUnitKerja");

        return data.filter((row) => {
            const matchesSearch =
                !search ||
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(search.toLowerCase())
                );

            const matchesUnitKerja =
                cookieIdUnitKerja && cookieIdUnitKerja.toString() !== "0" && cookieIdUnitKerja.toString() !== "8"
                    ? String(row.id_unit_kerja ?? "") === cookieIdUnitKerja
                    : true;

            return matchesSearch && matchesUnitKerja;
        });
    }, [data, search]);

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Unit Kerja</h2>
                {
                    Cookies.get('Access')?.includes('superAdmin') && <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                        <Input
                            type="text"
                            placeholder="Cari unit kerja..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-48  py-1 text-sm"
                        />

                        <div className="flex flex-wrap gap-2">
                            {
                                Cookies.get('Access')?.includes('superAdmin') && <ManageUnitKerjaAction onSuccess={fetchData} />
                            }
                        </div>
                    </div>
                }
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center">No</th>
                            <th className="w-12 px-3 py-3 text-center">Action</th>
                            <th className="w-40 px-3 py-3 text-center">Nama</th>
                            <th className="w-28 px-3 py-3 text-center">Alamat</th>
                            <th className="w-40 px-3 py-3 text-center">Pimpinan</th>
                            <th className="w-36 px-3 py-3 text-center">Call Center</th>
                            <th className="w-32 px-3 py-3 text-center">Tipe</th>
                            <th className="w-32 px-3 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.id_unit_kerja}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-4 border">
                                    <div className="flex flex-row gap-2 h-full px-3 py-2">
                                        <ManageUnitKerjaAction onSuccess={fetchData} unitKerja={row} />
                                        <button
                                            onClick={async () => {
                                                const confirmDelete = window.confirm("⚠️ Apakah Anda yakin ingin menghapus unit kerja ini?");
                                                if (!confirmDelete) return;

                                                try {
                                                    const res = await fetch(
                                                        `${elautBaseUrl}/unit-kerja/deleteUnitKerja?id=${row.id_unit_kerja}`,
                                                        {
                                                            method: "DELETE", headers: {
                                                                "Authorization": `Bearer ${Cookies.get("XSRF091")}`,
                                                                "Content-Type": "application/json",
                                                            },
                                                        }
                                                    );
                                                    if (!res.ok) throw new Error("Gagal menghapus unit kerja");

                                                    fetchData();
                                                    alert("✅ Unit kerja berhasil dihapus");
                                                } catch (error) {
                                                    console.error(error);
                                                    alert("❌ Gagal menghapus unit kerja");
                                                }
                                            }}
                                            className="flex items-center gap-2 w-fit rounded-lg px-4 py-1 shadow-sm transition-all bg-transparent border-rose-500 text-rose-500 hover:text-white hover:bg-rose-500 border group"
                                        >
                                            <FiTrash2 className="h-5 w-5 text-rose-500 group-hover:text-white" />
                                            Hapus
                                        </button>
                                    </div>

                                </td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.nama}
                                >
                                    {row.nama}
                                </td>
                                <td className="px-3 py-2 border">{row.alamat}</td>
                                <td
                                    className="px-3 py-2 border max-w-full"
                                    title={row.pimpinan}
                                >
                                    {generatedSignedCertificate(row.pimpinan).name} - {generatedSignedCertificate(row.pimpinan).status_indo}
                                </td>
                                <td
                                    className="px-3 py-2 border max-w-[200px]"
                                    title={row.call_center}
                                >
                                    {row.call_center}
                                </td>
                                <td className="px-3 py-2 border text-center">{row.tipe}</td>
                                <td className="px-3 py-2 border text-center">{row.status}</td>
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


export default TableDataUnitKerja;

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { P2MKP } from "@/types/p2mkp";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"; // Using generic icons for now
import { usePathname } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import Cookies from "js-cookie";
import { elautBaseUrl } from "@/constants/urls";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";

const TableDataP2MKP = () => {
    const { data: p2mkpData, loading, error, fetchP2MKPData } = useFetchDataP2MKP();
    const pathname = usePathname()
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const token = Cookies.get('XSRF091');
            if (!token) {
                Swal.fire({
                    title: 'Error',
                    text: 'Anda belum login atau sesi habis.',
                    icon: 'error',
                });
                return;
            }

            const response = await axios.delete(`${elautBaseUrl}/p2mkp/delete_p2mkp?id=${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data P2MKP berhasil dihapus.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                // Refresh data
                fetchP2MKPData();
            }
        } catch (error: any) {
            console.error("Delete error:", error);
            Swal.fire({
                title: 'Gagal Menghapus',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
                icon: 'error',
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };

    const confirmDelete = (id: any) => {
        setDeleteId(id);
        setShowDeleteDialog(true);
    };

    const filteredData = useMemo(() => {
        if (!p2mkpData) return [];
        return p2mkpData.filter((row) => {
            const matchesSearch = !search || Object.values(row).some((val) =>
                String(val).toLowerCase().includes(search.toLowerCase())
            );
            return matchesSearch;
        });
    }, [p2mkpData, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data P2MKP...</div>;
    if (error) return <div className="p-8 text-center text-rose-500">Error: {error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Daftar P2MKP</h2>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Cari P2MKP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 py-1 text-sm"
                    />
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        size="sm"
                        onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/create`}
                    >
                        <FiPlus className="w-4 h-4" />
                        Tambah P2MKP
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="min-w-full table-fixed text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                        <tr>
                            <th className="w-12 px-3 py-3 text-center border">No</th>
                            <th className="w-32 px-3 py-3 text-center border">Action</th>
                            <th className="px-3 py-3 text-left border min-w-[200px]">Nama P2MKP</th>
                            <th className="px-3 py-3 text-left border min-w-[150px]">Penanggung Jawab</th>
                            {/* <th className="px-3 py-3 text-left border">Bidang Pelatihan</th> */}
                            <th className="px-3 py-3 text-left border min-w-[200px]">Alamat</th>
                            <th className="px-3 py-3 text-left border min-w-[150px]">Kontak</th>
                            <th className="w-24 px-3 py-3 text-center border">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, index) => (
                            <tr key={row.IdPpmkp || index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 border text-center text-gray-500">
                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="px-3 py-2 border">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/${row.IdPpmkp}`}
                                        >
                                            <FiEdit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                                            onClick={() => confirmDelete(row.IdPpmkp)}
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                                <td className="px-3 py-2 border">
                                    <div className="font-semibold">{row.nama_Ppmkp}</div>
                                    <div className="text-xs text-gray-500">{row.status_kepemilikan}</div>
                                </td>
                                <td className="px-3 py-2 border">
                                    <div>{row.nama_penanggung_jawab}</div>
                                </td>
                                {/* <td className="px-3 py-2 border">{row.bidang_pelatihan}</td> */}
                                <td className="px-3 py-2 border w-fit">
                                    <div className="line-clamp-2" title={`${row.alamat}, ${row.kota}, ${row.provinsi}`}>
                                        {row.kota}, {row.provinsi}
                                    </div>
                                    <div className="text-xs text-gray-500">{row.kecamatan}, {row.kelurahan}</div>
                                </td>
                                <td className="px-3 py-2 border">
                                    <div className="text-xs">{row.no_telp}</div>
                                    <div className="text-xs text-gray-500">{row.email}</div>
                                </td>
                                <td className="px-3 py-2 border text-center w-40">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {row.status || 'Draft'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-neutral-600">
                    Halaman {currentPage} dari {totalPages || 1}
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
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data P2MKP akan dihapus secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TableDataP2MKP;

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiUsers, FiMail, FiPhone, FiMapPin, FiAward, FiAlertCircle, FiDatabase } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 animate-pulse uppercase tracking-widest">Sinkronisasi Database...</p>
        </div>
    );

    if (error) return (
        <div className="p-12 text-center bg-rose-50 rounded-3xl border border-rose-100 mx-auto max-w-2xl">
            <FiAlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-rose-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-rose-600 font-medium mb-6">{error}</p>
            <Button variant="outline" onClick={() => fetchP2MKPData()} className="border-rose-200 text-rose-700 hover:bg-rose-100">
                Coba Lagi
            </Button>
        </div>
    );

    return (
        <div className="space-y-6 pt-4">
            {/* Header Controls */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-200/60 shadow-sm"
            >
                <div className="flex items-center gap-4 px-2">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase italic">P2MKP</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Data Management</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-80 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="Cari P2MKP (Nama, NIP, Alamat)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-4 py-6 bg-slate-50 border-slate-200/80 rounded-2xl focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all font-medium text-sm placeholder:text-slate-400"
                        />
                    </div>
                    <Button
                        className="w-full sm:w-auto px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl gap-3 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 font-bold uppercase tracking-wider text-xs"
                        onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/create`}
                    >
                        <FiPlus className="w-5 h-5" />
                        Tambah Data
                    </Button>
                </div>
            </motion.div>

            {/* Table Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden"
            >
                <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-16 text-center italic">IDX</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[300px]">Detail Lembaga</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[250px]">Penanggung Jawab</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] min-w-[280px]">Lokasi & Kontak</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-32 text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-32 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode="popLayout">
                                {paginatedData.map((row, index) => (
                                    <motion.tr
                                        key={row.IdPpmkp || index}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group hover:bg-slate-50/80 transition-all duration-300"
                                    >
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-[12px] font-black text-slate-300 group-hover:text-blue-500 transition-colors">
                                                {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                                                    {row?.nama_ppmkp || row?.nama_Ppmkp}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                        NIB: {row.nib}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        • {row.status_kepemilikan}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    <FiUsers size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Registrar</span>
                                                    <span className="text-[13px] font-bold text-slate-700 leading-none">
                                                        {row.nama_penanggung_jawab || "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2 max-w-[240px]">
                                                    <FiMapPin className="text-slate-400 mt-0.5 shrink-0" size={12} />
                                                    <span className="text-[11px] text-slate-500 leading-tight">
                                                        <span className="font-bold text-slate-700 uppercase tracking-tighter">{row.kota}</span>, {row.provinsi}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <FiPhone className="text-blue-400" size={12} />
                                                        <span className="text-[11px] font-bold text-slate-600">{row.no_telp || "-"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <FiMail className="text-blue-400" size={12} />
                                                        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">{row.email || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${row.status?.toLowerCase() === 'aktif'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:shadow-emerald-200/50'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:shadow-amber-200/50'
                                                    }`}>
                                                    {row.status || 'Draft'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-2.5">
                                                <button
                                                    onClick={() => window.location.href = `/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage/${row.IdPpmkp}`}
                                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-90 shadow-sm"
                                                    title="Edit Data"
                                                >
                                                    <FiEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(row.IdPpmkp)}
                                                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all active:scale-90 shadow-sm"
                                                    title="Hapus Data"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-24 px-6">
                                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                                <FiDatabase size={48} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-slate-400 uppercase italic leading-none">Record Empty</h3>
                                                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">No data available in current view</p>
                                            </div>
                                            {search && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setSearch("")}
                                                    className="rounded-xl border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest px-8"
                                                >
                                                    Reset Filter
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page <span className="text-blue-600">{currentPage}</span> of <span className="text-slate-600">{totalPages || 1}</span>
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-600">{paginatedData.length}</span> Results
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-2.5 rounded-xl border transition-all ${currentPage === 1
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm active:scale-90'
                                }`}
                        >
                            <FiChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-2.5 rounded-xl border transition-all ${(currentPage === totalPages || totalPages === 0)
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 shadow-sm active:scale-90'
                                }`}
                        >
                            <FiChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="rounded-[2.5rem] border-none bg-slate-900 text-white p-12 overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                    <AlertDialogHeader className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                            <FiTrash2 size={32} />
                        </div>
                        <div className="space-y-2 text-center">
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight italic">Confirm Eradication</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                                Tindakan ini bersifat permanen. Data P2MKP yang dihapus tidak dapat dipulihkan kembali dari database.
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="relative z-10 mt-10 gap-3 sm:justify-center">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-2xl px-10 h-14 font-bold uppercase tracking-widest text-[10px] transition-all"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white border-none rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-rose-900/40 active:scale-95"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Confirm Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TableDataP2MKP;

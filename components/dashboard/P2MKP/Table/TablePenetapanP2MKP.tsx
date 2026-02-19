"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Search,
    Trash2,
    Loader2,
    Eye,
    Calendar,
    MapPin,
    User,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    ShieldCheck
} from "lucide-react";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { PengajuanPenetapanP2MKP, P2MKP } from "@/types/p2mkp";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";
import { HistoryTraining, HistoryItem } from "@/types/product";
import getDocument from "@/firebase/firestore/getData";
import addData from "@/firebase/firestore/addData";
import axios from "axios";
import Cookies from "js-cookie";
import { elautBaseUrl } from "@/constants/urls";
import Toast from "@/commons/Toast";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { generateTimestamp } from "@/utils/time";
import Swal from "sweetalert2";

const TablePenetapanP2MKP = () => {
    const { data: pengajuanData, loading, error, fetchPengajuanData } = useFetchDataPengajuanPenetapan();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Approval Dialog State
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanPenetapanP2MKP | null>(null);
    const [catatan, setCatatan] = useState("");
    const [tahunPenetapan, setTahunPenetapan] = useState(new Date().getFullYear().toString());
    const [isUpdating, setIsUpdating] = useState(false);
    const [dataHistoryTraining, setDataHistoryTraining] = useState<HistoryTraining | null>(null);

    const handleFetchDataHistoryTraining = async (id: string) => {
        const doc = await getDocument("historical-training-notes", id);
        setDataHistoryTraining(doc.data as HistoryTraining);
    };

    const handleOpenDialog = (pengajuan: PengajuanPenetapanP2MKP) => {
        setSelectedPengajuan(pengajuan);
        setCatatan("");
        setTahunPenetapan(pengajuan.tahun_penetapan || new Date().getFullYear().toString());
        handleFetchDataHistoryTraining(pengajuan.id_Ppmkp);
        setIsApprovalOpen(true);
    };

    const handleDeleteSubmission = async (id: string) => {
        const result = await Swal.fire({
            title: 'Hapus Pengajuan?',
            text: "Data ini akan dihapus secara permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            background: '#ffffff',
            customClass: {
                container: 'z-[999999999]'
            }
        });

        if (result.isConfirmed) {
            try {
                const token = Cookies.get("XSRF091");
                await axios.delete(`${elautBaseUrl}/p2mkp/delete_pengjuan_penetapan_p2mkp?id=${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                Toast.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Pengajuan penetapan berhasil dihapus.",
                });

                fetchPengajuanData();
            } catch (err: any) {
                console.error("Error deleting submission:", err);
                Toast.fire({
                    icon: "error",
                    title: "Gagal!",
                    text: err.response?.data?.message || "Terjadi kesalahan saat menghapus pengajuan.",
                });
            }
        }
    };

    const handleUpdateStatus = async (status: "Disetujui" | "Perbaikan") => {
        if (!selectedPengajuan) return;
        setIsUpdating(true);

        try {
            const token = Cookies.get("XSRF091");
            await axios.put(
                `${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${selectedPengajuan.IdPengajuanPenetapanPpmkp}`,
                { status, tahun_penetapan: tahunPenetapan },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Add History Note to Firestore
            const idPpmkp = selectedPengajuan.id_Ppmkp;
            const docRef = doc(getFirestore(firebaseApp), 'historical-training-notes', idPpmkp);
            const docSnap = await getDoc(docRef);
            let existingHistory = [];
            if (docSnap.exists()) {
                existingHistory = docSnap.data().historical || [];
            }

            const newEntry = {
                created_at: generateTimestamp(),
                id: idPpmkp,
                notes: catatan,
                role: Cookies.get("Role") || "Pusat",
                upt: `${Cookies.get("Nama")} - ${Cookies.get("Satker") || "Pusat"}`,
            };
            existingHistory.push(newEntry);

            await addData('historical-training-notes', idPpmkp, {
                historical: existingHistory,
                status: 'Done',
            });

            Toast.fire({
                icon: "success",
                title: "Pembaruan Berhasil",
                text: `Pengajuan telah ${status === "Disetujui" ? "disetujui" : "dikembalikan untuk perbaikan"}.`,
            });

            setIsApprovalOpen(false);
            fetchPengajuanData();
        } catch (err: any) {
            console.error("Error updating status:", err);
            Toast.fire({
                icon: "error",
                title: "Gagal Memperbarui",
                text: err.response?.data?.message || "Terjadi kesalahan sistem.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!pengajuanData) return [];
        return pengajuanData.filter((row: PengajuanPenetapanP2MKP) => {
            const searchStr = search.toLowerCase();
            return (
                row.nama_ppmkp?.toLowerCase().includes(searchStr) ||
                row.nama_Ppmkp?.toLowerCase().includes(searchStr) ||
                row.nama_penanggung_jawab?.toLowerCase().includes(searchStr) ||
                row.kota?.toLowerCase().includes(searchStr) ||
                row.status?.toLowerCase().includes(searchStr)
            );
        });
    }, [pengajuanData, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "disetujui":
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui</Badge>;
            case "pending":
            case "diajukan":
                return <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case "perbaikan":
                return <Badge className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"><AlertCircle className="w-3 h-3 mr-1" /> Perbaikan</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-400 border-slate-200">{status || "Unknown"}</Badge>;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold text-slate-500 animate-pulse uppercase tracking-widest">Sinkronisasi Data Penetapan...</p>
        </div>
    );

    return (
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            Daftar Pengajuan Penetapan
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium tracking-tight">
                            Kelola dan validasi berkas penetapan Pusat Pelatihan Mandiri (P2MKP) Terpadu.
                        </CardDescription>
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Cari lembaga, PJ, atau lokasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 pl-12 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-200">
                                <TableHead className="w-16 text-center font-bold text-slate-400 uppercase text-[10px] tracking-wider py-6">No</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider py-6">Lembaga & Lokasi</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider py-6">Penanggung Jawab</TableHead>
                                <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-wider py-6">Status Submission</TableHead>
                                <TableHead className="w-48 text-center font-bold text-slate-400 uppercase text-[10px] tracking-wider py-6">Manajemen Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((row, index) => (
                                <TableRow key={row.IdPengajuanPenetapanPpmkp} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                                    <TableCell className="text-center font-bold text-slate-400 text-xs">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex flex-col space-y-1.5">
                                            <div className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-primary transition-colors uppercase">
                                                {row.nama_ppmkp || row.nama_Ppmkp || "Unspecified Institution"}
                                            </div>
                                            <div className="flex items-center text-[11px] font-semibold text-slate-400 uppercase gap-1.5">
                                                <MapPin className="w-3 h-3 text-red-400" />
                                                {row.kota || "N/A"}, {row.provinsi || "N/A"}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 uppercase">{row.nama_penanggung_jawab || "No Data"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            {getStatusBadge(row.status)}
                                            <div className="flex items-center gap-4 pl-1">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Calendar className="w-3 h-3" /> {row.tahun_penetapan || "-"}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Building2 className="w-3 h-3" /> {row.is_lpk === "Ya" ? "LPK" : "NON-LPK"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {row.status === "Disetujui" ? (
                                                <P2MKPCertificateAction p2mkp={row as unknown as P2MKP} />
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(row)}
                                                    className="h-9 px-4 gap-2 bg-primary/10 text-primary border-none rounded-xl text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Tinjau
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteSubmission(row.IdPengajuanPenetapanPpmkp)}
                                                className="h-9 w-9 p-0 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {paginatedData.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center">
                                <FileText className="w-10 h-10 text-slate-200" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-800 uppercase tracking-tight">Tidak ada data penetapan</p>
                                <p className="text-xs text-slate-400 font-medium uppercase mt-1">Gunakan kata kunci pencarian lain.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">
                        Halaman <span className="text-slate-800">{currentPage} dari {totalPages || 1}</span> • Total <span className="text-slate-800">{filteredData.length}</span> Pengajuan
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase shadow-sm"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase shadow-sm"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Verification Dialog */}
            <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none rounded-[3rem] shadow-3xl">
                    <DialogHeader className="p-10 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold uppercase tracking-tight text-slate-800">Review Penetapan</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-slate-400 uppercase mt-1">Verifikasi berkas dan historis lembaga</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 transition-all hover:border-primary/20">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Nama Lembaga</span>
                                <p className="text-sm font-bold text-slate-800 uppercase leading-snug">{selectedPengajuan?.nama_ppmkp || selectedPengajuan?.nama_Ppmkp}</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 transition-all hover:border-primary/20">
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Penanggung Jawab</span>
                                <p className="text-sm font-bold text-slate-800 uppercase leading-snug">{selectedPengajuan?.nama_penanggung_jawab || "-"}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                <span className="text-[10px] font-bold uppercase text-slate-800 tracking-widest">Catatan Historis Pusat</span>
                            </div>
                            <div className="space-y-4">
                                {dataHistoryTraining?.historical && dataHistoryTraining.historical.length > 0 ? (
                                    dataHistoryTraining.historical.map((item, idx) => (
                                        <div key={idx} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 relative group">
                                            <div className="flex justify-between items-center">
                                                <Badge variant="secondary" className="bg-white px-3 py-1 text-[9px] text-primary border-slate-100 shadow-sm uppercase font-bold">
                                                    {item.upt}
                                                </Badge>
                                                <span className="text-[9px] font-bold text-slate-400">{item.created_at}</span>
                                            </div>
                                            <p className="text-[12px] font-medium text-slate-600 leading-relaxed italic">"{item.notes}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 flex flex-col items-center justify-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                                        <Clock className="w-8 h-8 text-slate-200 mb-2" />
                                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Belum ada riwayat catatan</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Tahun Penetapan</label>
                                <Input
                                    value={tahunPenetapan}
                                    onChange={(e) => setTahunPenetapan(e.target.value)}
                                    className="h-14 bg-white border-slate-200 rounded-2xl px-6 focus:ring-4 focus:ring-primary/10 font-bold text-sm tracking-widest"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Keputusan & Catatan Verifikasi</label>
                                <Textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Input evaluasi atau alasan penolakan/perbaikan..."
                                    className="min-h-[140px] bg-white border-slate-200 rounded-2xl p-6 focus:ring-4 focus:ring-primary/10 font-medium text-sm leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setIsApprovalOpen(false)}
                            className="h-14 px-8 rounded-2xl font-bold uppercase text-[10px] text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                        >
                            Tutup
                        </Button>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleUpdateStatus("Perbaikan")}
                                disabled={isUpdating || !catatan}
                                className="h-14 px-8 bg-white border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl font-bold uppercase text-[10px] shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                                Kirim Perbaikan
                            </Button>
                            <Button
                                onClick={() => handleUpdateStatus("Disetujui")}
                                disabled={isUpdating || !catatan}
                                className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase text-[10px] shadow-2xl shadow-primary/30 transition-all flex items-center gap-2 group"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Setujui Pengajuan
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default TablePenetapanP2MKP;

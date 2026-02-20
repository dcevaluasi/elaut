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
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    ShieldCheck,
    Briefcase,
    TrendingUp,
    FileText,
    TrendingDown,
    Gavel
} from "lucide-react";
import { useFetchDataPengajuanPenetapan } from "@/hooks/elaut/p2mkp/useFetchDataPengajuanPenetapan";
import { useFetchDataP2MKP } from "@/hooks/elaut/p2mkp/useFetchDataP2MKP";
import { PengajuanPenetapanP2MKP, P2MKP } from "@/types/p2mkp";
import { P2MKPCertificateAction } from "./P2MKPCertificateAction";
import { HistoryTraining } from "@/types/product";
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
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MdSearch } from "react-icons/md";
import { HashLoader } from "react-spinners";
import Link from "next/link";

const TablePenetapanP2MKP = () => {
    const { data: pengajuanData, loading: loadingPengajuan, error: errorPengajuan, fetchPengajuanData } = useFetchDataPengajuanPenetapan();
    const { data: p2mkpData, loading: loadingP2MKP, error: errorP2MKP } = useFetchDataP2MKP();

    const pathname = usePathname();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loading = loadingPengajuan || loadingP2MKP;

    const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

    // Approval Dialog State
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanPenetapanP2MKP | null>(null);
    const [selectedMasterP2MKP, setSelectedMasterP2MKP] = useState<P2MKP | null>(null);
    const [catatan, setCatatan] = useState("");
    const [tahunPenetapan, setTahunPenetapan] = useState(new Date().getFullYear().toString());
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingMaster, setIsLoadingMaster] = useState(false);
    const [dataHistoryTraining, setDataHistoryTraining] = useState<HistoryTraining | null>(null);

    const handleFetchDataHistoryTraining = async (id: string) => {
        const doc = await getDocument("historical-training-notes", id);
        setDataHistoryTraining(doc.data as HistoryTraining);
    };

    const handleFetchMasterP2MKP = async (id: string) => {
        setIsLoadingMaster(true);
        try {
            const token = Cookies.get("XSRF091");
            const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_by_id?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedMasterP2MKP(response.data.data);
        } catch (err) {
            console.error("Error fetching master p2mkp:", err);
            Toast.fire({
                icon: "error",
                title: "Gagal memuat data master lembaga",
            });
        } finally {
            setIsLoadingMaster(false);
        }
    };

    const handleOpenDialog = (pengajuan: PengajuanPenetapanP2MKP) => {
        setSelectedPengajuan(pengajuan);
        setSelectedMasterP2MKP(null);
        setCatatan("");
        setTahunPenetapan(pengajuan.tahun_penetapan || new Date().getFullYear().toString());
        handleFetchDataHistoryTraining(pengajuan.id_Ppmkp);
        handleFetchMasterP2MKP(pengajuan.id_Ppmkp);
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

    const handleUpdateStatus = async (status: "Approved" | "Perbaikan") => {
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
                text: `Pengajuan telah ${status === "Approved" ? "disetujui" : "dikembalikan untuk perbaikan"}.`,
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

    const combinedData = useMemo(() => {
        if (!pengajuanData || !p2mkpData) return [];

        const p2mkpMap = new Map(p2mkpData.map(p => [String(p.IdPpmkp), p]));

        let joined = pengajuanData.map(pengajuan => {
            const master = p2mkpMap.get(String(pengajuan.id_Ppmkp));
            return {
                ...pengajuan,
                masterData: master
            };
        });

        // Sorting: status == "" first
        joined.sort((a, b) => {
            const statusA = a.masterData?.status || "";
            const statusB = b.masterData?.status || "";

            if (statusA === "" && statusB !== "") return -1;
            if (statusA !== "" && statusB === "") return 1;
            return 0;
        });

        return joined;
    }, [pengajuanData, p2mkpData]);

    const filteredData = useMemo(() => {
        return combinedData.filter((row) => {
            const searchStr = search.toLowerCase();

            // Core Requirement: Must have linked P2MKP data (Nama)
            const hasLinkedP2MKP = !!(row.id_Ppmkp || row.nama_Ppmkp);
            if (!hasLinkedP2MKP) return false;

            const matchesSearch = (
                (row.nama_ppmkp || row.nama_Ppmkp || row.masterData?.nama_ppmkp)?.toLowerCase().includes(searchStr) ||
                (row.nama_penanggung_jawab || row.masterData?.nama_penanggung_jawab)?.toLowerCase().includes(searchStr) ||
                (row.kota || row.masterData?.kota)?.toLowerCase().includes(searchStr) ||
                (row.status || "Diajukan").toLowerCase().includes(searchStr)
            );

            // Treat empty status as "Diajukan"
            const currentStatus = row.status === "" || !row.status ? "Diajukan" : row.status;
            const matchesStatusFilter = selectedStatusFilter === "All" ||
                currentStatus.toLowerCase() === selectedStatusFilter.toLowerCase() ||
                (selectedStatusFilter === "Pending" && currentStatus === "Diajukan");

            return matchesSearch && matchesStatusFilter;
        });
    }, [combinedData, search, selectedStatusFilter]);

    const stats = useMemo(() => {
        if (!combinedData) return { total: 0, approved: 0, pending: 0, revision: 0 };
        // Valid entries only
        const validData = combinedData.filter(d => !!(d.id_Ppmkp || d.nama_Ppmkp));
        return {
            total: validData.length,
            approved: validData.filter(d => d.status?.toLowerCase() === "disetujui").length,
            pending: validData.filter(d => !d.status || d.status === "" || d.status?.toLowerCase() === "pending" || d.status?.toLowerCase() === "diajukan").length,
            revision: validData.filter(d => d.status?.toLowerCase() === "perbaikan").length,
        };
    }, [combinedData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadge = (status: string) => {
        const normalizedStatus = status === "" || !status ? "diajukan" : status.toLowerCase();

        switch (normalizedStatus) {
            case "disetujui":
                return <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approved</Badge>;
            case "pending":
            case "diajukan":
                return (
                    <div className="flex flex-col items-center gap-1.5">
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-100 shadow-sm px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Diajukan
                        </Badge>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Dalam Antrean Review</span>
                    </div>
                );
            case "perbaikan":
                return <Badge className="bg-rose-50 text-rose-600 border border-rose-100 shadow-sm px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest"><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Perbaikan</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-400 border-slate-200 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">{status || "Unknown"}</Badge>;
        }
    };

    if (loading) return (
        <div className="py-48 w-full items-center flex flex-col justify-center space-y-6">
            <div className="relative">
                <HashLoader color="#338CF5" size={60} />
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] animate-pulse">Initializing Pengajuan Penetapan</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl transition-all duration-500 hover:shadow-blue-500/10">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                <Gavel className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Database</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Terpusat</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider opacity-80">Total Pengajuan</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-white tracking-tighter">{stats.total}</span>
                                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Lembaga</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl transition-all duration-500 hover:shadow-emerald-500/10">
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                    <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Validasi</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Approved</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider opacity-80">Lembaga Approved</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-white tracking-tighter">{stats.approved}</span>
                                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-tighter">Unit</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Clock className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Review</h4>
                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-tighter">{stats.pending} Submission</p>
                    </div>
                </Card>

                <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <AlertCircle className="h-6 w-6 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perlu Perbaikan</h4>
                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-tighter">{stats.revision} Revisi</p>
                    </div>
                </Card>
            </div>

            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                {["All", "Diajukan", "Pending", "Approved", "Perbaikan"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setSelectedStatusFilter(status)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedStatusFilter === status
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]"
                            : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Table Container */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="relative flex-1 w-full group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 transition-colors group-focus-within:text-blue-500" />
                        <Input
                            placeholder="Cari nama lembaga, penanggung jawab, atau lokasi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-12 w-full border-none bg-slate-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                {paginatedData.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center">
                            <FileText className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-800 uppercase tracking-tight">Tidak ada data penetapan</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Gunakan kata kunci pencarian lain.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-200">
                                    <TableHead className="w-16 text-center font-black text-slate-400 uppercase text-[10px] tracking-widest py-6">No</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-6">Informasi Lembaga</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-6">Penanggung Jawab</TableHead>
                                    <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest py-6">Status & Akses</TableHead>
                                    <TableHead className="w-48 text-center font-black text-slate-400 uppercase text-[10px] tracking-widest py-6">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((row, index) => (
                                    <TableRow key={row.IdPengajuanPenetapanPpmkp} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                                        <TableCell className="text-center font-bold text-slate-400 text-[11px]">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-black text-slate-800 text-[13px] leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                                        {row.masterData?.nama_ppmkp || row.nama_ppmkp || row.nama_Ppmkp || "Lembaga Terdaftar"}
                                                    </div>
                                                    {(row.masterData?.status === "" || !row.masterData?.status) && (
                                                        <Badge className="bg-blue-50 text-blue-600 border-none px-2 py-0 text-[8px] font-black uppercase">BARU</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                    {row.masterData?.kota || row.kota || "N/A"}, {row.masterData?.provinsi || row.provinsi || "N/A"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight leading-none mb-1">{row.masterData?.nama_penanggung_jawab || row.nama_penanggung_jawab || "No Data"}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Penanggung Jawab</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-start justify-left  gap-2.5">
                                                {getStatusBadge(row.status)}
                                                <div className="flex items-center gap-4 pl-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Calendar className="w-3 h-3 text-blue-500" /> {row.tahun_penetapan || "-"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Building2 className="w-3 h-3 text-emerald-500" /> {row.is_lpk === "Ya" ? "LPK" : "NON-LPK"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2.5">
                                                {row.status === "Approved" ? (
                                                    <P2MKPCertificateAction p2mkp={row as unknown as P2MKP} />
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                        className="h-10 px-5 gap-2 bg-white text-slate-600 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm group/btn"
                                                    >
                                                        <Link href={`${pathname}/${row.IdPengajuanPenetapanPpmkp}`}>
                                                            <Eye className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" />
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteSubmission(row.IdPengajuanPenetapanPpmkp)}
                                                    className="h-10 w-10 p-0 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Bar */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Menampilkan <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="text-slate-800">{filteredData.length}</span> Pengajuan
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="h-10 px-6 rounded-xl border-slate-200 bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="h-10 px-6 rounded-xl border-slate-200 bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Dialog - Refactored for Premium Look */}
            <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                <DialogContent className="max-w-xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-none rounded-[3rem] shadow-3xl">
                    <DialogHeader className="p-8 pb-4 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 shrink-0 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">Review Penetapan</DialogTitle>
                                <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Verifikasi eksistensi dan standar <br />operasional lembaga P2MKP Terpadu.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-8 py-4 space-y-8 max-h-[55vh] overflow-y-auto custom-scrollbar no-scrollbar">
                        {isLoadingMaster ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Profil Lembaga...</p>
                            </div>
                        ) : selectedMasterP2MKP && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nama Lembaga</span>
                                        <p className="text-[12px] font-black text-slate-800 uppercase leading-snug tracking-tight">{selectedMasterP2MKP?.nama_ppmkp || selectedMasterP2MKP?.nama_Ppmkp}</p>
                                    </div>
                                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">PJ Lembaga</span>
                                        <p className="text-[12px] font-black text-slate-800 uppercase leading-snug tracking-tight">{selectedMasterP2MKP?.nama_penanggung_jawab || "-"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">NIB / Izin Usaha</span>
                                        </div>
                                        <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{selectedMasterP2MKP?.nib || "N/A"}</p>
                                    </div>
                                    <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Kontak Lembaga</span>
                                        </div>
                                        <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{selectedMasterP2MKP?.no_telp || "-"}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Alamat Operasional</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase">
                                        {selectedMasterP2MKP?.alamat}, {selectedMasterP2MKP?.kelurahan}, {selectedMasterP2MKP?.kecamatan}, {selectedMasterP2MKP?.kota}, {selectedMasterP2MKP?.provinsi} {selectedMasterP2MKP?.kode_pos}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-500/10" />
                                <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Riwayat Catatan Verifikasi</span>
                            </div>
                            <div className="space-y-3">
                                {dataHistoryTraining?.historical && dataHistoryTraining.historical.length > 0 ? (
                                    dataHistoryTraining.historical.map((item, idx) => (
                                        <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                                                <Badge variant="secondary" className="bg-slate-900 px-3 py-1 text-[8px] text-white border-none shadow-sm uppercase font-black tracking-widest">
                                                    {item.upt}
                                                </Badge>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.created_at}</span>
                                            </div>
                                            <p className="text-[12px] font-bold text-slate-600 leading-relaxed italic">"{item.notes}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                        <Clock className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Belum ada catatan historis <br />untuk lembaga ini</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Tahun Penetapan Sertifikat</label>
                                <Input
                                    value={tahunPenetapan}
                                    onChange={(e) => setTahunPenetapan(e.target.value)}
                                    className="h-14 bg-slate-50 border-none rounded-2xl px-6 focus-visible:ring-2 focus-visible:ring-blue-500/20 font-black text-sm tracking-widest text-slate-800"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Evaluasi & Rekomendasi</label>
                                <Textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Input evaluasi kelayakan atau alasan perbaikan..."
                                    className="min-h-[140px] bg-slate-50 border-none rounded-2xl p-6 focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold text-sm leading-relaxed text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-white/50 flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsApprovalOpen(false)}
                            className="h-14 flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
                        >
                            Batalkan
                        </Button>
                        <div className="flex flex-1 gap-3 w-full">
                            <Button
                                onClick={() => handleUpdateStatus("Perbaikan")}
                                disabled={isUpdating || !catatan}
                                className="h-14 flex-1 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
                                Revisi
                            </Button>
                            <Button
                                onClick={() => handleUpdateStatus("Approved")}
                                disabled={isUpdating || !catatan}
                                className="h-14 flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/30 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 group"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                Approve
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TablePenetapanP2MKP;

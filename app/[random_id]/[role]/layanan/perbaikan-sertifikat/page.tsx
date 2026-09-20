"use client";

import React, { useEffect, useState, useMemo } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    orderBy
} from "firebase/firestore";
import firebaseApp from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FileText,
    User,
    BookOpen,
    Edit3,
    Eye,
    Filter,
    Check,
    X,
    ExternalLink,
    Tag,
    MessageSquare,
    Send
} from "lucide-react";
import { RiShieldFlashLine, RiVerifiedBadgeFill, RiFilePdfLine } from "react-icons/ri";
import { FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { encryptValue } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { HashLoader } from "react-spinners";

export interface PerbaikanSertifikatItem {
    idDoc: string;
    TiketPerbaikan?: string;
    NoSertifikat: string;
    Nama: string;
    IdUsers: number | string;
    IdUserPelatihan: number | string;
    KodePelatihan: string;
    IdPelatihan: number | string;
    NamaPelatihan: string;
    JenisPerbaikan: string;
    PerbaikanSudahTerbit?: string[];
    PerbaikanLainnya?: string;
    PerbaikanSeharusnya: string;
    Status: "Pending" | "Diproses" | "Selesai" | "Ditolak" | string;
    CatatanAdmin?: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Pending":
            return {
                bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
                icon: <Clock className="w-3.5 h-3.5" />,
                label: "Pending",
            };
        case "Diproses":
            return {
                bg: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
                icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
                label: "Diproses",
            };
        case "Selesai":
            return {
                bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                label: "Selesai",
            };
        case "Ditolak":
            return {
                bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
                icon: <XCircle className="w-3.5 h-3.5" />,
                label: "Ditolak",
            };
        default:
            return {
                bg: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400",
                icon: <AlertCircle className="w-3.5 h-3.5" />,
                label: status || "Pending",
            };
    }
};

export default function PerbaikanSertifikatPage() {
    const pathname = usePathname();
    const [dataList, setDataList] = useState<PerbaikanSertifikatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("Semua");

    // Modal state for detail & status update
    const [selectedItem, setSelectedItem] = useState<PerbaikanSertifikatItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<string>("Pending");
    const [catatanAdmin, setCatatanAdmin] = useState<string>("");
    const [updating, setUpdating] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const db = getFirestore(firebaseApp);
            const colRef = collection(db, "perbaikan-sertifikat");

            // Attempt query with OrderBy, fallback if index is missing
            let snapshot;
            try {
                const q = query(colRef, orderBy("CreatedAt", "desc"));
                snapshot = await getDocs(q);
            } catch (err) {
                snapshot = await getDocs(colRef);
            }

            const list: PerbaikanSertifikatItem[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data() as PerbaikanSertifikatItem;
                list.push({
                    ...item,
                    idDoc: docSnap.id,
                });
            });

            // Sort manually client side if fallback was used
            list.sort((a, b) => {
                const timeA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
                const timeB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
                return timeB - timeA;
            });

            setDataList(list);
        } catch (error) {
            console.error("Error fetching perbaikan-sertifikat data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Filter logic
    const filteredData = useMemo(() => {
        return dataList.filter((item) => {
            const matchesSearch =
                (item.TiketPerbaikan && item.TiketPerbaikan.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.NoSertifikat && item.NoSertifikat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.Nama && item.Nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.NamaPelatihan && item.NamaPelatihan.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus =
                selectedStatusFilter === "Semua" ||
                item.Status?.toLowerCase() === selectedStatusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [dataList, searchQuery, selectedStatusFilter]);

    // Counts for stat bar
    const counts = useMemo(() => {
        const c = { total: dataList.length, pending: 0, diproses: 0, selesai: 0, ditolak: 0 };
        dataList.forEach((item) => {
            const st = item.Status?.toLowerCase();
            if (st === "pending") c.pending++;
            else if (st === "diproses") c.diproses++;
            else if (st === "selesai") c.selesai++;
            else if (st === "ditolak") c.ditolak++;
        });
        return c;
    }, [dataList]);

    const handleOpenUpdateModal = (item: PerbaikanSertifikatItem) => {
        setSelectedItem(item);
        setUpdateStatus(item.Status || "Pending");
        setCatatanAdmin(item.CatatanAdmin || "");
        setIsModalOpen(true);
    };

    const handleSaveStatus = async () => {
        if (!selectedItem) return;

        setUpdating(true);
        try {
            const db = getFirestore(firebaseApp);
            const docRef = doc(db, "perbaikan-sertifikat", selectedItem.idDoc);

            const updatedFields = {
                Status: updateStatus,
                CatatanAdmin: catatanAdmin.trim(),
                UpdatedAt: new Date().toISOString(),
            };

            await setDoc(docRef, updatedFields, { merge: true });

            // Local state update
            setDataList((prev) =>
                prev.map((i) =>
                    i.idDoc === selectedItem.idDoc
                        ? { ...i, ...updatedFields }
                        : i
                )
            );

            setIsModalOpen(false);
            setSelectedItem(null);

            // Toast feedback
            setToastMessage(`Status tiket #${selectedItem.TiketPerbaikan || selectedItem.idDoc} berhasil diperbarui menjadi ${updateStatus}!`);
            setTimeout(() => setToastMessage(null), 3500);
        } catch (error) {
            console.error("Error updating perbaikan sertifikat status:", error);
            alert("Gagal memperbarui status. Silakan coba lagi.");
        } finally {
            setUpdating(false);
        }
    };

    const formatDateStr = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-4">
                {/* Page Header */}
                <HeaderPageLayoutAdminElaut
                    title="Layanan Perbaikan Sertifikat"
                    description="Kelola dan proses pengajuan perbaikan data sertifikat elektronik peserta pelatihan E-LAUT."
                    icon={<RiShieldFlashLine className="text-3xl text-amber-500" />}
                />

                {/* Toast Notification */}
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-6 right-6 z-[99999] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-400/40 backdrop-blur-md"
                        >
                            <FiCheck className="w-4 h-4 stroke-[3]" />
                            <span>{toastMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Statistics Cards Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 my-2">
                    <div
                        onClick={() => setSelectedStatusFilter("Semua")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStatusFilter === "Semua"
                            ? "bg-slate-900 text-white border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Total Pengajuan</span>
                            <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold font-calsans tracking-tight">
                            {counts.total}
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedStatusFilter("Pending")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStatusFilter === "Pending"
                            ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-lg"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/30"
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                            <span>Pending</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold font-calsans tracking-tight text-amber-600 dark:text-amber-400">
                            {counts.pending}
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedStatusFilter("Diproses")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStatusFilter === "Diproses"
                            ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/30"
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            <span>Diproses</span>
                            <RefreshCw className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold font-calsans tracking-tight text-blue-600 dark:text-blue-400">
                            {counts.diproses}
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedStatusFilter("Selesai")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStatusFilter === "Selesai"
                            ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30"
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                            <span>Selesai</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-bold font-calsans tracking-tight text-emerald-600 dark:text-emerald-400">
                            {counts.selesai}
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedStatusFilter("Ditolak")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedStatusFilter === "Ditolak"
                            ? "bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 shadow-lg"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/30"
                            }`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                            <span>Ditolak</span>
                            <XCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold font-calsans tracking-tight text-rose-600 dark:text-rose-400">
                            {counts.ditolak}
                        </div>
                    </div>
                </div>

                {/* Filters & Search Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Cari Tiket, No STTPL, Nama, Pelatihan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-8 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Status Chips & Refresh */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                            {["Semua", "Pending", "Diproses", "Selesai", "Ditolak"].map((st) => {
                                const active = selectedStatusFilter === st;
                                return (
                                    <button
                                        key={st}
                                        onClick={() => setSelectedStatusFilter(st)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${active
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {st}
                                    </button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={refreshing}
                            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 text-xs gap-1.5 flex-shrink-0"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-500" : ""}`} />
                            <span className="hidden sm:inline">Muat Ulang</span>
                        </Button>
                    </div>
                </div>

                {/* Table Data View */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <HashLoader color="#2563eb" size={40} />
                            <span className="text-xs font-semibold text-slate-500">Memuat data pengajuan perbaikan...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-16 px-4 space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                Data Pengajuan Tidak Ditemukan
                            </h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Belum ada laporan perbaikan sertifikat yang sesuai dengan filter atau kata kunci pencarian Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                                    <TableRow>
                                        <TableHead className="w-12 text-center text-xs font-bold">No</TableHead>
                                        <TableHead className="text-xs font-bold">Tiket & Tanggal</TableHead>
                                        <TableHead className="text-xs font-bold">Peserta & No. STTPL</TableHead>
                                        <TableHead className="text-xs font-bold">Pelatihan</TableHead>
                                        <TableHead className="text-xs font-bold">Jenis & Detail Perbaikan</TableHead>
                                        <TableHead className="text-xs font-bold">Status</TableHead>
                                        <TableHead className="text-center text-xs font-bold">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item, index) => {
                                        const badge = getStatusBadge(item.Status);
                                        return (
                                            <TableRow key={item.idDoc} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                <TableCell className="text-center text-xs font-mono text-slate-400">
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                                            #{item.TiketPerbaikan || item.idDoc.slice(0, 8)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {formatDateStr(item.CreatedAt)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                                            {item.Nama}
                                                        </span>
                                                        <span className="font-mono text-[11px] text-slate-500">
                                                            STTPL: {item.NoSertifikat}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="max-w-xs">
                                                    <div className="flex flex-col gap-0.5">
                                                        {item.KodePelatihan && item.IdPelatihan ? (
                                                            <Link
                                                                href={`/admin/${pathname.includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${item.KodePelatihan}/${encryptValue(item.IdPelatihan.toString())}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline line-clamp-2 flex items-center gap-1 group"
                                                                title="Buka Detail Pelatihan"
                                                            >
                                                                <span>{item.NamaPelatihan}</span>
                                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-blue-500" />
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                                                                {item.NamaPelatihan}
                                                            </span>
                                                        )}
                                                        {item.KodePelatihan && (
                                                            <span className="font-mono text-[10px] text-slate-400 font-medium">
                                                                Kode: {item.KodePelatihan}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="max-w-xs">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                            <Tag className="w-3 h-3" />
                                                            {item.JenisPerbaikan}
                                                        </span>

                                                        {item.PerbaikanSudahTerbit && item.PerbaikanSudahTerbit.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.PerbaikanSudahTerbit.map((tag, tIdx) => (
                                                                    <span
                                                                        key={tIdx}
                                                                        className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-[10px] font-medium"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {item.PerbaikanLainnya && (
                                                            <span className="text-[11px] text-slate-500 italic line-clamp-1">
                                                                &ldquo;{item.PerbaikanLainnya}&rdquo;
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.bg}`}>
                                                        {badge.icon}
                                                        <span>{badge.label}</span>
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenUpdateModal(item)}
                                                        className="h-8 px-3 rounded-xl border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-bold gap-1.5"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Kelola</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* UPDATE STATUS & DETAIL DIALOG */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold font-calsans flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                <RiShieldFlashLine className="w-5 h-5 text-amber-500" />
                                <span>Kelola Status Perbaikan Sertifikat</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Tiket #{selectedItem?.TiketPerbaikan || selectedItem?.idDoc} &bull; Dibuat pada {formatDateStr(selectedItem?.CreatedAt)}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedItem && (
                            <div className="space-y-4 my-2 text-xs">
                                {/* Detail Overview Box */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                                    <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">No. STTPL / Registrasi</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{selectedItem.NoSertifikat}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Peserta</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedItem.Nama}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Nama Pelatihan & Kode Kelas</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {selectedItem.KodePelatihan && selectedItem.IdPelatihan ? (
                                                <Link
                                                    href={`/admin/${pathname.includes('pusat') ? 'pusat' : 'lemdiklat'}/pelatihan/detail/${selectedItem.KodePelatihan}/${encryptValue(selectedItem.IdPelatihan.toString())}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                                                    title="Buka Detail Pelatihan"
                                                >
                                                    <span>{selectedItem.NamaPelatihan}</span>
                                                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedItem.NamaPelatihan}</span>
                                            )}
                                            {selectedItem.KodePelatihan && (
                                                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
                                                    {selectedItem.KodePelatihan}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Jenis & Opsi Kesalahan</span>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 text-[10px] font-bold">
                                                {selectedItem.JenisPerbaikan}
                                            </Badge>
                                            {selectedItem.PerbaikanSudahTerbit?.map((t, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px]">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Perbaikan Seharusnya */}
                                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                                            Perbaikan Seharusnya (Dari Peserta):
                                        </span>
                                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                            &ldquo;{selectedItem.PerbaikanSeharusnya}&rdquo;
                                        </div>
                                    </div>
                                </div>

                                {/* Status Selector Radio Options */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Pilih Status Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: "Pending", label: "Pending", color: "border-amber-500 text-amber-600 bg-amber-500/10" },
                                            { id: "Diproses", label: "Diproses", color: "border-blue-500 text-blue-600 bg-blue-500/10" },
                                            { id: "Selesai", label: "Selesai", color: "border-emerald-500 text-emerald-600 bg-emerald-500/10" },
                                            { id: "Ditolak", label: "Ditolak", color: "border-rose-500 text-rose-600 bg-rose-500/10" },
                                        ].map((st) => {
                                            const active = updateStatus === st.id;
                                            return (
                                                <button
                                                    key={st.id}
                                                    type="button"
                                                    onClick={() => setUpdateStatus(st.id)}
                                                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${active
                                                        ? `${st.color} ring-2 ring-blue-500/20 shadow-sm`
                                                        : "border-slate-200 dark:border-slate-800 text-slate-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    <span>{st.label}</span>
                                                    {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Admin Note Field */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Catatan / Keterangan Admin
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={catatanAdmin}
                                        onChange={(e) => setCatatanAdmin(e.target.value)}
                                        placeholder="Tuliskan catatan tindak lanjut (misal: Sertifikat perbaikan telah terbit, atau Alasan penolakan)..."
                                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 leading-relaxed resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 rounded-xl text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSaveStatus}
                                disabled={updating}
                                className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-600/20"
                            >
                                {updating ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Simpan Perubahan Status</span>
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </LayoutAdminElaut>
    );
}
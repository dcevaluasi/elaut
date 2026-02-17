"use client";

import React, { useEffect, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { MdFeedback, MdSearch, MdClear, MdCalendarToday, MdPerson, MdBusiness, MdStar, MdEdit, MdDelete, MdAdd, MdOutlineMessage } from "react-icons/md";
import { getAllFeedbacks, getAllMaklumatPelayanan, saveMaklumatPelayanan, updateMaklumatPelayanan, deleteMaklumatPelayanan } from "@/utils/feedback";
import { getDirectImageUrl } from "@/utils/imageHelper";
import { HashLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IoAlbumsOutline, IoInformationOutline } from "react-icons/io5";
import { MessageSquare, Star, TrendingUp, TrendingDown, Image as ImageIcon, Calendar, User, Building, Search, X, Info, Plus, ChevronRight } from "lucide-react";
import Image from "next/image";

interface FeedbackData {
    id: string;
    nama: string;
    asalInstansi: string;
    masukanSaran: string;
    ratings: {
        kemudahanAkses: number;
        kemudahanPenggunaan: number;
        kecepatan: number;
        desainTampilan: number;
        kelengkapanFitur: number;
        kejelasanInformasi: number;
        responsifMobile: number;
        kepuasanKeseluruhan: number;
    };
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

interface MaklumatPelayanan {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export default function LayananPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loadingFeedback, setLoadingFeedback] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);

    const [maklumatList, setMaklumatList] = useState<MaklumatPelayanan[]>([]);
    const [loadingMaklumat, setLoadingMaklumat] = useState(true);
    const [showMaklumatForm, setShowMaklumatForm] = useState(false);
    const [editingMaklumat, setEditingMaklumat] = useState<MaklumatPelayanan | null>(null);
    const [savingMaklumat, setSavingMaklumat] = useState(false);
    const [maklumatForm, setMaklumatForm] = useState({
        title: "",
        description: "",
        imageUrl: ""
    });

    useEffect(() => {
        fetchFeedbacks();
        fetchMaklumat();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoadingFeedback(true);
            const data = await getAllFeedbacks();
            setFeedbacks(data as FeedbackData[]);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const fetchMaklumat = async () => {
        try {
            setLoadingMaklumat(true);
            const data = await getAllMaklumatPelayanan();
            setMaklumatList(data as MaklumatPelayanan[]);
        } catch (error) {
            console.error("Error fetching maklumat:", error);
        } finally {
            setLoadingMaklumat(false);
        }
    };

    const formatDate = (timestamp: { seconds: number }) => {
        if (!timestamp) return "-";
        const date = new Date(timestamp.seconds * 1000);
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const calculateAverageRating = (ratings: FeedbackData["ratings"]): number => {
        if (!ratings) return 0;
        const values = Object.values(ratings).filter(v => v > 0);
        if (values.length === 0) return 0;
        return parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    };

    const getRatingColor = (rating: number) => {
        if (rating === 0) return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
        if (rating <= 2.5) return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
        if (rating <= 3.5) return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
        if (rating <= 4.5) return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    };

    const getRatingLabel = (rating: number) => {
        if (rating === 0) return "N/A";
        if (rating <= 2.5) return "Kurang";
        if (rating <= 3.5) return "Cukup";
        if (rating <= 4.5) return "Baik";
        return "Sangat Baik";
    };

    const filteredFeedbacks = feedbacks.filter((feedback) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            feedback.nama?.toLowerCase().includes(searchLower) ||
            feedback.asalInstansi?.toLowerCase().includes(searchLower) ||
            feedback.masukanSaran?.toLowerCase().includes(searchLower)
        );
    });

    const RATING_QUESTIONS = [
        { key: 'kemudahanAkses', label: 'Kemudahan Akses' },
        { key: 'kemudahanPenggunaan', label: 'Kemudahan Penggunaan' },
        { key: 'kecepatan', label: 'Kecepatan' },
        { key: 'desainTampilan', label: 'Desain & Tampilan' },
        { key: 'kelengkapanFitur', label: 'Kelengkapan Fitur' },
        { key: 'kejelasanInformasi', label: 'Kejelasan Informasi' },
        { key: 'responsifMobile', label: 'Responsif Mobile' },
        { key: 'kepuasanKeseluruhan', label: 'Kepuasan Keseluruhan' }
    ];

    const handleSaveMaklumat = async () => {
        if (!maklumatForm.title || !maklumatForm.description || !maklumatForm.imageUrl) {
            alert("Harap lengkapi semua field!");
            return;
        }

        try {
            setSavingMaklumat(true);
            if (editingMaklumat) {
                await updateMaklumatPelayanan(editingMaklumat.id, {
                    title: maklumatForm.title,
                    description: maklumatForm.description,
                    imageUrl: maklumatForm.imageUrl
                });
            } else {
                await saveMaklumatPelayanan({
                    title: maklumatForm.title,
                    description: maklumatForm.description,
                    imageUrl: maklumatForm.imageUrl
                });
            }
            cancelMaklumatForm();
            fetchMaklumat();
        } catch (error) {
            console.error("Error saving maklumat:", error);
        } finally {
            setSavingMaklumat(false);
        }
    };

    const handleEditMaklumat = (maklumat: MaklumatPelayanan) => {
        setEditingMaklumat(maklumat);
        setMaklumatForm({
            title: maklumat.title,
            description: maklumat.description,
            imageUrl: maklumat.imageUrl
        });
        setShowMaklumatForm(true);
    };

    const handleDeleteMaklumat = async (maklumat: MaklumatPelayanan) => {
        if (!confirm("Hapus maklumat ini?")) return;
        try {
            await deleteMaklumatPelayanan(maklumat.id);
            fetchMaklumat();
        } catch (error) {
            console.error("Error deleting maklumat:", error);
        }
    };

    const cancelMaklumatForm = () => {
        setShowMaklumatForm(false);
        setEditingMaklumat(null);
        setMaklumatForm({ title: "", description: "", imageUrl: "" });
    };

    return (
        <LayoutAdminElaut>
            <div className="flex flex-col w-full h-full gap-2">
                <HeaderPageLayoutAdminElaut
                    title="Layanan & Publikasi"
                    description="Monitoring masukan pengguna dan publikasi maklumat pelayanan sistem!"
                    icon={<IoAlbumsOutline className="text-3xl" />}
                />

                <div className="space-y-10 py-4">
                    <Tabs defaultValue="masukan-saran" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 h-auto p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-wrap md:flex-nowrap items-center gap-2 w-full">
                                <TabsTrigger
                                    value="masukan-saran"
                                    className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm tracking-tight">Masukan & Saran</span>
                                    </div>
                                    <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Feedback Pengguna</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="maklumat-pelayanan"
                                    className="flex-1 w-full rounded-[2rem] py-3.5 px-6 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30 text-slate-500 dark:text-slate-400 font-bold transition-all duration-500 flex flex-col items-center gap-1 group ring-0 outline-none hover:text-emerald-600 dark:hover:text-emerald-400"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-xl group-data-[state=active]:bg-white/20 transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm tracking-tight">Maklumat</span>
                                    </div>
                                    <span className="text-[10px] opacity-60 group-data-[state=active]:opacity-80 font-medium uppercase tracking-widest leading-none mt-1">Publikasi Layanan</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="masukan-saran" className="space-y-10 outline-none">
                            {loadingFeedback ? (
                                <div className="py-32 w-full flex flex-col items-center justify-center gap-4">
                                    <HashLoader color="#3b82f6" size={60} />
                                    <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat masukan pengguna...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-10">
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Total Masukan</p>
                                                    <h4 className="text-3xl font-black tracking-tighter">{feedbacks.length}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-amber-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                                    <Star className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-amber-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Rata-rata Rating</p>
                                                    <h4 className="text-3xl font-black tracking-tighter">
                                                        {feedbacks.length > 0
                                                            ? (feedbacks.reduce((acc, f) => acc + calculateAverageRating(f.ratings), 0) / feedbacks.length).toFixed(1)
                                                            : "0.0"}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Rating Tertinggi</p>
                                                    <h4 className="text-3xl font-black tracking-tighter">
                                                        {feedbacks.length > 0
                                                            ? Math.max(...feedbacks.map((f) => calculateAverageRating(f.ratings))).toFixed(1)
                                                            : "0.0"}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-rose-200 dark:shadow-none transition-all duration-500 hover:scale-[1.02] group">
                                            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                                            <div className="relative z-10 space-y-4">
                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-fit">
                                                    <TrendingDown className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-rose-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Rating Terendah</p>
                                                    <h4 className="text-3xl font-black tracking-tighter">
                                                        {feedbacks.length > 0
                                                            ? Math.min(...feedbacks.map((f) => calculateAverageRating(f.ratings)).filter((r) => r > 0)).toFixed(1)
                                                            : "0.0"}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4">
                                        <div className="relative flex-1 group w-full">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <Input
                                                type="text"
                                                placeholder="Cari masukan berdasarkan nama, instansi, atau kata kunci..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full h-14 pl-14 pr-6 bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                                            />
                                        </div>
                                        {searchQuery && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setSearchQuery("")}
                                                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all"
                                            >
                                                <X className="w-4 h-4 mr-2" /> Reset
                                            </Button>
                                        )}
                                    </div>

                                    {/* Table View */}
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                                                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                                        <TableHead className="w-16 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">No</TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-3.5 h-3.5" /> Tanggal
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-3.5 h-3.5" /> Identitas
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 text-center">
                                                            <div className="flex items-center gap-2 justify-center">
                                                                <Star className="w-3.5 h-3.5" /> Penilaian
                                                            </div>
                                                        </TableHead>
                                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-6 text-center">Aksi</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredFeedbacks.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="py-20 text-center">
                                                                <div className="flex flex-col items-center gap-3">
                                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                                                                        <MessageSquare className="w-8 h-8" />
                                                                    </div>
                                                                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                                                                        {searchQuery ? "Data tidak ditemukan" : "Belum ada masukan tersedia"}
                                                                    </p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredFeedbacks.map((feedback, index) => {
                                                            const avgRating = calculateAverageRating(feedback.ratings);
                                                            return (
                                                                <TableRow key={feedback.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors">
                                                                    <TableCell className="text-center font-bold text-xs text-slate-400">{index + 1}</TableCell>
                                                                    <TableCell className="py-6">
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                                                {formatDate(feedback.createdAt).split(' pukul ')[0]}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400 font-medium tracking-wider">
                                                                                Pukul {formatDate(feedback.createdAt).split(' pukul ')[1]}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-sm font-black text-slate-800 dark:text-white uppercase group-hover:text-blue-600 transition-colors">
                                                                                {feedback.nama}
                                                                            </span>
                                                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                                                <Building className="w-3 h-3" />
                                                                                <span className="text-[11px] font-medium tracking-tight">
                                                                                    {feedback.asalInstansi}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-transparent transition-all group-hover:border-inherit" style={{ backgroundColor: getRatingColor(avgRating).split(' ')[0].replace('bg-', 'var(--') }}>
                                                                            <div className={`px-3 py-1 rounded-lg ${getRatingColor(avgRating)} border shadow-sm flex items-center gap-2`}>
                                                                                <span className={`text-[11px] font-black`}>
                                                                                    {avgRating > 0 ? `${avgRating} / 5.0` : "N/A"}
                                                                                </span>
                                                                                <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                                                <span className={`text-[10px] font-bold uppercase tracking-widest`}>
                                                                                    {getRatingLabel(avgRating)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <Button
                                                                            onClick={() => setSelectedFeedback(feedback)}
                                                                            size="sm"
                                                                            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-bold text-[10px] uppercase tracking-wider px-5"
                                                                        >
                                                                            <Info className="w-3.5 h-3.5 mr-2" /> Detail
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="maklumat-pelayanan" className="space-y-10 outline-none">
                            {loadingMaklumat ? (
                                <div className="py-32 w-full flex flex-col items-center justify-center gap-4">
                                    <HashLoader color="#10b981" size={60} />
                                    <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat maklumat pelayanan...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-10">
                                    {/* Action Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-[2rem] p-6 lg:p-8 gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-600/20 shadow-sm">
                                                <ImageIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Maklumat Pelayanan</h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kelola publikasi standar pelayanan aplikasi!</p>
                                            </div>
                                        </div>
                                        {!showMaklumatForm && (
                                            <Button
                                                onClick={() => setShowMaklumatForm(true)}
                                                className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:-translate-y-1 transition-all w-full sm:w-auto"
                                            >
                                                <Plus className="w-5 h-5 mr-3" /> Tambah Maklumat
                                            </Button>
                                        )}
                                    </div>

                                    {showMaklumatForm && (
                                        <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                                            <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                            {editingMaklumat ? "Modifikasi Maklumat" : "Buat Maklumat Baru"}
                                                        </CardTitle>
                                                        <CardDescription className="text-slate-500 font-medium">Lengkapi detail publikasi di bawah ini!</CardDescription>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={cancelMaklumatForm} className="rounded-full hover:bg-rose-50 hover:text-rose-500">
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-8 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div className="space-y-2.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul Publikasi</label>
                                                            <Input
                                                                value={maklumatForm.title}
                                                                onChange={(e) => setMaklumatForm({ ...maklumatForm, title: e.target.value })}
                                                                placeholder="Contoh: Maklumat Pelayanan Utama..."
                                                                className="h-12 rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                                                            />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deskripsi Maklumat</label>
                                                            <textarea
                                                                value={maklumatForm.description}
                                                                onChange={(e) => setMaklumatForm({ ...maklumatForm, description: e.target.value })}
                                                                className="w-full p-4 text-sm font-medium bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 min-h-[120px] transition-all"
                                                                placeholder="Deskripsikan secara detail isi maklumat..."
                                                            />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL Media Gambar</label>
                                                            <Input
                                                                value={maklumatForm.imageUrl}
                                                                onChange={(e) => setMaklumatForm({ ...maklumatForm, imageUrl: e.target.value })}
                                                                placeholder="https://example.com/poster.jpg"
                                                                className="h-12 rounded-xl bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-4">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-center">Preview Visual</label>
                                                        <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group">
                                                            {maklumatForm.imageUrl ? (
                                                                <img
                                                                    src={getDirectImageUrl(maklumatForm.imageUrl)}
                                                                    alt="Preview"
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                    onError={(e) => (e.currentTarget.src = "/illustrations/placeholder.png")}
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                                                    <ImageIcon className="w-12 h-12 opacity-30" />
                                                                    <p className="text-[11px] font-bold uppercase tracking-widest">Wunggu Input Media</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                                                    <Button onClick={cancelMaklumatForm} variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-wider">
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveMaklumat}
                                                        disabled={savingMaklumat}
                                                        className="h-12 px-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                    >
                                                        {savingMaklumat ? "Memproses..." : editingMaklumat ? "Simpan Perubahan" : "Publikasikan"}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {maklumatList.length === 0 ? (
                                            <div className="col-span-full py-20 bg-white/40 dark:bg-slate-900/40 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
                                                <ImageIcon className="w-16 h-16 text-slate-300" />
                                                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Belum ada maklumat dipublikasikan</p>
                                            </div>
                                        ) : (
                                            maklumatList.map((maklumat) => (
                                                <article key={maklumat.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none hover:-translate-y-1">
                                                    <div className="relative w-full md:w-52 h-48 md:h-auto overflow-hidden shrink-0 transition-all duration-500 group-hover:w-full md:group-hover:w-60">
                                                        <img
                                                            src={getDirectImageUrl(maklumat.imageUrl)}
                                                            alt={maklumat.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => (e.currentTarget.src = "/illustrations/placeholder.png")}
                                                        />
                                                    </div>
                                                    <div className="p-6 md:p-8 flex flex-col flex-1 gap-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                                                                <ImageIcon className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Dipublikasikan</span>
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                                                                {maklumat.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                                                                {maklumat.description}
                                                            </p>
                                                        </div>

                                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(maklumat.createdAt).split(' pukul ')[0]}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => handleEditMaklumat(maklumat)}
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                                >
                                                                    <MdEdit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDeleteMaklumat(maklumat)}
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                                                >
                                                                    <MdDelete className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Premium Detail Modal */}
            {selectedFeedback && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300"
                    onClick={() => setSelectedFeedback(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/60 dark:border-slate-800 animate-in slide-in-from-bottom-5 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-8 z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20 shadow-sm">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Detail Masukan</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formatDate(selectedFeedback.createdAt)}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedFeedback(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Profile Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Nama Lengkap</span>
                                    </div>
                                    <p className="text-base font-black text-slate-800 dark:text-white uppercase">{selectedFeedback.nama}</p>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Building className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Asal Instansi</span>
                                    </div>
                                    <p className="text-base font-black text-slate-800 dark:text-white uppercase">{selectedFeedback.asalInstansi}</p>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-3">
                                        <span>Masukan & Kritik</span>
                                        <div className="h-px w-20 bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                    <Badge className={`${getRatingColor(calculateAverageRating(selectedFeedback.ratings))} font-bold px-4 rounded-xl border`}>
                                        SKOR: {calculateAverageRating(selectedFeedback.ratings)} / 5.0
                                    </Badge>
                                </div>
                                <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-500/10 shadow-inner">
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic text-lg text-center">
                                        "{selectedFeedback.masukanSaran}"
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Ratings */}
                            <div className="space-y-6">
                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-3">
                                    <span>Skor Indikator</span>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {RATING_QUESTIONS.map((question) => {
                                        const rating = selectedFeedback.ratings[question.key as keyof FeedbackData["ratings"]];
                                        return (
                                            <div
                                                key={question.key}
                                                className="flex items-center justify-between p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5"
                                            >
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {question.label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${getRatingColor(rating).split(' ')[1]}`}>
                                                        {rating > 0 ? rating : "N/A"}
                                                    </span>
                                                    <Star className={`w-4 h-4 ${rating > 0 ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="h-14 px-10 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20"
                                >
                                    Tutup Detail
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdminElaut>
    );
}

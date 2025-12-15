"use client";

import React, { useEffect, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { MdFeedback, MdSearch, MdClear, MdCalendarToday, MdPerson, MdBusiness, MdStar } from "react-icons/md";
import { getAllFeedbacks } from "@/utils/feedback";
import { HashLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IoInformationOutline } from "react-icons/io5";

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

export default function MasukanSaranAdminPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const data = await getAllFeedbacks();
            setFeedbacks(data as FeedbackData[]);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
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
        const values = Object.values(ratings).filter(v => v > 0);
        if (values.length === 0) return 0;
        return parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
    };

    const getRatingColor = (rating: number) => {
        if (rating === 0) return "bg-gray-100 text-gray-500";
        if (rating <= 2) return "bg-red-100 text-red-700";
        if (rating <= 3) return "bg-yellow-100 text-yellow-700";
        if (rating <= 4) return "bg-blue-100 text-blue-700";
        return "bg-green-100 text-green-700";
    };

    const getRatingLabel = (rating: number) => {
        if (rating === 0) return "N/A";
        if (rating <= 2) return "Kurang";
        if (rating <= 3) return "Cukup";
        if (rating <= 4) return "Baik";
        return "Sangat Baik";
    };

    const filteredFeedbacks = feedbacks.filter((feedback) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            feedback.nama.toLowerCase().includes(searchLower) ||
            feedback.asalInstansi.toLowerCase().includes(searchLower) ||
            feedback.masukanSaran.toLowerCase().includes(searchLower)
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

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title="Masukan dan Saran"
                    description="Lihat dan kelola masukan, saran, serta penilaian pengguna terhadap aplikasi E-LAUT"
                    icon={<MdFeedback className="text-3xl" />}
                />

                <article className="w-full h-full p-4">
                    {loading ? (
                        <div className="py-32 w-full items-center flex justify-center">
                            <HashLoader color="#338CF5" size={50} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardDescription>Total Masukan</CardDescription>
                                        <CardTitle className="text-3xl">{feedbacks.length}</CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardDescription>Rata-rata Rating</CardDescription>
                                        <CardTitle className="text-3xl flex items-center gap-2">
                                            {feedbacks.length > 0
                                                ? (
                                                    feedbacks.reduce(
                                                        (acc, f) => acc + calculateAverageRating(f.ratings),
                                                        0
                                                    ) / feedbacks.length
                                                ).toFixed(1)
                                                : "0.0"}
                                            <MdStar className="text-yellow-500 text-2xl" />
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardDescription>Rating Tertinggi</CardDescription>
                                        <CardTitle className="text-3xl">
                                            {feedbacks.length > 0
                                                ? Math.max(
                                                    ...feedbacks.map((f) =>
                                                        calculateAverageRating(f.ratings)
                                                    )
                                                ).toFixed(1)
                                                : "0.0"}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader className="py-4">
                                        <CardDescription>Rating Terendah</CardDescription>
                                        <CardTitle className="text-3xl">
                                            {feedbacks.length > 0
                                                ? Math.min(
                                                    ...feedbacks
                                                        .map((f) => calculateAverageRating(f.ratings))
                                                        .filter((r) => r > 0)
                                                ).toFixed(1)
                                                : "0.0"}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Search Bar */}
                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-neutral-200">
                                <div className="flex items-center w-full flex-1 bg-neutral-50 border border-neutral-200 rounded-xl shadow-sm h-12 px-4 gap-2">
                                    <MdSearch className="text-neutral-500 w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder="Cari berdasarkan nama, instansi, atau masukan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border-none bg-transparent text-sm focus:ring-0 focus:outline-none"
                                    />
                                </div>
                                {searchQuery && (
                                    <Button
                                        onClick={() => setSearchQuery("")}
                                        className="h-12 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl shadow-sm flex items-center gap-2"
                                    >
                                        <MdClear className="w-5 h-5" />
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Feedback Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-neutral-50">
                                            <TableHead className="font-semibold">No</TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <MdCalendarToday className="w-4 h-4" />
                                                    Tanggal
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <MdPerson className="w-4 h-4" />
                                                    Nama
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <MdBusiness className="w-4 h-4" />
                                                    Instansi
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <MdStar className="w-4 h-4" />
                                                    Rating
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="px-4">
                                        {filteredFeedbacks.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-neutral-500">
                                                    {searchQuery
                                                        ? "Tidak ada hasil pencarian"
                                                        : "Belum ada masukan dan saran"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredFeedbacks.map((feedback, index) => {
                                                const avgRating = calculateAverageRating(feedback.ratings);
                                                return (
                                                    <TableRow key={feedback.id} className="hover:bg-neutral-50">
                                                        <TableCell className="font-medium pl-3">{index + 1}</TableCell>
                                                        <TableCell className="text-sm text-neutral-600">
                                                            {formatDate(feedback.createdAt)}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{feedback.nama}</TableCell>
                                                        <TableCell className="text-sm text-neutral-600">
                                                            {feedback.asalInstansi}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={`${getRatingColor(avgRating)} font-semibold`}>
                                                                {avgRating > 0 ? `${avgRating}/5` : "N/A"} - {getRatingLabel(avgRating)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                onClick={() => setSelectedFeedback(feedback)}
                                                                size="sm"
                                                                className="bg-blue-500 hover:bg-blue-700 text-white"
                                                            >
                                                                <IoInformationOutline />
                                                                Detail
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
                    )}
                </article>
            </section>

            {/* Detail Modal */}
            {selectedFeedback && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedFeedback(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <MdFeedback className="text-3xl" />
                                Detail Masukan & Saran
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                                        <MdPerson className="w-4 h-4" />
                                        Nama
                                    </label>
                                    <p className="text-lg font-medium mt-1">{selectedFeedback.nama}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                                        <MdBusiness className="w-4 h-4" />
                                        Asal Instansi
                                    </label>
                                    <p className="text-lg font-medium mt-1">{selectedFeedback.asalInstansi}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-neutral-600 flex items-center gap-2">
                                        <MdCalendarToday className="w-4 h-4" />
                                        Tanggal Submit
                                    </label>
                                    <p className="text-lg font-medium mt-1">
                                        {formatDate(selectedFeedback.createdAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Feedback Content */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-600">
                                    Masukan dan Saran
                                </label>
                                <div className="mt-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                    <p className="text-neutral-700 whitespace-pre-wrap">
                                        {selectedFeedback.masukanSaran}
                                    </p>
                                </div>
                            </div>

                            {/* Ratings */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-600 mb-3 block">
                                    Penilaian Aplikasi
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {RATING_QUESTIONS.map((question) => {
                                        const rating = selectedFeedback.ratings[
                                            question.key as keyof FeedbackData["ratings"]
                                        ];
                                        return (
                                            <div
                                                key={question.key}
                                                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                                            >
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {question.label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${getRatingColor(rating)} font-semibold`}>
                                                        {rating > 0 ? `${rating}/5` : "N/A"}
                                                    </Badge>
                                                    <span className="text-xs text-neutral-500">
                                                        {getRatingLabel(rating)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Average Rating */}
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-blue-900">
                                            Rata-rata Penilaian
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                                                {calculateAverageRating(selectedFeedback.ratings)}/5
                                            </Badge>
                                            <MdStar className="text-yellow-500 text-3xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-6"
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LayoutAdminElaut>
    );
}

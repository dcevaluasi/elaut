"use client";

import React, { useEffect, useState } from "react";
import LayoutAdminElaut, { HeaderPageLayoutAdminElaut } from "@/components/dashboard/Layouts/LayoutAdminElaut";
import { MdFeedback, MdSearch, MdClear, MdCalendarToday, MdPerson, MdBusiness, MdStar, MdImage, MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { IoMdGlobe } from "react-icons/io";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IoAlbumsOutline, IoInformationOutline } from "react-icons/io5";
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

    const handleSaveMaklumat = async () => {
        if (!maklumatForm.title || !maklumatForm.description) {
            alert("Judul dan deskripsi harus diisi!");
            return;
        }

        if (!maklumatForm.imageUrl) {
            alert("Link gambar harus diisi!");
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
                alert("Maklumat Pelayanan berhasil diupdate!");
            } else {
                await saveMaklumatPelayanan({
                    title: maklumatForm.title,
                    description: maklumatForm.description,
                    imageUrl: maklumatForm.imageUrl
                });
                alert("Maklumat Pelayanan berhasil disimpan!");
            }

            setMaklumatForm({ title: "", description: "", imageUrl: "" });
            setShowMaklumatForm(false);
            setEditingMaklumat(null);
            fetchMaklumat();
        } catch (error) {
            console.error("Error saving maklumat:", error);
            alert("Gagal menyimpan maklumat pelayanan!");
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
        if (!confirm("Apakah Anda yakin ingin menghapus maklumat pelayanan ini?")) return;

        try {
            await deleteMaklumatPelayanan(maklumat.id);
            alert("Maklumat Pelayanan berhasil dihapus!");
            fetchMaklumat();
        } catch (error) {
            console.error("Error deleting maklumat:", error);
            alert("Gagal menghapus maklumat pelayanan!");
        }
    };

    const cancelMaklumatForm = () => {
        setShowMaklumatForm(false);
        setEditingMaklumat(null);
        setMaklumatForm({ title: "", description: "", imageUrl: "" });
    };

    return (
        <LayoutAdminElaut>
            <section className="flex-1 flex flex-col">
                <HeaderPageLayoutAdminElaut
                    title="Layanan dan Pengaduan"
                    description="Kelola masukan & saran pengguna dan maklumat pelayanan aplikasi E-LAUT"
                    icon={<IoAlbumsOutline className="text-3xl" />}
                />

                <article className="w-full h-full p-4">
                    <Tabs defaultValue="masukan-saran" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="masukan-saran">
                                <MdFeedback className="mr-2" />
                                Masukan & Saran
                            </TabsTrigger>
                            <TabsTrigger value="maklumat-pelayanan">
                                <MdImage className="mr-2" />
                                Maklumat Pelayanan
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="masukan-saran">
                            {loadingFeedback ? (
                                <div className="py-32 w-full items-center flex justify-center">
                                    <HashLoader color="#338CF5" size={50} />
                                </div>
                            ) : (
                                <div className="space-y-4">
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
                                                        ? Math.max(...feedbacks.map((f) => calculateAverageRating(f.ratings))).toFixed(1)
                                                        : "0.0"}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader className="py-4">
                                                <CardDescription>Rating Terendah</CardDescription>
                                                <CardTitle className="text-3xl">
                                                    {feedbacks.length > 0
                                                        ? Math.min(...feedbacks.map((f) => calculateAverageRating(f.ratings)).filter((r) => r > 0)).toFixed(1)
                                                        : "0.0"}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    </div>

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
                                            <TableBody>
                                                {filteredFeedbacks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-12 text-neutral-500">
                                                            {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada masukan dan saran"}
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
                                                                        <IoInformationOutline className="mr-1" />
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
                        </TabsContent>

                        <TabsContent value="maklumat-pelayanan">
                            {loadingMaklumat ? (
                                <div className="py-32 w-full items-center flex justify-center">
                                    <HashLoader color="#338CF5" size={50} />
                                </div>
                            ) : (
                                <div className="space-y-4">


                                    {showMaklumatForm && (
                                        <Card className="border border-neutral-200">
                                            <div className="p-4 border-b">
                                                <h3 className="font-semibold text-base">
                                                    {editingMaklumat ? "Edit Maklumat Pelayanan" : "Tambah Maklumat Pelayanan"}
                                                </h3>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5">Judul</label>
                                                    <Input
                                                        value={maklumatForm.title}
                                                        onChange={(e) => setMaklumatForm({ ...maklumatForm, title: e.target.value })}
                                                        placeholder="Judul maklumat pelayanan..."
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
                                                    <textarea
                                                        value={maklumatForm.description}
                                                        onChange={(e) => setMaklumatForm({ ...maklumatForm, description: e.target.value })}
                                                        className="w-full p-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        rows={3}
                                                        placeholder="Deskripsi maklumat pelayanan..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1.5">Link Gambar</label>
                                                    <Input
                                                        value={maklumatForm.imageUrl}
                                                        onChange={(e) => setMaklumatForm({ ...maklumatForm, imageUrl: e.target.value })}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="h-9"
                                                    />
                                                    {maklumatForm.imageUrl && (
                                                        <p className="text-xs text-green-600 mt-1">✓ Link tersedia</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 justify-end pt-2">
                                                    <Button onClick={cancelMaklumatForm} variant="outline" size="sm" disabled={savingMaklumat}>
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveMaklumat}
                                                        disabled={savingMaklumat}
                                                        size="sm"
                                                        className="bg-blue-500 hover:bg-blue-600"
                                                    >
                                                        {savingMaklumat ? "Menyimpan..." : "Simpan"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    <div className="grid grid-cols-1  gap-4">
                                        {maklumatList.length === 0 ? (
                                            <div className="col-span-full text-center py-12 text-neutral-500">
                                                Belum ada maklumat pelayanan
                                            </div>
                                        ) : (
                                            maklumatList.map((maklumat) => (
                                                <Card key={maklumat.id} className="overflow-hidden">
                                                    <div className="relative h-48 w-full bg-neutral-100">
                                                        <img
                                                            src={getDirectImageUrl(maklumat.imageUrl)}
                                                            alt={maklumat.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                console.error('Admin image failed to load:', maklumat.imageUrl);
                                                                console.log('Converted URL:', getDirectImageUrl(maklumat.imageUrl));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-bold text-lg mb-2">{maklumat.title}</h3>
                                                        <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
                                                            {maklumat.description}
                                                        </p>
                                                        <div className="text-xs text-neutral-400 mb-3">
                                                            {formatDate(maklumat.createdAt)}
                                                        </div>
                                                        <div className="flex gap-2 w-full">
                                                            <Button
                                                                onClick={() => handleEditMaklumat(maklumat)}
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full"
                                                            >
                                                                <MdEdit className="mr-1" />
                                                                Edit
                                                            </Button>

                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </article>
            </section>

            {selectedFeedback && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedFeedback(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b p-4">
                            <h2 className="text-lg font-semibold">Detail Masukan & Saran</h2>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-neutral-500 mb-1">Nama</p>
                                    <p className="font-medium">{selectedFeedback.nama}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-500 mb-1">Asal Instansi</p>
                                    <p className="font-medium">{selectedFeedback.asalInstansi}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-neutral-500 mb-1">Tanggal</p>
                                    <p className="text-sm">{formatDate(selectedFeedback.createdAt)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500 mb-2">Masukan dan Saran</p>
                                <div className="p-3 bg-neutral-50 rounded border text-sm">
                                    <p className="text-neutral-700 whitespace-pre-wrap">
                                        {selectedFeedback.masukanSaran}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-neutral-500 mb-2">Penilaian</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {RATING_QUESTIONS.map((question) => {
                                        const rating = selectedFeedback.ratings[
                                            question.key as keyof FeedbackData["ratings"]
                                        ];
                                        return (
                                            <div
                                                key={question.key}
                                                className="flex items-center justify-between p-2 bg-neutral-50 rounded text-sm"
                                            >
                                                <span className="text-neutral-700">
                                                    {question.label}
                                                </span>
                                                <Badge className={`${getRatingColor(rating)} text-xs`}>
                                                    {rating > 0 ? `${rating}/5` : "N/A"}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-900">
                                            Rata-rata
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Badge className="bg-blue-600 text-white">
                                                {calculateAverageRating(selectedFeedback.ratings)}/5
                                            </Badge>
                                            <MdStar className="text-yellow-500 text-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={() => setSelectedFeedback(null)}
                                    size="sm"
                                    variant="outline"
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

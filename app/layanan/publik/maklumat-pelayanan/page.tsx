'use client'

import React, { useEffect, useState } from 'react';
import { getAllMaklumatPelayanan } from '@/utils/feedback';
import Footer from '@/components/ui/footer';
import Image from 'next/image';
import { FileText, Calendar, Loader2 } from 'lucide-react';

interface MaklumatPelayanan {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    imagePath: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

export default function MaklumatPelayananPage() {
    const [maklumat, setMaklumat] = useState<MaklumatPelayanan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaklumat();
    }, []);

    const fetchMaklumat = async () => {
        try {
            setLoading(true);
            const data = await getAllMaklumatPelayanan();
            if (data.length > 0) {
                setMaklumat(data[0] as MaklumatPelayanan);
            }
        } catch (error) {
            console.error("Error fetching maklumat:", error);
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
        }).format(date);
    };

    return (
        <section>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-2 sm:p-4 md:p-6">
                <div className="max-w-6xl mx-auto mt-28">
                    {/* Glass Card */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8">
                        {/* Header */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
                                Maklumat Pelayanan
                            </h1>
                            <p className="text-white/80 text-sm sm:text-base">
                                Informasi pelayanan terkini dari E-LAUT - Elektronik Layanan Terpadu Utama Pelatihan
                            </p>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-spin mb-4" />
                                <p className="text-white/80 text-sm sm:text-base">Memuat maklumat pelayanan...</p>
                            </div>
                        ) : maklumat ? (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                                {/* Image Section */}
                                <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                                    <Image
                                        src={maklumat.imageUrl}
                                        alt={maklumat.title}
                                        fill
                                        className="object-contain p-4"
                                        priority
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                </div>

                                {/* Content Section */}
                                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                                    {/* Title */}
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300 flex-shrink-0 mt-1" />
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                                            {maklumat.title}
                                        </h2>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-white/70">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="text-xs sm:text-sm">
                                            Dipublikasikan: {formatDate(maklumat.createdAt)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10">
                                        <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                                            {maklumat.description}
                                        </p>
                                    </div>

                                    {/* Decorative Element */}
                                    <div className="flex items-center justify-center pt-4">
                                        <div className="h-1 w-32 sm:w-48 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 sm:p-12 md:p-16 border border-white/10 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center">
                                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                            Belum Ada Maklumat Pelayanan
                                        </h3>
                                        <p className="text-white/70 text-sm sm:text-base">
                                            Maklumat pelayanan akan ditampilkan di sini ketika tersedia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-blue-400/30">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-full bg-blue-400 rounded-full flex-shrink-0" />
                                <div>
                                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                                        Informasi Penting
                                    </h3>
                                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                                        Maklumat pelayanan ini berisi standar pelayanan, persyaratan, biaya, waktu pelayanan,
                                        dan informasi penting lainnya terkait pelayanan pelatihan kelautan dan perikanan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </section>
    );
}

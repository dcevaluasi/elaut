'use client'

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { saveFeedback } from '@/utils/feedback';
import Footer from '@/components/ui/footer';

interface FeedbackData {
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
}

const RATING_QUESTIONS = [
    {
        key: 'kemudahanAkses',
        label: 'Kemudahan akses ke aplikasi E-LAUT'
    },
    {
        key: 'kemudahanPenggunaan',
        label: 'Kemudahan penggunaan aplikasi E-LAUT'
    },
    {
        key: 'kecepatan',
        label: 'Kecepatan dan performa aplikasi'
    },
    {
        key: 'desainTampilan',
        label: 'Desain dan tampilan aplikasi'
    },
    {
        key: 'kelengkapanFitur',
        label: 'Kelengkapan fitur yang tersedia'
    },
    {
        key: 'kejelasanInformasi',
        label: 'Kejelasan informasi dan panduan'
    },
    {
        key: 'responsifMobile',
        label: 'Tampilan responsif di perangkat mobile'
    },
    {
        key: 'kepuasanKeseluruhan',
        label: 'Kepuasan keseluruhan terhadap aplikasi'
    }
];

export default function MasukanSaranPage() {
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState<FeedbackData>({
        nama: '',
        asalInstansi: '',
        masukanSaran: '',
        ratings: {
            kemudahanAkses: 0,
            kemudahanPenggunaan: 0,
            kecepatan: 0,
            desainTampilan: 0,
            kelengkapanFitur: 0,
            kejelasanInformasi: 0,
            responsifMobile: 0,
            kepuasanKeseluruhan: 0
        }
    });

    const updateRating = (key: keyof FeedbackData['ratings'], value: number) => {
        setData({
            ...data,
            ratings: {
                ...data.ratings,
                [key]: value
            }
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!data.nama.trim()) {
            alert('Nama tidak boleh kosong!');
            return;
        }
        if (!data.asalInstansi.trim()) {
            alert('Asal Instansi tidak boleh kosong!');
            return;
        }
        if (!data.masukanSaran.trim()) {
            alert('Masukan dan Saran tidak boleh kosong!');
            return;
        }

        // Check if at least one rating is filled
        const hasRating = Object.values(data.ratings).some(rating => rating > 0);
        if (!hasRating) {
            alert('Mohon berikan minimal satu penilaian!');
            return;
        }

        setSaving(true);
        try {
            await saveFeedback(data);
            setSubmitted(true);
            alert('Terima kasih! Masukan dan saran Anda berhasil disimpan.');

            // Reset form after 2 seconds
            setTimeout(() => {
                setData({
                    nama: '',
                    asalInstansi: '',
                    masukanSaran: '',
                    ratings: {
                        kemudahanAkses: 0,
                        kemudahanPenggunaan: 0,
                        kecepatan: 0,
                        desainTampilan: 0,
                        kelengkapanFitur: 0,
                        kejelasanInformasi: 0,
                        responsifMobile: 0,
                        kepuasanKeseluruhan: 0
                    }
                });
                setSubmitted(false);
            }, 2000);
        } catch (error) {
            alert('Gagal menyimpan masukan dan saran!');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const getRatingLabel = (rating: number) => {
        if (rating === 0) return '';
        if (rating <= 2) return 'Kurang';
        if (rating <= 3) return 'Cukup';
        if (rating <= 4) return 'Baik';
        return 'Sangat Baik';
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
                                Masukan dan Saran
                            </h1>
                            <p className="text-white/80 text-sm sm:text-base">
                                Bantu kami meningkatkan aplikasi E-LAUT dengan memberikan masukan dan penilaian Anda
                            </p>
                        </div>

                        {/* Form Container */}
                        <div className="space-y-6">
                            {/* Informasi Pengguna */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Informasi Pengguna</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block font-semibold mb-2 text-white text-sm sm:text-base">
                                            Nama <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={data.nama}
                                            onChange={(e) => setData({ ...data, nama: e.target.value })}
                                            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                            placeholder="Masukkan nama lengkap Anda..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2 text-white text-sm sm:text-base">
                                            Asal Instansi <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            value={data.asalInstansi}
                                            onChange={(e) => setData({ ...data, asalInstansi: e.target.value })}
                                            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                            placeholder="Masukkan asal instansi Anda..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold mb-2 text-white text-sm sm:text-base">
                                            Masukan dan Saran <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={data.masukanSaran}
                                            onChange={(e) => setData({ ...data, masukanSaran: e.target.value })}
                                            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                                            rows={6}
                                            placeholder="Tuliskan masukan, saran, atau kritik Anda untuk meningkatkan aplikasi E-LAUT..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Penilaian Aplikasi */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Penilaian Aplikasi E-LAUT</h2>
                                <p className="text-white/70 text-xs sm:text-sm mb-4">
                                    Berikan penilaian dari skala 1 (sangat kurang) hingga 5 (sangat baik)
                                </p>

                                <div className="gap-2 grid-cols-1  md:grid-cols-2 grid">
                                    {RATING_QUESTIONS.map((question) => {
                                        const currentRating = data.ratings[question.key as keyof FeedbackData['ratings']];
                                        return (
                                            <div key={question.key} className="bg-white/5 p-3 sm:p-4 rounded-lg">
                                                <div className="flex flex-col sm:flex-row justify-center items-center mb-3 gap-2">
                                                    <label className="font-medium text-white text-sm sm:text-base">
                                                        {question.label}
                                                    </label>
                                                    {currentRating > 0 && (
                                                        <span className="text-blue-300 text-xs sm:text-sm font-semibold">
                                                            {getRatingLabel(currentRating)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 sm:gap-3 justify-center ">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            key={rating}
                                                            onClick={() => updateRating(question.key as keyof FeedbackData['ratings'], rating)}
                                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-sm sm:text-base transition-all ${currentRating >= rating
                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                                                                : 'bg-white/10 text-white/50 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            {rating}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center w-full">
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || submitted}
                                    className="w-full flex justify-center  items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                >
                                    <Save size={20} />
                                    <span>{saving ? 'Menyimpan...' : submitted ? 'Tersimpan!' : 'Kirim Masukan'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </section>
    );
}

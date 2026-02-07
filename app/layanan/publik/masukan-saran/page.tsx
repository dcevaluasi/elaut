'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageSquare,
    FiUser,
    FiBriefcase,
    FiSend,
    FiCheckCircle,
    FiStar,
    FiInfo,
    FiLayout,
    FiZap,
    FiSmartphone,
    FiCpu,
    FiLayers
} from 'react-icons/fi';
import { saveFeedback } from '@/utils/feedback';
import Footer from '@/components/ui/footer';
import { HashLoader } from 'react-spinners';
import Toast from '@/commons/Toast';

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
        label: 'Kemudahan akses ke aplikasi E-LAUT',
        icon: <FiLayers />
    },
    {
        key: 'kemudahanPenggunaan',
        label: 'Kemudahan penggunaan aplikasi E-LAUT',
        icon: <FiZap />
    },
    {
        key: 'kecepatan',
        label: 'Kecepatan dan performa aplikasi',
        icon: <FiCpu />
    },
    {
        key: 'desainTampilan',
        label: 'Desain dan tampilan aplikasi',
        icon: <FiLayout />
    },
    {
        key: 'kelengkapanFitur',
        label: 'Kelengkapan fitur yang tersedia',
        icon: <FiInfo />
    },
    {
        key: 'kejelasanInformasi',
        label: 'Kejelasan informasi dan panduan',
        icon: <FiInfo />
    },
    {
        key: 'responsifMobile',
        label: 'Tampilan responsif di perangkat mobile',
        icon: <FiSmartphone />
    },
    {
        key: 'kepuasanKeseluruhan',
        label: 'Kepuasan keseluruhan terhadap aplikasi',
        icon: <FiStar />
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
            Toast.fire({ icon: 'error', title: 'Nama tidak boleh kosong!' });
            return;
        }
        if (!data.asalInstansi.trim()) {
            Toast.fire({ icon: 'error', title: 'Asal Instansi tidak boleh kosong!' });
            return;
        }
        if (!data.masukanSaran.trim()) {
            Toast.fire({ icon: 'error', title: 'Masukan dan Saran tidak boleh kosong!' });
            return;
        }

        const hasRating = Object.values(data.ratings).some(rating => rating > 0);
        if (!hasRating) {
            Toast.fire({ icon: 'error', title: 'Mohon berikan minimal satu penilaian!' });
            return;
        }

        setSaving(true);
        try {
            await saveFeedback(data);
            setSubmitted(true);
            Toast.fire({ icon: 'success', title: 'Terima kasih! Masukan Anda sangat berarti.' });

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
            }, 3000);
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Gagal mengirim masukan' });
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <FiMessageSquare size={14} /> Feedback Center
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-calsans tracking-tight leading-none"
                        >
                            Masukan & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Saran</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                        >
                            Suara Anda menentukan masa depan E-LAUT. Bantu kami menciptakan layanan terbaik bagi masyarakat kelautan dan perikanan dengan memberikan masukan konstruktif.
                        </motion.p>
                    </div>

                    {/* Main Form Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-10"
                    >
                        {/* Section: Identitas */}
                        <motion.div variants={itemVariants} className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                        <FiUser size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-calsans">Informasi Pengirim</h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Personal Identification</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                                        <div className="relative group">
                                            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                value={data.nama}
                                                onChange={(e) => setData({ ...data, nama: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                                                placeholder="Masukan nama lengkap..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Instansi / Lembaga <span className="text-rose-500">*</span></label>
                                        <div className="relative group">
                                            <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                value={data.asalInstansi}
                                                onChange={(e) => setData({ ...data, asalInstansi: e.target.value })}
                                                className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                                                placeholder="Instansi tempat Anda bekerja..."
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Pesan & Aspirasi <span className="text-rose-500">*</span></label>
                                        <textarea
                                            value={data.masukanSaran}
                                            onChange={(e) => setData({ ...data, masukanSaran: e.target.value })}
                                            rows={6}
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Tuliskan kritikan, masukan, atau saran perkembangan aplikasi di sini..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Section: Ratings Grid */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                                    <FiStar size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-calsans">Penilaian Produk</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-white/5 flex-1" />
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">User Satisfaction Metrics</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {RATING_QUESTIONS.map((question) => {
                                    const currentRating = data.ratings[question.key as keyof FeedbackData['ratings']];
                                    return (
                                        <div key={question.key} className="bg-white/5 hover:bg-white/[0.07] border border-white/5 rounded-3xl p-6 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                                        {question.icon}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                                                        {question.label}
                                                    </span>
                                                </div>
                                                <AnimatePresence>
                                                    {currentRating > 0 && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md"
                                                        >
                                                            {getRatingLabel(currentRating)}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="flex justify-between gap-2">
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <motion.button
                                                        key={rating}
                                                        whileHover={{ y: -3 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => updateRating(question.key as keyof FeedbackData['ratings'], rating)}
                                                        className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all border ${currentRating >= rating
                                                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {rating}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={itemVariants} className="pt-6">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || submitted}
                                className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-3xl font-bold tracking-widest shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group"
                            >
                                {saving ? (
                                    <HashLoader size={24} color="#fff" />
                                ) : submitted ? (
                                    <><FiCheckCircle size={22} className="animate-bounce" /> PESAN TERKIRIM</>
                                ) : (
                                    <><FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> KIRIM FEEDBACK KAMI</>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </section>
    );
}

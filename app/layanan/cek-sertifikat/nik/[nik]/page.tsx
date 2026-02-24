'use client'

import React, { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { useParams } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiSearch, FiBookOpen, FiUser } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { HiOutlineInbox } from 'react-icons/hi2';
import { elautBaseUrl } from '@/constants/urls';

interface PelatihanByNik {
    nama: string;
    nik: string;
    nama_pelatihan: string;
    bidang_pelatihan: string;
    no_sertifikat: string;
    no_registrasi: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CekSertifikatByNIKPage = () => {
    const params = useParams();
    const nikParam = params?.nik;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PelatihanByNik[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!nikParam || typeof nikParam !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${elautBaseUrl}/getPelatihanByNik`, {
                    nik: nikParam,
                });

                const filteredData = res.data.data?.filter(
                    (item: PelatihanByNik) => item.no_sertifikat && item.no_sertifikat !== ''
                ) || [];

                if (filteredData.length > 0) {
                    setData(filteredData);
                    setError(null);
                } else {
                    setError('Tidak ada riwayat pelatihan dengan sertifikat ditemukan untuk NIK yang dimasukkan.');
                    setData(null);
                }
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.Pesan || 'Data pelatihan tidak ditemukan untuk NIK yang dimasukkan.');
                } else {
                    setError('Terjadi masalah saat menghubungi server. Silakan coba lagi nanti.');
                }
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [nikParam]);

    const filteredData = data?.filter(
        (item) =>
            item.nama_pelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.bidang_pelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.no_registrasi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] pt-28 font-jakarta flex flex-col">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <motion.div
                animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[100px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[120px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, 25, 0], y: [0, 40, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] rounded-full bg-indigo-500/5 blur-[120px] z-[1]"
            />

            <main className="relative z-10 flex-grow flex items-start justify-center p-4 sm:p-6 py-10">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6 mt-20"
                        >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-400 border-r-cyan-400 rounded-full animate-spin" />
                                <div className="absolute inset-2 border-4 border-t-cyan-400 border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-blue-400 font-semibold text-lg">Mencari Riwayat Pelatihan</p>
                                <p className="text-gray-500 text-sm animate-pulse">Menghubungkan ke Pusat Data...</p>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md w-full p-10 rounded-[2rem] bg-[#1e293b]/30 backdrop-blur-2xl border border-rose-500/20 text-center shadow-2xl mt-20"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-rose-500/20">
                                <span className="text-4xl text-rose-500 pb-3">⚠</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 font-calsans">Data Tidak Ditemukan</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">{error}</p>
                            <Link
                                href="/layanan/cek-sertifikat"
                                className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Kembali ke Pencarian
                            </Link>
                        </motion.div>
                    ) : data && filteredData ? (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="max-w-4xl w-full space-y-5"
                        >
                            {/* ===== HERO HEADER ===== */}
                            <div className="relative group">
                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-blue-500/30 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 blur-lg opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500" />

                                <div className="relative rounded-2xl bg-[#0b1120]/80 backdrop-blur-3xl border border-white/[0.08] shadow-2xl text-white overflow-hidden">
                                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="p-6 sm:p-8"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                            {/* Icon */}
                                            <motion.div variants={itemVariants} className="flex-shrink-0">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 ring-2 ring-white/10 flex items-center justify-center">
                                                    <FiUser className="w-7 h-7 text-blue-400" />
                                                </div>
                                            </motion.div>

                                            {/* Info */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <motion.div variants={itemVariants} className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                        <RiVerifiedBadgeFill className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold tracking-widest uppercase">Riwayat Ditemukan</span>
                                                    </div>
                                                </motion.div>

                                                <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold font-calsans text-white leading-tight mb-1">
                                                    {data[0]?.nama}
                                                </motion.h2>

                                                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 justify-center sm:justify-start text-sm text-gray-400">
                                                    <span className="font-mono text-blue-400/80">NIK: {data[0]?.nik}</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-white font-semibold">{data.length} Pelatihan</span>
                                                </motion.div>

                                                <motion.p variants={itemVariants} className="text-xs text-gray-500 font-light max-w-md mt-3 leading-relaxed">
                                                    Berikut adalah daftar pelatihan yang pernah diikuti dan telah terbit sertifikatnya di pangkalan data E-LAUT.
                                                </motion.p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* ===== SEARCH BAR ===== */}
                            {data.length > 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="relative"
                                >
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari pelatihan, bidang, atau nomor STTPL..."
                                        className="w-full h-12 pl-11 pr-5 rounded-xl bg-[#0b1120]/60 backdrop-blur-xl border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/20 transition-all placeholder:text-gray-600"
                                    />
                                </motion.div>
                            )}

                            {/* ===== TRAINING LIST ===== */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-3"
                            >
                                {filteredData.length === 0 ? (
                                    <motion.div
                                        variants={itemVariants}
                                        className="text-center py-12"
                                    >
                                        <HiOutlineInbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Tidak ada pelatihan yang cocok dengan pencarian.</p>
                                    </motion.div>
                                ) : (
                                    filteredData.map((pelatihan, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="relative group/card"
                                        >
                                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                            <div className="relative rounded-2xl bg-[#0b1120]/60 backdrop-blur-2xl border border-white/[0.06] overflow-hidden hover:border-blue-500/20 transition-all duration-300">
                                                <div className="p-5 sm:p-6">
                                                    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                                        {/* Left: Training Info */}
                                                        <div className="flex gap-4 items-start flex-1 min-w-0">
                                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 mt-0.5">
                                                                <FiBookOpen className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col gap-1 min-w-0">
                                                                <span className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">
                                                                    {pelatihan.bidang_pelatihan}
                                                                </span>
                                                                <h3 className="text-base font-bold text-white group-hover/card:text-blue-300 transition-colors leading-snug break-words">
                                                                    {pelatihan.nama_pelatihan}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                    <span className="font-mono">STTPL:</span>
                                                                    <span className="text-blue-400/80 font-semibold">{pelatihan.no_registrasi}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: CTA Button */}
                                                        <div className="flex-shrink-0 md:ml-4">
                                                            <Link
                                                                href={`/layanan/cek-sertifikat/${encodeURIComponent(pelatihan.no_registrasi)}`}
                                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-400 text-xs font-bold hover:bg-blue-500/20 hover:border-blue-500/25 transition-all duration-200"
                                                            >
                                                                <RiVerifiedBadgeFill className="w-3.5 h-3.5" />
                                                                Lihat Detail
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>

                            {/* ===== FOOTER ===== */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-center space-y-5 pt-2"
                            >
                                <p className="text-[11px] text-gray-600 leading-relaxed max-w-lg mx-auto">
                                    Dokumen dikelola dan dijamin keasliannya oleh Balai Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara Republik Indonesia.
                                </p>
                                <Link
                                    href="/layanan/cek-sertifikat"
                                    className="group/btn inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                                >
                                    <FiArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                                    Kembali ke Pencarian
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default CekSertifikatByNIKPage;

'use client'

import React, { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { UserPelatihan } from '@/types/user';
import { addFiveYears } from '@/utils/pelatihan';
import { generateTanggalPelatihan } from '@/utils/text';
import { RiQuillPenAiLine, RiVerifiedBadgeFill, RiShieldCheckFill } from 'react-icons/ri';
import { FiUser, FiBookOpen, FiCalendar, FiFileText, FiEdit3, FiMapPin, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { PelatihanMasyarakat } from '@/types/product';
import { HiOutlineInbox } from 'react-icons/hi2';
import { FaRegBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CertificateResultPage = () => {
    const params = useParams();
    const no_sertifikat = params?.no_sertifikat;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UserPelatihan | null>(null);
    const [dataPelatihan, setDataPelatihan] = useState<PelatihanMasyarakat | null>(null);
    const [dataUser, setDataUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (!no_sertifikat || typeof no_sertifikat !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`, {
                    no_registrasi: no_sertifikat,
                });
                console.log('DATA', res);
                setDataUser(res.data.user_data);
                setData(res.data.data);
                setDataPelatihan(res.data.pelatihan);
                setError(null);
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.Pesan || 'Sertifikat tidak ditemukan dalam pangkalan data kami.');
                } else {
                    setError('Terjadi masalah saat menghubungi server. Silakan coba lagi nanti.');
                }
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [no_sertifikat]);

    console.log({ dataUser })


    const infoSections = data
        ? [
            {
                title: 'Informasi Peserta',
                items: [
                    { icon: <FiUser />, label: 'Nama Lengkap', value: data.Nama },
                ],
            },
            {
                title: 'Detail Pelatihan',
                items: [
                    { icon: <FiBookOpen />, label: 'Pelatihan', value: data.NamaPelatihan },
                    { icon: <FaRegBuilding />, label: 'Penyelenggara', value: dataPelatihan?.PenyelenggaraPelatihan },
                    { icon: <HiOutlineInbox />, label: 'Bidang/Klaster', value: dataPelatihan?.BidangPelatihan },
                    { icon: <RiQuillPenAiLine />, label: 'Program', value: dataPelatihan?.Program },
                    {
                        icon: <FiCalendar />,
                        label: 'Periode Pelaksanaan',
                        value: `${generateTanggalPelatihan(data.TanggalMulai)} - ${generateTanggalPelatihan(data.TanggalBerakhir)}`,
                    },
                    { icon: <FiMapPin />, label: 'Lokasi', value: dataPelatihan?.LokasiPelatihan },
                ],
            },
            {
                title: 'Informasi Sertifikat',
                items: [
                    { icon: <FiFileText />, label: 'Tanggal Terbit', value: data.TanggalSertifikat },
                    { icon: <FiEdit3 />, label: 'Penandatangan', value: dataPelatihan?.TtdSertifikat },
                ],
            },
        ]
        : [];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] pt-28 font-jakarta flex flex-col">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
                {/* Subtle grid pattern */}
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

            <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6 py-20">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-400 border-r-cyan-400 rounded-full animate-spin" />
                                <div className="absolute inset-2 border-4 border-t-cyan-400 border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-blue-400 font-semibold text-lg">Memverifikasi Sertifikat</p>
                                <p className="text-gray-500 text-sm animate-pulse">Menghubungkan ke Pusat Data...</p>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md w-full p-10 rounded-[2rem] bg-[#1e293b]/30 backdrop-blur-2xl border border-red-500/20 text-center shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
                                <span className="text-4xl">⚠</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 font-calsans">Validasi Gagal</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">{error}</p>
                            <Link
                                href="/layanan/cek-sertifikat"
                                className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Kembali ke Pencarian
                            </Link>
                        </motion.div>
                    ) : data ? (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="max-w-4xl w-full space-y-5"
                        >
                            {/* ===== HERO CARD: Photo + Identity ===== */}
                            <div className="relative group">
                                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-blue-500/30 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 blur-lg opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500" />

                                <div className="relative rounded-2xl bg-[#0b1120]/80 backdrop-blur-3xl border border-white/[0.08] shadow-2xl text-white overflow-hidden">
                                    {/* Top Accent Bar */}
                                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start"
                                    >
                                        {/* Photo — Rounded Rectangle */}
                                        <motion.div variants={itemVariants} className="flex-shrink-0">
                                            {dataUser?.foto && !imgError ? (
                                                <div className="relative">
                                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-30 blur-md" />
                                                    <div className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl ring-2 ring-white/15 overflow-hidden shadow-xl">
                                                        <Image
                                                            src={dataUser.foto}
                                                            alt={dataUser.nama || 'Foto Peserta'}
                                                            fill
                                                            className="object-cover"
                                                            onError={() => setImgError(true)}
                                                        />
                                                    </div>
                                                    {/* Verified badge */}
                                                    <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center ring-4 ring-[#0b1120] shadow-lg">
                                                        <FiCheck className="w-4 h-4 text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-md" />
                                                    <div className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/5 ring-2 ring-white/10 flex items-center justify-center shadow-xl">
                                                        <FiUser className="w-14 h-14 text-blue-400/40" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center ring-4 ring-[#0b1120] shadow-lg">
                                                        <FiCheck className="w-4 h-4 text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Identity Info */}
                                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-3 min-w-0">
                                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <RiShieldCheckFill className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold tracking-widest uppercase">Terverifikasi</span>
                                            </motion.div>

                                            <motion.h2
                                                variants={itemVariants}
                                                className="text-2xl sm:text-3xl font-bold font-calsans text-white leading-tight"
                                            >
                                                {data.Nama}
                                            </motion.h2>

                                            <motion.div variants={itemVariants} className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No. STTPL</p>
                                                <p className="text-base sm:text-lg font-bold font-calsans text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                                    {data.NoRegistrasi}
                                                </p>
                                            </motion.div>

                                            <motion.p
                                                variants={itemVariants}
                                                className="text-xs text-gray-500 font-light max-w-md leading-relaxed"
                                            >
                                                Sertifikat ini telah melalui proses verifikasi digital dan dinyatakan resmi dalam pangkalan data E-LAUT.
                                            </motion.p>

                                            {/* Validity Pill */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="mt-1 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-500/[0.08] border border-blue-500/15"
                                            >
                                                <RiVerifiedBadgeFill className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="text-gray-400">Berlaku hingga</span>
                                                    <span className="text-white font-semibold">{addFiveYears(data.TanggalSertifikat)}</span>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* ===== DETAIL SECTIONS ===== */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-5"
                            >
                                {infoSections.map((section, sIdx) => (
                                    <motion.div
                                        key={sIdx}
                                        variants={itemVariants}
                                        className="relative group/section"
                                    >
                                        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500" />
                                        <div className="relative rounded-2xl bg-[#0b1120]/60 backdrop-blur-2xl border border-white/[0.06] overflow-hidden">
                                            {/* Section Header */}
                                            <div className="px-6 py-3.5 border-b border-white/[0.05] flex items-center gap-3">
                                                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-400 to-cyan-500" />
                                                <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                                                    {section.title}
                                                </span>
                                            </div>

                                            {/* Items */}
                                            <div className={`grid gap-0 ${section.items.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                                {section.items.map((item, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        variants={itemVariants}
                                                        className={`flex gap-3.5 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-200 group/item ${idx < section.items.length - 1 || (section.items.length > 1 && idx % 2 === 0)
                                                            ? 'border-b border-white/[0.04] md:border-b-0 md:border-r md:border-white/[0.04]'
                                                            : ''
                                                            } ${section.items.length > 1 && idx < section.items.length - 2 ? 'md:border-b md:border-white/[0.04]' : ''} ${section.items.length > 1 && idx === section.items.length - 2 && section.items.length % 2 === 0 ? 'md:border-b md:border-white/[0.04]' : ''}`}
                                                    >
                                                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 group-hover/item:scale-105 transition-transform duration-200">
                                                            {item.icon}
                                                        </div>
                                                        <div className="flex flex-col min-w-0 justify-center">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                                                                {item.label}
                                                            </span>
                                                            <span className="text-sm text-gray-200 font-medium break-words">
                                                                {item.value || '-'}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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
                                    Pemeriksaan Selesai
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

export default CertificateResultPage;


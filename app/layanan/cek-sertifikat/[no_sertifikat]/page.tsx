'use client'

import React, { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { UserPelatihan } from '@/types/user';
import { addFiveYears } from '@/utils/pelatihan';
import { generateTanggalPelatihan } from '@/utils/text';
import { RiQuillPenAiLine, RiVerifiedBadgeFill, RiShieldCheckFill, RiFilePdfLine } from 'react-icons/ri';
import {
    FiUser,
    FiBookOpen,
    FiCalendar,
    FiFileText,
    FiEdit3,
    FiMapPin,
    FiArrowLeft,
    FiCheck,
    FiCopy,
    FiExternalLink,
    FiShare2,
    FiShield,
    FiAward
} from 'react-icons/fi';
import { useParams } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { PelatihanMasyarakat } from '@/types/product';
import { HiOutlineInbox } from 'react-icons/hi2';
import { FaRegBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { verifyPDFBSrEUrl } from '@/constants/urls';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
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
    const [copiedText, setCopiedText] = useState<string | null>(null);

    useEffect(() => {
        if (!no_sertifikat || typeof no_sertifikat !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`, {
                    no_registrasi: no_sertifikat,
                });
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

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => {
            setCopiedText(null);
        }, 2500);
    };

    const handleShareLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopiedText('Tautan Halaman');
            setTimeout(() => {
                setCopiedText(null);
            }, 2500);
        }
    };

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
                    { icon: <FiBookOpen />, label: 'Nama Pelatihan', value: data.NamaPelatihan },
                    { icon: <FaRegBuilding />, label: 'Penyelenggara', value: dataPelatihan?.PenyelenggaraPelatihan },
                    { icon: <HiOutlineInbox />, label: 'Bidang / Klaster', value: dataPelatihan?.BidangPelatihan },
                    { icon: <RiQuillPenAiLine />, label: 'Program', value: dataPelatihan?.Program },
                    {
                        icon: <FiCalendar />,
                        label: 'Periode Pelaksanaan',
                        value: `${generateTanggalPelatihan(data.TanggalMulai)} - ${generateTanggalPelatihan(data.TanggalBerakhir)}`,
                    },
                    { icon: <FiMapPin />, label: 'Lokasi Pelatihan', value: dataPelatihan?.LokasiPelatihan },
                ],
            },
            {
                title: 'Informasi Sertifikat',
                items: [
                    { icon: <FiFileText />, label: 'Tanggal Terbit', value: data.TanggalSertifikat },
                    { icon: <FiEdit3 />, label: 'Penandatangan TTDe', value: dataPelatihan?.TtdSertifikat },
                ],
            },
        ]
        : [];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] pt-24 pb-16 font-jakarta flex flex-col">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/70 to-[#020617]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Glowing animated ambient blobs */}
            <motion.div
                animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[120px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[130px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, 25, 0], y: [0, 40, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[30rem] w-[30rem] rounded-full bg-indigo-500/5 blur-[120px] z-[1]"
            />

            {/* Toast Notification */}
            <AnimatePresence>
                {copiedText && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-300/40 backdrop-blur-md"
                    >
                        <FiCheck className="w-4 h-4 text-slate-950" strokeWidth={3} />
                        <span>{copiedText} berhasil disalin!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 flex-grow flex items-start justify-center p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl w-full space-y-6">

                    {/* ===== TOP NAVIGATION BAR ===== */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                        <Link
                            href="/layanan/cek-sertifikat"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs font-semibold"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Kembali ke Pencarian
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShareLink}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-xs font-semibold"
                                title="Bagikan Tautan Verifikasi"
                            >
                                <FiShare2 className="w-3.5 h-3.5" />
                                <span>Bagikan Tautan</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            /* ===== SKELETON LOADING STATE ===== */
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6 py-6"
                            >
                                <div className="rounded-3xl bg-[#0b1120]/70 backdrop-blur-2xl border border-white/[0.08] p-6 sm:p-8 space-y-6 animate-pulse">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-36 h-44 rounded-2xl bg-white/10" />
                                        <div className="flex-1 space-y-3 text-center md:text-left w-full">
                                            <div className="h-4 w-32 bg-white/10 rounded-md mx-auto md:mx-0" />
                                            <div className="h-8 w-64 bg-white/10 rounded-lg mx-auto md:mx-0" />
                                            <div className="h-5 w-48 bg-white/10 rounded-md mx-auto md:mx-0" />
                                            <div className="h-10 w-40 bg-white/10 rounded-xl mx-auto md:mx-0" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="h-32 rounded-2xl bg-[#0b1120]/50 border border-white/[0.05] p-6 animate-pulse" />
                                    ))}
                                </div>
                            </motion.div>
                        ) : error ? (
                            /* ===== ERROR STATE ===== */
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="max-w-md mx-auto py-12"
                            >
                                <div className="relative rounded-3xl bg-[#0b1120]/80 backdrop-blur-3xl border border-rose-500/20 p-8 text-center shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
                                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-orange-500/10 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10">
                                        <HiOutlineInbox className="w-10 h-10 text-rose-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2 font-calsans">Validasi Gagal</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-8">{error}</p>
                                    <Link
                                        href="/layanan/cek-sertifikat"
                                        className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-all font-semibold"
                                    >
                                        <FiArrowLeft className="w-4 h-4" />
                                        Kembali ke Pencarian
                                    </Link>
                                </div>
                            </motion.div>
                        ) : data ? (
                            /* ===== SUCCESS RESULT STATE ===== */
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                {/* ===== HERO CARD: Photo + Identity ===== */}
                                <div className="relative group">
                                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-indigo-500/30 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 blur-xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative rounded-3xl bg-[#0b1120]/85 backdrop-blur-3xl border border-white/[0.08] shadow-2xl text-white overflow-hidden">
                                        {/* Top Accent Strip */}
                                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start"
                                        >
                                            {/* Photo — Rounded Frame */}
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
                                                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
                                                        <RiShieldCheckFill className="w-3.5 h-3.5" />
                                                        Sertifikat Sah & Terverifikasi
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
                                                        <FiShield className="w-3.5 h-3.5 text-blue-400" />
                                                        BSrE BSSN RI
                                                    </span>
                                                </motion.div>

                                                <motion.h1
                                                    variants={itemVariants}
                                                    className="text-2xl sm:text-3xl font-extrabold font-calsans text-white leading-tight"
                                                >
                                                    {data.Nama}
                                                </motion.h1>

                                                <motion.div variants={itemVariants} className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No. STTPL / Registrasi</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base sm:text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-300">
                                                            {data.NoRegistrasi}
                                                        </p>
                                                        <button
                                                            onClick={() => handleCopy(data.NoRegistrasi, 'Nomor STTPL')}
                                                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-blue-300 transition-all"
                                                            title="Salin No STTPL"
                                                        >
                                                            <FiCopy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </motion.div>

                                                <motion.p
                                                    variants={itemVariants}
                                                    className="text-xs text-gray-400 font-light max-w-md leading-relaxed"
                                                >
                                                    Sertifikat ini telah melewati validasi enkripsi digital resmi dalam pangkalan data E-LAUT BPPSDM KP.
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
                                    className="space-y-4"
                                >
                                    {infoSections.map((section, sIdx) => (
                                        <motion.div
                                            key={sIdx}
                                            variants={itemVariants}
                                            className="relative group/section"
                                        >
                                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/[0.04] to-white/[0.02] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500" />
                                            <div className="relative rounded-2xl bg-[#0b1120]/75 backdrop-blur-2xl border border-white/[0.07] overflow-hidden shadow-xl">
                                                {/* Section Header */}
                                                <div className="px-6 py-3.5 border-b border-white/[0.05] flex items-center gap-3">
                                                    <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-400 to-cyan-500" />
                                                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                                                        {section.title}
                                                    </span>
                                                </div>

                                                {/* Items Grid */}
                                                <div className={`grid gap-0 ${section.items.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                                    {section.items.map((item, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            variants={itemVariants}
                                                            className={`flex gap-3.5 px-6 py-4 hover:bg-white/[0.03] transition-colors duration-200 group/item ${
                                                                idx < section.items.length - 1 || (section.items.length > 1 && idx % 2 === 0)
                                                                    ? 'border-b border-white/[0.04] md:border-b-0 md:border-r md:border-white/[0.04]'
                                                                    : ''
                                                            } ${section.items.length > 1 && idx < section.items.length - 2 ? 'md:border-b md:border-white/[0.04]' : ''} ${
                                                                section.items.length > 1 && idx === section.items.length - 2 && section.items.length % 2 === 0
                                                                    ? 'md:border-b md:border-white/[0.04]'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 group-hover/item:scale-105 transition-transform duration-200">
                                                                {item.icon}
                                                            </div>
                                                            <div className="flex flex-col min-w-0 justify-center">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                                                                    {item.label}
                                                                </span>
                                                                <span className="text-xs sm:text-sm text-gray-200 font-semibold break-words">
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

                                {/* ===== BSRE FOOTER TRUST BOX ===== */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="pt-4 space-y-6"
                                >
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0b1120]/60 to-blue-950/40 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                <RiShieldCheckFill className="w-5 h-5" />
                                            </div>
                                            <div className="text-xs space-y-0.5">
                                                <p className="font-bold text-white">Verifikasi TTE BSrE Komdigi RI</p>
                                                <p className="text-gray-400 text-[11px]">Dapat diuji keaslian berkas digital sertifikat di portal PSrE.</p>
                                            </div>
                                        </div>

                                        <a
                                            href={verifyPDFBSrEUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition-all flex-shrink-0"
                                        >
                                            <span>Uji File PDF di PSrE</span>
                                            <FiExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>

                                    <div className="text-center pt-2">
                                        <Link
                                            href="/layanan/cek-sertifikat"
                                            className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-xs"
                                        >
                                            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-400" />
                                            Kembali ke Halaman Utama Cek Sertifikat
                                        </Link>
                                    </div>
                                </motion.div>

                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CertificateResultPage;


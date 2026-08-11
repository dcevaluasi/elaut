'use client'

import React, { useEffect, useState, useMemo } from 'react';
import axios, { isAxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiSearch,
    FiBookOpen,
    FiUser,
    FiCopy,
    FiCheck,
    FiExternalLink,
    FiX,
    FiShield,
    FiAward,
    FiLayers,
    FiRefreshCw
} from 'react-icons/fi';
import { RiVerifiedBadgeFill, RiShieldCheckFill, RiFilePdfLine } from 'react-icons/ri';
import { HiOutlineInbox } from 'react-icons/hi2';
import { elautBaseUrl, fileBaseUrl, verifyPDFBSrEUrl } from '@/constants/urls';

interface PelatihanByNik {
    nama: string;
    nik: string;
    nama_pelatihan: string;
    bidang_pelatihan: string;
    no_sertifikat: string;
    no_registrasi: string;
    file_sertifikat: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const getCategoryColor = (category: string = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('budidaya')) {
        return {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            pillBg: 'bg-emerald-500/20 text-emerald-300',
        };
    }
    if (cat.includes('kelautan') || cat.includes('pelayaran') || cat.includes('penangkapan')) {
        return {
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            text: 'text-cyan-400',
            pillBg: 'bg-cyan-500/20 text-cyan-300',
        };
    }
    if (cat.includes('pengolahan') || cat.includes('mutu') || cat.includes('pemasaran')) {
        return {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            pillBg: 'bg-amber-500/20 text-amber-300',
        };
    }
    if (cat.includes('perikanan') || cat.includes('konservasi')) {
        return {
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            text: 'text-indigo-400',
            pillBg: 'bg-indigo-500/20 text-indigo-300',
        };
    }
    return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        pillBg: 'bg-blue-500/20 text-blue-300',
    };
};

const CekSertifikatByNIKPage = () => {
    const params = useParams();
    const router = useRouter();
    const nikParam = params?.nik as string | undefined;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PelatihanByNik[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // UX States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBidang, setSelectedBidang] = useState('Semua');
    const [copiedText, setCopiedText] = useState<string | null>(null);

    // Inline search form for error state
    const [inputNik, setInputNik] = useState('');

    useEffect(() => {
        if (!nikParam || typeof nikParam !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${elautBaseUrl}/getPelatihanByNik`, {
                    nik: nikParam,
                });

                const filteredData = res.data.data?.filter(
                    (item: PelatihanByNik) => item.file_sertifikat?.includes('sertifikat-ttde')
                ) || [];

                if (filteredData.length > 0) {
                    setData(filteredData);
                    setError(null);
                } else {
                    setError('Tidak ada riwayat pelatihan dengan sertifikat elektronik (TTDe) yang ditemukan untuk NIK tersebut.');
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

    // Unique Bidang options for Filter Chips
    const bidangList = useMemo(() => {
        if (!data) return ['Semua'];
        const set = new Set<string>();
        data.forEach(item => {
            if (item.bidang_pelatihan) set.add(item.bidang_pelatihan);
        });
        return ['Semua', ...Array.from(set)];
    }, [data]);

    // Filtered data based on Search + Bidang filter
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((item) => {
            const matchesSearch =
                item.nama_pelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.bidang_pelatihan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.no_registrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.no_sertifikat && item.no_sertifikat.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesBidang = selectedBidang === 'Semua' || item.bidang_pelatihan === selectedBidang;

            return matchesSearch && matchesBidang;
        });
    }, [data, searchQuery, selectedBidang]);

    // Copy to clipboard helper
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => {
            setCopiedText(null);
        }, 2500);
    };

    // Mask NIK helper
    const getMaskedNik = (nikStr: string) => {
        if (!nikStr) return '';
        if (nikStr.length <= 8) return nikStr;
        return `${nikStr.slice(0, 4)} •••• •••• ${nikStr.slice(-4)}`;
    };

    const handleSearchNewNik = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputNik.trim();
        if (trimmed) {
            router.push(`/layanan/cek-sertifikat/nik/${encodeURIComponent(trimmed)}`);
        }
    };

    const participantName = data && data.length > 0 ? data[0].nama : '';
    const participantNik = data && data.length > 0 ? data[0].nik : nikParam || '';

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

            {/* Glowing animated background blobs */}
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[120px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[130px] z-[1]"
            />
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[30rem] w-[30rem] rounded-full bg-indigo-600/5 blur-[120px] z-[1]"
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
                <div className="max-w-5xl w-full space-y-6">

                    {/* ===== NAVIGATION BAR ===== */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                        <Link
                            href="/layanan/cek-sertifikat"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs font-semibold"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Kembali ke Pencarian
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                                <RiShieldCheckFill className="w-3.5 h-3.5" />
                                Validasi NIK E-LAUT
                            </span>
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
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-white/10" />
                                        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                                            <div className="h-4 w-32 bg-white/10 rounded-md mx-auto sm:mx-0" />
                                            <div className="h-8 w-64 bg-white/10 rounded-lg mx-auto sm:mx-0" />
                                            <div className="h-4 w-48 bg-white/10 rounded-md mx-auto sm:mx-0" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                        <div className="h-16 bg-white/[0.05] rounded-xl" />
                                        <div className="h-16 bg-white/[0.05] rounded-xl" />
                                        <div className="h-16 bg-white/[0.05] rounded-xl col-span-2 sm:col-span-1" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="h-28 rounded-2xl bg-[#0b1120]/50 border border-white/[0.05] p-6 animate-pulse flex items-center justify-between">
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 w-24 bg-white/10 rounded" />
                                                <div className="h-6 w-3/4 bg-white/10 rounded" />
                                                <div className="h-3 w-40 bg-white/10 rounded" />
                                            </div>
                                            <div className="h-10 w-28 bg-white/10 rounded-xl" />
                                        </div>
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
                                className="max-w-xl mx-auto py-10"
                            >
                                <div className="relative rounded-3xl bg-[#0b1120]/80 backdrop-blur-3xl border border-rose-500/20 p-8 sm:p-10 text-center shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500" />

                                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-orange-500/10 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/10">
                                        <HiOutlineInbox className="w-10 h-10 text-rose-400" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2 font-calsans">Data Tidak Ditemukan</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                                        {error}
                                    </p>

                                    {/* Inline Quick Search Form */}
                                    <form onSubmit={handleSearchNewNik} className="mb-6 space-y-3">
                                        <div className="relative max-w-md mx-auto">
                                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={inputNik}
                                                onChange={(e) => setInputNik(e.target.value)}
                                                placeholder="Masukkan NIK lain (16 digit)..."
                                                className="w-full h-12 pl-11 pr-24 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!inputNik.trim()}
                                                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-40 transition-all"
                                            >
                                                Cari
                                            </button>
                                        </div>
                                    </form>

                                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-center gap-3">
                                        <Link
                                            href="/layanan/cek-sertifikat"
                                            className="inline-flex h-11 px-6 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs hover:bg-white/10 transition-all font-semibold"
                                        >
                                            <FiArrowLeft className="w-4 h-4" />
                                            Kembali ke Halaman Cek Sertifikat
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ) : data && filteredData ? (
                            /* ===== SUCCESS DATA STATE ===== */
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                {/* ===== HERO PROFILE CARD ===== */}
                                <div className="relative group">
                                    {/* Border Glow Gradient */}
                                    <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/20 to-indigo-500/30 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 blur-xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative rounded-3xl bg-[#0b1120]/85 backdrop-blur-3xl border border-white/[0.08] shadow-2xl text-white overflow-hidden">
                                        {/* Top Accent Strip */}
                                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="p-6 sm:p-8 space-y-6"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                                {/* Profile Avatar Badge */}
                                                <motion.div variants={itemVariants} className="relative flex-shrink-0">
                                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 ring-2 ring-white/15 flex items-center justify-center shadow-xl">
                                                        <FiUser className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
                                                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center ring-4 ring-[#0b1120] shadow-md">
                                                            <RiVerifiedBadgeFill className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Participant Identity Information */}
                                                <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
                                                    <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
                                                            <RiVerifiedBadgeFill className="w-3.5 h-3.5" />
                                                            Riwayat Ditemukan
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium">
                                                            <FiShield className="w-3.5 h-3.5 text-blue-400" />
                                                            Terverifikasi BSrE
                                                        </span>
                                                    </motion.div>

                                                    <motion.h1 variants={itemVariants} className="text-2xl sm:text-3xl font-extrabold font-calsans tracking-tight text-white leading-tight">
                                                        {participantName}
                                                    </motion.h1>

                                                    {/* NIK Display (Permanently Masked for Privacy) */}
                                                    <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-xs">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] font-mono text-gray-300">
                                                            <span className="text-gray-500 select-none">NIK:</span>
                                                            <span className="font-semibold text-blue-300 tracking-wide">
                                                                {getMaskedNik(participantNik)}
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Summary Stats Strip */}
                                            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
                                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                        <FiAward className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Total Sertifikat</p>
                                                        <p className="text-lg font-extrabold text-white">{data.length} <span className="text-xs font-normal text-gray-400">Dokumen</span></p>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                                                        <FiLayers className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Klaster / Bidang</p>
                                                        <p className="text-lg font-extrabold text-white">{bidangList.length - 1} <span className="text-xs font-normal text-gray-400">Bidang</span></p>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] col-span-2 sm:col-span-1 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                                        <RiShieldCheckFill className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Tanda Tangan TTDe</p>
                                                        <p className="text-xs font-bold text-emerald-400">Terverifikasi BSrE</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* ===== CONTROLS: SEARCH BAR & CATEGORY CHIPS ===== */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                                        {/* Search Input */}
                                        <div className="relative w-full sm:max-w-md">
                                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Cari nama pelatihan, bidang, atau STTPL..."
                                                className="w-full h-11 pl-11 pr-9 rounded-2xl bg-[#0b1120]/80 backdrop-blur-xl border border-white/[0.08] text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all placeholder:text-gray-600"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
                                                >
                                                    <FiX className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Count Indicator */}
                                        <div className="text-xs text-gray-400 self-end sm:self-center">
                                            Menampilkan <span className="font-bold text-white">{filteredData.length}</span> dari <span className="font-bold text-white">{data.length}</span> sertifikat
                                        </div>
                                    </div>

                                    {/* Bidang Category Filter Chips */}
                                    {bidangList.length > 2 && (
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                            {bidangList.map((bidang) => {
                                                const active = selectedBidang === bidang;
                                                return (
                                                    <button
                                                        key={bidang}
                                                        onClick={() => setSelectedBidang(bidang)}
                                                        className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${active
                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                                                            : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                                                            }`}
                                                    >
                                                        {bidang}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* ===== CERTIFICATES LIST ===== */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {filteredData.length === 0 ? (
                                        /* Empty Filter Result */
                                        <motion.div
                                            variants={itemVariants}
                                            className="text-center py-14 px-4 rounded-3xl bg-[#0b1120]/40 border border-white/[0.06]"
                                        >
                                            <HiOutlineInbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-white font-bold text-base mb-1">Pelatihan Tidak Ditemukan</p>
                                            <p className="text-gray-500 text-xs mb-4">Tidak ada pelatihan yang sesuai dengan kriteria pencarian Anda.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedBidang('Semua');
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                                            >
                                                <FiRefreshCw className="w-3.5 h-3.5" />
                                                Reset Filter & Pencarian
                                            </button>
                                        </motion.div>
                                    ) : (
                                        filteredData.map((pelatihan, index) => {
                                            const categoryColors = getCategoryColor(pelatihan.bidang_pelatihan);

                                            return (
                                                <motion.div
                                                    key={index}
                                                    variants={itemVariants}
                                                    className="relative group/card"
                                                >
                                                    {/* Card Glow Layer */}
                                                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-indigo-500/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                                    <div className="relative rounded-2xl bg-[#0b1120]/75 backdrop-blur-2xl border border-white/[0.07] overflow-hidden hover:border-blue-500/30 transition-all duration-300 shadow-xl group-hover/card:shadow-2xl group-hover/card:shadow-blue-500/5">
                                                        <div className="p-5 sm:p-6">
                                                            <div className="flex flex-col lg:flex-row gap-5 lg:items-center justify-between">

                                                                {/* Left Section: Icon & Info */}
                                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${categoryColors.bg} border ${categoryColors.border} flex items-center justify-center ${categoryColors.text} shadow-inner`}>
                                                                        <FiBookOpen className="w-6 h-6" />
                                                                    </div>

                                                                    <div className="space-y-1.5 flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${categoryColors.pillBg}`}>
                                                                                {pelatihan.bidang_pelatihan}
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                                                                <RiVerifiedBadgeFill className="w-3 h-3" />
                                                                                Sertifikat Terbit
                                                                            </span>
                                                                        </div>

                                                                        <h3 className="text-base sm:text-lg font-bold text-white group-hover/card:text-blue-300 transition-colors leading-snug break-words">
                                                                            {pelatihan.nama_pelatihan}
                                                                        </h3>

                                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 pt-0.5">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-gray-500 font-medium">No. STTPL:</span>
                                                                                <span className="font-mono text-blue-300 font-semibold">{pelatihan.no_registrasi}</span>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        handleCopy(pelatihan.no_registrasi, 'STTPL');
                                                                                    }}
                                                                                    className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                                                                                    title="Salin No STTPL"
                                                                                >
                                                                                    <FiCopy className="w-3 h-3" />
                                                                                </button>
                                                                            </div>

                                                                            {pelatihan.no_sertifikat && (
                                                                                <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                                                                                    <span className="text-gray-500 font-medium">No. Sertifikat:</span>
                                                                                    <span className="font-mono text-gray-300">{pelatihan.no_sertifikat}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Right Section: Action Buttons */}
                                                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                                                                    {pelatihan.file_sertifikat && (
                                                                        <a
                                                                            href={'https://elaut-bppsdm.kkp.go.id/api-elaut' + pelatihan.file_sertifikat}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-gray-200 text-xs font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                                                            title="Buka File Sertifikat PDF"
                                                                        >
                                                                            <RiFilePdfLine className="w-4 h-4 text-rose-400" />
                                                                            <span>PDF Sertifikat</span>
                                                                        </a>
                                                                    )}

                                                                    <Link
                                                                        href={`/layanan/cek-sertifikat/${encodeURIComponent(pelatihan.no_registrasi)}`}
                                                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                                                                    >
                                                                        <RiVerifiedBadgeFill className="w-4 h-4" />
                                                                        <span>Lihat Detail</span>
                                                                    </Link>
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </motion.div>

                                {/* ===== BSRE TRUST CARD & FOOTER ===== */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="pt-6 space-y-6"
                                >
                                    {/* Institutional Verification Notice Box */}
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0b1120]/60 to-blue-950/40 border border-blue-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                                <RiShieldCheckFill className="w-5 h-5" />
                                            </div>
                                            <div className="text-xs space-y-0.5">
                                                <p className="font-bold text-white">Jaminan Keaslian Sertifikat BSrE</p>
                                                <p className="text-gray-400">Seluruh sertifikat TTDe diterbitkan secara resmi oleh BPPSDM KP & BSSN RI.</p>
                                            </div>
                                        </div>

                                        <a
                                            href={verifyPDFBSrEUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition-all flex-shrink-0"
                                        >
                                            <span>Validasi PSrE Komdigi</span>
                                            <FiExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>

                                    {/* Bottom Action */}
                                    <div className="text-center pt-2">
                                        <Link
                                            href="/layanan/cek-sertifikat"
                                            className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-xs"
                                        >
                                            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-400" />
                                            Cari Riwayat Sertifikat NIK Lain
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

export default CekSertifikatByNIKPage;


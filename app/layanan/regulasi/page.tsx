'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFileText,
    FiSearch,
    FiFilter,
    FiDownload,
    FiCalendar,
    FiInfo,
    FiBookOpen,
    FiExternalLink,
    FiArrowRight,
    FiShield,
    FiDatabase
} from 'react-icons/fi';
import Link from 'next/link';
import Footer from '@/components/ui/footer';

const DUMMY_REGULASI = [
    {
        id: 1,
        kategori_regulasi: "Peraturan Menteri",
        tanggal_pengundangan: "12 Mei 2024",
        tahun: "2024",
        no_peraturan: "18",
        judul: "Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)",
        ruang_lingkup: "Nasional",
        sumber: "Berita Negara RI Tahun 2024 Nomor 245",
        status: "Berlaku",
        perubahan_turunan_terkait: "Mencabut Peraturan Menteri No. 42 Tahun 2016",
        file: "#"
    },
    {
        id: 2,
        kategori_regulasi: "Keputusan Menteri",
        tanggal_pengundangan: "05 Januari 2024",
        tahun: "2024",
        no_peraturan: "102/KEPMEN-KP/2024",
        judul: "Standar Pelatihan Teknis Budidaya Ikan Berkelanjutan",
        ruang_lingkup: "Lembaga Pelatihan",
        sumber: "Sekretariat Jenderal KKP",
        status: "Berlaku",
        perubahan_turunan_terkait: "-",
        file: "#"
    },
    {
        id: 3,
        kategori_regulasi: "Peraturan Pemerintah",
        tanggal_pengundangan: "21 September 2023",
        tahun: "2023",
        no_peraturan: "85",
        judul: "Jenis dan Tarif Atas Jenis Penerimaan Negara Bukan Pajak yang Berlaku Pada Kementerian Kelautan dan Perikanan",
        ruang_lingkup: "Publik & PNBP",
        sumber: "Lembaran Negara RI Tahun 2023 Nomor 188",
        status: "Berlaku",
        perubahan_turunan_terkait: "Perubahan atas PP No. 75 Tahun 2015",
        file: "#"
    },
    {
        id: 4,
        kategori_regulasi: "Peraturan Kepala Badan",
        tanggal_pengundangan: "14 Maret 2023",
        tahun: "2023",
        no_peraturan: "08/PER-BPPSDMKP/2023",
        judul: "Pedoman Penyelenggaraan Pelatihan Jarak Jauh (E-Learning) Sektor Kelautan dan Perikanan",
        ruang_lingkup: "Internal & Terpadu",
        sumber: "Berita BPPSDM KP",
        status: "Berlaku",
        perubahan_turunan_terkait: "-",
        file: "#"
    },
    {
        id: 5,
        kategori_regulasi: "Undang-Undang",
        tanggal_pengundangan: "02 November 2020",
        tahun: "2020",
        no_peraturan: "11",
        judul: "Cipta Kerja (Sektor Kelautan dan Perikanan)",
        ruang_lingkup: "Nasional",
        sumber: "Lembaran Negara RI Tahun 2020 Nomor 245",
        status: "Berlaku",
        perubahan_turunan_terkait: "Perubahan beberapa pasal dalam UU No. 31/2004 & UU No. 45/2009",
        file: "#"
    }
];

export default function RegulasiPelatihanPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('Semua');

    const categories = ['Semua', ...new Set(DUMMY_REGULASI.map(r => r.kategori_regulasi))];

    const filteredRegulasi = DUMMY_REGULASI.filter(reg => {
        const matchesSearch = reg.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.no_peraturan.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || reg.kategori_regulasi === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header Section */}
                    <div className="text-center space-y-6 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase"
                        >
                            <FiDatabase className="animate-pulse" /> Repository Hukum & Regulasi
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-calsans leading-tight tracking-tight"
                        >
                            Regulasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-300">Pelatihan</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg md:text-xl font-light leading-relaxed"
                        >
                            Pusat informasi peraturan, kebijakan, dan landasan hukum penyelenggaraan pelatihan di lingkungan Kementerian Kelautan dan Perikanan.
                        </motion.p>
                    </div>

                    {/* Search & Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="sticky top-24 z-40"
                    >
                        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari judul peraturan atau nomor..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all font-inter"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative group">
                                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <select
                                        className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-10 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer font-inter min-w-[200px]"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Regulation Cards Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredRegulasi.map((reg, index) => (
                                <motion.div
                                    layout
                                    key={reg.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                    <div className="relative bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 md:p-8 hover:bg-white/[0.04] transition-all duration-300">

                                        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">

                                            <div className="space-y-4 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                        {reg.kategori_regulasi}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium font-inter">
                                                        <FiCalendar /> {reg.tanggal_pengundangan}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${reg.status === 'Berlaku' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                                        }`}>
                                                        {reg.status}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                                                    {reg.judul}
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-inter">
                                                    <div className="space-y-1">
                                                        <p className="text-gray-500 uppercase tracking-tighter">Nomor Peraturan</p>
                                                        <p className="text-gray-200 font-semibold">{reg.no_peraturan} Tahun {reg.tahun}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-500 uppercase tracking-tighter">Ruang Lingkup</p>
                                                        <p className="text-gray-200 font-semibold">{reg.ruang_lingkup}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-gray-500 uppercase tracking-tighter">Sumber</p>
                                                        <p className="text-gray-200 font-semibold truncate max-w-[200px]" title={reg.sumber}>{reg.sumber}</p>
                                                    </div>
                                                </div>

                                                {reg.perubahan_turunan_terkait !== '-' && (
                                                    <div className="flex items-start gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 mt-4">
                                                        <FiInfo className="text-blue-400 mt-0.5 shrink-0" />
                                                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                                            <span className="font-bold text-gray-300 not-italic">Info Terkait:</span> {reg.perubahan_turunan_terkait}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex md:flex-col gap-3 shrink-0">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
                                                >
                                                    <FiDownload /> DOWNLOAD PDF
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs border border-white/10 transition-all"
                                                >
                                                    <FiExternalLink /> DETAIL
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredRegulasi.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 space-y-4"
                            >
                                <div className="inline-flex p-6 bg-white/5 rounded-full border border-white/10">
                                    <FiFileText size={48} className="text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400">Tidak ada regulasi ditemukan</h3>
                                <p className="text-gray-600 max-w-xs mx-auto">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Security Notice */}
                    <div className="flex justify-center pt-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <FiShield className="text-emerald-500 animate-pulse" size={16} />
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Verified Legal Information Resource &copy; BPPSDM KP 2024</p>
                        </motion.div>
                    </div>

                </div>
            </main>
            <Footer />
        </section>
    );
}

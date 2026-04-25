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
    FiExternalLink,
    FiShield,
    FiDatabase,
    FiLoader
} from 'react-icons/fi';
import Footer from '@/components/ui/footer';
import { getRegulasi, RegulasiData } from '@/utils/regulasi';

const categories = ['Semua', 'Undang-Undang', 'Peraturan Pemerintah', 'Peraturan Menteri', 'Keputusan Menteri', 'Peraturan Kepala Badan', 'Keputusan Kepala Badan', 'Peraturan Kepala Pusat', 'Keputusan Kepala Pusat', 'Edaran'];

const getFileUrl = (fileName: string) => {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
    return `https://elaut-bppsdm.kkp.go.id/api-elaut/public/regulasi_pelatihan/${fileName}`;
};

const SkeletonCard = () => (
    <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="space-y-4 flex-1 w-full">
                <div className="flex gap-3">
                    <div className="h-6 w-36 bg-white/10 rounded-full" />
                    <div className="h-6 w-24 bg-white/5 rounded-full" />
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                </div>
                <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-white/5 rounded-xl" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                    <div className="h-10 bg-white/5 rounded-xl" />
                </div>
            </div>
            <div className="flex md:flex-col gap-3 shrink-0">
                <div className="h-11 w-36 bg-white/10 rounded-2xl" />
                <div className="h-11 w-36 bg-white/5 rounded-2xl" />
            </div>
        </div>
    </div>
);

export default function RegulasiPelatihanPage() {
    const [regulasiList, setRegulasiList] = React.useState<RegulasiData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('Semua');

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getRegulasi();
                setRegulasiList(data);
            } catch (err) {
                setError('Gagal memuat data regulasi. Silakan coba lagi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRegulasi = regulasiList.filter(reg => {
        const matchesSearch =
            reg.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.no_peraturan.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || reg.kategori_regulasi === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-6 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase"
                        >
                            <FiDatabase className="animate-pulse" /> Repository Hukum &amp; Regulasi
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

                        {/* Stats */}
                        {!loading && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-center gap-8"
                            >
                                <div className="text-center">
                                    <p className="text-3xl font-black text-blue-400">{regulasiList.length}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total Regulasi</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-emerald-400">{regulasiList.filter(r => r.status === 'Berlaku').length}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Masih Berlaku</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-400">{filteredRegulasi.length}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Hasil Filter</p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Search & Filter */}
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

                    {/* Content */}
                    <div className="grid grid-cols-1 gap-6">

                        {/* Loading Skeletons */}
                        {loading && (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {/* Error State */}
                        {!loading && error && (
                            <div className="text-center py-20 space-y-4">
                                <div className="inline-flex p-6 bg-rose-500/10 rounded-full border border-rose-500/20">
                                    <FiFileText size={48} className="text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400">{error}</h3>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        )}

                        {/* Cards */}
                        {!loading && !error && (
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
                                                        {reg.tanggal_pengundangan && (
                                                            <span className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium font-inter">
                                                                <FiCalendar /> {reg.tanggal_pengundangan}
                                                            </span>
                                                        )}
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${reg.status === 'Berlaku'
                                                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                                : reg.status === 'Dicabut'
                                                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                                                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                                            }`}>
                                                            {reg.status || 'Berlaku'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                                                        {reg.judul}
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-inter">
                                                        <div className="space-y-1">
                                                            <p className="text-gray-500 uppercase tracking-tighter">Nomor Peraturan</p>
                                                            <p className="text-gray-200 font-semibold">{reg.no_peraturan} {reg.tahun ? `Tahun ${reg.tahun}` : ''}</p>
                                                        </div>
                                                        {reg.ruang_lingkup && (
                                                            <div className="space-y-1">
                                                                <p className="text-gray-500 uppercase tracking-tighter">Ruang Lingkup</p>
                                                                <p className="text-gray-200 font-semibold">{reg.ruang_lingkup}</p>
                                                            </div>
                                                        )}
                                                        {reg.sumber && (
                                                            <div className="space-y-1">
                                                                <p className="text-gray-500 uppercase tracking-tighter">Sumber</p>
                                                                <p className="text-gray-200 font-semibold truncate max-w-[200px]" title={reg.sumber}>{reg.sumber}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {reg.perubahan_turunan_terkait && reg.perubahan_turunan_terkait !== '-' && (
                                                        <div className="flex items-start gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 mt-4">
                                                            <FiInfo className="text-blue-400 mt-0.5 shrink-0" />
                                                            <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                                                <span className="font-bold text-gray-300 not-italic">Info Terkait:</span> {reg.perubahan_turunan_terkait}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex md:flex-col gap-3 shrink-0">
                                                    {reg.file ? (
                                                        <a
                                                            href={getFileUrl(reg.file)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
                                                        >
                                                            <FiDownload /> DOWNLOAD
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-600 rounded-2xl font-bold text-xs cursor-not-allowed border border-white/5">
                                                            <FiDownload /> TIDAK TERSEDIA
                                                        </span>
                                                    )}
                                                    {reg.file && (
                                                        <a
                                                            href={getFileUrl(reg.file)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs border border-white/10 transition-all"
                                                        >
                                                            <FiExternalLink /> LIHAT DOKUMEN
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredRegulasi.length === 0 && (
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

                    {/* Footer Notice */}
                    <div className="flex justify-center pt-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <FiShield className="text-emerald-500 animate-pulse" size={16} />
                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Verified Legal Information Resource &copy; BPPSDM KP 2026</p>
                        </motion.div>
                    </div>

                </div>
            </main>
            <Footer />
        </section>
    );
}

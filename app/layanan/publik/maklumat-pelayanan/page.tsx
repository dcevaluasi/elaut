'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllMaklumatPelayanan } from '@/utils/feedback';
import { getDirectImageUrl } from '@/utils/imageHelper';
import Footer from '@/components/ui/footer';
import Image from 'next/image';
import { FiFileText, FiCalendar, FiShield, FiInfo, FiExternalLink } from 'react-icons/fi';
import { HashLoader } from 'react-spinners';

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
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <FiShield size={14} /> Service Commitment
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-calsans tracking-tight leading-none"
                        >
                            Maklumat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Pelayanan</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                        >
                            E-LAUT berkomitmen untuk memberikan pelayanan publik yang transparan, profesional, dan berintegritas sesuai dengan standar yang ditetapkan.
                        </motion.p>
                    </div>

                    {/* Content Section */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <HashLoader color="#3b82f6" size={50} />
                                <p className="mt-6 text-gray-500 text-xs font-bold uppercase tracking-widest">Memuat Maklumat...</p>
                            </motion.div>
                        ) : maklumat ? (
                            <motion.div
                                key="content"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-8"
                            >
                                {/* Main Image/Content Card */}
                                <motion.div variants={itemVariants} className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                                    <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />

                                    {/* Image Display */}
                                    <div className="relative w-full h-[400px] md:h-[600px] lg:h-[800px] flex items-center justify-center p-4 md:p-8">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/20 transition-all duration-700">
                                            <Image
                                                src={getDirectImageUrl(maklumat.imageUrl)}
                                                alt={maklumat.title}
                                                fill
                                                className="object-contain p-2 md:p-4 transition-transform duration-700 group-hover:scale-105"
                                                priority
                                            />
                                            {/* Ambient Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-40" />
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="p-8 md:p-12 bg-white/5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                                                <FiCalendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Terakhir Diperbarui</p>
                                                <p className="text-sm font-medium text-white">Standar Pelayanan Publik 2024</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400">
                                                <FiInfo className="text-blue-400" /> Versi Digital
                                            </div>
                                            <a
                                                href={getDirectImageUrl(maklumat.imageUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                            >
                                                Detail <FiExternalLink />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center">
                                    <p className="text-sm text-gray-500 leading-relaxed font-light italic">
                                        "Seluruh aparatur E-LAUT berjanji dan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan dan apabila tidak menepati janji, kami siap menerima sanksi sesuai perundang-undangan yang berlaku."
                                    </p>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white/5 rounded-[2.5rem] border border-white/5"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600 border border-white/10">
                                    <FiFileText size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-calsans text-white">Belum Ada Maklumat</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">Komitmen pelayanan resmi akan segera dipublikasikan di halaman ini.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </section>
    );
}

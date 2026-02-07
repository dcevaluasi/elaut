'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiArrowLeft, FiCompass, FiAnchor, FiSearch } from 'react-icons/fi';

export default function NotFound() {
    return (
        <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/images/hero-img6.jpg"
                        alt="Ocean Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* Animated Blobs */}
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -60, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/15 blur-[150px]"
                />
            </div>

            <main className="relative z-10 w-full max-w-2xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-3"
                >
                    {/* Visual Element */}
                    <div className="relative inline-block">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[12rem] md:text-[18rem] font-calsans leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent select-none"
                        >
                            404
                        </motion.div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="p-8 md:p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl relative"
                            >
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                                <FiCompass className="w-20 h-20 md:w-28 md:h-28 text-blue-400 relative z-10" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-3xl md:text-5xl font-calsans text-white tracking-tight"
                        >
                            Kehilangan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 italic">Koordinat</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-gray-400 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed"
                        >
                            Halaman yang Anda cari telah berlayar ke tempat lain atau koordinat yang dimasukkan tidak ditemukan di dalam sistem radar kami.
                        </motion.p>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                    >
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold tracking-widest shadow-2xl shadow-blue-500/20 transition-all border-none"
                            >
                                <FiHome className="text-xl" /> KEMBALI KE BERANDA
                            </motion.button>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold tracking-widest transition-all"
                        >
                            <FiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" /> SEBELUMNYA
                        </button>
                    </motion.div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="pt-12 flex items-center justify-center gap-3 text-gray-500"
                    >
                        <FiAnchor size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase">E-LAUT Navigation System</span>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

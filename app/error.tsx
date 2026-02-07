'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiRotateCw, FiWifiOff, FiAnchor, FiAlertTriangle } from 'react-icons/fi';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="fixed inset-0 z-[999999] font-jakarta overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0 text-white">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/images/hero-img6.jpg"
                        alt="Ocean Background"
                        fill
                        className="object-cover grayscale contrast-125"
                        priority
                    />
                </motion.div>

                {/* Animated Error Blobs */}
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-24 -right-24 h-[40rem] w-[40rem] rounded-full bg-rose-600/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 60, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-48 -left-48 h-[45rem] w-[45rem] rounded-full bg-blue-600/10 blur-[150px]"
                />
            </div>

            <main className="relative z-10 w-full max-w-2xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-4"
                >
                    {/* Visual Element */}
                    <div className="relative inline-block mb-4">
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[12rem] md:text-[18rem] font-calsans leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent select-none"
                        >
                            502
                        </motion.div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="p-8 md:p-12 bg-white/5 backdrop-blur-3xl border border-rose-500/20 rounded-full shadow-2xl relative"
                            >
                                <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl animate-pulse" />
                                <FiWifiOff className="w-20 h-20 md:w-28 md:h-28 text-rose-400 relative z-10" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-2 mb-2"
                        >
                            <span className="h-px w-8 bg-rose-500/50" />
                            <span className="text-rose-400 text-xs font-bold tracking-[0.3em] uppercase">Gateway Interruption</span>
                            <span className="h-px w-8 bg-rose-500/50" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="text-3xl md:text-5xl font-calsans text-white tracking-tight"
                        >
                            Sinyal <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 italic">Terputus</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-gray-400 text-lg md:text-xl font-light max-w-lg mx-auto leading-relaxed"
                        >
                            Terdapat gangguan pada jalur komunikasi server. Sinyal kami tidak dapat menjangkau dermaga tujuan saat ini.
                        </motion.p>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => reset()}
                            className="group flex items-center gap-3 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold tracking-widest shadow-2xl shadow-rose-500/20 transition-all border-none"
                        >
                            <FiRotateCw className="text-xl group-hover:rotate-180 transition-transform duration-500" /> COBA HUBUNGKAN KEMBALI
                        </motion.button>

                        <Link href="/">
                            <button
                                className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold tracking-widest transition-all"
                            >
                                <FiHome className="text-xl" /> BERANDA
                            </button>
                        </Link>
                    </motion.div>

                    {/* Technical Info (Collapsible / Subtle) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1.5 }}
                        className="pt-12 text-gray-500 group cursor-default"
                    >
                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-tighter hover:text-gray-400 transition-colors">
                            <FiAlertTriangle className="text-rose-500/50" />
                            <span>CODE: 502_BAD_GATEWAY</span>
                            <span className="mx-2">|</span>
                            <span>{new Date().toISOString()}</span>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

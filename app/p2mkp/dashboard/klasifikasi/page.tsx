'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTool, FiArrowLeft, FiClock, FiSettings } from 'react-icons/fi';
import Link from 'next/link';
import DashboardLayout from '../DashboardLayout';

export default function KlasifikasiPage() {
    return (
        <DashboardLayout>
            <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl w-full text-center space-y-8"
                >
                    {/* Visual Element */}
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-blue-50 flex items-center justify-center text-blue-600 relative z-10 border border-blue-100 shadow-xl shadow-blue-500/10">
                            <FiTool size={48} className="animate-bounce" />
                        </div>
                        <div className="absolute inset-0 bg-blue-400/20 rounded-[2.5rem] blur-2xl -z-10 animate-pulse" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-lg"
                        >
                            <FiSettings size={20} />
                        </motion.div>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-none">
                            Module <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Under Development</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium leading-none max-w-lg mx-auto italic">
                            Modul klasifikasi P2MKP sedang dalam tahap finalisasi teknis. Fitur ini akan segera tersedia untuk membantu Anda melakukan upgrade status lembaga.
                        </p>
                    </div>

                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                        <div className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center gap-4 text-left shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <FiClock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Release</p>
                                <p className="text-sm font-bold text-slate-700">Q2 2026</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-white border border-slate-200 flex items-center gap-4 text-left shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <FiTool size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                <p className="text-sm font-bold text-emerald-600">Alpha Testing</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <Link href="/p2mkp/dashboard/penetapan">
                            <button className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-widest transition-all flex items-center gap-3 mx-auto shadow-xl shadow-slate-900/10 active:scale-95">
                                <FiArrowLeft size={20} /> BACK TO PENETAPAN
                            </button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

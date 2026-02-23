'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAward } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardLayout from './DashboardLayout';

export default function P2MKPDashboardPage() {
    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-12 pb-20"
            >
                {/* Elite Welcome Hero */}
                <div className="relative group rounded-[3rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="absolute top-0 right-0 p-24 bg-white/20 rounded-full blur-[120px] -mr-32 -mt-32" />

                    <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="space-y-6 flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                <FiActivity size={14} /> System Verified
                            </div>
                            <h2 className="text-4xl md:text-6xl font-calsans text-white leading-tight">
                                Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-200">Admin P2MKP!</span> 👋
                            </h2>
                            <p className="text-blue-100/80 text-base md:text-lg font-light leading-relaxed max-w-xl">
                                Pantau progress operasional dan manage standarisasi pelatihan mandiri Anda secara real-time.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                    <Button className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 rounded-2xl font-black tracking-widest shadow-xl shadow-black/20 text-xs">
                                        AJUKAN PENETAPAN <FiAward className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block relative shrink-0">
                            <div className="w-64 h-64 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-2xl flex items-center justify-center p-8 active:scale-95 transition-transform duration-500">
                                <FiActivity className="text-9xl text-white/20" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 px-4 py-2 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase">Live Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}

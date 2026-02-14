"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Globe2, ShieldCheck, Users2, Star, Award, Anchor } from "lucide-react";

export default function AboutElautSection() {
    const features = [
        {
            icon: <Globe2 className="w-6 h-6 text-blue-400" />,
            title: "Akses Terpadu",
            description: "Satu pintu untuk semua layanan pelatihan kelautan dan perikanan di Indonesia.",
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
            title: "Sertifikasi Resmi",
            description: "Setiap lulusan mendapatkan sertifikat kolektif yang diakui oleh regulator.",
        },
        {
            icon: <Users2 className="w-6 h-6 text-indigo-400" />,
            title: "Pengajar Ahli",
            description: "Belajar langsung dari praktisi dan instruktur tersertifikasi nasional.",
        },
        {
            icon: <Anchor className="w-6 h-6 text-teal-400" />,
            title: "Standar Industri",
            description: "Kurikulum yang adaptif terhadap kebutuhan industri maritim global.",
        },
    ];

    const stats = [
        { label: "Balai Pelatihan", value: "15+", icon: <Award className="w-5 h-5" /> },
        { label: "Program Aktif", value: "120+", icon: <Star className="w-5 h-5" /> },
        { label: "Alumni Sukses", value: "50K+", icon: <Users2 className="w-5 h-5" /> },
    ];

    return (
        <section className="relative py-24 px-6 md:px-12 bg-[#020617] overflow-hidden font-jakarta">
            {/* Animated Decorative Blobs from Hero Style */}
            <motion.div
                animate={{
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute top-1/2 -right-24 h-[30rem] w-[30rem] rounded-full bg-blue-600/10 blur-[100px] z-1"
            />
            <motion.div
                animate={{
                    x: [0, 40, 0],
                    y: [0, -60, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-cyan-500/10 blur-[130px] z-1"
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Column: Visual Showcase */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Main Image Card with Glassmorphic Border */}
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-[8px] border-white/5 bg-white/5 backdrop-blur-sm aspect-[4/3] group">
                            <Image
                                src="/images/hero-img3.jpg"
                                alt="Pelatihan Kelautan E-LAUT"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60"
                            />
                            {/* Inner Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </div>

                        {/* Floating Experience Badge - Hero Style Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="absolute -bottom-10 -right-6 md:bottom-12 md:-right-12 z-20 bg-[#1e293b]/40 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 flex flex-col items-center gap-2 shadow-2xl shadow-blue-500/10"
                        >
                            <div className="text-4xl font-black text-blue-400 leading-none drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">20+</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center">Tahun Dedikasi<br />Pelatihan Maritim</div>
                        </motion.div>

                        {/* Decorative Circle Elements */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full animate-pulse-slow" />
                    </motion.div>

                    {/* Right Column: Content Strategy */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col space-y-10"
                    >
                        {/* Section Tagline */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs uppercase tracking-widest border border-blue-500/20 shadow-sm"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Mengenal E-LAUT
                            </motion.div>

                            <h2 className="text-4xl md:text-6xl font-bold font-calsans text-white leading-[1.1] tracking-tight">
                                Membangun Kompetensi <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                                    Maritim Indonesia
                                </span>
                            </h2>

                            <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
                                E-LAUT hadir sebagai solusi digital komprehensif dari <span className="font-semibold text-blue-400">BPPSDM KP</span> untuk memfasilitasi akses pelatihan berstandardisasi. Kami berkomitmen mentransformasi sektor perikanan melalui tenaga kerja yang kompeten dan adaptif.
                            </p>
                        </div>

                        {/* Core Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                    className="flex flex-col gap-4 group"
                                >
                                    <div className="w-14 h-14 bg-[#1e293b]/20 backdrop-blur-xl shadow-lg border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e293b]/40 transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg mb-1 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats Summary Bar - Hero Style Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="p-8 bg-[#1e293b]/20 backdrop-blur-2xl rounded-[2rem] border border-white/5 grid grid-cols-3 gap-8 shadow-2xl"
                        >
                            {stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center gap-1">
                                    <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

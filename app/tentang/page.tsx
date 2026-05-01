"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiBookOpen, FiAward, FiVideo, FiUsers, FiTrendingUp, FiShield, FiArrowLeft, FiActivity, FiGlobe, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Logo from "@/components/ui/logo";

const features = [
  {
    icon: <FiBookOpen className="w-8 h-8 text-blue-400" />,
    title: "Pelatihan Terstandarisasi",
    description: "Modul pelatihan kelautan dan perikanan yang terstruktur dan disusun oleh para ahli untuk memastikan standar kompetensi nasional terpenuhi di setiap tingkat pembelajaran.",
    color: "from-blue-600 to-indigo-600",
    colSpan: "lg:col-span-2",
  },
  {
    icon: <FiAward className="w-8 h-8 text-cyan-400" />,
    title: "Sertifikat Resmi",
    description: "Program sertifikasi yang diakui secara nasional, termasuk sertifikasi Awak Kapal.",
    color: "from-cyan-600 to-teal-600",
    colSpan: "lg:col-span-1",
  },
  {
    icon: <FiShield className="w-8 h-8 text-rose-400" />,
    title: "E-Learning Terpadu",
    description: "Platform belajar fleksibel yang memungkinkan peserta mengakses materi kapan saja.",
    color: "from-rose-600 to-red-600",
    colSpan: "lg:col-span-1",
  },
  {
    icon: <FiTrendingUp className="w-8 h-8 text-emerald-400" />,
    title: "Program Khusus Ekstensif",
    description: "Inisiatif unggulan seperti Diklat Khusus Budi Daya Udang Terintegrasi untuk mendorong pertumbuhan ekonomi sektor kelautan secara masif.",
    color: "from-emerald-600 to-green-600",
    colSpan: "lg:col-span-2",
  },
  {
    icon: <FiUsers className="w-8 h-8 text-amber-400" />,
    title: "Kemitraan P2MKP",
    description: "Wadah bagi lembaga usaha untuk berkontribusi meningkatkan sektor usaha dan SDM.",
    color: "from-amber-600 to-orange-600",
    colSpan: "lg:col-span-2",
  },
  {
    icon: <FiVideo className="w-8 h-8 text-purple-400" />,
    title: "Galeri Video",
    description: "Akses gratis ke ratusan video panduan mutakhir.",
    color: "from-purple-600 to-pink-600",
    colSpan: "lg:col-span-1",
  },
];

export default function TentangPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="min-h-screen bg-[#020617] font-jakarta selection:bg-blue-500/30 overflow-hidden relative">
      {/* Immersive Background System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
        </motion.div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">

        {/* Hero Section - Layered Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-5 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Platform E-Learning Resmi KKP
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-calsans leading-[1] tracking-tight drop-shadow-2xl">
              <span className="text-white">MEMBANGUN</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                SDM UNGGUL
              </span> <br />
              <span className="text-gray-300">SEKTOR KELAUTAN DAN PERIKANAN</span>
            </h1>

            <p className="text-gray-400 text-xs md:text-sm max-w-xl leading-relaxed font-light">
              <strong className="text-white font-medium">E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu)</strong> adalah inovasi digital BPPSDM KP untuk mencetak tenaga kerja terampil, profesional, dan berdaya saing global melalui akses pelatihan maritim yang merata tanpa batas.
            </p>
          </motion.div>

          {/* Collage Imagery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="lg:col-span-6 relative h-[500px] lg:h-[600px] w-full"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full blur-[100px] opacity-20 animate-pulse" />

            {/* Main Image */}
            <motion.div
              whileHover={{ y: -10, rotate: -2 }}
              className="absolute top-0 right-0 w-[80%] h-[70%] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-20 bg-[#1e293b]"
            >
              <Image src="/images/hero-img6.jpg" alt="Budidaya" fill className="object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl text-white"><FiCheckCircle size={20} /></div>

                </div>
              </div>
            </motion.div>

            {/* Secondary Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="absolute bottom-10 left-0 w-[50%] h-[45%] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-30 bg-[#1e293b]"
            >
              <Image src="/images/hero-img10.jpg" alt="Kapal" fill className="object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4">

              </div>
            </motion.div>

            {/* Abstract Floating Element */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-xl opacity-40 z-10"
            />
          </motion.div>
        </div>

        {/* Bento Box Features Section */}
        <div className="space-y-16 pb-32">
          <div className="text-center space-y-2 mb-8 px-4 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest mb-4"
            >
              Fitur Utama
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl lg:text-4xl font-calsans leading-tight text-white"
            >
              Ekosistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Terpadu</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed mt-4"
            >
              Dirancang untuk memberikan kemudahan akses, transparansi data, dan pengalaman belajar interaktif bagi seluruh insan maritim di Indonesia.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className={`group relative ${feature.colSpan}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-3xl blur-2xl" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />

                <div className={`relative h-full flex flex-col p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-500 overflow-hidden`}>
                  {/* Decorative mesh gradient */}
                  <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-gradient-to-tl ${feature.color} group-hover:opacity-50 transition-opacity duration-700`} />

                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 relative z-10 tracking-wide group-hover:text-blue-400 transition-colors uppercase">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed mt-auto relative z-10 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium CTA Section */}
        <div className="py-16 px-4 relative overflow-hidden mb-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] z-0" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto px-4 text-center space-y-2 relative z-10"
          >
            <h2 className="text-2xl md:text-4xl font-calsans leading-tight text-white">
              SIAP UNTUK MENINGKATKAN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">KOMPETENSI ANDA?</span>
            </h2>

            <p className="text-gray-400 text-xs md:text-sm font-light max-w-lg mx-auto">
              Jadilah bagian dari ribuan insan maritim yang telah merasakan manfaat nyata E-LAUT. Transformasi karir Anda dimulai dari sini.
            </p>

            <div className="pt-6 w-full flex items-center justify-center">
              <Link href="/">
                <button className="bg-blue-600 px-8 py-3 rounded-xl text-xs font-bold tracking-wider gap-2 transition-all hover:bg-blue-500 hover:scale-105 shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform shadow-lg flex items-center">
                  JELAJAHI PLATFORM
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform ml-2" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward,
  FiDownload,
  FiExternalLink,
  FiSearch,
  FiCalendar,
  FiBookOpen,
  FiFileText
} from "react-icons/fi";
import { User } from "@/types/user";
import { PelatihanMasyarakat } from "@/types/product";
import { generateTanggalPelatihan } from "@/utils/text";
import { truncateText } from "@/utils";
import axios, { AxiosResponse } from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Cookies from "js-cookie";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export default function UserCertificateService({
  user,
}: {
  user: User | null;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter only pelatihan that have a certificate number
  const certificates = user?.Pelatihan?.filter(p => p.NoSertifikat && p.NoSertifikat !== "") || [];

  const filteredCertificates = certificates.filter(cert =>
    cert.NamaPelatihan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.NoSertifikat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="w-full space-y-12">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-cyan-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">Credentials</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-calsans tracking-tight leading-none text-white">
            Koleksi <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">E-Sertifikat</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl font-light">
            Daftar sertifikat resmi yang telah Anda raih melalui berbagai program pelatihan di platform E-LAUT.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Raih</p>
            <p className="text-3xl font-calsans text-white">{certificates.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <FiAward size={24} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari pelatihan atau nomor sertifikat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-[#020617]/40 backdrop-blur-xl border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all shadow-2xl"
        />
      </div>

      {/* Certificates Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </motion.div>
        ) : filteredCertificates.length > 0 ? (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCertificates.map((cert, index) => (
              <CertificateCard key={index} cert={cert} index={index} variants={itemVariants} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/5 rounded-[2.5rem] border border-white/5"
          >
            <div className="p-6 bg-white/5 rounded-3xl text-gray-600">
              <FiFileText size={48} />
            </div>
            <div>
              <h3 className="text-xl font-calsans text-white">Belum Ada Sertifikat</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Selesaikan pelatihan yang Anda ikuti untuk mendapatkan sertifikat resmi digital di sini.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CertificateCard = ({ cert, index, variants }: { cert: any, index: number, variants: any }) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -8 }}
      className="group relative h-full bg-[#020617]/20 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl transition-all hover:border-cyan-500/30"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/10 transition-colors" />

      {/* Upper Content */}
      <div className="p-8 flex-1">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
            <FiAward size={24} />
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <RiVerifiedBadgeFill /> Issued
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-calsans text-white leading-tight group-hover:text-cyan-400 transition-colors">
              {cert.NamaPelatihan}
            </h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              {cert.BidangPelatihan}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiCalendar className="text-cyan-500" />
              <span>Selesai: {generateTanggalPelatihan(cert.TanggalAkhirPelatihan || cert.TanggalExpiredSertifikat)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiBookOpen className="text-cyan-500" />
              <span>No: {cert.NoSertifikat}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-white/5 border-t border-white/10 flex items-center gap-3">
        <a
          href={`https://elaut-bppsdm.kkp.go.id/api-elaut/public/static/sertifikat-ttde/${cert.FileSertifikat}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          <FiDownload /> Unduh Sertifikat
        </a>
        <a
          href={`/certificate/verify/${cert.NoSertifikat}`}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all shadow-inner"
          title="Lihat Detail Verifikasi"
        >
          <FiExternalLink />
        </a>
      </div>
    </motion.div>
  );
};

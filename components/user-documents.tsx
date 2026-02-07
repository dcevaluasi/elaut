"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiGlobeAmericas,
  HiOutlineCake,
} from "react-icons/hi2";
import {
  FiEdit3,
  FiMapPin,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiBriefcase,
  FiBookOpen,
  FiUser,
  FiHash,
  FiFileText,
  FiFilePlus,
  FiCheckCircle,
  FiExternalLink
} from "react-icons/fi";
import { User } from "@/types/user";
import { RiHeart3Line } from "react-icons/ri";
import {
  MdAlternateEmail,
  MdOutlineWoman,
  MdOutlineWorkOutline,
} from "react-icons/md";
import { PiHandsPrayingBold, PiTrainRegional } from "react-icons/pi";
import { TbFlag, TbGenderBigender, TbNumber, TbPhone, TbSchool } from "react-icons/tb";
import { BiDonateBlood } from "react-icons/bi";
import { capitalize } from "@/utils/text";
import { truncateText } from "@/utils";

export default function UserDocuments({ user }: { user: User | null }) {
  const documentTabs = [
    {
      id: 1,
      name: "Pas Foto",
      image: "/illustrations/pas-foto.png",
      link: user?.Foto,
      available: user?.Foto && !user.Foto.endsWith("/"),
    },
    {
      id: 2,
      name: "Kartu Keluarga",
      image: "/illustrations/kartu-keluarga.png",
      link: user?.KK,
      available: user?.KK && !user.KK.endsWith("/"),
    },
    {
      id: 3,
      name: "KTP/Identitas",
      image: "/illustrations/ktp.png",
      link: user?.Ktp,
      available: user?.Ktp && !user.Ktp.endsWith("/"),
    },
    {
      id: 4,
      name: "Ijazah",
      image: "/illustrations/ijazah.png",
      link: user?.Ijazah,
      available: user?.Ijazah && !user.Ijazah.endsWith("/"),
    },
    {
      id: 5,
      name: "Suket Sehat",
      image: "/illustrations/surat-keterangan-sehat.png",
      link: user?.SuratKesehatan,
      available: user?.SuratKesehatan && !user.SuratKesehatan.endsWith("/"),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (!user) return null;

  return (
    <section className="relative w-full text-white pb-20">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-0">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">Personal Identity</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-calsans tracking-tight leading-none">
              Profil & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Verifikasi Data</span>
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl font-light">
              Kelola informasi pribadi dan kelengkapan dokumen pendukung Anda untuk validasi keikutsertaan pelatihan resmi.
            </p>
          </div>

          <Link href="/dashboard/edit-profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all border border-blue-400/20 group"
            >
              <FiEdit3 className="group-hover:rotate-12 transition-transform" />
              Edit Profil
            </motion.div>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT: Profile Overview */}
          <div className="lg:w-1/3 xl:w-1/4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-8"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500" />
                <div className="relative bg-[#020617]/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                    <Image
                      src={user.Foto?.includes('http') ? user.Foto : "/dummies/profile.jpg"}
                      alt={user.Nama}
                      width={128}
                      height={128}
                      className="relative w-full h-full rounded-full object-cover border-2 border-white/20 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl border border-white/20 shadow-lg text-white">
                      <FiShield size={16} />
                    </div>
                  </div>

                  <h3 className="text-xl font-calsans text-white mb-1 line-clamp-1">
                    {capitalize(user.Nama.toLocaleLowerCase())}
                  </h3>
                  <p className="text-xs font-medium text-blue-400 tracking-wide mb-4">
                    {user.KusukaUsers === "yes" ? "Anggota Pelaku Utama" : "Peserta Umum"}
                  </p>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FiHash className="text-blue-500 shrink-0" />
                      <span className="text-[11px] font-bold tracking-wider">{user.Nik}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FiMail className="text-blue-500 shrink-0" />
                      <span className="text-[11px] truncate">{user.Email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FiPhone className="text-blue-500 shrink-0" />
                      <span className="text-[11px] tracking-widest">{user.NoTelpon}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Summary Card */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hidden lg:block">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Document Status</h4>
                <div className="space-y-3">
                  {documentTabs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{doc.name}</span>
                      {doc.available ? <FiCheckCircle className="text-emerald-500" /> : <FiCalendar className="text-gray-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Detailed Info & Documents */}
          <div className="flex-1 space-y-12">

            {/* Detailed Info Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <InfoCard icon={TbNumber} title="Nomor Identitas (NIK)" value={user.Nik.toLocaleString()} status="Verified" />
              <InfoCard icon={TbFlag} title="Kewarganegaraan" value={user.Kewarganegaraan} />
              <InfoCard icon={RiHeart3Line} title="Status Perkawinan" value={user.StatusMenikah} />
              <InfoCard icon={TbGenderBigender} title="Jenis Kelamin" value={user.JenisKelamin} />
              <InfoCard icon={HiOutlineCake} title="Tempat & Tanggal Lahir" value={`${user.TempatLahir}, ${user.TanggalLahir}`} />
              <InfoCard icon={FiMapPin} title="Alamat Domisili" value={user.Alamat} />
              <InfoCard icon={PiTrainRegional} title="Kota / Provinsi" value={`${user.Kota}, ${user.Provinsi}`} />
              <InfoCard icon={MdOutlineWorkOutline} title="Pekerjaan Saat Ini" value={user.Pekerjaan} />
              <InfoCard icon={TbSchool} title="Pendidikan Terakhir" value={user.PendidikanTerakhir} />
              <InfoCard icon={PiHandsPrayingBold} title="Agama" value={user.Agama} />
              <InfoCard icon={BiDonateBlood} title="Golongan Darah" value={user.GolonganDarah} />
              <InfoCard icon={MdOutlineWoman} title="Nama Ibu Kandung" value={user.IbuKandung} />
              <InfoCard icon={HiGlobeAmericas} title="Negara Tujuan Kerja" value={user.NegaraTujuanBekerja || "-"} />
            </motion.div>

            {/* Documents Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-calsans">Berkas & Unggahan</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {documentTabs.map((tab, idx) => (
                  <DocumentCard key={idx} tab={tab} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

const InfoCard = ({ icon: Icon, title, value, status }: { icon: any, title: string, value: string, status?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 }
    }}
    className="group relative bg-white/5 hover:bg-white/[0.08] backdrop-blur-3xl border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform duration-500">
        <Icon className="text-lg" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
          {title}
        </p>
        <p className="text-sm font-medium text-gray-200 line-clamp-1">
          {value || "-"}
        </p>
        {status && (
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">{status}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const DocumentCard = ({ tab }: { tab: any }) => {
  const hasExtension = (url: string) => /\.[0-9a-z]+$/i.test(url);
  const isValidFile = tab.link && hasExtension(tab.link);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5 }}
      className="group relative h-full bg-[#020617]/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 overflow-hidden flex flex-col justify-between transition-all"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors" />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-blue-500/30 transition-colors">
            <FiFileText size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
          </div>
          {isValidFile ? (
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[8px] font-bold uppercase tracking-widest">Uploaded</span>
          ) : (
            <span className="px-2 py-1 bg-white/5 text-gray-500 border border-white/10 rounded-md text-[8px] font-bold uppercase tracking-widest">Missing</span>
          )}
        </div>

        <h4 className="text-lg font-calsans mb-2 text-white/90 group-hover:text-blue-400 transition-colors">{tab.name}</h4>

        {isValidFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <FiFilePlus className="text-blue-400" size={14} />
              <span className="text-[10px] text-blue-300 truncate lowercase font-light italic">
                {truncateText(tab.link.split('/').pop(), 30, "...")}
              </span>
            </div>
            <a
              href={tab.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
            >
              Pratinjau Berkas <FiExternalLink size={12} />
            </a>
          </div>
        ) : (
          <p className="text-[11px] text-gray-500 leading-relaxed font-light mt-4">
            Berkas belum tersedia dalam sistem. Selesaikan pengunggahan melalui menu Pengaturan Akun.
          </p>
        )}
      </div>

      {!isValidFile && (
        <div className="mt-8">
          <Link href="/dashboard/edit-profile">
            <div className="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-tighter">
              Lengkapi Sekarang →
            </div>
          </Link>
        </div>
      )}
    </motion.div>
  );
};

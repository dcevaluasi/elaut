
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { verifyPDFBSrEUrl } from "@/constants/urls";
import {
    FiSearch,
    FiUser,
    FiFileText,
    FiArrowRight,
    FiExternalLink,
    FiHelpCircle,
    FiX,
    FiLock,
} from "react-icons/fi";
import { RiShieldCheckFill } from "react-icons/ri";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    sanitizedDangerousChars,
    validateIsDangerousChars,
} from "@/utils/input";
import Toast from "../toast";

const CertificateCheckFeature = () => {
    const router = useRouter();

    // Direct search tab state ('sttpl' | 'nik')
    const [activeSearchTab, setActiveSearchTab] = useState<"sttpl" | "nik">("sttpl");
    const [directSttplInput, setDirectSttplInput] = useState("");
    const [directNikInput, setDirectNikInput] = useState("");

    // Modal state
    const [selectedCertificatesFeature, setSelectedCertificateFeature] = useState<number>(0);
    const [openPopUpInfoCheckCertificateFeature, setOpenPopUpInfoCheckCertificateFeature] = useState<boolean>(false);
    const [openPopUpVerifyCertificateFeature, setOpenPopUpVerifyCertificateFeature] = useState<boolean>(false);
    const [openPopUpVerifyByNik, setOpenPopUpVerifyByNik] = useState<boolean>(false);

    const [noRegistrasi, setNoRegistrasi] = useState<string>("");
    const [nik, setNik] = useState<string>("");
    const [isLoadingSertifikat, setIsLoadingSertifikat] = useState<boolean>(false);

    const certificates = [
        {
            title: "Cek Sertifikat di E-LAUT",
            description: "Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT melalui nomor STTPL.",
            imageSrc: "/icons/icvalidity.png",
            link: null,
            type: "sttpl",
            steps: [
                "Klik layanan cek sertifikat di E-LAUT",
                "Masukkan nomor STTPL sobat E-LAUT jika mengikuti pelatihan",
                "Apabila kamu lulus pelatihan, maka nomor STTPL yang kamu masukkan dan sudah terbit sertifikatnya akan muncul data validitas keikutsertaan-mu dan validitas sertifikat-mu",
            ],
        },
        {
            title: "Cek Pelatihan Berdasarkan NIK",
            description: "Melihat seluruh riwayat pelatihan yang pernah kamu ikuti berdasarkan 16 digit NIK KTP.",
            imageSrc: "/icons/icsearch.png",
            link: null,
            type: "nik",
            steps: [
                "Klik layanan cek pelatihan berdasarkan NIK",
                "Masukkan NIK (Nomor Induk Kependudukan) kamu",
                "Sistem akan menampilkan seluruh riwayat pelatihan yang pernah kamu ikuti",
                "Kamu dapat melihat detail pelatihan termasuk nama pelatihan, bidang, dan nomor STTPL",
            ],
        },
        {
            title: "Cek Sertifikat di BSrE",
            description: "Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik di portal PSrE Komdigi.",
            imageSrc: "/icons/icbsre.png",
            link: verifyPDFBSrEUrl,
            type: "bsre",
            steps: [
                "Klik layanan cek sertifikat di BSrE",
                "Kamu akan diarahkan ke halaman website PSrE",
                "Unggah dokumen atau file sertifikat bagi sobat E-LAUT yang lulus pelatihan",
                "Tunggu proses validasi",
                "Kamu akan diberitahu dokumen atau file sertifikat valid dan sudah ditandatangani secara elektronik atau belum",
            ],
        },
    ];

    // Handle STTPL Submission
    const handleCekValiditasSertifikat = (targetSttpl?: string) => {
        const valueToTest = targetSttpl !== undefined ? targetSttpl : noRegistrasi;
        if (!valueToTest.trim()) return;

        if (validateIsDangerousChars(valueToTest)) {
            Toast.fire({
                icon: "error",
                title: "Input Tidak Valid",
                text: "Kamu memasukkan karakter berbahaya pada input nomor STTPL!",
            });
            if (targetSttpl !== undefined) setDirectSttplInput("");
            else setNoRegistrasi("");
            return;
        }

        const sanitized = sanitizedDangerousChars(valueToTest);
        setNoRegistrasi("");
        setOpenPopUpVerifyCertificateFeature(false);
        router.push(`/layanan/cek-sertifikat/${encodeURIComponent(sanitized)}`);
    };

    // Handle NIK Submission
    const handleCekPelatihanByNik = (targetNik?: string) => {
        const valueToTest = targetNik !== undefined ? targetNik : nik;
        if (!valueToTest.trim()) return;

        if (validateIsDangerousChars(valueToTest)) {
            Toast.fire({
                icon: "error",
                title: "Input Tidak Valid",
                text: "Kamu memasukkan karakter berbahaya pada input NIK!",
            });
            if (targetNik !== undefined) setDirectNikInput("");
            else setNik("");
            return;
        }

        const sanitized = sanitizedDangerousChars(valueToTest);
        setNik("");
        setOpenPopUpVerifyByNik(false);
        router.push(`/layanan/cek-sertifikat/nik/${encodeURIComponent(sanitized)}`);
    };

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta flex flex-col justify-center">
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/70 to-[#020617]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            {/* Glowing animated background ambient lighting */}
            <motion.div
                animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/10 blur-[130px] z-1"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/10 blur-[140px] z-1"
            />
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-indigo-500/5 blur-[140px] z-1"
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full space-y-12">

                    {/* ===== HERO HEADER ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col space-y-5 text-center w-full max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-calsans text-white tracking-tight leading-none drop-shadow-2xl">
                            Cek <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">Validitas</span> e-Sertifikat
                        </h1>

                        <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto leading-relaxed font-light">
                            Verifikasi keabsahan sertifikat dan riwayat pelatihan Anda yang diterbitkan secara resmi oleh Balai Pelatihan KP & Pusat Pelatihan KP Kementerian Kelautan dan Perikanan RI.
                        </p>

                        <div className="inline-flex self-center items-center gap-2 text-xs text-gray-400 bg-white/[0.03] px-5 py-2 rounded-full border border-white/[0.08] backdrop-blur-md">
                            <span>*Khusus sertifikat Awak Kapal dicek via</span>
                            <Link
                                target="_blank"
                                href="https://akapi.kkp.go.id"
                                className="inline-flex items-center gap-1 text-blue-400 font-bold hover:text-cyan-300 hover:underline transition-colors"
                            >
                                akapi.kkp.go.id
                                <FiExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* ===== DIRECT QUICK SEARCH CONSOLE ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="max-w-3xl mx-auto w-full"
                    >
                        <div className="relative group">
                            {/* Glowing border backdrop */}
                            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-500/40 via-cyan-400/30 to-indigo-500/40 opacity-70 group-hover:opacity-100 transition duration-500 blur-sm" />

                            <div className="relative rounded-3xl bg-[#0b1120]/90 backdrop-blur-3xl border border-white/10 p-4 sm:p-6 shadow-2xl space-y-4">

                                {/* Search Tab Selector */}
                                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                                    <button
                                        onClick={() => setActiveSearchTab("sttpl")}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${activeSearchTab === "sttpl"
                                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30"
                                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        <FiFileText className="w-4 h-4" />
                                        <span>Cek Nomor STTPL</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveSearchTab("nik")}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${activeSearchTab === "nik"
                                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30"
                                                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        <FiUser className="w-4 h-4" />
                                        <span>Cek Berdasarkan NIK</span>
                                    </button>
                                </div>

                                {/* Active Tab Form */}
                                <AnimatePresence mode="wait">
                                    {activeSearchTab === "sttpl" ? (
                                        <motion.form
                                            key="sttpl-form"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleCekValiditasSertifikat(directSttplInput);
                                            }}
                                            className="space-y-3"
                                        >
                                            <div className="relative flex flex-col sm:flex-row items-center gap-3">
                                                <div className="relative w-full">
                                                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        value={directSttplInput}
                                                        onChange={(e) => setDirectSttplInput(e.target.value)}
                                                        placeholder="Masukkan Nomor STTPL (Contoh: 001/PEL/2024)..."
                                                        className="w-full h-14 pl-12 pr-10 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                                                    />
                                                    {directSttplInput && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDirectSttplInput("")}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={!directSttplInput.trim()}
                                                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-extrabold hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 transition-all duration-300 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 flex-shrink-0"
                                                >
                                                    <FiSearch className="w-4 h-4" />
                                                    <span>Cek Validitas</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-gray-500 px-2">
                                                <span>Pastikan nomor STTPL diinput lengkap sesuai lembar sertifikat</span>
                                                <span className="text-blue-400/80 font-medium">Validasi Pangkalan Data E-LAUT</span>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.form
                                            key="nik-form"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleCekPelatihanByNik(directNikInput);
                                            }}
                                            className="space-y-3"
                                        >
                                            <div className="relative flex flex-col sm:flex-row items-center gap-3">
                                                <div className="relative w-full">
                                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        maxLength={16}
                                                        value={directNikInput}
                                                        onChange={(e) => setDirectNikInput(e.target.value.replace(/\D/g, ''))}
                                                        placeholder="Masukkan 16 Digit NIK KTP Anda..."
                                                        className="w-full h-14 pl-12 pr-20 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-xs sm:text-sm tracking-wider font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    />

                                                    {/* Digit Counter */}
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-white/[0.06] text-gray-400">
                                                        <span className={directNikInput.length === 16 ? "text-emerald-400 font-bold" : "text-gray-400"}>
                                                            {directNikInput.length}
                                                        </span> / 16
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={directNikInput.length !== 16}
                                                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-extrabold hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 transition-all duration-300 shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 flex-shrink-0"
                                                >
                                                    <FiSearch className="w-4 h-4" />
                                                    <span>Cari Riwayat NIK</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between text-[11px] text-gray-500 px-2">
                                                <span>Ketik 16 digit NIK KTP sesuai identitas terdaftar</span>
                                                <span className="text-emerald-400/80 font-medium">Terverifikasi BSrE</span>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>
                    </motion.div>

                    {/* ===== FEATURE CARDS GRID ===== */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto pt-4">
                        {certificates.map(({ title, description, imageSrc, link, type }, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                                whileHover={{ y: -8 }}
                                className="relative group h-full"
                            >
                                {/* Outer Glow Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[2.5rem] blur-md opacity-0 group-hover:opacity-20 transition duration-500" />

                                <div className="relative flex flex-col h-full items-center p-8 rounded-[2.5rem] border border-white/[0.08] bg-[#0b1120]/70 backdrop-blur-2xl transition-all duration-300 group-hover:bg-[#0b1120]/90 group-hover:border-blue-500/30 shadow-2xl">

                                    {/* Info Help Trigger */}
                                    <button
                                        onClick={() => {
                                            setSelectedCertificateFeature(index);
                                            setOpenPopUpInfoCheckCertificateFeature(true);
                                        }}
                                        className="absolute top-6 right-6 p-2 text-gray-500 hover:text-blue-400 transition-colors"
                                        title="Petunjuk & Langkah Pemeriksaan"
                                    >
                                        <FiHelpCircle className="w-5 h-5" />
                                    </button>

                                    {/* Feature Icon Container */}
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-xl rounded-full" />
                                        <Image
                                            src={imageSrc}
                                            alt={title}
                                            fill
                                            className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Title & Description */}
                                    <div className="flex flex-col space-y-3 items-center text-center flex-grow">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                                            {description}
                                        </p>
                                    </div>

                                    {/* Action CTA Button */}
                                    <div className="mt-8 w-full">
                                        {link ? (
                                            <a
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                            >
                                                <span>Buka Website BSrE</span>
                                                <FiExternalLink className="w-4 h-4 text-cyan-400" />
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (type === "nik") {
                                                        setOpenPopUpVerifyByNik(true);
                                                    } else {
                                                        setOpenPopUpVerifyCertificateFeature(true);
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg shadow-blue-600/10"
                                            >
                                                <span>Cek Sekarang</span>
                                                <FiArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* ===== TRUST INDICATORS BAR ===== */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/[0.06]"
                    >
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                <RiShieldCheckFill className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-white">100% Terverifikasi BSrE</p>
                                <p className="text-gray-500 text-[11px]">Dijamin TTE BSSN Republik Indonesia</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                                <HiOutlineDocumentCheck className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-white">Validasi Real-Time STTPL</p>
                                <p className="text-gray-500 text-[11px]">Terhubung langsung ke Pangkalan Data E-LAUT</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                                <FiLock className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-white">Keamanan Kredensial Peserta</p>
                                <p className="text-gray-500 text-[11px]">Perlindungan NIK & Informasi Pribadi</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* ===== MODAL 1: STEP-BY-STEP INFO ===== */}
            <AlertDialog
                open={openPopUpInfoCheckCertificateFeature}
                onOpenChange={setOpenPopUpInfoCheckCertificateFeature}
            >
                <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] text-white shadow-3xl scrollbar-hide">
                    <AlertDialogHeader>
                        <div className="flex items-center justify-between">
                            <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">
                                Langkah Pemeriksaan
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="space-y-3 mt-4 text-left">
                            {certificates[selectedCertificatesFeature]?.steps?.map((step: string, index: number) => (
                                <div key={index} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-300 text-xs sm:text-sm leading-relaxed pt-1">{step}</p>
                                </div>
                            ))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="h-12 px-8 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all text-xs font-bold">
                            Dimengerti
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ===== MODAL 2: STTPL VERIFICATION DIALOG ===== */}
            <AlertDialog open={openPopUpVerifyCertificateFeature} onOpenChange={setOpenPopUpVerifyCertificateFeature}>
                <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl text-white scrollbar-hide">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">Verifikasi Sertifikat STTPL</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-light text-xs">Masukkan nomor STTPL Anda untuk mengecek keabsahan sertifikat.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCekValiditasSertifikat();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Nomor STTPL</label>
                            <input
                                type="text"
                                value={noRegistrasi}
                                onChange={(e) => setNoRegistrasi(e.target.value)}
                                className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-mono text-sm"
                                placeholder="Contoh: 001/PEL/2024"
                            />
                        </div>

                        <AlertDialogFooter className="mt-8 sm:justify-between gap-3">
                            <AlertDialogCancel type="button" className="h-12 flex-1 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all text-xs font-semibold">Batal</AlertDialogCancel>
                            <button
                                type="submit"
                                disabled={!noRegistrasi.trim() || isLoadingSertifikat}
                                className="h-12 flex-grow-[2] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 transition-all text-xs shadow-lg shadow-blue-600/20"
                            >
                                {isLoadingSertifikat ? "Memproses..." : "Cek Validitas"}
                            </button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

            {/* ===== MODAL 3: NIK SEARCH DIALOG ===== */}
            <AlertDialog open={openPopUpVerifyByNik} onOpenChange={setOpenPopUpVerifyByNik}>
                <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl text-white scrollbar-hide">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">Pencarian Riwayat NIK</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 font-light text-xs">Masukkan 16 digit NIK KTP Anda untuk menelusuri sertifikat terdaftar.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCekPelatihanByNik();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">NIK (Nomor Induk Kependudukan)</label>
                                <span className="text-[10px] font-mono text-gray-500">{nik.length} / 16</span>
                            </div>
                            <input
                                type="text"
                                maxLength={16}
                                value={nik}
                                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                                className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                placeholder="3200xxxxxxxxxxxx"
                            />
                        </div>

                        <AlertDialogFooter className="mt-8 sm:justify-between gap-3">
                            <AlertDialogCancel type="button" className="h-12 flex-1 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all text-xs font-semibold">Batal</AlertDialogCancel>
                            <button
                                type="submit"
                                disabled={nik.length !== 16}
                                className="h-12 flex-grow-[2] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50 transition-all text-xs shadow-lg shadow-blue-600/20"
                            >
                                Telusuri Riwayat
                            </button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>

        </section>
    );
};

export default CertificateCheckFeature;

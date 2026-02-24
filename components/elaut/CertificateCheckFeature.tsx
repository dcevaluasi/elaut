
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { verifyPDFBSrEUrl } from "@/constants/urls";
import { FaRegCircleQuestion } from "react-icons/fa6";
import {
    AlertDialog,
    AlertDialogAction,
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
    const certificates: Record<string, any>[] = [
        {
            title: "Cek Sertifikat di E-LAUT",
            description:
                "Melihat Validitas Sertifikat-mu dan Keikutsertaanmu di Aplikasi E-LAUT",
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
            description:
                "Melihat Riwayat Pelatihan yang Pernah Diikuti Berdasarkan NIK",
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
            description:
                "Melihat Validitas Sertifikat dan Penandatanganan Secara Elektronik",
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

    const [selectedCertificatesFeature, setSelectedCertificateFeature] =
        React.useState<number>(0);
    const [openPopUpInfoCheckCertificateFeature, setOpenPopUpInfoCheckCertificateFeature] =
        React.useState<boolean>(false);
    const [openPopUpVerifyCertificateFeature, setOpenPopUpVerifyCertificateFeature] =
        React.useState<boolean>(false);
    const [openPopUpVerifyByNik, setOpenPopUpVerifyByNik] =
        React.useState<boolean>(false);
    const [noRegistrasi, setNoRegistrasi] = React.useState<string>("");
    const [nik, setNik] = React.useState<string>("");
    const [isLoadingSertifikat, setIsLoadingSertifikat] =
        React.useState<boolean>(false);

    const handleCekValiditasSertifikat = () => {
        if (validateIsDangerousChars(noRegistrasi)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input nomor sttpl, cek akun tidak dapat diproses!`,
            });
            setNoRegistrasi("");
            return;
        }

        const sanitized = sanitizedDangerousChars(noRegistrasi);
        setNoRegistrasi("");
        setOpenPopUpVerifyCertificateFeature(false);
        router.push(`/layanan/cek-sertifikat/${encodeURIComponent(sanitized)}`);
    };

    const handleCekPelatihanByNik = () => {
        if (validateIsDangerousChars(nik)) {
            Toast.fire({
                icon: "error",
                title: "Oopsss!",
                text: `Kamu memasukkan karakter berbahaya pada input NIK, cek pelatihan tidak dapat diproses!`,
            });
            setNik("");
            return;
        }

        const sanitized = sanitizedDangerousChars(nik);
        setNik("");
        setOpenPopUpVerifyByNik(false);
        router.push(`/layanan/cek-sertifikat/nik/${encodeURIComponent(sanitized)}`);
    };

    return (
        <section className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta">
            {/* Background Image/Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
            </div>

            {/* Modern Animated Gradient Blobs */}
            <motion.div
                animate={{
                    x: [0, 40, 0],
                    y: [0, -20, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[100px] z-1"
            />
            <motion.div
                animate={{
                    x: [0, -50, 0],
                    y: [0, 30, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[120px] z-1"
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full py-32 px-4 md:px-0">
                <div className="max-w-7xl mx-auto w-full">
                    <section id="cek-sertifikat" className="scroll-smooth w-full">
                        <div className="flex flex-col gap-12 w-full items-center">

                            {/* Title & Description */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col space-y-6 text-center w-full max-w-4xl"
                            >
                                <div className="inline-flex self-center items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    Security & Verification Hub
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-calsans text-white tracking-tight leading-none drop-shadow-2xl">
                                    Cek <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                                        Validitas
                                    </span> e-Sertifikat
                                </h1>
                                <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed font-light">
                                    Ayo cek dan lihat kevalidan sertifikat-mu dan keikutsertaanmu dalam
                                    pelatihan yang diselenggarakan oleh Balai Pelatihan KP atau Pusat
                                    Pelatihan KP di layanan ini!
                                </p>

                                <div className="text-xs sm:text-sm text-gray-500 bg-white/5 self-center px-4 py-2 rounded-full border border-white/10">
                                    *Untuk sertifikat Awak Kapal dicek melalui{" "}
                                    <Link
                                        target="_blank"
                                        href="https://akapi.kkp.go.id"
                                        className="text-blue-400 font-semibold hover:underline"
                                    >
                                        akapi.kkp.go.id
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Certificate Processing Cards */}
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                                {certificates.map(({ title, description, imageSrc, link, type }, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        whileHover={{ y: -8 }}
                                        className="relative group h-full"
                                    >
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-0 group-hover:opacity-10 transition duration-500" />

                                        <div className="relative flex flex-col h-full items-center p-8 rounded-[2.5rem] border border-white/10 bg-[#1e293b]/20 backdrop-blur-2xl transition-all duration-300 group-hover:bg-[#1e293b]/30">
                                            {/* Info Trigger */}
                                            <button
                                                onClick={() => {
                                                    setSelectedCertificateFeature(index);
                                                    setOpenPopUpInfoCheckCertificateFeature(true);
                                                }}
                                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-blue-400 transition-colors"
                                            >
                                                <FaRegCircleQuestion size={20} />
                                            </button>

                                            <div className="relative w-24 h-24 mb-8">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                                                <Image
                                                    src={imageSrc}
                                                    alt={title}
                                                    fill
                                                    className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>

                                            <div className="flex flex-col space-y-4 items-center text-center flex-grow">
                                                <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{title}</h2>
                                                <p className="text-sm text-gray-500 font-light leading-relaxed">{description}</p>
                                            </div>

                                            <div className="mt-8 w-full">
                                                {link ? (
                                                    <Link
                                                        href={link}
                                                        target="_blank"
                                                        className="flex items-center justify-center w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all"
                                                    >
                                                        Buka Website
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (type === "nik") {
                                                                setOpenPopUpVerifyByNik(true);
                                                            } else {
                                                                setOpenPopUpVerifyCertificateFeature(true);
                                                            }
                                                        }}
                                                        className="flex items-center justify-center w-full h-12 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
                                                    >
                                                        Cek Sekarang
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Info Modal */}
                            <AlertDialog
                                open={openPopUpInfoCheckCertificateFeature}
                                onOpenChange={setOpenPopUpInfoCheckCertificateFeature}
                            >
                                <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] text-white shadow-3xl scrollbar-hide">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">
                                            Langkah Pemeriksaan
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-4 mt-6">
                                            {certificates[selectedCertificatesFeature].steps.map((step: string, index: number) => (
                                                <div key={index} className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-sm">
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                                                </div>
                                            ))}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-8">
                                        <AlertDialogCancel className="h-12 px-8 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all">
                                            Dimengerti
                                        </AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>



                            {/* Cek STTPL Input Dialog */}
                            <AlertDialog open={openPopUpVerifyCertificateFeature} onOpenChange={setOpenPopUpVerifyCertificateFeature}>
                                <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl text-white scrollbar-hide">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">Verifikasi Sertifikat</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400 font-light">Masukkan nomor STTPL Anda untuk validasi sistem.</AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="mt-8 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Nomor STTPL</label>
                                            <input
                                                type="text"
                                                value={noRegistrasi}
                                                onChange={(e) => setNoRegistrasi(e.target.value)}
                                                className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
                                                placeholder="Contoh: 001/PEL/2024"
                                            />
                                        </div>
                                    </div>

                                    <AlertDialogFooter className="mt-10 sm:justify-between gap-4">
                                        <AlertDialogCancel className="h-12 flex-1 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all">Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            disabled={!noRegistrasi || isLoadingSertifikat}
                                            onClick={handleCekValiditasSertifikat}
                                            className="h-12 flex-grow-[2] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            {isLoadingSertifikat ? "Memproses..." : "Cek Validitas"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Cek NIK Input Dialog */}
                            <AlertDialog open={openPopUpVerifyByNik} onOpenChange={setOpenPopUpVerifyByNik}>
                                <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl text-white scrollbar-hide">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-bold font-calsans text-blue-400">Pencarian NIK</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400 font-light">Masukkan 16 digit NIK Anda sesuai KTP.</AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="mt-8 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">NIK (Nomor Induk Kependudukan)</label>
                                            <input
                                                type="text"
                                                maxLength={16}
                                                value={nik}
                                                onChange={(e) => setNik(e.target.value)}
                                                className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
                                                placeholder="3200xxxxxxxxxxxx"
                                            />
                                        </div>
                                    </div>

                                    <AlertDialogFooter className="mt-10 sm:justify-between gap-4">
                                        <AlertDialogCancel className="h-12 flex-1 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all">Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            disabled={nik.length !== 16}
                                            onClick={handleCekPelatihanByNik}
                                            className="h-12 flex-grow-[2] rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            Telusuri Riwayat
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>


                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default CertificateCheckFeature;

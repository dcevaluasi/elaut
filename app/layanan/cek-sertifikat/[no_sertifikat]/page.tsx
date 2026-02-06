'use client'

import React, { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import { UserPelatihan } from '@/types/user';
import { addFiveYears } from '@/utils/pelatihan';
import { generateTanggalPelatihan } from '@/utils/text';
import { RiQuillPenAiLine, RiVerifiedBadgeFill } from 'react-icons/ri';
import { FiUser, FiBookOpen, FiCalendar, FiFileText, FiEdit3, FiMapPin } from 'react-icons/fi';
import { useParams } from 'next/navigation';
import Footer from '@/components/ui/footer';
import { PelatihanMasyarakat } from '@/types/product';
import { HiOutlineInbox } from 'react-icons/hi2';
import { FaRegBuilding } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const CertificateResultPage = () => {
    const params = useParams();
    const no_sertifikat = params?.no_sertifikat;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UserPelatihan | null>(null);
    const [dataPelatihan, setDataPelatihan] = useState<PelatihanMasyarakat | null>(null)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!no_sertifikat || typeof no_sertifikat !== 'string') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/cekSertifikat`, {
                    no_registrasi: no_sertifikat,
                });
                setData(res.data.data);
                setDataPelatihan(res.data.pelatihan)
                setError(null);
            } catch (err) {
                if (isAxiosError(err)) {
                    setError(err.response?.data?.Pesan || 'Sertifikat tidak ditemukan dalam pangkalan data kami.');
                } else {
                    setError('Terjadi masalah saat menghubungi server. Silakan coba lagi nanti.');
                }
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [no_sertifikat]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta flex flex-col">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
            </div>

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

            <main className="relative z-10 flex-grow flex items-center justify-center p-6 py-20">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                            <p className="text-blue-400 font-medium animate-pulse">Menghubungkan ke Pusat Data...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md w-full p-10 rounded-[2.5rem] bg-[#1e293b]/20 backdrop-blur-2xl border border-red-500/20 text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">⚠</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 font-calsans">Validasi Gagal</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">{error}</p>
                            <Link href="/layanan/cek-sertifikat" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold">
                                Kembali ke Pencarian
                            </Link>
                        </motion.div>
                    ) : data ? (
                        <motion.div
                            key="data"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl w-full"
                        >
                            {/* Certificate Card */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-10" />
                                <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#1e293b]/20 backdrop-blur-3xl border border-white/10 shadow-3xl text-white">

                                    {/* Header Section */}
                                    <div className="flex flex-col items-center text-center mb-10">
                                        <div className="w-24 h-24 mb-6 relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                                            <RiVerifiedBadgeFill className="relative z-10 w-full h-full text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                                            Verified Authentic Document
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-bold font-calsans mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                            {data.NoRegistrasi}
                                        </h1>
                                        <p className="text-sm text-gray-400 font-light max-w-md">
                                            Sertifikat ini telah melalui proses verifikasi digital dan dinyatakan resmi dalam pangkalan data E-LAUT.
                                        </p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 gap-6">
                                        {[
                                            { icon: <FiUser />, label: "Nama Lengkap", value: data.Nama },
                                            { icon: <FiBookOpen />, label: "Pelatihan", value: data.NamaPelatihan },
                                            { icon: <FaRegBuilding />, label: "Penyelenggara", value: dataPelatihan?.PenyelenggaraPelatihan },
                                            { icon: <HiOutlineInbox />, label: "Bidang/Klaster", value: dataPelatihan?.BidangPelatihan },
                                            { icon: <RiQuillPenAiLine />, label: "Program", value: dataPelatihan?.Program },
                                            { icon: <FiCalendar />, label: "Periode Pelaksanaan", value: `${generateTanggalPelatihan(data.TanggalMulai)} - ${generateTanggalPelatihan(data.TanggalBerakhir)}` },
                                            { icon: <FiMapPin />, label: "Lokasi", value: dataPelatihan?.LokasiPelatihan },
                                            { icon: <FiFileText />, label: "Tanggal Terbit", value: data.TanggalSertifikat },
                                            { icon: <FiEdit3 />, label: "Penandatangan", value: dataPelatihan?.TtdSertifikat },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform">
                                                    {item.icon}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">{item.label}</span>
                                                    <span className="text-sm md:text-base text-gray-200 font-medium truncate">{item.value || "-"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Disclaimer */}
                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <p className="text-[11px] text-gray-500 leading-relaxed italic text-center">
                                            * Sertifikat berlaku hingga <span className="text-white font-semibold">{addFiveYears(data.TanggalSertifikat)}</span>. Dokumen dikelola dan dijamin keasliannya oleh Balai Sertifikasi Elektronik (BSrE), Badan Siber dan Sandi Negara Republik Indonesia.
                                        </p>
                                        <div className="mt-8 flex justify-center">
                                            <Link
                                                href="/layanan/cek-sertifikat"
                                                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                Pemeriksaan Selesai
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};

export default CertificateResultPage;

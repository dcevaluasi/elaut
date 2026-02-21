"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import { elautBaseUrl } from "@/constants/urls";
import Footer from "@/components/ui/footer";
import { motion, AnimatePresence } from "framer-motion";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FiUser, FiHome, FiMapPin, FiCalendar, FiShield, FiAlertCircle, FiActivity } from "react-icons/fi";
import { TbCertificate } from "react-icons/tb";
import Link from "next/link";
import { HashLoader } from "react-spinners";
import { P2MKP, PengajuanPenetapanP2MKP } from "@/types/p2mkp";

const P2MKPPenetapanCheckPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        pengajuan: PengajuanPenetapanP2MKP;
        master: P2MKP;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch All data to find the match, as there's no single public endpoint confirmed
                // In a production environment, this would ideally be handled by a specific public API
                const [pengajuanRes, p2mkpRes] = await Promise.all([
                    axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp`),
                    axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp`)
                ]);

                const pengajuanList: PengajuanPenetapanP2MKP[] = Array.isArray(pengajuanRes.data) ? pengajuanRes.data : (pengajuanRes.data.data || []);
                const p2mkpList: P2MKP[] = Array.isArray(p2mkpRes.data) ? p2mkpRes.data : (p2mkpRes.data.data || []);

                const currentPengajuan = pengajuanList.find(p => String(p.IdPengajuanPenetapanPpmkp) === String(id));
                console.log({ pengajuanList })
                console.log({ currentPengajuan })
                if (!currentPengajuan) {
                    setError("Data penetapan tidak ditemukan dalam pangkala data kami.");
                    return;
                }

                // SECURITY CHECK: Only show if status is "Disetujui" as per user request
                if (currentPengajuan.status !== "Approved") {
                    setError("Sertifikat penetapan ini belum disetujui atau sedang dalam masa tinjauan resmi.");
                    return;
                }

                const currentMaster = p2mkpList.find(m => String(m.IdPpmkp) === String(currentPengajuan.id_Ppmkp));

                if (!currentMaster) {
                    setError("Data profil lembaga P2MKP tidak ditemukan.");
                    return;
                }

                setData({
                    pengajuan: currentPengajuan,
                    master: currentMaster
                });
                setError(null);
            } catch (err) {
                console.error("Error checking P2MKP certificate:", err);
                setError("Terjadi masalah saat verifikasi data. Silakan coba kembali lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta flex flex-col">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
            </div>

            <motion.div
                animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[100px] z-1"
            />
            <motion.div
                animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[120px] z-1"
            />

            <main className="relative z-10 flex-grow flex items-center justify-center p-6 py-20">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                            <p className="text-blue-400 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Verifikasi Sertifikat Digital P2MKP...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-10 rounded-[2.5rem] bg-[#1e293b]/20 backdrop-blur-2xl border border-rose-500/20 text-center">
                            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertCircle className="text-4xl text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4 font-calsans uppercase tracking-tight">Verifikasi Gagal</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">{error}</p>
                            <Link href="/layanan/cek-sertifikat" className="inline-flex h-12 px-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold uppercase text-[10px] tracking-widest">
                                Kembali ke Beranda
                            </Link>
                        </motion.div>
                    ) : data ? (
                        <motion.div key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2.5rem] blur opacity-10" />
                                <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#1e293b]/20 backdrop-blur-3xl border border-white/10 shadow-3xl text-white">
                                    <div className="flex flex-col items-center text-center mb-10">
                                        <div className="w-24 h-24 mb-6 relative">
                                            <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full" />
                                            <RiVerifiedBadgeFill className="relative z-10 w-full h-full text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                                            Verified Authentic P2MKP Certificate
                                        </div>
                                        <h2 className="text-lg md:text-xl font-bold font-calsans mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-tight text-center px-4 leading-tight">
                                            {data.pengajuan.nomor_sertifikat}
                                        </h2>
                                        <p className="text-xs text-gray-400 font-medium max-w-md uppercase tracking-wider leading-relaxed">
                                            Lembaga ini telah secara resmi ditetapkan sebagai Pusat Pelatihan Mandiri Kelautan dan Perikanan.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <DetailRow icon={<FiHome />} label="Nama Lembaga" value={data.master.nama_ppmkp} />
                                        <DetailRow icon={<FiUser />} label="Penanggung Jawab" value={data.master.nama_penanggung_jawab} />
                                        <DetailRow icon={<FiActivity />} label="Bidang Pelatihan" value={data.master.jenis_bidang_pelatihan} />
                                        <DetailRow icon={<FiMapPin />} label="Lokasi" value={`${data.master.kota}, ${data.master.provinsi}`} />
                                        <DetailRow icon={<FiCalendar />} label="Tanggal Penetapan" value={data.pengajuan.tanggal_sertifikat} />
                                        <DetailRow icon={<FiShield />} label="Periode Berlaku" value={`Tahun ${data.pengajuan.tahun_penetapan}`} />
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-white/5 space-y-8">
                                        <p className="text-center text-[11px] text-gray-500 leading-relaxed italic opacity-80">
                                            * Penetapan Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) berlaku selama 2 (dua) tahun terhitung sejak tanggal sertifikat diterbitkan. Dokumen ini terdata resmi di E-LAUT.
                                        </p>
                                        <div className="flex justify-center">
                                            <Link href="/" className="px-10 h-14 flex items-center rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 uppercase text-[10px] tracking-[0.2em]">
                                                Selesai Verifikasi
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

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 mb-0.5">{label}</span>
            <span className="text-sm md:text-base text-gray-200 font-bold truncate uppercase tracking-tight">{value || "-"}</span>
        </div>
    </div>
);

export default P2MKPPenetapanCheckPage;

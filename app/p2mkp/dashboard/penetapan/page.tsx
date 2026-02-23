'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiActivity,
    FiAward,
    FiX,
    FiChevronRight,
    FiEdit,
    FiCalendar,
    FiEye,
    FiShield,
    FiChevronDown
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { HashLoader } from 'react-spinners';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import Toast from '@/commons/Toast';
import DashboardLayout from '../DashboardLayout';

const FAQ_DATA = [
    {
        question: "Apa saja syarat menjadi P2MKP?",
        answer: (
            <div className="space-y-4">
                {[
                    "Memiliki dan telah menjalankan usaha paling singkat selama 1 (satu) tahun.",
                    "Memiliki unit produksi dan/atau usaha yang dapat dicontoh, ditiru, dan/atau dipelajari oleh masyarakat.",
                    "Melayani Pelaku Usaha, Pelaku Pendukung, dan masyarakat lainnya untuk kegiatan pelatihan dan magang.",
                    "Memiliki peralatan produksi dan/atau usaha yang sesuai dengan standar usahanya serta dapat digunakan untuk pelatihan dan magang.",
                    "Menyediakan sarana akomodasi yang layak bagi peserta pelatihan dan magang.",
                    "Memiliki tenaga kepelatihan yang terdiri atas pelatih dan pengelola pelatihan yang dibutuhkan untuk mendukung penyelenggaraan pelatihan.",
                    "Memiliki kepengurusan yang dilengkapi dengan struktur organisasi dan rincian tugas serta tanggung jawab masing-masing secara jelas.",
                    "Memiliki manajemen yang baik.",
                    "Memiliki materi pelatihan dan/atau bahan ajar sesuai dengan bidang usahanya.",
                    "Tidak berafiliasi dengan partai politik."
                ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">{item}</p>
                    </div>
                ))}
            </div>
        )
    },
    {
        question: "Apa saja tahapan penetapan P2MKP?",
        answer: (
            <div className="space-y-4">
                {[
                    { title: "Persiapan", desc: "Penyusunan dokumen & asesmen mandiri di portal." },
                    { title: "Verifikasi", desc: "Pemeriksaan kelayakan administrasi oleh Pusat." },
                    { title: "Visitasi", desc: "Peninjauan langsung fasilitas & sarana lapangan." },
                    { title: "Penetapan", desc: "Sidang pleno & penerbitan sertifikat resmi." }
                ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform text-white">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        question: "Bagaimana proses verifikasi setelah dokumen diajukan?",
        answer: (
            <div className="space-y-4">
                {[
                    { title: "Pemeriksaan Dokumen (5 Hari)", desc: "Tim pusat akan mengecek kelengkapan berkas dan rekomendasi dinas Anda dalam waktu maksimal 5 hari kerja." },
                    { title: "Melengkapi Berkas (7 Hari)", desc: "Jika ada dokumen yang kurang, Anda akan diberikan waktu 7 hari kerja untuk segera melengkapinya." },
                    { title: "Keputusan Tahap Awal", desc: "Jika dokumen tetap tidak lengkap setelah batas waktu perbaikan, permohonan dengan berat hati harus ditolak." }
                ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        question: "Bagaimana proses survei lapangan (visitasi) dilakukan?",
        answer: (
            <div className="space-y-4">
                {[
                    { title: "Peninjauan Lokasi (14 Hari)", desc: "Setelah dokumen beres, tim ahli akan mengunjungi lokasi usaha Anda (atau via online) dalam waktu maksimal 14 hari kerja." },
                    { title: "Pemeriksaan Kesesuaian", desc: "Tim akan memastikan apa yang Anda tulis di dokumen benar-benar sesuai dengan kondisi nyata di lapangan." },
                    { title: "Rapat Pleno", desc: "Tim validasi akan mendiskusikan hasil kunjungan untuk menentukan apakah usaha Anda layak menjadi P2MKP." },
                    { title: "Masa Perbaikan (7 Hari)", desc: "Jika ada temuan yang belum sesuai, Anda diberi waktu 7 hari untuk melakukan penyesuaian sebelum keputusan akhir." }
                ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        question: "Berapa lama berlakunya sertifikat penetapan P2MKP?",
        answer: "Penetapan P2MKP berlaku selama 2 (dua) tahun atau sampai dengan diterbitkannya sertifikat klasifikasi P2MKP yang bersangkutan."
    }
];

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <motion.div
            initial={false}
            className={`rounded-3xl border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-white/10 border-blue-500/30 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${isOpen ? 'text-blue-400' : 'text-gray-200'}`}>
                    {question}
                </span>
                <div className={`p-2 rounded-xl transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                    <FiChevronDown size={18} />
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-8 pb-8 text-gray-400 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function PenetapanP2MKPPage() {
    const router = useRouter();
    const [p2mkpData, setP2mkpData] = useState<any>(null);
    const [penetapanData, setPenetapanData] = useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) { router.push('/p2mkp/login'); return; }

                const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    const data = response.data.data || response.data;
                    setP2mkpData(data);
                    const id_p2mkp = data.IdPpmkp || data.id_p2mkp || data.id;
                    if (id_p2mkp) {
                        const res = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp?id_p2mkp=${id_p2mkp}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.status === 200) {
                            const resData = res.data.data || (Array.isArray(res.data) ? res.data : []);
                            setPenetapanData(resData.filter((item: any) => String(item.id_Ppmkp) === String(id_p2mkp)));
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsDataLoading(false);
            }
        };
        init();
    }, [router]);

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'dikirim': case 'diajukan': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'diverifikasi': case 'proses': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'disetujui': case 'aktif': case 'selesai': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'ditolak': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            case 'perbaikan': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const hasPending = penetapanData.some(item => {
        const s = (item.status || 'diajukan').toLowerCase();
        return ['diajukan', 'dikirim', 'proses', 'diverifikasi', 'pending', 'menunggu', 'perbaikan'].includes(s);
    });

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-12 pb-24"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-0">
                        <h1 className="text-4xl md:text-5xl leading-none font-calsans">Penetapan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">P2MKP</span></h1>
                        <p className="text-gray-500 text-sm font-light italic leading-relaxed mt-2">Kelola legalitas dan status sertifikasi lembaga Anda dalam satu pusat kontrol.</p>
                    </div>
                    {!isDataLoading && !hasPending && (
                        <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                            <button className="group relative h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 overflow-hidden active:scale-95">
                                <FiPlus size={20} className="group-hover:rotate-90 transition-transform" />
                                AJUKAN PENETAPAN
                                <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[600%] transition-transform duration-1000" />
                            </button>
                        </Link>
                    )}
                </div>

                {/* Submissions List */}
                {isDataLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <HashLoader color="#3b82f6" size={40} />
                    </div>
                ) : penetapanData.length > 0 ? (
                    <div className="grid gap-6">
                        {penetapanData.map((item: any, index: number) => (
                            <motion.div
                                key={item.IdPengajuan || index}
                                whileHover={{ y: -5 }}
                                onClick={() => { setSelectedSubmission(item); setIsDetailOpen(true); }}
                                className="group p-6 rounded-[2rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <FiFileText />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-calsans text-xl text-white">Pengajuan Penetapan P2MKP {item.tahun_penetapan || new Date().getFullYear()}</h3>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <FiCalendar /> {item.create_at ? new Date(item.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {item.status?.toLowerCase() === 'perbaikan' && (
                                        <Link href="/p2mkp/dashboard/complete-profile" onClick={(e) => e.stopPropagation()}>
                                            <button className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2">
                                                <FiEdit size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Edit Data</span>
                                            </button>
                                        </Link>
                                    )}
                                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] ${getStatusStyle(item.status || 'Diajukan')}`}>
                                        {item.status || 'Diajukan'}
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                                        <FiChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-16 rounded-[3.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-600">
                            <FiFileText size={48} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-calsans">Belum Ada Pengajuan</h3>
                            <p className="text-gray-500 text-sm max-w-xl font-light leading-relaxed">
                                Anda belum memiliki record pengajuan penetapan. Lakukan pengajuan pertama Anda untuk menetapkan lembaga atau usaha anda sebagai P2MKP.
                            </p>
                        </div>
                        <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                            <button className="h-14 px-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black tracking-widest transition-all flex items-center gap-3">
                                <FiPlus size={20} /> AJUKAN PENETAPAN
                            </button>
                        </Link>
                    </motion.div>
                )}

                {/* Informational Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoCard icon={<FiClock />} title="Timeline Verifikasi" description="Proses peninjauan dokumen dan verifikasi lapangan biasanya memakan waktu 14-21 hari kerja setelah pengajuan dinyatakan lengkap." color="amber" />
                    <InfoCard icon={<FiCheckCircle />} title="Kriteria Kelulusan" description="Pastikan seluruh dokumen legalitas dan kelayakan teknis telah sesuai dengan standar P2MKP untuk mempercepat proses penetapan." color="emerald" />
                </div>

                {/* FAQ Section */}
                <div className="space-y-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-calsans">Frequently Asked <span className="text-blue-400">Questions</span></h1>
                        <p className="text-gray-500 text-sm font-light leading-relaxed">Informasi lengkap mengenai proses penetapan dan verifikasi P2MKP.</p>
                    </div>
                    <div className="grid gap-4">
                        {FAQ_DATA.map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Detail Overlay Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedSubmission && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-white">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <FiFileText size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-calsans">Detail <span className="text-blue-400 font-bold">Pengajuan</span></h2>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mt-1">Detail Pengajuan Penetapan P2MKP</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailMetaCard label="Status Verifikasi" value={selectedSubmission.status || 'Diajukan'} highlight status={selectedSubmission.status} />
                                    <DetailMetaCard label="Tahun Penetapan" value={selectedSubmission.tahun_penetapan || new Date().getFullYear()} />
                                    <DetailMetaCard label="Klasifikasi LPK" value={selectedSubmission.is_lpk === 'Ya' ? 'LPK Terverifikasi' : 'Non-LPK'} />
                                    <DetailMetaCard label="Tanggal Diajukan" value={selectedSubmission.create_at ? new Date(selectedSubmission.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                                </div>

                                <div className="grid gap-3 pt-4">
                                    <DocumentLink label="Identifikasi Calon P2MKP" url={selectedSubmission.DokumenIdentifikasiPemilik} />
                                    <DocumentLink label="Identifikasi Asesmen Mandiri" url={selectedSubmission.DokumenAsesmentMandiri} />
                                    <DocumentLink label="Surat Pernyataan Calon P2MKP" url={selectedSubmission.DokumentSuratPernyataan} />
                                    <DocumentLink label="Surat Legalitas Usaha" url={selectedSubmission.DokumenKeteranganUsaha} />
                                    <DocumentLink label="Surat Tidak Afiliasi Partai Politik" url={selectedSubmission.DokumenAfiliasiParpol} />
                                    <DocumentLink label="Surat Rekomendasi Dinas" url={selectedSubmission.DokumenRekomendasiDinas} />
                                    <DocumentLink label="Surat Permohonan Pembentukan" url={selectedSubmission.DokumenPermohonanPembentukan} />
                                </div>
                            </div>

                            <div className="p-8 bg-[#020617]/50 border-t border-white/5 flex justify-end">
                                <button onClick={() => setIsDetailOpen(false)} className="px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    TUTUP
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

function DetailMetaCard({ label, value, highlight, status }: any) {
    const getStatusStyle = (s: string) => {
        switch (s?.toLowerCase()) {
            case 'dikirim': case 'diajukan': return 'text-blue-400';
            case 'diverifikasi': case 'proses': return 'text-amber-400';
            case 'disetujui': case 'aktif': return 'text-emerald-400';
            case 'ditolak': return 'text-rose-400';
            default: return 'text-white';
        }
    };
    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/[0.07] transition-colors">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">{label}</p>
            <p className={`text-sm font-bold ${highlight ? getStatusStyle(status) : 'text-white'} uppercase tracking-wider`}>{value}</p>
        </div>
    );
}

function DocumentLink({ label, url }: { label: string, url: string }) {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `${elautBaseUrl}/storage/${url}`;
    return (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <FiEye size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Dokumen</span>
                    <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">PREVIEW</span>
                <FiChevronRight className="text-gray-700 group-hover:text-blue-400 transition-colors" />
            </div>
        </a>
    );
}

function InfoCard({ icon, title, description, color }: any) {
    const colors: any = {
        amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
    return (
        <div className="p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 space-y-4 text-white">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${colors[color]}`}>{icon}</div>
            <h4 className="text-xl font-calsans">{title}</h4>
            <p className="text-xs text-gray-500 font-light leading-relaxed">{description}</p>
        </div>
    );
}

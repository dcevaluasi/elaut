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
    FiChevronDown,
    FiCheck,
    FiAlertTriangle,
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { HashLoader } from 'react-spinners';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
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
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-900 transition-colors">{item}</p>
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
                    { title: "Verifikasi Berkas", desc: "Pemeriksaan kelayakan dokumen dan administrasi awal oleh tim Pusat." },
                    { title: "Validasi / Visitasi Lapangan", desc: "Peninjauan langsung fisik, sarana, dan prasarana di lokasi usaha." },
                    { title: "Penetapan P2MKP", desc: "Sidang pleno dan penerbitan Sertifikat Penetapan P2MKP resmi." }
                ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform text-white">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        question: "Berapa lama batas waktu perbaikan dokumen jika penolakan terjadi?",
        answer: "Apabila status verifikasi berkas atau validasi lapangan ditolak/perlu perbaikan, pemohon diberikan batas waktu maksimal 7 (tujuh) hari kerja sejak pemberitahuan untuk melakukan pengajuan ulang atau melengkapi berkas."
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
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
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
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-wider">{step.title}</p>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
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
            className={`rounded-3xl border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-sm md:text-base font-bold transition-colors duration-300 ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>
                    {question}
                </span>
                <div className={`p-2 rounded-xl transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-100'}`}>
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
                        <div className="px-8 pb-8 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ----------------------------------------------------
// Reusable Progress Stepper Component for Penetapan P2MKP
// ----------------------------------------------------
function PenetapanProgressTracker({ status, onRequestValidasiUlang, isResetting }: { status: string; onRequestValidasiUlang?: () => void; isResetting?: boolean }) {
    const s = (status || 'diajukan').toLowerCase();

    // Determine status categories
    const isApproved = ['approved', 'disetujui', 'selesai', 'aktif', 'penetapan', 'done'].includes(s);
    const isValidated = ['validated', 'validasi', 'visitasi', 'divalidasi'].includes(s);
    const isVerified = ['verified', 'diverifikasi', 'verifikasi', 'proses'].includes(s);

    // Failures
    const isVerifikasiFailed = s === 'perbaikan' || s === 'ditolak' || s === 'rejected' || s.includes('verifikasi ditolak') || s.includes('berkas ditolak');
    const isValidasiFailed = s.includes('validasi ditolak') || s.includes('visitasi ditolak') || s.includes('lapangan ditolak');

    let step1Done = false;
    let step2Done = false;
    let step3Done = false;

    if (isApproved) {
        step1Done = true;
        step2Done = true;
        step3Done = true;
    } else if (isValidated) {
        step1Done = true;
        step2Done = true;
        step3Done = false;
    } else if (isVerified) {
        step1Done = true;
        step2Done = false;
        step3Done = false;
    }

    const steps = [
        {
            number: 1,
            title: 'Verifikasi Berkas',
            desc: 'Pemeriksaan dokumen & kelayakan administrasi',
            isDone: step1Done,
            isActive: !step1Done && !isVerifikasiFailed && !isValidasiFailed,
            isFailed: isVerifikasiFailed,
        },
        {
            number: 2,
            title: 'Validasi / Visitasi Lapangan',
            desc: 'Peninjauan langsung fasilitas & sarana lapangan',
            isDone: step2Done,
            isActive: step1Done && !step2Done && !isValidasiFailed,
            isFailed: isValidasiFailed,
        },
        {
            number: 3,
            title: 'Penetapan',
            desc: 'Sidang pleno & penerbitan sertifikat resmi',
            isDone: step3Done,
            isActive: step1Done && step2Done && !step3Done,
            isFailed: false,
        },
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                    <h3 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                        <FiActivity className="text-blue-600" /> Progress & Tahapan Penetapan
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Alur verifikasi dan penetapan P2MKP Terpadu</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${step3Done ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    (isVerifikasiFailed || isValidasiFailed) ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                    Status: {status || 'Diajukan'}
                </div>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {steps.map((step) => (
                    <div key={step.number} className="relative flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="shrink-0 pt-0.5">
                            {step.isDone ? (
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <FiCheck size={20} strokeWidth={3} />
                                </div>
                            ) : step.isFailed ? (
                                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 animate-bounce">
                                    <FiXCircle size={20} />
                                </div>
                            ) : step.isActive ? (
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/30 ring-4 ring-blue-100">
                                    {step.number}
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-sm">
                                    {step.number}
                                </div>
                            )}
                        </div>

                        {/* Step Details */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-xs font-black uppercase tracking-wider ${step.isDone ? 'text-emerald-700' :
                                    step.isFailed ? 'text-rose-600 font-black' :
                                        step.isActive ? 'text-blue-600' :
                                            'text-slate-400'
                                    }`}>
                                    {step.number}. {step.title}
                                </h4>
                                {step.isDone && (
                                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                        ✓ Selesai
                                    </span>
                                )}
                                {step.isFailed && (
                                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                                        ✕ Ditolak / Perbaikan
                                    </span>
                                )}
                                {step.isActive && (
                                    <span className="text-[9px] font-extrabold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded animate-pulse">
                                        Sedang Proses
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Red Alert Banner & Re-submission Button if Verifikasi Failed */}
            {isVerifikasiFailed && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <FiAlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                        <div className="space-y-1">
                            <h5 className="text-xs font-black text-rose-800 uppercase tracking-wider">
                                Verifikasi Berkas Belum Memenuhi Syarat
                            </h5>
                            <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                                Dokumen pengajuan Anda perlu diperbaiki. Harap perbaiki dan unggah ulang berkas persyaratan maksimal <strong>7 hari kerja</strong> sejak status penolakan.
                            </p>
                        </div>
                    </div>
                    <Link href="/p2mkp/dashboard/penetapan/pengajuan" className="shrink-0 w-full md:w-auto">
                        <button className="w-full md:w-auto px-6 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95">
                            <FiEdit size={16} /> Perbaiki Berkas Sekarang
                        </button>
                    </Link>
                </div>
            )}

            {/* Red Alert Banner & Re-submission Button if Validasi Failed */}
            {isValidasiFailed && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <FiAlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                        <div className="space-y-1">
                            <h5 className="text-xs font-black text-rose-800 uppercase tracking-wider">
                                Validasi / Visitasi Lapangan Belum Memenuhi Standar
                            </h5>
                            <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                                Hasil visitasi sarana/prasarana lapangan belum memenuhi kriteria. Lakukan perbaikan fasilitas dan ajukan ulang dalam waktu maksimal <strong>7 hari kerja</strong> sejak pemberitahuan.
                            </p>
                        </div>
                    </div>
                    {onRequestValidasiUlang && (
                        <button
                            onClick={onRequestValidasiUlang}
                            disabled={isResetting}
                            className="shrink-0 w-full md:w-auto px-6 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isResetting ? (
                                <HashLoader size={14} color="#fff" />
                            ) : (
                                <>
                                    <FiCheck size={15} /> Ajukan Ulang Validasi
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PenetapanP2MKPPage() {
    const router = useRouter();
    const [p2mkpData, setP2mkpData] = useState<any>(null);
    const [penetapanData, setPenetapanData] = useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isResettingValidasi, setIsResettingValidasi] = useState(false);

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

    const handleRequestValidasiUlang = async () => {
        const latestEntry = penetapanData[0];
        if (!latestEntry) return;
        const entryId = latestEntry.IdPengajuanPenetapanPpmkp || latestEntry.id;
        if (!entryId) return;
        setIsResettingValidasi(true);
        try {
            const token = Cookies.get('XSRF091');
            await axios.put(
                `${elautBaseUrl}/p2mkp/update_pengjuan_penetapan_p2mkp?id=${entryId}`,
                { status: 'Verified' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh data
            const id_p2mkp = p2mkpData?.IdPpmkp || p2mkpData?.id_p2mkp || p2mkpData?.id;
            const res = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp?id_p2mkp=${id_p2mkp}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                const resData = res.data.data || (Array.isArray(res.data) ? res.data : []);
                setPenetapanData(resData.filter((item: any) => String(item.id_Ppmkp) === String(id_p2mkp)));
            }
        } catch (err) {
            console.error('Error resetting validasi status:', err);
        } finally {
            setIsResettingValidasi(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'dikirim': case 'diajukan': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'verified': case 'diverifikasi': case 'proses': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'validated': case 'validasi': case 'visitasi': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            case 'disetujui': case 'approved': case 'aktif': case 'selesai': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'ditolak': case 'perbaikan': case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const hasPending = penetapanData.some(item => {
        const s = (item.status || 'diajukan').toLowerCase();
        return ['diajukan', 'dikirim', 'proses', 'diverifikasi', 'pending', 'menunggu', 'perbaikan', 'verified', 'validated'].includes(s);
    });

    const statusP2mkp = p2mkpData?.StatusP2mkp || p2mkpData?.status_p2mkp || p2mkpData?.Status || p2mkpData?.status || p2mkpData?.StatusPpmkp || p2mkpData?.status_ppmkp;
    const isApproved = statusP2mkp === 'Approved' || statusP2mkp === 'Disetujui' || statusP2mkp === 'Aktif';
    const klasifikasi = p2mkpData?.Klasifikasi || p2mkpData?.klasifikasi;
    const isTidakTerklasifikasi = !klasifikasi || klasifikasi === 'TIDAK TERKLASIFIKASI';
    const approvedSubmission = penetapanData.find(item => item.status?.toLowerCase() === 'disetujui' || item.status?.toLowerCase() === 'approved') || penetapanData[0];
    const latestSubmission = penetapanData.length > 0 ? penetapanData[0] : null;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-10 pb-24"
            >
                {/* Header Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                            Penetapan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">P2MKP</span>
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Kelola legalitas dan pantau progres penetapan lembaga Anda secara terpadu.</p>
                    </div>
                    {!isDataLoading && !hasPending && !isApproved && (
                        <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                            <button className="group relative h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 overflow-hidden active:scale-95 text-xs uppercase">
                                <FiPlus size={18} className="group-hover:rotate-90 transition-transform" />
                                AJUKAN PENETAPAN
                                <div className="absolute inset-0 w-12 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[600%] transition-transform duration-1000" />
                            </button>
                        </Link>
                    )}
                </div>

                {/* Main Progress Stepper Card */}
                {!isDataLoading && (latestSubmission || isApproved) && (
                    <PenetapanProgressTracker
                        status={isApproved ? 'Approved' : (latestSubmission?.status || 'Diajukan')}
                        onRequestValidasiUlang={handleRequestValidasiUlang}
                        isResetting={isResettingValidasi}
                    />
                )}

                {isApproved ? (
                    <div className="grid gap-8">
                        {/* Sertifikat Penetapan Card - Redesigned */}
                        <div className="rounded-[2rem] overflow-hidden border border-emerald-200 shadow-lg shadow-emerald-500/10">
                            {/* Dark Header */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                                    <FiAward className="text-emerald-400" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Sertifikat Penetapan P2MKP</h2>
                                    <p className="text-emerald-400/80 text-[10px] font-bold uppercase tracking-widest mt-0.5">Status: Ditetapkan & Disetujui oleh Pusat</p>
                                </div>
                            </div>

                            {/* Hard-copy notice banner */}
                            <div className="px-8 py-4 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
                                <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                    <strong>Informasi:</strong> Sertifikat Penetapan P2MKP akan ditandatangani oleh <strong>Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDM KP)</strong> secara <em>hard copy</em>. Untuk informasi lebih lanjut mengenai pengambilan sertifikat, silakan menunggu pemberitahuan dari <strong>tim Pusat Pelatihan Kelautan dan Perikanan</strong>.
                                </p>
                            </div>

                            {/* Data Grid */}
                            <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <DetailMetaCard label="Nama P2MKP" value={p2mkpData?.NamaPpmkp || p2mkpData?.nama_ppmkp || '-'} />
                                <DetailMetaCard label="Tahun Penetapan" value={approvedSubmission?.tahun_penetapan || p2mkpData?.TahunPenetapan || '-'} />
                                <DetailMetaCard label="Penanggung Jawab" value={p2mkpData?.NamaPenanggungJawab || p2mkpData?.nama_penanggung_jawab || p2mkpData?.Ketua || '-'} />
                                <DetailMetaCard label="Bidang Pelatihan" value={p2mkpData?.JenisBidangPelatihan || p2mkpData?.jenis_bidang_pelatihan || '-'} />
                                <DetailMetaCard label="Jenis Pelatihan" value={p2mkpData?.JenisPelatihan || p2mkpData?.jenis_pelatihan || '-'} />
                                <DetailMetaCard label="Nomor Sertifikat" value={p2mkpData?.NomorSertifikat || p2mkpData?.nomor_sertifikat || approvedSubmission?.nomor_sertifikat || '-'} highlight status="Disetujui" />
                                <DetailMetaCard label="Tanggal Sertifikat" value={p2mkpData?.TanggalSertifikat || p2mkpData?.tanggal_sertifikat || approvedSubmission?.tanggal_sertifikat || '-'} />
                                <DetailMetaCard label="Nomor Keputusan / SK" value={approvedSubmission?.nomor_surat || p2mkpData?.nomor_surat || '-'} />
                                <DetailMetaCard label="Tanggal Keputusan" value={approvedSubmission?.tanggal_surat || p2mkpData?.tanggal_surat || '-'} />
                            </div>

                            {isTidakTerklasifikasi && (
                                <div className="px-8 pb-8 bg-white border-t border-slate-100 pt-6 flex justify-end">
                                    <Link href="/p2mkp/dashboard/klasifikasi">
                                        <button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 active:scale-95 text-xs uppercase">
                                            <FiAward size={18} />
                                            AJUKAN KLASIFIKASI
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Documents Section */}
                        <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <FiFileText className="text-blue-600" /> Dokumen Permohonan Penetapan
                            </h2>
                            <div className="grid gap-3">
                                <DocumentLink label="Identifikasi Calon P2MKP" url={p2mkpData?.dokumen_identifikasi_pemilik || approvedSubmission?.DokumenIdentifikasiPemilik || ''} />
                                <DocumentLink label="Asesmen Mandiri" url={p2mkpData?.dokumen_asesment_mandiri || approvedSubmission?.DokumenAsesmentMandiri || ''} />
                                <DocumentLink label="Surat Pernyataan Calon P2MKP" url={p2mkpData?.dokument_surat_pernyataan || approvedSubmission?.DokumentSuratPernyataan || ''} />
                                <DocumentLink label="Surat Legalitas Usaha (NIB)" url={p2mkpData?.dokumen_keterangan_usaha || approvedSubmission?.DokumenKeteranganUsaha || ''} />
                                <DocumentLink label="Surat Tidak Afiliasi Partai Politik" url={p2mkpData?.dokumen_afiliasi_parpol || approvedSubmission?.DokumenAfiliasiParpol || ''} />
                                <DocumentLink label="Surat Rekomendasi Dinas" url={p2mkpData?.dokumen_rekomendasi_dinas || approvedSubmission?.DokumenRekomendasiDinas || ''} />
                                <DocumentLink label="Surat Permohonan Pembentukan" url={p2mkpData?.dokumen_permohonan_pembentukan || approvedSubmission?.DokumenPermohonanPembentukan || ''} />
                                {p2mkpData?.dokumen_permohonan_klasifikasi && (
                                    <DocumentLink label="Permohonan Klasifikasi" url={p2mkpData.dokumen_permohonan_klasifikasi} />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Submissions List */}
                        {isDataLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <HashLoader color="#3b82f6" size={40} />
                            </div>
                        ) : penetapanData.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">
                                    Riwayat & Status Pengajuan
                                </h3>
                                <div className="grid gap-5">
                                    {penetapanData.map((item: any, index: number) => {
                                        const s = (item.status || '').toLowerCase();
                                        const isFailed = ['perbaikan', 'ditolak', 'rejected', 'verifikasi ditolak', 'validasi ditolak'].includes(s);

                                        return (
                                            <motion.div
                                                key={item.IdPengajuan || index}
                                                whileHover={{ y: -3 }}
                                                onClick={() => { setSelectedSubmission(item); setIsDetailOpen(true); }}
                                                className="group p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                        <FiFileText />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-extrabold text-lg text-slate-800">
                                                            Pengajuan Penetapan P2MKP {item.tahun_penetapan || new Date().getFullYear()}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <FiCalendar /> {item.create_at ? new Date(item.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">

                                                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] ${getStatusStyle(item.status || 'Diajukan')}`}>
                                                        {item.status || 'Diajukan'}
                                                    </div>
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
                                                        <FiChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-16 rounded-[2rem] bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-6 shadow-sm"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400">
                                    <FiFileText size={40} className="animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-800">Belum Ada Pengajuan</h3>
                                    <p className="text-slate-500 text-xs max-w-xl font-medium leading-relaxed">
                                        Anda belum memiliki record pengajuan penetapan. Lakukan pengajuan pertama Anda untuk menetapkan lembaga atau usaha anda sebagai P2MKP.
                                    </p>
                                </div>
                                <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                                    <button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-blue-500/20 text-xs uppercase">
                                        <FiPlus size={18} /> AJUKAN PENETAPAN
                                    </button>
                                </Link>
                            </motion.div>
                        )}

                        {/* Informational Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard icon={<FiClock />} title="Timeline Verifikasi" description="Proses peninjauan dokumen (5 hari) dan visitasi lapangan (14 hari) dilakukan secara terstruktur hingga penetapan diterbitkan." color="amber" />
                            <InfoCard icon={<FiCheckCircle />} title="Kriteria Kelulusan" description="Pastikan seluruh dokumen legalitas dan kelayakan teknis telah sesuai dengan standar P2MKP untuk mempercepat proses penetapan." color="emerald" />
                        </div>

                        {/* FAQ Section */}
                        <div className="space-y-6 pt-4">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-black text-slate-900">Frequently Asked <span className="text-blue-600">Questions</span></h2>
                                <p className="text-slate-500 text-xs font-medium">Informasi lengkap mengenai proses penetapan dan verifikasi P2MKP.</p>
                            </div>
                            <div className="grid gap-4">
                                {FAQ_DATA.map((item, index) => (
                                    <FAQItem key={index} question={item.question} answer={item.answer} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Detail Overlay Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedSubmission && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <FiFileText size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">Detail <span className="text-blue-600">Pengajuan</span></h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Detail Pengajuan Penetapan P2MKP</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailOpen(false)} className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-500">
                                    <FiX size={18} />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                                {/* Stepper inside modal */}
                                <PenetapanProgressTracker status={selectedSubmission.status || 'Diajukan'} />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailMetaCard label="Status Verifikasi" value={selectedSubmission.status || 'Diajukan'} highlight status={selectedSubmission.status} />
                                    <DetailMetaCard label="Tahun Penetapan" value={selectedSubmission.tahun_penetapan || new Date().getFullYear()} />
                                    <DetailMetaCard label="Klasifikasi LPK" value={selectedSubmission.is_lpk === 'Ya' ? 'LPK Terverifikasi' : 'Non-LPK'} />
                                    <DetailMetaCard label="Tanggal Diajukan" value={selectedSubmission.create_at ? new Date(selectedSubmission.create_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                                </div>

                                <div className="grid gap-3 pt-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lampiran Dokumen Persyaratan</p>
                                    <DocumentLink label="Identifikasi Calon P2MKP" url={selectedSubmission.DokumenIdentifikasiPemilik} />
                                    <DocumentLink label="Identifikasi Asesmen Mandiri" url={selectedSubmission.DokumenAsesmentMandiri} />
                                    <DocumentLink label="Surat Pernyataan Calon P2MKP" url={selectedSubmission.DokumentSuratPernyataan} />
                                    <DocumentLink label="Surat Legalitas Usaha" url={selectedSubmission.DokumenKeteranganUsaha} />
                                    <DocumentLink label="Surat Tidak Afiliasi Partai Politik" url={selectedSubmission.DokumenAfiliasiParpol} />
                                    <DocumentLink label="Surat Rekomendasi Dinas" url={selectedSubmission.DokumenRekomendasiDinas} />
                                    <DocumentLink label="Surat Permohonan Pembentukan" url={selectedSubmission.DokumenPermohonanPembentukan} />
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setIsDetailOpen(false)} className="px-6 h-11 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
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
            case 'dikirim': case 'diajukan': return 'text-blue-600';
            case 'verified': case 'diverifikasi': case 'proses': return 'text-purple-600';
            case 'validated': case 'validasi': case 'visitasi': return 'text-indigo-600';
            case 'disetujui': case 'approved': case 'aktif': return 'text-emerald-600';
            case 'ditolak': case 'perbaikan': case 'rejected': return 'text-rose-600';
            default: return 'text-slate-800';
        }
    };
    return (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 hover:bg-slate-100 transition-colors shadow-sm">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label}</p>
            <p className={`text-xs md:text-sm font-black ${highlight ? getStatusStyle(status) : 'text-slate-800'} uppercase tracking-wider`}>{value}</p>
        </div>
    );
}

function DocumentLink({ label, url }: { label: string, url: string }) {
    const hasFile = !!url;
    const fullUrl = hasFile ? (url.startsWith('http') ? url : `${elautBaseUrl}/storage/${url}`) : '#';
    return (
        <div className={`group flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm ${
            hasFile ? 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer' : 'bg-slate-50 border-slate-100 opacity-60'
        }`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    hasFile ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                    <FiFileText size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dokumen</span>
                    <span className={`text-xs font-bold transition-colors ${
                        hasFile ? 'text-slate-700 group-hover:text-blue-700' : 'text-slate-400'
                    }`}>{label}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {hasFile ? (
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 bg-blue-100 px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <FiEye size={11} /> Lihat
                    </a>
                ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">Tidak Ada</span>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon, title, description, color }: any) {
    const colors: any = {
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    };
    return (
        <div className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm space-y-3 text-slate-800">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${colors[color]}`}>{icon}</div>
            <h4 className="text-lg font-bold">{title}</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
    );
}

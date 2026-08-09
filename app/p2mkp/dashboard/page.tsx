'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiActivity,
    FiAward,
    FiCheckCircle,
    FiClock,
    FiUser,
    FiMapPin,
    FiPhone,
    FiMail,
    FiFileText,
    FiArrowRight,
    FiShield,
    FiStar,
    FiAlertTriangle,
    FiEdit,
} from 'react-icons/fi';
import { TbFileCertificate, TbRosette } from 'react-icons/tb';
import Link from 'next/link';
import DashboardLayout from './DashboardLayout';
import Cookies from 'js-cookie';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';
import { HashLoader } from 'react-spinners';

export default function P2MKPDashboardPage() {
    const [userData, setUserData] = useState<any>(null);
    const [penetapanData, setPenetapanData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (!token) return;

                const res = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.status === 200) {
                    const data = res.data.data || res.data;
                    setUserData(data);

                    const idP2mkp = data.IdPpmkp || data.id_p2mkp || data.id;
                    if (idP2mkp) {
                        try {
                            const pRes = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp?id_p2mkp=${idP2mkp}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (pRes.status === 200) {
                                const pData = pRes.data.data || (Array.isArray(pRes.data) ? pRes.data : []);
                                const matched = pData.find((item: any) => String(item.id_Ppmkp) === String(idP2mkp));
                                setPenetapanData(matched || pData[0] || null);
                            }
                        } catch {
                            // silent — no pengajuan yet
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <HashLoader color="#3b82f6" size={44} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Memuat Dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    // ---- Derived state ----
    const nama = userData?.NamaPpmkp || userData?.nama_ppmkp || userData?.Nama || userData?.nama || 'P2MKP';
    const statusP2mkp = userData?.Status || userData?.status || userData?.StatusPpmkp || userData?.status_ppmkp || '';
    const isApproved = ['approved', 'disetujui', 'aktif'].includes(statusP2mkp.toLowerCase());
    const klasifikasi = userData?.Klasifikasi || userData?.klasifikasi || '';
    const isKlasifikasi = !!klasifikasi && klasifikasi !== 'TIDAK TERKLASIFIKASI';

    // penetapan status
    const penetapanStatus = penetapanData?.status || '';
    const hasPengajuan = !!penetapanData;
    const penetapanStatusLower = penetapanStatus.toLowerCase();
    const isPenetapanApproved = isApproved || ['approved', 'disetujui'].includes(penetapanStatusLower);
    const isPenetapanPending = hasPengajuan && !isPenetapanApproved;

    // Profile completion score
    const profileFields = [
        { key: 'nama_ppmkp', label: 'Nama Lembaga', val: userData?.nama_ppmkp || userData?.NamaPpmkp },
        { key: 'alamat', label: 'Alamat', val: userData?.Alamat || userData?.alamat },
        { key: 'provinsi', label: 'Provinsi', val: userData?.Provinsi || userData?.provinsi },
        { key: 'kota', label: 'Kota / Kabupaten', val: userData?.Kota || userData?.kota },
        { key: 'no_telp', label: 'Telepon', val: userData?.NoTelp || userData?.no_telp },
        { key: 'email', label: 'Email', val: userData?.Email || userData?.email },
        { key: 'nib', label: 'NIB', val: userData?.Nib || userData?.nib },
        { key: 'nama_penanggung_jawab', label: 'Penanggung Jawab', val: userData?.NamaPenanggungJawab || userData?.nama_penanggung_jawab },
        { key: 'jenis_bidang_pelatihan', label: 'Bidang Pelatihan', val: userData?.JenisBidangPelatihan || userData?.jenis_bidang_pelatihan },
        { key: 'jenis_pelatihan', label: 'Jenis Pelatihan', val: userData?.JenisPelatihan || userData?.jenis_pelatihan },
    ];
    const filledCount = profileFields.filter(f => !!f.val).length;
    const profilePct = Math.round((filledCount / profileFields.length) * 100);
    const profileColor = profilePct < 50 ? '#ef4444' : profilePct < 80 ? '#f59e0b' : '#10b981';

    // Overall journey steps
    const journeySteps = [
        {
            number: 1,
            title: 'Lengkapi Profil',
            desc: 'Isi data identitas, alamat, dan bidang usaha P2MKP',
            icon: <FiUser size={20} />,
            isDone: profilePct >= 80,
            isActive: profilePct < 80,
            href: '/p2mkp/dashboard/complete-profile',
            ctaLabel: 'Lengkapi Sekarang',
            color: 'blue',
        },
        {
            number: 2,
            title: 'Pengajuan Penetapan',
            desc: 'Upload 7 dokumen persyaratan dan ajukan ke tim Pusat',
            icon: <TbFileCertificate size={20} />,
            isDone: isPenetapanApproved,
            isActive: profilePct >= 80 && !isPenetapanApproved,
            inProgress: isPenetapanPending,
            href: hasPengajuan ? '/p2mkp/dashboard/penetapan' : '/p2mkp/dashboard/penetapan/pengajuan',
            ctaLabel: hasPengajuan ? 'Lihat Status' : 'Ajukan Sekarang',
            color: 'indigo',
        },
        {
            number: 3,
            title: 'Klasifikasi P2MKP',
            desc: 'Dapatkan klasifikasi resmi untuk meningkatkan kredensial lembaga',
            icon: <TbRosette size={20} />,
            isDone: isKlasifikasi,
            isActive: isPenetapanApproved && !isKlasifikasi,
            href: '/p2mkp/dashboard/klasifikasi',
            ctaLabel: isKlasifikasi ? 'Lihat Klasifikasi' : 'Ajukan Klasifikasi',
            color: 'amber',
        },
    ];

    const doneSteps = journeySteps.filter(s => s.isDone).length;
    const overallPct = Math.round((doneSteps / journeySteps.length) * 100);

    const colorMap: any = {
        blue: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', shadow: 'shadow-blue-500/20' },
        indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', shadow: 'shadow-indigo-500/20' },
        amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', shadow: 'shadow-amber-500/20' },
    };

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8 pb-24 pt-6"
            >
                {/* ── Welcome Header ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Dashboard P2MKP</p>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                            Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 truncate max-w-xs inline-block">{nama}</span> 👋
                        </h1>
                        <p className="text-slate-500 text-xs font-medium mt-1">Pantau progress legalitas dan standarisasi lembaga P2MKP Anda secara real-time.</p>
                    </div>
                    {isPenetapanApproved && (
                        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                            <FiCheckCircle className="text-emerald-600" size={20} />
                            <div>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Status Resmi</p>
                                <p className="text-sm font-black text-emerald-800 uppercase">Lembaga Ditetapkan ✓</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Overall Journey Progress ── */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <FiActivity className="text-blue-600" /> Progress Kelembagaan P2MKP
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{doneSteps} dari {journeySteps.length} tahap diselesaikan</p>
                        </div>
                        <span className="text-3xl font-black text-slate-900">{overallPct}<span className="text-lg text-slate-400">%</span></span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                        {journeySteps.map((step) => {
                            const c = colorMap[step.color];
                            return (
                                <div
                                    key={step.number}
                                    className={`relative p-5 rounded-2xl border transition-all ${
                                        step.isDone
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : step.isActive || step.inProgress
                                            ? `${c.light} ${c.border}`
                                            : 'bg-slate-50 border-slate-200 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            step.isDone ? 'bg-emerald-500 text-white' :
                                            step.isActive || step.inProgress ? `${c.bg} text-white` :
                                            'bg-slate-200 text-slate-400'
                                        }`}>
                                            {step.isDone ? <FiCheckCircle size={20} /> : step.icon}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                            step.isDone ? 'bg-emerald-100 text-emerald-700' :
                                            step.inProgress ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                            step.isActive ? `${c.light} ${c.text}` :
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                            {step.isDone ? '✓ Selesai' : step.inProgress ? 'Sedang Proses' : step.isActive ? 'Perlu Tindakan' : 'Menunggu'}
                                        </span>
                                    </div>
                                    <h4 className={`text-xs font-black uppercase tracking-wide ${
                                        step.isDone ? 'text-emerald-800' : step.isActive || step.inProgress ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                        {step.number}. {step.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1 mb-4">{step.desc}</p>
                                    <Link href={step.href}>
                                        <button className={`w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                            step.isDone
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                : step.isActive || step.inProgress
                                                ? `${c.bg} text-white shadow-lg ${c.shadow} hover:opacity-90`
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}>
                                            {step.ctaLabel} {!step.isDone && <FiArrowRight size={12} />}
                                        </button>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Two-column section: Profile Completion + Quick Info ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Completion Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <FiUser className="text-blue-600" /> Kelengkapan Profil
                            </h3>
                            <span className="text-xl font-black" style={{ color: profileColor }}>{profilePct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${profilePct}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                style={{ backgroundColor: profileColor }}
                            />
                        </div>
                        <div className="space-y-2">
                            {profileFields.map((f) => (
                                <div key={f.key} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{f.label}</span>
                                    {f.val ? (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg">
                                            <FiCheckCircle size={9} /> Terisi
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">
                                            <FiAlertTriangle size={9} /> Kosong
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Link href="/p2mkp/dashboard/complete-profile">
                            <button className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                                <FiEdit size={13} /> Edit Profil
                            </button>
                        </Link>
                    </div>

                    {/* Info Cards Column */}
                    <div className="space-y-5">
                        {/* Identity Quick Info */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <FiShield className="text-indigo-600" /> Info Lembaga
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: <FiMapPin size={13} className="text-rose-500" />, label: 'Lokasi', value: [userData?.Kota || userData?.kota, userData?.Provinsi || userData?.provinsi].filter(Boolean).join(', ') || '-' },
                                    { icon: <FiPhone size={13} className="text-blue-500" />, label: 'Telepon', value: userData?.NoTelp || userData?.no_telp || '-' },
                                    { icon: <FiMail size={13} className="text-emerald-500" />, label: 'Email', value: userData?.Email || userData?.email || '-' },
                                    { icon: <FiFileText size={13} className="text-amber-500" />, label: 'NIB', value: userData?.Nib || userData?.nib || '-' },
                                    { icon: <FiStar size={13} className="text-purple-500" />, label: 'Bidang Pelatihan', value: userData?.JenisBidangPelatihan || userData?.jenis_bidang_pelatihan || '-' },
                                ].map(({ icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">{icon}</div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Penetapan Status Card */}
                        <div className={`rounded-3xl p-6 border shadow-sm space-y-3 ${
                            isPenetapanApproved ? 'bg-emerald-50 border-emerald-200' :
                            isPenetapanPending ? 'bg-blue-50 border-blue-200' :
                            'bg-white border-slate-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isPenetapanApproved ? 'bg-emerald-500 text-white' :
                                    isPenetapanPending ? 'bg-blue-600 text-white' :
                                    'bg-slate-100 text-slate-400'
                                }`}>
                                    <TbFileCertificate size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Status Penetapan</p>
                                    <p className={`text-sm font-black uppercase ${
                                        isPenetapanApproved ? 'text-emerald-800' :
                                        isPenetapanPending ? 'text-blue-800' :
                                        'text-slate-600'
                                    }`}>
                                        {isPenetapanApproved ? '✓ Ditetapkan' : isPenetapanPending ? `⏳ ${penetapanStatus}` : 'Belum Diajukan'}
                                    </p>
                                </div>
                            </div>
                            {isPenetapanApproved && (
                                <div className="text-[10px] text-emerald-700 font-medium space-y-0.5">
                                    {(userData?.nomor_sertifikat || penetapanData?.nomor_sertifikat) && (
                                        <p>No. Sertifikat: <strong>{userData?.nomor_sertifikat || penetapanData?.nomor_sertifikat}</strong></p>
                                    )}
                                    {(userData?.tanggal_sertifikat || penetapanData?.tanggal_sertifikat) && (
                                        <p>Tanggal: <strong>{userData?.tanggal_sertifikat || penetapanData?.tanggal_sertifikat}</strong></p>
                                    )}
                                    {isKlasifikasi && (
                                        <p>Klasifikasi: <strong className="uppercase">{klasifikasi}</strong></p>
                                    )}
                                </div>
                            )}
                            <Link href="/p2mkp/dashboard/penetapan">
                                <button className={`w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    isPenetapanApproved
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : isPenetapanPending
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                }`}>
                                    {isPenetapanApproved ? 'Lihat Sertifikat' : isPenetapanPending ? 'Pantau Progress' : 'Ajukan Penetapan'}
                                    <FiArrowRight size={12} />
                                </button>
                            </Link>
                        </div>

                        {/* Klasifikasi Card */}
                        <div className={`rounded-3xl p-6 border shadow-sm space-y-3 ${
                            isKlasifikasi ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isKlasifikasi ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <TbRosette size={20} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Klasifikasi P2MKP</p>
                                    <p className={`text-sm font-black uppercase ${isKlasifikasi ? 'text-amber-800' : 'text-slate-600'}`}>
                                        {isKlasifikasi ? `✓ ${klasifikasi}` : 'Belum Terklasifikasi'}
                                    </p>
                                </div>
                            </div>
                            {!isKlasifikasi && isPenetapanApproved && (
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                    Ajukan klasifikasi untuk mendapatkan pengakuan resmi tingkatan kompetensi lembaga P2MKP Anda.
                                </p>
                            )}
                            {!isPenetapanApproved && !isKlasifikasi && (
                                <p className="text-[10px] text-slate-400 font-medium">Selesaikan penetapan terlebih dahulu untuk mengajukan klasifikasi.</p>
                            )}
                            {isPenetapanApproved && (
                                <Link href="/p2mkp/dashboard/klasifikasi">
                                    <button className={`w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                        isKlasifikasi
                                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                                            : 'bg-slate-800 text-white hover:bg-slate-700'
                                    }`}>
                                        {isKlasifikasi ? 'Lihat Klasifikasi' : 'Ajukan Klasifikasi'} <FiArrowRight size={12} />
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Quick Action Bar ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: <FiUser size={20} />, label: 'Profil', desc: 'Edit data lembaga', href: '/p2mkp/dashboard/complete-profile', color: 'blue' },
                        { icon: <TbFileCertificate size={20} />, label: 'Penetapan', desc: 'Status & progres', href: '/p2mkp/dashboard/penetapan', color: 'indigo' },
                        { icon: <TbRosette size={20} />, label: 'Klasifikasi', desc: 'Ajukan atau lihat', href: '/p2mkp/dashboard/klasifikasi', color: 'amber' },
                        { icon: <FiClock size={20} />, label: 'Riwayat', desc: 'Log pengajuan', href: '/p2mkp/dashboard/penetapan', color: 'slate' },
                    ].map((item) => (
                        <Link key={item.label} href={item.href}>
                            <motion.div
                                whileHover={{ y: -3 }}
                                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group space-y-3"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                                    item.color === 'blue' ? 'bg-blue-600' :
                                    item.color === 'indigo' ? 'bg-indigo-600' :
                                    item.color === 'amber' ? 'bg-amber-500' : 'bg-slate-700'
                                }`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}

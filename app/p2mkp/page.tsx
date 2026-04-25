'use client';

import React, { useRef, useState, useEffect } from 'react';
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import dynamic from 'next/dynamic';
import { FiBriefcase, FiUsers, FiAnchor, FiTarget, FiAward, FiFileText, FiCheckCircle, FiMapPin, FiArrowRight, FiUserCheck, FiActivity, FiShield, FiLayers, FiTrendingUp, FiCpu, FiPlus, FiMinus, FiChevronDown, FiPlay, FiX, FiYoutube } from 'react-icons/fi';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useCountUp } from 'react-countup';
import { elautBaseUrl } from '@/constants/urls';
import { P2MKP } from '@/types/p2mkp';
import type { P2MKPPin } from '@/components/ui/P2MKPLeafletMap';

const REGULATION = "Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024"

// --- Video Gallery Data ---
const VIDEO_GALLERY = [
    {
        id: 'vWf0UgE980A',
        title: 'P2MKP Kirno Bersaudara',
        description: 'Pengenalan Pusat Pelatihan Mandiri Kelautan dan Perikanan sebagai lembaga pelatihan berbasis masyarakat.'
    },
    {
        id: 'vOw6zO_8aM0',
        title: 'P2MKP Tambakan Sukses Budi Daya Gurame Nila, Mas, dan Lele',
        description: 'Panduan lengkap tahapan pengajuan dan penetapan resmi lembaga P2MKP oleh BPPP.'
    },
    {
        id: 'RpcS1lG0rfw',
        title: 'Cerita Sukses Bisnis Ikan Lele',
        description: 'Memahami tingkatan klasifikasi P2MKP: Pemula, Muda, Madya, dan Utama.'
    },
    {
        id: 'P9TQ10UTyIA',
        title: 'Kisah Sukses Budi Daya Ikan Nila, P2MKP Mina Tarna Bakti Sleman',
        description: 'Keuntungan dan manfaat menjadi bagian dari jaringan P2MKP nasional di bidang kelautan dan perikanan.'
    },
    {
        id: 'msBCLWDD4E0',
        title: 'P2MKP Citra Handycraft - Pembuatan Hiasan Kerang',
        description: 'Kisah sukses dan pengalaman nyata dari para pengelola dan peserta P2MKP di seluruh Indonesia.'
    },
];

const ISLAND_GROUPS = [
    { name: 'Sumatera', icon: '🌴', color: 'from-emerald-500 to-teal-600', provinces: ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung'] },
    { name: 'Jawa & Bali', icon: '🏯', color: 'from-blue-500 to-indigo-600', provinces: ['DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali'] },
    { name: 'Kalimantan', icon: '🌿', color: 'from-amber-500 to-orange-600', provinces: ['Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara'] },
    { name: 'Sulawesi', icon: '🐚', color: 'from-cyan-500 to-blue-600', provinces: ['Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara'] },
    { name: 'Nusa Tenggara', icon: '🦎', color: 'from-violet-500 to-purple-600', provinces: ['Nusa Tenggara Barat', 'Nusa Tenggara Timur'] },
    { name: 'Maluku & Papua', icon: '🦜', color: 'from-rose-500 to-pink-600', provinces: ['Maluku', 'Maluku Utara', 'Papua Barat', 'Papua Barat Daya', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan', 'Papua'] },
];

const P2MKPLeafletMap = dynamic(() => import('@/components/ui/P2MKPLeafletMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#020617] rounded-[2rem]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Memuat Peta...</span>
            </div>
        </div>
    ),
});

// --- Helper Components ---

const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
    return <span>{value.toLocaleString()}</span>;
};

const SectionTitle = ({ subtitle, title, description, light = false }: any) => (
    <div className="text-center space-y-2 mb-8 px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest"
        >
            {subtitle}
        </motion.div>
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-2xl md:text-3xl lg:text-4xl font-calsans leading-tight ${light ? 'text-white' : 'text-slate-900'}`}
        >
            {title}
        </motion.h2>
        {description && (
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed"
            >
                {description}
            </motion.p>
        )}
    </div>
);

const FAQ_TABS = [
    {
        id: 'p2mkp',
        label: 'Seputar P2MKP',
        icon: '🏛️',
        items: [
            {
                question: "Apa itu P2MKP?",
                answer: "Pusat Pelatihan Mandiri Kelautan dan Perikanan yang selanjutnya disingkat P2MKP adalah lembaga pelatihan kelautan dan perikanan mandiri yang dibentuk, dikelola, dan dilaksanakan oleh pelaku usaha di sektor kelautan dan perikanan."
            },
            {
                question: "Bidang usaha atau pelatihan apa saja yang dapat mengajukan sebagai P2MKP?",
                answer: (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Pengelolaan ruang laut",
                            "Penangkapan ikan",
                            "Pengangkutan ikan",
                            "Pembudidayaan ikan",
                            "Pengolahan ikan",
                            "Pemasaran ikan"
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{item}</p>
                            </div>
                        ))}
                    </div>
                )
            },
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
                question: "Dasar hukum apa yang mengatur P2MKP?",
                answer: "P2MKP diatur berdasarkan Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024. Regulasi ini mencakup seluruh aspek pembentukan, pengelolaan, klasifikasi, dan pembinaan P2MKP."
            },
            {
                question: "Siapa yang dapat mendirikan P2MKP?",
                answer: "P2MKP dapat didirikan oleh pelaku usaha di bidang kelautan dan perikanan yang telah menjalankan usahanya secara aktif selama minimal 1 (satu) tahun dan memenuhi seluruh persyaratan teknis dan administratif yang ditetapkan."
            }
        ]
    },
    {
        id: 'penetapan',
        label: 'Seputar Penetapan',
        icon: '📋',
        items: [
            {
                question: "Apa saja tahapan penetapan P2MKP?",
                answer: (
                    <div className="space-y-4">
                        {[
                            { title: "Persiapan", desc: "Penyusunan dokumen & asesmen mandiri di portal." },
                            { title: "Verifikasi", desc: "Pemeriksaan kelayakan administrasi oleh Pusat Pelatihan KP." },
                            { title: "Visitasi", desc: "Peninjauan langsung fasilitas & sarana prasarana." },
                            { title: "Penetapan", desc: "Penetapan dan penerbitan sertifikata resmi sebagai P2MKP." }
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform text-white">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{step.title}</p>
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
            },
            {
                question: "Dokumen apa saja yang harus disiapkan untuk pengajuan penetapan?",
                answer: (
                    <div className="space-y-3">
                        {[
                            "Formulir Identifikasi Calon P2MKP",
                            "Formulir Asesmen Mandiri",
                            "Surat Pernyataan Calon P2MKP",
                            "Surat Keterangan Legalitas Usaha (NIB / SIUP)",
                            "Surat Tidak Berafiliasi dengan Partai Politik",
                            "Surat Rekomendasi dari Dinas terkait",
                            "Surat Permohonan Pembentukan P2MKP",
                        ].map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <p className="text-gray-400 text-sm group-hover:text-white transition-colors">{doc}</p>
                            </div>
                        ))}
                    </div>
                )
            }
        ]
    },
    {
        id: 'klasifikasi',
        label: 'Seputar Klasifikasi',
        icon: '🏆',
        items: [
            {
                question: "Apa itu Klasifikasi P2MKP?",
                answer: "Klasifikasi P2MKP adalah penilaian tingkat kemampuan dan kapasitas lembaga P2MKP yang ditetapkan berdasarkan hasil evaluasi terhadap aspek sumber daya manusia, sarana prasarana, kurikulum, dan manajemen kelembagaan."
            },
            {
                question: "Apa saja tingkatan klasifikasi P2MKP?",
                answer: (
                    <div className="space-y-3">
                        <p className="text-gray-500 text-xs pb-2">Klasifikasi P2MKP terdiri dari 4 (empat) tingkatan, dari yang terendah hingga tertinggi:</p>
                        {[
                            { rank: "4", title: "Pemula", badge: "🥉", color: "amber", desc: "Tingkat Pemula (terendah). Bagi P2MKP yang baru ditetapkan dengan kapasitas dan fasilitas dasar sesuai standar minimal." },
                            { rank: "3", title: "Muda", badge: "🥈", color: "blue", desc: "Tingkat kedua. P2MKP yang telah menunjukkan perkembangan kapasitas SDM dan sarana penyelenggaraan pelatihan." },
                            { rank: "2", title: "Madya", badge: "🥇", color: "indigo", desc: "Tingkat ketiga. P2MKP dengan kapasitas, manajemen, dan kurikulum pelatihan yang lebih komprehensif." },
                            { rank: "1", title: "Utama", badge: "🏆", color: "purple", desc: "Tingkat tertinggi. P2MKP unggulan dengan standar fasilitas, SDM, manajemen, dan kemitraan yang excellent." }
                        ].map((level, idx) => (
                            <div key={idx} className="flex gap-4 items-start group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className="text-2xl">{level.badge}</div>
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Lv.{level.rank}</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-wider">{level.title}</p>
                                    <p className="text-gray-400 text-xs leading-relaxed">{level.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                question: "Bagaimana proses penilaian klasifikasi dilakukan?",
                answer: (
                    <div className="space-y-4">
                        {[
                            { title: "Pengajuan & Evaluasi Mandiri", desc: "P2MKP mengisi formulir penilaian mandiri mencakup aspek SDM, sarana, manajemen, dan kurikulum." },
                            { title: "Verifikasi Lapangan", desc: "Tim penilai melakukan kunjungan untuk memvalidasi data yang telah dilaporkan oleh P2MKP." },
                            { title: "Sidang Klasifikasi", desc: "Rapat pleno menentukan tingkat klasifikasi berdasarkan akumulasi skor penilaian." },
                            { title: "Penerbitan Sertifikat", desc: "Sertifikat klasifikasi resmi diterbitkan dan berlaku selama periode yang ditetapkan." },
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform text-white">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{step.title}</p>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                question: "Berapa lama masa berlaku sertifikat klasifikasi P2MKP?",
                answer: (
                    <div className="space-y-5">
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Masa berlaku sertifikat klasifikasi P2MKP berbeda-beda tergantung tingkatannya:
                        </p>
                        <div className="space-y-3">
                            {[
                                { level: "Pemula", duration: "2 (dua) tahun", badge: "🥉", accent: "border-amber-500/30 bg-amber-500/5" },
                                { level: "Muda", duration: "3 (tiga) tahun", badge: "🥈", accent: "border-blue-500/30 bg-blue-500/5" },
                                { level: "Madya", duration: "4 (empat) tahun", badge: "🥇", accent: "border-indigo-500/30 bg-indigo-500/5" },
                                { level: "Utama", duration: "5 (lima) tahun", badge: "🏆", accent: "border-purple-500/30 bg-purple-500/5" },
                            ].map((item, idx) => (
                                <div key={idx} className={`flex items-center gap-4 p-3.5 rounded-2xl border ${item.accent} transition-all group`}>
                                    <span className="text-xl shrink-0">{item.badge}</span>
                                    <div className="flex-1 flex items-center justify-between gap-2">
                                        <span className="text-sm font-black text-white uppercase tracking-wider">{item.level}</span>
                                        <span className="text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full shrink-0">{item.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">⚠ Permohonan Klasifikasi Kembali</p>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Dalam hal masa berlaku sertifikat klasifikasi P2MKP berakhir, pengelola P2MKP harus mengajukan permohonan klasifikasi kembali secara tertulis kepada Kepala Badan.
                            </p>
                        </div>
                    </div>
                )
            },
            {
                question: "Apa manfaat memiliki klasifikasi P2MKP?",
                answer: (
                    <div className="space-y-3">
                        {[
                            "Mendapat prioritas dalam penunjukan sebagai mitra pelatihan program pemerintah",
                            "Akses ke program pembinaan dan pengembangan kapasitas dari BPPP",
                            "Pengakuan resmi sebagai lembaga pelatihan berkualitas terstandar nasional",
                            "Peningkatan kepercayaan masyarakat dan calon peserta pelatihan",
                            "Kemudahan akses terhadap fasilitas pembiayaan dan kemitraan strategis"
                        ].map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3 group">
                                <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-white transition-colors">{benefit}</p>
                            </div>
                        ))}
                    </div>
                )
            }
        ]
    }
];

// --- FAQ Tabs Component ---

function FAQTabs() {
    const [activeTab, setActiveTab] = React.useState('p2mkp');
    const activeData = FAQ_TABS.find(t => t.id === activeTab)!;

    return (
        <div className="mt-12 space-y-8">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                {FAQ_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest w-full sm:w-auto justify-center transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30'
                            : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                            }`}
                    >
                        {activeTab === tab.id ? (
                            <div
                                className="absolute inset-0 rounded-[1.5rem] bg-blue-600 -z-10"
                            />
                        ) : null}
                        <span className="text-base">{tab.icon}</span>
                        {tab.label}
                        <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-600'
                            }`}>
                            {tab.items.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {activeData ? (
                    <div className="space-y-4">
                        {/* Active tab label */}
                        <div className="flex items-center gap-3 px-2">
                            <span className="text-2xl">{activeData.icon}</span>
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-widest">{activeData.label}</h3>
                                <p className="text-[10px] text-gray-500 font-medium">{activeData.items.length} pertanyaan tersedia</p>
                            </div>
                        </div>

                        {activeData.items.map((item, index) => (
                            <FAQItem key={`faq-${activeTab}-${index}`} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// --- Main Page ---

export default function P2MKPPage() {

    return (
        <section className="pt-16 min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden">
            {/* Immersive Background System */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100" />
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto"
                >
                    <div className="text-center space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase"
                        >
                            <FiShield className="animate-pulse" /> Portal P2MKP
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl md:text-4xl lg:text-5xl font-calsans leading-[1] tracking-tight"
                            >
                                PUSAT PELATIHAN MANDIRI <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400">KELAUTAN DAN PERIKANAN (P2MKP)</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-light"
                            >
                                Sentra pelatihan kelautan dan perikanan yang tumbuh dari masyarakat, oleh masyarakat, dan untuk masyarakat guna mewujudkan kedaulatan pangan melalui peningkatan kapasitas SDM mandiri.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col md:flex-row items-center justify-center gap-4"
                        >
                            <Link href="/p2mkp/registrasi">
                                <button className="group relative px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 transition-all hover:bg-blue-500 hover:scale-105 shadow-xl shadow-blue-500/20">
                                    DAFTAR SEKARANG
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Simple Visualization in Hero */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <StatCard icon={<FiUsers />} label="Lembaga P2MKP" value={107} suffix="+" />
                        <StatCard icon={<FiAward />} label="SDM Sertifikat" value={12000} suffix="+" />
                        <StatCard icon={<FiMapPin />} label="Tersebar di" value={34} suffix=" Prov" />
                        <StatCard icon={<FiTrendingUp />} label="Pertumbuhan" value={15} suffix="%" />
                    </div>
                </motion.div>

                {/* Interactive Flowchart Section */}
                <div id="alur" className="py-19 px-4">
                    <div className="max-w-7xl mx-auto">
                        <SectionTitle
                            subtitle="Cara Bergabung"
                            title="Langkah Menuju P2MKP"
                            description="Ikuti langkah-langkah mudah berikut untuk meresmikan lembaga pelatihan Anda."
                            light={true}
                        />

                        <div className="mt-12 relative lg:px-10">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden lg:block absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-blue-500/20 z-0" />

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
                                <FlowStep
                                    number="01"
                                    icon={<FiFileText />}
                                    title="Persiapan"
                                    desc="Penyusunan dokumen & asesmen mandiri di portal."
                                    tags={["Dokumen"]}
                                />
                                <FlowStep
                                    number="02"
                                    icon={<FiCheckCircle />}
                                    title="Verifikasi"
                                    desc="Pemeriksaan kelayakan administrasi oleh Pusat Pelatihan KP."
                                    tags={["Review"]}
                                />
                                <FlowStep
                                    number="03"
                                    icon={<FiMapPin />}
                                    title="Visitasi"
                                    desc="Peninjauan langsung fasilitas & sarana prasarana."
                                    tags={["Survey"]}
                                />
                                <FlowStep
                                    number="04"
                                    icon={<FiAward />}
                                    title="Penetapan"
                                    desc="Penetapan dan penerbitan sertifikat resmi sebagai P2MKP."
                                    tags={["Final"]}
                                    highlight={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Gallery Section */}
                <VideoGallerySection />

                {/* Indonesia Map Section */}
                <IndonesiaMapSection />

                {/* FAQ Section */}
                <div id="faq" className="py-24 px-4 relative overflow-hidden">
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-[-5%] w-[30%] h-[30%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-5xl mx-auto relative z-10">
                        <SectionTitle
                            subtitle="Pertanyaan Umum"
                            title="Frequently Asked Questions"
                            description="Segala hal yang perlu Anda ketahui mengenai P2MKP, proses penetapan, dan klasifikasi."
                            light={true}
                        />
                        <FAQTabs />
                    </div>
                </div>

                {/* Premium CTA Section */}
                <div className="py-16 px-4 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] z-0" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-5xl mx-auto px-4 text-center space-y-2"
                    >
                        <h2 className="text-2xl md:text-4xl font-calsans leading-tight">
                            SIAP UNTUK <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">BERGABUNG BERSAMA KAMI?</span>
                        </h2>

                        <p className="text-gray-400 text-xs md:text-sm font-light max-w-lg mx-auto">
                            Bantu kami mencetak generasi baru wirausaha dan lembaga pelatihan bidang kelautan dan perikanan yang tangguh. Daftarkan lembaga Anda sekarang.
                        </p>

                        <div className="pt-4 w-full flex items-center justify-center">
                            <Link href="/p2mkp/registrasi">

                                <button className="bg-blue-600 px-8 py-3 rounded-xl text-xs font-bold tracking-wider gap-2 transition-all hover:bg-blue-500 hover:scale-105 shadow-xl shadow-blue-500/20  hover:scale-105 transition-transform shadow-lg flex items-center">
                                    DAFTAR JADI P2MKP
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <Footer />
            </div>
        </section>
    );
}

/** Parse coordinates from a free-text field robustly */
function parseCoords(raw: string): { lat: number; lng: number } | null {
    if (!raw) return null;

    // Extract all numbers (integers or decimals, positive or negative)
    const matches = Array.from(raw.matchAll(/-?\d+(?:\.\d+)?/g)).map(m => parseFloat(m[0]));

    if (matches.length < 2) return null;

    // Search consecutive pairs for a valid coordinate
    for (let i = 0; i < matches.length - 1; i++) {
        let n1 = matches[i];
        let n2 = matches[i + 1];

        let lat = n1;
        let lng = n2;

        // Auto-correct if user inputted (Longitude, Latitude)
        if (Math.abs(n1) > 90) {
            lng = n1;
            lat = n2;
        }

        // Indonesia's rough bounding box
        if (lat >= -12 && lat <= 8 && lng >= 94 && lng <= 142) {
            return { lat, lng };
        }
    }

    return null;
}

function normalizeProvinsi(raw: string): string {
    if (!raw) return '';
    const s = raw.trim().toLowerCase();
    if (s.includes('aceh')) return 'Aceh';
    if (s.includes('sumatera utara') || s.includes('sumut')) return 'Sumatera Utara';
    if (s.includes('sumatera barat') || s.includes('sumbar')) return 'Sumatera Barat';
    if (s.includes('kepulauan riau') || s.includes('kepri')) return 'Kepulauan Riau';
    if (s.includes('riau')) return 'Riau';
    if (s.includes('jambi')) return 'Jambi';
    if (s.includes('bangka') || s.includes('babel')) return 'Kepulauan Bangka Belitung';
    if (s.includes('sumatera selatan') || s.includes('sumsel')) return 'Sumatera Selatan';
    if (s.includes('bengkulu')) return 'Bengkulu';
    if (s.includes('lampung')) return 'Lampung';
    if (s.includes('jakarta') || s.includes('dki')) return 'DKI Jakarta';
    if (s.includes('jawa barat') || s.includes('jabar')) return 'Jawa Barat';
    if (s.includes('banten')) return 'Banten';
    if (s.includes('jawa tengah') || s.includes('jateng')) return 'Jawa Tengah';
    if (s.includes('yogyakarta') || s.includes('diy')) return 'DI Yogyakarta';
    if (s.includes('jawa timur') || s.includes('jatim')) return 'Jawa Timur';
    if (s.includes('bali')) return 'Bali';
    if (s.includes('kalimantan barat') || s.includes('kalbar')) return 'Kalimantan Barat';
    if (s.includes('kalimantan tengah') || s.includes('kalteng')) return 'Kalimantan Tengah';
    if (s.includes('kalimantan selatan') || s.includes('kalsel')) return 'Kalimantan Selatan';
    if (s.includes('kalimantan utara') || s.includes('kaltara')) return 'Kalimantan Utara';
    if (s.includes('kalimantan timur') || s.includes('kaltim')) return 'Kalimantan Timur';
    if (s.includes('sulawesi utara') || s.includes('sulut')) return 'Sulawesi Utara';
    if (s.includes('gorontalo')) return 'Gorontalo';
    if (s.includes('sulawesi tengah') || s.includes('sulteng')) return 'Sulawesi Tengah';
    if (s.includes('sulawesi barat') || s.includes('sulbar')) return 'Sulawesi Barat';
    if (s.includes('sulawesi selatan') || s.includes('sulsel')) return 'Sulawesi Selatan';
    if (s.includes('sulawesi tenggara') || s.includes('sultra')) return 'Sulawesi Tenggara';
    if (s.includes('nusa tenggara barat') || s.includes('ntb')) return 'Nusa Tenggara Barat';
    if (s.includes('nusa tenggara timur') || s.includes('ntt')) return 'Nusa Tenggara Timur';
    if (s.includes('maluku utara')) return 'Maluku Utara';
    if (s.includes('maluku')) return 'Maluku';
    if (s.includes('papua barat daya')) return 'Papua Barat Daya';
    if (s.includes('papua barat')) return 'Papua Barat';
    if (s.includes('papua tengah')) return 'Papua Tengah';
    if (s.includes('papua pegunungan')) return 'Papua Pegunungan';
    if (s.includes('papua selatan')) return 'Papua Selatan';
    if (s.includes('papua')) return 'Papua';
    return raw.trim();
}

function IndonesiaMapSection() {
    const [p2mkpList, setP2mkpList] = useState<P2MKP[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [highlightProv, setHighlightProv] = useState<string | null>(null);

    useEffect(() => {
        axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp`)
            .then(res => {
                const raw = res.data?.data ?? res.data ?? [];
                if (Array.isArray(raw)) {
                    // Filter only raw.status approved
                    const approvedData = raw.filter(item =>
                        item.status && (item.status.toLowerCase() === 'approved' || item.status.toLowerCase().includes('approve'))
                    );
                    setP2mkpList(approvedData);
                } else {
                    setP2mkpList([]);
                }
            })
            .catch(() => setP2mkpList([]))
            .finally(() => setLoading(false));
    }, []);

    // Build all pins from items that have valid coordinates in bidang_pelatihan
    const allPins: P2MKPPin[] = p2mkpList.flatMap(item => {
        const coords = parseCoords(item.bidang_pelatihan || '');
        if (!coords) return [];
        return [{
            id: item.IdPpmkp,
            lat: coords.lat,
            lng: coords.lng,
            nama: item.nama_Ppmkp || item.nama_ppmkp || 'P2MKP',
            kota: item.kota || '',
            provinsi: item.provinsi || '',
            pj: item.nama_penanggung_jawab || '',
            status: item.status || '',
            alamat: item.alamat || '',
            noTelp: item.no_telp_penanggung_jawab || item.no_telp || '',
            jenisPelatihan: item.jenis_pelatihan || item.jenis_bidang_pelatihan || '',
            klasifikasi: item.klasiikasi || 'Belum Klasifikasi',
            tahunPenetapan: item.tahun_penetapan || '-',
        }];
    });

    // Province count for all data
    const provinceCount: Record<string, number> = {};
    p2mkpList.forEach(item => {
        const prov = normalizeProvinsi(item.provinsi || '');
        if (prov) provinceCount[prov] = (provinceCount[prov] || 0) + 1;
    });

    const withCoords = allPins.length;
    const totalLembaga = p2mkpList.length;
    const totalProvinsi = Object.keys(provinceCount).length;

    // Filter pins to ONLY show 'Approved' status, and optionally by highlighted province
    const displayPins = allPins.filter(p => {
        const isApproved = p.status?.toLowerCase().includes('approve') || p.status?.toLowerCase() === 'approved';
        if (!isApproved) return false; // Enforce approved status

        if (highlightProv) {
            return normalizeProvinsi(p.provinsi) === highlightProv;
        }
        return true;
    });

    const activeGroupData = ISLAND_GROUPS.find(g => g.name === activeGroup);

    const LEGEND = [
        { label: 'Utama', color: '#10b981' },
        { label: 'Madya', color: '#3b82f6' },
        { label: 'Muda', color: '#f59e0b' },
        { label: 'Pemula', color: '#6366f1' },
        { label: 'Lainnya', color: '#94a3b8' },
    ];

    return (
        <div id="sebaran" className="py-24 px-4 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 left-[-5%] w-[45%] h-[50%] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-[-5%] w-[40%] h-[45%] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                <SectionTitle
                    subtitle="Sebaran Nasional"
                    title="Peta P2MKP Indonesia"
                    description="Persebaran Pusat Pelatihan Mandiri Kelautan dan Perikanan di seluruh kepulauan nusantara."
                    light={true}
                />

                {/* Top stats row */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                    <StatCard icon={<FiBriefcase />} label="Total Lembaga" value={totalLembaga} suffix="" />
                    <StatCard icon={<FiMapPin />} label="Provinsi Aktif" value={totalProvinsi} suffix="" />
                    <StatCard icon={<FiTarget />} label="Titik Dipetakan" value={withCoords} suffix="" />
                </motion.div>

                {/* Map + Sidebar layout */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4"
                >
                    {/* ── Map ── */}
                    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/5" style={{ height: '520px' }}>
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030d1a] gap-4">
                                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest animate-pulse">Memuat data peta...</p>
                            </div>
                        ) : (
                            <>
                                <P2MKPLeafletMap pins={displayPins} />
                                {/* Legend overlay */}
                                <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
                                    {LEGEND.map(l => (
                                        <div key={l.label} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Filter badge */}
                                {highlightProv && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600/90 backdrop-blur-md border border-blue-400/30 shadow-xl">
                                        <FiMapPin size={11} />
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{highlightProv}</span>
                                        <button
                                            onClick={() => setHighlightProv(null)}
                                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                                        >
                                            <FiX size={8} />
                                        </button>
                                    </div>
                                )}
                                {/* No coords notice */}
                                {!loading && withCoords === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999]">
                                        <div className="text-center space-y-2">
                                            <div className="text-3xl">📍</div>
                                            <p className="text-sm font-black text-white uppercase tracking-wider">Belum ada data koordinat</p>
                                            <p className="text-[10px] text-gray-400">Data koordinat belum tersedia di field bidang_pelatihan</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Sidebar: Gugus Kepulauan ── */}
                    <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto no-scrollbar pr-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-1">Filter Gugus Kepulauan</p>

                        {ISLAND_GROUPS.map((group, gi) => {
                            const groupTotal = group.provinces.reduce((s, p) => s + (provinceCount[p] || 0), 0);
                            const coveredCount = group.provinces.filter(p => (provinceCount[p] || 0) > 0).length;
                            const isOpen = activeGroup === group.name;

                            return (
                                <div key={group.name} className="rounded-[1.5rem] overflow-hidden border border-white/10">
                                    {/* Group header */}
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setActiveGroup(isOpen ? null : group.name);
                                            setHighlightProv(null);
                                        }}
                                        className={`w-full flex items-center justify-between gap-3 p-4 transition-all duration-300 ${isOpen ? 'bg-white/10' : 'bg-white/5 hover:bg-white/8'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{group.icon}</span>
                                            <div className="text-left">
                                                <p className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">{group.name}</p>
                                                <p className="text-[9px] text-gray-600 font-bold mt-0.5">{coveredCount}/{group.provinces.length} prov</p>
                                            </div>
                                        </div>
                                        {groupTotal > 0 && (
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${group.color} text-white`}>
                                                {groupTotal}
                                            </span>
                                        )}
                                    </motion.button>

                                    {/* Province list */}
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                key={`group-list-${group.name}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="p-2 space-y-1">
                                                    {group.provinces.map(prov => {
                                                        const count = provinceCount[prov] || 0;
                                                        const isActive = highlightProv === prov;
                                                        return (
                                                            <button
                                                                key={prov}
                                                                disabled={count === 0}
                                                                onClick={() => setHighlightProv(isActive ? null : prov)}
                                                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all text-[10px] font-bold ${count === 0 ? 'text-gray-700 cursor-not-allowed' :
                                                                    isActive ? `bg-gradient-to-r ${group.color} text-white` :
                                                                        'text-gray-400 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? `bg-gradient-to-br ${group.color}` : 'bg-white/10'}`} />
                                                                    <span className="uppercase tracking-wider truncate">{prov}</span>
                                                                </div>
                                                                {count > 0 && (
                                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black shrink-0 ${isActive ? 'bg-white/20' : 'bg-white/10 text-gray-500'}`}>{count}</span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Bottom info bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-[1.5rem] bg-white/5 border border-white/10"
                >

                    <div className="flex items-center gap-2">
                        {highlightProv && (
                            <span className="text-[9px] px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-black uppercase tracking-wider border border-blue-500/30">
                                Filter: {highlightProv}
                            </span>
                        )}
                        <span className="text-[9px] px-3 py-1 rounded-full bg-white/5 text-gray-600 font-black uppercase tracking-wider">
                            {displayPins.length} titik aktif
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// --- Video Gallery Component ---

function VideoGallerySection() {
    const [activeVideo, setActiveVideo] = React.useState<string | null>(null);

    // Close on Escape key
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveVideo(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div id="video" className="py-24 px-4 relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-cyan-600/8 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-0 right-[-5%] w-[35%] h-[35%] bg-blue-600/8 rounded-full blur-[110px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <SectionTitle
                    subtitle="Galeri Video"
                    title="Galeri P2MKP"
                    description="Tonton video panduan, informasi, cerita sukses seputar Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)."
                    light={true}
                />

                {/* Featured video (first) + 4 grid */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Featured */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:row-span-2"
                    >
                        <VideoCard
                            video={VIDEO_GALLERY[0]}
                            featured
                            onClick={() => setActiveVideo(VIDEO_GALLERY[0].id)}
                        />
                    </motion.div>

                    {/* Side grid */}
                    <div className="grid grid-cols-2 gap-5">
                        {VIDEO_GALLERY.slice(1).map((video, i) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                            >
                                <VideoCard
                                    video={video}
                                    onClick={() => setActiveVideo(video.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popup Player */}
            {activeVideo ? (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setActiveVideo(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

                    {/* Modal */}
                    <div
                        className="relative w-full max-w-4xl z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-[#050d1a]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/80 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                        >
                            <FiX size={16} />
                        </button>

                        {/* YouTube embed */}
                        <div className="aspect-video w-full">
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                className="w-full h-full"
                                title="P2MKP Video"
                            />
                        </div>

                        {/* Video info strip */}
                        {(() => {
                            const vid = VIDEO_GALLERY.find(v => v.id === activeVideo);
                            return vid ? (
                                <div key="video-info-strip" className="px-6 py-4 flex items-start gap-3 border-t border-white/5">
                                    <div className="w-8 h-8 shrink-0 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                                        <FiYoutube size={14} className="text-red-400" />
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function VideoCard({ video, featured = false, onClick }: {
    video: typeof VIDEO_GALLERY[0];
    featured?: boolean;
    onClick: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);
    const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
    const fallbackUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500/40 transition-colors duration-300 bg-white/5 ${featured ? 'h-full min-h-[300px]' : 'h-[170px]'
                }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            {/* Thumbnail */}
            <img
                src={thumbnailUrl}
                alt={video.title}
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ scale: hovered ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-14 h-14 rounded-full bg-blue-600/90 backdrop-blur-sm border border-blue-400/40 flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-shadow duration-300"
                >
                    <FiPlay size={20} className="text-white translate-x-0.5" fill="white" />
                </motion.div>
            </div>

            {/* YouTube badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <FiYoutube size={11} className="text-red-400" />
                <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">YouTube</span>
            </div>

            {/* Text */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {featured && (
                    <span className="inline-block mb-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-600/80 text-white border border-blue-400/30">
                        Video Utama
                    </span>
                )}
                <h4 className={`font-bold text-white leading-snug ${featured ? 'text-base md:text-lg' : 'text-xs'
                    }`}>
                    {video.title}
                </h4>
                {featured && (
                    <p className="text-gray-300 text-xs mt-1 leading-relaxed line-clamp-2">
                        {video.description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// --- Sub-components (Premium Styling) ---

function StatCard({ icon, label, value, suffix }: any) {
    return (
        <div className="p-4 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center text-center space-y-1 hover:bg-white/10 transition-all group">
            <div className="text-blue-400 text-lg mb-1 group-hover:scale-110 transition-transform">{icon}</div>
            <div className="text-xl md:text-2xl font-calsans text-white"><AnimatedCounter value={value} />{suffix}</div>
            <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">{label}</div>
        </div>
    );
}

function CorePillarCard({ icon, title, desc }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 transition-all flex flex-col items-start gap-4 group"
        >
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-md group-hover:rotate-6 transition-transform">
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-calsans text-slate-900">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    );
}

function FlowStep({ number, icon, title, desc, tags, highlight = false }: any) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            className={`p-6 rounded-[2rem] border backdrop-blur-2xl transition-all relative ${highlight ? 'bg-blue-600 text-white border-blue-400 shadow-xl' : 'bg-white/5 border-white/10 text-white'}`}
        >
            <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center font-calsans text-sm shadow-md ${highlight ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                {number}
            </div>

            <div className="flex flex-col gap-4">
                <div className={`text-3xl ${highlight ? 'text-white' : 'text-blue-400'}`}>{icon}</div>
                <div className="space-y-1">
                    <h4 className="text-lg font-calsans">{title}</h4>
                    <p className={`text-xs leading-relaxed ${highlight ? 'text-blue-50/70' : 'text-gray-400'}`}>{desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tags.map((tag: string) => (
                        <span key={tag} className={`text-[8px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${highlight ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 border border-white/5'}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 1 }}
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
                        key="faq-content"
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

function BidangGridItem({ title, icon, count }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all flex flex-col items-center text-center gap-2 cursor-default group"
        >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white leading-tight">{title}</h5>
                <p className="text-[9px] text-blue-400 font-medium tracking-wider uppercase">{count}</p>
            </div>
        </motion.div>
    );
}

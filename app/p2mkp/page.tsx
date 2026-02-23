'use client';

import React, { useRef } from 'react';
import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import {
    FiBriefcase,
    FiUsers,
    FiAnchor,
    FiTarget,
    FiAward,
    FiFileText,
    FiCheckCircle,
    FiMapPin,
    FiArrowRight,
    FiUserCheck,
    FiActivity,
    FiShield,
    FiLayers,
    FiTrendingUp,
    FiCpu,
    FiPlus,
    FiMinus,
    FiChevronDown
} from 'react-icons/fi';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const REGULATION = "Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024"

// --- Helper Components ---

const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
    const [count, setCount] = React.useState(0);
    const nodeRef = useRef(null);
    const isInView = useInView(nodeRef, { once: true });

    React.useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = value;
            const totalSteps = 60;
            const stepTime = (duration * 1000) / totalSteps;
            const increment = end / totalSteps;

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, stepTime);
            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    return <span ref={nodeRef}>{count.toLocaleString()}</span>;
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
                            { title: "Verifikasi", desc: "Pemeriksaan kelayakan administrasi oleh Pusat." },
                            { title: "Visitasi", desc: "Peninjauan langsung fasilitas & sarana lapangan." },
                            { title: "Penetapan", desc: "Sidang pleno & penerbitan sertifikat resmi." }
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
                            { rank: "4", title: "Pratama", badge: "🥉", color: "amber", desc: "Tingkat pertama (terendah). Bagi P2MKP yang baru ditetapkan dengan kapasitas dan fasilitas dasar sesuai standar minimal." },
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
                                { level: "Pratama", duration: "2 (dua) tahun", badge: "🥉", accent: "border-amber-500/30 bg-amber-500/5" },
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
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBg"
                                className="absolute inset-0 rounded-[1.5rem] bg-blue-600 -z-10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                            />
                        )}
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="space-y-4"
                >
                    {/* Active tab label */}
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-2xl">{activeData.icon}</span>
                        <div>
                            <h3 className="text-base font-black text-white uppercase tracking-widest">{activeData.label}</h3>
                            <p className="text-[10px] text-gray-500 font-medium">{activeData.items.length} pertanyaan tersedia</p>
                        </div>
                    </div>

                    {activeData.items.map((item, index) => (
                        <FAQItem key={index} question={item.question} answer={item.answer} />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// --- Main Page ---

export default function P2MKPPage() {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

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
                    style={{ opacity: heroOpacity, scale: heroScale }}
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
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-cyan-400">KELAUTAN DAN PERIKANAN.</span>
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
                                    desc="Pemeriksaan kelayakan administrasi oleh Pusat."
                                    tags={["Review"]}
                                />
                                <FlowStep
                                    number="03"
                                    icon={<FiMapPin />}
                                    title="Visitasi"
                                    desc="Peninjauan langsung fasilitas & sarana lapangan."
                                    tags={["Survey"]}
                                />
                                <FlowStep
                                    number="04"
                                    icon={<FiAward />}
                                    title="Penetapan"
                                    desc="Sidang pleno & penerbitan sertifikat resmi."
                                    tags={["Final"]}
                                    highlight={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto relative z-10 text-center space-y-2"
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

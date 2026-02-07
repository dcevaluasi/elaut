'use client';

import React from 'react';
import Footer from '@/components/ui/footer';
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
    FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const REGULATION = "Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024 tentang Pusat Pelatihan Mandiri Kelautan dan Perikanan"

export default function P2MKPPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Hero Section */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0f172a]/40 backdrop-blur-3xl p-8 md:p-20 text-center shadow-2xl"
                        >
                            <div className="absolute -inset-x-20 -inset-y-20 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000" />

                            <div className="relative z-10 space-y-8">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="inline-flex items-center justify-center p-5 bg-blue-500/10 rounded-3xl mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/10"
                                >
                                    <FiBriefcase className="w-10 h-10 text-blue-400" />
                                </motion.div>

                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-[0.3em] uppercase"
                                    >
                                        <FiShield size={12} /> Official Portal
                                    </motion.div>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-5xl md:text-7xl lg:text-8xl font-calsans leading-none tracking-tight text-white"
                                    >
                                        P2MKP
                                    </motion.h1>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-xl md:text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300"
                                    >
                                        Pusat Pelatihan Mandiri Kelautan dan Perikanan
                                    </motion.h2>
                                </div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-gray-400 text-base md:text-lg max-w-4xl mx-auto leading-relaxed font-light"
                                >
                                    Sentra kegiatan pelatihan di bidang kelautan dan perikanan yang tumbuh dari, oleh, dan untuk masyarakat yang diatur melalui <span className='text-blue-400 font-medium italic'>
                                        {REGULATION}</span>. P2MKP merupakan wujud kemandirian masyarakat dalam meningkatkan kapasitas SDM melalui pelatihan yang aplikatif.
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Feature Cards Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            icon={<FiAnchor />}
                            title="Apa itu P2MKP?"
                            color="blue"
                            desc="Lembaga diklat yang dibentuk dan dikelola secara mandiri oleh pelaku utama perikanan yang telah berhasil dalam usahanya, untuk melatih masyarakat sekitarnya."
                        />
                        <FeatureCard
                            icon={<FiTarget />}
                            title="Tujuan Utama"
                            color="indigo"
                            desc="Meningkatkan pengetahuan, keterampilan, dan sikap pelaku utama dan pelaku usaha kelautan dan perikanan melalui pendekatan pelatihan praktisi ke praktisi."
                        />
                        <FeatureCard
                            icon={<FiUsers />}
                            title="Peran Strategis"
                            color="cyan"
                            desc="Sebagai mitra pemerintah dalam pengembangan SDM, penyebaran teknologi tepat guna, dan penumbuhan wirausaha baru di sektor kelautan dan perikanan."
                        />
                    </motion.div>

                    {/* Flowchart Section */}
                    <div className="relative py-12">
                        <div className="text-center space-y-4 mb-16">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest"
                            >
                                <FiActivity size={14} /> Operational Flow
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-calsans text-white"
                            >
                                Alur Penetapan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">P2MKP</span>
                            </motion.h2>
                        </div>

                        {/* Desktop View (Swimlanes with SVG) */}
                        <div className="hidden lg:grid grid-cols-3 gap-8 relative isolation">
                            {/* SVG Connectors Layer */}
                            <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
                                <svg className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                                        </linearGradient>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" fillOpacity="0.4" />
                                        </marker>
                                    </defs>

                                    {/* Connectivity paths - polished for dark theme */}
                                    <path d="M 350 320 C 400 320, 390 140, 440 140" fill="none" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                    <path d="M 600 180 L 600 220" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" strokeOpacity="0.3" />
                                    <path d="M 600 320 L 600 360" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)" strokeOpacity="0.3" />
                                    <path d="M 600 450 L 600 490" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" strokeOpacity="0.3" />
                                    <path d="M 780 530 C 850 530, 850 530, 860 530" fill="none" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                    <path d="M 1030 580 L 1030 630" fill="none" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrowhead)" strokeOpacity="0.3" />
                                </svg>
                            </div>

                            {/* Column 1: Calon P2MKP */}
                            <div className="space-y-8 relative z-10">
                                <div className="bg-gradient-to-b from-blue-500/10 to-transparent p-6 rounded-[2rem] border border-blue-500/20 text-center backdrop-blur-xl shadow-xl">
                                    <h3 className="text-xl font-calsans text-blue-400">Calon P2MKP</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-bold">Initiation Phase</p>
                                </div>
                                <FlowCard step="1" icon={<FiActivity className="animate-pulse" />} title="Mulai" />
                                <FlowCard
                                    step="2"
                                    icon={<FiFileText />}
                                    title="Penyusunan Dokumen"
                                    desc={
                                        <div className="space-y-2 mt-3 pl-1">
                                            {['Surat Permohonan', 'Rekomendasi Dinas KP', 'Asesmen Mandiri'].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                                    <div className="w-1 h-1 rounded-full bg-blue-500" /> {item}
                                                </div>
                                            ))}
                                        </div>
                                    }
                                />
                                <FlowCard step="3" icon={<FiArrowRight />} title="Pengajuan Berkas" />
                            </div>

                            {/* Column 2: Puslat KP */}
                            <div className="space-y-8 relative z-10 pt-20">
                                <div className="bg-gradient-to-b from-indigo-500/10 to-transparent p-6 rounded-[2rem] border border-indigo-500/20 text-center backdrop-blur-xl shadow-xl absolute top-0 w-full">
                                    <h3 className="text-xl font-calsans text-indigo-400">Puslat KP</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-bold">Validation Phase</p>
                                </div>
                                <div className="relative">
                                    <FlowCard step="4" icon={<FiCheckCircle />} title="Verifikasi Dokumen" color="indigo" />
                                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-70">
                                        <span className="bg-rose-500/10 text-rose-400 text-[8px] px-2 py-1 rounded-lg border border-rose-500/20 backdrop-blur-md uppercase tracking-tighter font-black">Revisi</span>
                                    </div>
                                </div>
                                <FlowCard step="5" icon={<FiMapPin />} title="Kunjungan Lapangan" desc="Visitasi & Verifikasi Lokasi" color="indigo" />
                                <div className="relative">
                                    <FlowCard step="6" icon={<FiUsers />} title="Sidang Pleno" color="indigo" />
                                </div>
                                <FlowCard step="7" icon={<FiFileText />} title="Penyusunan SK" desc="SK Klasifikasi P2MKP" color="indigo" />
                            </div>

                            {/* Column 3: BPPSDMKP */}
                            <div className="space-y-8 relative z-10">
                                <div className="bg-gradient-to-b from-cyan-500/10 to-transparent p-6 rounded-[2rem] border border-cyan-500/20 text-center backdrop-blur-xl shadow-xl">
                                    <h3 className="text-xl font-calsans text-cyan-400">BPPSDM KP</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 font-bold">Final Approval</p>
                                </div>
                                <div className="h-[440px]"></div> {/* Spacer */}
                                <FlowCard step="8" icon={<FiUserCheck />} title="Penetapan SK" color="cyan" />
                                <FlowCard
                                    step="9"
                                    icon={<FiAward />}
                                    title="Penerbitan Sertifikat"
                                    color="cyan"
                                    highlightStyle="shadow-[0_0_30px_rgba(34,211,238,0.1)] border-cyan-500/30"
                                    badge={<span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-3 py-1 rounded-full border border-emerald-500/20 absolute -bottom-3 right-1/2 translate-x-1/2 font-black tracking-widest uppercase">Success</span>}
                                />
                            </div>
                        </div>

                        {/* Mobile View (Animated List) */}
                        <div className="lg:hidden space-y-6">
                            <MobileGroup icon={<FiUsers />} title="Calon P2MKP" color="blue">
                                <MobileStep number="1" title="Menyusun Dokumen" desc="Siapkan Surat Permohonan & Rekomendasi" />
                                <MobileStep number="2" title="Mengusulkan Dokumen" />
                            </MobileGroup>
                            <MobileGroup icon={<FiBuilding2 />} title="Puslat KP" color="indigo">
                                <MobileStep number="3" title="Verifikasi Dokumen" />
                                <MobileStep number="4" title="Visit Lapangan" />
                                <MobileStep number="5" title="Sidang Pleno" />
                            </MobileGroup>
                            <div className="pt-6">
                                <Link href="/p2mkp/registrasi" className="w-full h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-bold tracking-widest shadow-xl shadow-blue-500/20">
                                    AJUKAN PENETAPAN <FiArrowRight className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 blur-[100px] -z-10" />

                        <div className="bg-[#0f172a]/30 backdrop-blur-3xl rounded-[3rem] p-8 md:p-20 border border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors" />

                            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-calsans leading-tight">
                                    Bergabunglah Menjadi Bagian dari
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 italic"> P2MKP</span>
                                </h3>

                                <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
                                    Apakah unit usaha atau lembaga Anda siap untuk berkontribusi dalam pengembangan SDM Kelautan dan Perikanan?
                                    Jadilah garda terdepan dalam mencetak tenaga kerja handal di sektor kelautan.
                                </p>

                                <div className="pt-8">
                                    <Link href="/p2mkp/registrasi">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group relative inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-3xl font-bold tracking-widest shadow-2xl transition-all duration-300"
                                        >
                                            AJUKAN PENETAPAN P2MKP
                                            <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                                            <div className="absolute inset-0 rounded-3xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </section>
    );
}

// Refined Sub-components
function FeatureCard({ icon, title, desc, color }: any) {
    const colors: any = {
        blue: "bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white border-blue-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white border-indigo-500/20",
        cyan: "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white border-cyan-500/20"
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative p-8 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 hover:border-white/10 transition-all duration-500 shadow-2xl overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <div className="text-8xl">{icon}</div>
            </div>

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 border ${colors[color]}`}>
                <span className="text-2xl">{icon}</span>
            </div>

            <h3 className="text-2xl font-calsans text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                {title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light group-hover:text-gray-300 transition-colors">
                {desc}
            </p>
        </motion.div>
    );
}

function FlowCard({ step, icon, title, desc, badge, color = "blue", highlightStyle = "" }: any) {
    const colorStyles: any = {
        blue: "border-blue-500/20 bg-blue-500/5 group-hover:border-blue-400/40 text-blue-400",
        indigo: "border-indigo-500/20 bg-indigo-500/5 group-hover:border-indigo-400/40 text-indigo-400",
        cyan: "border-cyan-500/20 bg-cyan-500/5 group-hover:border-cyan-400/40 text-cyan-400"
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-6 rounded-3xl backdrop-blur-3xl border transition-all duration-300 group ${colorStyles[color]} ${highlightStyle}`}
        >
            {badge}
            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
                    {icon}
                </div>
                <h4 className="text-white font-bold tracking-tight text-sm leading-tight">{title}</h4>
                {desc && <div className="text-gray-500 text-[10px] font-medium leading-relaxed">{desc}</div>}
            </div>

            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-blue-500/20 border border-white/10 z-20">
                {step}
            </div>
        </motion.div>
    );
}

function MobileGroup({ icon, title, color, children }: any) {
    const borders: any = { blue: "border-blue-500/20", indigo: "border-indigo-500/20" };
    return (
        <div className={`p-6 rounded-[2rem] border bg-white/5 ${borders[color]} space-y-4`}>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-white/5 text-blue-400">{icon}</div>
                <h3 className="text-lg font-calsans">{title}</h3>
            </div>
            <div className="space-y-4 pl-2 border-l border-white/5 ml-4">{children}</div>
        </div>
    );
}

function MobileStep({ number, title, desc }: any) {
    return (
        <div className="relative space-y-1">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-blue-400 border border-blue-400/30">
                    {number}
                </div>
                <h5 className="text-white font-medium text-xs">{title}</h5>
            </div>
            {desc && <p className="text-gray-500 text-[10px] ml-8">{desc}</p>}
        </div>
    );
}

function FiBuilding2(props: any) {
    return <Building2 {...props} />;
}

// Fallback if missing icons
import { Building2 } from 'lucide-react';
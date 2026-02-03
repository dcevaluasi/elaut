'use client';

import React from 'react';
import Footer from '@/components/ui/footer';
import { Building2, Users, Anchor, BookOpen, Target, Award, FileText, CheckCircle, MapPin, FileCheck, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const REGULATION = "Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024 tentang Pusat Pelatihan Mandiri Kelautan dan Perikanan"

export default function P2MKPPage() {
    return (
        <section>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-2 sm:p-4 md:p-6 pb-0">
                <div className="max-w-7xl mx-auto mt-28 mb-10">
                    {/* Hero Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-10 md:p-14 mb-8 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="inline-flex items-center justify-center p-3 sm:p-4 bg-blue-500/20 rounded-full mb-6 border border-blue-400/30"
                            >
                                <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-200" />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg"
                            >
                                P2MKP
                            </motion.h1>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl sm:text-2xl text-blue-200 font-medium mb-6"
                            >
                                Pusat Pelatihan Mandiri Kelautan dan Perikanan
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-white/80 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed"
                            >
                                Sentra kegiatan pelatihan di bidang kelautan dan perikanan yang tumbuh dari, oleh, dan untuk masyarakat yang diature malalui <span className='welcome'>
                                    {REGULATION}</span>.
                                P2MKP merupakan wujud kemandirian masyarakat dalam meningkatkan kapasitas SDM melalui pelatihan yang aplikatif.
                            </motion.p>
                        </div>

                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {/* Card 1: Definisi */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Anchor className="text-blue-300 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Apa itu P2MKP?</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Lembaga diklat yang dibentuk dan dikelola secara mandiri oleh pelaku utama perikanan yang telah berhasil dalam usahanya, untuk melatih masyarakat sekitarnya.
                            </p>
                        </motion.div>

                        {/* Card 2: Tujuan */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Target className="text-blue-300 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Tujuan Utama</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Meningkatkan pengetahuan, keterampilan, dan sikap pelaku utama dan pelaku usaha kelautan dan perikanan melalui pendekatan pelatihan dari praktisi ke praktisi.
                            </p>
                        </motion.div>

                        {/* Card 3: Peran */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="text-blue-300 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Peran Strategis</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                Sebagai mitra pemerintah dalam pengembangan SDM, penyebaran teknologi tepat guna, dan penumbuhan wirausaha baru di sektor kelautan dan perikanan.
                            </p>
                        </motion.div>
                    </div>

                    {/* Flowchart Section */}
                    <div className="mb-20 relative">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
                        >
                            Alur Penetapan P2MKP
                        </motion.h2>

                        {/* Desktop View (Swimlanes with SVG) */}
                        <div className="hidden lg:grid grid-cols-3 gap-8 relative isolation">

                            {/* SVG Connectors Layer */}
                            <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
                                <svg className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.5" />
                                        </linearGradient>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" fillOpacity="0.5" />
                                        </marker>
                                        <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#F87171" fillOpacity="0.8" />
                                        </marker>
                                    </defs>

                                    {/* Path: Usul (Col 1) -> Verif (Col 2) */}
                                    <path d="M 350 320 C 400 320, 390 140, 440 140" fill="none" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />

                                    {/* Path: Verif (Col 2) -> Visit (Col 2) */}
                                    <path d="M 600 180 L 600 220" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" strokeOpacity="0.5" />

                                    {/* Path: Visit (Col 2) -> Pleno (Col 2) */}
                                    <path d="M 600 320 L 600 360" fill="none" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)" strokeOpacity="0.5" />

                                    {/* Path: Pleno (Col 2) -> SK (Col 2) */}
                                    <path d="M 600 450 L 600 490" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" strokeOpacity="0.5" />

                                    {/* Path: SK (Col 2) -> Penetapan (Col 3) */}
                                    <path d="M 780 530 C 850 530, 850 530, 860 530" fill="none" stroke="url(#flowGradient)" strokeWidth="2" markerEnd="url(#arrowhead)" />

                                    {/* Path: Penetapan (Col 3) -> Sertifikat (Col 3) */}
                                    <path d="M 1030 580 L 1030 630" fill="none" stroke="#A78BFA" strokeWidth="2" markerEnd="url(#arrowhead)" strokeOpacity="0.5" />

                                    {/* Feedback Loop: Verif -> Menyusun */}
                                    {/* From Verif (approx x=440, y=140) back to Menyusun (approx x=350, y=200) */}
                                    <path
                                        d="M 440 140 C 300 140, 400 200, 370 200"
                                        fill="none"
                                        stroke="#F87171"
                                        strokeWidth="2"
                                        strokeDasharray="6,4"
                                        markerEnd="url(#arrowhead-red)"
                                        opacity="0.6"
                                    />

                                    {/* Feedback Loop: Pleno -> Menyusun */}
                                    <path
                                        d="M 440 400 C 100 400, 150 200, 180 200"
                                        fill="none"
                                        stroke="#F87171"
                                        strokeWidth="2"
                                        strokeDasharray="6,4"
                                        markerEnd="url(#arrowhead-red)"
                                        opacity="0.3"
                                    />
                                </svg>
                            </div>

                            {/* Column 1: Calon P2MKP */}
                            <div className="space-y-8 relative z-10">
                                <div className="bg-gradient-to-b from-blue-600/30 to-transparent p-4 rounded-2xl border border-blue-400/30 text-center">
                                    <h3 className="text-xl font-bold text-blue-100">Calon P2MKP</h3>
                                </div>

                                <FlowCard step="1" icon={<div className="w-3 h-3 bg-white rounded-full" />} title="Mulai" />

                                <FlowCard
                                    step="2"
                                    icon={<FileText className="w-5 h-5 text-blue-300" />}
                                    title="Menyusun Dokumen"
                                    desc={
                                        <ul className="list-disc list-inside text-xs text-white/60 mt-2 space-y-1 text-left">
                                            <li>Surat Permohonan Penetapan</li>
                                            <li>Rekomendasi Dinas KP</li>
                                            <li>Asesmen Mandiri</li>
                                        </ul>
                                    }
                                />

                                <FlowCard step="3" icon={<ArrowRight className="w-5 h-5 text-blue-300" />} title="Mengusulkan Dokumen" />
                            </div>

                            {/* Column 2: Puslat KP */}
                            <div className="space-y-8 relative z-10 pt-20">
                                <div className="bg-gradient-to-b from-indigo-600/30 to-transparent p-4 rounded-2xl border border-indigo-400/30 text-center absolute top-0 w-full">
                                    <h3 className="text-xl font-bold text-indigo-100">Puslat KP</h3>
                                </div>

                                <div className="relative">
                                    <FlowCard
                                        step="4"
                                        icon={<CheckCircle className="w-5 h-5 text-indigo-300" />}
                                        title="Verifikasi Dokumen"
                                        highlightColor="border-indigo-500/50"
                                    />
                                    <div className="absolute -left-28 top-1/2 -translate-y-1/2 ">
                                        <span className="bg-rose-900/40 text-rose-300 text-[10px] px-2 py-1 rounded-md border border-rose-500/20 backdrop-blur-sm whitespace-nowrap">
                                            Cmd: Tidak Sesuai (Kembali)
                                        </span>
                                    </div>
                                </div>

                                <FlowCard
                                    step="5"
                                    icon={<MapPin className="w-5 h-5 text-indigo-300" />}
                                    title="Kunjungan Lapangan"
                                    desc="Koordinasi & Visitasi Lokasi"
                                    highlightColor="border-indigo-500/50"
                                />

                                <div className="relative">
                                    <FlowCard
                                        step="6"
                                        icon={<Users className="w-5 h-5 text-indigo-300" />}
                                        title="Sidang Pleno"
                                        highlightColor="border-indigo-500/50"
                                    />
                                    <div className="absolute -left-28 top-1/2 -translate-y-1/2 ">
                                        <span className="bg-rose-900/40 text-rose-300 text-[10px] px-2 py-1 rounded-md border border-rose-500/20 backdrop-blur-sm whitespace-nowrap">
                                            Cmd: Tidak Lulus (Kembali)
                                        </span>
                                    </div>
                                </div>

                                <FlowCard
                                    step="7"
                                    icon={<FileCheck className="w-5 h-5 text-indigo-300" />}
                                    title="Penyusunan SK"
                                    desc="SK Klasifikasi P2MKP"
                                    highlightColor="border-indigo-500/50"
                                />
                            </div>

                            {/* Column 3: BPPSDMKP */}
                            <div className="space-y-8 relative z-10">
                                <div className="bg-gradient-to-b from-violet-600/30 to-transparent p-4 rounded-2xl border border-violet-400/30 text-center">
                                    <h3 className="text-xl font-bold text-violet-100">BPPSDM KP</h3>
                                </div>

                                <div className="h-[440px]"></div> {/* Spacer */}

                                <FlowCard
                                    step="8"
                                    icon={<UserCheck className="w-5 h-5 text-violet-300" />}
                                    title="Penetapan SK"
                                    highlightColor="border-violet-500/50"
                                />

                                <FlowCard
                                    step="9"
                                    icon={<Award className="w-5 h-5 text-violet-300" />}
                                    title="Penerbitan Sertifikat"
                                    highlightColor="border-violet-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                    badge={<span className="bg-green-500/20 text-green-200 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 absolute -bottom-2 right-1/2 translate-x-1/2">Selesai</span>}
                                />
                            </div>
                        </div>

                        {/* Mobile View (Animated List) */}
                        <div className="lg:hidden space-y-4">
                            {/* Section 1 */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="bg-blue-900/40 p-5 rounded-2xl border border-blue-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full"></div>
                                <h3 className="text-blue-200 font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-blue-500/20 p-1.5 rounded-lg"><Users className="w-4 h-4" /></span>
                                    Calon P2MKP
                                </h3>
                                <div className="space-y-4 pl-2">
                                    <MobileStep number="1" title="Menyusun Dokumen" desc="Surat Permohonan, Rekomendasi Dinas, Asesmen" />
                                    <MobileStep number="2" title="Mengusulkan Dokumen" />
                                </div>
                            </motion.div>

                            {/* Section 2 */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="bg-indigo-900/40 p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-bl-full"></div>
                                <h3 className="text-indigo-200 font-bold mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-500/20 p-1.5 rounded-lg"><Building2 className="w-4 h-4" /></span>
                                    Puslat KP
                                </h3>
                                <div className="space-y-4 pl-2">
                                    <MobileStep number="3" title="Verifikasi Dokumen" note="Jika tidak sesuai, kembali ke awal" />
                                    <MobileStep number="4" title="Kunjungan Lapangan" desc="Koordinasi & Visitasi" />
                                    <MobileStep number="5" title="Sidang Pleno" note="Jika lulus, lanjut ke SK" />
                                    <MobileStep number="6" title="Penyusunan SK Klasifikasi" />
                                </div>
                            </motion.div>

                            <Link href="/p2mkp/registrasi">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300"
                                >
                                    <span>Ajukan Penetapan P2MKP</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                                    {/* Button Glow */}
                                    <div className="absolute inset-0 rounded-full bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            </Link>

                        </div>
                    </div>

                    {/* Call to Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-20 relative"
                    >
                        {/* Glow effect behind */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-3xl -z-10" />

                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-white/20 text-center relative overflow-hidden group mx-auto">
                            {/* Decorative sparkles */}
                            <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                                <div className="absolute top-4 right-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <div className="absolute top-10 right-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-75" />
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
                                Bergabunglah Menjadi Bagian dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">Ekosistem P2MKP</span>
                            </h3>

                            <p className="text-blue-100/80 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                                Apakah unit usaha atau lembaga Anda siap untuk berkontribusi dalam pengembangan SDM Kelautan dan Perikanan?
                                Ajukan pendaftaran sekarang untuk mendapatkan penetapan resmi.
                            </p>

                            <Link href="/p2mkp/registrasi">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300"
                                >
                                    <span>Ajukan Penetapan P2MKP</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                                    {/* Button Glow */}
                                    <div className="absolute inset-0 rounded-full bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.button>
                            </Link>

                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </section>
    );
}

// Sub-components for cleaner code
function FlowCard({ step, icon, title, desc, badge, highlightColor = "border-white/10" }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            className={`bg-white/10 backdrop-blur-lg p-5 rounded-2xl border ${highlightColor} relative group z-20`}
        >
            {badge}
            <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    {icon}
                </div>
                <h4 className="text-white font-semibold mb-1">{title}</h4>
                {desc && <div className="text-blue-100/70 text-sm">{desc}</div>}
            </div>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/20">
                {step}
            </div>
        </motion.div>
    );
}

function MobileStep({ number, title, desc, note, isLast }: any) {
    return (
        <div className="relative pl-6 pb-2">
            {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-white/10"></div>}
            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center text-[10px] font-bold text-white/90">
                {number}
            </div>
            <div>
                <h5 className="text-white font-medium text-sm">{title}</h5>
                {desc && <p className="text-white/60 text-xs mt-0.5">{desc}</p>}
                {note && <p className="text-yellow-200/80 text-[10px] italic mt-1">{note}</p>}
            </div>
        </div>
    )
}
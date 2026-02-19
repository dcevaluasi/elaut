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
    FiCpu
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

// --- Main Page ---

export default function P2MKPPage() {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

    return (
        <section className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 font-jakarta overflow-x-hidden">
            {/* Immersive Background System */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[0%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[110px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150 brightness-100" />
            </div>

            <Header />

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

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import { ArrowRight, Award, FileText, MapPin, ShieldCheck, TrendingUp, Users } from "lucide-react";

import Footer from "@/components/ui/footer";
import MarqueeLogos from "@/components/marquee-logos";
import { elautBaseUrl } from "@/constants/urls";
import type { P2MKP } from "@/types/p2mkp";
import { cn } from "@/lib/utils";

import { FLOW_STEPS, STATIC_STATS } from "./data";
import { isApproved, normalizeProvinsi } from "./utils";
import { SectionTitle, StatCard, fadeUp } from "./shared";

import VideoGallerySection from "./VideoGallerySection";
import MapSection from "./MapSection";
import FaqSection from "./FaqSection";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const REGISTER_ROUTE = "/p2mkp/registrasi";
const STANDAR_PELAYANAN_PDF = "/files/Standar Pelayanan P2MKP.pdf";
const HERO_PHOTOS = ["/images/p2mkp/p2mkp1.jpg", "/images/p2mkp/p2mkp2.jpg", "/images/p2mkp/p2mkp3.jpg"];

const SECTIONS = [
    { id: "alur", label: "Alur" },
    { id: "video", label: "Video" },
    { id: "sebaran", label: "Peta" },
    { id: "faq", label: "FAQ" },
];

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
function useApprovedP2MKP() {
    const [list, setList] = React.useState<P2MKP[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let cancelled = false;
        axios
            .get(`${elautBaseUrl}/p2mkp/get_p2mkp`)
            .then((res) => {
                const raw = res.data?.data ?? res.data ?? [];
                if (!cancelled && Array.isArray(raw)) setList(raw.filter((item: P2MKP) => isApproved(item.status)));
            })
            .catch((err) => console.error("Failed to fetch P2MKP:", err))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    const totalProvinsi = React.useMemo(
        () => new Set(list.map((i) => normalizeProvinsi(i.provinsi)).filter(Boolean)).size,
        [list]
    );

    return { list, loading, totalProvinsi };
}

/** Which in-page section is currently in the middle of the viewport. */
function useActiveSection(ids: string[]) {
    const [active, setActive] = React.useState<string | null>(null);
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
            { rootMargin: "-45% 0px -50% 0px" }
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [ids]);
    return active;
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero({ totalLembaga, totalProvinsi, loading }: { totalLembaga: number; totalProvinsi: number; loading: boolean }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();

    // Scroll parallax: each photo moves at its own speed, text fades out.
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const k = reduceMotion ? 0 : 1;
    const photoY = [
        useTransform(scrollYProgress, [0, 1], [0, -120 * k]),
        useTransform(scrollYProgress, [0, 1], [0, -40 * k]),
        useTransform(scrollYProgress, [0, 1], [0, -200 * k]),
    ];
    const textY = useTransform(scrollYProgress, [0, 1], [0, 80 * k]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduceMotion ? 1 : 0]);

    // Pointer tilt on the photo collage.
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateY = useSpring(useTransform(mx, (v) => v * 10), { stiffness: 80, damping: 20 });
    const rotateX = useSpring(useTransform(my, (v) => v * -10), { stiffness: 80, damping: 20 });

    const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduceMotion || e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <div ref={ref} className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 md:px-8 lg:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
                {/* Text */}
                <motion.div
                    style={{ y: textY, opacity: textOpacity }}
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                    className="space-y-7 text-center lg:text-left"
                >
                    <motion.span
                        variants={fadeUp}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300"
                    >
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Portal P2MKP
                    </motion.span>
                    <motion.h1 variants={fadeUp} className="font-calsans text-3xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                        Pusat Pelatihan Mandiri
                        <br />
                        <span className="bg-gradient-to-br from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                            Kelautan dan Perikanan
                        </span>
                    </motion.h1>
                    <motion.p variants={fadeUp} className="mx-auto max-w-xl text-sm font-light leading-relaxed text-gray-400 md:text-base lg:mx-0">
                        Sentra pelatihan kelautan dan perikanan yang tumbuh dari masyarakat, oleh masyarakat, dan untuk masyarakat guna
                        mewujudkan kedaulatan pangan melalui peningkatan kapasitas SDM mandiri.
                    </motion.p>
                    <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                        <Link
                            href={REGISTER_ROUTE}
                            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:w-auto"
                        >
                            <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
                            Daftar Sekarang
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                        <a
                            href={STANDAR_PELAYANAN_PDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto"
                        >
                            <FileText className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                            Standar Pelayanan (PDF)
                        </a>
                    </motion.div>
                </motion.div>

                {/* Photo collage with scroll parallax + pointer tilt */}
                <motion.div
                    onPointerMove={handlePointer}
                    onPointerLeave={() => {
                        mx.set(0);
                        my.set(0);
                    }}
                    style={{ rotateX, rotateY, transformPerspective: 1200 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    className="relative mx-auto hidden h-[440px] w-full max-w-[480px] md:block"
                    aria-hidden="true"
                >
                    {[
                        "left-0 top-6 h-64 w-56 -rotate-6",
                        "right-0 top-0 z-10 h-72 w-60 rotate-3",
                        "bottom-0 left-16 z-20 h-56 w-64 -rotate-2",
                    ].map((pos, i) => (
                        <motion.div
                            key={HERO_PHOTOS[i]}
                            style={{ y: photoY[i] }}
                            className={cn("absolute overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-blue-950/60", pos)}
                        >
                            <Image src={HERO_PHOTOS[i]} alt="" fill sizes="260px" className="object-cover" priority={i === 0} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent" />
                        </motion.div>
                    ))}
                    <div className="absolute -right-6 bottom-10 z-30 rounded-2xl border border-white/15 bg-[#0b1324]/80 px-4 py-3 backdrop-blur-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Lembaga aktif</p>
                        <p className="font-calsans text-2xl text-white">{loading ? "…" : totalLembaga.toLocaleString("id-ID")}</p>
                    </div>
                </motion.div>
            </div>

            {/* Stats */}
            <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } } }}
                className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
            >
                {[
                    { icon: Users, label: "Lembaga P2MKP", value: totalLembaga, loading },
                    { icon: Award, label: "SDM Terlatih", value: STATIC_STATS.sdmTerlatih, suffix: "+" },
                    { icon: MapPin, label: "Tersebar di", value: totalProvinsi, suffix: " Prov", loading },
                    { icon: TrendingUp, label: "Pertumbuhan", value: STATIC_STATS.pertumbuhanPersen, suffix: "%" },
                ].map((s) => (
                    <motion.div key={s.label} variants={fadeUp}>
                        <StatCard {...s} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Sticky in-page navigation                                           */
/* ------------------------------------------------------------------ */
function SectionNav() {
    const ids = React.useMemo(() => SECTIONS.map((s) => s.id), []);
    const active = useActiveSection(ids);

    return (
        <nav aria-label="Navigasi halaman" className="sticky top-20 z-30 flex justify-center px-4">
            <div className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0b1324]/80 p-1 shadow-2xl backdrop-blur-xl [scrollbar-width:none]">
                {SECTIONS.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        aria-current={active === s.id ? "true" : undefined}
                        className={cn(
                            "relative shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                            active === s.id ? "text-white" : "text-gray-400 hover:text-white"
                        )}
                    >
                        {active === s.id && (
                            <motion.span layoutId="p2mkp-nav-pill" className="absolute inset-0 -z-10 rounded-full bg-blue-600" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                        )}
                        {s.label}
                    </a>
                ))}
                <Link
                    href={REGISTER_ROUTE}
                    className="ml-1 hidden shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#020617] transition-transform hover:scale-105 sm:inline-flex"
                >
                    Daftar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
            </div>
        </nav>
    );
}

/* ------------------------------------------------------------------ */
/*  How to join                                                         */
/* ------------------------------------------------------------------ */
function FlowSection() {
    const ref = React.useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    // The connector line "draws" itself as the steps scroll into view.
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
    const lineScale = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 1 : 0, 1]);

    return (
        <section id="alur" className="scroll-mt-32 px-4 py-20">
            <div className="mx-auto max-w-7xl">
                <SectionTitle
                    eyebrow="Cara Bergabung"
                    title="Langkah Menuju P2MKP"
                    description="Ikuti langkah-langkah mudah berikut untuk meresmikan lembaga pelatihan Anda."
                />

                <div ref={ref} className="relative lg:px-10">
                    <div className="absolute left-[10%] right-[10%] top-12 hidden h-px bg-white/10 lg:block" aria-hidden="true">
                        <motion.div style={{ scaleX: lineScale }} className="h-full origin-left bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
                    </div>

                    <motion.ol
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
                        className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {FLOW_STEPS.map((step, i) => {
                            const last = i === FLOW_STEPS.length - 1;
                            const Icon = step.icon;
                            return (
                                <motion.li
                                    key={step.title}
                                    variants={fadeUp}
                                    className={cn(
                                        "group relative rounded-[2rem] border p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1",
                                        last
                                            ? "border-blue-400 bg-gradient-to-br from-blue-600 to-cyan-600 shadow-xl shadow-blue-600/30"
                                            : "border-white/10 bg-white/5 hover:border-blue-400/30 hover:bg-white/[0.08]"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-xl font-calsans text-sm shadow-md",
                                            last ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                        )}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <Icon className={cn("h-8 w-8 transition-transform group-hover:scale-110", last ? "text-white" : "text-cyan-300")} aria-hidden="true" />
                                    <h3 className="mt-4 font-calsans text-lg text-white">{step.title}</h3>
                                    <p className={cn("mt-1 text-xs leading-relaxed", last ? "text-blue-50/80" : "text-gray-400")}>{step.desc}</p>
                                    <span
                                        className={cn(
                                            "mt-4 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                            last ? "bg-white/20 text-white" : "border border-white/5 bg-white/5 text-gray-500"
                                        )}
                                    >
                                        {step.tag}
                                    </span>
                                </motion.li>
                            );
                        })}
                    </motion.ol>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Final call to action                                                */
/* ------------------------------------------------------------------ */
function CtaSection() {
    return (
        <section className="relative overflow-hidden px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8 }}
                className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-blue-400/20 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-14 text-center shadow-2xl shadow-blue-900/50 md:px-12"
            >
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:40px_40px]"
                />
                <h2 className="relative font-calsans text-2xl leading-tight md:text-4xl">
                    Siap untuk bergabung
                    <br />
                    <span className="text-cyan-200">bersama kami?</span>
                </h2>
                <p className="relative mx-auto mt-3 max-w-lg text-sm font-light text-blue-100/80">
                    Bantu kami mencetak generasi baru wirausaha dan lembaga pelatihan bidang kelautan dan perikanan yang tangguh.
                    Daftarkan lembaga Anda sekarang.
                </p>
                <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href={REGISTER_ROUTE}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-blue-800 shadow-xl transition-all hover:-translate-y-0.5 hover:gap-3"
                    >
                        Daftar Jadi P2MKP
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a href="#faq" className="text-sm font-semibold text-blue-100 underline-offset-4 hover:underline">
                        Masih ragu? Baca FAQ
                    </a>
                </div>
            </motion.div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function P2MKPPage() {
    const { list, loading, totalProvinsi } = useApprovedP2MKP();
    const reduceMotion = useReducedMotion();

    // Background glow drifts slower than the page.
    const { scrollYProgress } = useScroll();
    const glowY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "-40%"]);

    return (
        <div className="min-h-screen overflow-x-clip bg-[#020617] pt-16 font-jakarta text-white selection:bg-blue-500/30">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <motion.div style={{ y: glowY }} className="absolute inset-0">
                    <div className="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-blue-600/15 blur-[140px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-600/15 blur-[140px]" />
                    <div className="absolute right-0 top-[30%] h-[40%] w-[40%] rounded-full bg-cyan-600/10 blur-[110px]" />
                </motion.div>
                <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150" />
            </div>

            <main className="relative z-10">
                <Hero totalLembaga={list.length} totalProvinsi={totalProvinsi} loading={loading} />
                <SectionNav />
                <FlowSection />
                <VideoGallerySection />
                <MapSection p2mkpList={list} loading={loading} />
                <FaqSection />
                <CtaSection />
                <MarqueeLogos />
            </main>
            <Footer />
        </div>
    );
}

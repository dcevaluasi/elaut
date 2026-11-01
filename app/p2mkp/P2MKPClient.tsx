"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { ArrowRight, Award, FileText, HelpCircle, MapPin, PlayCircle, Route, ShieldCheck, TrendingUp, Users } from "lucide-react";

import MarqueeLogos from "@/components/marquee-logos";
import { elautBaseUrl } from "@/constants/urls";
import type { P2MKP } from "@/types/p2mkp";

import { FLOW_STEPS, STATIC_STATS } from "./data";
import { isApproved, normalizeProvinsi } from "./utils";

import VideoGallerySection from "./VideoGallerySection";
import MapSection from "./MapSection";
import FaqSection from "./FaqSection";

/* ============================ KONSTANTA ============================ */

const REGISTER_ROUTE = "/p2mkp/registrasi";
const STANDAR_PELAYANAN_PDF = "/files/Standar Pelayanan P2MKP.pdf";
const HERO_PHOTOS = [
    { src: "/images/p2mkp/p2mkp1.jpg", alt: "Kegiatan pelatihan budidaya di P2MKP" },
    { src: "/images/p2mkp/p2mkp2.jpg", alt: "Peserta pelatihan P2MKP praktik lapangan" },
    { src: "/images/p2mkp/p2mkp3.jpg", alt: "Lembaga P2MKP binaan Kementerian Kelautan dan Perikanan" },
];
const ACCENTS = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6"];

const SECTIONS = [
    { id: "alur", label: "Alur", icon: Route, accent: "#3B82F6" },
    { id: "video", label: "Video", icon: PlayCircle, accent: "#06B6D4" },
    { id: "sebaran", label: "Peta", icon: MapPin, accent: "#10B981" },
    { id: "faq", label: "FAQ", icon: HelpCircle, accent: "#8B5CF6" },
];

const fmt = (n: number) => n.toLocaleString("id-ID");

/* ============================ DATA ============================ */

/** `initial` = data dari server (SSR). Bila null → fetch di browser seperti sebelumnya. */
function useApprovedP2MKP(initial?: P2MKP[] | null) {
    const hasInitial = Array.isArray(initial);
    const [list, setList] = React.useState<P2MKP[]>(hasInitial ? initial! : []);
    const [loading, setLoading] = React.useState(!hasInitial);

    React.useEffect(() => {
        if (hasInitial) return;
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
    }, [hasInitial]);

    const totalProvinsi = React.useMemo(() => new Set(list.map((i) => normalizeProvinsi(i.provinsi)).filter(Boolean)).size, [list]);
    return { list, loading, totalProvinsi };
}

function useActiveSection(ids: string[]) {
    const [active, setActive] = React.useState<string | null>(null);
    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [ids]);
    return active;
}

/* ============================ HERO ============================ */

function Hero({ totalLembaga, totalProvinsi, loading }: { totalLembaga: number; totalProvinsi: number; loading: boolean }) {
    return (
        <header className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)] p-6 md:p-10">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <ShieldCheck aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -left-10 -bottom-16 -z-10 w-72 h-72 rotate-12 text-sky-300 opacity-[0.08]" />

            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
                <div className="space-y-5 text-center lg:text-left">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Portal resmi P2MKP · KKP
                    </span>
                    <h1 className="font-calsans text-3xl md:text-5xl leading-[1.08] tracking-tight">
                        Pusat Pelatihan Mandiri{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">Kelautan dan Perikanan</span>
                    </h1>
                    <p className="mx-auto lg:mx-0 max-w-xl text-sm md:text-base text-blue-100/75 leading-relaxed">
                        <b className="text-white">P2MKP</b> adalah lembaga pelatihan kelautan dan perikanan yang tumbuh dari masyarakat, oleh masyarakat, dan untuk masyarakat — mewujudkan kedaulatan pangan melalui peningkatan kapasitas SDM mandiri.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:justify-center lg:justify-start">
                        <Link href={REGISTER_ROUTE} className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                            Daftar Jadi P2MKP <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <a
                            href={STANDAR_PELAYANAN_PDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-sm font-bold hover:bg-white/[0.14] transition-colors"
                        >
                            <FileText className="w-4 h-4 text-sky-300" /> Standar Pelayanan (PDF)
                        </a>
                    </div>
                </div>

                {/* Kolase foto (CSS saja, tanpa library animasi) */}
                <div className="group/col relative mx-auto hidden md:block h-[380px] w-full max-w-[460px]">
                    {[
                        "left-0 top-6 h-60 w-52 -rotate-6 group-hover/col:-rotate-[8deg] group-hover/col:-translate-x-2",
                        "right-0 top-0 z-10 h-64 w-56 rotate-3 group-hover/col:rotate-[5deg] group-hover/col:translate-x-2",
                        "bottom-0 left-16 z-20 h-52 w-60 -rotate-2 group-hover/col:rotate-0 group-hover/col:translate-y-1",
                    ].map((pos, i) => (
                        <div key={HERO_PHOTOS[i].src} className={`absolute overflow-hidden rounded-3xl ring-1 ring-white/20 shadow-2xl shadow-blue-950/60 transition-transform duration-500 ${pos}`}>
                            <Image src={HERO_PHOTOS[i].src} alt={HERO_PHOTOS[i].alt} fill sizes="240px" className="object-cover" priority={i === 0} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3F]/60 to-transparent" />
                        </div>
                    ))}
                    <div className="absolute -right-2 bottom-8 z-30 rounded-2xl bg-white/[0.12] ring-1 ring-white/25 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-sky-100/70">Lembaga aktif</p>
                        <p className="font-calsans text-2xl tabular-nums">{loading ? "…" : fmt(totalLembaga)}</p>
                    </div>
                </div>
            </div>

            {/* Bento KPI */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <HeroKpi icon={Users} label="Lembaga P2MKP" value={loading ? "…" : fmt(totalLembaga)} accent="#3B82F6" />
                <HeroKpi icon={Award} label="SDM terlatih" value={`${typeof STATIC_STATS.sdmTerlatih === "number" ? fmt(STATIC_STATS.sdmTerlatih) : STATIC_STATS.sdmTerlatih}+`} accent="#10B981" />
                <HeroKpi icon={MapPin} label="Tersebar di" value={loading ? "…" : `${fmt(totalProvinsi)} Prov`} accent="#06B6D4" />
                <HeroKpi icon={TrendingUp} label="Pertumbuhan" value={`${STATIC_STATS.pertumbuhanPersen}%`} accent="#F59E0B" />
            </div>
        </header>
    );
}

function HeroKpi({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
    return (
        <div className="group relative isolate overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/10 backdrop-blur px-4 py-3.5 transition-colors hover:bg-white/[0.12]">
            <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
            <Icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-2 -bottom-3 -z-10 w-16 h-16 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: accent }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100/70">{label}</p>
            <p className="mt-0.5 text-2xl md:text-3xl font-black tabular-nums tracking-tight">{value}</p>
        </div>
    );
}

/* ============================ NAVIGASI SEKSI (navy glass) ============================ */

function SectionNav() {
    const ids = React.useMemo(() => SECTIONS.map((s) => s.id), []);
    const active = useActiveSection(ids);

    return (
        <nav aria-label="Navigasi halaman" className="sticky top-20 z-30 isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F]/95 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-60" />
            <div className="flex items-center gap-1.5 p-1.5 overflow-x-auto [scrollbar-width:none]">
                {SECTIONS.map((s) => {
                    const on = active === s.id;
                    return (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            aria-current={on ? "true" : undefined}
                            className={`group relative isolate overflow-hidden flex-1 min-w-[96px] inline-flex items-center justify-center gap-2 h-11 px-3 rounded-[1.2rem] text-xs font-bold ring-1 transition-all ${on ? "bg-white/[0.12] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`}
                        >
                            {on && <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${s.accent}59 0%, transparent 80%)` }} />}
                            <s.icon aria-hidden strokeWidth={1.5} className={`pointer-events-none absolute -right-2 -bottom-3 -z-10 w-11 h-11 -rotate-12 transition-opacity ${on ? "opacity-40" : "opacity-0 group-hover:opacity-20"}`} style={{ color: s.accent }} />
                            <span className={`p-1 rounded-lg ${on ? "text-white" : "bg-white/10 text-sky-100"}`} style={on ? { background: s.accent } : undefined}>
                                <s.icon className="w-3.5 h-3.5" />
                            </span>
                            {s.label}
                        </a>
                    );
                })}
                <Link href={REGISTER_ROUTE} className="hidden sm:inline-flex shrink-0 items-center gap-1.5 h-11 px-4 rounded-[1.2rem] bg-white text-[#0B1B3F] text-xs font-bold hover:bg-sky-100 transition-colors">
                    Daftar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </nav>
    );
}

/* ============================ ALUR BERGABUNG ============================ */

function SectionHead({ id, icon: Icon, accent, eyebrow, title, desc }: { id?: string; icon: React.ElementType; accent: string; eyebrow: string; title: string; desc: string }) {
    return (
        <div className="flex items-center gap-3.5">
            <div className="relative isolate overflow-hidden w-12 h-12 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 grid place-items-center shrink-0">
                <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300/80">{eyebrow}</p>
                <h2 id={id} className="text-xl md:text-2xl font-calsans leading-tight">{title}</h2>
                <p className="text-xs md:text-sm text-slate-400">{desc}</p>
            </div>
        </div>
    );
}

function FlowSection() {
    return (
        <section id="alur" aria-labelledby="alur-title" className="scroll-mt-36 space-y-6">
            <SectionHead id="alur-title" icon={Route} accent="#3B82F6" eyebrow="Cara bergabung" title="Langkah menjadi P2MKP" desc="Ikuti langkah berikut untuk meresmikan lembaga pelatihan Anda." />

            <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {FLOW_STEPS.map((step, i) => {
                    const last = i === FLOW_STEPS.length - 1;
                    const accent = ACCENTS[i % ACCENTS.length];
                    const Icon = step.icon as React.ElementType;
                    return (
                        <li
                            key={step.title}
                            className={`group relative isolate overflow-hidden rounded-3xl p-5 ring-1 transition-all hover:-translate-y-0.5 ${last ? "bg-[#0B1B3F] ring-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_20px_40px_-20px_#10B981]" : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.07]"}`}
                        >
                            <span aria-hidden className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ${last ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
                            <Icon aria-hidden strokeWidth={1.4} className="pointer-events-none absolute -right-4 -bottom-5 -z-10 w-24 h-24 -rotate-12 opacity-[0.08] transition-all duration-500 group-hover:opacity-20 group-hover:-rotate-6" style={{ color: accent }} />

                            <div className="flex items-center gap-3">
                                <span className="relative grid place-items-center w-11 h-11 rounded-2xl text-white ring-4 ring-[#020617] shrink-0" style={{ background: accent }}>
                                    <Icon className="w-5 h-5" />
                                </span>
                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-500">LANGKAH {String(i + 1).padStart(2, "0")}</span>
                            </div>
                            <h3 className="mt-4 font-calsans text-lg leading-tight">{step.title}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">{step.desc}</p>
                            {step.tag && <span className="mt-4 inline-block rounded-full bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">{step.tag}</span>}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

/* ============================ CTA ============================ */

function CtaSection() {
    return (
        <section aria-labelledby="cta-title" className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 px-6 py-12 md:px-12 text-center shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)]">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_100%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_0%_100%,#10B98155_0%,transparent_60%)]" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px]" />
            <Award aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-8 -bottom-12 -z-10 w-60 h-60 -rotate-12 text-emerald-300 opacity-[0.12]" />
            <h2 id="cta-title" className="font-calsans text-2xl md:text-4xl leading-tight">
                Siap bergabung <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-emerald-300">bersama kami?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100/75">Bantu mencetak generasi baru wirausaha dan lembaga pelatihan kelautan dan perikanan yang tangguh. Daftarkan lembaga Anda sekarang.</p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={REGISTER_ROUTE} className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors">
                    Daftar Jadi P2MKP <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="#faq" className="text-sm font-semibold text-sky-200 underline-offset-4 hover:underline">
                    Masih ragu? Baca FAQ
                </a>
            </div>
        </section>
    );
}

/* ============================ PAGE (client) ============================ */

export default function P2MKPClient({ initialList }: { initialList?: P2MKP[] | null }) {
    const { list, loading, totalProvinsi } = useApprovedP2MKP(initialList);

    return (
        <div className="relative overflow-x-clip bg-[#020617] font-jakarta text-white selection:bg-blue-500/30">
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(60%_30%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_30%_at_100%_40%,#0EA5E926_0%,transparent_60%)]" />
                <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_25%)]" />
            </div>

            <main className="relative z-10">
                <div className="mx-auto max-w-7xl px-4 pt-28 md:pt-36 space-y-6">
                    <nav aria-label="Breadcrumb" className="text-[11px] text-slate-400">
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li>
                                <Link href="/" className="hover:text-white">Beranda</Link>
                            </li>
                            <li aria-hidden>/</li>
                            <li aria-current="page" className="text-sky-200">P2MKP</li>
                        </ol>
                    </nav>
                    <Hero totalLembaga={list.length} totalProvinsi={totalProvinsi} loading={loading} />
                    <SectionNav />
                    <div className="pt-6">
                        <FlowSection />
                    </div>
                </div>

                <VideoGallerySection />
                <MapSection p2mkpList={list} loading={loading} />
                <FaqSection />

                <div className="mx-auto max-w-7xl px-4 py-12">
                    <CtaSection />
                </div>
                <MarqueeLogos />
            </main>
        </div>
    );
}

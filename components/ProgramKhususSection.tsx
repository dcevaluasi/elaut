"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Content                                                             */
/* ------------------------------------------------------------------ */
/** Full class strings per accent so Tailwind can see them at build time. */
const ACCENTS = {
  blue: {
    badge: "border-blue-400/30 bg-blue-500/20 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.25)]",
    title: "group-hover:text-blue-200",
    link: "text-blue-300",
    border: "hover:border-blue-400/40",
    glow: "rgba(59,130,246,0.25)",
  },
  cyan: {
    badge: "border-cyan-400/30 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
    title: "group-hover:text-cyan-200",
    link: "text-cyan-300",
    border: "hover:border-cyan-400/40",
    glow: "rgba(6,182,212,0.25)",
  },
} as const;

type Program = {
  href: string;
  image: string;
  icon: string;
  tag: string;
  title: string;
  description: string;
  accent: keyof typeof ACCENTS;
};

const PROGRAMS: Program[] = [
  {
    href: "https://elaut-bppsdm.kkp.go.id/waingapu",
    image: "/images/hero-img6.jpg",
    icon: "/icons/icperikanan.png",
    tag: "Budi Daya Udang",
    title: "Program Diklat Khusus Budi Daya Udang Terintegrasi Waingapu",
    description: "Pelatihan komprehensif untuk mendukung pengembangan tambak udang terintegrasi.",
    accent: "blue",
  },
  {
    href: "https://elaut-bppsdm.kkp.go.id/akp",
    image: "/images/hero-img2.jpg",
    icon: "/icons/icawak.png",
    tag: "Awak Kapal Perikanan",
    title: "Program Diklat dan Sertifikasi Awak Kapal Perikanan untuk Modernisasi Kapal Perikanan",
    description: "Diklat dan sertifikasi kompetensi untuk mendukung modernisasi kapal perikanan nasional.",
    accent: "cyan",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */
function ProgramCard({ program }: { program: Program }) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const accent = ACCENTS[program.accent];

  // Photo moves slower than the card while scrolling (parallax inside the card).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-8%", "8%"]);

  /** Spotlight + slight tilt toward the pointer (CSS vars, no re-render). */
  const handleMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || reduceMotion) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--x", `${px * 100}%`);
    el.style.setProperty("--y", `${py * 100}%`);
    el.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-4px)`;
  };
  const handleLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <motion.div variants={fadeUp}>
      <a
        ref={ref}
        href={program.href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={cn(
          "group relative flex min-h-[370px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-2xl transition-[transform,border-color,box-shadow] duration-300 ease-out hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:min-h-[420px]",
          accent.border
        )}
      >
        {/* Photo with parallax + zoom on hover */}
        <motion.div style={{ y: imageY }} className="absolute -inset-y-[10%] inset-x-0" aria-hidden="true">
          <Image
            src={program.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at var(--x, 50%) var(--y, 0%), ${accent.glow}, transparent 60%)`,
          }}
        />

        {/* Top row: icon + external link hint */}
        <div className="relative flex items-start justify-between p-6 md:p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Image src={program.icon} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-[#020617]">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        {/* Text */}
        <div className="relative mt-auto p-6 pt-0 md:p-10 md:pt-0">
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
              accent.badge
            )}
          >
            {program.tag}
          </span>
          <h3
            className={cn(
              "mt-4 font-calsans text-xl leading-snug text-white drop-shadow-md transition-colors md:text-2xl",
              accent.title
            )}
          >
            {program.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-300 drop-shadow transition-colors group-hover:text-white">
            {program.description}
          </p>
          <span className={cn("mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-3", accent.link)}>
            Kunjungi portal
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(membuka tab baru)</span>
          </span>
        </div>
      </a>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */
export default function ProgramKhususSection() {
  return (
    <section className="relative z-10 mt-12 w-full border-t border-white/10 pt-12">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="mb-8 space-y-2 text-center md:text-left"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
          Program Unggulan
        </motion.span>
        <motion.h2 variants={fadeUp} className="font-calsans text-2xl leading-tight text-white md:text-3xl lg:text-4xl">
          Program Khusus SDM Kelautan dan Perikanan
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto max-w-2xl text-xs leading-relaxed text-gray-400 md:mx-0 md:text-sm"
        >
          Inisiatif strategis untuk mencetak SDM unggul melalui pelatihan dan sertifikasi kompetensi khusus.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="relative grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {PROGRAMS.map((program) => (
          <ProgramCard key={program.href} program={program} />
        ))}
      </motion.div>
    </section>
  );
}

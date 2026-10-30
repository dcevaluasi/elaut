"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Content                                                             */
/* ------------------------------------------------------------------ */
const IMAGES = [1, 2, 3, 4, 5, 6].map((n) => `/images/p2mkp/p2mkp${n}.jpg`);
const SLIDE_MS = 5000;
const SWIPE_PX = 50;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ------------------------------------------------------------------ */
/*  Section                                                             */
/* ------------------------------------------------------------------ */
export default function P2MKPSection() {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const touchX = React.useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(cardRef, { amount: 0.3 });

  const [current, setCurrent] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);

  /** Autoplay only while visible, not hovered, not paused and motion is allowed. */
  const playing = inView && !hovered && !userPaused && !reduceMotion;

  const go = React.useCallback(
    (step: number) => setCurrent((c) => (c + step + IMAGES.length) % IMAGES.length),
    []
  );

  // Restart the timer on every slide change, so a manual pick gets a full 5s too.
  React.useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [current, playing, go]);

  /* Scroll parallax: background drifts slower than the card. */
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-10%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [40, -40]);

  /* Spotlight that follows the pointer (CSS vars, no re-render). */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  const navBtn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all hover:border-teal-300/50 hover:bg-teal-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300";

  return (
    <section className="relative z-10 mb-12 mt-12 w-full border-t border-white/10 pt-12">
      <div
        ref={cardRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galeri P2MKP"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
        className="group relative flex min-h-[460px] w-full items-center overflow-hidden rounded-3xl border border-white/10 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 md:min-h-[520px]"
      >
        {/* Background slideshow (crossfade + slow zoom) with scroll parallax */}
        <div className="absolute inset-0 bg-[#020617]" aria-hidden="true">
          <motion.div style={{ y: bgY }} className="absolute -inset-y-[12%] inset-x-0">
            <AnimatePresence>
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.5, ease: "easeInOut" },
                  scale: { duration: SLIDE_MS / 1000 + 1, ease: "linear" },
                }}
                className="absolute inset-0"
              >
                <Image
                  src={IMAGES[current]}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority={current === 0}
                  className="object-cover opacity-70 mix-blend-luminosity brightness-110 contrast-125"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Overlays for readability and texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-[#020617]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-teal-900/10 mix-blend-color" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(500px_circle_at_var(--x,50%)_var(--y,50%),rgba(45,212,191,0.15),transparent_60%)]" />
        </div>

        {/* Content */}
        <motion.div style={{ y: contentY }} className="relative z-10 max-w-3xl p-8 pb-24 md:p-16 md:pb-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            className="space-y-6"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              Pusat Pelatihan Mandiri
            </motion.span>

            <motion.h2 variants={fadeUp} className="font-calsans text-5xl leading-tight drop-shadow-2xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-teal-300 via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
                P2MKP
              </span>
              <span className="mt-1 block text-base font-normal text-gray-400 md:text-lg">
                Pusat Pelatihan Mandiri Kelautan dan Perikanan
              </span>
            </motion.h2>

            <motion.p variants={fadeUp} className="max-w-2xl text-sm font-light leading-relaxed text-gray-300 md:text-base lg:text-lg">
              Punya lembaga yang aktif dalam usaha dan bisnis serta peningkatan SDM di bidang kelautan dan
              perikanan? Ingin berkontribusi sebagai penggerak dalam meningkatkan sektor usaha serta SDM KP?
            </motion.p>
            <motion.p variants={fadeUp} className="max-w-2xl font-medium text-white md:text-lg">
              Ayo bergabung dan ciptakan ekosistem pelatihan yang berdaya saing tinggi.
            </motion.p>

            <motion.div variants={fadeUp} className="pt-2">
              <Link
                href="/p2mkp"
                className="group/btn relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md transition-all duration-700 group-hover/btn:left-[120%]"
                />
                <span className="relative text-sm uppercase tracking-wider">Gabung P2MKP Sekarang</span>
                <ArrowRight className="relative h-5 w-5 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Controls: prev / play-pause / next + progress indicators */}
        <div className="absolute inset-x-6 bottom-6 z-10 flex items-center justify-between gap-4 md:inset-x-8 md:bottom-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className={navBtn}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Putar slideshow" : "Jeda slideshow"}
              aria-pressed={userPaused}
              className={navBtn}
            >
              {userPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className={navBtn}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Tampilkan foto ${i + 1}`}
                aria-current={i === current}
                className={cn(
                  "relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-500 hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300",
                  i === current ? "w-10" : "w-2 hover:w-4"
                )}
              >
                {i === current && (
                  <motion.span
                    key={`${current}-${playing}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                    initial={{ width: playing ? "0%" : "100%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Foto {current + 1} dari {IMAGES.length}
        </p>
      </div>
    </section>
  );
}

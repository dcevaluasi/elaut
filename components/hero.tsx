"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown, ExternalLink, Play, PlayCircle, Youtube, X } from "lucide-react";

import Logo from "@/components/ui/logo";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";
import { cn } from "@/lib/utils";
import ProgramKhususSection from "./ProgramKhususSection";
import P2MKPSection from "./P2MKPSection";

/* ------------------------------------------------------------------ */
/*  Content                                                             */
/* ------------------------------------------------------------------ */
type VideoPelatihan = {
  id: string;
  linkPelatihan: string;
  namaPelatihan: string;
  penyelenggara?: string;
  programPelatihan?: string;
  jenisProgramPelatihan?: string;
};

const HERO_IMAGES = [
  "/images/hero-img4-preview.jpg",
  "/images/hero-img.jpg",
  "/images/hero-img3.jpg",
  "/images/hero-img7.jpg",
];
const SLIDE_MS = 8000;
const MAX_VIDEOS = 5;

const PROGRAMS = [
  {
    name: "Perikanan",
    icon: "/icons/icperikanan.png",
    slug: "perikanan",
    description:
      "Pelatihan perikanan meliputi penangkapan ikan, budidaya, serta inovasi sumber daya laut berkelanjutan.",
  },
  {
    name: "Awak Kapal Perikanan",
    icon: "/icons/icawak.png",
    slug: "akp",
    description: "Membekali keterampilan penangkapan ikan, navigasi, dan keselamatan di laut.",
  },
  {
    name: "Kelautan",
    icon: "/icons/ickelautan.png",
    slug: "kelautan",
    description:
      "Eksplorasi tak terbatas: pengelolaan sumber daya, konservasi, riset, dan teknologi kelautan.",
  },
];

/** Returns the 11-character YouTube id from any common YouTube URL (or the input itself). */
const extractYoutubeId = (url?: string) => {
  if (!url) return "";
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : url;
};

const videoMeta = (v: VideoPelatihan) =>
  [v.penyelenggara, v.programPelatihan || v.jenisProgramPelatihan].filter(Boolean).join(" • ");

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                               */
/* ------------------------------------------------------------------ */
function useVideoPelatihan() {
  const [videos, setVideos] = React.useState<VideoPelatihan[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      // The util is typed as `{ id: string }[]`, so assert the fuller shape here.
      const data = (await getAllVideoPelatihans()) as VideoPelatihan[];
      setVideos([...data].reverse().slice(0, MAX_VIDEOS)); // oldest first
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { videos, status, reload: load };
}

/* ------------------------------------------------------------------ */
/*  Pieces                                                              */
/* ------------------------------------------------------------------ */
function ProgramCard({ program, index }: { program: (typeof PROGRAMS)[number]; index: number }) {
  const handleMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link
        href={`/layanan/pelatihan/program/${program.slug}`}
        onPointerMove={handleMove}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-400/40 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(420px_circle_at_var(--x,50%)_var(--y,0%),rgba(96,165,250,0.18),transparent_60%)]"
        />
        <div className="relative flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <div className="absolute inset-0 rounded-full bg-blue-400/25 blur-xl" aria-hidden="true" />
            <Image src={program.icon} alt="" fill sizes="64px" className="relative object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-blue-300/60">0{index + 1}</p>
            <h3 className="font-calsans text-xl text-white transition-colors group-hover:text-blue-200">
              {program.name}
            </h3>
          </div>
        </div>
        <p className="relative mt-4 flex-1 text-sm font-light leading-relaxed text-gray-400">
          {program.description}
        </p>
        <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-all group-hover:gap-2.5 group-hover:text-white">
          Lihat program
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </motion.div>
  );
}

function VideoCard({
  video,
  featured = false,
  onPlay,
}: {
  video: VideoPelatihan;
  featured?: boolean;
  onPlay: () => void;
}) {
  const ytId = extractYoutubeId(video.linkPelatihan);

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Putar video ${video.namaPelatihan}`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        featured ? "h-full min-h-[300px]" : "h-[180px]"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
        alt=""
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          const fallback = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          if (img.src !== fallback) img.src = fallback;
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

      <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span
          className={cn(
            "flex items-center justify-center rounded-full border border-blue-300/40 bg-blue-600/90 shadow-2xl shadow-blue-500/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110",
            featured ? "h-16 w-16" : "h-12 w-12"
          )}
        >
          <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
        </span>
      </span>

      <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 backdrop-blur-sm">
        <Youtube className="h-3 w-3 text-red-400" aria-hidden="true" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-300">YouTube</span>
      </span>

      <span className="absolute inset-x-0 bottom-0 block p-4">
        {featured && (
          <span className="mb-2 inline-block rounded-full border border-blue-400/30 bg-blue-600/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white">
            Video Utama
          </span>
        )}
        <span className={cn("line-clamp-2 block font-bold leading-snug text-white", featured ? "text-base md:text-lg" : "text-xs")}>
          {video.namaPelatihan}
        </span>
        {videoMeta(video) && (
          <span className="mt-1 line-clamp-1 block text-[10px] text-gray-300">{videoMeta(video)}</span>
        )}
      </span>
    </button>
  );
}

function VideoModal({ video, onClose }: { video: VideoPelatihan; onClose: () => void }) {
  const ytId = extractYoutubeId(video.linkPelatihan);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={video.namaPelatihan}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-jakarta"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#050d1a] shadow-2xl shadow-blue-500/20"
      >
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={video.namaPelatihan}
          />
        </div>
        <div className="flex items-center gap-3 border-t border-white/5 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/20">
            <Youtube className="h-4 w-4 text-red-400" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-white">{video.namaPelatihan}</h4>
            {videoMeta(video) && <p className="mt-0.5 truncate text-xs text-gray-400">{videoMeta(video)}</p>}
          </div>
          <a
            href={`https://youtu.be/${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Buka di YouTube
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup video"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition-all hover:bg-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function VideoSkeleton() {
  const shimmer = (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  );
  return (
    <>
      <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-white/5 bg-[#1e293b]/40 lg:row-span-2">
        {shimmer}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative h-[180px] overflow-hidden rounded-3xl border border-white/5 bg-[#1e293b]/40">
            {shimmer}
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */
export default function Hero() {
  const heroRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const [slide, setSlide] = React.useState(0);
  const [activeVideo, setActiveVideo] = React.useState<VideoPelatihan | null>(null);
  const { videos, status: videoStatus, reload: reloadVideos } = useVideoPelatihan();

  /* Scroll parallax: background drifts slower, content fades & rises. */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduceMotion ? 1 : 0]);

  /* Pointer parallax on the glow blobs (smoothed with a spring). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const glowX = useSpring(useTransform(mx, (v) => v * 50), { stiffness: 60, damping: 20 });
  const glowY = useSpring(useTransform(my, (v) => v * 50), { stiffness: 60, damping: 20 });
  const handlePointer = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  React.useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [slide, reduceMotion]);

  const playVideo = (video: VideoPelatihan) => {
    setActiveVideo(video);
    incrementVideoClick(video.id).catch(() => { });
  };
  const closeVideo = React.useCallback(() => setActiveVideo(null), []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  const [featured, ...others] = videos;

  return (
    <section className="relative overflow-hidden bg-[#020617] font-jakarta selection:bg-blue-500/30">
      {/* ============================== HERO ============================== */}
      <div ref={heroRef} onPointerMove={handlePointer} className="relative isolate min-h-[100svh] overflow-hidden pt-20">
        {/* Background slideshow with scroll parallax */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 -z-20" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.2, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image src={HERO_IMAGES[slide]} alt="" fill priority={slide === 0} sizes="100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Tint, grid, noise, glow */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 contrast-150" />
        <motion.div style={{ x: glowX, y: glowY }} className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -left-24 -top-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/10 blur-[150px]" />
          <div className="absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-600/15 blur-[110px]" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col justify-center gap-10 px-6 py-16 md:px-12"
        >
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-blue-300 backdrop-blur-md sm:text-xs"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
              </span>
              Next Generation Marine Training
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-calsans text-3xl leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-6xl"
            >
              Elektronik Layanan Pelatihan
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Utama Terpadu
              </span>
            </motion.h1>

            <motion.div variants={fadeUp} className="mt-3 flex flex-col items-center gap-2 md:flex-row md:items-end md:gap-4">
              <span className="bg-gradient-to-b from-blue-400 to-indigo-600 bg-clip-text font-calsans text-6xl leading-none text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.35)] sm:text-8xl lg:text-9xl">
                E-LAUT
              </span>
              <div className="hero-logo scale-75 md:mb-4 md:scale-100">
                <Logo />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-gray-400 md:text-lg">
              Wujudkan kemandirian sumber daya manusia kelautan dan perikanan yang unggul dan inovatif
              melalui platform pelatihan digital terstandarisasi.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => scrollTo("program-pelatihan")}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-3.5 font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-400/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]"
                />
                Jelajahi Program
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollTo("video-pelatihan")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <PlayCircle className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                Tonton Video Gratis
              </button>
            </motion.div>
          </div>

          {/* Programs */}
          <motion.div
            id="program-pelatihan"
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
            className="grid w-full scroll-mt-24 grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
          >
            {PROGRAMS.map((program, i) => (
              <ProgramCard key={program.slug} program={program} index={i} />
            ))}
          </motion.div>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 right-6 hidden items-center gap-2 md:flex">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Tampilkan gambar ${i + 1}`}
              aria-current={i === slide}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                i === slide ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/80"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTo("program-khusus")}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 rounded-lg p-1 text-xs text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:flex"
        >
          Gulir
          <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
        </button>
      </div>

      {/* ========================= BELOW THE FOLD ========================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-20 md:px-12">
        <div id="program-khusus" className="w-full scroll-mt-24">
          <ProgramKhususSection />
        </div>

        {/* Free training videos */}
        <div id="video-pelatihan" className="relative mt-12 w-full scroll-mt-24 border-t border-white/10 pt-12">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="mb-8 flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left"
          >
            <div className="space-y-2">
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400"
              >
                Galeri Video
              </motion.span>
              <motion.h2 variants={fadeUp} className="font-calsans text-2xl leading-tight text-white md:text-3xl lg:text-4xl">
                Video Pelatihan Gratis
              </motion.h2>
              <motion.p variants={fadeUp} className="max-w-xl text-xs leading-relaxed text-gray-400 md:text-sm">
                Tonton panduan, informasi, dan teknik mutakhir dari program pelatihan unggulan kami.
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                href="/layanan/pelatihan/video/gratis"
                className="group inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-white/5 px-5 py-2.5 text-sm font-semibold text-blue-300 transition-all hover:border-transparent hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Lihat semua video
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-2">
            {videoStatus === "loading" && <VideoSkeleton />}

            {videoStatus === "error" && (
              <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
                <p className="text-sm text-gray-300">Video pelatihan gagal dimuat.</p>
                <button
                  type="button"
                  onClick={reloadVideos}
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Coba lagi
                </button>
              </div>
            )}

            {videoStatus === "ready" && !featured && (
              <p className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-gray-400">
                Belum ada video pelatihan. Nantikan konten terbaru dari kami!
              </p>
            )}

            {videoStatus === "ready" && featured && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="lg:row-span-2"
                >
                  <VideoCard video={featured} featured onPlay={() => playVideo(featured)} />
                </motion.div>

                {others.length > 0 && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {others.map((video, i) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                      >
                        <VideoCard video={video} onPlay={() => playVideo(video)} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <P2MKPSection />
      </div>

      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={closeVideo} />}
      </AnimatePresence>
    </section>
  );
}
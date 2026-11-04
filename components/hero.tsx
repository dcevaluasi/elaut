"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Pause, Play, PlayCircle, Sparkles, Youtube, X } from "lucide-react";

import Logo from "@/components/ui/logo";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";

type VideoPelatihan = { id: string; linkPelatihan: string; namaPelatihan: string; penyelenggara?: string; programPelatihan?: string; jenisProgramPelatihan?: string };

const HERO_IMAGES = [
  { src: "/images/hero-img4-preview.jpg", alt: "Peserta pelatihan kelautan dan perikanan KKP" },
  { src: "/images/hero-img.jpg", alt: "Kegiatan pelatihan budidaya perikanan" },
  { src: "/images/hero-img3.jpg", alt: "Pelatihan awak kapal perikanan" },
  { src: "/images/hero-img7.jpg", alt: "Pelatihan pengolahan hasil perikanan" },
];
const SLIDE_MS = 8000;
const MAX_VIDEOS = 5;

const PROGRAMS = [
  { name: "Perikanan", icon: "/icons/icperikanan.png", slug: "perikanan", accent: "#06B6D4", description: "Pelatihan penangkapan ikan, budidaya, pengolahan, dan inovasi sumber daya perikanan berkelanjutan." },
  { name: "Awak Kapal Perikanan", icon: "/icons/icawak.png", slug: "akp", accent: "#3B82F6", description: "Keterampilan penangkapan ikan, navigasi, permesinan, dan keselamatan kerja di laut." },
  { name: "Kelautan", icon: "/icons/ickelautan.png", slug: "kelautan", accent: "#6366F1", description: "Pengelolaan sumber daya, konservasi, riset, dan teknologi kelautan." },
];

const ytIdOf = (url?: string) => {
  if (!url) return "";
  const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : url;
};
const metaOf = (v: VideoPelatihan) => [v.penyelenggara, v.programPelatihan || v.jenisProgramPelatihan].filter(Boolean).join(" · ");

/* ============================ HOOKS ============================ */

/** Muat video hanya saat elemen mendekati viewport */
function useLazyVideos(ref: React.RefObject<HTMLElement | null>) {
  const [videos, setVideos] = React.useState<VideoPelatihan[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const data = (await getAllVideoPelatihans()) as VideoPelatihan[];
      setVideos([...data].reverse().slice(0, MAX_VIDEOS));
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || status !== "idle") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, status, load]);

  return { videos, status, reload: load };
}

/* ============================ HERO ============================ */

export default function Hero() {
  const [slide, setSlide] = React.useState(0);
  const [extraReady, setExtraReady] = React.useState(false); // gambar slide 2..n dimuat setelah idle
  const [activeVideo, setActiveVideo] = React.useState<VideoPelatihan | null>(null);
  const videoRef = React.useRef<HTMLElement>(null);
  const { videos, status, reload } = useLazyVideos(videoRef);

  React.useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const start = () => setExtraReady(true);
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 2500);
  }, []);

  React.useEffect(() => {
    if (!extraReady || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setSlide((s) => (s + 1) % HERO_IMAGES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [slide, extraReady]);

  const play = (v: VideoPelatihan) => {
    setActiveVideo(v);
    incrementVideoClick(v.id).catch(() => { });
  };

  const [featured, ...others] = videos;

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-[#020617] font-jakarta text-white selection:bg-blue-500/30">
      {/* ============================== HERO ============================== */}
      <div className="relative isolate min-h-[100svh] pt-20">
        {/* Slideshow latar (crossfade CSS) */}
        <div className="absolute inset-0 -z-20" aria-hidden>
          {HERO_IMAGES.map((img, i) =>
            i === 0 || extraReady ? (
              <Image
                key={img.src}
                src={img.src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "low"}
                className={`object-cover transition-opacity duration-[1500ms] ${i === slide ? "opacity-25" : "opacity-0"}`}
              />
            ) : null
          )}
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#020617]/30 via-[#020617]/60 to-[#020617]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_0%_0%,#2563EB40_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#0EA5E930_0%,transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col justify-center gap-10 px-6 py-14 md:px-12">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100 backdrop-blur">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Platform resmi BPPSDM KP
            </span>

            {/* H1 memuat kata kunci utama */}
            <h1 id="hero-title" className="mt-6 font-calsans text-3xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="sr-only">E-LAUT — </span>
              Elektronik Layanan Pelatihan{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Utama Terpadu</span>
            </h1>

            <div className="mt-3 flex flex-col items-center gap-2 md:flex-row md:items-end md:gap-4" aria-hidden>
              <span className="bg-gradient-to-b from-sky-300 to-blue-600 bg-clip-text font-calsans text-6xl leading-none text-transparent sm:text-8xl lg:text-9xl">E-LAUT</span>
              <div className="hero-logo scale-75 md:mb-4 md:scale-100">
                <Logo />
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-sm md:text-lg leading-relaxed text-blue-100/75">
              Platform <strong className="text-white">pelatihan dan sertifikasi kelautan dan perikanan</strong> resmi Kementerian Kelautan dan Perikanan — daftar pelatihan, belajar daring, dan raih sertifikat kompetensi ber-TTE.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a href="#program-pelatihan" className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 text-sm font-bold hover:bg-blue-500 transition-colors">
                Jelajahi program pelatihan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
              <a href="#video-pelatihan" className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-sm font-bold backdrop-blur hover:bg-white/[0.14] transition-colors">
                <PlayCircle className="h-5 w-5 text-sky-300" aria-hidden /> Tonton video gratis
              </a>
            </div>
          </div>

          {/* Program */}
          <ul id="program-pelatihan" className="grid w-full scroll-mt-24 grid-cols-1 gap-4 md:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/layanan/pelatihan/program/${p.slug}`}
                  className="group relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.05] ring-1 ring-white/10 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(to left, ${p.accent}40 0%, transparent 75%)` }} />
                  <div className="flex items-start gap-4">
                    <span className="relative h-14 w-14 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Image src={p.icon} alt="" fill sizes="56px" className="object-contain" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-sky-300/60">0{i + 1}</p>
                      <h2 className="font-calsans text-xl group-hover:text-sky-100">Pelatihan {p.name}</h2>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 group-hover:text-white">
                    Lihat program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Indikator slide */}
        <div className="absolute bottom-8 right-6 hidden items-center gap-2 md:flex">
          {HERO_IMAGES.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setExtraReady(true);
                setSlide(i);
              }}
              aria-label={`Tampilkan gambar ${i + 1}: ${img.alt}`}
              aria-current={i === slide}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/80"}`}
            />
          ))}
        </div>
        <a href="#program-khusus" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-slate-400 hover:text-white md:flex">
          Gulir <ChevronDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" aria-hidden />
        </a>
      </div>

      {/* ========================= BAWAH ========================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-20 md:px-12">
        <ProgramKhusus />

        <section id="video-pelatihan" aria-labelledby="video-title" ref={videoRef} className="relative mt-16 w-full scroll-mt-24">
          <SectionHead
            icon={Youtube}
            accent="#F43F5E"
            eyebrow="Galeri video"
            title="Video pelatihan perikanan & kelautan gratis"
            desc="Panduan, informasi, dan teknik terbaru dari program pelatihan unggulan KKP."
            action={{ href: "/layanan/pelatihan/video/gratis", label: "Lihat semua video" }}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(status === "idle" || status === "loading") && (
              <>
                <div className="min-h-[300px] rounded-3xl bg-white/[0.05] ring-1 ring-white/10 animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="h-[170px] rounded-3xl bg-white/[0.05] ring-1 ring-white/10 animate-pulse" />)}
                </div>
              </>
            )}
            {status === "error" && (
              <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <p className="text-sm text-slate-300">Video pelatihan gagal dimuat.</p>
                <button type="button" onClick={reload} className="h-10 px-5 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100">Coba lagi</button>
              </div>
            )}
            {status === "ready" && !featured && <p className="col-span-full rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center text-sm text-slate-400">Belum ada video pelatihan.</p>}
            {status === "ready" && featured && (
              <>
                <div className="lg:row-span-2">
                  <VideoCard video={featured} featured onPlay={() => play(featured)} />
                </div>
                {others.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {others.map((v) => (
                      <VideoCard key={v.id} video={v} onPlay={() => play(v)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <P2MKPBanner />
      </div>

      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}

/* ============================ VIDEO ============================ */

function VideoCard({ video, featured, onPlay }: { video: VideoPelatihan; featured?: boolean; onPlay: () => void }) {
  const id = ytIdOf(video.linkPelatihan);
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Putar video ${video.namaPelatihan}`}
      className={`group relative block w-full overflow-hidden rounded-3xl bg-white/[0.05] ring-1 ring-white/10 text-left transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${featured ? "h-full min-h-[300px]" : "h-[170px]"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" aria-hidden />
      <span className="absolute inset-0 grid place-items-center" aria-hidden>
        <span className={`grid place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur transition-all group-hover:scale-110 group-hover:bg-white group-hover:text-[#0B1B3F] ${featured ? "h-16 w-16" : "h-11 w-11"}`}>
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 block p-4">
        {featured && <span className="mb-2 inline-block rounded-md bg-amber-400/20 ring-1 ring-amber-300/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-200">Video terbaru</span>}
        <span className={`line-clamp-2 block font-bold leading-snug ${featured ? "text-base md:text-lg" : "text-xs"}`}>{video.namaPelatihan}</span>
        {metaOf(video) && <span className="mt-1 line-clamp-1 block text-[10px] text-slate-300">{metaOf(video)}</span>}
      </span>
    </button>
  );
}

function VideoModal({ video, onClose }: { video: VideoPelatihan; onClose: () => void }) {
  const id = ytIdOf(video.linkPelatihan);
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
    <div role="dialog" aria-modal="true" aria-label={video.namaPelatihan} onClick={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-jakarta animate-in fade-in-0 duration-200">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
      <div onClick={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-4xl max-h-full overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/15 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="aspect-video w-full bg-black">
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`} allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" title={video.namaPelatihan} />
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold">{video.namaPelatihan}</h3>
            {metaOf(video) && <p className="mt-0.5 truncate text-xs text-blue-100/60">{metaOf(video)}</p>}
          </div>
          <a href={`https://youtu.be/${id}`} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-xs font-bold hover:bg-white/[0.16]">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden /> YouTube
          </a>
          <button type="button" onClick={onClose} aria-label="Tutup video" className="h-9 w-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/20 grid place-items-center hover:bg-white hover:text-[#0B1B3F]">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ UI BERSAMA ============================ */

/** Judul seksi seragam: ikon navy + eyebrow + H2 + deskripsi + aksi opsional */
function SectionHead({ icon: Icon, accent, eyebrow, title, desc, action, id = "video-title" }: { icon: React.ElementType; accent: string; eyebrow: string; title: string; desc: string; action?: { href: string; label: string }; id?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-4">
        <span className="relative isolate grid place-items-center w-12 h-12 shrink-0 overflow-hidden rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10">
          <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
          <Icon className="w-5 h-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/80">{eyebrow}</p>
          <h2 id={id} className="mt-0.5 font-calsans text-2xl md:text-3xl lg:text-4xl leading-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">{desc}</p>
        </div>
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex shrink-0 items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-sm font-bold hover:bg-white hover:text-[#0B1B3F] transition-colors">
          {action.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/* ============================ PROGRAM KHUSUS ============================ */

type ProgramKhususItem = { href: string; image: string; imageAlt: string; icon: string; tag: string; title: string; description: string; accent: string };

const PROGRAM_KHUSUS: ProgramKhususItem[] = [
  {
    href: "/waingapu",
    image: "/images/hero-img6.jpg",
    imageAlt: "Tambak udang terintegrasi lokasi diklat Waingapu",
    icon: "/icons/icperikanan.png",
    tag: "Budi daya udang",
    title: "Diklat Khusus Budi Daya Udang Terintegrasi Waingapu",
    description: "Pelatihan komprehensif untuk mendukung pengembangan tambak udang terintegrasi dan ekonomi biru.",
    accent: "#3B82F6",
  },
  {
    href: "/akp",
    image: "/images/hero-img2.jpg",
    imageAlt: "Awak kapal perikanan mengikuti diklat dan sertifikasi",
    icon: "/icons/icawak.png",
    tag: "Awak kapal perikanan",
    title: "Diklat & Sertifikasi Awak Kapal Perikanan untuk Modernisasi Kapal",
    description: "Diklat dan sertifikasi kompetensi AKP untuk mendukung modernisasi kapal perikanan nasional.",
    accent: "#06B6D4",
  },
];

function ProgramKhusus() {
  return (
    <section id="program-khusus" aria-labelledby="program-khusus-title" className="relative z-10 mt-16 w-full scroll-mt-24">
      <SectionHead
        icon={Sparkles}
        accent="#F59E0B"
        eyebrow="Program unggulan"
        title="Program khusus SDM kelautan dan perikanan"
        desc="Inisiatif strategis KKP untuk mencetak SDM unggul melalui pelatihan dan sertifikasi kompetensi khusus."
        id="program-khusus-title"
      />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROGRAM_KHUSUS.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group relative isolate flex min-h-[360px] md:min-h-[400px] flex-col overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-white/25 hover:shadow-[0_30px_70px_-30px_rgba(37,99,235,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="-z-20 object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80" />
              <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />
              <span aria-hidden className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(70% 60% at 0% 100%, ${p.accent}55 0%, transparent 70%)` }} />

              <div className="flex items-start justify-between p-6 md:p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <Image src={p.icon} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur transition-all group-hover:bg-white group-hover:text-[#0B1B3F]">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:-rotate-45" aria-hidden />
                </span>
              </div>

              <div className="mt-auto p-6 pt-0 md:p-8 md:pt-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur" style={{ background: `${p.accent}33`, color: "#E0F2FE" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} aria-hidden /> {p.tag}
                </span>
                <h3 className="mt-4 font-calsans text-xl md:text-2xl leading-snug group-hover:text-sky-100">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 group-hover:text-white">
                  Lihat program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ============================ P2MKP ============================ */

const P2MKP_IMAGES = [1, 2, 3, 4, 5, 6].map((n) => ({ src: `/images/p2mkp/p2mkp${n}.jpg`, alt: `Kegiatan pelatihan di lembaga P2MKP ${n}` }));
const P2MKP_SLIDE_MS = 5000;
const SWIPE_PX = 50;

const navBtn =
  "grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 text-white backdrop-blur transition-colors hover:bg-white hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

function P2MKPBanner() {
  const ref = React.useRef<HTMLDivElement>(null);
  const touchX = React.useRef<number | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [inView, setInView] = React.useState(false);
  const [seen, setSeen] = React.useState(false); // sudah pernah terlihat → muat gambar lain
  const [hovered, setHovered] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [reduce, setReduce] = React.useState(false);

  React.useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = inView && !hovered && !paused && !reduce;
  const go = React.useCallback((step: number) => setCurrent((c) => (c + step + P2MKP_IMAGES.length) % P2MKP_IMAGES.length), []);

  React.useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(1), P2MKP_SLIDE_MS);
    return () => clearTimeout(t);
  }, [current, playing, go]);

  return (
    <section aria-labelledby="p2mkp-title" className="relative z-10 mt-16 w-full">
      <style>{`@keyframes p2mkp-progress{from{width:0}to{width:100%}}`}</style>
      <div
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label="Galeri kegiatan P2MKP"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
        className="group relative isolate flex min-h-[460px] md:min-h-[520px] w-full items-center overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        {/* Slideshow latar */}
        <div className="absolute inset-0 -z-20" aria-hidden>
          {P2MKP_IMAGES.map((img, i) =>
            i === 0 || seen ? (
              <Image
                key={img.src}
                src={img.src}
                alt=""
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                loading={i === 0 ? undefined : "lazy"}
                className={`object-cover transition-opacity duration-1000 ${i === current ? "opacity-60" : "opacity-0"}`}
              />
            ) : null
          )}
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0B1B3F] via-[#0B1B3F]/85 to-[#0B1B3F]/10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B1B3F] via-transparent to-transparent" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_0%_100%,#10B98140_0%,transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_60%)]" />

        {/* Konten */}
        <div className="max-w-3xl space-y-5 p-8 pb-24 md:p-14 md:pb-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Pusat Pelatihan Mandiri
          </span>
          <h2 id="p2mkp-title" className="font-calsans leading-tight">
            <span className="block text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 bg-clip-text text-transparent">P2MKP</span>
            <span className="mt-1 block text-base md:text-lg font-normal text-blue-100/75">Pusat Pelatihan Mandiri Kelautan dan Perikanan</span>
          </h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-blue-100/80">
            Punya lembaga yang aktif dalam usaha dan peningkatan SDM kelautan dan perikanan? Daftarkan sebagai P2MKP binaan KKP dan jadilah penggerak ekosistem pelatihan yang berdaya saing.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Link href="/p2mkp" className="group/btn inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-400 transition-colors">
              Gabung P2MKP sekarang <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/p2mkp#sebaran" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-sm font-bold hover:bg-white/[0.14] transition-colors">
              Lihat sebaran lembaga P2MKP
            </Link>
          </div>
        </div>

        {/* Kontrol */}
        <div className="absolute inset-x-6 bottom-6 md:inset-x-8 md:bottom-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className={navBtn}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Putar slideshow" : "Jeda slideshow"} aria-pressed={paused} className={navBtn}>
              {paused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className={navBtn}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {P2MKP_IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => {
                  setSeen(true);
                  setCurrent(i);
                }}
                aria-label={`Tampilkan foto ${i + 1}`}
                aria-current={i === current}
                className={`relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-300 hover:bg-white/50 ${i === current ? "w-10" : "w-2"}`}
              >
                {i === current && (
                  <span
                    key={`${current}-${playing}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-300"
                    style={playing ? { animation: `p2mkp-progress ${P2MKP_SLIDE_MS}ms linear forwards` } : { width: "100%" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Foto {current + 1} dari {P2MKP_IMAGES.length}: {P2MKP_IMAGES[current].alt}
        </p>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Play, X, Youtube } from "lucide-react";

import { VIDEO_GALLERY_P2MKP } from "@/constants/p2mkp";
import { cn } from "@/lib/utils";
import { SectionTitle, useModalBehaviour } from "./shared";

type Video = (typeof VIDEO_GALLERY_P2MKP)[number];

function VideoCard({ video, featured = false, onPlay }: { video: Video; featured?: boolean; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Putar video ${video.title}`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        featured ? "h-full min-h-[300px]" : "h-[180px]"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
        alt=""
        loading="lazy"
        onError={(e) => {
          const fallback = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
          if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
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
          {video.title}
        </span>
        {featured && video.description && (
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-gray-300">{video.description}</span>
        )}
      </span>
    </button>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  useModalBehaviour(onClose);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={video.title}
          />
        </div>
        <div className="flex items-start gap-3 border-t border-white/5 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/20">
            <Youtube className="h-4 w-4 text-red-400" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white">{video.title}</h4>
            {video.description && <p className="mt-1 line-clamp-2 text-xs text-gray-400">{video.description}</p>}
          </div>
          <a
            href={`https://youtu.be/${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20 sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            YouTube
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup video"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition-all hover:bg-red-500/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideoGallerySection() {
  const [active, setActive] = React.useState<Video | null>(null);
  const close = React.useCallback(() => setActive(null), []);
  const [featured, ...others] = VIDEO_GALLERY_P2MKP;

  if (!featured) return null;

  return (
    <section id="video" className="relative scroll-mt-32 overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute left-[-5%] top-[10%] h-[40%] w-[40%] rounded-full bg-cyan-600/10 blur-[130px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Galeri Video"
          title="Galeri P2MKP"
          description="Tonton video panduan, informasi, dan cerita sukses seputar Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:row-span-2"
          >
            <VideoCard video={featured} featured onPlay={() => setActive(featured)} />
          </motion.div>
          {others.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {others.map((video, i) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <VideoCard video={video} onPlay={() => setActive(video)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>{active && <VideoModal video={active} onClose={close} />}</AnimatePresence>
    </section>
  );
}

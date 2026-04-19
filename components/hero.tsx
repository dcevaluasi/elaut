"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/logo";
import { FiPlay, FiYoutube, FiX } from "react-icons/fi";
import { getAllVideoPelatihans, incrementVideoClick } from "@/utils/videoPelatihan";

const extractYoutubeId = (url: string) => {
    if (!url) return "";
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    } catch (e) {
        return url;
    }
}

export default function Hero() {
  const [videoPelatihan, setVideoPelatihan] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getAllVideoPelatihans();
        // Take latest 5 videos for Hero section
        setVideoPelatihan(data.slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };
    fetchVideos();
  }, []);

  const handleVideoClick = async (video: any) => {
    const ytId = extractYoutubeId(video.linkPelatihan);
    setActiveVideo(ytId);
    try {
      await incrementVideoClick(video.id);
    } catch (e) {}
  };

  const programPelatihan = [
    {
      id: "001",
      name: "Perikanan",
      icon: "/icons/icperikanan.png",
      slug: "perikanan",
      description:
        "Pelatihan perikanan meliputi penangkapan ikan, budidaya, serta inovasi sumber daya laut berkelanjutan.",
    },
    {
      id: "002",
      name: "Awak Kapal Perikanan",
      icon: "/icons/icawak.png",
      slug: "akp",
      description:
        "Membekali keterampilan penangkapan ikan, navigasi, dan keselamatan di laut.",
    },
    {
      id: "003",
      name: "Kelautan",
      icon: "/icons/ickelautan.png",
      slug: "kelautan",
      description:
        "Eksplorasi tak terbatas: pengelolaan sumber daya, konservasi, riset, dan teknologi kelautan.",
    },
  ];

  const [selectedProgram, setSelectedProgram] = React.useState<number | null>(null);
  const [imageIndex, setImageIndex] = React.useState(0);
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const images = [
    "/images/hero-img4-preview.jpg",
    "/images/hero-img.jpg",
    "/images/hero-img3.jpg",
    "/images/hero-img7.jpg",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative pt-20 min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={imageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[imageIndex]}
              alt="Hero background"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]" />
      </div>

      {/* Modern Animated Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full bg-blue-600/20 blur-[120px] z-1"
      />
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[45rem] w-[45rem] rounded-full bg-cyan-500/15 blur-[150px] z-1"
      />

      {/* Hero Content Area */}
      <section className="relative md:scale-[0.8] z-10 flex min-h-screen items-center justify-center px-6 md:px-12 py-20 md:py-0">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center md:items-start space-y-12">

          {/* Header Animation Stack */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold tracking-widest uppercase mb-6 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Next Generation Marine Training
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold font-calsans text-white tracking-tight leading-none drop-shadow-2xl">
                Elektronik Layanan Pelatihan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                  Utama Terpadu
                </span>
              </h1>
              <div className="flex flex-col md:flex-row items-center md:items-end gap-2 md:gap-4">
                <h2 className="text-5xl md:text-8xl lg:text-9xl font-calsans bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-indigo-600 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] leading-none">
                  E-LAUT
                </h2>
                <div className="hero-logo md:mb-4 scale-75 md:scale-100">
                  <Logo />
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-6 text-gray-400 text-sm md:text-lg max-w-2xl leading-relaxed font-light"
            >
              Wujudkan kemandirian sumber daya manusia kelautan dan perikanan yang unggul dan inovatif melalui platform pelatihan digital terstandarisasi.
            </motion.p>
          </div>

          {/* Card Showcase Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
            {programPelatihan.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                {/* Glow Effect Backdrop */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />

                <div
                  onClick={() => setSelectedProgram(selectedProgram === index ? null : index)}
                  className={`relative flex flex-col h-full items-center p-8 cursor-pointer rounded-3xl border border-white/10 bg-[#1e293b]/20 backdrop-blur-2xl transition-all duration-500 ${selectedProgram === index ? "ring-2 ring-blue-500/50 bg-[#1e293b]/40" : "hover:bg-[#1e293b]/30"
                    }`}
                >
                  <div className="relative w-24 h-24 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full" />
                    <Image
                      src={item.icon}
                      alt={item.name}
                      fill
                      className="object-contain relative z-10"
                    />
                  </div>

                  <h3 className="text-white font-calsans text-xl text-center group-hover:text-blue-300 transition-colors">
                    {item.name}
                  </h3>

                  <AnimatePresence>
                    {selectedProgram === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden w-full"
                      >
                        <div className="pt-6 flex flex-col items-center">
                          <p className="text-gray-400 text-sm text-center leading-relaxed mb-6 font-light">
                            {item.description}
                          </p>
                          <Link
                            href={`/layanan/pelatihan/program/${item.slug}`}
                            className="group/btn relative px-6 py-2.5 rounded-xl bg-blue-600 overflow-hidden transition-all duration-300"
                          >
                            <div className="absolute inset-0 w-3 bg-white/20 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[400%] transition-transform duration-700" />
                            <span className="relative text-white font-semibold text-sm">Lihat Selengkapnya</span>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Video Pelatihan Gratis Section */}
          <div className="w-full pt-12 border-t border-white/10 mt-12 relative z-10">
            <div className="text-center md:text-left space-y-2 mb-8">
              <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest"
              >
                  Galeri Video
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl lg:text-4xl font-calsans leading-tight text-white mb-2"
              >
                Video Pelatihan Gratis
              </motion.h2>
              <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-gray-400 text-xs md:text-sm max-w-xl md:mx-0 mx-auto leading-relaxed"
              >
                  Tonton panduan, informasi, dan teknik mutakhir dari program pelatihan unggulan kami.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 relative">
              {videoPelatihan.length > 0 && (
                <>
                  <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="lg:row-span-2"
                  >
                      <VideoCard
                          video={videoPelatihan[0]}
                          featured
                          onClick={() => handleVideoClick(videoPelatihan[0])}
                      />
                  </motion.div>

                  <div className="grid grid-cols-2 gap-5">
                      {videoPelatihan.slice(1).map((video, i) => (
                          <motion.div
                              key={video.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: i * 0.1 }}
                          >
                              <VideoCard
                                  video={video}
                                  onClick={() => handleVideoClick(video)}
                              />
                          </motion.div>
                      ))}
                  </div>
                </>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex justify-center w-full relative z-10"
            >
              <Link 
                href="/layanan/pelatihan/video/gratis"
                className="group/btn relative px-8 py-3.5 rounded-2xl bg-[#1e293b]/40 text-blue-400 border border-blue-500/30 overflow-hidden transition-all duration-300 flex justify-center hover:border-transparent hover:bg-blue-600 shadow-xl shadow-transparent hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 w-3 bg-white/20 -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[600%] transition-transform duration-1000" />
                <span className="relative font-bold tracking-wider text-sm group-hover/btn:text-white transition-colors">LIHAT SEMUA VIDEO E-LAUT</span>
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Popup Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-jakarta"
            onClick={() => setActiveVideo(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="relative w-full max-w-4xl z-10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10 bg-[#050d1a]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/80 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              >
                <FiX size={16} />
              </button>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                  title="Video Pelatihan"
                />
              </div>
              {(() => {
                const vid = videoPelatihan.find((v) => extractYoutubeId(v.linkPelatihan) === activeVideo);
                return vid ? (
                  <div className="px-6 py-4 flex items-center gap-3 border-t border-white/5">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                      <FiYoutube size={14} className="text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{vid.namaPelatihan}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{vid.penyelenggara} • {vid.programPelatihan || vid.jenisProgramPelatihan}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoCard({ video, featured = false, onClick }: {
  video: any;
  featured?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const ytId = extractYoutubeId(video.linkPelatihan);
  const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  const fallbackUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group cursor-pointer rounded-3xl overflow-hidden border border-white/10 hover:border-blue-500/40 transition-colors duration-300 bg-white/5 ${featured ? "h-full min-h-[300px]" : "h-[170px]"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <img
        src={thumbnailUrl}
        alt={video.namaPelatihan}
        onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: hovered ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-14 h-14 rounded-full bg-blue-600/90 backdrop-blur-sm border border-blue-400/40 flex items-center justify-center shadow-2xl shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-shadow duration-300"
        >
          <FiPlay size={20} className="text-white translate-x-0.5" fill="white" />
        </motion.div>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
        <FiYoutube size={11} className="text-red-400" />
        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">YouTube</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {featured && (
          <span className="inline-block mb-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-600/80 text-white border border-blue-400/30">
            Video Utama
          </span>
        )}
        <h4 className={`font-bold text-white leading-snug ${featured ? "text-base md:text-lg" : "text-xs"}`}>
          {video.namaPelatihan}
        </h4>
        <p className="text-gray-300 text-[10px] mt-1 line-clamp-1">
          {video.penyelenggara} • {video.programPelatihan || video.jenisProgramPelatihan}
        </p>
      </div>
    </motion.div>
  );
}

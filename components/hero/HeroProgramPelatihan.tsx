"use client";

import React from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";
import {
  AKP_CERTIFICATIONS,
  AQUACULTURE_CERTIFICATIONS,
  OCEAN_CERTIFICATIONS,
} from "@/constants/serkom";

export default function HeroProgramPelatihan({ program }: { program: string }) {
  const programPelatihan =
    program == "akp"
      ? "Awak Kapal Perikanan"
      : program == "perikanan"
        ? "Perikanan"
        : "Kelautan";

  const certifications =
    program == "akp"
      ? AKP_CERTIFICATIONS
      : program == "perikanan"
        ? AQUACULTURE_CERTIFICATIONS
        : OCEAN_CERTIFICATIONS;

  const detailProgramPelatihan: DetailProgramPelatihan = {
    akp: {
      icon: "/icons/icawak.png",
      description:
        "Program Pelatihan Awak Kapal Perikanan membekali peserta dengan keterampilan penangkapan ikan, navigasi, dan keselamatan di laut. Dapatkan sertifikasi resmi untuk meningkatkan karier di sektor perikanan dengan fokus pada praktik berkelanjutan dan keselamatan kerja.",
      images: [
        "/images/program-pelatihan/dummies/akp/akp-1.jpg",
        "/images/program-pelatihan/dummies/akp/akp-2.jpg",
        "/images/program-pelatihan/dummies/akp/akp-3.JPG",
        "/images/program-pelatihan/dummies/akp/akp-4.jpg",
        "/images/program-pelatihan/dummies/akp/akp-5.jpg",
        "/images/program-pelatihan/dummies/akp/akp-6.jpg",
      ],
    },
    perikanan: {
      icon: "/icons/icperikanan.png",
      description:
        "Program Pelatihan Perikanan mengajarkan keterampilan dan pengetahuan di bidang perikanan, termasuk teknik penangkapan, budidaya, dan pengelolaan sumber daya laut. Dengan pelatihan praktis dan teori, peserta mendapatkan sertifikasi yang mendukung pengembangan karier di industri ini.",
      images: [
        "/images/program-pelatihan/dummies/perikanan/perikanan.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-2.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-3.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-5.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-7.jpg",
        "/images/program-pelatihan/dummies/perikanan/perikanan-6.jpg",
      ],
    },
    kelautan: {
      icon: "/icons/ickelautan.png",
      description:
        "Program Pelatihan Kelautan dirancang untuk meningkatkan kompetensi dan keterampilan dalam bidang kelautan, meliputi pengelolaan sumber daya laut, teknologi kelautan, serta keamanan dan keselamatan di laut.",
      images: [
        "/images/program-pelatihan/dummies/kelautan/kelautan.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-2.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-3.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-4.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-5.jpg",
        "/images/program-pelatihan/dummies/kelautan/kelautan-6.jpg",
      ],
    },
  };

  const description =
    detailProgramPelatihan[program as keyof DetailProgramPelatihan]
      ?.description || "Program tidak tersedia saat ini.";

  const icon =
    detailProgramPelatihan[program as keyof DetailProgramPelatihan]
      ?.icon || "";

  const images =
    detailProgramPelatihan[program as keyof DetailProgramPelatihan]?.images ||
    [];

  const [imageIndex, setImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-[75vh] md:min-h-[85vh] w-full overflow-hidden bg-[#020617] font-jakarta">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.2, scale: 1 }}
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
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617] scale-105" />
      </div>

      {/* Modern Animated Gradient Blobs */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/20 blur-[100px] z-1"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/15 blur-[120px] z-1"
      />

      {/* Content Area */}
      <section className="relative z-10 flex min-h-[75vh] md:min-h-[85vh] items-center px-6 md:px-12 py-20 md:py-0">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-4 mt-10"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <Image
                src={icon}
                alt={programPelatihan}
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-calsans text-white tracking-tight leading-none drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                {programPelatihan}
              </span>
            </h1>

            <p className="mt-6 text-gray-400 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed font-light">
              {description}
            </p>
          </motion.div>

          {/* Premium Marquee Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 w-full max-w-4xl"
          >
            <div className="relative group p-[1px] rounded-3xl overflow-hidden bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
              <Marquee gradient={false} speed={50} className="py-6">
                {certifications.map((text: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 mx-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-sm md:text-base whitespace-nowrap hover:bg-white/10 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {text}
                  </div>
                ))}
              </Marquee>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Scroll Down</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-transparent"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

type ProgramDetails = {
  description: string;
  images: string[];
  icon: string
};

type DetailProgramPelatihan = {
  akp: ProgramDetails;
  perikanan: ProgramDetails;
  kelautan: ProgramDetails;
};

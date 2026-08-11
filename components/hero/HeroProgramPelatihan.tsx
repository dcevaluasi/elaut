"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { motion, AnimatePresence } from "framer-motion";
import {
  AKP_CERTIFICATIONS,
  AQUACULTURE_CERTIFICATIONS,
  OCEAN_CERTIFICATIONS,
} from "@/constants/serkom";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";

export default function HeroProgramPelatihan({ program }: { program: string }) {
  const programKey = (program || "akp").toLowerCase();

  const programPelatihan =
    programKey === "akp"
      ? "Awak Kapal Perikanan"
      : programKey === "perikanan"
        ? "Perikanan"
        : "Kelautan";

  const certifications =
    programKey === "akp"
      ? AKP_CERTIFICATIONS
      : programKey === "perikanan"
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

  const currentDetail = detailProgramPelatihan[programKey as keyof DetailProgramPelatihan] || detailProgramPelatihan.akp;
  const description = currentDetail.description;
  const icon = currentDetail.icon;
  const images = currentDetail.images;

  const [imageIndex, setImageIndex] = React.useState(0);

  React.useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length]);

  const programOptions = [
    { key: "akp", label: "Awak Kapal Perikanan", icon: "⚓" },
    { key: "perikanan", label: "Perikanan", icon: "🐟" },
    { key: "kelautan", label: "Kelautan", icon: "🌊" },
  ];

  return (
    <div className="relative pt-24 min-h-[75vh] md:min-h-[85vh] w-full overflow-hidden bg-[#020617] font-jakarta flex flex-col justify-center">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/70 to-[#020617]" />
      </div>

      {/* Modern Animated Gradient Blobs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[35rem] w-[35rem] rounded-full bg-blue-600/15 blur-[110px] z-1"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-cyan-500/15 blur-[130px] z-1"
      />

      {/* Content Area */}
      <section className="relative z-10 flex min-h-[70vh] md:min-h-[80vh] items-center px-4 sm:px-6 md:px-12 py-12 md:py-0">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">

          {/* Program Category Switcher Pills */}


          {/* Program Icon & Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col items-center gap-3 pt-2"
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <Image
                src={icon}
                alt={programPelatihan}
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
              />
            </div>


          </motion.div>

          {/* Main Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 max-w-4xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-calsans text-white leading-none drop-shadow-2xl">
              Program Pelatihan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                {programPelatihan}
              </span>
            </h1>

            <p className="text-gray-300 text-sm md:text-base max-w-3xl mx-auto leading-relaxed font-light">
              {description}
            </p>
          </motion.div>

          {/* Premium Marquee Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 w-full max-w-4xl"
          >
            <div className="relative group p-[1px] rounded-3xl overflow-hidden bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
              <Marquee gradient={false} speed={45} className="py-4">
                {certifications.map((text: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 mx-3 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-semibold text-xs md:text-sm whitespace-nowrap hover:bg-white/10 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {text}
                  </div>
                ))}
              </Marquee>
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-6"
          >
            <a
              href="#cari-pelatihan"
              className="inline-flex flex-col items-center gap-2 text-gray-500 hover:text-blue-400 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors"
            >
              <span>Telusuri Pelatihan</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FiChevronDown className="w-4 h-4 text-blue-400" />
              </motion.div>
            </a>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

type ProgramDetails = {
  description: string;
  images: string[];
  icon: string;
};

type DetailProgramPelatihan = {
  akp: ProgramDetails;
  perikanan: ProgramDetails;
  kelautan: ProgramDetails;
};


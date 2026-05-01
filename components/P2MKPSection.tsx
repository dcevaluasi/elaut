"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const images = [
  "/images/p2mkp/p2mkp1.jpg",
  "/images/p2mkp/p2mkp2.jpg",
  "/images/p2mkp/p2mkp3.jpg",
  "/images/p2mkp/p2mkp4.jpg",
  "/images/p2mkp/p2mkp5.jpg",
  "/images/p2mkp/p2mkp6.jpg",
];

export default function P2MKPSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full pt-12 border-t border-white/10 mt-12 relative z-10 mb-12">
      <div className="relative w-full rounded-3xl overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center shadow-2xl border border-white/10 group">

        {/* Background Images Crossfade & Zoom */}
        <div className="absolute inset-0 z-0 bg-[#020617] overflow-hidden">
          <AnimatePresence>
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 6, ease: "linear" }
              }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentImage]}
                alt="P2MKP Background"
                fill
                className="object-cover opacity-70 mix-blend-luminosity brightness-110 contrast-125"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {/* Overlays for readability and texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-[#020617]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-teal-900/10 mix-blend-color" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.2)]">
              Pusat Pelatihan Mandiri
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-calsans leading-tight drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-cyan-300">
                P2MKP
              </span>
            </h2>

            <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl font-light">
              Punya lembaga yang aktif dalam usaha dan bisnis serta peningkatan SDM di bidang kelautan dan perikanan? Ingin berkontribusi sebagai penggerak dalam meningkatkan sektor usaha serta SDM KP?
              <br className="hidden md:block" />
              <strong className="text-white font-medium mt-2 inline-block">Ayo bergabung dan ciptakan ekosistem pelatihan yang berdaya saing tinggi.</strong>
            </p>

            <div className="pt-6">
              <Link
                href="https://elaut-bppsdm.kkp.go.id/p2mkp"
                target="_blank"
                className="group/btn inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:-translate-y-1 overflow-hidden relative"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-out" />
                <span className="relative uppercase tracking-wider text-sm">Gabung P2MKP Sekarang</span>
                <span className="relative group-hover/btn:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-2.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentImage
                ? "bg-teal-400 w-8 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                : "bg-white/30 w-2 hover:bg-white/60 hover:w-4"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

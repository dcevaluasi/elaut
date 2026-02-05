"use client";

import Image from "next/image";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroPelatihan() {
  const [imageIndex, setImageIndex] = React.useState(0);
  const images = [
    "/images/hero-img4.jpg",
    "/images/hero-img3.jpg",
    "/images/hero-img.jpg",
  ];
  const imagesMob = ["/diklat/bstf-1.jpg"];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative min-h-[60vh] md:min-h-[70vh] w-full overflow-hidden bg-[#020617] font-jakarta m-0 md:m-4 md:rounded-[2.5rem] shadow-2xl border border-white/5">
      {/* Background Section */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={imageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[imageIndex]}
              alt="Hero background"
              fill
              priority
              className="object-cover hidden md:block opacity-[0.25]"
            />
            <Image
              src={imagesMob[0]}
              alt="Hero background mobile"
              fill
              priority
              className="object-cover block md:hidden opacity-[0.25]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/60 to-[#020617]" />
      </div>

      {/* Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-[100px] z-1"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-24 -right-24 h-[35rem] w-[35rem] rounded-full bg-cyan-500/10 blur-[120px] z-1"
      />

      {/* Content Area */}
      <section className="relative z-10 flex h-full min-h-[60vh] md:min-h-[70vh] items-center px-6 md:px-20 py-16 md:py-0">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center md:items-start space-y-8">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-semibold tracking-wider uppercase backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Program Pelatihan Unggulan
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-calsans text-white tracking-tight leading-tight md:leading-[1.1] drop-shadow-2xl">
              Ikuti Pelatihan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                Tingkatkan Kemampuanmu
              </span>
            </h1>
            <p className="mt-6 text-gray-300/80 text-sm md:text-lg max-w-2xl leading-relaxed font-light">
              Temukan beragam pelatihan kelautan dan perikanan bersertifikat untuk meningkatkan kompetensi dan menjadi SDM unggul di sektor kemaritiman.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <div className="p-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
              <button className="px-8 py-3.5 rounded-[0.9rem] bg-[#020617] text-white font-bold text-sm hover:bg-transparent transition-all duration-300">
                Jelajahi Program
              </button>
            </div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 overflow-hidden relative">
                  <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" fill />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#020617] bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                +2k
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium ml-2">Telah bergabung <br />dalam pelatihan</p>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
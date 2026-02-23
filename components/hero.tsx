"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/logo";

export default function Hero() {
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

        </div>
      </section>
    </div>
  );
}

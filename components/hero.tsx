"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "../app/css/navigation.css";

import Link from "next/link";
import { Slide } from "react-awesome-reveal";
import Logo from "@/components/ui/logo";

export default function Hero() {
  const programPelatihan = [
    {
      id: "001",
      name: "Perikanan",
      icon: "/icons/icperikanan.png",
      slug: "perikanan",
      description:
        "Pelatihan perikanan adalah pelatihan yang meliputi kegiata penangkapan ikan, budidaya perikanan, serta inovasi sumber daya laut berkelanjutan.",
    },
    {
      id: "002",
      name: "Kelautan",
      icon: "/icons/ickelautan.png",
      slug: "kelautan",
      description:
        "Pelatihan kelautan adalah pelatihan yang meliputi eksplorasi tak terbatas yang mencakup pengelolaan sumber daya, konservasi, riset, dan inovasi teknologi di laut.",
    },
  ];

  const [selectedProgram, setSelectedProgram] = React.useState<number | null>(null);
  const [imageIndex, setImageIndex] = React.useState(0);

  const images = [
    "/images/hero-img4-preview.jpg",
    "/images/hero-img.jpg",
    "/images/hero-img3.jpg",
    "/images/hero-img7.jpg",
    "/images/hero-img4-preview.jpg",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative h-full md:h-screen flex items-center justify-center px-6">
        <Image
          src={images[imageIndex]}
          alt="Hero background"
          fill
          priority
          className="absolute w-full h-full object-cover opacity-15"
        />

        <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col items-center md:items-start text-left">
          {/* Title + Logo */}
          <div className="text-left gap-6 flex flex-col items-center md:items-start">
            <Logo />
            <h1 className="text-[2.5rem] md:text-[3rem] leading-none font-calsans text-white drop-shadow-lg">
              Elektronik Layanan Pelatihan <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                Kelautan dan Perikanan
              </span>
              <br /> Utama Terpadu
            </h1>
            <h1 className="text-[3.6rem] font-calsans bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 -mt-5">
              E-LAUT
            </h1>
          </div>

          {/* Program Cards (Glassmorphism style) */}
          <div
            className={`w-full flex flex-col md:flex-row gap-5 md:gap-14 items-center justify-center z-[10000]`}
          >
            {programPelatihan.map((item, index) => (
              <Slide direction="up" duration={index * 1200} key={item.id}>
                <div
                  onClick={() => setSelectedProgram(index)}
                  className={`flex w-full md:w-72 flex-col gap-3 items-center justify-center cursor-pointer 
                    rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl 
                    shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-all duration-500 
                    hover:scale-105 hover:border-blue-400/40 p-6 text-center ${selectedProgram === index ? "opacity-100" : "opacity-60"
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 md:w-28 md:h-28 object-contain"
                  />
                  <h3 className="text-white font-calsans text-lg md:text-xl">{item.name}</h3>
                  {selectedProgram === index && (
                    <div className="text-sm text-blue-100/90">
                      <p>{item.description}</p>
                      <Link
                        href={`/layanan/pelatihan/program/${item.slug}`}
                        className="mt-4 inline-block rounded-lg border border-blue-500 bg-blue-500/20 px-4 py-2 text-blue-100 hover:bg-blue-500 hover:text-white transition"
                      >
                        Lihat Selengkapnya
                      </Link>
                    </div>
                  )}
                </div>
              </Slide>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

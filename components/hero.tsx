"use client";

import Image from "next/image";
import React from "react";
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
        "Pelatihan perikanan meliputi penangkapan ikan, budidaya, serta inovasi sumber daya laut berkelanjutan.",
    },
    // {
    //   id: "002",
    //   name: "Awak Kapal Perikanan",
    //   icon: "/icons/icawak.png",
    //   slug: "akp",
    //   description:
    //     "Membekali keterampilan penangkapan ikan, navigasi, dan keselamatan di laut.",
    // },
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
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-4 md:px-6 py-16 md:py-0 md:h-screen">
        {/* Background image */}
        <Image
          src={images[imageIndex]}
          alt="Hero background"
          fill
          priority
          className="absolute w-full h-full object-cover opacity-15"
        />

        <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col items-center md:items-start text-center md:text-left">
          {/* Title + Logo */}
          <div className="gap-4 flex flex-col items-center md:items-start">
            <Logo />
            <h1 className="text-[2rem] md:text-[3rem] leading-tight font-calsans text-white drop-shadow-lg">
              Elektronik Layanan Pelatihan Utama Terpadu<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                Kelautan & Perikanan
              </span>
            </h1>
            <h1 className="text-[2.5rem] md:text-[3.6rem] font-calsans bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 -mt-4">
              E-LAUT
            </h1>
          </div>

          {/* Program Cards */}
          <div
            className="w-full flex md:flex-row flex-col md:gap-10 gap-5 mt-10 
              overflow-x-auto md:overflow-visible pb-4 md:pb-0 justify-center items-center"
          >
            {programPelatihan.map((item, index) => (
              <Slide direction="up" duration={index * 1000} key={item.id}>
                <div
                  onClick={() =>
                    setSelectedProgram(selectedProgram === index ? null : index)
                  }
                  className={`flex flex-col flex-shrink-0 w-64 md:w-72 
                    items-center justify-center cursor-pointer 
                    rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl 
                    shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-500 
                    hover:scale-105 hover:border-blue-400/40 p-6 text-center ${selectedProgram === index ? "opacity-100" : "opacity-70"
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
                  />
                  <h3 className="text-white font-calsans text-lg md:text-xl mt-2">
                    {item.name}
                  </h3>

                  {/* Expand description on click */}
                  {selectedProgram === index && (
                    <div className="text-sm text-blue-100/90 mt-3 animate-fadeIn">
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

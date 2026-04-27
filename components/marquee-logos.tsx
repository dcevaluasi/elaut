"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import Link from "next/link";

const logos = [
  {
    name: "WBS KKP",
    image: "/layanan/logo_wbs.png",
    link: "https://wbs.kkp.go.id/register",
  },
  {
    name: "SPAN Lapor",
    image: "/layanan/logo_lapor.png",
    link: "https://span.lapor.go.id/",
  },
  {
    name: "GOL KPK",
    image: "/layanan/logo_gol_kpk.png",
    link: "https://gol.kpk.go.id/login",
  },
];

const MarqueeLogos = () => {
  return (
    <div className="w-full pt-10 pb-20 bg-transparent relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Layanan Pengaduan & Transparansi
        </div>
        <h2 className="text-white font-calsans text-2xl md:text-3xl tracking-tight">
          Komitmen Integritas & Pelayanan
        </h2>
      </div>

      <Marquee
        gradient={true}
        gradientColor="#020617"
        speed={40}
        pauseOnHover={true}
        autoFill={true}
        className="py-10"
      >
        <div className="flex items-center gap-12 px-6">
          {logos.map((logo, index) => (
            <Link
              key={index}
              href={logo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative w-64 h-32 flex items-center justify-center p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:bg-white/[0.08] group-hover:border-white/20 group-hover:-translate-y-2 group-hover:shadow-blue-500/10 overflow-hidden">
                {/* Subtle internal glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">
                  <Image
                    src={logo.image}
                    alt={logo.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Marquee>
    </div>
  );
};

export default MarqueeLogos;

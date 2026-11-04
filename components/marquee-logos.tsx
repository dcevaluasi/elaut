"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { ExternalLink, ShieldCheck } from "lucide-react";

const LOGOS = [
  { name: "WBS KKP", desc: "Whistleblowing System Kementerian Kelautan dan Perikanan", image: "/layanan/logo_wbs.png", link: "https://wbs.kkp.go.id/register" },
  { name: "SP4N-LAPOR!", desc: "Layanan aspirasi dan pengaduan online rakyat", image: "/layanan/logo_lapor.png", link: "https://span.lapor.go.id/" },
  { name: "GOL KPK", desc: "Gratifikasi Online Komisi Pemberantasan Korupsi", image: "/layanan/logo_gol_kpk.png", link: "https://gol.kpk.go.id/login" },
  {
    name: "SIPPN",
    desc: "Standar pelayanan penetapan P2MKP di Sistem Informasi Pelayanan Publik Nasional",
    image: "/layanan/logo_sippn.svg",
    link: "https://sippn.menpan.go.id/pelayanan-publik/penetapan-dan-klasifikasi-pusat-pelatihan-mandiri-kelautan-dan-perikanan-p2mkp-8346341",
  },
];

const MarqueeLogos = () => {
  return (
    <section aria-labelledby="integritas-title" className="relative z-10 w-full overflow-hidden bg-[#020617] font-jakarta text-white pt-12 pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,#2563EB1f_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Pengaduan & transparansi
            </span>
            <h2 id="integritas-title" className="font-calsans text-2xl md:text-3xl tracking-tight">
              Komitmen integritas pelayanan publik KKP
            </h2>
            <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">
              Laporkan pengaduan, gratifikasi, atau dugaan pelanggaran layanan pelatihan E-LAUT melalui kanal resmi pemerintah berikut.
            </p>
          </div>
        </div>
      </div>

      {/* Marquee (dekoratif, gerak) */}
      <Marquee gradient gradientColor="#020617" gradientWidth={80} speed={40} pauseOnHover autoFill className="py-4">
        <div className="flex items-center gap-5 px-2.5">
          {LOGOS.map((logo) => (
            <a
              key={logo.name}
              href={logo.link}
              target="_blank"
              rel="noopener noreferrer external"
              aria-label={`${logo.name} — ${logo.desc} (tab baru)`}
              className="group relative isolate flex w-56 h-28 items-center justify-center overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 transition-all duration-500 hover:bg-white/[0.08] hover:ring-white/20 hover:-translate-y-1"
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(70%_70%_at_50%_100%,#38BDF833_0%,transparent_70%)]" />
              <span className="relative block w-full h-full grayscale opacity-80 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
                <Image src={logo.image} alt={`Logo ${logo.name}`} fill sizes="224px" className="object-contain" />
              </span>
            </a>
          ))}
        </div>
      </Marquee>


    </section>
  );
};

export default MarqueeLogos;

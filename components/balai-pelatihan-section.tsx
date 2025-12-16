"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fade, Slide } from "react-awesome-reveal";
import {
  HiMapPin,
  HiAcademicCap,
  HiUserGroup,
  HiArrowRight,
  HiSparkles,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";

interface BalaiPelatihan {
  id: string;
  name: string;
  location: string;
  image: string;
  slug: string;
  description: string;
  programs: string[];
  capacity: string;
}

export default function BalaiPelatihanSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const carouselImages = [
    "/images/hero-img4-preview.jpg",
    "/images/hero-img.jpg",
    "/images/hero-img3.jpg",
    "/images/hero-img7.jpg",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setImageIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToImage = (index: number) => {
    setImageIndex(index);
  };

  const balaiList: BalaiPelatihan[] = [
    {
      id: "001",
      name: "BPPP Tegal",
      location: "Tegal, Jawa Tengah",
      image: "/images/balai/tegal.jpg",
      slug: "tegal",
      description:
        "Pusat pelatihan kelautan dan perikanan terdepan di Jawa Tengah dengan fasilitas modern dan instruktur berpengalaman.",
      programs: ["Budidaya Perikanan", "Pengolahan Hasil Laut", "Teknologi Penangkapan"],
      capacity: "200+ peserta/batch",
    },
    {
      id: "002",
      name: "BPPP Bitung",
      location: "Bitung, Sulawesi Utara",
      image: "/images/balai/bitung.jpg",
      slug: "bitung",
      description:
        "Spesialisasi pelatihan awak kapal perikanan dan teknologi kelautan dengan akses langsung ke pelabuhan internasional.",
      programs: ["Awak Kapal Perikanan", "Navigasi Pelayaran", "Keselamatan Maritim"],
      capacity: "150+ peserta/batch",
    },
    {
      id: "003",
      name: "BPPP Banyuwangi",
      location: "Banyuwangi, Jawa Timur",
      image: "/images/balai/banyuwangi.jpg",
      slug: "banyuwangi",
      description:
        "Fokus pada pengembangan sumber daya manusia perikanan tangkap dan konservasi laut dengan pendekatan praktis.",
      programs: ["Perikanan Tangkap", "Konservasi Laut", "Manajemen Pesisir"],
      capacity: "180+ peserta/batch",
    },
    {
      id: "004",
      name: "BPPP Ambon",
      location: "Ambon, Maluku",
      image: "/images/balai/ambon.jpg",
      slug: "ambon",
      description:
        "Pusat unggulan pelatihan budidaya laut dan pengelolaan sumber daya kelautan di kawasan Indonesia Timur.",
      programs: ["Budidaya Laut", "Marikultur", "Bioteknologi Laut"],
      capacity: "120+ peserta/batch",
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-20 md:py-32 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-300/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <Fade triggerOnce>
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <HiSparkles className="text-blue-600 text-xl" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Jaringan Pelatihan Kami
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Balai Pelatihan Kelautan & Perikanan
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Tersebar di seluruh Indonesia dengan fasilitas modern dan instruktur
              bersertifikasi untuk menghasilkan SDM perikanan dan kelautan berkualitas
            </p>
          </div>
        </Fade>

        {/* Carousel and Sebaran Grid */}
        <Fade triggerOnce>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
            {/* Carousel Container */}
            <div className="carousel-section relative rounded-3xl border border-slate-200 bg-white backdrop-blur-xl shadow-lg overflow-hidden">
              {/* Carousel Images */}
              <div className="relative h-64 md:h-80 lg:h-96">
                {carouselImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Slide ${index + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-700 ${
                      index === imageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center hover:bg-white transition-all duration-300 group shadow-lg"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="text-slate-700 text-xl group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center hover:bg-white transition-all duration-300 group shadow-lg"
                  aria-label="Next image"
                >
                  <HiChevronRight className="text-slate-700 text-xl group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === imageIndex
                        ? "bg-blue-600 w-8"
                        : "bg-slate-300 w-2 hover:bg-slate-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Sebaran Map Container */}
            <div className="sebaran-section relative rounded-3xl border border-slate-200 bg-white backdrop-blur-xl shadow-lg overflow-hidden p-6 md:p-8">
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  Sebaran Balai Pelatihan
                </h3>
                <p className="text-sm md:text-base text-slate-600">
                  Jaringan pelatihan kelautan & perikanan di seluruh Indonesia
                </p>
              </div>
              <div className="relative w-full h-48 md:h-64 lg:h-72">
                <Image
                  src="/sebaran.png"
                  alt="Sebaran Balai Pelatihan"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </Fade>

        {/* Balai Cards Grid */}
        <div className="balai-cards grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {balaiList.map((balai, index) => (
            <Slide
              key={balai.id}
              direction={index % 2 === 0 ? "left" : "right"}
              triggerOnce
              delay={index * 100}
            >
              <Link href={`/lembaga/bppp/${balai.slug}`}>
                <div
                  onMouseEnter={() => setHoveredCard(balai.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative rounded-3xl overflow-hidden bg-white border border-slate-200
                    shadow-lg hover:shadow-2xl transition-all duration-500
                    ${hoveredCard === balai.id ? "scale-[1.02] -translate-y-2" : ""}`}
                >
                  {/* Image Container */}
                  <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-blue-900 to-cyan-900">
                    {/* Placeholder gradient if image doesn't exist */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 opacity-80" />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

                    {/* Animated overlay on hover */}
                    <div
                      className={`absolute inset-0 bg-blue-500/20 backdrop-blur-sm z-20 transition-opacity duration-500 ${
                        hoveredCard === balai.id ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Location Badge */}
                    <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                      <HiMapPin className="text-blue-600 text-sm" />
                      <span className="text-xs font-semibold text-slate-700">
                        {balai.location}
                      </span>
                    </div>

                    {/* Capacity Badge */}
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                      <HiUserGroup className="text-cyan-600 text-sm" />
                      <span className="text-xs font-semibold text-slate-700">
                        {balai.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {balai.name}
                    </h3>
                    <p className="text-slate-600 mb-5 leading-relaxed">
                      {balai.description}
                    </p>

                    {/* Programs Tags */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <HiAcademicCap className="text-blue-600 text-lg" />
                        <span className="text-sm font-semibold text-slate-700">
                          Program Unggulan:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {balai.programs.map((program, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700"
                          >
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                        Lihat Detail
                      </span>
                      <HiArrowRight
                        className={`text-blue-600 text-xl transition-transform duration-300 ${
                          hoveredCard === balai.id ? "translate-x-2" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl" />
                </div>
              </Link>
            </Slide>
          ))}
        </div>

        {/* View All Button */}
        <Fade triggerOnce delay={400}>
          <div className="text-center mt-12 md:mt-16">
            <Link
              href="/lembaga/bppp"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                bg-gradient-to-r from-blue-600 to-cyan-600
                text-white font-semibold text-lg
                shadow-lg hover:shadow-xl
                hover:from-blue-700 hover:to-cyan-700
                transform hover:scale-105
                transition-all duration-300"
            >
              <span>Lihat Semua Balai Pelatihan</span>
              <HiArrowRight className="text-xl" />
            </Link>
          </div>
        </Fade>

        {/* Stats Section */}
        <Fade triggerOnce delay={500}>
          <div className="stats-section mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Balai Pelatihan", value: "15+", icon: "🏢" },
              { label: "Program Pelatihan", value: "100+", icon: "📚" },
              { label: "Lulusan per Tahun", value: "10K+", icon: "👨‍🎓" },
              { label: "Instruktur Bersertifikat", value: "200+", icon: "👨‍🏫" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Fade>
      </div>
    </section>
  );
}

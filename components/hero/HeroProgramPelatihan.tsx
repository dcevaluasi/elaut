"use client";

import React from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
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
    <div className="min-h-[70vh] w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
      {/* gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative h-full md:h-[70vh] flex items-center justify-center px-6">
        {/* Background Image */}
        {images.length > 0 && (
          <Image
            src={images[imageIndex]}
            alt="Hero background"
            fill
            priority
            className="absolute w-full h-full object-cover opacity-20"
          />
        )}

        {/* Content */}
        <div className="relative z-10 max-w-5xl w-full mx-auto flex flex-col items-center text-left">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={icon}
              alt={programPelatihan}
              width={100}
              height={100}
              className="w-24 h-24 md:w-28 md:h-28 object-contain"
            />
            <div className="flex flex-col text-left">
              <h1 className="font-bold text-5xl md:text-6xl !text-left font-calsans leading-none drop-shadow-lg">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-blue-400 to-blue-500">
                  {programPelatihan}
                </span>
              </h1>
              <p className="text-gray-200 max-w-3xl mt-4 text-base leading-relaxed">
                {description}
              </p>
            </div>
          </div>



          {/* Glassmorphic Box for Certifications */}
          <div className="mt-8 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 shadow-xl">
            <Marquee gradient={false} speed={40} className="py-2">
              {certifications.map((text: string, index: number) => (
                <p
                  key={index}
                  className="text-sm md:text-base mx-2 text-white border border-white/20 rounded-xl px-4 py-2 bg-white/5 backdrop-blur-sm"
                >
                  {text}
                </p>
              ))}
            </Marquee>
          </div>
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

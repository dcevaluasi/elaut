"use client";

import Image from "next/image";
import React from "react";

import { usePathname } from "next/navigation";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "../app/css/navigation.css";

import Logo from "./ui/logo";
import Link from "next/link";
import { Slide } from "react-awesome-reveal";

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
    // {
    //   id: "002",
    //   name: "Awak Kapal Perikanan",
    //   icon: "/icons/icawak.png",
    //   slug: "akp",
    //   description:
    //     "Pendidikan dan Pelatihan Awak Kapal Perikanan adalah pendidikan dan/atau pelatihan untuk mencapai tingkat keahlian dan/atau keterampilan tertentu sesuai dengan jenjang, kompetensi, dan jabatan untuk awak Kapal Perikanan.",
    // },
    {
      id: "003",
      name: "Kelautan",
      icon: "/icons/ickelautan.png",
      slug: "kelautan",
      description:
        "Pelatihan kelautan adalah pelatihan yang meliputi eksplorasi tak terbatas yang mencakup pengelolaan sumber daya, konservasi, riset, dan inovasi teknologi di laut.",
    },
  ];

  const [selectedProgram, setSelectedProgram] = React.useState<number | null>(
    null
  );

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
    <div className="flex flex-col gap-2  w-full">
      <section className="relative h-full md:h-screen  flex items-center ">
        <Image
          src={images[imageIndex]}
          className="absolute w-full h-full object-cover duration-1000  "
          alt=""
          layout="fill"
          priority
          onClick={(e) => setSelectedProgram(null)}
        />

        <div
          className="absolute w-full h-full bg-black bg-opacity-70  "
          onClick={(e) => setSelectedProgram(null)}
        ></div>

        {/* Illustration behind hero content */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1"
          aria-hidden="true"
          onClick={(e) => setSelectedProgram(null)}
        >
          <svg
            width="1360"
            height="578"
            viewBox="0 0 1360 578"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                id="illustration-01"
              >
                <stop stopColor="#FFF" offset="0%" />
                <stop stopColor="#EAEAEA" offset="77.402%" />
                <stop stopColor="#DFDFDF" offset="100%" />
              </linearGradient>
            </defs>
            <g fill="url(#illustration-01)" fillRule="evenodd">
              <circle cx="1232" cy="128" r="128" />
              <circle cx="155" cy="443" r="64" />
            </g>
          </svg>
        </div>

        <div className="max-w-7xl z-[40] w-full mx-auto relative flex flex-col items-start justify-center text-left px-6 pb-10 -mb-10 md:pb-0 mt-36 md:mt-0">
          {/* Hero content */}
          <div className="flex flex-col md:flex-row w-full items-center justify-center md:justify-between">
            {/* Section header */}
            <div className="text-center gap-5 flex flex-col items-center md:items-start">
              <Logo />
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-[2.5rem] md:text-[3rem] leading-none text-center md:text-left font-calsans text-white">
                  Elektronik Layanan Pelatihan <br />{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r leading-none pt-0 from-blue-500 to-teal-400">
                    Kelautan dan Perikanan
                  </span>
                  <br /> Utama Terpadu
                </h1>
                <h1 className="text-[3.6rem] text-left font-calsans bg-clip-text text-transparent bg-gradient-to-r leading-none pt-0 from-blue-500 to-teal-400">
                  E-LAUT
                </h1>
              </div>
            </div>

            <div
              className="hidden md:flex flex-col gap-3 text-white max-w-md mt-10 md:mt-28 border-t border-t-gray-300 pt-10 md:border-none md:pt-0"
              onMouseLeave={() => setSelectedProgram(null)}
            >
              <h1 className="font-medium font-calsans text-2xl leading-none">
                {selectedProgram != null
                  ? programPelatihan[selectedProgram]!.name
                  : ""}
              </h1>
              <p className="text-sm">
                {" "}
                {selectedProgram != null
                  ? programPelatihan[selectedProgram]!.description
                  : ""}
              </p>

              {selectedProgram != null && (
                <Link
                  href={`/layanan/program/${programPelatihan[selectedProgram]!.slug
                    }`}
                  className={`btn-sm ${top
                    ? usePathname().includes("pelatihan") ||
                      usePathname().includes("searching")
                      ? "text-blue-500 hover:text-white"
                      : "text-gray-200"
                    : "text-blue-500 hover:text-white"
                    } bg-transparent border border-blue-500 hover:bg-blue-500 w-fit`}
                >
                  <span>Lihat Selengkapnya</span>
                </Link>
              )}
            </div>
          </div>

          <div
            className={`w-full flex flex-col md:flex-row gap-5 md:gap-14 items-center justify-center  z-[10000] pt-10 md:pt-0 ${selectedProgram === null ? " md:mt-7 px-4" : "mt-0 px-10"
              }`}
          >
            {programPelatihan.map((item, index) => (
              <Slide direction="up" duration={index * 1200}>
                <div
                  onClick={(e) => setSelectedProgram(index)}
                  className={`flex  w-full mx-auto md:mx-0 md:w-full flex-col gap-1 items-center justify-center hover:scale-110 duration-700 cursor-pointer hover:opacity-100 border text-center rounded-3xl border-gray-200 py-7 ${selectedProgram == index
                    ? "opacity-100 animate-pulse my-10 px md:px-9  "
                    : "opacity-40 md:px-9 px-12 "
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    className={
                      selectedProgram == index ? "w-40 md:w-40" : "w-40 md:w-32"
                    }
                    width={0}
                    height={0}
                  />
                  <h3 className="text-white font-calsans text-base md:text-xl leading-none mt-3">
                    {item.name}
                  </h3>

                  {selectedProgram == index && (
                    <div
                      className="flex md:hidden items-center  flex-col gap-10 text-white max-w-md mt-10 md:mt-28 border-t border-t-gray-300 pt-6 md:border-none md:pt-0"
                      onMouseLeave={() => setSelectedProgram(null)}
                    >
                      <p className="text-sm">
                        {" "}
                        {selectedProgram != null
                          ? programPelatihan[selectedProgram]!.description
                          : ""}
                      </p>

                      {selectedProgram != null && (
                        <Link
                          href={`/layanan/program/${programPelatihan[selectedProgram]!.slug
                            }`}
                          className={`btn-sm ${top
                            ? usePathname().includes("pelatihan") ||
                              usePathname().includes("searching")
                              ? "text-blue-500 hover:text-white"
                              : "text-gray-200"
                            : "text-blue-500 hover:text-white"
                            } bg-transparent border border-blue-500 text-center hover:bg-blue-500 w-fit`}
                        >
                          <span>Lihat Selengkapnya</span>
                        </Link>
                      )}
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

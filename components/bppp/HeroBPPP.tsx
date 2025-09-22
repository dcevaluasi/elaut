"use client";

import Image from "next/image";
import React from "react";

export default function HeroBPPP() {
  const [imageIndex, setImageIndex] = React.useState(0);
  const images = [
    "/images/hero-img7.jpg",
    "/images/hero-img7.jpg",
    "/images/hero-img7.jpg",
    "/images/hero-img7.jpg",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[95vh] m-4 rounded-3xl flex items-center justify-center">
      <Image
        src={images[imageIndex]}
        className="absolute w-full h-full object-cover rounded-3xl duration-1000  "
        alt=""
        layout="fill"
        priority
      />

      <div className="absolute w-full h-full rounded-3xl bg-black bg-opacity-70  "></div>

      {/* Illustration behind hero content */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1"
        aria-hidden="true"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 z-[40]">
        {/* Hero content */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Section header */}

          <div className="text-center pb-12 md:pb-16 flex flex-col items-center justify-center ">
            <h1
              className="text-4xl md:text-[3.9rem] font-normal leading-tighter tracking-tighter mb-3 -mt-2 text-white font-calsans"
            // data-aos="zoom-y-out"
            >
              Balai Pelatihan dan Sertifikasi <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                Kelautan dan Perikanan
              </span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p
                className="text-lg text-gray-200 mb-8"
              // data-aos="zoom-y-out"
              // data-aos-delay="150"
              >
                Aplikasi Pelatihan serta sertifikasi KP yang dikembangkan oleh
                BPPSDMKP untuk menjaring masyarakat KP, aparatur KP, dll untuk
                meningkatkan kompetensi di bidang KP
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

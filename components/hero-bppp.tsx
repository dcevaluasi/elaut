"use client";

import React from "react";
import { capitalize } from "@/utils/text";

export default function HeroBPPP({ bppp }: { bppp?: string }) {

  return (
    <section className="relative h-fit flex items-center justify-center">

      <div className="absolute w-full h-full bg-gray-900 bg-opacity-100"></div>

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

          <div className="text-center pb-12 md:pb-16 flex flex-col items-center justify-center z-[50]">
            <h1
              className="text-4xl md:text-[2.9rem] font-extrabold leading-tighter tracking-tighter mb-3 -mt-2 text-white font-calsans"

            >
              Balai Pelatihan dan Penyuluhan <br />Perikanan {' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                {capitalize(bppp!)}
              </span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p
                className="text-base text-gray-200 mb-8"
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

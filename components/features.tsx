"use client";

import React, { useState, useRef, useEffect } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import "./../app/css/additional-styles/features-slider.css";

// import required modules
import "swiper/css/navigation";
import ListProgram from "./lists";
import Link from "next/link";
import axios, { AxiosResponse } from "axios";
import { PelatihanMasyarakat } from "@/types/product";

export default function Features() {
  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [data, setData] = React.useState<PelatihanMasyarakat[]>([]);

  const handleFetchingPublicTrainingData = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${baseUrl}/lemdik/getPelatihan`
      );
      console.log({ response });
      setData(response.data.data);
    } catch (error) {
      console.error("Error posting training data:", error);
      throw error;
    }
  };

  useEffect(() => {
    handleFetchingPublicTrainingData();
    heightFix();
  }, []);

  return (
    <section className="relative h-fit pb-10 mt-0" id="explore">
      <div className="absolute left-0 right-0 m-auto w-px p-px h-28 bg-gray-300 transform -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="pt-12 md:pt-20">
          <div className="max-w-3xl w-full mx-auto text-center flex gap-2 flex-col items-center justify-center pb-5 md:pb-8">
            <h1 className="text-2xl md:text-4xl text-blue-400 font-calsans leading-[100%]">
              Pelatihan Lainnya
            </h1>
            <p className="text-gray-200 text-sm md:text-base">
              Pelatihan  serupa lainnya yang berfokus pada <br />{" "}
              peningkatan SDM KP yang berkompetensi dan cari pelatihan yang ingin kamu ikuti.
            </p>
          </div>
          <ListProgram pelatihan={data} type="" />
        </div>
      </div>
    </section>
  );
}

"use client";
import "flatpickr/dist/flatpickr.min.css";
import "@/components/styles/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/dashboard/common/Loader";

import { Delius_Unicase, Inter, Plus_Jakarta_Sans } from "next/font/google";

import localFont from "next/font/local";
import axios from "axios";
import Image from "next/image";

const myFont = localFont({
  src: "../font/calsans.ttf",
  variable: "--font-calsans",
});

const inter = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const delius = Delius_Unicase({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-delius",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const images = [
    "/images/program-pelatihan/dummies/akp/akp-1.jpg",
    "/images/program-pelatihan/dummies/akp/akp-2.jpg",
    "/images/program-pelatihan/dummies/akp/akp-3.JPG",
    "/images/program-pelatihan/dummies/akp/akp-4.jpg",
    "/images/program-pelatihan/dummies/akp/akp-5.jpg",
  ];
  const [imageIndex, setImageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} mt-0 pt-0 w-full h-full relative ${myFont.variable} ${delius.variable}`}
      >
        <div className=" relative">{loading ? <Loader /> : children}</div>
        {/* <Image
          src={images[imageIndex]}
          className="absolute w-full h-full rounded-3xl top-0 object-cover duration-1000  "
          alt=""
          layout="fill"
          priority
        />

        <div className="absolute w-full h-full rounded-3xl z-[50] top-0 bg-black bg-opacity-70  "></div> */}
      </body>
    </html>
  );
}

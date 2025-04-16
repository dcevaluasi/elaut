"use client";
import "flatpickr/dist/flatpickr.min.css";
import "@/components/styles/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/dashboard/common/Loader";

import { Delius_Unicase, Inter, Plus_Jakarta_Sans } from "next/font/google";

import localFont from "next/font/local";
import { useRouter } from "next/navigation";

const myFont = localFont({
  src: "../font/calsans.ttf",
  variable: "--font-calsans",
});

const bos = localFont({
  src: "../font/bos.ttf",
  variable: "--font-bos",
});

const bosBold = localFont({
  src: "../font/bookmanoldstyle_bold.ttf",
  variable: "--font-bosBold",
});

const bosNormal = localFont({
  src: "../font/bookmanoldstyle.ttf",
  variable: "--font-bosNormal",
});

const bosItalic = localFont({
  src: "../font/bookmanoldstyle_italic.ttf",
  variable: "--font-bosItalic",
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

const plusSansJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plusSansJakarta",
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

  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} ${myFont.variable} ${bosNormal.variable} ${plusSansJakarta.variable} ${bos.variable} ${bosBold.variable} ${bosItalic.variable}  ${delius.variable} `}
      >
        <div className="h-screen max-h-screen overflow-y-hidden">
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}

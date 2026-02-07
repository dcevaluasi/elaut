import "flatpickr/dist/flatpickr.min.css";
import "@/components/styles/style.css";
import React from "react";
import { Delius_Unicase, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import AkpClientLayout from "./AkpClientLayout";
import { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Sertifikasi & Pelatihan Awak Kapal Perikanan (AKP) | E-LAUT",
  description:
    "Daftar sertifikasi Awak Kapal Perikanan (AKP) melalui platform E-LAUT. Tersedia pelatihan BSTF, Kepelautan, dan Sertifikasi Kompetensi Resmi BPPSDM KP Kementerian Kelautan dan Perikanan Indonesia.",
  keywords: [
    "Awak Kapal Perikanan",
    "AKP",
    "Sertifikasi AKP",
    "Pelatihan Nelayan",
    "BSTF",
    "KKP",
    "BPPSDM KP",
    "E-LAUT",
    "Fisheries Certification Indonesia",
    "Sertifikat Kecakapan Nelayan",
    "Diklat Awak Kapal Perikanan",
    "Pusat Pelatihan KKP",
  ],
  authors: [{ name: "BPPSDM KP - Kementerian Kelautan dan Perikanan" }],
  openGraph: {
    title: "Sertifikasi & Pelatihan Awak Kapal Perikanan (AKP) | E-LAUT",
    description:
      "Platform Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu untuk Awak Kapal Perikanan profesional.",
    url: "https://elaut.kkp.go.id/akp",
    siteName: "E-LAUT",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/program-pelatihan/dummies/akp/akp-1.jpg",
        width: 1200,
        height: 630,
        alt: "Pelatihan Awak Kapal Perikanan E-LAUT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sertifikasi & Pelatihan Awak Kapal Perikanan (AKP) | E-LAUT",
    description:
      "Daftar pelatihan dan sertifikasi AKP resmi kementerian kelautan dan perikanan melalui E-LAUT.",
    images: ["/images/program-pelatihan/dummies/akp/akp-1.jpg"],
  },
  alternates: {
    canonical: "https://elaut.kkp.go.id/akp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Awak Kapal Perikanan (AKP) Training Center - E-LAUT",
    "description": "Pusat pelatihan dan sertifikasi resmi untuk Awak Kapal Perikanan di bawah naungan Kementerian Kelautan dan Perikanan Republik Indonesia.",
    "url": "https://elaut.kkp.go.id/akp",
    "logo": "https://elaut.kkp.go.id/logo-kkp.png",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Jakarta",
      "addressCountry": "ID"
    }
  };

  return (
    <div className={`${inter.className} ${myFont.variable} ${delius.variable} antialiased min-h-screen`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AkpClientLayout>
        {children}
      </AkpClientLayout>
    </div>
  );
}

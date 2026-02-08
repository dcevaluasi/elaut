import "./css/style.css";

import { Delius_Unicase, Inter, Plus_Jakarta_Sans } from "next/font/google";

import localFont from "next/font/local";

import Header from "@/components/ui/header";
import BottomNavigation from "@/components/ui/bottom-nav";

const myFont = localFont({
  src: "./font/calsans.ttf",
  variable: "--font-calsans",
});

const bos = localFont({
  src: "./font/bos.ttf",
  variable: "--font-bos",
});

const bosBold = localFont({
  src: "./font/bookmanoldstyle_bold.ttf",
  variable: "--font-bosBold",
});

const bosItalic = localFont({
  src: "./font/bookmanoldstyle_italic.ttf",
  variable: "--font-bosItalic",
});

const bosNormal = localFont({
  src: "./font/booksold.ttf",
  variable: "--font-bosNormal",
});

const cambria = localFont({
  src: "./font/cambria.ttf",
  variable: "--font-cambria",
});

const tuwir = localFont({
  src: "./font/Tuwir.ttf",
  variable: "--font-tuwir",
});

const delius = Delius_Unicase({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-delius",
});

const inter = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusSansJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plusSansJakarta",
});

import { Metadata, Viewport } from "next";

/*
  METADATA WEBSITE E-LAUT - OPTIMIZED FOR SEARCH ENGINES
*/
export const metadata: Metadata = {
  title: {
    default: "E-LAUT | Elektronik Layanan Pelatihan Kelautan & Perikanan Terpadu",
    template: "%s"
  },
  description:
    "Portal resmi E-LAUT Kementerian Kelautan dan Perikanan (KKP). Platform terpadu untuk pendaftaran pelatihan, sertifikasi kompetensi, dan pengembangan SDM Kelautan dan Perikanan di Indonesia.",
  metadataBase: new URL("https://elaut-bppsdm.kkp.go.id"),
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },
  applicationName: "E-LAUT",
  authors: [{ name: "BPPSDM KP - Kementerian Kelautan dan Perikanan" }],
  generator: "Next.js",
  keywords: [
    "E-LAUT", "E-MILEA", "e-milea", "elatar", "pentaru", "e-latar", "pelaut", "elut", "Badan Penyuluah", "puslatkp", "puslat kp", "Puslat KP", "PUSLAT  KP", "Pusat Pelatihan KP", "emilea", "EMILEA", "elearning kkp", "ELAUT", "Elaut", "e-laut", "Kementerian Kelautan dan Perikanan", "KKP", "BPPSDM KP",
    "pelatihan kelautan", "pelatihan perikanan", "sertifikasi kompetensi", "diklat perikanan",
    "sertifikat kelautan", "BSTF", "pelatihan", "training", "waingapu", "ekonomi biru", "blu economy", "Awak Kapal Perikanan", "AKP", "P2MKP", "BPPP",
    "pendaftaran pelatihan online", "CORPU KKP", "corpu", "Corpu", "Maritime Training Center", "training center", "layanan masyarakat KKP", "SDM Maritim", "indonesia maritime training", "budidaya", "Budi Daya", "HACCP", "SPI", "CPIB", "CBIB", "ANKAPIN", "ATKAPIN", "tegal", "Tegal", "Banyuwangi", "banyuwangi", "bitung", "Bitung", "Ambon", "BPPP Tegal", "BPPP Ambon", "BPPP Bitung", "BPPP Medan", "BPPP Banyuwangi", "BRBIH Depok", "BRBIH", "Rating", "diklat teknis kp"
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/logo-kkp.png",
    shortcut: "/logo-kkp.png",
    apple: "/logo-kkp.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://elaut-bppsdm.kkp.go.id",
    siteName: "E-LAUT KKP",
    title: "E-LAUT | Portal Pelatihan & Sertifikasi Resmi KKP RI",
    description: "Akses mudah layanan pelatihan dan sertifikasi kelautan dan perikanan terpadu Indonesia.",
    images: [
      {
        url: "/images/hero-img6.jpg",
        width: 1200,
        height: 630,
        alt: "E-LAUT - Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kkpgoid",
    creator: "@kkpgoid",
    title: "E-LAUT | Portal Pelatihan & Sertifikasi Resmi KKP RI",
    description: "Tingkatkan kompetensi maritim anda melalui platform elektronik terpadu E-LAUT.",
    images: ["/images/hero-img6.jpg"],
  },
  verification: {
    google: "google-site-verification-id", // User should replace with actual ID if available
  },
  category: "Education",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "E-LAUT KKP",
    "alternateName": "Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
    "url": "https://elaut-bppsdm.kkp.go.id",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://elaut-bppsdm.kkp.go.id/pelatihan?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "Kementerian Kelautan dan Perikanan RI",
    "alternateName": "BPPSDM KP",
    "url": "https://www.kkp.go.id",
    "logo": "https://elaut-bppsdm.kkp.go.id/logo-kkp.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-21-3519070",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": "Indonesian"
    },
    "sameAs": [
      "https://www.facebook.com/bppsdm_puslatkp",
      "https://twitter.com/bppsdm_puslatkp",
      "https://www.instagram.com/bppsdm_puslatkp"
    ]
  };

  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} ${myFont.variable} ${bosNormal.variable} ${plusSansJakarta.variable} ${tuwir.variable} ${delius.variable} ${bos.variable} ${bosBold.variable}  ${bosItalic.variable} ${cambria.variable} antialiased bg-white text-gray-900 tracking-tight `}
      >
        <LanguageProvider>
          <div className="flex flex-col overflow-hidden supports-[overflow:clip]:overflow-clip relative">
            <Header />
            {children}
            <BottomNavigation />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}

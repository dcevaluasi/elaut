import "./css/style.css";
import "leaflet/dist/leaflet.css";

import type { Metadata, Viewport } from "next";
import { Delius_Unicase, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

import Header from "@/components/ui/header";
import FloatingContact from "@/components/ui/floating-contact";
import { LanguageProvider } from "@/context/LanguageContext";

/* ============================ FONTS ============================ */

const calsans = localFont({ src: "./font/calsans.ttf", variable: "--font-calsans", display: "swap" });
const bos = localFont({ src: "./font/bos.ttf", variable: "--font-bos", display: "swap" });
const bosBold = localFont({ src: "./font/bookmanoldstyle_bold.ttf", variable: "--font-bosBold", display: "swap" });
const bosItalic = localFont({ src: "./font/bookmanoldstyle_italic.ttf", variable: "--font-bosItalic", display: "swap" });
const bosNormal = localFont({ src: "./font/booksold.ttf", variable: "--font-bosNormal", display: "swap" });
const cambria = localFont({ src: "./font/cambria.ttf", variable: "--font-cambria", display: "swap" });
const tuwir = localFont({ src: "./font/Tuwir.ttf", variable: "--font-tuwir", display: "swap" });

const delius = Delius_Unicase({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-delius", display: "swap" });
// Satu instance Plus Jakarta Sans dipakai untuk kedua variabel (dulu dimuat dua kali)
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plusSansJakarta", display: "swap" });

/* ============================ METADATA ============================ */

const SITE = "https://elaut-bppsdm.kkp.go.id";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "E-LAUT | Elektronik Layanan Pelatihan Kelautan & Perikanan Terpadu",
    template: "%s",
  },
  description:
    "Portal resmi E-LAUT Kementerian Kelautan dan Perikanan (KKP). Platform terpadu untuk pendaftaran pelatihan, sertifikasi kompetensi, dan pengembangan SDM Kelautan dan Perikanan di Indonesia.",
  alternates: { canonical: "/", languages: { "id-ID": "/" } },
  applicationName: "E-LAUT",
  authors: [{ name: "BPPSDM KP - Kementerian Kelautan dan Perikanan", url: SITE }],
  creator: "BPPSDM KP",
  publisher: "Kementerian Kelautan dan Perikanan Republik Indonesia",
  generator: "Next.js",
  keywords: [
    "E-LAUT", "ELAUT", "e-laut", "E-MILEA", "emilea", "e-latar", "pentaru",
    "Kementerian Kelautan dan Perikanan", "KKP", "BPPSDM KP", "Puslat KP", "Pusat Pelatihan KP",
    "pelatihan kelautan", "pelatihan perikanan", "diklat perikanan", "diklat teknis KP",
    "sertifikasi kompetensi", "sertifikat kelautan", "pendaftaran pelatihan online", "elearning KKP",
    "Awak Kapal Perikanan", "AKP", "BSTF", "ANKAPIN", "ATKAPIN", "HACCP", "CPIB", "CBIB",
    "P2MKP", "BPPP", "BPPP Tegal", "BPPP Ambon", "BPPP Bitung", "BPPP Medan", "BPPP Banyuwangi", "BRBIH Depok",
    "CORPU KKP", "Maritime Training Center", "SDM Maritim", "ekonomi biru", "budidaya",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    // `nocache: true` dihapus — itu meminta mesin pencari tidak menyimpan cache halaman (merugikan SEO)
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
  icons: { icon: "/logo-kkp.png", shortcut: "/logo-kkp.png", apple: "/logo-kkp.png" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE,
    siteName: "E-LAUT KKP",
    title: "E-LAUT | Portal Pelatihan & Sertifikasi Resmi KKP RI",
    description: "Akses mudah layanan pelatihan dan sertifikasi kelautan dan perikanan terpadu Indonesia.",
    images: [{ url: "/images/hero-img6.jpg", width: 1200, height: 630, alt: "E-LAUT - Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kkpgoid",
    creator: "@kkpgoid",
    title: "E-LAUT | Portal Pelatihan & Sertifikasi Resmi KKP RI",
    description: "Tingkatkan kompetensi maritim Anda melalui platform elektronik terpadu E-LAUT.",
    images: ["/images/hero-img6.jpg"],
  },
  // Isi dengan kode asli dari Google Search Console (placeholder dihapus agar tidak mengirim kode palsu)
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC", // light mode (warna bilah browser di HP)
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ============================ JSON-LD ============================ */

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "E-LAUT KKP",
  alternateName: "Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
  url: SITE,
  inLanguage: "id-ID",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE}/pelatihan?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDM KP)",
  alternateName: ["BPPSDM KP", "E-LAUT KKP"],
  url: SITE,
  logo: `${SITE}/logo-kkp.png`,
  parentOrganization: { "@type": "GovernmentOrganization", name: "Kementerian Kelautan dan Perikanan Republik Indonesia", url: "https://www.kkp.go.id" },
  contactPoint: { "@type": "ContactPoint", telephone: "+62-21-3519070", contactType: "customer service", areaServed: "ID", availableLanguage: "Indonesian" },
  sameAs: ["https://www.facebook.com/bppsdm_puslatkp", "https://twitter.com/bppsdm_puslatkp", "https://www.instagram.com/bppsdm_puslatkp"],
};

const ld = (o: object) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

/* ============================ LAYOUT ============================ */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth ">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={ld(websiteJsonLd)} />
        <script type="application/ld+json" dangerouslySetInnerHTML={ld(organizationJsonLd)} />
      </head>
      <body
        suppressHydrationWarning
        style={{ ["--font-inter" as string]: "var(--font-plusSansJakarta)" }}
        className={`${jakarta.className} ${jakarta.variable} ${calsans.variable} ${bosNormal.variable} ${tuwir.variable} ${delius.variable} ${bos.variable} ${bosBold.variable} ${bosItalic.variable} ${cambria.variable} antialiased tracking-tight text-slate-900 selection:bg-blue-500/20 selection:text-slate-900`}
      >
        <LanguageProvider>
          <div className="relative flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
            <Header />
            {children}
            <FloatingContact />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}

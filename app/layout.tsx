import "./css/style.css";

import { Delius_Unicase, Inter, Plus_Jakarta_Sans } from "next/font/google";

import localFont from "next/font/local";

import Header from "@/components/ui/header";
import Banner from "@/components/banner";
import CallCenter from "@/components/call-center";

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

/*
  METADATA WEBSITE E-LAUT
*/
export const metadata = {
  title: "E-LAUT - Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
  description:
    "Temukan kemudahan dalam mengakses pelatihan kelautan dan perikanan melalui E-LAUT, platform layanan elektronik terpadu yang dirancang untuk meningkatkan keahlian dan pengetahuan di bidang kelautan dan perikanan.",
  icons: ["/logo-kkp.png"],
  keywords: [
    "E-LAUT",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "layanan elektronik",
    "platform pelatihan",
    "kelautan",
    "perikanan",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "KKP",
    "Kementerian Kelautan dan Perikanan",
    "budidaya",
    "CPIB",
    "CBIB",
    "CPPIB",
    "Diklat",
    "BPPP Medan",
    "BPPP Ambon",
    "BPPP Tegal",
    "BLU BPPP Tegal",
    "BPPP Bitung",
    "BPPP Banyuwangi",
    "Balai Pelatihan",
    "Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan",
    "BPPSDM KP",
    "BPPSDM",
    "elaut",
    "E-Laut",
    "e-Laut",
    "e-laut",
    "Elektronik Layanan",
    "Elektronik",
    "Elektronik Layanan Pelatihan Kelautan dan Perikanan Utama Terpadu",
    "Pusat Pelatihan KP",
    "pusat pelatihan kp",
    "rating",
    "bstf",
    "Awak Kapal Perikanan",
    "SOPI",
    "BSTF",
    "Pengolahan",
    "Pemasaran",
    "Mesin Perikanan",
    "Kepelautan",
  ],
  author: "Kementerian Kelautan dan Perikanan",
  url: "https://elaut.vercel.app",
  type: "website",
  robots: "index, follow",
  og: {
    title:
      "E-LAUT - Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
    description:
      "Temukan kemudahan dalam mengakses pelatihan kelautan dan perikanan melalui E-LAUT, platform layanan elektronik terpadu yang dirancang untuk meningkatkan keahlian dan pengetahuan di bidang kelautan dan perikanan.",
    type: "website",
    url: "https://elaut.vercel.app",
    image: "/logo-kkp.png",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "E-LAUT - Elektronik Layanan Pelatihan Kelautan dan Perikanan Terpadu",
    description:
      "Temukan kemudahan dalam mengakses pelatihan kelautan dan perikanan melalui E-LAUT, platform layanan elektronik terpadu yang dirancang untuk meningkatkan keahlian dan pengetahuan di bidang kelautan dan perikanan.",
    image: "/logo-kkp.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} ${myFont.variable} ${tuwir.variable} ${delius.variable} ${bos.variable} ${bosBold.variable}  ${bosItalic.variable} ${cambria.variable} antialiased bg-white text-gray-900 tracking-tight `}
      >
        <div className="flex flex-col overflow-hidden supports-[overflow:clip]:overflow-clip relative">

          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}

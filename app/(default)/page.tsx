import Hero from "@/components/hero";
import BalaiPelatihanSection from "@/components/balai-pelatihan-section";
import AboutElautSection from "@/components/about-elaut-section";
import TourGuide from "@/components/tour-guide";
import Footer from "@/components/ui/footer";

export const metadata = {
  title:
    "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu | Pelatihan & Sertifikasi Kelautan dan Perikanan",
  description:
    "E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu) adalah platform resmi BPPSDM KP, Kementerian Kelautan dan Perikanan. Temukan informasi lengkap tentang pendaftaran, pelatihan, sertifikasi kelautan, perikanan, e-learning, hingga pelatihan awak kapal perikanan. Daftar mudah, belajar fleksibel, dan raih sertifikat resmi.",
  keywords: [
    "E-LAUT",
    "platform pelatihan online",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "pelatihan awak kapal",
    "pelatihan awak kapal perikanan",
    "e-learning kelautan",
    "e-learning perikanan",
    "pendaftaran pelatihan online",
    "registrasi pelatihan E-LAUT",
    "registrasi E-LAUT",
    "sertifikasi awak kapal perikanan",
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "pendidikan vokasi kelautan",
    "pelatihan kompetensi kelautan",
    "pelatihan kompetensi perikanan",
    "Kementerian Kelautan dan Perikanan",
    "kementerian kelautan dan perikanan",
    "kkp",
    "pelatihan kkp",
    "sertifikasi kkp",
    "diklat kelautan",
    "diklat perikanan",
    "e-learning kementerian kelautan",
  ],
  author: "BPPSDM KP - Kementerian Kelautan dan Perikanan",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  canonical: "https://elaut-bppsdm.kkp.go.id",
  openGraph: {
    title:
      "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu | Pelatihan & Sertifikasi Kelautan dan Perikanan",
    description:
      "E-LAUT adalah layanan digital resmi BPPSDM KP untuk pendaftaran, pelatihan, dan sertifikasi bidang kelautan dan perikanan. Cocok untuk individu, nelayan, mahasiswa, hingga corporate/manning agent.",
    url: "https://elaut-bppsdm.kkp.go.id",
    type: "website",
    site_name: "E-LAUT",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "E-LAUT - Platform Pelatihan & Sertifikasi Kelautan dan Perikanan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu | Pelatihan & Sertifikasi Kelautan dan Perikanan",
    description:
      "Daftar dan ikuti pelatihan serta sertifikasi bidang kelautan dan perikanan di E-LAUT, platform resmi BPPSDM KP, Kementerian Kelautan dan Perikanan.",
    site: "https://elaut-bppsdm.kkp.go.id",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Footer />
    </>
  );
}

import Hero from "@/components/hero";
import Footer from "@/components/ui/footer";

export const metadata = {
  title: "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "E-LAUT, layanan elektronik dari BPPSDM KP untuk membantu mu mencari pelatihan dan sertifikasi di sektor Kelautan dan Perikanan. Ragam pelatihan menarik dapat kamu ikuti mulai dari perikanan, kelautan, hingga awak kapal perikanan.",
  keywords: [
    "E-LAUT",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "pelatihan awak kapal",
    "e-learning kelautan",
    "e-learning perikanan",
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "registrasi pelatihan",
    "registrasi E-LAUT",
    "sertifikasi awak kapal perikanan",
    "Kementerian Kelautan dan Perikanan",
    "kementerian kelautan dan perikanan",
    "kkp",
  ],
  author: "BPPSDM KP",
  robots: "index, follow",
  canonical: "https://elaut-bppsdm.kkp.go.id",
  openGraph: {
    title: "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "E-LAUT, layanan elektronik dari BPPSDM KP untuk membantu mu mencari pelatihan dan sertifikasi di sektor Kelautan dan Perikanan.",
    url: "https://elaut-bppsdm.kkp.go.id",
    type: "website",
    site_name: "E-LAUT",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "E-LAUT, layanan elektronik dari BPPSDM KP untuk membantu mencari pelatihan dan sertifikasi di sektor Kelautan dan Perikanan.",
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

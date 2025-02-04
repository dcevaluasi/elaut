import ProgramPelatihan from "@/components/program/ProgramPelatihan";

export const metadata = {
  title:
    "Program Pelatihan E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "Cari pelatihan dan sertifikasi menarik pada E-LAUT dan tingkatkan kompetensi serta keahlianmu dalam sektor kelautan dan perikanan. Ragam pelatihan tersedia dengan program utama perikanan, kelautan, dan awak kapal perikanan.",
  keywords: [
    "program pelatihan E-LAUT",
    "E-LAUT",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "program pelatihan kelautan",
    "program pelatihan perikanan",
    "pelatihan awak kapal",
    "e-learning kelautan",
    "e-learning perikanan",
    "elaut",
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "registrasi pelatihan",
    "Kementerian Kelautan dan Perikanan",
    "kkp",
  ],
  author: "BPPSDM KP",
  robots: "index, follow",
  canonical: "https://elaut-bppsdm.kkp.go.id",
  openGraph: {
    title:
      "Program Pelatihan E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Cari pelatihan dan sertifikasi menarik di E-LAUT. Tingkatkan keahlianmu dalam sektor kelautan dan perikanan melalui ragam program pelatihan yang tersedia.",
    url: "https://elaut-bppsdm.kkp.go.id",
    type: "website",
    site_name: "E-LAUT",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "Program Pelatihan E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Program Pelatihan E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Cari pelatihan menarik di E-LAUT untuk meningkatkan kompetensi dalam bidang kelautan, perikanan, dan awak kapal perikanan.",
    site: "https://elaut-bppsdm.kkp.go.id",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "Program Pelatihan E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
};

export default function page() {
  return <ProgramPelatihan />;
}

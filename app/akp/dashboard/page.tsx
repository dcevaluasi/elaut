import AKP from "@/components/dashboard/Dashboard/AKP";
import { Metadata } from "next";

export const metadata = {
  title: "Dashboard - Capaian Penerbitan Sertifikasi Awak Kapal Perikanan",
  description:
    "Dashboard ini menyajikan statistik penerbitan sertifikasi awak kapal perikanan, pengadaan blanko, serta penerbitan CoP dan CoC dalam bentuk grafik interaktif untuk mempermudah pemantauan dan analisis data.",
  keywords: [
    "Dashboard Capaian Sertifikasi",
    "Sertifikasi Awak Kapal Perikanan",
    "Penerbitan CoP",
    "Penerbitan CoC",
    "Pengadaan Blanko Sertifikasi",
    "Statistik Sertifikasi Kapal Perikanan",
    "E-LAUT",
    "e-laut",
    "Pelatihan Kelautan",
    "Pelatihan Perikanan",
    "Sertifikasi Kelautan",
    "Sertifikasi Perikanan",
    "Pelatihan Awak Kapal",
    "BPPSDM KP",
    "Pendidikan Kelautan",
    "Pendidikan Perikanan",
    "Registrasi Pelatihan",
    "Registrasi E-LAUT",
    "Kementerian Kelautan dan Perikanan",
    "KKP",
    "Prabowo Subianto",
    "ANKAPIN",
    "ATKAPIN",
    "BST-F",
    "SKN",
    "SKPI",
    "AKP",
    "awak kapal",
    "Awak Kapal Perikanan",
    "Diklat Kelautan",
    "Diklat Perikanan",
    "Kompetensi Awak Kapal",
    "e-learning Kelautan",
    "e-learning Perikanan",
    "Data Statistik Penerbitan Sertifikat",
    "Pelaut Perikanan",
    "Laut dan Perikanan",
    "Sertifikasi Profesi Kelautan",
    "Manajemen SDM Perikanan",
    "Layanan Digital Sertifikasi Kapal",
  ],
  author: "BPPSDM KP",
  robots: "index, follow",
  canonical: "https://elaut-bppsdm.kkp.go.id/akp/dashboard",
  openGraph: {
    title: "Dashboard Capaian Penerbitan Sertifikasi Awak Kapal Perikanan",
    description:
      "Dashboard ini menyajikan data penerbitan sertifikasi awak kapal perikanan, pengadaan blanko, serta penerbitan CoP dan CoC dalam bentuk grafik yang interaktif.",
    url: "https://elaut-bppsdm.kkp.go.id/akp/dashboard",
    type: "website",
    site_name: "Dashboard - Capaian Sertifikasi AKP",
    images: [
      {
        url: "https://elaut-bppsdm.kkp.go.id/assets/dashboard-thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Dashboard - Capaian Penerbitan Sertifikasi Awak Kapal Perikanan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Capaian Penerbitan Sertifikasi Awak Kapal Perikanan",
    description:
      "Pantau penerbitan sertifikasi awak kapal perikanan, pengadaan blanko, serta penerbitan CoP dan CoC secara statistik melalui grafik interaktif.",
    site: "https://elaut-bppsdm.kkp.go.id/akp/dashboard",
    images: [
      {
        url: "https://elaut-bppsdm.kkp.go.id/assets/dashboard-thumbnail.jpg",
        alt: "Dashboard Capaian Penerbitan Sertifikasi Awak Kapal Perikanan",
      },
    ],
  },
  alternates: {
    canonical: "https://elaut-bppsdm.kkp.go.id/akp/dashboard",
    languages: {
      "id-ID": "https://elaut-bppsdm.kkp.go.id/akp/dashboard/id",
      "en-US": "https://elaut-bppsdm.kkp.go.id/akp/dashboard/en",
    },
  },
  manifest: "/site.webmanifest",
  themeColor: "#2563EB",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function page() {
  return (
    <section className="m-10 md:m-16 ">
      <AKP />
    </section>
  );
}

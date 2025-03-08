import DashboardUser from "@/components/elaut/DashboardUser";
import Footer from "@/components/ui/footer";

export const metadata = {
  title: "Dashboard E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "Kelola dan pantau data pelatihan serta sertifikasi di sektor Kelautan dan Perikanan melalui dashboard E-LAUT. Akses informasi secara cepat dan mudah.",
  keywords: [
    "dashboard E-LAUT",
    "manajemen sertifikat",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "monitoring pelatihan",
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "Kementerian Kelautan dan Perikanan",
    "kkp",
  ],
  author: "BPPSDM KP",
  robots: "index, follow",
  canonical: "https://elaut-bppsdm.kkp.go.id/dashboard",
  openGraph: {
    title: "Dashboard E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Kelola dan pantau data pelatihan serta sertifikasi di sektor Kelautan dan Perikanan melalui dashboard E-LAUT.",
    url: "https://elaut-bppsdm.kkp.go.id/dashboard",
    type: "website",
    site_name: "E-LAUT",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "Dashboard E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Kelola dan pantau data pelatihan serta sertifikasi di sektor Kelautan dan Perikanan melalui dashboard E-LAUT.",
    site: "https://elaut-bppsdm.kkp.go.id/dashboard",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "Dashboard E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
};

export default function Dashboard() {
  return (
    <>
      <DashboardUser />
      <Footer />
    </>

  );
}

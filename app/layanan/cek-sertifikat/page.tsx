
import CertificateCheckFeature from "@/components/elaut/CertificateCheckFeature";
import Footer from "@/components/ui/footer";

export const metadata = {
  title: "Cek Sertifikat E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "Cek sertifikat pelatihan dan sertifikasi yang telah kamu ikuti di sektor Kelautan dan Perikanan melalui E-LAUT. Mudah dan cepat, tersedia berbagai sertifikat untuk berbagai pelatihan.",
  keywords: [
    "cek sertifikat E-LAUT",
    "sertifikat pelatihan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "sertifikat awak kapal",
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "cek sertifikat online",
    "Kementerian Kelautan dan Perikanan",
    "kkp",
  ],
  author: "BPPSDM KP",
  robots: "index, follow",
  canonical: "https://elaut-bppsdm.kkp.go.id/cek-sertifikat",
  openGraph: {
    title: "Cek Sertifikat - E-LAUT Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Cek sertifikat pelatihan dan sertifikasi yang telah kamu ikuti melalui E-LAUT di sektor Kelautan dan Perikanan.",
    url: "https://elaut-bppsdm.kkp.go.id/cek-sertifikat",
    type: "website",
    site_name: "E-LAUT",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "Cek Sertifikat - E-LAUT Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cek Sertifikat - E-LAUT Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Cek sertifikat pelatihan yang telah kamu ikuti di E-LAUT, layanan sektor Kelautan dan Perikanan.",
    site: "https://elaut-bppsdm.kkp.go.id/cek-sertifikat",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "Cek Sertifikat - E-LAUT Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
};

export default function CekSertifikat() {
  return (
    <>
      <CertificateCheckFeature />
      <Footer />
    </>

  );
}

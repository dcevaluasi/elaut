import FormRegistrasi from "@/components/auth/FormRegistrasi";
import Footer from "@/components/ui/footer";

export const metadata = {
  title: "Registrasi E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "Registrasi sekarang ke E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu) untuk mengikuti pelatihan dan sertifikasi di bidang Kelautan dan Perikanan. Tersedia bagi individu, taruna, mahasiswa, tenaga kerja, maupun corporate/manning agent.",
  keywords: [
    // Core platform
    "registrasi E-LAUT",
    "daftar E-LAUT",
    "pendaftaran E-LAUT",
    "sign up E-LAUT",
    "E-LAUT",
    "portal registrasi E-LAUT",

    // Training & certification
    "pendaftaran pelatihan",
    "registrasi pelatihan",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "training kelautan",
    "training perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "sertifikasi kompetensi kelautan",
    "sertifikasi kompetensi perikanan",
    "pendaftaran sertifikasi online",
    "kursus online kelautan",
    "kursus online perikanan",

    // E-learning & digital platform
    "e-learning kelautan",
    "e-learning perikanan",
    "e-learning KKP",
    "LMS kelautan",
    "LMS perikanan",
    "online training fisheries",
    "online training maritime",
    "platform pelatihan kelautan",
    "platform pelatihan perikanan",

    // Audience-specific
    "registrasi taruna kelautan",
    "registrasi taruna perikanan",
    "registrasi mahasiswa kelautan",
    "registrasi mahasiswa perikanan",
    "registrasi tenaga kerja kelautan",
    "registrasi tenaga kerja perikanan",
    "registrasi nelayan",
    "corporate training kelautan",
    "corporate training perikanan",
    "registrasi corporate manning agent",

    // Institutional & branding
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "Kementerian Kelautan dan Perikanan",
    "KKP Indonesia",
    "BLU KP",
    "platform digital KKP",

    // Long-tail & intent-based
    "registrasi pelatihan kelautan online",
    "registrasi pelatihan perikanan online",
    "cara daftar E-LAUT",
    "cara registrasi pelatihan kelautan",
    "cara registrasi pelatihan perikanan",
    "aplikasi E-LAUT registrasi",
    "sistem registrasi pelatihan kelautan",
    "sistem registrasi pelatihan perikanan",
  ],
  author: "BPPSDM KP",
  publisher: "BPPSDM Kementerian Kelautan dan Perikanan",
  robots:
    "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  canonical: "https://elaut-bppsdm.kkp.go.id/registrasi",
  applicationName: "E-LAUT",
  generator: "Next.js",
  themeColor: "#005f73",
  alternates: {
    canonical: "https://elaut-bppsdm.kkp.go.id/registrasi",
    languages: {
      "id-ID": "https://elaut-bppsdm.kkp.go.id/registrasi",
      "en-US": "https://elaut-bppsdm.kkp.go.id/en/registration",
    },
  },
  openGraph: {
    title: "Registrasi E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Daftar sekarang di E-LAUT untuk pelatihan dan sertifikasi di sektor Kelautan dan Perikanan. Cocok untuk individu maupun corporate/manning agent.",
    url: "https://elaut-bppsdm.kkp.go.id/registrasi",
    type: "website",
    siteName: "E-LAUT",
    locale: "id_ID",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "Registrasi E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Registrasi E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Registrasi sekarang ke E-LAUT untuk pendaftaran pelatihan dan sertifikasi di sektor Kelautan dan Perikanan. Mudah, cepat, terpercaya.",
    site: "@kkpgoid",
    creator: "@kkpgoid",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "Registrasi E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function SignUp() {
  return (
    <>
      <FormRegistrasi />
      <Footer />
    </>
  );
}

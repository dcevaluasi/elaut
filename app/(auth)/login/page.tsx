import FormLogin from "@/components/auth/FormLogin";
import Footer from "@/components/ui/footer";

export const metadata = {
  title: "Login E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
  description:
    "Login ke E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu) untuk akses pendaftaran pelatihan dan sertifikasi di bidang kelautan dan perikanan. Tersedia untuk individu maupun corporate/manning agent.",
  keywords: [
    // Core platform
    "login E-LAUT",
    "E-LAUT",
    "login platform E-LAUT",
    "masuk E-LAUT",
    "daftar E-LAUT",
    "registrasi E-LAUT",
    "login pelatihan E-LAUT",

    // Training & certification
    "registrasi pelatihan kelautan",
    "registrasi pelatihan perikanan",
    "pendaftaran pelatihan online",
    "pelatihan kelautan",
    "pelatihan perikanan",
    "training kelautan",
    "training perikanan",
    "sertifikasi kelautan",
    "sertifikasi perikanan",
    "sertifikasi kompetensi kelautan",
    "sertifikasi kompetensi perikanan",
    "pelatihan sertifikasi BPPSDM KP",
    "sertifikasi online kelautan",
    "sertifikasi online perikanan",

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
    "pelatihan taruna kelautan",
    "pelatihan taruna perikanan",
    "pelatihan mahasiswa kelautan",
    "pelatihan mahasiswa perikanan",
    "pelatihan tenaga kerja kelautan",
    "pelatihan tenaga kerja perikanan",
    "pelatihan nelayan",
    "corporate training kelautan",
    "corporate training perikanan",
    "manning agent kelautan",
    "manning agent perikanan",

    // Institutional & branding
    "BPPSDM KP",
    "pendidikan kelautan",
    "pendidikan perikanan",
    "Kementerian Kelautan dan Perikanan",
    "KKP Indonesia",
    "BLU KP",
    "platform digital KKP",

    // Long-tail & intent-based
    "login pendaftaran pelatihan kelautan",
    "login pendaftaran pelatihan perikanan",
    "akses pelatihan E-LAUT",
    "cara daftar pelatihan kelautan",
    "cara daftar pelatihan perikanan",
    "aplikasi E-LAUT login",
    "portal pelatihan E-LAUT",
    "sistem informasi pelatihan kelautan",
    "sistem informasi pelatihan perikanan",
  ],
  author: "BPPSDM KP",
  publisher: "BPPSDM Kementerian Kelautan dan Perikanan",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  canonical: "https://elaut-bppsdm.kkp.go.id/login",
  applicationName: "E-LAUT",
  generator: "Next.js",
  themeColor: "#005f73",
  alternates: {
    canonical: "https://elaut-bppsdm.kkp.go.id/login",
    languages: {
      "id-ID": "https://elaut-bppsdm.kkp.go.id/login",
      "en-US": "https://elaut-bppsdm.kkp.go.id/en/login",
    },
  },
  openGraph: {
    title: "Login E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Masuk ke E-LAUT untuk melakukan pendaftaran pelatihan dan sertifikasi kelautan maupun perikanan. Dukung pengembangan kompetensi di sektor kelautan dan perikanan.",
    url: "https://elaut-bppsdm.kkp.go.id/login",
    type: "website",
    siteName: "E-LAUT",
    locale: "id_ID",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        width: 1200,
        height: 630,
        alt: "Login E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
      "Login ke E-LAUT untuk pendaftaran pelatihan dan sertifikasi di sektor Kelautan dan Perikanan. Mudah, cepat, dan terpercaya.",
    site: "@kkpgoid",
    creator: "@kkpgoid",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
        alt: "Login E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
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
      <FormLogin />
      <Footer />
    </>
  );
}

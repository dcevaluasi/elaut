import { LoginAdminELAUT } from "@/components/elaut/auth/LoginAdminELAUT";

export const metadata = {
    title: "Login Admin E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
    description:
        "Halaman login admin E-LAUT, layanan elektronik dari BPPSDM KP untuk mengelola pelatihan dan sertifikasi di sektor Kelautan dan Perikanan. Akses sistem admin untuk mengelola data pelatihan, peserta, dan sertifikasi.",
    keywords: [
        "Login Admin E-LAUT",
        "E-LAUT admin",
        "admin pelatihan kelautan",
        "admin pelatihan perikanan",
        "sertifikasi kelautan admin",
        "sertifikasi perikanan admin",
        "BPPSDM KP admin",
        "sistem admin E-LAUT",
        "login admin BPPSDM KP",
        "kelola pelatihan kelautan",
        "kelola pelatihan perikanan",
        "admin awak kapal perikanan",
        "Kementerian Kelautan dan Perikanan admin",
        "kkp admin",
    ],
    author: "BPPSDM KP",
    robots: "noindex, nofollow", // Biasanya halaman login tidak diindeks
    canonical: "https://elaut-bppsdm.kkp.go.id/",
    openGraph: {
        title: "Login Admin E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
        description:
            "Halaman login admin E-LAUT, layanan elektronik dari BPPSDM KP untuk mengelola pelatihan dan sertifikasi di sektor Kelautan dan Perikanan.",
        url: "https://elaut-bppsdm.kkp.go.id/",
        type: "website",
        site_name: "E-LAUT Admin",
        images: [
            {
                url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
                width: 1200,
                height: 630,
                alt: "Login Admin E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Login Admin E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
        description:
            "Halaman login admin E-LAUT, layanan elektronik dari BPPSDM KP untuk mengelola pelatihan dan sertifikasi di sektor Kelautan dan Perikanan.",
        site: "https://elaut-bppsdm.kkp.go.id/",
        images: [
            {
                url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s",
                alt: "Login Admin E-LAUT - Elektronik Layanan Pelatihan Utama Terpadu",
            },
        ],
    },
};

export default function page() {
    return (
        <>
            <LoginAdminELAUT />
        </>
    );
}

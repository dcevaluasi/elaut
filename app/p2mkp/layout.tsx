import { Metadata } from "next";

export const metadata: Metadata = {
    title: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT",
    description:
        "Portal resmi P2MKP (Pusat Pelatihan Mandiri Kelautan dan Perikanan). Daftarkan lembaga mandiri anda untuk bergabung dalam ekosistem pelatihan kelautan dan perikanan terpadu BPPSDM KP Kementerian Kelautan dan Perikanan.",
    keywords: [
        "P2MKP",
        "Pusat Pelatihan Mandiri Kelautan dan Perikanan",
        "KKP",
        "BPPSDM KP",
        "Pelatihan Mandiri",
        "Sertifikasi P2MKP",
        "Pelatihan Perikanan",
        "Permen KP No. 18 Tahun 2024",
        "Mandiri Kelautan Perikanan",
    ],
    openGraph: {
        title: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT",
        description:
            "Wujudkan kemandirian masyarakat dalam meningkatkan kapasitas SDM melalui pelatihan kelautan dan perikanan yang aplikatif.",
        url: "https://elaut-bppsdm.kkp.go.id/p2mkp",
        siteName: "E-LAUT",
        locale: "id_ID",
        type: "website",
        images: [
            {
                url: "/images/hero-img6.jpg",
                width: 1200,
                height: 630,
                alt: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT",
        description:
            "Portal pendaftaran dan informasi P2MKP resmi Kementerian Kelautan dan Perikanan.",
        images: ["/images/hero-img6.jpg"],
    },
    alternates: {
        canonical: "https://elaut-bppsdm.kkp.go.id/p2mkp",
    },
};

export default function P2MKPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan",
        "description": "Lembaga diklat mandiri yang dikelola oleh pelaku utama perikanan profesional untuk penciptaan wirausaha baru di sektor kelautan.",
        "url": "https://elaut-bppsdm.kkp.go.id/p2mkp",
        "logo": "https://elaut-bppsdm.kkp.go.id/logo-kkp.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Jakarta",
            "addressCountry": "ID"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}

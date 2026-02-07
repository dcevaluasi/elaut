import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Regulasi Pelatihan Kelautan dan Perikanan | E-LAUT",
    description:
        "Akses pusat data regulasi, peraturan menteri, keputusan menteri, dan landasan hukum penyelenggaraan pelatihan kelautan dan perikanan terpadu Indonesia.",
    keywords: [
        "Regulasi Pelatihan",
        "Peraturan Menteri KKP",
        "Hukum Kelautan Indonesia",
        "P2MKP Regulasi",
        "Sertifikasi Perikanan Hukum",
        "Layanan Hukum KKP",
        "Permen KP",
        "Kepmen KP",
        "E-LAUT Regulasi"
    ],
    openGraph: {
        title: "Regulasi Pelatihan Kelautan dan Perikanan | E-LAUT",
        description:
            "Unduh dan pelajari landasan hukum serta peraturan terbaru di sektor kelautan dan perikanan melalui portal E-LAUT.",
        url: "https://elaut-bppsdm.kkp.go.id/layanan/regulasi",
        siteName: "E-LAUT",
        locale: "id_ID",
        type: "website",
        images: [
            {
                url: "/images/hero-img6.jpg",
                width: 1200,
                height: 630,
                alt: "Repository Regulasi Pelatihan E-LAUT",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Regulasi Pelatihan Kelautan dan Perikanan | E-LAUT",
        description:
            "Pusat Repository Regulasi & Peraturan Pelatihan Kelautan dan Perikanan Indonesia.",
        images: ["/images/hero-img6.jpg"],
    },
    alternates: {
        canonical: "https://elaut-bppsdm.kkp.go.id/layanan/regulasi",
    },
};

export default function RegulasiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Regulasi Pelatihan Kelautan dan Perikanan - E-LAUT",
        "description": "Daftar peraturan dan kebijakan resmi sektor kelautan dan perikanan.",
        "publisher": {
            "@type": "GovernmentOrganization",
            "name": "Kementerian Kelautan dan Perikanan RI"
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

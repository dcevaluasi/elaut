import { Metadata } from "next";

export const metadata: Metadata = {
    title: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT",
    description:
        "Portal resmi pendaftaran, penetapan, dan klasifikasi P2MKP (Pusat Pelatihan Mandiri Kelautan dan Perikanan). Bergabunglah dalam ekosistem pelatihan terpadu BPPSDM KP Kementerian Kelautan dan Perikanan.",
    keywords: [
        "P2MKP",
        "Pusat Pelatihan Mandiri Kelautan dan Perikanan",
        "KKP",
        "Kementerian Kelautan dan Perikanan",
        "BPPSDM KP",
        "Pelatihan Mandiri",
        "Sertifikasi P2MKP",
        "Pelatihan Perikanan",
        "Permen KP No. 18 Tahun 2024",
        "Mandiri Kelautan Perikanan",
        "Pendaftaran P2MKP",
        "Klasifikasi P2MKP",
        "Wirausaha Perikanan",
        "SDM Kelautan",
        "Balai Pelatihan Perikanan",
        "E-LAUT P2MKP",
    ],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        title: "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT",
        description:
            "Wujudkan kemandirian masyarakat melalui pelatihan kelautan dan perikanan sesuai Permen KP No. 18 Tahun 2024. Portal resmi pendaftaran P2MKP.",
        url: "https://elaut-bppsdm.kkp.go.id/p2mkp",
        siteName: "E-LAUT KKP",
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
            "Portal pendaftaran dan informasi P2MKP resmi Kementerian Kelautan dan Perikanan RI.",
        images: ["/images/hero-img6.jpg"],
        site: "@kkpgoid",
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
        "@graph": [
            {
                "@type": "EducationalOrganization",
                "@id": "https://elaut-bppsdm.kkp.go.id/p2mkp/#organization",
                "name": "P2MKP - Pusat Pelatihan Mandiri Kelautan dan Perikanan",
                "description": "Lembaga diklat mandiri yang dikelola oleh pelaku utama perikanan profesional untuk penciptaan wirausaha baru di sektor kelautan dan perikanan Indonesia.",
                "url": "https://elaut-bppsdm.kkp.go.id/p2mkp",
                "logo": "https://elaut-bppsdm.kkp.go.id/logo-kkp.png",
                "parentOrganization": {
                    "@type": "GovernmentOrganization",
                    "name": "Kementerian Kelautan dan Perikanan Republik Indonesia",
                    "url": "https://www.kkp.go.id"
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Jakarta",
                    "addressCountry": "ID"
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://elaut-bppsdm.kkp.go.id/p2mkp/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://elaut-bppsdm.kkp.go.id"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "P2MKP",
                        "item": "https://elaut-bppsdm.kkp.go.id/p2mkp"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Apa itu P2MKP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP) adalah lembaga pelatihan kelautan dan perikanan mandiri yang dibentuk, dikelola, dan dilaksanakan oleh pelaku usaha di sektor kelautan dan perikanan."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Dasar hukum apa yang mengatur P2MKP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "P2MKP diatur berdasarkan Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Apa saja tahapan penetapan P2MKP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Tahapan penetapan meliputi: Persiapan (asesmen mandiri), Verifikasi (administrasi), Visitasi (peninjauan lapangan), dan Penetapan (penerbitan sertifikat resmi)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Berapa lama berlakunya sertifikat penetapan P2MKP?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Penetapan P2MKP berlaku selama 2 (dua) tahun atau sampai dengan diterbitkannya sertifikat klasifikasi P2MKP."
                        }
                    }
                ]
            }
        ]
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

import type { Metadata } from "next";
import Footer from "@/components/ui/footer";
import { elautBaseUrl } from "@/constants/urls";
import type { P2MKP } from "@/types/p2mkp";
import { isApproved, normalizeProvinsi } from "./utils";
import P2MKPClient from "./P2MKPClient";

/** Sama dengan REGISTER_ROUTE di P2MKPClient (konstanta dari file "use client" tidak bisa di-import ke server). */
const REGISTER_ROUTE = "/p2mkp/registrasi";

/* ============================ KONSTANTA SEO ============================ */

const SITE = "https://elaut-bppsdm.kkp.go.id";
/** ⚠️ Samakan dengan lokasi file ini di folder app/. */
const PAGE_PATH = "/p2mkp";
const PAGE_URL = `${SITE}${PAGE_PATH}`;
const OG_IMAGE = `${SITE}/images/p2mkp/p2mkp1.jpg`; // TODO: idealnya gambar OG khusus 1200×630

const TITLE = "P2MKP – Pusat Pelatihan Mandiri Kelautan dan Perikanan | Daftar & Sebaran Lembaga – E-LAUT KKP";
const DESCRIPTION =
    "Informasi resmi P2MKP (Pusat Pelatihan Mandiri Kelautan dan Perikanan) dari KKP: syarat & alur pendaftaran lembaga, standar pelayanan, peta sebaran P2MKP di seluruh Indonesia, video, dan FAQ. Daftarkan lembaga pelatihan Anda secara online di E-LAUT.";

export const revalidate = 3600;

export const metadata: Metadata = {
    metadataBase: new URL(SITE),
    title: TITLE,
    description: DESCRIPTION,
    applicationName: "E-LAUT",
    category: "government",
    keywords: [
        "P2MKP",
        "Pusat Pelatihan Mandiri Kelautan dan Perikanan",
        "pendaftaran P2MKP",
        "cara daftar P2MKP",
        "syarat P2MKP",
        "registrasi P2MKP online",
        "daftar lembaga P2MKP",
        "P2MKP terdekat",
        "sebaran P2MKP",
        "lembaga pelatihan perikanan",
        "pelatihan perikanan mandiri",
        "standar pelayanan P2MKP",
        "BPPSDM KP",
        "Puslatluh KP",
        "Kementerian Kelautan dan Perikanan",
        "E-LAUT KKP",
    ],
    authors: [{ name: "BPPSDM KP – Kementerian Kelautan dan Perikanan", url: SITE }],
    creator: "BPPSDM KP",
    publisher: "Kementerian Kelautan dan Perikanan Republik Indonesia",
    alternates: { canonical: PAGE_PATH, languages: { "id-ID": PAGE_PATH } },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
        title: "P2MKP – Pusat Pelatihan Mandiri Kelautan dan Perikanan | E-LAUT KKP",
        description: DESCRIPTION,
        url: PAGE_URL,
        type: "website",
        siteName: "E-LAUT – Elektronik Layanan Pelatihan Utama Terpadu",
        locale: "id_ID",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)" }],
    },
    twitter: { card: "summary_large_image", title: "P2MKP – Pusat Pelatihan Mandiri Kelautan dan Perikanan", description: DESCRIPTION, images: [OG_IMAGE] },
};

/* ============================ DATA ============================ */

/** Ambil lembaga P2MKP yang disetujui (cache 1 jam, batas 6 detik). Gagal → null (client fetch sendiri). */
async function loadApproved(): Promise<P2MKP[] | null> {
    try {
        const res = await fetch(`${elautBaseUrl}/p2mkp/get_p2mkp`, { next: { revalidate }, signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw = json?.data ?? json ?? [];
        return Array.isArray(raw) ? (raw as P2MKP[]).filter((i) => isApproved(i.status)) : null;
    } catch (e) {
        console.error("SSR P2MKP gagal, fallback ke fetch di browser:", e);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nameOf = (p: any): string => p.nama_Ppmkp || p.nama_ppmkp || p.nama || "";

/* ============================ PAGE ============================ */

export default async function P2MKPPage() {
    const list = await loadApproved();
    const lembaga = list ?? [];
    const provinsi = new Set(lembaga.map((i) => normalizeProvinsi(i.provinsi)).filter(Boolean));

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${PAGE_URL}#webpage`,
                url: PAGE_URL,
                name: TITLE,
                description: DESCRIPTION,
                inLanguage: "id-ID",
                isPartOf: { "@type": "WebSite", name: "E-LAUT", url: SITE },
                breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
                about: { "@id": `${PAGE_URL}#service` },
                primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
            },
            {
                "@type": "GovernmentService",
                "@id": `${PAGE_URL}#service`,
                name: "Pendaftaran Pusat Pelatihan Mandiri Kelautan dan Perikanan (P2MKP)",
                alternateName: "P2MKP",
                serviceType: "Penetapan dan pembinaan lembaga pelatihan mandiri",
                description: DESCRIPTION,
                url: PAGE_URL,
                areaServed: { "@type": "Country", name: "Indonesia" },
                availableChannel: { "@type": "ServiceChannel", serviceUrl: `${SITE}${REGISTER_ROUTE}`, name: "Registrasi online E-LAUT" },
                offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
                provider: {
                    "@type": "GovernmentOrganization",
                    name: "Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDM KP)",
                    url: SITE,
                    parentOrganization: { "@type": "GovernmentOrganization", name: "Kementerian Kelautan dan Perikanan Republik Indonesia", url: "https://kkp.go.id" },
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${PAGE_URL}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "P2MKP", item: PAGE_URL },
                ],
            },
            ...(lembaga.length
                ? [
                    {
                        "@type": "ItemList",
                        "@id": `${PAGE_URL}#lembaga`,
                        name: `Daftar ${lembaga.length} lembaga P2MKP di ${provinsi.size} provinsi`,
                        numberOfItems: lembaga.length,
                        itemListElement: lembaga
                            .filter((p) => nameOf(p))
                            .slice(0, 100)
                            .map((p, i) => ({
                                "@type": "ListItem",
                                position: i + 1,
                                item: {
                                    "@type": "EducationalOrganization",
                                    name: nameOf(p),
                                    address: {
                                        "@type": "PostalAddress",
                                        addressLocality: (p as any).kota || undefined,
                                        addressRegion: p.provinsi || undefined,
                                        addressCountry: "ID",
                                    },
                                    memberOf: { "@type": "Organization", name: "P2MKP – Kementerian Kelautan dan Perikanan" },
                                },
                            })),
                    },
                ]
                : []),
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <P2MKPClient initialList={list} />
            <Footer />
        </>
    );
}

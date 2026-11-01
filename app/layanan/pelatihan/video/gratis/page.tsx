import type { Metadata } from "next";
import Footer from "@/components/ui/footer";
import { getAllVideoPelatihans } from "@/utils/videoPelatihan";
import { extractYoutubeId } from "@/utils/videos";
import VideoGratisClient from "./VideoGratisClient";
import { ChevronDown } from "lucide-react";

/* ============================ KONSTANTA ============================ */

const SITE = "https://elaut-bppsdm.kkp.go.id";
/** ⚠️ Samakan dengan lokasi file ini di folder app/. */
const PAGE_PATH = "/video-pelatihan";
const PAGE_URL = `${SITE}${PAGE_PATH}`;
/** TODO: gambar OG sendiri 1200×630 di /public. */
const OG_IMAGE = `${SITE}/images/og-video-pelatihan.png`;

const TITLE = "Video Pelatihan Gratis Kelautan & Perikanan – Belajar Online | E-LAUT KKP";
const DESCRIPTION =
    "Tonton ratusan video pelatihan gratis Kelautan dan Perikanan dari KKP: budidaya ikan & udang, pengolahan hasil perikanan, penangkapan, mesin perikanan, hingga kewirausahaan. Belajar online kapan saja di E-LAUT.";

/* ============================ DATA (cache server) ============================ */

type RawVideo = Record<string, any>;
let cache: { at: number; data: RawVideo[] } | null = null;
const TTL = 10 * 60 * 1000;

/** Ambil video (cache 10 menit, batas waktu 6 detik agar halaman tidak tertahan). */
async function loadVideos(): Promise<RawVideo[] | null> {
    if (cache && Date.now() - cache.at < TTL) return cache.data;
    try {
        const data = await Promise.race([getAllVideoPelatihans(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000))]);
        // JSON round-trip → objek polos (mis. Timestamp Firestore) agar aman dikirim ke client
        const plain: RawVideo[] = JSON.parse(JSON.stringify(Array.isArray(data) ? data : []));
        cache = { at: Date.now(), data: plain };
        return plain;
    } catch (e) {
        console.error("SSR video gagal, fallback ke fetch di browser:", e);
        return cache?.data ?? null;
    }
}

const ytOf = (v: RawVideo) => extractYoutubeId(v.linkPelatihan ?? "");
const thumbOf = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Tanggal unggah (wajib untuk rich result VideoObject) — dicoba beberapa nama field. */
const uploadDateOf = (v: RawVideo): string | undefined => {
    for (const k of ["createdAt", "created_at", "CreatedAt", "tanggalUpload", "updatedAt"]) {
        const x = v[k];
        if (!x) continue;
        const d = typeof x === "object" && "seconds" in x ? new Date(x.seconds * 1000) : new Date(x);
        if (!isNaN(d.getTime())) return d.toISOString();
    }
    return undefined;
};

/* ============================ METADATA ============================ */

const BASE_META: Metadata = {
    metadataBase: new URL(SITE),
    title: TITLE,
    description: DESCRIPTION,
    applicationName: "E-LAUT",
    category: "education",
    keywords: [
        "video pelatihan gratis",
        "video pelatihan perikanan",
        "video pelatihan kelautan",
        "pelatihan online KKP",
        "belajar budidaya ikan",
        "video budidaya udang",
        "video budidaya lele",
        "pelatihan pengolahan ikan",
        "pelatihan penangkapan ikan",
        "kursus perikanan gratis",
        "e-learning perikanan",
        "pelatihan gratis KKP",
        "BPPSDM KP",
        "E-LAUT KKP",
        "Kementerian Kelautan dan Perikanan",
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
        title: TITLE,
        description: DESCRIPTION,
        url: PAGE_URL,
        type: "website",
        siteName: "E-LAUT – Elektronik Layanan Pelatihan Utama Terpadu",
        locale: "id_ID",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Video Pelatihan Gratis Kelautan dan Perikanan – E-LAUT" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

type SP = { v?: string };

/** Tautan `?v=<id>` → judul, deskripsi & gambar mengikuti video (pratinjau saat dibagikan). */
export async function generateMetadata({ searchParams }: { searchParams?: SP | Promise<SP> }): Promise<Metadata> {
    const sp = (await searchParams) ?? {};
    if (!sp.v) return BASE_META;
    const video = (await loadVideos())?.find((x) => ytOf(x) === sp.v);
    if (!video) return BASE_META;

    const name = video.namaPelatihan ?? "Video pelatihan";
    const desc = (video.descriptionVideo || `Tonton video pelatihan "${name}" secara gratis di E-LAUT KKP.`).slice(0, 160);
    const img = thumbOf(sp.v);
    return {
        ...BASE_META,
        title: `${name} – Video Pelatihan Gratis | E-LAUT KKP`,
        description: desc,
        // canonical tetap ke halaman koleksi agar tidak dianggap konten duplikat
        openGraph: { ...BASE_META.openGraph, type: "video.other", title: name, description: desc, url: `${PAGE_URL}?v=${sp.v}`, images: [{ url: img, width: 480, height: 360, alt: name }], videos: [{ url: `https://www.youtube.com/embed/${sp.v}` }] },
        twitter: { card: "summary_large_image", title: name, description: desc, images: [img] },
    };
}

/* ============================ FAQ (tampil + rich result) ============================ */

const FAQ = [
    { q: "Apakah video pelatihan di E-LAUT benar-benar gratis?", a: "Ya. Seluruh video pelatihan di E-LAUT dapat ditonton gratis tanpa perlu login atau mendaftar." },
    {
        q: "Materi apa saja yang tersedia?",
        a: "Tersedia materi budidaya ikan dan udang, pengolahan dan pemasaran hasil perikanan, penangkapan ikan, mesin perikanan, konservasi, kepelautan, hingga kewirausahaan sektor kelautan dan perikanan.",
    },
    { q: "Siapa penyelenggara video pelatihan ini?", a: "Video disusun oleh Pusat Pelatihan dan Balai Pelatihan di bawah BPPSDM Kementerian Kelautan dan Perikanan bersama instruktur profesional." },
    {
        q: "Apakah menonton video mendapatkan sertifikat?",
        a: "Video bersifat pembelajaran mandiri. Untuk memperoleh sertifikat (STTPL), daftar dan ikuti pelatihan resmi melalui E-LAUT hingga dinyatakan lulus.",
    },
    { q: "Bagaimana cara membagikan video ke teman?", a: "Buka video lalu klik tombol “Bagikan”. Tautan yang dibagikan akan langsung membuka video tersebut di E-LAUT." },
];

/* ============================ PAGE ============================ */

export default async function VideoPelatihanPage() {
    const videos = await loadVideos();
    const list = (videos ?? []).filter((v) => ytOf(v)).slice().reverse(); // terbaru dulu

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${PAGE_URL}#webpage`,
                url: PAGE_URL,
                name: TITLE,
                description: DESCRIPTION,
                inLanguage: "id-ID",
                isPartOf: { "@type": "WebSite", name: "E-LAUT", url: SITE },
                breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
                mainEntity: { "@id": `${PAGE_URL}#videos` },
                publisher: {
                    "@type": "GovernmentOrganization",
                    name: "BPPSDM Kementerian Kelautan dan Perikanan",
                    url: SITE,
                    parentOrganization: { "@type": "GovernmentOrganization", name: "Kementerian Kelautan dan Perikanan Republik Indonesia", url: "https://kkp.go.id" },
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${PAGE_URL}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "Video Pelatihan Gratis", item: PAGE_URL },
                ],
            },
            {
                "@type": "ItemList",
                "@id": `${PAGE_URL}#videos`,
                name: "Video Pelatihan Gratis Kelautan dan Perikanan",
                numberOfItems: list.length,
                itemListElement: list.slice(0, 50).map((v, i) => {
                    const id = ytOf(v);
                    const uploadDate = uploadDateOf(v);
                    return {
                        "@type": "ListItem",
                        position: i + 1,
                        url: `${PAGE_URL}?v=${id}`,
                        item: {
                            "@type": "VideoObject",
                            name: v.namaPelatihan ?? "Video pelatihan",
                            description: v.descriptionVideo || `Video pelatihan ${v.programPelatihan || "kelautan dan perikanan"} oleh ${v.penyelenggara || "BPPSDM KP"}.`,
                            thumbnailUrl: [thumbOf(id)],
                            ...(uploadDate ? { uploadDate } : {}),
                            embedUrl: `https://www.youtube.com/embed/${id}`,
                            contentUrl: `https://www.youtube.com/watch?v=${id}`,
                            inLanguage: "id-ID",
                            isAccessibleForFree: true,
                            genre: v.programPelatihan || v.jenisProgramPelatihan || undefined,
                            ...(v.penyelenggara ? { creator: { "@type": "Organization", name: v.penyelenggara } } : {}),
                        },
                    };
                }),
            },
            {
                "@type": "FAQPage",
                mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

            <VideoGratisClient initialVideos={videos} />

            {/* Konten teks untuk SEO (tetap berguna bagi pengunjung) */}
            <section aria-labelledby="faq-video" className="relative bg-[#020617] font-jakarta text-white">
                <div className="mx-auto max-w-7xl px-4 pb-20 space-y-5">
                    <div>
                        <h2 id="faq-video" className="text-xl md:text-2xl font-calsans">Belajar perikanan & kelautan gratis lewat video</h2>
                        <p className="mt-1 max-w-3xl text-sm text-slate-400 leading-relaxed">
                            E-LAUT menghadirkan koleksi video pelatihan resmi Kementerian Kelautan dan Perikanan untuk nelayan, pembudidaya, pengolah, pelajar, dan masyarakat umum.
                            Pelajari teknik budidaya, pengolahan hasil perikanan, penangkapan, hingga kewirausahaan — kapan saja dan dari mana saja.
                        </p>
                    </div>
                    <div className="grid gap-2.5 md:grid-cols-2">
                        {FAQ.map((f, i) => (
                            <details key={f.q} open={i === 0} className="group rounded-2xl bg-white/[0.04] ring-1 ring-white/10 open:bg-white/[0.06] open:ring-white/20 transition-colors">
                                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                                    <h3 className="text-sm font-bold leading-snug">{f.q}</h3>
                                    <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="px-5 pb-4 -mt-1 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}

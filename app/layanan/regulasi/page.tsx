import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ChevronDown, FileText, Landmark, Scale } from "lucide-react";
import Footer from "@/components/ui/footer";
import { getRegulasi, RegulasiData } from "@/utils/regulasi";
import RegulasiClient from "./RegulasiClient";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PATH = "/layanan/regulasi";
const URL_PAGE = `${SITE}${PATH}`;
const FILE_BASE = "https://elaut-bppsdm.kkp.go.id/api-elaut/public/regulasi_pelatihan/";

export const revalidate = 3600; // harus literal

/** Title 43 kar. (+ " | E-LAUT KKP" = 56), description 150 kar. */
const TITLE = "Regulasi Pelatihan Kelautan & Perikanan KKP";
const DESC = "Kumpulan regulasi pelatihan kelautan dan perikanan KKP: undang-undang, Permen KP, Kepmen KP, dan peraturan BPPSDM KP. Cari dan unduh dokumen resmi.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    keywords: ["regulasi pelatihan KKP", "Permen KP pelatihan", "Kepmen KP", "peraturan BPPSDM KP", "dasar hukum pelatihan perikanan", "regulasi P2MKP", "sertifikasi kompetensi perikanan", "E-LAUT"],
    alternates: { canonical: PATH },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
    openGraph: { type: "website", locale: "id_ID", url: URL_PAGE, siteName: "E-LAUT KKP", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: [{ url: "/images/hero-img6.jpg", width: 1200, height: 630, alt: "Regulasi pelatihan kelautan dan perikanan" }] },
    twitter: { card: "summary_large_image", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: ["/images/hero-img6.jpg"] },
};

async function load(): Promise<RegulasiData[] | null> {
    try {
        return (await getRegulasi()) ?? [];
    } catch {
        return null; // klien coba lagi
    }
}

const FAQ = [
    { q: "Apa dasar hukum penyelenggaraan pelatihan kelautan dan perikanan?", a: "Pelatihan KP berlandaskan undang-undang terkait SDM dan sektor kelautan perikanan, Peraturan Menteri Kelautan dan Perikanan, serta peraturan dan keputusan Kepala BPPSDM KP. Seluruhnya tercantum di daftar regulasi halaman ini." },
    { q: "Bagaimana cara mengunduh dokumen regulasi?", a: "Cari regulasi berdasarkan judul, nomor, atau tahun, lalu pilih Lihat dokumen untuk membuka atau Unduh PDF untuk menyimpan salinan resmi." },
    { q: "Apa arti status Berlaku dan Dicabut?", a: "Berlaku berarti regulasi masih menjadi acuan. Dicabut berarti sudah tidak berlaku dan digantikan regulasi lain yang dijelaskan pada catatan terkait." },
];

export default async function RegulasiPage() {
    const list = await load();
    const items = (list ?? []).slice(0, 100);
    const year = (r: RegulasiData) => (String(r.tahun ?? "").match(/\d{4}/) || [])[0];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "CollectionPage", "@id": `${URL_PAGE}#webpage`, url: URL_PAGE, name: `${TITLE} | E-LAUT KKP`, description: DESC, inLanguage: "id-ID", isPartOf: { "@id": `${SITE}/#website` }, publisher: { "@id": `${SITE}/#organization` }, breadcrumb: { "@id": `${URL_PAGE}#breadcrumb` }, mainEntity: { "@id": `${URL_PAGE}#daftar` } },
            {
                "@type": "BreadcrumbList", "@id": `${URL_PAGE}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "Layanan", item: `${SITE}/layanan` },
                    { "@type": "ListItem", position: 3, name: "Regulasi Pelatihan", item: URL_PAGE },
                ],
            },
            {
                "@type": "ItemList", "@id": `${URL_PAGE}#daftar`, name: "Daftar regulasi pelatihan kelautan dan perikanan", numberOfItems: items.length,
                itemListElement: items.map((r, i) => ({
                    "@type": "ListItem", position: i + 1, url: `${URL_PAGE}#regulasi-${r.id}`,
                    item: {
                        "@type": "Legislation", name: r.judul, legislationIdentifier: `${r.no_peraturan}${r.tahun ? ` Tahun ${r.tahun}` : ""}`, legislationType: r.kategori_regulasi,
                        legislationLegalForce: !r.status || r.status === "Berlaku" ? "https://schema.org/InForce" : "https://schema.org/NotInForce",
                        ...(year(r) ? { legislationDate: year(r) } : {}),
                        legislationJurisdiction: "ID", inLanguage: "id-ID",
                        ...(r.file ? { encoding: { "@type": "MediaObject", contentUrl: r.file.startsWith("http") ? r.file : `${FILE_BASE}${r.file}`, encodingFormat: "application/pdf" } } : {}),
                    },
                })),
            },
            { "@type": "FAQPage", "@id": `${URL_PAGE}#faq`, mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
    };

    const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";

    return (
        <main className="relative isolate min-h-screen flex flex-col overflow-x-clip bg-[#020617] font-jakarta text-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

            {/* Latar statis */}
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(55%_55%_at_15%_0%,#2563EB45_0%,transparent_65%),radial-gradient(45%_45%_at_95%_20%,#6366F12e_0%,transparent_70%)]" />
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_70%)]" />
            <Scale aria-hidden className="pointer-events-none absolute -right-16 top-24 -z-10 h-[420px] w-[420px] rotate-12 text-white/[0.03]" />

            {/* Hero */}
            <header className="mx-auto w-full max-w-7xl px-4 md:px-8 pt-28 md:pt-32 pb-10">
                <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                        <li aria-hidden>/</li>
                        <li><Link href="/layanan" className="hover:text-white">Layanan</Link></li>
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="font-semibold text-sky-200">Regulasi Pelatihan</li>
                    </ol>
                </nav>

                <div className="mt-6 max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80 ring-1 ring-white/10">
                        <Landmark className="h-3.5 w-3.5" /> Repositori hukum BPPSDM KP
                    </p>
                    <h1 className="mt-4 font-calsans text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                        Regulasi{" "}
                        <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Pelatihan</span>
                        <span className="mt-2 block text-xl sm:text-2xl lg:text-3xl font-normal text-blue-100/80">Kelautan &amp; Perikanan</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100/75">
                        Peraturan, keputusan, dan landasan hukum penyelenggaraan pelatihan di lingkungan Kementerian Kelautan dan Perikanan — dari undang-undang hingga peraturan Kepala BPPSDM KP. Cari, baca, dan unduh dokumen resminya di sini.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2">
                        <a href="#daftar-regulasi" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500">
                            <FileText className="h-4 w-4" /> Lihat daftar regulasi
                        </a>
                        <Link href="/layanan/cek-sertifikat" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.06] px-5 text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                            <BadgeCheck className="h-4 w-4 text-emerald-300" /> Cek sertifikat
                        </Link>
                    </div>
                </div>
            </header>

            <RegulasiClient initial={list} />

            {/* FAQ (SSR) */}
            <section aria-labelledby="regulasi-faq" className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-16 space-y-3">
                <h2 id="regulasi-faq" className="font-calsans text-xl md:text-2xl">Pertanyaan seputar regulasi pelatihan</h2>
                <div className="grid gap-2.5 md:grid-cols-3">
                    {FAQ.map((f, i) => (
                        <details key={f.q} open={i === 0} className={`group ${card} open:bg-white/[0.06]`}>
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                                <h3 className="text-sm font-bold leading-snug">{f.q}</h3>
                                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                            </summary>
                            <p className="-mt-1 px-5 pb-4 text-sm leading-relaxed text-slate-400">{f.a}</p>
                        </details>
                    ))}
                </div>
                <p className="pt-4 text-center text-[11px] text-slate-500">Sumber resmi: BPPSDM Kelautan dan Perikanan · Kementerian Kelautan dan Perikanan RI</p>
            </section>

            <Footer />
        </main>
    );
}

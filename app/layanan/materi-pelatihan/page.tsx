import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronDown, Download, GraduationCap, Search } from "lucide-react";
import Footer from "@/components/ui/footer";
import MateriClient from "./MateriClient";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PATH = "/layanan/materi-pelatihan";
const URL_PAGE = `${SITE}${PATH}`;

const TITLE = "Modul & Materi Pelatihan Kelautan Perikanan";
const DESC = "Katalog modul dan materi pelatihan kelautan dan perikanan KKP: budi daya, penangkapan, pengolahan, kelautan, hingga keselamatan. Baca dan unduh PDF gratis.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: PATH },
    keywords: ["modul pelatihan perikanan", "materi pelatihan KKP", "modul budidaya ikan pdf", "bahan ajar kelautan", "modul awak kapal perikanan", "E-LAUT"],
    openGraph: { type: "website", locale: "id_ID", url: URL_PAGE, siteName: "E-LAUT KKP", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: [{ url: "/images/hero-img6.jpg", width: 1200, height: 630, alt: "Modul pelatihan kelautan dan perikanan" }] },
    twitter: { card: "summary_large_image", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: ["/images/hero-img6.jpg"] },
};

const FAQ = [
    { q: "Apakah modul pelatihan bisa diunduh gratis?", a: "Ya. Modul yang dipublikasikan di E-LAUT dapat dibaca langsung di browser dan diunduh dalam format PDF tanpa biaya untuk keperluan belajar." },
    { q: "Siapa yang menyusun modul pelatihan?", a: "Modul disusun dan ditetapkan oleh Pusat Pelatihan Kelautan dan Perikanan BPPSDM KP bersama instruktur dan widyaiswara sesuai standar kompetensi." },
    { q: "Apakah membaca modul sama dengan mengikuti pelatihan?", a: "Tidak. Modul adalah bahan belajar mandiri. Untuk memperoleh sertifikat, ikuti pelatihan resmi melalui menu Program Pelatihan." },
];

export default function MateriPelatihanPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "CollectionPage", "@id": `${URL_PAGE}#webpage`, url: URL_PAGE, name: `${TITLE} | E-LAUT KKP`, description: DESC, inLanguage: "id-ID", isPartOf: { "@id": `${SITE}/#website` }, publisher: { "@id": `${SITE}/#organization` }, breadcrumb: { "@id": `${URL_PAGE}#breadcrumb` }, about: { "@type": "Thing", name: "Pelatihan kelautan dan perikanan" }, isAccessibleForFree: true },
            {
                "@type": "BreadcrumbList", "@id": `${URL_PAGE}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "Layanan", item: `${SITE}/layanan` },
                    { "@type": "ListItem", position: 3, name: "Materi Pelatihan", item: URL_PAGE },
                ],
            },
            { "@type": "FAQPage", "@id": `${URL_PAGE}#faq`, mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
    };
    const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";

    return (
        <main className="relative isolate min-h-screen flex flex-col overflow-x-clip bg-[#020617] font-jakarta text-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(55%_55%_at_15%_0%,#2563EB45_0%,transparent_65%),radial-gradient(45%_45%_at_95%_20%,#F59E0B22_0%,transparent_70%)]" />
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_70%)]" />
            <BookOpen aria-hidden className="pointer-events-none absolute -right-16 top-24 -z-10 h-[420px] w-[420px] rotate-12 text-white/[0.03]" />

            <header className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-28 md:pt-32 pb-10">
                <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                        <li aria-hidden>/</li>
                        <li>Layanan</li>
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="font-semibold text-sky-200">Materi Pelatihan</li>
                    </ol>
                </nav>
                <div className="mt-6 max-w-3xl">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80 ring-1 ring-white/10">
                        <GraduationCap className="h-3.5 w-3.5 text-amber-300" /> Belajar mandiri
                    </p>
                    <h1 className="mt-4 font-calsans text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
                        Modul &amp;{" "}
                        <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Materi Pelatihan</span>
                        <span className="mt-2 block text-xl sm:text-2xl lg:text-3xl font-normal text-blue-100/80">Kelautan &amp; Perikanan</span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm md:text-base leading-relaxed text-blue-100/75">
                        Bahan ajar resmi Pusat Pelatihan KP untuk masyarakat, pelaku usaha, dan taruna — budi daya, penangkapan, pengolahan, kelautan, hingga keselamatan kerja. Baca langsung di browser atau unduh dalam PDF.
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100/75">
                        {[
                            { icon: Search, text: "Cari per bidang" },
                            { icon: BookOpen, text: "Baca tanpa unduh" },
                            { icon: Download, text: "PDF gratis" },
                        ].map((t) => (
                            <li key={t.text} className="inline-flex items-center gap-1.5"><t.icon className="h-4 w-4 text-emerald-300" aria-hidden /> {t.text}</li>
                        ))}
                    </ul>
                </div>
            </header>

            <MateriClient />

            <section aria-labelledby="materi-faq" className="mx-auto w-full max-w-6xl px-4 md:px-8 pb-16 space-y-3">
                <h2 id="materi-faq" className="font-calsans text-xl md:text-2xl">Pertanyaan seputar modul pelatihan</h2>
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
                <p className="pt-2 text-sm text-slate-400">
                    Ingin bersertifikat? <Link href="/layanan/pelatihan/program/perikanan" className="font-bold text-sky-300 hover:text-white">Lihat program pelatihan</Link>.
                </p>
            </section>

            <Footer />
        </main>
    );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Clock, Eye, Handshake, MessageSquareHeart, Scale, ShieldCheck } from "lucide-react";
import Footer from "@/components/ui/footer";
import MaklumatClient from "./MaklumatClient";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PATH = "/layanan/publik/maklumat-pelayanan";
const URL_PAGE = `${SITE}${PATH}`;

const TITLE = "Maklumat Pelayanan Publik E-LAUT KKP";
const DESC = "Maklumat pelayanan E-LAUT KKP: janji dan komitmen layanan pelatihan kelautan dan perikanan yang transparan, profesional, dan sesuai standar pelayanan publik.";
const JANJI = "Dengan ini kami menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan, dan apabila tidak menepati janji ini, kami siap menerima sanksi sesuai ketentuan peraturan perundang-undangan yang berlaku.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: PATH },
    keywords: ["maklumat pelayanan E-LAUT", "maklumat pelayanan KKP", "standar pelayanan publik BPPSDM KP", "janji layanan pelatihan", "pelayanan publik KKP"],
    openGraph: { type: "website", locale: "id_ID", url: URL_PAGE, siteName: "E-LAUT KKP", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: [{ url: "/images/hero-img6.jpg", width: 1200, height: 630, alt: "Maklumat pelayanan E-LAUT KKP" }] },
    twitter: { card: "summary_large_image", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: ["/images/hero-img6.jpg"] },
};

const PRINSIP = [
    { icon: Eye, title: "Transparan", text: "Persyaratan, alur, waktu, dan biaya layanan diumumkan terbuka." },
    { icon: Clock, title: "Tepat waktu", text: "Layanan diselesaikan sesuai jangka waktu pada standar pelayanan." },
    { icon: Scale, title: "Adil & tanpa diskriminasi", text: "Setiap masyarakat dilayani setara tanpa membedakan latar belakang." },
    { icon: Handshake, title: "Bebas gratifikasi", text: "Petugas tidak menerima imbalan di luar ketentuan resmi." },
];

export default function MaklumatPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "WebPage", "@id": `${URL_PAGE}#webpage`, url: URL_PAGE, name: `${TITLE} | E-LAUT KKP`, description: DESC, inLanguage: "id-ID", isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, publisher: { "@id": `${SITE}/#organization` }, breadcrumb: { "@id": `${URL_PAGE}#breadcrumb` } },
            {
                "@type": "BreadcrumbList", "@id": `${URL_PAGE}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "Layanan Publik", item: `${SITE}/layanan/publik` },
                    { "@type": "ListItem", position: 3, name: "Maklumat Pelayanan", item: URL_PAGE },
                ],
            },
        ],
    };
    const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";

    return (
        <main className="relative isolate min-h-screen flex flex-col overflow-x-clip bg-[#020617] font-jakarta text-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(55%_55%_at_15%_0%,#2563EB45_0%,transparent_65%),radial-gradient(45%_45%_at_95%_20%,#10B98126_0%,transparent_70%)]" />
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[760px] opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_70%)]" />
            <ShieldCheck aria-hidden className="pointer-events-none absolute -right-16 top-24 -z-10 h-[420px] w-[420px] rotate-12 text-white/[0.03]" />

            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-28 md:pt-32 pb-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
                {/* Kiri: teks (SSR) */}
                <header className="lg:sticky lg:top-28 lg:self-start space-y-6">
                    <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                            <li aria-hidden>/</li>
                            <li>Layanan Publik</li>
                            <li aria-hidden>/</li>
                            <li aria-current="page" className="font-semibold text-sky-200">Maklumat Pelayanan</li>
                        </ol>
                    </nav>
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80 ring-1 ring-white/10">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" /> Komitmen layanan
                        </p>
                        <h1 className="mt-4 font-calsans text-4xl sm:text-5xl leading-[1.05] tracking-tight">
                            Maklumat{" "}
                            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Pelayanan</span>
                            <span className="mt-2 block text-xl sm:text-2xl font-normal text-blue-100/80">Pusat Pelatihan KP · E-LAUT</span>
                        </h1>
                        <p className="mt-5 text-sm md:text-base leading-relaxed text-blue-100/75">
                            Maklumat pelayanan adalah pernyataan tertulis berisi janji penyelenggara untuk melayani masyarakat sesuai standar pelayanan. Berikut komitmen kami dalam layanan pelatihan kelautan dan perikanan.
                        </p>
                    </div>

                    <blockquote className={`${card} relative overflow-hidden p-5`}>
                        <span aria-hidden className="absolute -left-1 -top-4 font-calsans text-7xl text-white/10">&ldquo;</span>
                        <p className="relative text-sm leading-relaxed text-slate-200">{JANJI}</p>
                        <footer className="mt-3 text-xs font-semibold text-sky-200">— Pusat Pelatihan Kelautan dan Perikanan, BPPSDM KP</footer>
                    </blockquote>

                    <section aria-labelledby="prinsip">
                        <h2 id="prinsip" className="sr-only">Prinsip pelayanan</h2>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {PRINSIP.map((p) => (
                                <li key={p.title} className={`${card} p-4`}>
                                    <p className="flex items-center gap-2 text-sm font-bold"><p.icon className="h-4 w-4 text-emerald-300" aria-hidden /> {p.title}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{p.text}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <Link href="/layanan/publik/masukan-saran" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.06] px-5 text-sm font-bold ring-1 ring-white/15 hover:bg-white/[0.12]">
                        <MessageSquareHeart className="h-4 w-4 text-amber-300" /> Layanan belum sesuai? Sampaikan masukan
                    </Link>
                </header>

                {/* Kanan: dokumen resmi */}
                <section aria-label="Dokumen maklumat pelayanan">
                    <MaklumatClient />
                </section>
            </div>

            <Footer />
        </main>
    );
}

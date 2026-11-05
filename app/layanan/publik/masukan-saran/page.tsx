import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Clock, MessageSquareHeart, ShieldCheck, Sparkles } from "lucide-react";
import Footer from "@/components/ui/footer";
import MasukanSaranForm from "./MasukanSaranForm";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PATH = "/layanan/publik/masukan-saran";
const URL_PAGE = `${SITE}${PATH}`;

const TITLE = "Masukan & Saran Layanan E-LAUT KKP";
const DESC = "Sampaikan masukan, saran, dan penilaian Anda untuk aplikasi E-LAUT KKP. Bantu kami meningkatkan layanan pelatihan kelautan dan perikanan bagi masyarakat.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESC,
    alternates: { canonical: PATH },
    keywords: ["masukan E-LAUT", "saran layanan KKP", "survei kepuasan E-LAUT", "pengaduan pelatihan KKP", "BPPSDM KP"],
    openGraph: { type: "website", locale: "id_ID", url: URL_PAGE, siteName: "E-LAUT KKP", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: [{ url: "/images/hero-img6.jpg", width: 1200, height: 630, alt: "Masukan dan saran E-LAUT" }] },
    twitter: { card: "summary_large_image", title: `${TITLE} | E-LAUT KKP`, description: DESC, images: ["/images/hero-img6.jpg"] },
};

const FAQ = [
    { q: "Apakah masukan saya dibaca?", a: "Ya. Setiap masukan ditinjau tim pengembang E-LAUT BPPSDM KP dan dipakai sebagai bahan evaluasi serta prioritas perbaikan layanan." },
    { q: "Ke mana menyampaikan pengaduan resmi?", a: "Untuk pengaduan pelayanan publik, gunakan Rumah Aspirasi Digital atau Call Center WhatsApp yang tersedia di menu Layanan Publik." },
    { q: "Apakah data saya aman?", a: "Nama dan instansi hanya digunakan untuk keperluan evaluasi layanan dan tidak dipublikasikan." },
];

export default function MasukanSaranPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "ContactPage", "@id": `${URL_PAGE}#webpage`, url: URL_PAGE, name: `${TITLE} | E-LAUT KKP`, description: DESC, inLanguage: "id-ID", isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, breadcrumb: { "@id": `${URL_PAGE}#breadcrumb` } },
            {
                "@type": "BreadcrumbList", "@id": `${URL_PAGE}#breadcrumb`,
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
                    { "@type": "ListItem", position: 2, name: "Layanan Publik", item: `${SITE}/layanan/publik` },
                    { "@type": "ListItem", position: 3, name: "Masukan & Saran", item: URL_PAGE },
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
            <MessageSquareHeart aria-hidden className="pointer-events-none absolute -right-16 top-24 -z-10 h-[420px] w-[420px] rotate-12 text-white/[0.03]" />

            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 pt-28 md:pt-32 pb-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
                {/* Kiri: hero (lengket di desktop) */}
                <header className="lg:sticky lg:top-28 lg:self-start">
                    <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
                        <ol className="flex flex-wrap items-center gap-1.5">
                            <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                            <li aria-hidden>/</li>
                            <li><span>Layanan Publik</span></li>
                            <li aria-hidden>/</li>
                            <li aria-current="page" className="font-semibold text-sky-200">Masukan &amp; Saran</li>
                        </ol>
                    </nav>
                    <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80 ring-1 ring-white/10">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Suara pengguna
                    </p>
                    <h1 className="mt-4 font-calsans text-4xl sm:text-5xl leading-[1.05] tracking-tight">
                        Masukan &amp;{" "}
                        <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Saran</span>
                        <span className="mt-2 block text-xl sm:text-2xl font-normal text-blue-100/80">untuk E-LAUT yang lebih baik</span>
                    </h1>
                    <p className="mt-5 text-sm md:text-base leading-relaxed text-blue-100/75">
                        Ceritakan pengalaman Anda memakai E-LAUT — dari mendaftar pelatihan hingga mengunduh sertifikat. Masukan Anda menjadi dasar perbaikan layanan pelatihan kelautan dan perikanan KKP.
                    </p>
                    <ul className="mt-6 space-y-2 text-sm text-blue-100/80">
                        {[
                            { icon: Clock, text: "Hanya ±2 menit" },
                            { icon: ShieldCheck, text: "Data tidak dipublikasikan" },
                            { icon: MessageSquareHeart, text: "Ditinjau langsung tim pengembang" },
                        ].map((t) => (
                            <li key={t.text} className="flex items-center gap-2"><t.icon className="h-4 w-4 text-emerald-300" aria-hidden /> {t.text}</li>
                        ))}
                    </ul>
                </header>

                {/* Kanan: form */}
                <div>
                    <MasukanSaranForm />
                </div>
            </div>

            <section aria-labelledby="ms-faq" className="mx-auto w-full max-w-6xl px-4 md:px-8 pb-16 space-y-3">
                <h2 id="ms-faq" className="font-calsans text-xl md:text-2xl">Pertanyaan umum</h2>
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
            </section>

            <Footer />
        </main>
    );
}

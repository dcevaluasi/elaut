import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/hero";
import Footer from "@/components/ui/footer";
import MarqueeLogos from "@/components/marquee-logos";
import AnnouncementPopup from "@/components/announcement-popup";
import { ArrowRight, Award, BookOpen, ChevronDown, ShieldCheck, Users, Video } from "lucide-react";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const OG_IMAGE = "/images/hero-img6.jpg";
const TITLE = "E-LAUT KKP: Pelatihan Kelautan dan Perikanan";
const DESCRIPTION =
  "Daftar pelatihan kelautan dan perikanan resmi KKP di E-LAUT: budidaya, awak kapal perikanan, e-learning, P2MKP. Online, sertifikat ber-TTE.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/", languages: { "id-ID": "/" } },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE,
    siteName: "E-LAUT KKP",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "E-LAUT — platform pelatihan kelautan dan perikanan KKP" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const PROGRAMS = [
  { name: "Pelatihan Perikanan", path: "/layanan/pelatihan/program/perikanan", desc: "Budidaya, penangkapan, pengolahan, dan pemasaran hasil perikanan." },
  { name: "Pelatihan Awak Kapal Perikanan (AKP)", path: "/layanan/pelatihan/program/akp", desc: "Keahlian dan keterampilan awak kapal: navigasi, permesinan, keselamatan di laut." },
  { name: "Pelatihan Kelautan", path: "/layanan/pelatihan/program/kelautan", desc: "Konservasi, pengelolaan sumber daya pesisir, dan teknologi kelautan." },
];

const SERVICES = [
  { icon: BookOpen, title: "Pelatihan terstandar", text: "Modul sesuai standar kompetensi kerja nasional, daring maupun luring.", href: "/pelatihan", cta: "Cari jadwal pelatihan" },
  { icon: Award, title: "Sertifikat ber-TTE", text: "STTPL resmi ditandatangani elektronik melalui BSrE dan bisa diverifikasi.", href: "/layanan/cek-sertifikat", cta: "Cek keaslian sertifikat" },
  { icon: Video, title: "Video pelatihan gratis", text: "Ratusan video budidaya, pengolahan, dan penangkapan tanpa login.", href: "/video-pelatihan", cta: "Tonton video pelatihan" },
  { icon: Users, title: "Kemitraan P2MKP", text: "Pusat Pelatihan Mandiri Kelautan dan Perikanan untuk pelaku usaha.", href: "/p2mkp", cta: "Cara menjadi P2MKP" },
];

const FAQ = [
  { q: "Apa itu E-LAUT?", a: "E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu) adalah platform resmi BPPSDM Kementerian Kelautan dan Perikanan untuk pendaftaran pelatihan, e-learning, sertifikasi kompetensi, dan kemitraan P2MKP." },
  { q: "Bagaimana cara mendaftar pelatihan di E-LAUT?", a: "Buat akun dengan NIK, email, dan nomor ponsel aktif, pilih pelatihan sesuai bidang dan jadwal, lalu ikuti materi hingga mendapatkan sertifikat." },
  { q: "Apakah pelatihan di E-LAUT gratis?", a: "Sebagian besar pelatihan yang diselenggarakan KKP tidak dipungut biaya. Informasi biaya, bila ada, dicantumkan pada detail tiap pelatihan." },
  { q: "Bagaimana cara cek sertifikat pelatihan KKP?", a: "Gunakan layanan Cek Sertifikat dengan nomor STTPL atau NIK, lalu validasi tanda tangan elektroniknya di portal BSrE." },
  { q: "Pelatihan apa saja yang tersedia?", a: "Pelatihan perikanan (budidaya, pengolahan, penangkapan), pelatihan awak kapal perikanan, pelatihan kelautan, sistem jaminan mutu, dan program khusus ekonomi biru." },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}/#webpage`,
        url: SITE,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#organization` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${OG_IMAGE}` },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE}/#program`,
        name: "Program pelatihan E-LAUT",
        itemListElement: PROGRAMS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE}${p.path}` })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}/#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <AnnouncementPopup />
      <main>
        <Hero />

        {/* ===== Konten SSR untuk mesin pencari & pengunjung ===== */}
        <section aria-labelledby="tentang-elaut" className="relative bg-[#020617] font-jakarta text-white">
          <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 space-y-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300/80">Tentang E-LAUT</p>
                <h2 id="tentang-elaut" className="font-calsans text-2xl md:text-4xl leading-tight">
                  Platform pelatihan kelautan dan perikanan resmi KKP
                </h2>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                  E-LAUT dikelola Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDM KP) bersama Pusat dan Balai Pelatihan di seluruh Indonesia.
                  Nelayan, pembudidaya, pengolah, taruna, hingga pelaku usaha dapat mendaftar pelatihan, belajar daring, dan memperoleh sertifikat kompetensi ber-TTE dalam satu tempat.
                </p>
                <Link href="/tentang" className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 hover:text-white">
                  Selengkapnya tentang E-LAUT <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <ul className="grid gap-2.5">
                {PROGRAMS.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="group flex items-start gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 hover:bg-white/[0.08] transition-colors">
                      <ShieldCheck className="w-5 h-5 mt-0.5 text-sky-300 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold group-hover:text-sky-200">{p.name}</span>
                        <span className="block text-xs text-slate-400">{p.desc}</span>
                      </span>
                      <ArrowRight className="ml-auto w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SERVICES.map((s) => (
                <article key={s.title} className="flex flex-col rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                  <s.icon className="w-6 h-6 text-sky-300" />
                  <h3 className="mt-3 text-base font-bold">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{s.text}</p>
                  <Link href={s.href} className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-300 hover:text-white">
                    {s.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="font-calsans text-xl md:text-2xl">Pertanyaan seputar pelatihan KKP</h2>
              <div className="grid gap-2.5 md:grid-cols-2">
                {FAQ.map((f, i) => (
                  <details key={f.q} open={i === 0} className="group rounded-2xl bg-white/[0.04] ring-1 ring-white/10 open:bg-white/[0.06]">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <h3 className="text-sm font-bold leading-snug">{f.q}</h3>
                      <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-4 -mt-1 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarqueeLogos />
      </main>
      <Footer />
    </>
  );
}

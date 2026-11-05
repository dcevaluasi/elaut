import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, ChevronDown, Search, ShieldCheck, Wallet } from "lucide-react";
import { AKP_CERTIFICATIONS, AQUACULTURE_CERTIFICATIONS, OCEAN_CERTIFICATIONS } from "@/constants/serkom";
import Footer from "@/components/ui/footer";
import JadwalPelatihan from "./JadwalPelatihan";

// Harus sama dengan ID di JadwalPelatihan.tsx (konstanta dari file "use client" tidak bisa diimpor ke Server Component)
const SEARCH_FORM_ID = "hp-search";
const SEARCH_INPUT_ID = "hp-q";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const BASE = "/layanan/pelatihan/program";
const IMG = "/images/program-pelatihan/dummies";
const SLIDE_S = 6;

type ProgramInfo = {
  name: string; label: string; jenisProgram: string; title: string; description: string; tagline: string; intro: string;
  icon: string; accent: string; images: string[]; certs: readonly string[]; topics: string[]; faq: { q: string; a: string }[];
};

/** Title ≤ 47 kar. (+ " | E-LAUT KKP" ≈ 60), description 140–160 kar. */
const PROGRAMS: Record<string, ProgramInfo> = {
  perikanan: {
    name: "Pelatihan Perikanan",
    label: "Perikanan",
    jenisProgram: "Perikanan",
    title: "Pelatihan Perikanan KKP: Budidaya & Pengolahan",
    description: "Daftar pelatihan perikanan KKP: budidaya ikan dan udang, pengolahan, pemasaran, hingga sistem jaminan mutu. Cari jadwal dan daftar online di E-LAUT.",
    tagline: "Budi daya ikan & udang, pengolahan, pemasaran, hingga sistem jaminan mutu — praktik langsung bersama instruktur KKP dan berujung sertifikat kompetensi.",
    intro: "Pelatihan perikanan E-LAUT membekali nelayan, pembudidaya, pengolah, dan pelaku usaha dengan keterampilan teknis sesuai standar kompetensi, diselenggarakan Pusat dan Balai Pelatihan KKP di seluruh Indonesia.",
    icon: "/icons/icperikanan.png",
    accent: "#06B6D4",
    images: ["perikanan", "perikanan-2", "perikanan-3", "perikanan-5", "perikanan-7", "perikanan-6"].map((f) => `${IMG}/perikanan/${f}.jpg`),
    certs: AQUACULTURE_CERTIFICATIONS,
    topics: ["Budi daya ikan & udang", "Pengolahan & pemasaran hasil perikanan", "Sistem jaminan mutu (HACCP, CPIB, CBIB)", "Kampung Nelayan Merah Putih", "Rekayasa, enumerator & koperasi"],
    faq: [
      { q: "Siapa yang bisa ikut pelatihan perikanan?", a: "Masyarakat umum, pelaku utama dan pelaku usaha perikanan, serta taruna satuan pendidikan KP sesuai persyaratan tiap pelatihan." },
      { q: "Apakah pelatihan perikanan gratis?", a: "Sebagian besar pelatihan yang diselenggarakan KKP tidak dipungut biaya. Informasi biaya, bila ada, dicantumkan pada detail pelatihan." },
    ],
  },
  akp: {
    name: "Pelatihan Awak Kapal Perikanan",
    label: "Awak Kapal Perikanan",
    jenisProgram: "Awak Kapal Perikanan",
    title: "Pelatihan Awak Kapal Perikanan (AKP) KKP",
    description: "Diklat dan sertifikasi Awak Kapal Perikanan (AKP) KKP: pembentukan, peningkatan, dan updating keahlian, BSTF, ANKAPIN, ATKAPIN. Daftar online di E-LAUT.",
    tagline: "Diklat pembentukan, peningkatan, dan updating keahlian awak kapal — penangkapan, navigasi, permesinan, dan keselamatan di laut dengan sertifikat resmi.",
    intro: "Pelatihan Awak Kapal Perikanan menyiapkan awak kapal yang kompeten dan bersertifikat — mulai pembentukan keahlian, peningkatan, hingga updating — untuk mendukung modernisasi kapal perikanan nasional.",
    icon: "/icons/icawak.png",
    accent: "#3B82F6",
    images: [1, 2, 3, 4, 5, 6].map((n) => `${IMG}/akp/akp-${n}.${n === 3 ? "JPG" : "jpg"}`),
    certs: AKP_CERTIFICATIONS,
    topics: ["Penangkapan & alat tangkap ikan", "Permesinan & mekanisasi", "Pengawasan & kepelabuhanan perikanan", "Pembentukan, peningkatan & updating keahlian AKP", "Basic Safety Training Fisheries (BSTF)"],
    faq: [
      { q: "Apa itu sertifikasi Awak Kapal Perikanan?", a: "Sertifikasi kompetensi yang wajib dimiliki awak kapal perikanan sesuai jabatan dan ukuran kapal, diterbitkan melalui diklat KKP." },
      { q: "Di mana mengecek sertifikat AKP?", a: "Sertifikat Awak Kapal Perikanan dicek melalui portal AKAPI (akapi.kkp.go.id); sertifikat pelatihan lain melalui layanan Cek Sertifikat E-LAUT." },
    ],
  },
  kelautan: {
    name: "Pelatihan Kelautan",
    label: "Kelautan",
    jenisProgram: "Kelautan",
    title: "Pelatihan Kelautan KKP: Konservasi & Ruang Laut",
    description: "Pelatihan kelautan KKP: konservasi, mitigasi, garam, oseanografi, iklim, dan marine debris. Tingkatkan kompetensi pengelolaan laut, daftar online di E-LAUT.",
    tagline: "Konservasi, mitigasi bencana pesisir, garam, oseanografi, hingga penanganan marine debris untuk pengelolaan laut yang berkelanjutan.",
    intro: "Pelatihan kelautan mengembangkan kompetensi pengelolaan sumber daya pesisir dan laut, konservasi, serta teknologi kelautan untuk mendukung ekonomi biru yang berkelanjutan.",
    icon: "/icons/ickelautan.png",
    accent: "#6366F1",
    images: ["kelautan", "kelautan-2", "kelautan-3", "kelautan-4", "kelautan-5", "kelautan-6"].map((f) => `${IMG}/kelautan/${f}.jpg`),
    certs: OCEAN_CERTIFICATIONS,
    topics: ["Konservasi & kemitigasian", "Garam & oseanografi", "Biologi laut & perubahan iklim", "Penanganan marine debris", "Pengelolaan ruang laut"],
    faq: [
      { q: "Untuk siapa pelatihan kelautan?", a: "Masyarakat pesisir, kelompok konservasi, penyuluh, aparatur, dan pelaku usaha yang bergerak di bidang kelautan." },
      { q: "Apakah ada sertifikat setelah pelatihan kelautan?", a: "Ya. Peserta yang menyelesaikan pelatihan memperoleh STTPL ber-TTE yang dapat diverifikasi di layanan Cek Sertifikat E-LAUT." },
    ],
  },
};
const ORDER = ["perikanan", "akp", "kelautan"] as const;

/** Folder: app/layanan/pelatihan/program/[slug] */
type Params = { slug: string };
const getSlug = async (params: Params | Promise<Params>) => String((await params)?.slug ?? "").toLowerCase();

export const dynamicParams = false; // slug selain di atas → 404
export function generateStaticParams() {
  return Object.keys(PROGRAMS).map((slug) => ({ slug })); // kunci harus sama dengan nama folder [slug]
}

export async function generateMetadata({ params }: { params: Params | Promise<Params> }): Promise<Metadata> {
  const slug = await getSlug(params);
  const p = PROGRAMS[slug];
  if (!p) return {};
  const path = `${BASE}/${slug}`;
  const ogTitle = `${p.title} | E-LAUT KKP`;
  return {
    title: p.title,
    description: p.description,
    keywords: [p.name, `jadwal ${p.name.toLowerCase()}`, `sertifikasi ${p.label.toLowerCase()}`, "pelatihan KKP", "E-LAUT", "BPPSDM KP", ...p.topics],
    alternates: { canonical: path },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: { type: "website", locale: "id_ID", url: `${SITE}${path}`, siteName: "E-LAUT KKP", title: ogTitle, description: p.description, images: [{ url: p.images[0], width: 1200, height: 630, alt: `${p.name} KKP` }] },
    twitter: { card: "summary_large_image", title: ogTitle, description: p.description, images: [p.images[0]] },
  };
}

export default async function ProgramPelatihanPage({ params }: { params: Params | Promise<Params> }) {
  const slug = await getSlug(params);
  const p = PROGRAMS[slug];
  if (!p) notFound();
  const url = `${SITE}${BASE}/${slug}`;
  const cycle = p.images.length * SLIDE_S;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: `${p.title} | E-LAUT KKP`, description: p.description, inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${p.images[0]}` },
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${url}?q={search_term_string}` }, "query-input": "required name=search_term_string" },
        mainEntity: { "@id": `${url}#sertifikasi` },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
          { "@type": "ListItem", position: 2, name: "Program Pelatihan", item: `${SITE}/#program-pelatihan` },
          { "@type": "ListItem", position: 3, name: p.name, item: url },
        ],
      },
      {
        "@type": "ItemList", "@id": `${url}#sertifikasi`, name: `Sertifikasi kompetensi ${p.label}`, numberOfItems: p.certs.length,
        itemListElement: p.certs.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "EducationalOccupationalCredential", name: c, credentialCategory: "Sertifikat kompetensi", recognizedBy: { "@id": `${SITE}/#organization` } } })),
      },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";
  const eyebrow = "text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80";

  return (
    <main className="min-h-screen flex flex-col bg-[#020617] font-jakarta text-white overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <style>{`
        @keyframes pp-fade{0%{opacity:0}3%{opacity:1}${((100 / p.images.length) + 3).toFixed(1)}%{opacity:1}${((100 / p.images.length) + 6).toFixed(1)}%{opacity:0}100%{opacity:0}}
        @keyframes pp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      {/* ═════════ HERO (SSR penuh) ═════════ */}
      <header className="relative isolate">
        <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(55% 60% at 15% 0%, ${p.accent}45 0%, transparent 65%), radial-gradient(45% 50% at 95% 25%, #0EA5E92e 0%, transparent 70%)` }} />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_70%)]" />
        <Image aria-hidden src={p.icon} alt="" width={520} height={520} className="pointer-events-none absolute -right-24 top-24 -z-10 w-[420px] md:w-[520px] rotate-12 opacity-[0.05] grayscale" />

        <div className="mx-auto w-full max-w-7xl px-4 md:px-8 pt-28 md:pt-32 pb-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-white">Beranda</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/#program-pelatihan" className="hover:text-white">Program Pelatihan</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-semibold text-sky-200">{p.name}</li>
            </ol>
          </nav>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Kiri */}
            <div className="lg:col-span-7">
              <nav aria-label="Pilih program pelatihan" className="-mx-4 px-4 overflow-x-auto [scrollbar-width:none]">
                <ul className="inline-flex gap-1 p-1 rounded-2xl bg-[#0B1B3F]/80 backdrop-blur ring-1 ring-white/10">
                  {ORDER.map((k) => {
                    const on = k === slug;
                    const o = PROGRAMS[k];
                    return (
                      <li key={k}>
                        <Link href={`${BASE}/${k}`} aria-current={on ? "page" : undefined} title={o.name}
                          className={`relative isolate overflow-hidden inline-flex items-center gap-2 h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap ring-1 transition-all ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`}>
                          {on && <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${o.accent}55 0%, transparent 85%)` }} />}
                          <Image src={o.icon} alt="" width={20} height={20} className="w-5 h-5 object-contain" />
                          {o.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <h1 className="mt-7 font-calsans text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] tracking-tight">
                Pelatihan{" "}
                <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">{p.label}</span>
                <span className="block mt-2 text-xl sm:text-2xl lg:text-3xl font-normal text-blue-100/80">resmi &amp; bersertifikat dari KKP</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm md:text-base leading-relaxed text-blue-100/75">{p.tagline}</p>

              {/* Cari — berfungsi tanpa JS (GET ?q=), disempurnakan oleh JadwalPelatihan */}
              <form id={SEARCH_FORM_ID} role="search" action={`${BASE}/${slug}#cari-pelatihan`} method="get"
                className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-[#0B1B3F]/80 backdrop-blur p-1.5 ring-1 ring-white/10 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.8)] focus-within:ring-2 focus-within:ring-sky-400/60">
                <label htmlFor={SEARCH_INPUT_ID} className="sr-only">Cari jadwal {p.name.toLowerCase()}</label>
                <Search className="ml-3 w-5 h-5 shrink-0 text-blue-100/50" aria-hidden />
                <input id={SEARCH_INPUT_ID} name="q" type="search" autoComplete="off" placeholder="Cari nama pelatihan, lokasi, atau lemdiklat…"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white border-none placeholder:text-blue-100/40 outline-none" />
                <button type="submit" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500">
                  <span className="hidden sm:inline">Cari jadwal</span> <ArrowRight className="w-4 h-4" aria-hidden />
                </button>
              </form>

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100/75">
                {[
                  { icon: BadgeCheck, text: "STTPL ber-TTE & terverifikasi" },
                  { icon: Wallet, text: "Banyak pelatihan" },
                  { icon: ShieldCheck, text: "Instruktur & lembaga resmi KKP" },
                ].map((t) => (
                  <li key={t.text} className="inline-flex items-center gap-1.5"><t.icon className="w-4 h-4 text-emerald-300" aria-hidden />{t.text}</li>
                ))}
              </ul>
            </div>

            {/* Kanan: galeri (crossfade CSS murni, tanpa JS) */}
            <div className="relative lg:col-span-5">
              <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] blur-3xl opacity-60" style={{ background: `radial-gradient(closest-side, ${p.accent}66, transparent)` }} />
              <figure className="relative aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-white/15 shadow-[0_40px_100px_-40px_rgba(37,99,235,0.8)]">
                <Image src={p.images[0]} alt={`Peserta ${p.name.toLowerCase()} KKP saat praktik`} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                {p.images.slice(1).map((src, i) => (
                  <Image key={src} src={src} alt="" aria-hidden fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-0 motion-reduce:hidden"
                    style={{ animation: `pp-fade ${cycle}s linear infinite`, animationDelay: `${(i + 1) * SLIDE_S - 1}s` }} />
                ))}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/10 to-transparent" />
                <figcaption className="sr-only">Dokumentasi kegiatan {p.name.toLowerCase()} di Lemdiklat KP</figcaption>
              </figure>

              {/* Kartu mengambang */}
              <div className="absolute -left-3 sm:-left-6 bottom-8 rounded-2xl bg-[#0B1B3F]/85 backdrop-blur px-4 py-3 ring-1 ring-white/15 shadow-2xl motion-safe:[animation:pp-float_6s_ease-in-out_infinite]">
                <p className={eyebrow}>Pelatihan</p>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold"><BadgeCheck className="w-4 h-4 text-emerald-300" aria-hidden /> {p.certs.length} program</p>
              </div>
              <div className="absolute -right-2 sm:-right-4 top-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 shadow-2xl motion-safe:[animation:pp-float_7s_ease-in-out_infinite_1s]">
                <Image src={p.icon} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </div>
            </div>
          </div>

          {/* Sertifikasi (teks terindeks + gerak CSS) */}
          {p.certs.length > 0 && (
            <section aria-labelledby="program-sertifikasi" className="mt-12">
              <h2 id="program-sertifikasi" className={`${eyebrow} mb-3 text-center`}>Sertifikasi kompetensi {p.label.toLowerCase()}</h2>
              <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
                <div className="flex w-max gap-2 px-2 group-hover:[animation-play-state:paused] motion-reduce:!animate-none" style={{ animation: `pp-marquee ${Math.max(30, p.certs.length * 4)}s linear infinite` }}>
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="flex gap-2" aria-hidden={copy === 1 || undefined}>
                      {p.certs.map((c) => (
                        <li key={`${copy}-${c}`} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-3.5 py-2 text-xs md:text-sm font-semibold whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} aria-hidden /> {c}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </header>

      {/* ═════════ JADWAL (klien) ═════════ */}
      <JadwalPelatihan jenisProgram={p.jenisProgram} accent={p.accent} />

      {/* ═════════ TENTANG + FAQ (SSR) ═════════ */}
      <section aria-labelledby="program-intro" className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-6">
        <div className={`${card} p-5 md:p-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]`}>
          <div>
            <h2 id="program-intro" className="font-calsans text-xl md:text-2xl">Tentang {p.name.toLowerCase()}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.intro}</p>
          </div>
          <ul className="flex flex-wrap content-start gap-1.5">
            {p.topics.map((t) => (
              <li key={t} className="rounded-lg bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="program-faq" className="mx-auto w-full max-w-7xl px-4 md:px-8 pb-16 space-y-3">
        <h2 id="program-faq" className="font-calsans text-xl md:text-2xl">Pertanyaan seputar {p.name.toLowerCase()}</h2>
        <div className="grid gap-2.5 md:grid-cols-2">
          {p.faq.map((f, i) => (
            <details key={f.q} open={i === 0} className={`group ${card} open:bg-white/[0.06]`}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-bold leading-snug">{f.q}</h3>
                <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-5 pb-4 -mt-1 text-sm text-slate-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

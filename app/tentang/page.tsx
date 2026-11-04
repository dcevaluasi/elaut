import type { Metadata } from "next";
import type { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/footer";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronDown,
  GraduationCap,
  HelpCircle,
  Layers,
  MonitorPlay,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Video,
} from "lucide-react";

/* ============================ SEO ============================ */

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PAGE_PATH = "/tentang";
const PAGE_URL = `${SITE}${PAGE_PATH}`;
/** TODO: ganti dengan OG image khusus 1200×630 (< 300 KB), mis. /images/og/tentang-elaut.jpg */
const OG_IMAGE = "/images/hero-img6.jpg";

const TITLE = "Tentang E-LAUT: Platform Pelatihan Resmi KKP"; // + template " | E-LAUT KKP" = 57 karakter
const DESCRIPTION =
  "Kenali E-LAUT, platform resmi BPPSDM KKP untuk pelatihan, sertifikasi, e-learning, dan kemitraan P2MKP kelautan dan perikanan. Daftar dan mulai belajar gratis."; // 159 karakter

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: PAGE_URL,
    siteName: "E-LAUT KKP",
    title: `${TITLE} | E-LAUT KKP`,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Tentang E-LAUT, platform pelatihan kelautan dan perikanan KKP" }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} | E-LAUT KKP`, description: DESCRIPTION, images: [OG_IMAGE] },
};

/* ============================ KONTEN ============================ */

type Feature = { icon: ElementType; title: string; description: string; accent: string; span?: string; href?: string; cta?: string };

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Pelatihan terstandarisasi",
    description: "Modul pelatihan kelautan dan perikanan yang disusun para ahli dan mengacu pada standar kompetensi kerja nasional, dari tingkat dasar hingga lanjutan.",
    accent: "#3B82F6",
    span: "lg:col-span-2",
    href: "/pelatihan",
    cta: "Lihat jadwal pelatihan",
  },
  {
    icon: Award,
    title: "Sertifikat resmi ber-TTE",
    description: "Sertifikat (STTPL) diakui secara nasional dan ditandatangani elektronik melalui BSrE, termasuk sertifikasi Awak Kapal Perikanan.",
    accent: "#06B6D4",
    href: "/layanan/cek-sertifikat",
    cta: "Cek keaslian sertifikat",
  },
  {
    icon: MonitorPlay,
    title: "E-learning terpadu",
    description: "Belajar fleksibel secara daring maupun luring, dengan materi, nilai, dan progres yang dapat dipantau dari dashboard peserta.",
    accent: "#8B5CF6",
  },
  {
    icon: TrendingUp,
    title: "Program khusus ekonomi biru",
    description: "Program unggulan seperti diklat budi daya udang terintegrasi untuk mendorong pertumbuhan ekonomi sektor kelautan dan perikanan.",
    accent: "#10B981",
    span: "lg:col-span-2",
  },
  {
    icon: Users,
    title: "Kemitraan P2MKP",
    description: "Pusat Pelatihan Mandiri Kelautan dan Perikanan: wadah bagi pelaku usaha untuk menjadi lembaga pelatihan dan ikut mencetak SDM terampil.",
    accent: "#F59E0B",
    span: "lg:col-span-2",
    href: "/p2mkp",
    cta: "Pelajari cara menjadi P2MKP",
  },
  {
    icon: Video,
    title: "Galeri video gratis",
    description: "Ratusan video panduan budidaya, pengolahan, dan penangkapan yang bisa ditonton gratis tanpa login.",
    accent: "#F43F5E",
    href: "/video-pelatihan",
    cta: "Tonton video pelatihan",
  },
];

const AUDIENCE = [
  { icon: Users, title: "Masyarakat & pelaku utama", text: "Nelayan, pembudidaya ikan, pengolah, dan pemasar hasil perikanan." },
  { icon: GraduationCap, title: "Taruna & pelajar", text: "Peserta didik satuan pendidikan kelautan dan perikanan." },
  { icon: Building2, title: "Lembaga & dunia usaha", text: "Perusahaan, koperasi, dan lembaga pelatihan mitra (P2MKP)." },
  { icon: BadgeCheck, title: "Aparatur & penyuluh", text: "ASN dan penyuluh yang membutuhkan peningkatan kompetensi teknis." },
];

const STEPS = [
  { icon: UserPlus, title: "Buat akun", text: "Daftar gratis menggunakan NIK, email, dan nomor ponsel aktif." },
  { icon: Search, title: "Pilih pelatihan", text: "Cari pelatihan sesuai bidang, lokasi balai, dan jadwal yang tersedia." },
  { icon: Layers, title: "Ikuti & selesaikan", text: "Ikuti materi, pre-test, dan post-test secara daring atau luring." },
  { icon: Award, title: "Unduh sertifikat", text: "Sertifikat ber-TTE dapat diunduh dan diverifikasi kapan saja." },
];

const FAQ = [
  {
    q: "Apa itu E-LAUT?",
    a: "E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu) adalah platform digital resmi BPPSDM Kementerian Kelautan dan Perikanan untuk pendaftaran pelatihan, e-learning, sertifikasi kompetensi, dan kemitraan P2MKP.",
  },
  { q: "Apakah pelatihan di E-LAUT berbayar?", a: "Sebagian besar pelatihan yang diselenggarakan KKP melalui E-LAUT tidak dipungut biaya. Informasi biaya, bila ada, selalu dicantumkan pada detail setiap pelatihan." },
  { q: "Siapa saja yang bisa mengikuti pelatihan?", a: "Masyarakat umum, pelaku utama dan pelaku usaha perikanan, taruna satuan pendidikan KP, serta aparatur dan penyuluh — sesuai persyaratan masing-masing pelatihan." },
  { q: "Bagaimana cara mengecek keaslian sertifikat E-LAUT?", a: "Gunakan layanan Cek Sertifikat dengan memasukkan nomor STTPL atau NIK, lalu validasi tanda tangan elektroniknya melalui portal BSrE." },
  { q: "Siapa penyelenggara E-LAUT?", a: "E-LAUT dikelola oleh Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDM KP) bersama Pusat Pelatihan dan Balai Pelatihan di seluruh Indonesia." },
];

/* ============================ PAGE ============================ */

export default function TentangPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: `${TITLE} | E-LAUT KKP`,
        description: DESCRIPTION,
        inLanguage: "id-ID",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#organization` },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}/images/hero-img6.jpg` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tentang E-LAUT", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <main className="relative w-full bg-[#020617] text-white font-jakarta">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_60%_at_100%_0%,#0EA5E926_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-28 md:pt-36 pb-20 space-y-14">
          {/* Breadcrumb (konsisten dengan BreadcrumbList) */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white">Beranda</Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="font-semibold text-sky-200">Tentang E-LAUT</li>
            </ol>
          </nav>

          {/* ===== HERO (navy) ===== */}
          <header className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.55)] p-6 md:p-10">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <ShieldCheck aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -left-10 -bottom-16 -z-10 w-72 h-72 rotate-12 text-sky-300 opacity-[0.08]" />

            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Platform resmi BPPSDM KP
                </span>
                <h1 className="font-calsans text-3xl md:text-5xl leading-[1.08] tracking-tight">
                  Tentang E-LAUT:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">membangun SDM unggul kelautan dan perikanan</span>
                </h1>
                <p className="max-w-xl text-sm md:text-base text-blue-100/80 leading-relaxed">
                  <strong className="text-white">E-LAUT (Elektronik Layanan Pelatihan Utama Terpadu)</strong> adalah platform pelatihan resmi Kementerian Kelautan dan Perikanan (KKP) yang dikelola BPPSDM KP.
                  Melalui E-LAUT, masyarakat dapat mendaftar pelatihan, belajar secara daring, memperoleh sertifikat kompetensi ber-TTE, hingga bermitra sebagai P2MKP — semuanya dalam satu tempat.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link href="/pelatihan" className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors">
                    Jelajahi pelatihan <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/layanan/cek-sertifikat" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/[0.08] ring-1 ring-white/15 text-sm font-bold hover:bg-white/[0.14] transition-colors">
                    <ShieldCheck className="w-4 h-4 text-sky-300" /> Cek sertifikat
                  </Link>
                </div>
              </div>

              {/* Kolase foto (LCP → priority) */}
              <div className="group/col relative mx-auto h-[300px] sm:h-[380px] w-full max-w-[520px]">
                <div className="absolute right-0 top-0 h-[72%] w-[80%] overflow-hidden rounded-3xl ring-1 ring-white/20 shadow-2xl transition-transform duration-500 group-hover/col:-translate-y-1 group-hover/col:-rotate-1">
                  <Image src="/images/hero-img6.jpg" alt="Peserta pelatihan budidaya perikanan E-LAUT KKP" fill priority sizes="(min-width: 1024px) 420px, 80vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3F]/70 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 z-10 h-[48%] w-[52%] overflow-hidden rounded-3xl ring-4 ring-[#0B1B3F] shadow-2xl transition-transform duration-500 group-hover/col:translate-y-1 group-hover/col:rotate-1">
                  <Image src="/images/hero-img10.jpg" alt="Kapal perikanan sebagai sarana pelatihan kepelautan KKP" fill sizes="(min-width: 1024px) 280px, 52vw" className="object-cover" />
                </div>
                <div className="absolute bottom-6 right-2 z-20 flex items-center gap-3 rounded-2xl bg-white/[0.12] ring-1 ring-white/25 backdrop-blur-xl px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-emerald-500 text-white">
                    <BadgeCheck className="w-5 h-5" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-sky-100/70">Sertifikat</span>
                    <span className="block text-sm font-bold">Ber-TTE BSrE</span>
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ===== FITUR (bento) ===== */}
          <section aria-labelledby="fitur" className="space-y-6">
            <SectionHead id="fitur" icon={Sparkles} accent="#3B82F6" eyebrow="Layanan utama" title="Layanan pelatihan kelautan dan perikanan di E-LAUT" desc="Satu ekosistem untuk belajar, bersertifikat, dan bermitra." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <article key={f.title} className={`group relative isolate overflow-hidden flex flex-col rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 md:p-7 transition-all hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-white/20 ${f.span ?? ""}`}>
                  <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(70% 70% at 100% 100%, ${f.accent}26 0%, transparent 70%)` }} />
                  <f.icon aria-hidden strokeWidth={1.3} className="pointer-events-none absolute -right-6 -bottom-8 -z-10 w-36 h-36 -rotate-12 opacity-[0.08] transition-all duration-500 group-hover:opacity-[0.2] group-hover:-rotate-6" style={{ color: f.accent }} />
                  <span className="relative isolate overflow-hidden grid place-items-center w-12 h-12 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 text-white shrink-0">
                    <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${f.accent} 0%, transparent 70%)` }} />
                    <f.icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                  {f.href && (
                    <Link href={f.href} className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-bold text-sky-300 hover:text-white">
                      {f.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* ===== UNTUK SIAPA ===== */}
          <section aria-labelledby="sasaran" className="space-y-6">
            <SectionHead id="sasaran" icon={Users} accent="#10B981" eyebrow="Sasaran" title="Siapa yang bisa memanfaatkan E-LAUT?" desc="Terbuka untuk seluruh insan kelautan dan perikanan Indonesia." />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AUDIENCE.map((a) => (
                <li key={a.title} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                  <span className="p-2 rounded-xl bg-emerald-400/15 text-emerald-300 shrink-0">
                    <a.icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{a.title}</span>
                    <span className="block mt-0.5 text-xs text-slate-400 leading-relaxed">{a.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== CARA MEMULAI ===== */}
          <section aria-labelledby="cara" className="space-y-6">
            <SectionHead id="cara" icon={Layers} accent="#8B5CF6" eyebrow="Cara memulai" title="Cara mengikuti pelatihan di E-LAUT" desc="Empat langkah dari daftar hingga sertifikat." />
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 text-sky-200">
                      <s.icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-500">LANGKAH {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ===== FAQ ===== */}
          <section aria-labelledby="faq" className="space-y-6">
            <SectionHead id="faq" icon={HelpCircle} accent="#F59E0B" eyebrow="FAQ" title="Pertanyaan seputar E-LAUT" desc="Jawaban singkat untuk pertanyaan yang paling sering diajukan." />
            <div className="grid gap-2.5 md:grid-cols-2">
              {FAQ.map((f, i) => (
                <details key={f.q} open={i === 0} className="group rounded-2xl bg-white/[0.04] ring-1 ring-white/10 open:bg-white/[0.06] open:ring-white/20">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-sm font-bold leading-snug">{f.q}</h3>
                    <ChevronDown className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-4 -mt-1 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ===== CTA ===== */}
          <section aria-labelledby="cta" className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] text-white ring-1 ring-white/10 px-6 py-12 md:px-12 text-center shadow-[0_30px_80px_-30px_rgba(37,99,235,0.55)]">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_100%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_0%_100%,#10B98155_0%,transparent_60%)]" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px]" />
            <GraduationCap aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-8 -bottom-12 -z-10 w-60 h-60 -rotate-12 text-sky-300 opacity-[0.12]" />
            <h2 id="cta" className="font-calsans text-2xl md:text-4xl leading-tight">
              Siap meningkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-emerald-300">kompetensi Anda?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100/80">Bergabunglah dengan ribuan insan kelautan dan perikanan yang telah merasakan manfaat pelatihan E-LAUT.</p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/pelatihan" className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors">
                Cari pelatihan sekarang <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/video-pelatihan" className="text-sm font-semibold text-sky-200 underline-offset-4 hover:underline">
                Mulai dari video pelatihan gratis
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SectionHead({ id, icon: Icon, accent, eyebrow, title, desc }: { id: string; icon: ElementType; accent: string; eyebrow: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative isolate overflow-hidden w-12 h-12 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 text-white grid place-items-center shrink-0">
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300/80">{eyebrow}</p>
        <h2 id={id} className="text-xl md:text-2xl font-calsans leading-tight">{title}</h2>
        <p className="text-xs md:text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

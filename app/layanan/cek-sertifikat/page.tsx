import type { Metadata } from "next";
import type { ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/ui/footer";
import { verifyPDFBSrEUrl } from "@/constants/urls";
import { sanitizedDangerousChars, validateIsDangerousChars } from "@/utils/input";
import { AlertTriangle, ArrowRight, BadgeCheck, ChevronDown, Database, ExternalLink, FileText, HelpCircle, Lock, Search, ShieldCheck, UserRound } from "lucide-react";

/* ============================ KONSTANTA SEO ============================ */

const SITE = "https://elaut-bppsdm.kkp.go.id";
const PAGE_PATH = "/layanan/cek-sertifikat";
const PAGE_URL = `${SITE}${PAGE_PATH}`;
const OG_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1qXD5spmbdpPwx426e-daa6Cd23RLxBeFw&s";

const TITLE = "Cek Sertifikat Pelatihan KKP Online – Verifikasi STTPL & NIK | E-LAUT";
const DESCRIPTION =
  "Cek keaslian sertifikat pelatihan Kelautan dan Perikanan (KKP) secara online dan gratis. Verifikasi nomor STTPL, lihat riwayat pelatihan dengan NIK, dan validasi tanda tangan elektronik BSrE di E-LAUT BPPSDM KP.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "E-LAUT",
  category: "government",
  keywords: [
    "cek sertifikat KKP",
    "cek sertifikat E-LAUT",
    "cek sertifikat pelatihan KKP",
    "verifikasi sertifikat KKP",
    "cek STTPL",
    "nomor STTPL",
    "cek sertifikat pelatihan online",
    "cek sertifikat dengan NIK",
    "riwayat pelatihan KKP",
    "validasi sertifikat BSrE",
    "tanda tangan elektronik sertifikat",
    "sertifikat pelatihan perikanan",
    "sertifikat pelatihan kelautan",
    "BPPSDM KP",
    "Puslatluh KP",
    "Balai Pelatihan dan Penyuluhan Perikanan",
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
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    siteName: "E-LAUT – Elektronik Layanan Pelatihan Utama Terpadu",
    locale: "id_ID",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Cek Sertifikat Pelatihan KKP di E-LAUT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: "Cek Sertifikat Pelatihan KKP di E-LAUT" }],
  },
};

/* ============================ KONTEN ============================ */

const METHODS = [
  {
    id: "sttpl",
    title: "Cek Sertifikat via STTPL",
    description: "Lihat validitas sertifikat dan keikutsertaan pelatihan Anda di E-LAUT melalui nomor STTPL.",
    imageSrc: "/icons/icvalidity.png",
    icon: FileText,
    accent: "#3B82F6",
    steps: [
      "Pilih tab “Nomor STTPL” pada kotak pencarian di atas.",
      "Masukkan nomor STTPL lengkap sesuai yang tertera di sertifikat.",
      "Jika Anda lulus dan sertifikat sudah terbit, data validitas keikutsertaan dan sertifikat akan ditampilkan.",
    ],
  },
  {
    id: "nik",
    title: "Riwayat Pelatihan via NIK",
    description: "Telusuri seluruh riwayat pelatihan yang pernah Anda ikuti berdasarkan 16 digit NIK KTP.",
    imageSrc: "/icons/icsearch.png",
    icon: UserRound,
    accent: "#06B6D4",
    steps: [
      "Pilih tab “NIK” pada kotak pencarian di atas.",
      "Masukkan 16 digit NIK (Nomor Induk Kependudukan) sesuai KTP.",
      "Sistem menampilkan seluruh riwayat pelatihan Anda.",
      "Lihat detail: nama pelatihan, bidang, dan nomor STTPL.",
    ],
  },
  {
    id: "bsre",
    title: "Validasi Tanda Tangan BSrE",
    description: "Periksa keabsahan tanda tangan elektronik pada file sertifikat melalui portal PSrE Komdigi.",
    imageSrc: "/icons/icbsre.png",
    icon: ShieldCheck,
    accent: "#10B981",
    link: verifyPDFBSrEUrl,
    steps: [
      "Klik “Buka portal BSrE” — Anda diarahkan ke situs PSrE.",
      "Unggah file PDF sertifikat pelatihan Anda.",
      "Tunggu proses validasi.",
      "Hasil menunjukkan apakah dokumen valid dan telah ditandatangani secara elektronik.",
    ],
  },
] as const;

const FAQ = [
  {
    q: "Bagaimana cara cek sertifikat pelatihan KKP secara online?",
    a: "Masukkan nomor STTPL yang tertera pada sertifikat di kotak pencarian halaman ini, lalu klik “Cek Validitas”. Sistem E-LAUT akan menampilkan data peserta, pelatihan, dan status sertifikat secara langsung.",
  },
  {
    q: "Apa itu nomor STTPL?",
    a: "STTPL (Surat Tanda Tamat Pelatihan) adalah nomor registrasi unik yang diberikan kepada peserta yang telah menyelesaikan pelatihan di lingkungan BPPSDM Kementerian Kelautan dan Perikanan.",
  },
  {
    q: "Saya lupa nomor STTPL, bagaimana cara mengeceknya?",
    a: "Gunakan pencarian berdasarkan NIK. Masukkan 16 digit NIK KTP Anda untuk melihat seluruh riwayat pelatihan beserta nomor STTPL-nya.",
  },
  {
    q: "Bagaimana memastikan sertifikat ditandatangani secara elektronik dan asli?",
    a: "Unggah file PDF sertifikat ke portal verifikasi BSrE (PSrE Komdigi). Sertifikat E-LAUT ditandatangani secara elektronik dengan sertifikat elektronik yang diterbitkan BSrE.",
  },
  {
    q: "Apakah layanan cek sertifikat E-LAUT berbayar?",
    a: "Tidak. Layanan cek sertifikat dan riwayat pelatihan di E-LAUT gratis dan dapat diakses kapan saja.",
  },
  {
    q: "Bagaimana cara cek sertifikat Awak Kapal Perikanan?",
    a: "Sertifikat Awak Kapal Perikanan diverifikasi melalui portal AKAPI di akapi.kkp.go.id.",
  },
];

const ERRORS: Record<string, string> = {
  kosong: "Isian tidak boleh kosong.",
  karakter: "Input mengandung karakter yang tidak diizinkan. Periksa kembali isian Anda.",
  nik: "NIK harus terdiri dari 16 digit angka.",
};

/* ============================ SERVER ACTIONS ============================ */

async function cekSttpl(formData: FormData) {
  "use server";
  const v = String(formData.get("sttpl") ?? "").trim();
  if (!v) redirect(`${PAGE_PATH}?by=sttpl&error=kosong#cek`);
  if (validateIsDangerousChars(v)) redirect(`${PAGE_PATH}?by=sttpl&error=karakter#cek`);
  redirect(`${PAGE_PATH}/${encodeURIComponent(sanitizedDangerousChars(v))}`);
}

async function cekNik(formData: FormData) {
  "use server";
  const v = String(formData.get("nik") ?? "").replace(/\D/g, "");
  if (v.length !== 16) redirect(`${PAGE_PATH}?by=nik&error=nik#cek`);
  redirect(`${PAGE_PATH}/nik/${encodeURIComponent(v)}`);
}

/* ============================ PAGE ============================ */

type SP = { by?: string; error?: string };

export default async function CekSertifikatPage({ searchParams }: { searchParams?: SP | Promise<SP> }) {
  const sp = (await searchParams) ?? {}; // kompatibel Next 14 (objek) & 15 (Promise)
  const by: "sttpl" | "nik" = sp.by === "nik" ? "nik" : "sttpl";
  const error = sp.error ? ERRORS[sp.error] : undefined;

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
      },
      {
        "@type": "GovernmentService",
        "@id": `${PAGE_URL}#service`,
        name: "Cek Sertifikat Pelatihan Kelautan dan Perikanan",
        serviceType: "Verifikasi sertifikat pelatihan",
        description: DESCRIPTION,
        url: PAGE_URL,
        areaServed: { "@type": "Country", name: "Indonesia" },
        availableChannel: { "@type": "ServiceChannel", serviceUrl: PAGE_URL },
        provider: {
          "@type": "GovernmentOrganization",
          name: "Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDM KP)",
          parentOrganization: { "@type": "GovernmentOrganization", name: "Kementerian Kelautan dan Perikanan Republik Indonesia", url: "https://kkp.go.id" },
          url: SITE,
        },
        offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
          { "@type": "ListItem", position: 2, name: "Layanan", item: `${SITE}/layanan` },
          { "@type": "ListItem", position: 3, name: "Cek Sertifikat", item: PAGE_URL },
        ],
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

      <main className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-jakarta text-white">
        {/* Latar */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_0%_0%,#2563EB33_0%,transparent_60%),radial-gradient(50%_50%_at_100%_100%,#0EA5E926_0%,transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-28 md:pt-36 pb-20 space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-[11px] text-slate-400">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white">Beranda</Link>
              </li>
              <li aria-hidden>/</li>
              <li>Layanan</li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-sky-200">Cek Sertifikat</li>
            </ol>
          </nav>

          {/* ===== HERO + KONSOL PENCARIAN ===== */}
          <section id="cek" aria-labelledby="judul" className="relative isolate overflow-hidden rounded-[2rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.6)] p-6 md:p-10 scroll-mt-28">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <ShieldCheck aria-hidden strokeWidth={1.2} className="pointer-events-none absolute -right-10 -bottom-14 -z-10 w-72 h-72 -rotate-12 text-sky-300 opacity-[0.12]" />

            <div className="grid lg:grid-cols-[1fr_minmax(0,34rem)] gap-8 lg:gap-10 items-center">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Layanan resmi BPPSDM KP
                </span>
                <h1 id="judul" className="text-3xl md:text-5xl font-calsans leading-[1.1] tracking-tight">
                  Cek <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">Validitas</span> Sertifikat Pelatihan KKP
                </h1>
                <p className="max-w-xl text-sm md:text-base text-blue-100/75 leading-relaxed">
                  Verifikasi keaslian sertifikat dan riwayat pelatihan yang diterbitkan resmi oleh Pusat & Balai Pelatihan Kelautan dan Perikanan, Kementerian Kelautan dan Perikanan RI. <b className="text-white">Gratis</b>, tanpa login.
                </p>
                <p className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-white/[0.07] ring-1 ring-white/10 px-4 py-1.5 text-[11px] text-blue-100/70">
                  Sertifikat Awak Kapal dicek via
                  <a href="https://akapi.kkp.go.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-sky-200 hover:text-white hover:underline">
                    akapi.kkp.go.id <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Konsol pencarian (kaca) */}
              <div className="rounded-3xl bg-white/[0.08] ring-1 ring-white/15 backdrop-blur-xl p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <div role="tablist" aria-label="Metode pencarian" className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#0B1B3F]/60 ring-1 ring-white/10">
                  {[
                    { id: "sttpl", label: "Nomor STTPL", icon: FileText, accent: "#3B82F6" },
                    { id: "nik", label: "NIK (16 digit)", icon: UserRound, accent: "#06B6D4" },
                  ].map((t) => {
                    const on = by === t.id;
                    return (
                      <Link
                        key={t.id}
                        href={t.id === "sttpl" ? `${PAGE_PATH}#cek` : `${PAGE_PATH}?by=nik#cek`}
                        scroll={false}
                        replace
                        role="tab"
                        aria-selected={on}
                        className={`relative isolate overflow-hidden flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold transition-all ring-1 ${on ? "bg-white/[0.14] ring-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" : "ring-transparent text-blue-100/70 hover:text-white hover:bg-white/[0.06]"}`}
                      >
                        {on && <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to left, ${t.accent}55 0%, transparent 80%)` }} />}
                        <t.icon className="w-4 h-4" /> {t.label}
                      </Link>
                    );
                  })}
                </div>

                {by === "sttpl" ? (
                  <form action={cekSttpl} className="mt-3 space-y-2">
                    <label htmlFor="sttpl" className="sr-only">Nomor STTPL</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <FileText className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="sttpl"
                          name="sttpl"
                          required
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="Contoh: 001/PEL/2024"
                          aria-invalid={!!error}
                          className={`w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.08] text-sm font-mono text-white placeholder:text-slate-400 outline-none ring-1 focus:ring-2 ${error ? "ring-rose-400/60 focus:ring-rose-400/70" : "ring-white/15 focus:ring-sky-300/60"}`}
                        />
                      </div>
                      <button type="submit" className="h-12 px-6 rounded-2xl bg-white text-[#0B1B3F] text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-sky-100 transition-colors">
                        <Search className="w-4 h-4" /> Cek Validitas
                      </button>
                    </div>
                    <p className="px-1 text-[11px] text-blue-100/60">Masukkan nomor STTPL lengkap sesuai lembar sertifikat.</p>
                  </form>
                ) : (
                  <form action={cekNik} className="mt-3 space-y-2">
                    <label htmlFor="nik" className="sr-only">NIK</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="nik"
                          name="nik"
                          required
                          inputMode="numeric"
                          pattern="\d{16}"
                          minLength={16}
                          maxLength={16}
                          autoComplete="off"
                          title="16 digit angka NIK"
                          placeholder="16 digit NIK KTP"
                          aria-invalid={!!error}
                          className={`w-full h-12 pl-11 pr-4 rounded-2xl bg-white/[0.08] text-sm font-mono tracking-widest text-white placeholder:tracking-normal placeholder:text-slate-400 outline-none ring-1 focus:ring-2 ${error ? "ring-rose-400/60 focus:ring-rose-400/70" : "ring-white/15 focus:ring-sky-300/60"}`}
                        />
                      </div>
                      <button type="submit" className="h-12 px-6 rounded-2xl bg-white text-[#0B1B3F] text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-sky-100 transition-colors">
                        <Search className="w-4 h-4" /> Cari Riwayat
                      </button>
                    </div>
                    <p className="px-1 text-[11px] text-blue-100/60 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> NIK hanya dipakai untuk pencarian dan tidak disimpan.
                    </p>
                  </form>
                )}

                {error && (
                  <p role="alert" className="mt-2 flex items-center gap-2 rounded-xl bg-rose-500/15 ring-1 ring-rose-400/30 px-3 py-2 text-xs text-rose-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </p>
                )}
              </div>
            </div>

            {/* Indikator kepercayaan */}
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: BadgeCheck, t: "Tanda tangan elektronik BSrE", s: "Sertifikat ber-TTE resmi", accent: "#10B981" },
                { icon: Database, t: "Data langsung E-LAUT", s: "Terhubung ke pangkalan data", accent: "#3B82F6" },
                { icon: Lock, t: "Privasi terjaga", s: "Perlindungan NIK & data pribadi", accent: "#06B6D4" },
              ].map((x) => (
                <li key={x.t} className="group relative isolate overflow-hidden flex items-center gap-3 rounded-2xl bg-white/[0.07] ring-1 ring-white/10 backdrop-blur px-3.5 py-3">
                  <x.icon aria-hidden strokeWidth={1.5} className="pointer-events-none absolute -right-2 -bottom-3 -z-10 w-14 h-14 -rotate-12 opacity-20 transition-all duration-500 group-hover:opacity-40 group-hover:-rotate-6" style={{ color: x.accent }} />
                  <span className="p-1.5 rounded-lg text-white shrink-0" style={{ background: x.accent }}>
                    <x.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-xs font-bold">{x.t}</span>
                    <span className="block text-[10px] text-blue-100/60">{x.s}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== METODE PENGECEKAN ===== */}
          <section aria-labelledby="metode" className="space-y-5">
            <SectionHead id="metode" icon={ShieldCheck} accent="#3B82F6" title="Tiga cara cek sertifikat pelatihan KKP" desc="Pilih sesuai kebutuhan — buka “Langkah pemeriksaan” untuk panduan." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {METHODS.map((m) => (
                <article key={m.id} className="group relative isolate overflow-hidden flex flex-col rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 transition-all hover:bg-white/[0.07] hover:-translate-y-0.5">
                  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(70% 60% at 100% 0%, ${m.accent}26 0%, transparent 65%)` }} />
                  <m.icon aria-hidden strokeWidth={1.4} className="pointer-events-none absolute -right-5 -bottom-6 -z-10 w-32 h-32 -rotate-12 opacity-[0.07] group-hover:opacity-[0.16] transition-all duration-500 group-hover:-rotate-6" style={{ color: m.accent }} />

                  <div className="flex items-center gap-3">
                    <span className="relative isolate overflow-hidden grid place-items-center w-14 h-14 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 shrink-0">
                      <span aria-hidden className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${m.accent} 0%, transparent 70%)` }} />
                      <Image src={m.imageSrc} alt="" width={36} height={36} className="object-contain" />
                    </span>
                    <h2 className="font-calsans text-lg leading-tight">{m.title}</h2>
                  </div>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{m.description}</p>

                  <details className="group/d mt-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 open:bg-white/[0.06]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-slate-200 [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-300" /> Langkah pemeriksaan
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open/d:rotate-180" />
                    </summary>
                    <ol className="space-y-2 px-4 pb-4">
                      {m.steps.map((s, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <span className="grid place-items-center w-5 h-5 shrink-0 rounded-md text-[10px] font-bold text-white" style={{ background: m.accent }}>
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </details>

                  <div className="mt-auto pt-4">
                    {"link" in m ? (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm font-semibold text-slate-200 hover:bg-white/[0.12] hover:text-white transition-colors">
                        Buka portal BSrE <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        href={m.id === "nik" ? `${PAGE_PATH}?by=nik#cek` : `${PAGE_PATH}#cek`}
                        scroll={false}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-[#0B1B3F] text-sm font-bold hover:bg-sky-100 transition-colors"
                      >
                        Cek sekarang <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ===== FAQ (juga jadi rich result FAQPage) ===== */}
          <section aria-labelledby="faq" className="space-y-5">
            <SectionHead id="faq" icon={HelpCircle} accent="#8B5CF6" title="Pertanyaan yang sering diajukan" desc="Seputar cek sertifikat, STTPL, NIK, dan tanda tangan elektronik." />
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
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SectionHead({ id, icon: Icon, accent, title, desc }: { id: string; icon: ElementType; accent: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative isolate overflow-hidden w-12 h-12 rounded-2xl bg-[#0B1B3F] ring-1 ring-white/10 grid place-items-center shrink-0">
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(80% 80% at 0% 0%, ${accent} 0%, transparent 70%)` }} />
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 id={id} className="text-xl md:text-2xl font-calsans leading-tight">{title}</h2>
        <p className="text-xs md:text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  );
}


import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MapPin, School } from "lucide-react";
import Footer from "@/components/ui/footer";
import { DetailPelatihanMasyarakat, PelatihanMasyarakat } from "@/types/product";
import { decryptValue, encryptValue, formatToRupiah, getMonthName } from "@/lib/utils";
import { createSlug } from "@/utils";
import { elautBaseUrl } from "@/constants/urls";
import DetailPelatihanClient from "./DetailPelatihanClient";

const SITE = "https://elaut-bppsdm.kkp.go.id";
const REVALIDATE = 300; // detik
const PROGRAM_PATH: Record<string, { slug: string; name: string }> = {
  "Awak Kapal Perikanan": { slug: "akp", name: "Pelatihan Awak Kapal Perikanan" },
  Perikanan: { slug: "perikanan", name: "Pelatihan Perikanan" },
  Kelautan: { slug: "kelautan", name: "Pelatihan Kelautan" },
};

type Params = Record<string, string>;
type Detail = DetailPelatihanMasyarakat & Record<string, unknown>;

/* ───────── Data ───────── */
const getIds = async (params: Params | Promise<Params>) => {
  const v = Object.values((await params) ?? {}).map(String);
  const raw = v[v.length - 1] ?? "";
  let id = "";
  for (const c of [raw, decodeURIComponent(raw)]) {
    try { id = String(decryptValue(c) ?? ""); } catch { id = ""; }
    if (id) break;
  }
  return { id, path: `/layanan/pelatihan/${v.join("/")}` };
};

/** undefined = gagal jaringan (klien coba lagi), null = tidak ada */
async function getDetail(id: string): Promise<Detail | null | undefined> {
  if (!id) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/getPelatihanUser?idPelatihan=${encodeURIComponent(id)}`, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) return null;
    if (!res.ok) return undefined;
    const json = await res.json();
    const d = json?.data ?? json;
    return d?.IdPelatihan ? (d as Detail) : null;
  } catch {
    return undefined;
  }
}

async function getRelated(d: Detail): Promise<PelatihanMasyarakat[]> {
  try {
    const res = await fetch(`${elautBaseUrl}/lemdik/getPelatihan`, { next: { revalidate: REVALIDATE } });
    const json = await res.json();
    const list: PelatihanMasyarakat[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const now = Date.now();
    return list
      .filter((p) => p.IdPelatihan !== d.IdPelatihan && p.JenisProgram === d.JenisProgram && (!p.Status || p.Status === "Publish"))
      .map((p) => ({ p, done: p.StatusApproval === "Selesai" || new Date(p.TanggalBerakhirPelatihan).getTime() < now }))
      .sort((a, b) => Number(a.done) - Number(b.done) || new Date(a.p.TanggalMulaiPelatihan).getTime() - new Date(b.p.TanggalMulaiPelatihan).getTime())
      .slice(0, 3)
      .map((x) => x.p);
  } catch {
    return [];
  }
}

/* ───────── Util teks SEO ───────── */
const strip = (html?: unknown) => String(html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…`);
const iso = (s?: string) => {
  const d = s ? new Date(s) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : undefined;
};
const isFree = (d: Detail) => Number(d.HargaPelatihan) === 0;
const isOnline = (d: Detail) => /online|daring/i.test(String(d.PelaksanaanPelatihan ?? ""));

function buildDescription(d: Detail) {
  const when = d.TanggalMulaiPelatihan ? ` mulai ${getMonthName(d.TanggalMulaiPelatihan)}` : "";
  const where = d.LokasiPelatihan ? ` di ${d.LokasiPelatihan}` : "";
  const fee = isFree(d) ? "Gratis" : `Biaya ${formatToRupiah(d.HargaPelatihan)}`;
  const base = `${d.NamaPelatihan} oleh ${d.PenyelenggaraPelatihan}${where}${when}. ${fee}, bersertifikat. Daftar online di E-LAUT KKP.`;
  return clip(base.length >= 120 ? base : `${base} ${strip(d.DetailPelatihan)}`, 160);
}

/* ───────── Metadata ───────── */
export const revalidate = 300; // harus angka literal (bukan variabel) agar dibaca Next.js

export async function generateMetadata({ params }: { params: Params | Promise<Params> }): Promise<Metadata> {
  const { id, path } = await getIds(params);
  const d = await getDetail(id);
  if (!d) return { title: "Detail Pelatihan", robots: { index: false, follow: true } };
  const title = clip(d.NamaPelatihan, 47);
  const description = buildDescription(d);
  const img = typeof d.FotoPelatihan === "string" && /\.(jpe?g|png|webp)$/i.test(d.FotoPelatihan) ? d.FotoPelatihan : "/images/hero-img6.jpg";
  return {
    title,
    description,
    alternates: { canonical: path },
    keywords: [d.NamaPelatihan, d.BidangPelatihan, d.JenisProgram, d.PenyelenggaraPelatihan, "pelatihan KKP", "E-LAUT"].filter(Boolean) as string[],
    openGraph: { type: "website", locale: "id_ID", url: `${SITE}${path}`, siteName: "E-LAUT KKP", title: `${title} | E-LAUT KKP`, description, images: [{ url: img, alt: d.NamaPelatihan }] },
    twitter: { card: "summary_large_image", title: `${title} | E-LAUT KKP`, description, images: [img] },
  };
}

/* ───────── Halaman ───────── */
export default async function Page({ params }: { params: Params | Promise<Params> }) {
  const { id, path } = await getIds(params);
  const d = await getDetail(id);
  if (d === null) notFound();

  const related = d ? await getRelated(d) : [];
  const url = `${SITE}${path}`;
  const program = d ? PROGRAM_PATH[d.JenisProgram as string] : undefined;

  const jsonLd = d && {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course", "@id": `${url}#course`, url, name: d.NamaPelatihan, description: buildDescription(d), inLanguage: "id-ID",
        courseCode: d.KodePelatihan, about: d.BidangPelatihan, educationalCredentialAwarded: "Surat Tanda Tamat Pelatihan (STTPL) ber-TTE",
        provider: { "@type": "Organization", name: d.PenyelenggaraPelatihan, parentOrganization: { "@id": `${SITE}/#organization` } },
        offers: { "@type": "Offer", category: isFree(d) ? "Free" : "Paid", price: Number(d.HargaPelatihan) || 0, priceCurrency: "IDR", url, availability: d.StatusApproval === "Selesai" ? "https://schema.org/SoldOut" : "https://schema.org/InStock", validFrom: iso(d.TanggalMulaiPendaftaran) },
        hasCourseInstance: {
          "@type": "CourseInstance", courseMode: isOnline(d) ? "Online" : "Onsite", startDate: iso(d.TanggalMulaiPelatihan), endDate: iso(d.TanggalBerakhirPelatihan),
          location: isOnline(d) ? { "@type": "VirtualLocation", url } : { "@type": "Place", name: d.LokasiPelatihan || d.PenyelenggaraPelatihan, address: { "@type": "PostalAddress", addressLocality: d.LokasiPelatihan, addressCountry: "ID" } },
          courseWorkload: d.TanggalMulaiPelatihan && d.TanggalBerakhirPelatihan ? `P${Math.max(1, Math.round((new Date(d.TanggalBerakhirPelatihan).getTime() - new Date(d.TanggalMulaiPelatihan).getTime()) / 864e5) + 1)}D` : undefined,
        },
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: SITE },
          ...(program ? [{ "@type": "ListItem", position: 2, name: program.name, item: `${SITE}/layanan/pelatihan/program/${program.slug}` }] : []),
          { "@type": "ListItem", position: program ? 3 : 2, name: d.NamaPelatihan, item: url },
        ],
      },
    ],
  };

  const card = "rounded-2xl bg-white/[0.04] ring-1 ring-white/10";

  return (
    <main className="relative isolate min-h-screen flex flex-col overflow-x-clip bg-[#020617] font-jakarta text-white">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}

      {/* Latar statis (tanpa animasi JS) */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[800px] bg-[radial-gradient(55%_50%_at_10%_0%,#2563EB40_0%,transparent_65%),radial-gradient(45%_45%_at_95%_15%,#0EA5E92e_0%,transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[800px] opacity-[0.07] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_left,black_25%,transparent_70%)]" />
      <School aria-hidden className="pointer-events-none absolute -right-16 top-24 -z-10 h-[420px] w-[420px] rotate-12 text-white/[0.03]" />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 pt-28 md:pt-32 pb-16 flex-1">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-white">Beranda</Link></li>
            <li aria-hidden>/</li>
            {program && (
              <>
                <li><Link href={`/layanan/pelatihan/program/${program.slug}`} className="hover:text-white">{program.name}</Link></li>
                <li aria-hidden>/</li>
              </>
            )}
            <li aria-current="page" className="max-w-[60vw] truncate font-semibold text-sky-200">{d?.NamaPelatihan ?? "Detail pelatihan"}</li>
          </ol>
        </nav>

        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/[0.06] ring-1 ring-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden /> Detail pelatihan masyarakat
        </span>

        <DetailPelatihanClient id={id} initialData={d ?? null} />

        {/* Pelatihan lain (SSR, tautan internal) */}
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-14 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="related-title" className="font-calsans text-xl md:text-2xl">Pelatihan {d?.JenisProgram ? String(d.JenisProgram).toLowerCase() : ""} lainnya</h2>
              {program && (
                <Link href={`/layanan/pelatihan/program/${program.slug}#cari-pelatihan`} className="inline-flex items-center gap-1 text-sm font-bold text-sky-300 hover:text-white">
                  Lihat semua jadwal <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              )}
            </div>
            <ul className="grid gap-2.5 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.IdPelatihan}>
                  <Link href={`/layanan/pelatihan/${createSlug(r.NamaPelatihan)}/${r.KodePelatihan}/${encryptValue(r.IdPelatihan)}`} className={`group flex h-full flex-col ${card} p-5 transition-colors hover:bg-white/[0.06] hover:ring-white/20`}>
                    <span className="text-[11px] font-semibold text-slate-400">{r.BidangPelatihan || "Pelatihan KP"}</span>
                    <h3 className="mt-1 text-sm font-bold leading-snug line-clamp-2 group-hover:text-sky-200">{r.NamaPelatihan}</h3>
                    <span className="mt-3 space-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 truncate"><School className="w-3.5 h-3.5 shrink-0 text-sky-300/80" aria-hidden />{r.PenyelenggaraPelatihan}</span>
                      <span className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 shrink-0 text-sky-300/80" aria-hidden />{r.LokasiPelatihan || "-"}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0 text-sky-300/80" aria-hidden />{r.TanggalMulaiPelatihan ? getMonthName(r.TanggalMulaiPelatihan) : "-"}</span>
                    </span>
                    <span className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 mt-4 text-sm font-extrabold">
                      {Number(r.HargaPelatihan) === 0 ? <span className="text-emerald-300">Gratis</span> : formatToRupiah(r.HargaPelatihan)}
                      <ArrowRight className="w-4 h-4 text-sky-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}

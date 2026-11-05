'use client'

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import LogoFooter from "./logo-footer";

const COOKIE_FIRST_TIMER = "XSRF087";
const WA = "6281188088767";

type Item = { href: string; label: string };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Program pelatihan",
    items: [
      { href: "/layanan/pelatihan/program/perikanan", label: "Pelatihan Perikanan" },
      { href: "/layanan/pelatihan/program/akp", label: "Pelatihan Awak Kapal Perikanan" },
      { href: "/layanan/pelatihan/program/kelautan", label: "Pelatihan Kelautan" },
      { href: "/layanan/materi-pelatihan", label: "Modul & Materi Pelatihan" },
      { href: "/video-pelatihan", label: "Video Pelatihan Gratis" },
      { href: "/layanan/cek-sertifikat", label: "Cek Sertifikat" },
    ],
  },
  {
    title: "Layanan publik",
    items: [
      { href: "/layanan/publik/maklumat-pelayanan", label: "Maklumat Pelayanan" },
      { href: "/files/Standar%20Pelayanan%20P2MKP.pdf", label: "Standar Pelayanan" },
      { href: "/layanan/regulasi", label: "Regulasi Pelatihan" },
      { href: "/layanan/survey-kepuasan", label: "Survei Kepuasan Masyarakat" },
      { href: "/layanan/hasil-survey", label: "Hasil Survei Kepuasan" },
      { href: "/layanan/publik/masukan-saran", label: "Masukan & Saran" },
    ],
  },
  {
    title: "Pengaduan & integritas",
    items: [
      { href: "https://rumah-aspirasi-digital-smoky.vercel.app/", label: "Rumah Aspirasi Digital" },
      { href: "https://www.lapor.go.id/", label: "SP4N-LAPOR!" },
      { href: "https://wbs.kkp.go.id/register", label: "Whistleblowing System KKP" },
      { href: "https://gol.kpk.go.id/login", label: "Gratifikasi Online KPK" },
    ],
  },
  {
    title: "Lembaga pelatihan",
    items: [
      { href: "https://ppid.sipelatihaksi.com/", label: "BPPP Medan" },
      { href: "https://sites.google.com/view/ppidbppakkp", label: "BDA Sukamandi" },
      { href: "https://bppptegal.id/tentang-kami", label: "BPPP Tegal" },
      { href: "https://www.bpppbanyuwangi.com/", label: "BPPP Banyuwangi" },
      { href: "https://bp3ambon.kkp.go.id/", label: "BPPP Ambon" },
      { href: "https://bpppbitung.id/", label: "BPPP Bitung" },
      { href: "/p2mkp", label: "P2MKP (Pelatihan Mandiri)" },
    ],
  },
];

const isExternal = (h: string) => /^https?:\/\//.test(h);
const isFile = (h: string) => /\.pdf$/i.test(h);

function FooterLink({ href, label }: Item) {
  const cls = "group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none";
  if (isExternal(href) || isFile(href))
    return (
      <a href={href} target="_blank" rel="noopener" className={cls}>
        {label}
        <ArrowUpRight className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
        <span className="sr-only">(tab baru)</span>
      </a>
    );
  return <Link href={href} className={cls}>{label}</Link>;
}

const SOCIALS = [
  {
    href: "https://www.instagram.com/bppsdm_puslatkp",
    label: "Instagram Pusat Pelatihan KP",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm5.4-9.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  },
  {
    href: `https://wa.me/${WA}`,
    label: "WhatsApp Call Center E-LAUT",
    path: "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6A11.8 11.8 0 0 0 23.8 12c0-3.2-1.2-6.1-3.4-8.4Z",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  // Sembunyikan footer bila cookie XSRF087 ada — dijalankan sebelum paint, tanpa hydration mismatch
  const gate = `try{if(document.cookie.split('; ').some(function(c){return c.indexOf('${COOKIE_FIRST_TIMER}=')===0})){var s=document.createElement('style');s.textContent='#site-footer{display:none!important}';document.head.appendChild(s)}}catch(e){}`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: gate }} />
      <footer id="site-footer" aria-labelledby="footer-title" className="relative isolate overflow-hidden border-t border-white/10 bg-[#020617] font-jakarta text-white">
        <h2 id="footer-title" className="sr-only">Informasi E-LAUT KKP</h2>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_0%_100%,#2563EB26_0%,transparent_65%),radial-gradient(40%_50%_at_100%_0%,#0EA5E91a_0%,transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_top,black,transparent_80%)]" />
        {/* testing */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2.8fr]">
            {/* Identitas (NAP) */}
            <div itemScope itemType="https://schema.org/GovernmentOrganization">
              <Link href="/" aria-label="E-LAUT KKP — beranda" className="inline-block">
                <LogoFooter />
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                <strong className="font-semibold text-slate-200" itemProp="name">E-LAUT</strong> adalah layanan pelatihan kelautan dan perikanan dari{" "}
                <span itemProp="parentOrganization">BPPSDM KP, Kementerian Kelautan dan Perikanan RI</span> — untuk masyarakat, pelaku usaha, dan aparatur KP.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" aria-hidden />
                  <span itemProp="address">Pusat Pelatihan Kelautan dan Perikanan, BPPSDM KP · Jakarta, Indonesia</span>
                </li>
                <li>
                  <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white">
                    <MessageCircle className="h-4 w-4 text-emerald-300" aria-hidden /> <span itemProp="telephone">+62 811-8808-8767</span>
                  </a>
                </li>
                <li>
                  <Link href="/layanan/publik/masukan-saran" className="inline-flex items-center gap-2 hover:text-white">
                    <Mail className="h-4 w-4 text-amber-300" aria-hidden /> Kirim masukan &amp; saran
                  </Link>
                </li>
              </ul>
              <ul className="mt-5 flex gap-2" aria-label="Media sosial">
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener" aria-label={s.label} title={s.label} itemProp="sameAs" className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-slate-300 ring-1 ring-white/10 transition-colors hover:bg-white hover:text-[#0B1B3F]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden><path d={s.path} /></svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tautan */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {GROUPS.map((g) => (
                <nav key={g.title} aria-label={g.title}>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/80">{g.title}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {g.items.map((it) => (
                      <li key={it.href}><FooterLink {...it} /></li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          {/* Bawah */}
          <div className="mt-12 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {year}{" "}
              <a href="https://kkp.go.id/unit-kerja/bppsdmkp.html" target="_blank" rel="noopener" className="hover:text-white">BPPSDM KP</a> ·{" "}
              <a href="https://kkp.go.id" target="_blank" rel="noopener" className="hover:text-white">Kementerian Kelautan dan Perikanan RI</a>. Hak cipta dilindungi.
            </p>
            <nav aria-label="Tautan bantuan" className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/tentang" className="hover:text-white">Tentang E-LAUT</Link>
              <Link href="/layanan/regulasi" className="hover:text-white">Regulasi</Link>
              <Link href="/sitemap.xml" className="hover:text-white">Peta situs</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}

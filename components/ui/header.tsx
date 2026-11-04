"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  HiMiniChevronDown, HiHome, HiNewspaper, HiIdentification, HiOutlineClipboardDocumentCheck, HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight, HiOutlineChartBar, HiOutlineChatBubbleBottomCenterText, HiOutlineUsers,
  HiOutlineBuildingOffice2, HiOutlineShieldCheck, HiOutlineAcademicCap, HiOutlineInformationCircle, HiOutlinePlayCircle,
  HiBars3, HiXMark,
} from "react-icons/hi2";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { useLanguage } from "@/context/LanguageContext";

const COOKIE_FIRST_TIMER = "XSRF087";
const COOKIE_AUTH = "XSRF081";
const LOGO_PATH = "/logo-kkp-full-white.png";
const HIDDEN_PATHS = ["pre-test", "post-test", "/e-katalog", "instruktur", "p2mkp/laporan-kegiatan", "p2mkp/dashboard", "/login", "/charts", "/admin", "/lemdiklat", "/pusat"];

type IconT = React.ComponentType<{ className?: string }>;
type Item = { href: string; label: string; sub?: string; icon: IconT; accent?: string };

const KATEGORI: Item[] = [
  { href: "/layanan/pelatihan/program/perikanan", label: "Pelatihan Perikanan", sub: "Budidaya, pengolahan & penangkapan", icon: HiOutlineAcademicCap, accent: "#06B6D4" },
  { href: "/layanan/pelatihan/program/kelautan", label: "Pelatihan Kelautan", sub: "Konservasi & ruang laut", icon: HiOutlineAcademicCap, accent: "#6366F1" },
  { href: "/layanan/pelatihan/program/akp", label: "Awak Kapal Perikanan", sub: "Sertifikasi & kompetensi AKP", icon: HiOutlineAcademicCap, accent: "#3B82F6" },
];

const LAYANAN_UTAMA: Item[] = [
  { href: "/layanan/cek-sertifikat", label: "Cek Sertifikat", sub: "Verifikasi STTPL & NIK", icon: HiIdentification, accent: "#14B8A6" },
  { href: "/layanan/pelatihan/video/gratis", label: "Video Pelatihan", sub: "Materi visual gratis", icon: HiOutlinePlayCircle, accent: "#F43F5E" },
  { href: "/layanan/materi-pelatihan", label: "Materi Pelatihan", sub: "Modul & bahan ajar", icon: HiOutlineDocumentText, accent: "#F59E0B" },
  { href: "/p2mkp", label: "Penetapan P2MKP", sub: "Lembaga pelatihan mandiri", icon: HiOutlineBuildingOffice2, accent: "#8B5CF6" },
];

const LAYANAN_GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Informasi & transparansi",
    items: [
      { href: "/layanan/regulasi", label: "Regulasi Pelatihan", sub: "Dasar hukum & aturan", icon: HiOutlineDocumentText },
      { href: "/files/Standar Pelayanan P2MKP.pdf", label: "Standar Pelayanan", sub: "Prosedur pelayanan (PDF)", icon: HiOutlineClipboardDocumentCheck },
      { href: "/layanan/publik/maklumat-pelayanan", label: "Maklumat Pelayanan", sub: "Komitmen pelayanan", icon: HiOutlineShieldCheck },
      { href: "/layanan/survey-kepuasan", label: "Survei Kepuasan", sub: "Beri penilaian layanan", icon: HiOutlineChartBar },
      { href: "/layanan/hasil-survey", label: "Hasil Survei SKM", sub: "Laporan akuntabilitas", icon: HiOutlineChartBar },
    ],
  },
  {
    title: "Bantuan, aduan & integritas",
    items: [
      { href: "https://rumah-aspirasi-digital-smoky.vercel.app/", label: "Pengaduan & Aspirasi", sub: "Rumah Aspirasi Digital", icon: HiOutlineChatBubbleBottomCenterText },
      { href: "/layanan/publik/masukan-saran", label: "Masukan & Saran", sub: "Kirim masukan", icon: HiOutlineChatBubbleBottomCenterText },
      { href: "https://span.lapor.go.id", label: "SP4N-LAPOR!", sub: "Aduan pelayanan publik", icon: HiOutlineChatBubbleLeftRight },
      { href: "https://gol.kpk.go.id/login", label: "GOL KPK", sub: "Gratifikasi online", icon: HiOutlineShieldCheck },
      { href: "https://wbs.kkp.go.id/register", label: "WBS KKP", sub: "Whistleblowing system", icon: HiOutlineShieldCheck },
    ],
  },
];

const LOGIN: Item[] = [
  { href: "/login", label: "Masyarakat", sub: "Peserta pelatihan", icon: HiOutlineUsers },
  { href: "/p2mkp/login", label: "P2MKP", sub: "Lembaga mandiri", icon: HiOutlineBuildingOffice2 },
  { href: "/admin/auth/login", label: "Pengelola / Admin", sub: "Administrator sistem", icon: HiOutlineShieldCheck },
];

const isExternal = (href: string) => /^https?:\/\//.test(href) || href.endsWith(".pdf");

/* ============================ HEADER ============================ */

export default function Header() {
  const pathname = usePathname() || "/";
  const { t } = useLanguage();
  const [top, setTop] = React.useState(true);
  const [open, setOpen] = React.useState<null | "kategori" | "layanan" | "login">(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Cookie dibaca setelah mount → HTML server & client sama (tanpa hydration mismatch)
  const [auth, setAuth] = React.useState<{ ready: boolean; loggedIn: boolean; firstTimer: boolean }>({ ready: false, loggedIn: false, firstTimer: false });

  React.useEffect(() => {
    setAuth({ ready: true, loggedIn: !!Cookies.get(COOKIE_AUTH), firstTimer: !!Cookies.get(COOKIE_FIRST_TIMER) });
    const onScroll = () => setTop(window.scrollY <= 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup dropdown saat pindah halaman / Esc
  React.useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  // Kunci scroll halaman saat menu mobile terbuka; tutup otomatis bila layar melebar ke desktop
  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = prev;
      mq.removeEventListener("change", onChange);
    };
  }, [mobileOpen]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (auth.firstTimer || HIDDEN_PATHS.some((p) => pathname.includes(p))) return null;

  const layananActive = pathname.startsWith("/layanan/publik") || pathname === "/layanan/cek-sertifikat" || pathname.startsWith("/p2mkp") || pathname === "/layanan/materi-pelatihan" || pathname.startsWith("/layanan/regulasi");

  return (
    <header className={`fixed inset-x-0 top-0 z-[99999] font-jakarta transition-[padding] duration-300 ${top ? "py-3 md:py-5" : "py-2"}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div
          className={`relative flex h-16 md:h-[72px] items-center justify-between rounded-[1.75rem] px-3 md:px-6 transition-all duration-300 ${top ? "bg-transparent" : "bg-[#0B1B3F]/85 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]"}`}
        >
          {/* Logo */}
          <Link href="/" aria-label="E-LAUT — Beranda" className="group flex shrink-0 items-center gap-2.5">
            <Image src={LOGO_PATH} alt="Logo Kementerian Kelautan dan Perikanan" width={150} height={150} priority className="w-11 sm:w-12 md:w-14 transition-transform duration-300 group-hover:scale-105" />
            <span className="hidden sm:block leading-tight">
              <span className="block font-calsans text-lg text-white">E-LAUT</span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-sky-200/70">Pelatihan KKP</span>
            </span>
          </Link>

          {/* Navigasi desktop — semua tautan ada di HTML (terbaca mesin pencari), dropdown hanya disembunyikan */}
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center">
            <ul className="flex items-center gap-0.5">
              <NavLink href="/" label={t("nav.home")} icon={HiHome} active={pathname === "/"} />
              <NavLink href="/tentang" label="Tentang" icon={HiOutlineInformationCircle} active={pathname === "/tentang"} />

              <Dropdown id="kategori" label="Kategori Pelatihan" icon={HiOutlineAcademicCap} active={pathname.startsWith("/layanan/pelatihan/program")} open={open} setOpen={setOpen} panelClass="left-1/2 -translate-x-1/2 w-[620px]">
                <PanelHead eyebrow="Program pelatihan" title="Pilih kategori sesuai minat dan keahlian Anda" />
                <ul className="grid grid-cols-3 gap-2.5 px-4 pb-4">
                  {KATEGORI.map((k) => (
                    <li key={k.href}>
                      <FeatureCard item={k} />
                    </li>
                  ))}
                </ul>
              </Dropdown>

              <Dropdown id="layanan" label="Layanan & Pengaduan" icon={HiNewspaper} active={layananActive} open={open} setOpen={setOpen} panelClass="right-0 w-[min(820px,calc(100vw-4rem))]">
                <ul className="grid grid-cols-4 gap-2.5 p-3">
                  {LAYANAN_UTAMA.map((k) => (
                    <li key={k.href}>
                      <FeatureCard item={k} compact />
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-2 px-3 pb-4 border-t border-white/10 pt-3">
                  {LAYANAN_GROUPS.map((g) => (
                    <div key={g.title}>
                      <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/60">{g.title}</p>
                      <ul className="space-y-0.5">
                        {g.items.map((it) => (
                          <li key={it.href}>
                            <MenuItem item={it} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Dropdown>
            </ul>

            <div className="ml-3 pl-3 border-l border-white/10 min-w-[104px] flex justify-end">
              {!auth.ready ? (
                <span className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" aria-hidden />
              ) : auth.loggedIn ? (
                <DropdownUserPelatihan top={top} />
              ) : (
                <Dropdown id="login" label="Masuk" open={open} setOpen={setOpen} panelClass="right-0 w-64" trigger="button">
                  <ul className="p-2 space-y-0.5">
                    {LOGIN.map((it) => (
                      <li key={it.href}>
                        <MenuItem item={it} />
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              )}
            </div>
          </nav>

          {/* Mobile: tombol menu */}
          <div className="lg:hidden flex items-center gap-2">
            {auth.ready && auth.loggedIn && <DropdownUserPelatihan top={top} />}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              className={`grid place-items-center w-11 h-11 rounded-xl ring-1 transition-colors ${mobileOpen ? "bg-white text-[#0B1B3F] ring-white" : "bg-white/10 text-white ring-white/20 hover:bg-white/20"}`}
            >
              {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <MobileNav open={mobileOpen} pathname={pathname} homeLabel={t("nav.home")} showLogin={auth.ready && !auth.loggedIn} onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}

/* ============================ BAGIAN ============================ */

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: IconT; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`relative isolate flex items-center gap-2 h-10 px-3.5 rounded-xl text-sm font-semibold transition-colors ${active ? "text-white bg-white/[0.12] ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : "text-blue-100/75 hover:text-white hover:bg-white/[0.06]"}`}
      >
        <Icon className="w-[18px] h-[18px]" /> {label}
      </Link>
    </li>
  );
}

/**
 * Dropdown: buka dengan hover, klik, atau keyboard (Enter/Space, Esc menutup).
 * Panel selalu dirender (hanya `invisible`) agar tautannya tetap terindeks.
 */
function Dropdown({
  id, label, icon: Icon, active, open, setOpen, panelClass, trigger = "nav", children,
}: {
  id: "kategori" | "layanan" | "login";
  label: string;
  icon?: IconT;
  active?: boolean;
  open: string | null;
  setOpen: (v: null | "kategori" | "layanan" | "login") => void;
  panelClass: string;
  trigger?: "nav" | "button";
  children: React.ReactNode;
}) {
  const isOpen = open === id;
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const enter = () => {
    clearTimeout(timer.current);
    setOpen(id);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(null), 120); // jeda kecil agar tidak tertutup saat kursor pindah ke panel
  };
  const Wrapper = trigger === "nav" ? "li" : "div";

  return (
    <Wrapper className="relative" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={(e: React.FocusEvent) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(null)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`menu-${id}`}
        onClick={() => setOpen(isOpen ? null : id)}
        className={
          trigger === "button"
            ? "h-10 px-5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 text-sm font-bold inline-flex items-center gap-1.5 hover:bg-blue-500 transition-colors"
            : `flex items-center gap-2 h-10 px-3.5 rounded-xl text-sm font-semibold transition-colors ${active || isOpen ? "text-white bg-white/[0.12] ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : "text-blue-100/75 hover:text-white hover:bg-white/[0.06]"}`
        }
      >
        {Icon && <Icon className="w-[18px] h-[18px]" />}
        {label}
        <HiMiniChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        id={`menu-${id}`}
        className={`absolute top-full pt-3 ${panelClass} transition-all duration-150 ${isOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-1 pointer-events-none"}`}
      >
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_60%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-50" />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          {children}
        </div>
      </div>
    </Wrapper>
  );
}

function PanelHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="px-5 pt-4 pb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/70">{eyebrow}</p>
      <p className="mt-0.5 text-sm text-blue-100/70">{title}</p>
    </div>
  );
}

function SmartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FeatureCard({ item, compact }: { item: Item; compact?: boolean }) {
  const accent = item.accent || "#3B82F6";
  return (
    <SmartLink
      href={item.href}
      className={`group relative isolate overflow-hidden flex ${compact ? "items-center gap-3 p-3" : "flex-col gap-3 p-4"} h-full rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition-all hover:bg-white/[0.12] hover:ring-white/25 hover:-translate-y-0.5`}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to left, ${accent}40 0%, transparent 75%)` }} />
      <item.icon aria-hidden className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-10 group-hover:opacity-25 transition-opacity" />
      <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl text-white shadow-md" style={{ background: accent, boxShadow: `0 6px 16px -6px ${accent}` }}>
        <item.icon className="w-5 h-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-white leading-snug">{item.label}</span>
        {item.sub && <span className="block mt-0.5 text-[10px] text-blue-100/60 leading-snug">{item.sub}</span>}
      </span>
    </SmartLink>
  );
}

function MenuItem({ item }: { item: Item }) {
  return (
    <SmartLink href={item.href} className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.08]">
      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-white/10 ring-1 ring-white/10 text-sky-200 group-hover:text-white">
        <item.icon className="w-4 h-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-white leading-snug">{item.label}</span>
        {item.sub && <span className="block text-[10px] text-blue-100/55 truncate">{item.sub}</span>}
      </span>
    </SmartLink>
  );
}

/* ============================ MOBILE ============================ */

/** Menu mobile (< lg) — panel turun di bawah bar, isi = data yang sama dengan desktop. */
function MobileNav({ open, pathname, homeLabel, showLogin, onNavigate }: { open: boolean; pathname: string; homeLabel: string; showLogin: boolean; onNavigate: () => void }) {
  const [section, setSection] = React.useState<string | null>("kategori");
  const groups: { id: string; label: string; icon: IconT; items: Item[] }[] = [
    { id: "kategori", label: "Kategori Pelatihan", icon: HiOutlineAcademicCap, items: KATEGORI },
    { id: "layanan", label: "Layanan Utama", icon: HiNewspaper, items: LAYANAN_UTAMA },
    ...LAYANAN_GROUPS.map((g, i) => ({ id: `grup-${i}`, label: g.title.charAt(0).toUpperCase() + g.title.slice(1), icon: i === 0 ? HiOutlineDocumentText : HiOutlineChatBubbleLeftRight, items: g.items })),
  ];

  return (
    <div
      id="mobile-nav"
      className={`lg:hidden mt-2 overflow-hidden rounded-[1.75rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] transition-all duration-300 ${open ? "max-h-[calc(100dvh-6rem)] opacity-100 visible" : "max-h-0 opacity-0 invisible"}`}
    >
      <nav aria-label="Navigasi mobile" className="relative isolate max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain p-3 space-y-2">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_0%_0%,#2563EB_0%,transparent_60%)] opacity-50" />
        <ul className="grid grid-cols-2 gap-2">
          {[
            { href: "/", label: homeLabel, icon: HiHome },
            { href: "/tentang", label: "Tentang", icon: HiOutlineInformationCircle },
          ].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={onNavigate}
                aria-current={pathname === l.href ? "page" : undefined}
                className={`flex items-center gap-2 h-11 px-3 rounded-xl text-sm font-semibold ring-1 transition-colors ${pathname === l.href ? "bg-white/[0.14] ring-white/25 text-white" : "bg-white/[0.05] ring-white/10 text-blue-100/80 hover:text-white"}`}
              >
                <l.icon className="w-5 h-5" /> {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {groups.map((g) => {
          const isOpen = section === g.id;
          return (
            <div key={g.id} className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
              <button type="button" onClick={() => setSection(isOpen ? null : g.id)} aria-expanded={isOpen} className="w-full flex items-center gap-2.5 px-3.5 h-12 text-sm font-bold text-white">
                <g.icon className="w-5 h-5 text-sky-300" /> {g.label}
                <HiMiniChevronDown className={`ml-auto w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {/* Tetap di DOM (disembunyikan) agar tautan terbaca mesin pencari */}
              <ul className={`px-1.5 pb-1.5 space-y-0.5 ${isOpen ? "" : "hidden"}`} onClick={onNavigate}>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <MenuItem item={it} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {showLogin && (
          <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/70">Masuk sebagai</p>
            <div className="grid grid-cols-1 gap-1.5">
              {LOGIN.map((it, i) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 h-11 px-3.5 rounded-xl text-sm font-bold transition-colors ${i === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500" : "bg-white/[0.06] ring-1 ring-white/10 text-white hover:bg-white/[0.12]"}`}
                >
                  <it.icon className="w-5 h-5" /> {it.label}
                  <span className="ml-auto text-[11px] font-medium opacity-70">{it.sub}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

export function DropdownItem({ href, label, subLabel, icon }: { href: string; label: string; subLabel?: string; icon: React.ReactNode }) {
  return (
    <SmartLink href={href} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.08]">
      <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/10 text-sky-200 text-lg group-hover:text-white">{icon}</span>
      <span className="min-w-0 text-left">
        <span className="block text-[13px] font-bold text-white leading-snug">{label}</span>
        {subLabel && <span className="block text-[10px] text-blue-100/55 truncate">{subLabel}</span>}
      </span>
    </SmartLink>
  );
}

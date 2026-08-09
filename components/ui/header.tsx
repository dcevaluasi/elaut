"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMiniChevronDown,
  HiHome,
  HiNewspaper,
  HiIdentification,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineShieldCheck,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
  HiOutlineLifebuoy,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import Cookies from "js-cookie";
import MobileMenu from "./mobile-menu";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { Button } from "./button";
import { useLanguage } from "@/context/LanguageContext";

const COOKIE_FIRST_TIMER = "XSRF087";
const COOKIE_AUTH = "XSRF081";
const LOGO_PATH = "/logo-kkp-full-white.png";

const HIDDEN_PATHS = [
  "pre-test",
  "post-test",
  "/e-katalog",
  "instruktur",
  "p2mkp/laporan-kegiatan",
  "p2mkp/dashboard",
  "/login",
  "/charts",
  "/admin",
  "/lemdiklat",
  "/pusat"
];

function NavLinkDefault({
  href,
  name,
  icon,
  isActive,
}: {
  href: string;
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <li>
      <Link href={href} className="relative group px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300">
        <span className={`relative z-10 flex items-center gap-2 ${isActive ? "text-blue-400" : "text-gray-300 group-hover:text-white"}`}>
          <span className="text-lg">{icon}</span>
          <span className="text-sm tracking-wide">{name}</span>
        </span>
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            className="absolute inset-0 bg-blue-500/10 rounded-xl border border-blue-500/20"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </li>
  );
}

export default function Header() {
  const [top, setTop] = React.useState(true);
  const [openLayanan, setOpenLayanan] = React.useState(false);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openKategori, setOpenKategori] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  React.useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const isAuthenticated = Cookies.get(COOKIE_AUTH);
  const isFirstTimerUser = Cookies.get(COOKIE_FIRST_TIMER);
  const shouldHideHeader = HIDDEN_PATHS.some((path) => pathname.includes(path));

  if (isFirstTimerUser || shouldHideHeader) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 right-0 z-99999 transition-all duration-500 ${top ? "py-4 md:py-6" : "py-2 md:py-3"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative flex items-center justify-between h-16 md:h-20 px-4 md:px-8 rounded-[2rem] transition-all duration-500 ${top
            ? "bg-transparent"
            : "bg-[#020617]/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            }`}
        >
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image
                      className="w-12 sm:w-14 md:w-16 lg:w-16 relative z-10 transition-transform duration-300 group-hover:scale-105"
                      width={150}
                      height={150}
                      src={LOGO_PATH}
                      alt="Logo KKP"
                    />
                  </div>
                </Link>
              </motion.div>

            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <ul className="flex items-center gap-1">
              <NavLinkDefault
                href="/"
                name={t("nav.home")}
                icon={<HiHome />}
                isActive={pathname === "/"}
              />

              <NavLinkDefault
                href="/tentang"
                name="Tentang"
                icon={<HiOutlineInformationCircle />}
                isActive={pathname === "/tentang"}
              />

              {/* Kategori Pelatihan Dropdown */}
              <li className="relative">
                <button
                  onMouseEnter={() => setOpenKategori(true)}
                  onMouseLeave={() => setOpenKategori(false)}
                  className={`group relative px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300 ${pathname.startsWith("/layanan/pelatihan") ? "text-blue-400" : "text-gray-300 hover:text-white"
                    }`}
                >
                  <HiOutlineAcademicCap className="text-lg" />
                  <span className="text-sm tracking-wide">Kategori Pelatihan</span>
                  <HiMiniChevronDown
                    className={`transition-transform duration-300 ${openKategori ? "rotate-180" : ""}`}
                  />

                  <AnimatePresence>
                    {openKategori && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[600px] rounded-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-2xl ${top ? "bg-[#080f1c]/98" : "bg-[#080f1c]"}`}
                        onMouseEnter={() => setOpenKategori(true)}
                        onMouseLeave={() => setOpenKategori(false)}
                      >
                        <div className="px-6 pt-5 pb-3">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em]">Program Pelatihan</p>
                          <h4 className="text-sm font-medium text-gray-400 mt-1">Pilih kategori pelatihan sesuai minat dan keahlian Anda</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3 px-4 pb-5 mt-1">
                          <KategoriCard
                            href="/layanan/pelatihan/program/perikanan"
                            emoji="🐟"
                            label="Perikanan"
                            desc="Budidaya & Pengolahan"
                            color="from-cyan-500/20 to-blue-500/20"
                            borderColor="border-cyan-500/30"
                          />
                          <KategoriCard
                            href="/layanan/pelatihan/program/kelautan"
                            emoji="🌊"
                            label="Kelautan"
                            desc="Konservasi & Ruang Laut"
                            color="from-indigo-500/20 to-blue-600/20"
                            borderColor="border-indigo-500/30"
                          />
                          <KategoriCard
                            href="/layanan/pelatihan/program/akp"
                            emoji="⚓"
                            label="Awak Kapal"
                            desc="Sertifikasi & Kompetensi"
                            color="from-blue-600/20 to-violet-500/20"
                            borderColor="border-blue-500/30"
                          />
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </li>



              <li className="relative">
                <button
                  onMouseEnter={() => setOpenLayanan(true)}
                  onMouseLeave={() => setOpenLayanan(false)}
                  className={`group relative px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300 ${pathname.startsWith("/layanan/publik") ||
                    pathname === "/layanan/cek-sertifikat" ||
                    pathname.startsWith("/p2mkp") ||
                    pathname === "/layanan/materi-pelatihan"
                    ? "text-blue-400"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  <HiNewspaper className="text-lg" />
                  <span className="text-sm tracking-wide">Layanan & Pengaduan</span>
                  <HiMiniChevronDown className={`transition-transform duration-300 ${openLayanan ? "rotate-180" : ""}`} />

                  <AnimatePresence>
                    {openLayanan && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`absolute right-0 top-full mt-3 w-[820px] rounded-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-2xl ${top ? "bg-[#080f1c]/98" : "bg-[#080f1c]"
                          }`}
                        onMouseEnter={() => setOpenLayanan(true)}
                        onMouseLeave={() => setOpenLayanan(false)}
                      >
                        {/* Bento Style Featured Grid */}
                        <div className="grid grid-cols-4 gap-2.5 m-3">
                          <Link
                            href="/layanan/cek-sertifikat"
                            className="group/feat flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all duration-300"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center text-teal-400 text-xl group-hover/feat:scale-110 group-hover/feat:bg-teal-500/25 transition-all">
                              <HiIdentification />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-white group-hover/feat:text-teal-300 transition-colors">Cek Sertifikat</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Verifikasi hasil pelatihan</p>
                            </div>
                          </Link>

                          <Link
                            href="/layanan/pelatihan/video/gratis"
                            className="group/feat2 flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center text-red-500 text-xl group-hover/feat2:scale-110 group-hover/feat2:bg-red-500/25 transition-all">
                              <HiOutlineLifebuoy />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-white group-hover/feat2:text-red-300 transition-colors">Video Pelatihan</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Materi visual gratis</p>
                            </div>
                          </Link>

                          <Link
                            href="/layanan/materi-pelatihan"
                            className="group/feat4 flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-500 text-xl group-hover/feat4:scale-110 group-hover/feat4:bg-amber-500/25 transition-all">
                              <HiOutlineDocumentText />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-white group-hover/feat4:text-amber-300 transition-colors">Materi Pelatihan</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Modul & bahan ajar</p>
                            </div>
                          </Link>

                          <Link
                            href="/p2mkp"
                            className="group/feat3 flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-500 text-xl group-hover/feat3:scale-110 group-hover/feat3:bg-violet-500/25 transition-all">
                              <HiOutlineBuildingOffice2 />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-white group-hover/feat3:text-violet-300 transition-colors">Penetapan P2MKP</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Status lembaga mandiri</p>
                            </div>
                          </Link>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-2">
                          <div className="h-px flex-1 bg-white/[0.03]" />
                          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">Direktori Layanan Publik</p>
                          <div className="h-px flex-1 bg-white/[0.03]" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 px-4 pb-5 mt-2">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/40 px-3 mb-2">Informasi & Transparansi</p>
                            <DropdownItem href="/layanan/regulasi" label="Regulasi Pelatihan" subLabel="Dasar hukum & aturan" icon={<HiOutlineDocumentText />} />
                            <DropdownItem href="/layanan/standar-pelayanan" label="Standar Pelayanan" subLabel="Prosedur pelayanan" icon={<HiOutlineClipboardDocumentCheck />} />
                            <DropdownItem href="/layanan/publik/maklumat-pelayanan" label="Maklumat Pelayanan" subLabel="Komitmen kami" icon={<HiOutlineShieldCheck />} />

                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/40 px-3 mb-2 pt-4">Data Kepuasan</p>
                            <DropdownItem href="/layanan/survey-kepuasan" label="Survei Kepuasan" subLabel="Beri penilaian" icon={<HiOutlineChartBar />} />
                            <DropdownItem href="/layanan/hasil-survey" label="Hasil Survei SKM" subLabel="Laporan akuntabilitas" icon={<HiOutlineChartBar />} />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/40 px-3 mb-2">Pusat Bantuan & Aduan</p>
                            <DropdownItem href="/layanan/publik/masukan-saran" label="Masukan & Saran" subLabel="Kirim feedback" icon={<HiOutlineChatBubbleBottomCenterText />} />
                            <DropdownItem href="https://span.lapor.go.id" label="SPAN Lapor" subLabel="Lapor ke pusat" icon={<HiOutlineChatBubbleLeftRight />} />
                            <DropdownItem href="https://www.lapor.go.id/" label="e-LAPOR" subLabel="Laporan online" icon={<HiOutlineChatBubbleLeftRight />} />

                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/40 px-3 mb-2 pt-4">Sistem Integritas</p>
                            <DropdownItem href="https://gol.kpk.go.id/login" label="GOL KPK" subLabel="Gratifikasi Online" icon={<HiOutlineShieldCheck />} />
                            <DropdownItem href="https://wbs.kkp.go.id/register" label="WBS KKP" subLabel="Whistleblowing" icon={<HiOutlineChatBubbleBottomCenterText />} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            </ul>

            <div className="ml-4 pl-4 border-l border-white/10">
              {isAuthenticated ? (
                <DropdownUserPelatihan top={top} />
              ) : (
                <div className="relative">
                  <Button
                    onMouseEnter={() => setOpenLogin(true)}
                    onMouseLeave={() => setOpenLogin(false)}
                    className="relative group overflow-hidden rounded-2xl bg-blue-600 px-8 py-2.5 transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    <span className="relative z-10 text-white font-semibold flex items-center gap-2">
                      Login
                      <HiMiniChevronDown className={`transition-transform duration-300 ${openLogin ? "rotate-180" : ""}`} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>

                  <AnimatePresence>
                    {openLogin && (
                      <motion.div
                        onMouseEnter={() => setOpenLogin(true)}
                        onMouseLeave={() => setOpenLogin(false)}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute right-0 top-full mt-2 w-64 rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-2xl ${top ? "bg-[#0f172a]/95" : "bg-[#0a111e]"}`}
                      >
                        <div className="p-2 space-y-1">
                          <DropdownItem
                            href="/login"
                            label="Masyarakat"
                            subLabel="Peserta Pelatihan"
                            icon={<HiOutlineUsers />}
                          />
                          <DropdownItem
                            href="/p2mkp/login"
                            label="P2MKP"
                            subLabel="Lembaga Mandiri"
                            icon={<HiOutlineBuildingOffice2 />}
                          />
                          <DropdownItem
                            href="/admin/auth/login"
                            label="Pengelola/Admin"
                            subLabel="Administrator System"
                            icon={<HiOutlineShieldCheck />}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </nav>

          {/* Mobile Menu Button */}
          <nav className="lg:hidden">
            <MobileMenu isTop={top} />
          </nav>
        </div>
      </div>
    </motion.header >
  );
}

export function DropdownItem({
  href,
  label,
  subLabel,
  icon,
}: {
  href: string;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-white/[0.06] border border-transparent hover:border-white/5 group/item"
    >
      <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-blue-500/10 text-blue-400 group-hover/item:scale-110 group-hover/item:bg-blue-500/20 group-hover/item:text-blue-300 transition-all duration-300">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col text-left min-w-0">
        <span className="text-[13px] font-bold text-white group-hover/item:text-blue-300 transition-colors leading-snug">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-gray-500 font-medium mt-1 leading-tight truncate group-hover/item:text-gray-400 transition-colors">
            {subLabel}
          </span>
        )}
      </div>
    </Link>
  );
}

function KategoriCard({
  href,
  emoji,
  label,
  desc,
  color,
  borderColor,
}: {
  href: string;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  borderColor?: string;
}) {
  return (
    <Link
      href={href}
      className={`group/card flex flex-col gap-4 p-5 rounded-2xl border ${borderColor || "border-white/5"
        } hover:border-blue-500/40 bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10`}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-xl group-hover/card:scale-110 transition-transform duration-300`}
      >
        {emoji}
      </div>
      <div>
        <p className="text-sm font-bold text-white group-hover/card:text-blue-300 transition-colors leading-tight">
          {label}
        </p>
        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </Link>
  );
}


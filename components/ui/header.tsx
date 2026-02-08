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
} from "react-icons/hi2";
import Cookies from "js-cookie";
import MobileMenu from "./mobile-menu";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { Button } from "./button";
import LanguageSwitcher from "./LanguageSwitcher";
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
  "/login"
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
      className={`fixed left-0 right-0 z-[999999] transition-all duration-500 ${top ? "py-4 md:py-6" : "py-2 md:py-3"
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
              {pathname !== "/" && (
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
                        className="w-12 sm:w-14 md:w-16 lg:w-20 relative z-10 transition-transform duration-300 group-hover:scale-105"
                        width={200}
                        height={200}
                        src={LOGO_PATH}
                        alt="Logo KKP"
                      />
                    </div>
                  </Link>
                </motion.div>
              )}
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
                href="/layanan/cek-sertifikat"
                name={"Cek Sertifikat"}
                icon={<HiIdentification />}
                isActive={pathname === "/layanan/cek-sertifikat"}
              />

              <li className="relative">
                <button
                  onMouseEnter={() => setOpenLayanan(true)}
                  onMouseLeave={() => setOpenLayanan(false)}
                  className={`group relative px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300 ${pathname.startsWith("/layanan/publik") ? "text-blue-400" : "text-gray-300 hover:text-white"
                    }`}
                >
                  <HiNewspaper className="text-lg" />
                  <span className="text-sm tracking-wide">Layanan & Pengaduan</span>
                  <HiMiniChevronDown
                    className={`transition-transform duration-300 ${openLayanan ? "rotate-180" : ""}`}
                  />

                  <AnimatePresence>
                    {openLayanan && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-80 rounded-3xl overflow-hidden bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                      >
                        <div className="p-2 space-y-1">
                          <DropdownItem
                            href="/layanan/regulasi"
                            label="Regulasi Pelatihan"
                            subLabel="Repository Peraturan & UU"
                            icon={<HiOutlineDocumentText />}
                          />
                          <DropdownItem
                            href="/layanan/publik/maklumat-pelayanan"
                            label="Maklumat Pelayanan"
                            icon={<HiOutlineClipboardDocumentCheck />}
                          />
                          <DropdownItem
                            href="/layanan/standar-pelayanan"
                            label="Standar Pelayanan"
                            icon={<HiOutlineDocumentText />}
                          />
                          <DropdownItem
                            href="https://span.lapor.go.id"
                            label="SPAN Lapor"
                            icon={<HiOutlineChatBubbleLeftRight />}
                          />
                          <DropdownItem
                            href="/layanan/survey-kepuasan"
                            label="Susan KKP"
                            subLabel="Survey Kepuasan Masyarakat"
                            icon={<HiOutlineChartBar />}
                          />
                          <DropdownItem
                            href="/layanan/hasil-survey"
                            label="Hasil Survei"
                            subLabel="Hasil Survei Kepuasan"
                            icon={<HiOutlineChartBar />}
                          />
                          <DropdownItem
                            href="/layanan/publik/masukan-saran"
                            label="Masukan & Saran"
                            icon={<HiOutlineChatBubbleBottomCenterText />}
                          />
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
                        className="absolute right-0 top-full mt-2 w-64 rounded-3xl overflow-hidden bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
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
          <div className="lg:hidden">
            <MobileMenu isTop={top} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function DropdownItem({
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
      className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-white/10 group/item"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-300">
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white group-hover/item:text-blue-400 transition-colors">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-gray-400 font-medium tracking-wide group-hover/item:text-gray-300 uppercase">
            {subLabel}
          </span>
        )}
      </div>
    </Link>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
} from "react-icons/hi2";
import Cookies from "js-cookie";
import MobileMenu from "./mobile-menu";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { Button } from "./button";

const COOKIE_FIRST_TIMER = "XSRF087";
const COOKIE_AUTH = "XSRF081";
const LOGO_PATH = "/logo-kkp-full-white.png";
const LOGO_SIZE = "w-16 md:w-20";

const HIDDEN_PATHS = [
  "pre-test",
  "post-test",
  "/e-katalog",
  "instruktur",
  "p2mkp/laporan-kegiatan",
];

const NAV_LINK_CLASS = "px-4 py-2 flex items-center gap-2 rounded-xl font-semibold transition duration-200 ease-in-out hover:text-blue-400 hover:scale-105";
const DROPDOWN_CONTAINER_CLASS = "absolute right-0 mt-4 w-80 rounded-3xl z-50 bg-white/20 backdrop-blur-3xl border border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200";

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
      <Link
        href={href}
        className={`${NAV_LINK_CLASS} ${isActive ? "text-blue-400" : "text-white"}`}
      >
        {icon}
        {name}
      </Link>
    </li>
  );
}

export default function Header() {
  const [top, setTop] = React.useState(true);
  const [openLayanan, setOpenLayanan] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  React.useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  const isFirstTimerUser = Cookies.get(COOKIE_FIRST_TIMER);
  const isAuthenticated = Cookies.get(COOKIE_AUTH);
  const shouldHideHeader = HIDDEN_PATHS.some((path) => pathname.includes(path));

  if (isFirstTimerUser || shouldHideHeader) {
    return null;
  }

  return (
    <header
      className={`fixed left-0 right-0 z-[999999] transition duration-300 ease-in-out ${top
        ? "bg-transparent"
        : "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
        }`}
    >
      <div className="max-w-6xl mx-auto mt-3 md:mt-6 px-3 md:px-5 rounded-3xl transition-all">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">
          {/* Logo - Always visible on mobile */}
          {pathname !== "/" && (
            <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 z-50">
              <Image
                className="w-12 sm:w-14 md:w-16 lg:w-20"
                width={0}
                height={0}
                src={LOGO_PATH}
                alt="Logo KKP"
              />
            </Link>
          )}

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden lg:flex lg:grow">
            <ul className="flex grow justify-end items-center gap-1">
              <NavLinkDefault
                href="/"
                name="Beranda"
                icon={<HiHome />}
                isActive={pathname === "/"}
              />

              <NavLinkDefault
                href="/layanan/cek-sertifikat"
                name="Cek Sertifikat"
                icon={<HiIdentification />}
                isActive={pathname === "/layanan/cek-sertifikat"}
              />

              <li className="relative">
                <button
                  onClick={() => setOpenLayanan(!openLayanan)}
                  className={`${NAV_LINK_CLASS} ${pathname.startsWith("/layanan/publik") ? "text-blue-400" : "text-white"
                    }`}
                >
                  <HiNewspaper />
                  Layanan & Pengaduan
                  <HiMiniChevronDown
                    className={`transition-transform duration-200 ${openLayanan ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {openLayanan && (
                  <div className={DROPDOWN_CONTAINER_CLASS}>
                    <ul className="flex flex-col p-2 text-sm text-white/90">
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
                        label="Survey Kepuasan Masyarakat (Susan KKP)"
                        icon={<HiOutlineChartBar />}
                      />
                      <DropdownItem
                        href="/layanan/hasil-survey"
                        label="Hasil Survei Kepuasan Masyarakat"
                        icon={<HiOutlineChartBar />}
                      />
                      <DropdownItem
                        href="/layanan/publik/masukan-saran"
                        label="Masukan & Saran"
                        icon={<HiOutlineChatBubbleBottomCenterText />}
                      />
                    </ul>
                  </div>
                )}
              </li>

              {isAuthenticated ? (
                <DropdownUserPelatihan top={top} />
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  className="rounded-xl border border-blue-400 bg-blue-500/20 text-white hover:bg-blue-500 hover:text-white px-6 py-2"
                >
                  Login
                </Button>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Button - Visible on mobile/tablet only */}
          <div className="lg:hidden">
            <MobileMenu isTop={top} />
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="
          flex items-center gap-3 px-4 py-3 rounded-2xl
          text-white/90
          transition-all duration-200
          hover:bg-white/15
          hover:text-white
          hover:translate-x-1
        "
      >
        <span className="text-lg opacity-80">{icon}</span>
        <span className="font-medium leading-tight">{label}</span>
      </Link>
    </li>
  );
}

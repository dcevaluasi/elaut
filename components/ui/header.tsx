"use client";

import React from "react";
import Link from "next/link";
import MobileMenu from "./mobile-menu";
import { usePathname, useRouter } from "next/navigation";
import {
  HiMiniChevronDown,
  HiHome,
  HiNewspaper,
  HiIdentification,
} from "react-icons/hi2";
import Cookies from "js-cookie";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import Image from "next/image";
import { Button } from "./button";

import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";


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

  const NavLinkDefault = ({
    href,
    name,
    icon,
  }: {
    href: string;
    name: string;
    icon: React.ReactNode;
  }) => (
    <li>
      <Link
        href={href}
        className={`px-4 py-2 flex items-center gap-2 rounded-xl font-semibold 
          transition duration-200 ease-in-out
          ${pathname === href ? "text-blue-400" : "text-white"}
          hover:text-blue-400 hover:scale-105`}
      >
        {icon}
        {name}
      </Link>
    </li>
  );

  const getLogoHeader = () => "/logo-kkp-full-white.png";
  const getSizeLogoHeader = () => "w-16 md:w-20";

  const isFirstTimerUser = Cookies.get("XSRF087");

  return (
    <>
      {isFirstTimerUser ? null : (
        <>
          {!(
            pathname.includes("pre-test") ||
            pathname.includes("post-test") ||
            pathname.includes("/e-katalog") ||
            pathname.includes("instruktur") ||
            pathname.includes("p2mkp/laporan-kegiatan")
          ) && (
              <header
                className={`fixed left-0 right-0 z-[150] transition duration-300 ease-in-out md:block
                ${top
                    ? "bg-transparent"
                    : "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
                  }`}
              >
                <div className="max-w-6xl mx-auto mt-6 px-5 rounded-3xl transition-all">
                  <div className="flex items-center justify-between h-20 md:h-24">
                    {pathname !== "/" && (
                      <Link href="/" className="flex items-center gap-3 shrink-0">
                        <Image
                          className={getSizeLogoHeader()}
                          width={0}
                          height={0}
                          src={getLogoHeader()}
                          alt="Logo KKP"
                        />
                      </Link>
                    )}

                    <nav className="flex md:grow">
                      <ul className="flex grow justify-end items-center gap-1">

                        {/* Beranda */}
                        <NavLinkDefault
                          href="/"
                          name="Beranda"
                          icon={<HiHome />}
                        />



                        {/* Cek Sertifikat */}
                        <NavLinkDefault
                          href="/layanan/cek-sertifikat"
                          name="Cek Sertifikat"
                          icon={<HiIdentification />}
                        />

                        {/* DROPDOWN LAYANAN & PENGADUAN */}
                        <li className="relative">
                          <button
                            onClick={() => setOpenLayanan(!openLayanan)}
                            className={`px-4 py-2 flex items-center gap-2 rounded-xl font-semibold
                            transition duration-200 ease-in-out
                            ${pathname.startsWith("/layanan")
                                ? "text-blue-400"
                                : "text-white"
                              }
                            hover:text-blue-400 hover:scale-105`}
                          >
                            <HiNewspaper />
                            Layanan & Pengaduan
                            <HiMiniChevronDown
                              className={`transition-transform duration-200 ${openLayanan ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          {openLayanan && (
                            <div
                              className={`
      absolute right-0 mt-4 w-80 rounded-3xl z-50
      bg-white/20 backdrop-blur-3xl
      border border-white/20
      shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]
      ring-1 ring-white/10
      animate-in fade-in slide-in-from-top-2 duration-200
    `}
                            >
                              <ul className="flex flex-col p-2 text-sm text-white/90">
                                <DropdownItem
                                  href="/layanan/maklumat-pelayanan"
                                  label="Maklumat Pelayanan"
                                  icon={<HiOutlineClipboardDocumentCheck />}
                                />
                                <DropdownItem
                                  href="/layanan/standar-pelayanan"
                                  label="Standar Pelayanan"
                                  icon={<HiOutlineDocumentText />}
                                />
                                <DropdownItem
                                  href="/layanan/span-lapor"
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
                                  href="/layanan/masukan-saran"
                                  label="Masukan & Saran"
                                  icon={<HiOutlineChatBubbleBottomCenterText />}
                                />
                              </ul>
                            </div>
                          )}

                        </li>

                        {/* Login / User */}
                        {Cookies.get("XSRF081") ? (
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

                    <MobileMenu isTop={top} />
                  </div>
                </div>
              </header>
            )}
        </>
      )}
    </>
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

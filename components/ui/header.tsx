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

export default function Header() {
  const [top, setTop] = React.useState<boolean>(true);
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
  const isFirstTimerUser = Cookies.get('XSRF087')


  return (
    <>
      {isFirstTimerUser ? <></> :
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
                      <ul className="flex grow justify-end items-center">
                        <NavLinkDefault href="/" name="Beranda" icon={<HiHome />} />
                        <NavLinkDefault
                          href="/layanan/cek-sertifikat"
                          name="Cek Sertifikat"
                          icon={<HiIdentification />}
                        />

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
      }</>

  );
}

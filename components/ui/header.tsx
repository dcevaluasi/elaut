"use client";

import React from "react";
import Link from "next/link";
import MobileMenu from "./mobile-menu";
import { usePathname, useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HiMiniChevronDown,
  HiHome,
  HiNewspaper,
  HiIdentification,
} from "react-icons/hi2";
import Cookies from "js-cookie";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { IoMdSchool } from "react-icons/io";
import Image from "next/image";
import { Button } from "./button";

export default function Header() {
  const [top, setTop] = React.useState<boolean>(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [currentName, setCurrentName] = React.useState("");
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

  const NavDropDown = ({
    name,
    children,
  }: {
    name: string;
    children: any;
  }) => {
    return (
      <Popover open={openModal}>
        <PopoverTrigger asChild>
          <li
            className="cursor-pointer"
            onClick={() => {
              setCurrentName(name);
              setOpenModal(!openModal);
            }}
          >
            <div
              className={`px-3 py-2 flex items-center gap-1 font-semibold text-white 
                transition duration-200 ease-in-out rounded-xl
                hover:text-blue-400 hover:scale-105`}
            >
              {name} <HiMiniChevronDown className="text-lg" />
            </div>
          </li>
        </PopoverTrigger>
        {name == currentName && (
          <PopoverContent
            onMouseLeave={() => setOpenModal(false)}
            className="w-80 flex flex-col gap-1 mt-2 
              bg-white/10 backdrop-blur-xl border border-white/20 
              rounded-2xl shadow-xl p-3 text-white"
          >
            <ul>{children}</ul>
          </PopoverContent>
        )}
      </Popover>
    );
  };

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
      {isFirstTimerUser ? <></> : <header
        className={`fixed left-0 right-0 z-[150] transition duration-300 ease-in-out hidden md:block
        ${pathname.includes("pre-test") ||
            pathname.includes("post-test") ||
            pathname.includes("/e-katalog") ||
            pathname.includes("instruktur")
            ? "hidden"
            : ""}`}
      >
        <div
          className={`max-w-6xl mx-auto mt-6 px-5 rounded-3xl
          ${!top
              ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
              : "bg-transparent"} transition-all`}
        >
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            {
              usePathname() != '/' && <Link href={"/"} className="flex items-center gap-3 shrink-0">
                <Image
                  className={getSizeLogoHeader()}
                  width={0}
                  height={0}
                  src={getLogoHeader()}
                  alt="Kementrian Kelautan dan Perikanan RI Logo"
                />
              </Link>
            }


            {/* Navbar */}
            <nav
              className={`${pathname.includes("/instruktur/form") ? "hidden" : "flex"
                } md:grow`}
            >
              <ul className="flex grow justify-end items-center">
                <NavLinkDefault href="/" name="Beranda" icon={<HiHome />} />
                <NavDropDown name="Balai Pelatihan">
                  <li>
                    <Link
                      href="https://bppptegal.id/tentang-kami"
                      className="flex gap-2 items-center px-3 py-2 rounded-lg hover:bg-white/5 text-white"
                    >
                      <IoMdSchool className="text-xl text-blue-400" />
                      <span>Balai Pelatihan Perikanan Tegal</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://bpppbitung.id/#"
                      className="flex gap-2 items-center px-3 py-2 rounded-lg hover:bg-white/5 text-white"
                    >
                      <IoMdSchool className="text-xl text-blue-400" />
                      <span>Balai Pelatihan Perikanan Bitung</span>
                    </Link>
                  </li>
                </NavDropDown>
                <NavLinkDefault
                  href="/layanan/publikasi"
                  name="Publikasi"
                  icon={<HiNewspaper />}
                />
                <NavLinkDefault
                  href="/layanan/cek-sertifikat"
                  name="Cek Sertifikat"
                  icon={<HiIdentification />}
                />

                {/* Login / User */}
                {Cookies.get("XSRF081") ? (
                  <DropdownUserPelatihan top={top} />
                ) : (
                  <Button
                    onClick={() => router.push("/login")}
                    className="rounded-xl border border-blue-400 bg-blue-500/20 
                    text-white hover:bg-blue-500 hover:text-white px-6 py-2"
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
      }</>

  );
}

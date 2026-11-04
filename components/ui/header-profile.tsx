"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Logo from "./logo";
import { usePathname } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { HiMiniChevronDown } from "react-icons/hi2";
import Cookies from "js-cookie";
import DropdownUser from "../dashboard/Header/DropdownUser";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";

export default function HeaderProfile() {
  const [top, setTop] = React.useState<boolean>(true);

  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  React.useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  return (
    <header
      className={`fixed w-full z-[150] md:bg-opacity-90 transition duration-300 ease-in-out ${`bg-white backdrop-blur-sm shadow-lg`}`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-24 md:h-24 py-3">
          <div className="shrink-0 mr-4">
            <Logo />
          </div>

          <nav className="hidden md:flex md:grow">
            <ul className="flex grow justify-end flex-wrap items-center">
              <NavLinkDefault href="/" name="Beranda" top={top} />

              <NavDropDown href="#" name="Balai Pelatihan" top={top}>
                <NavLink
                  href="/bppp?location=medan"
                  name="BPPP Medan"
                  top={top}
                />
                <NavLink href="/bppp/tegal" name="BPPP Tegal" top={top} />
                <NavLink
                  href="/bppp/banyuwangi"
                  name="BPPP Banyuwangi"
                  top={top}
                />
                <NavLink href="/bppp/bitung" name="BPPP Bitung" top={top} />
                <NavLink href="/bppp/ambon" name="BPPP Ambon" top={top} />
                <NavLink href="/bda/sukamandi" name="BDA Sukamandi" top={top} />
              </NavDropDown>

              <NavDropDown href="#" name="Layanan" top={top}>
                <NavLink href="/" name="Pelatihan" top={top} />
                <NavLink href="/" name="Uji Kompetensi" top={top} />
              </NavDropDown>

              <NavLinkDefault
                href="#cek-sertifikat"
                name="Cek Sertifikat"
                top={top}
              />

              {Cookies.get("XSRF081") ? (
                <div className="flex items-center gap-3 2xsm:gap-7">
                  {/* <!-- User Area --> */}
                  <DropdownUserPelatihan top={top} />
                  {/* <!-- User Area --> */}
                </div>
              ) : (
                <li>
                  <Link
                    href="/login"
                    className="btn-sm text-gray-200 bg-gray-900 hover:bg-gray-800 ml-3"
                  >
                    <span>Masuk Akun</span>
                    <svg
                      className="w-3 h-3 fill-current text-gray-400 shrink-0 ml-2 -mr-1"
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z"
                        fillRule="nonzero"
                      />
                    </svg>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

        </div>
      </div>
    </header>
  );
}

const NavDropDown = ({
  href,
  name,
  top,
  children,
}: {
  href: string;
  name: string;
  top: boolean;
  children: any;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <li className="cursor-pointer">
          <div
            className={`font-medium ${!top || usePathname().includes("bppp")
                ? "text-gray-600 hover:text-gray-900 hover:scale-105"
                : (top && usePathname().includes("pelatihan")) ||
                  usePathname().includes("sertifikasi") ||
                  usePathname().includes("cek-sertifikat") ||
                  usePathname().includes("users")
                  ? "text-gray-900 hover:text-gray-900 hover:scale-105"
                  : "text-gray-200 hover:text-white hover:scale-105"
              }  px-5 py-3 flex items-center transition duration-150 ease-in-out`}
          >
            {name} <HiMiniChevronDown className="text-lg" />
          </div>
        </li>
      </PopoverTrigger>
      <PopoverContent className="w-80 flex flex-col gap-1 ">
        <ul>{children}</ul>
      </PopoverContent>
    </Popover>
  );
};

const NavLink = ({
  href,
  name,
  top,
}: {
  href: string;
  name: string;
  top: boolean;
}) => {
  return (
    <li>
      <Link
        href={href}
        className={`font-medium ${!top || usePathname().includes("bppp")
            ? "text-gray-600 hover:text-gray-900 hover:scale-105"
            : (top && usePathname().includes("pelatihan")) ||
              usePathname().includes("sertifikasi") ||
              usePathname().includes("cek-sertifikat") ||
              usePathname().includes("users")
              ? "text-gray-900 hover:text-gray-900 hover:scale-105"
              : "text-gray-800 hover:text-gray-900 hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out`}
      >
        {name}
      </Link>
    </li>
  );
};

const NavLinkDefault = ({
  href,
  name,
  top,
}: {
  href: string;
  name: string;
  top: boolean;
}) => {
  return (
    <li>
      <Link
        href={href}
        className={`font-medium ${!top || usePathname().includes("bppp")
            ? "text-gray-600 hover:text-gray-900 hover:scale-105"
            : (top && usePathname().includes("pelatihan")) ||
              usePathname().includes("sertifikasi") ||
              usePathname().includes("cek-sertifikat") ||
              usePathname().includes("users")
              ? "text-gray-900 hover:text-gray-900 hover:scale-105"
              : "text-gray-200 hover:text-white hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out`}
      >
        {name}
      </Link>
    </li>
  );
};

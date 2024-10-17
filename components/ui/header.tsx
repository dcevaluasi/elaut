"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import { usePathname } from "next/navigation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  HiCalendar,
  HiMiniChevronDown,
  HiMiniUserGroup,
} from "react-icons/hi2";
import Cookies from "js-cookie";
import DropdownUser from "../dashboard/Header/DropdownUser";
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { Dropdown } from "flowbite-react";
import {
  RiGovernmentFill,
  RiSchoolFill,
  RiVerifiedBadgeFill,
} from "react-icons/ri";
import { BiSolidShip } from "react-icons/bi";
import { AiFillShop } from "react-icons/ai";
import { BsFillPatchCheckFill } from "react-icons/bs";
import { LucideSchool } from "lucide-react";
import { IoMdSchool } from "react-icons/io";
import Image from "next/image";

export default function Header() {
  const [top, setTop] = React.useState<boolean>(true);

  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  const [openModal, setOpenModal] = React.useState(false);
  const [currentName, setCurrentName] = React.useState("");

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
      <Popover open={openModal}>
        <PopoverTrigger asChild>
          <li
            className="cursor-pointer"
            onClick={(e) => {
              setCurrentName(name);
              setOpenModal(!openModal);
            }}
          >
            <div
              className={`font-medium ${
                top &&
                (usePathname() == "/" ||
                  usePathname() == "/lembaga/p2mkp" ||
                  usePathname().includes("bppp") ||
                  usePathname() == "/lembaga/dpkakp" ||
                  usePathname() == "/dashboard" ||
                  usePathname().includes("registrasi") ||
                  usePathname().includes("login") ||
                  usePathname().includes("cek-sertifikat"))
                  ? "text-gray-200 hover:text-white hover:scale-105"
                  : top && usePathname().includes("program")
                  ? "text-gray-200 hover:text-white hover:scale-105"
                  : (top && usePathname().includes("pelatihan")) ||
                    usePathname().includes("sertifikasi") ||
                    usePathname().includes("users")
                  ? "text-gray-900 hover:text-gray-900 hover:scale-105"
                  : usePathname().includes("complete-profile") ||
                    usePathname().includes("program")
                  ? "text-gray-600 hover:text-gray-900 hover:scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:scale-105"
              }  px-2 py-3 flex items-center transition  duration-150 ease-in-out font-medium`}
            >
              {name} <HiMiniChevronDown className="text-lg" />
            </div>
          </li>
        </PopoverTrigger>
        {name == currentName && (
          <PopoverContent
            onMouseLeave={() => setOpenModal(false)}
            className={`w-80 flex flex-col z-[1000000] gap-1 ${
              top ? "-mt-3" : "mt-7"
            }`}
          >
            <ul>{children}</ul>
          </PopoverContent>
        )}
      </Popover>
    );
  };

  const NavLink = ({
    href,
    name,
    top,
    children,
  }: {
    href: string;
    name: string;
    top: boolean;
    children?: any;
  }) => {
    return (
      <li>
        <Link
          href={href}
          target={`${
            name == "Balai Pelatihan dan Penyuluhan Perikanan Tegal" ||
            name == "Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi" ||
            name == "Balai Pelatihan dan Penyuluhan Perikanan Ambon" ||
            name == "Balai Pelatihan dan Penyuluhan Perikanan Medan" ||
            name == "Balai Pelatihan dan Penyuluhan Perikanan Bitung" ||
            name == "Balai Pendidikan dan Pelatihan Aparatur Sukamandi"
              ? "_target"
              : "_self"
          }`}
          onClick={(e) => setOpenModal(false)}
          className={`font-medium ${
            top && usePathname().includes("layanan")
              ? "text-gray-600 hover:text-gray-900 hover:scale-105"
              : (top && usePathname().includes("program")) ||
                (top && usePathname().includes("dashboard"))
              ? "text-gray-200 hover:text-white hover:scale-105"
              : (top && usePathname().includes("pelatihan")) ||
                usePathname().includes("sertifikasi") ||
                usePathname().includes("users")
              ? "text-gray-900 hover:text-gray-900 hover:scale-105"
              : usePathname().includes("complete-profile") ||
                usePathname().includes("layanan")
              ? "text-gray-600 hover:text-gray-900 hover:scale-105"
              : "text-gray-600 hover:text-gray-900 hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out font-medium`}
        >
          {children}
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
          className={`font-medium ${
            top &&
            (usePathname() == "/" ||
              usePathname() == "/lembaga/p2mkp" ||
              usePathname().includes("bppp") ||
              usePathname() == "/lembaga/dpkakp" ||
              usePathname() == "/dashboard" ||
              usePathname().includes("registrasi") ||
              usePathname().includes("login") ||
              usePathname().includes("cek-sertifikat"))
              ? "text-gray-200 hover:text-white hover:scale-105"
              : top && usePathname().includes("program")
              ? "text-gray-200 hover:text-white hover:scale-105"
              : (top && usePathname().includes("pelatihan")) ||
                usePathname().includes("sertifikasi") ||
                usePathname().includes("users")
              ? "text-gray-900 hover:text-gray-900 hover:scale-105"
              : usePathname().includes("complete-profile") ||
                usePathname().includes("layanan") ||
                usePathname().includes("program")
              ? "text-gray-600 hover:text-gray-900 hover:scale-105"
              : "text-gray-600 hover:text-gray-900 hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out`}
        >
          {name}
        </Link>
      </li>
    );
  };

  React.useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  const pathname = usePathname();
  const getLogoHeader = () => {
    return "/logo-kkp.png";
  };
  const getSizeLogoHeader = () => {
    return "w-20";
  };

  return (
    <header
      className={`fixed ${
        usePathname().includes("pre-test") ||
        usePathname().includes("post-test") ||
        usePathname().includes("/dpkakp/admin") ||
        usePathname().includes("/dpkakp/user") ||
        usePathname().includes("/dpkakp/penguji") ||
        usePathname().includes("/komite-approval")
          ? "hidden"
          : "block"
      } w-full z-[150] md:bg-opacity-90 transition duration-300 ease-in-out ${
        (top && usePathname().includes("layanan")) ||
        usePathname() == "/dashboard" ||
        usePathname() == "/registrasi" ||
        usePathname() == "/login"
          ? "pt-0"
          : top && "pt-6"
      }  ${
        !top
          ? `bg-white backdrop-blur-sm shadow-lg`
          : usePathname().includes("program")
          ? "bg-none  pt-6"
          : usePathname().includes("pelatihan") ||
            usePathname().includes("sertifikasi") ||
            usePathname().includes("users")
          ? `bg-white backdrop-blur-sm shadow-lg !pt-0`
          : usePathname().includes("complete-profile")
          ? "bg-white backdrop-blur-sm shadow-lg"
          : ""
      } ${usePathname().includes("program") && "bg-transparent"}`}
    >
      <div className=" mx-auto  max-w-7xl ">
        <div className="flex items-center justify-between h-24 md:h-24 py-3">
          {(usePathname().includes("program") ||
            usePathname().includes("registrasi") ||
            usePathname().includes("pelatihan") ||
            usePathname().includes("dashboard") ||
            usePathname().includes("cek-sertifikat") ||
            usePathname().includes("login")) && (
            <Link href={"/"} className="shrink-0 mr-4 flex items-center gap-4">
              <Image
                className={getSizeLogoHeader()}
                width={0}
                height={0}
                src={getLogoHeader()}
                alt="Kementrian Kelautan dan Perikanan RI Logo"
              />
            </Link>
          )}

          <nav className="hidden md:flex md:grow">
            <ul className="flex grow gap-0 justify-end flex-wrap items-center w-fit">
              <>
                {" "}
                <NavLinkDefault href="/" name="Beranda" top={top} />
                <NavDropDown href="#" name="Balai Pelatihan" top={top}>
                  <NavLink
                    href="https://bppptegal.id/tentang-kami"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Tegal"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pelatihan dan Penyuluhan Perikanan Tegal
                      </span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="https://www.bpppbanyuwangi.com/"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi
                      </span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="https://bpppbitung.id/#"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Bitung"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pelatihan dan Penyuluhan Perikanan Bitung
                      </span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="https://ppid.sipelatihaksi.com/"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Medan"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pelatihan dan Penyuluhan Perikanan Medan
                      </span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="https://bp3ambon.kkp.go.id/"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Ambon"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pelatihan dan Penyuluhan Perikanan Ambon
                      </span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="https://sites.google.com/view/ppidbppakkp"
                    name="Balai Pendidikan dan Pelatihan Aparatur Sukamandi"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>
                        Balai Pendidikan dan Pelatihan Aparatur Sukamandi
                      </span>
                    </div>
                  </NavLink>
                </NavDropDown>
                <NavDropDown
                  href="/lembaga/dpkakp"
                  name="Lembaga AKP"
                  top={top}
                >
                  <NavLink
                    href="https://bppptegal.id/tentang-kami"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Tegal"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>Dewan Penguji Keahlian Awak Kapal Perikanan</span>
                    </div>
                  </NavLink>
                  <NavLink
                    href="/lembaga/komite-approval"
                    name="Balai Pelatihan dan Penyuluhan Perikanan Banyuwangi"
                    top={top}
                  >
                    <div className="flex gap-2 items-center">
                      <IoMdSchool className="text-4xl" />{" "}
                      <span>Komite Approval Pengesahan Program Diklat</span>
                    </div>
                  </NavLink>
                </NavDropDown>
                <NavLinkDefault href="/lembaga/p2mkp" name="P2MKP" top={top} />
                <NavLinkDefault
                  href="/layanan/cek-sertifikat"
                  name="Cek Sertifikat"
                  top={top}
                />
                <NavLinkDefault
                  href="/#cek-sertifikat"
                  name="Buku Petunjuk"
                  top={top}
                />
                {Cookies.get("XSRF081") ? (
                  <div className="flex items-center gap-3 2xsm:gap-7">
                    {/* <!-- User Area --> */}
                    <DropdownUserPelatihan top={top} />
                    {/* <!-- User Area --> */}
                  </div>
                ) : (
                  <></>
                )}
              </>
            </ul>
          </nav>

          <MobileMenu isTop={top} />
        </div>
      </div>
    </header>
  );
}

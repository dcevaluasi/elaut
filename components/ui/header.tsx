"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import { usePathname, useRouter } from "next/navigation";

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
import DropdownUserPelatihan from "../dashboard/Header/DropdownUserPelatihan";
import { IoMdSchool } from "react-icons/io";
import Image from "next/image";
import { Button } from "./button";

export default function Header() {
  const [top, setTop] = React.useState<boolean>(true);

  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };

  const [openModal, setOpenModal] = React.useState(false);
  const [currentName, setCurrentName] = React.useState("");

  const router = useRouter();

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
                  usePathname() == "/lembaga/komite-approval" ||
                  usePathname() == "/lembaga/pukakp" ||
                  usePathname() == "/dashboard" ||
                  usePathname().includes("registrasi") ||
                  usePathname().includes("login") ||
                  usePathname().includes("forget-password"))
                  ? "hover:text-white hover:scale-105 text-white"
                  : top && usePathname().includes("program")
                  ? "hover:text-white hover:scale-105 text-white"
                  : (top && usePathname().includes("pelatihan")) ||
                    usePathname().includes("sertifikasi") ||
                    usePathname().includes("users")
                  ? "text-[#979797] hover:text-gray-900 hover:scale-105"
                  : usePathname().includes("complete-profile")
                  ? "text-[#979797] hover:text-gray-900 hover:scale-105"
                  : "text-[#979797] hover:text-gray-900 hover:scale-105"
              }  px-2 py-3 flex items-center transition  duration-150 ease-in-out font-semibold text-[#979797] hover:!text-blue-500`}
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
          className={`font-semibold ${
            top && usePathname().includes("layanan")
              ? "text-[#979797] hover:text-gray-900 hover:scale-105"
              : (top && usePathname().includes("program")) ||
                (top && usePathname().includes("dashboard"))
              ? "hover:text-white hover:scale-105"
              : (top && usePathname().includes("pelatihan")) ||
                usePathname().includes("sertifikasi") ||
                usePathname().includes("users")
              ? "text-[#979797] hover:text-gray-900 hover:scale-105"
              : usePathname().includes("complete-profile") ||
                usePathname().includes("layanan")
              ? "text-[#979797] hover:text-gray-900 hover:scale-105"
              : "text-[#979797] hover:text-gray-900 hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out font-semibold text-[#979797] hover:!text-blue-500`}
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
          className={`font-semibold ${
            top &&
            (usePathname() == "/" ||
              usePathname() == "/lembaga/p2mkp" ||
              usePathname().includes("bppp") ||
              usePathname() == "/lembaga/dpkakp" ||
              usePathname() == "/lembaga/komite-approval" ||
              usePathname() == "/lembaga/pukakp" ||
              usePathname() == "/dashboard" ||
              usePathname().includes("registrasi") ||
              usePathname().includes("login") ||
              usePathname().includes("forget-password"))
              ? "hover:text-white hover:scale-105 text-white"
              : top && usePathname().includes("program")
              ? "hover:text-white hover:scale-105 text-white"
              : (top && usePathname().includes("pelatihan")) ||
                usePathname().includes("sertifikasi") ||
                usePathname().includes("users")
              ? "text-[#979797] hover:text-gray-900 hover:scale-105"
              : usePathname().includes("complete-profile") ||
                usePathname().includes("layanan")
              ? "text-[#979797] hover:text-gray-900 hover:scale-105"
              : "text-[#979797] hover:text-gray-900 hover:scale-105"
          }  px-5 py-3 flex items-center transition duration-150 ease-in-out text-[#979797] hover:!text-blue-500`}
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
      className={`fixed mx-auto left-0 right-0 ${
        usePathname().includes("pre-test") ||
        usePathname().includes("post-test") ||
        usePathname().includes("/dpkakp/admin") ||
        usePathname().includes("/dpkakp/user") ||
        usePathname().includes("/e-katalog") ||
        usePathname().includes("/dpkakp/public") ||
        usePathname().includes("/dpkakp/penguji") ||
        usePathname().includes("/pukakp/admin") ||
        usePathname().includes("/pukakp/user") ||
        usePathname().includes("/pukakp/penguji") ||
        usePathname().includes("/dev-dashboard")
          ? "hidden"
          : ""
      }  z-[150] md:bg-opacity-90 transition duration-300 ease-in-out ${
        (top && usePathname().includes("layanan")) ||
        usePathname() == "/dashboard" ||
        usePathname() == "/registrasi" ||
        usePathname().includes("forget-password") ||
        usePathname() == "/login"
          ? "pt-0"
          : top && "pt-6"
      }  ${
        !top
          ? `bg-white backdrop-blur-sm shadow-custom `
          : usePathname().includes("program")
          ? "bg-none"
          : usePathname().includes("pelatihan") ||
            usePathname().includes("sertifikasi") ||
            usePathname().includes("users")
          ? `bg-white backdrop-blur-sm !pt-0 shadow-custom !text-[#979797] hover:!text-blue-500 `
          : usePathname().includes("complete-profile") ||
            usePathname().includes("cek-sertifikat")
          ? "bg-white backdrop-blur-sm shadow-custom "
          : ""
      }  ${usePathname().includes("program") && "bg-transparent"} ${
        top && usePathname().includes("login") && "bg-transparent !text-white"
      } max-w-6xl w-full mt-8    rounded-3xl  px-5`}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center justify-between h-24 md:h-24 py-3 w-full mx-auto">
          {(usePathname().includes("program") ||
            usePathname().includes("registrasi") ||
            usePathname().includes("pelatihan") ||
            usePathname().includes("dashboard") ||
            usePathname().includes("cek-sertifikat") ||
            usePathname().includes("forget-password") ||
            usePathname().includes("login")) && (
            <Link
              href={"/"}
              className="shrink-0 ml-6 md:mr-4 flex items-center gap-4"
            >
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
                    href="#"
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
                <NavLinkDefault
                  href="/lembaga/dpkakp"
                  name="Dewan Penguji dan Komite Approval"
                  top={top}
                />
                <NavLinkDefault
                  href="/layanan/cek-sertifikat"
                  name="Cek Sertifikat"
                  top={top}
                />
                {Cookies.get("XSRF081") ? (
                  <div className="flex items-center gap-3 2xsm:gap-7">
                    <DropdownUserPelatihan top={top} />
                  </div>
                ) : (
                  <Button
                    onClick={(e) => router.push("/login")}
                    className={`${
                      !top || usePathname().includes("/layanan/pelatihan")
                        ? "text-white bg-blue-500"
                        : "bg-transparent"
                    } w-fit text-base border border-blue-500 rounded-xl hover:bg-blue-500  py-3`}
                  >
                    Login
                  </Button>
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

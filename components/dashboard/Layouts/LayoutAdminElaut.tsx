"use client";

import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import DropdownUser from "../Header/DropdownUser";

export default function LayoutAdminElaut({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  const handleGetAdminPusat = async () => {
    try {
      const response = await axios.get(
        `${elautBaseUrl}/adminPusat/getAdminPusat`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("XSRF091")}`,
          },
        }
      );
      console.log({ response })
      Cookies.set("NIK", response.data.data.Nip);
      Cookies.set("Satker", response.data.data.Status);
      Cookies.set("Jabatan", response.data.data.NoTelpon);
    } catch (error) {
      console.error({ error });
    }
  };

  const [lemdikData, setLemdikData] =
    React.useState<LemdiklatDetailInfo | null>(null);

  const fetchInformationLemdiklat = async () => {
    try {
      const response = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("XSRF091")}`,
        },
      });
      setLemdikData(response.data);
      Cookies.set("IDLemdik", response.data.data.IdLemdik);
      Cookies.set("SATKER_BPPP", response.data.data.NamaLemdik);
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  React.useEffect(() => {
    fetchInformationLemdiklat();
  }, []);

  const handleLogOut = async () => {
    Cookies.remove("XSRF091");
    Cookies.remove("XSRF092");
    Cookies.remove("XSRF093");
    Cookies.remove("SATKER_BPPP");
    Cookies.remove("IDLemdik");
    Cookies.remove("Eselon");
    Cookies.remove("Status");
    Cookies.remove("Jabatan");
    Cookies.remove("NIK");
    Toast.fire({
      icon: "success",
      title: `Berhasil logout dari dashboard Admin!`,
    });
    router.replace("/admin/auth/login");
  };

  useEffect(() => {
    handleGetAdminPusat();
  }, []);

  const navs = pathname.includes("pusat")
    ? [
      // {
      //   title: "Penerbitan Sertifikat",
      //   href: "/admin/pusat/pelatihan/penerbitan-sertifikat",
      //   iconPath:
      //     "M18.546 3h-13.069l-5.477 8.986v9.014h24v-9.014l-5.454-8.986zm-3.796 12h-5.5l-2.25-3h-4.666l4.266-7h10.82l4.249 7h-4.669l-2.25 3zm-9.75-4l.607-1h12.787l.606 1h-14zm12.18-3l.607 1h-11.573l.607-1h10.359zm-1.214-2l.606 1h-9.144l.607-1h7.931z",
      // },
      {
        title: "Pelatihan",
        href: "/admin/pusat/pelatihan/pemberitahuan-pelatihan",
        iconPath:
          "M18.546 3h-13.069l-5.477 8.986v9.014h24v-9.014l-5.454-8.986zm-3.796 12h-5.5l-2.25-3h-4.666l4.266-7h10.82l4.249 7h-4.669l-2.25 3zm-9.75-4l.607-1h12.787l.606 1h-14zm12.18-3l.607 1h-11.573l.607-1h10.359zm-1.214-2l.606 1h-9.144l.607-1h7.931z",
      },
    ]
    : [
      {
        title: "Dashboard Pelatihan",
        href: "/admin/lemdiklat/dashboard/",
        iconPath:
          "M12 6.453l9 8.375v9.172h-6v-6h-6v6h-6v-9.172l9-8.375zm12 5.695l-12-11.148-12 11.133 1.361 1.465 10.639-9.868 10.639 9.883 1.361-1.465z",
      },
      {
        title: "Database Pelatihan",
        href: "/admin/lemdiklat/pelatihan",
        iconPath:
          "M18.546 3h-13.069l-5.477 8.986v9.014h24v-9.014l-5.454-8.986zm-3.796 12h-5.5l-2.25-3h-4.666l4.266-7h10.82l4.249 7h-4.669l-2.25 3zm-9.75-4l.607-1h12.787l.606 1h-14zm12.18-3l.607 1h-11.573l.607-1h10.359zm-1.214-2l.606 1h-9.144l.607-1h7.931z",
      },
    ];

  return (
    <div className="h-screen w-full flex text-gray-800 bg-white">
      {/* Sidebar */}
      <nav className="flex-none flex flex-col items-center bg-gray-900 text-gray-400 border-r h-screen">
        <div className="h-16 flex items-center w-full">
          <Image
            src="/images/logo/logo-kkp-white.png"
            alt="Logo"
            width={50}
            height={50}
            className="mx-auto"
          />
        </div>
        <ul className="w-full">
          {navs.map(({ title, href, iconPath }) => (
            <li key={title}>
              <a
                href={href}
                title={title}
                className={`h-16 px-6 flex items-center w-full ${pathname === href
                  ? "text-white bg-blue-500"
                  : "hover:text-white hover:bg-blue-500"
                  } group`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mx-auto fill-gray-300 duration-700 group-hover:fill-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d={iconPath} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <div
          className="mt-auto h-16 flex items-center w-full cursor-pointer"
          onClick={() => handleLogOut()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 mx-auto text-gray-200 hover:text-blue-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 17v-4H7v-2h9V7l5 5-5 5zm-2 3H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h9v2H5v12h9v2z"
            />
          </svg>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow overflow-y-scroll w-full scrollbar-hide flex flex-col">
        <nav
          aria-label="top bar"
          className="flex-none w-full flex justify-between bg-white h-16"
        >
          <ul
            aria-label="top bar left"
            aria-orientation="horizontal"
            className="flex"
          ></ul>
          <ul
            aria-label="top bar right"
            aria-orientation="horizontal"
            className="px-8 flex items-center"
          >
            <li className="h-10  ml-3">
              <DropdownUser userLoggedInInfo={lemdikData!} />
            </li>
          </ul>
        </nav>
        {children}
      </main>
    </div>
  );
}

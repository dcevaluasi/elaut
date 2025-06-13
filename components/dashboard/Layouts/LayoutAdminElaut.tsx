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
import { PusatDetailInfo } from "@/types/pusat";
import { LucideLayoutDashboard } from "lucide-react";
import { IoSchoolOutline } from "react-icons/io5";
import Sidebar from "../Sidebar";
import { GrInfo } from "react-icons/gr";

export default function LayoutAdminElaut({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  const [pusatData, setPusatData] =
    React.useState<PusatDetailInfo | null>(null);


  const fetchInformationPusat = async () => {
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
      setPusatData(response.data)
      Cookies.set("NIK", response.data.data.Nip);
      Cookies.set("Status", response.data.data.Status);
      Cookies.set("Satker", response.data.data.Status);
      Cookies.set("Role", response.data.data.Nip);
      Cookies.set("Jabatan", response.data.data.NoTelpon);
      Cookies.set("XSRF094", response.data.data.Status);
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
      Cookies.set("Eselon", response.data.data.Deskripsi);
      Cookies.set("Status", response.data.data.Deskripsi);
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  const isLemdiklatLevel = usePathname().includes('lemdiklat')

  React.useEffect(() => {
    if (isLemdiklatLevel) {
      fetchInformationLemdiklat();
    } else {
      fetchInformationPusat();
    }
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



  const navs = pathname.includes("pusat")
    ? [
      {
        title: "Dashboard Pelatihan",
        href: "/admin/pusat/dashboard/",
        icon:
          <LucideLayoutDashboard />,
      },
      {
        title: "Database Pelatihan",
        href: `/admin/pusat/pelatihan/pelaksanaan`,
        icon:
          <IoSchoolOutline className="text-2xl" />,
      },
      {
        title: "Publikasi dan Regulasi",
        href: `/admin/pusat/pelatihan/pelaksanaan`,
        icon:
          <GrInfo className="text-2xl" />,
      },
    ]

    : [
      {
        title: "Dashboard Pelatihan",
        href: "/admin/lemdiklat/dashboard/",
        icon:
          <LucideLayoutDashboard />,
      },
      {
        title: "Database Pelatihan",
        href: "/admin/lemdiklat/pelatihan",
        icon:
          <IoSchoolOutline className="text-2xl" />
        ,
      },
    ];


  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);


  return (
    <div className="h-screen w-full flex text-gray-800 bg-white">
      {/* Sidebar */}
      <nav className="flex-none flex flex-col items-center bg-neutral-800 text-gray-400 border-r h-screen">
        <div className="h-16 flex items-center w-full">
          <Image
            src="/logo-kkp-white.png"
            alt="Logo"
            width={40}
            height={40}
            className="mx-auto"
          />
        </div>
        <ul className="w-full">
          {navs.map(({ title, href, icon }) => (
            <li key={title}>
              <a
                href={href}
                title={title}
                className={`h-16 px-6 flex items-center w-full ${pathname === href
                  ? "text-white bg-blue-500"
                  : "hover:text-white hover:bg-blue-500"
                  } group`}
              >
                <div className="mx-auto">{icon}</div>
              </a>
            </li>
          ))}
          {
            Cookies.get("Eselon") == 'Operator Pusat' && <li>
              <a
                href={'/admin/pusat/pelatihan/publikasi'}
                title={'Publikasi dan Regulasi'}
                className={`h-16 px-6 flex items-center w-full ${'/admin/pusat/pelatihan/publikasi' === '/admin/pusat/pelatihan/publikasi'
                  ? "text-white bg-blue-500"
                  : "hover:text-white hover:bg-blue-500"
                  } group`}
              >
                <div className="mx-auto"><GrInfo className="text-2xl" /></div>
              </a>
            </li>
          }
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
              <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
            </li>
          </ul>
        </nav>
        {children}
      </main>
    </div>

  );
}

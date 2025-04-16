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
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
              <DropdownUser lemdiklatLoggedInInfo={lemdikData!} pusatLoggedInInfo={pusatData!} />
            </li>
          </ul>
        </nav>
        {children}
      </main>
    </div>
  );
}

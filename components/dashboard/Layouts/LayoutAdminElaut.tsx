"use client";

import Toast from "@/components/toast";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { PusatDetailInfo } from "@/types/pusat";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DropdownUser from "../Header/DropdownUser";
import { LucideLayoutDashboard } from "lucide-react";
import { IoBookOutline, IoSchoolOutline } from "react-icons/io5";
import { GrInfo } from "react-icons/gr";
import { FiMenu, FiLogOut, FiChevronDown, FiChevronRight } from "react-icons/fi";

export default function LayoutAdminElaut({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [pusatData, setPusatData] = useState<PusatDetailInfo | null>(null);
  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(null);

  const isLemdiklatLevel = pathname.includes("lemdiklat");

  const fetchInformationPusat = async () => {
    try {
      const { data } = await axios.get(`${elautBaseUrl}/adminPusat/getAdminPusat`, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
      });
      setPusatData(data);
      Cookies.set("NIK", data.data.Nip);
      Cookies.set("Status", data.data.Status);
      Cookies.set("Satker", data.data.Status);
      Cookies.set("Role", data.data.Nip);
      Cookies.set("Jabatan", data.data.NoTelpon);
      Cookies.set("XSRF094", data.data.Status);
      Cookies.set(
        "XSRF095",
        data.data.Status.includes("Kepala") || data.data.Status.includes("Supervisor")
          ? "true"
          : "false"
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInformationLemdiklat = async () => {
    try {
      const { data } = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
      });
      setLemdikData(data);
      Cookies.set("IDLemdik", data.data.IdLemdik);
      Cookies.set("SATKER_BPPP", data.data.NamaLemdik);
      Cookies.set("Eselon", data.data.Deskripsi);
      Cookies.set("Status", data.data.Deskripsi);
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };

  useEffect(() => {
    isLemdiklatLevel ? fetchInformationLemdiklat() : fetchInformationPusat();
  }, []);

  const handleLogOut = () => {
    [
      "XSRF091",
      "XSRF092",
      "XSRF093",
      "XSRF094",
      "XSRF095",
      "SATKER_BPPP",
      "IDLemdik",
      "Eselon",
      "Status",
      "Jabatan",
      "NIK",
    ].forEach((key) => Cookies.remove(key));

    Toast.fire({
      icon: "success",
      title: `Berhasil logout dari dashboard Admin!`,
    });
    router.replace("/admin/auth/login");
  };

  const navs = pathname.includes("pusat")
    ? [
      { title: "Dashboard", href: "/admin/pusat/dashboard/", icon: <LucideLayoutDashboard /> },
      {
        title: "Penyelenggaraan Pelatihan",
        icon: <IoSchoolOutline className="text-2xl" />,
        submenu: [
          { title: "Penerbitan STTPL", href: "/admin/pusat/pelatihan/sttpl/penerbitan" },
        ],
      },
      { title: "Modul Pelatihan", href: "/admin/lemdiklat/modul/", icon: <IoBookOutline className="text-xl" /> },
      Cookies.get("Eselon") === "Operator Pusat"
        ? { title: "Publikasi & Regulasi", href: "/admin/pusat/pelatihan/publikasi", icon: <GrInfo className="text-2xl" /> }
        : null,
    ].filter(Boolean)
    : [
      { title: "Dashboard", href: "/admin/lemdiklat/dashboard/", icon: <LucideLayoutDashboard /> },
      {
        title: "Penyelenggaraan Pelatihan",
        icon: <IoSchoolOutline className="text-2xl" />,
        submenu: [
          { title: "Pelaksanaan", href: "/admin/lemdiklat/pelatihan" },
          { title: "Penerbitan STTPL", href: "/admin/lemdiklat/pelatihan/sttpl" },
        ],
      },
    ];

  return (
    <div className="h-screen w-full flex text-gray-800 bg-white">
      {/* Sidebar */}
      <aside
        className={`flex-none flex flex-col bg-neutral-900 text-gray-300 transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"
          }`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen ? (
            <div className="flex gap-2 items-center">
              <Image src="/logo-kkp-white.png" alt="Logo" width={40} height={40} />
              <span className="leading-none text-sm">Elektronik Layanan Terpadu Utama Pelatihan</span>
            </div>
          ) : (
            <Image src="/logo-kkp-white.png" alt="Logo" width={40} height={40} />
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <ul className="flex-1 mt-4 space-y-1">
          {navs.map((item) =>
            "submenu" in item! ? (
              <li key={item.title}>
                <button
                  onClick={() => setSubmenuOpen((prev) => !prev)}
                  className={`flex items-center justify-between w-full px-4 py-3 transition-colors rounded-md ${pathname.startsWith(item.submenu?.[0]?.href || "")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-500 hover:text-white"
                    }`}
                >
                  <div className="flex items-center text-left gap-3">
                    {item.icon}
                    {sidebarOpen && <span className="text-sm leading-none">{item.title}</span>}
                  </div>
                  {sidebarOpen && (submenuOpen ? <FiChevronDown /> : <FiChevronRight />)}
                </button>
                {submenuOpen && sidebarOpen && (
                  <ul className="ml-10 mt-1 space-y-1">
                    {item.submenu?.map((sub) => (
                      <li key={sub.title}>
                        <a
                          href={sub.href}
                          className={`block px-3 py-2 rounded-md text-sm ${pathname === sub.href
                            ? "bg-blue-500 text-white"
                            : "hover:bg-blue-400 hover:text-white"
                            }`}
                        >
                          {sub.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item!.title}>
                <a
                  href={item!.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-md ${pathname === item!.href
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-500 hover:text-white"
                    }`}
                >
                  {item!.icon}
                  {sidebarOpen && <span className="text-sm">{item!.title}</span>}
                </a>
              </li>
            )
          )}
        </ul>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogOut}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:bg-red-500 hover:text-white rounded-md"
          >
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-y-auto">
        {/* Top Bar */}
        <header className="flex justify-end items-center bg-white h-20 px-6 py-3 border-b">
          <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
        </header>
        {/* Page Content */}
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
}

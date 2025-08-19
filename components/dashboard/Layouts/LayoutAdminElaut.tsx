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
import { LucideBadgeCheck, LucideLayoutDashboard } from "lucide-react";
import { IoBookOutline, IoSchoolOutline } from "react-icons/io5";
import { GrInfo } from "react-icons/gr";
import { FiMenu, FiLogOut, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { RoleAccess } from "@/types/access";
import { HiOutlineCheckBadge, HiOutlineUserGroup } from "react-icons/hi2";
import { TbDatabaseEdit, TbSignature } from "react-icons/tb";
import { MdOutlinePodcasts } from "react-icons/md";
import Link from "next/link";

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
      const parsedData: RoleAccess = JSON.parse(data.data.Deskripsi);
      Cookies.set("IDLemdik", data.data.IdLemdik);
      Cookies.set("SATKER_BPPP", data.data.NamaLemdik);
      Cookies.set("Eselon", parsedData.role);
      Cookies.set("Access", data.data.Deskripsi);
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
      "Access",
      "NIK",
    ].forEach((key) => Cookies.remove(key));

    Toast.fire({
      icon: "success",
      title: `Berhasil logout dari dashboard Admin!`,
    });
    router.replace("/admin/auth/login");
  };


  return (
    <div className="h-screen w-full flex text-gray-800 bg-white">
      {/* Sidebar */}
      <aside
        className={`flex-none flex flex-col bg-neutral-900 text-gray-300 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"
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
          {/* ===== PUSAT NAVS ===== */}
          {pathname.includes("pusat") && (
            <>
              {/* Dashboard */}
              <li>
                <a
                  href="/admin/pusat/dashboard/"
                  className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-md ${pathname === "/admin/pusat/dashboard/"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-500 hover:text-white"
                    }`}
                >
                  <LucideLayoutDashboard />
                  {sidebarOpen && <span className="text-sm">Dashboard</span>}
                </a>
              </li>

              {/* Penyelenggaraan Pelatihan */}
              <li>
                <button
                  onClick={() => setSubmenuOpen((prev) => !prev)}
                  className={`flex items-center justify-between w-full px-4 py-2 transition-colors rounded-md ${pathname.startsWith("/admin/pusat/pelatihan/sttpl")
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-500 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <IoSchoolOutline className="text-2xl" />
                    {sidebarOpen && (
                      <span className="text-sm">Penyelenggaraan Pelatihan</span>
                    )}
                  </div>
                  {sidebarOpen && (submenuOpen ? <FiChevronDown /> : <FiChevronRight />)}
                </button>
                {submenuOpen && sidebarOpen && (
                  <ul className="ml-10 mt-1 space-y-1">
                    <li>
                      <a
                        href="/admin/pusat/pelatihan/sttpl/penerbitan"
                        className={`block px-3 py-2 rounded-md text-sm ${pathname === "/admin/pusat/pelatihan/sttpl/penerbitan"
                          ? "bg-blue-500 text-white"
                          : "hover:bg-blue-400 hover:text-white"
                          }`}
                      >
                        Penerbitan STTPL
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}

          {pathname.includes("lemdiklat") && <>
            {/* Dashboard */}
            <li>
              <a
                href="/admin/lemdiklat/dashboard/"
                className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-md ${pathname === "/admin/lemdiklat/dashboard/"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-500 hover:text-white"
                  }`}
              >
                <LucideLayoutDashboard />
                {sidebarOpen && <span className="text-sm">Dashboard</span>}
              </a>
            </li>

            {/* Master Pelatihan */}
            <li>
              <button
                onClick={() => setSubmenuOpen((prev) => !prev)}
                className={`flex items-center justify-between w-full px-4 py-2 transition-colors rounded-md ${pathname.includes("master")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-500 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <TbDatabaseEdit className="text-2xl" />

                  {sidebarOpen && (
                    <span className="text-sm text-left">Master Pelatihan</span>
                  )}
                </div>
                {sidebarOpen && (submenuOpen ? <FiChevronDown /> : <FiChevronRight />)}
              </button>
              {submenuOpen && sidebarOpen && (
                <ul className="ml-10 mt-1 space-y-1">
                  <NavItem
                    href="/admin/lemdiklat/master/instruktur"
                    icon={<HiOutlineUserGroup className="text-xl" />}
                    label="Instruktur"
                  />
                  {
                    Cookies.get('Access')?.includes('viewModul') &&
                    <NavItem
                      href="/admin/lemdiklat/master/modul"
                      icon={<IoBookOutline className="text-lg" />}
                      label="Modul Pelatihan"
                    />
                  }
                  <NavItem
                    href="/admin/lemdiklat/master/penandatangan"
                    icon={<TbSignature className="text-xl" />}
                    label="Penandatangan"
                  />

                </ul>
              )}
            </li>

            {/* Penyelenggaraan Pelatihan */}
            <li>
              <button
                onClick={() => setSubmenuOpen((prev) => !prev)}
                className={`flex items-center justify-between w-full px-4 py-2 transition-colors rounded-md ${pathname.includes("pelatihan")
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-500 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <IoSchoolOutline className="text-2xl" />
                  {sidebarOpen && (
                    <span className="text-sm text-left">Penyelenggaraan Pelatihan</span>
                  )}
                </div>
                {sidebarOpen && (submenuOpen ? <FiChevronDown /> : <FiChevronRight />)}
              </button>
              {submenuOpen && sidebarOpen && (
                <ul className="ml-10 mt-1 space-y-1">
                  <NavItem
                    href="/admin/lemdiklat/pelatihan"
                    icon={<MdOutlinePodcasts className="text-xl" />}
                    label="Pelaksanaan"
                  />
                  <NavItem
                    href="/admin/lemdiklat/pelatihan/sttpl"
                    icon={<HiOutlineCheckBadge className="text-xl" />}
                    label="Penerbitan STTPL"
                  />
                </ul>
              )}
            </li>


          </>}


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
        <header className="flex justify-end items-center bg-white h-20 px-6 py-2 border-b">
          <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
        </header>
        {/* Page Content */}
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => {
  const pathname = usePathname();

  const isActive = pathname.includes(href);

  return (
    <li>
      <Link
        href={href}
        className={`flex gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
          ? "bg-blue-500 text-white"
          : "hover:bg-blue-400 hover:text-white"
          }`}
      >
        <span className="text-xl">{icon}</span>
        {label}
      </Link>
    </li>

  );
};
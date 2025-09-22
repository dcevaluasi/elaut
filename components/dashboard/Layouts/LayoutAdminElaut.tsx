"use client";

import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { PusatDetailInfo } from "@/types/pusat";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import DropdownUser from "../Header/DropdownUser";
import { LucideLayoutDashboard } from "lucide-react";
import { IoBookOutline, IoDocumentOutline, IoFolderOpenOutline, IoPieChartOutline, IoSchoolOutline } from "react-icons/io5";
import { FiMenu, FiLogOut, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { TbBuildingSkyscraper, TbDatabaseEdit } from "react-icons/tb";
import Link from "next/link";
import { breakdownStatus } from "@/lib/utils";
import { generatedSignedCertificate } from "@/utils/certificates";

export default function LayoutAdminElaut({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [submenuOpen, setSubmenuOpen] = useState(true);
  const [sidebarSubOpen, setSidebarSubOpen] = useState(true);
  const [submenuSubOpen, setSubmenuSubOpen] = useState(true);
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
      Cookies.set("IDLemdik", data.data.IdAdminPusat);
      Cookies.set("Status", data.data.Status);
      Cookies.set("Nama", data.data.Nama);
      Cookies.set("Satker", generatedSignedCertificate(data.data.NoTelpon).status_indo);
      Cookies.set("PimpinanLemdiklat", data.data.NoTelpon);
      Cookies.set("Role", breakdownStatus(data.data.Status)[0]);
      Cookies.set("Access", breakdownStatus(data.data.Status)[1]);

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

      // set basic cookies
      Cookies.set("IDLemdik", data.data.IdLemdik);
      Cookies.set("IDUnitKerja", data.data.IdUnitKerja);
      Cookies.set("Nama", data.data.NamaLemdik);
      Cookies.set("Role", breakdownStatus(data.data.Deskripsi)[0]);
      Cookies.set("Eselon", breakdownStatus(data.data.Deskripsi)[0]);
      Cookies.set("Access", breakdownStatus(data.data.Deskripsi)[1]);
      Cookies.set("PimpinanLemdiklat", data.data.NamaKaBalai);

      // 🔑 fetch Unit Kerja by ID and set Satker = unitKerjas.nama
      const token = Cookies.get("XSRF091");
      const unitResponse = await axios.get(
        `${elautBaseUrl}/unit-kerja/getUnitKerjaById?id=${data.data.IdUnitKerja}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const unitData = unitResponse.data.data;
      if (unitData?.nama) {
        Cookies.set("Satker", unitData.nama);
      }

      console.log({ data, unitData });
    } catch (error) {
      console.error("LEMDIK INFO: ", error);
    }
  };


  useEffect(() => {
    isLemdiklatLevel ? fetchInformationLemdiklat() : fetchInformationPusat();
  }, [isLemdiklatLevel]);

  const handleLogOut = () => {
    [
      "IDLemdik",
      "IDUnitKerja",
      "XSRF091",
      "XSRF092",
      "XSRF093",
      "Satker",
      "Eselon",
      "Status",
      "Jabatan",
      "Access",
      "NIK",
      "Nama",
      "Role",
      "PimpinanLemdiklat"
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


        <ul className="flex-1 mt-4 space-y-1">
          {/* Dashboard */}
          <li>
            <a
              href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/dashboard/`}
              className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-md ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/dashboard`)
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-500 hover:text-white"
                }`}
            >
              <LucideLayoutDashboard />
              {sidebarOpen && <span className="text-sm">Dashboard</span>}
            </a>
          </li>

          {/* Master Pelatihan */}
          {
            Cookies.get('Role')?.includes('Pengelola') && <li>
              <button
                onClick={() => { setSubmenuOpen(!submenuOpen) }}
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
                <ul className="ml-7 mt-1 space-y-1">
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/instruktur`}
                    icon={<HiOutlineUserGroup className="flex-shrink-0 w-6 h-6" />}
                    label="Instruktur/Pelatih"
                  />
                  <button
                    onClick={() => { setSubmenuSubOpen(!submenuSubOpen) }}
                    className={`flex items-center justify-between w-full px-3 py-2 transition-colors rounded-md ${pathname.includes("master")
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-500 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IoBookOutline className="text-2xl" />
                      {sidebarSubOpen && (
                        <span className="text-sm text-left">Peragkat Pelatihan</span>
                      )}
                    </div>
                    {sidebarSubOpen && (submenuSubOpen ? <FiChevronDown /> : <FiChevronRight />)}
                  </button>
                  {submenuSubOpen && sidebarSubOpen && (
                    <ul className="ml-7 mt-1 space-y-1">
                      {
                        Cookies.get('Access')?.includes('viewModul') &&
                        <NavItem
                          href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/modul`}
                          icon={<IoDocumentOutline className="flex-shrink-0 w-6 h-6" />}
                          label="Modul Pelatihan"
                        />
                      }
                      {
                        Cookies.get('Access')?.includes('viewModul') &&
                        <NavItem
                          href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/bahan-ajar`}
                          icon={<IoFolderOpenOutline className="flex-shrink-0 w-6 h-6" />}
                          label="Bahan Ajar"
                        />
                      }
                    </ul>)}
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/unit-kerja`}
                    icon={<TbBuildingSkyscraper className="flex-shrink-0 w-6 h-6" />}
                    label="Unit Kerja"
                  />
                </ul>
              )}
            </li>
          }

          {/* Penyelenggaraan Pelatihan */}
          <li>
            <a
              href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/pelatihan`}
              className={`flex items-center gap-3 px-4 py-2 transition-colors rounded-md ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/pelatihan`)
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-500 hover:text-white"
                }`}
            >
              <IoSchoolOutline className="flex-shrink-0 w-6 h-6" />
              {sidebarOpen && <span className="text-sm">Penyelenggaraan Pelatihan</span>}
            </a>
          </li>
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

      <div className="flex-grow flex flex-col overflow-y-auto">
        <header className="flex justify-end items-center bg-white h-20 px-6 py-2 border-b">
          <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
        </header>
        <main className="flex-grow p-4">{children}</main>
      </div>
    </div>
  );
}

interface HeaderPageLayoutAdminElautProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function HeaderPageLayoutAdminElaut({ icon, title, description }: HeaderPageLayoutAdminElautProps) {
  return (
    <article className="flex flex-row gap-2 items-center">
      <header
        aria-label="page caption"
        className="flex-row w-full flex h-20 items-center gap-2 bg-gray-100 border-t px-4"
      >
        <div className="text-3xl">{icon}</div>
        <div className="flex flex-col">
          <h1 id="page-caption" className="font-semibold text-lg">
            {title}
          </h1>
          <p className="font-medium text-gray-400 text-base">
            {description}
          </p>
        </div>
      </header>
    </article>
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
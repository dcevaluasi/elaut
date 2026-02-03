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
import { IoAlbumsOutline, IoBookOutline, IoDocumentOutline, IoFolderOpenOutline, IoPieChartOutline, IoSchoolOutline } from "react-icons/io5";
import { FiMenu, FiLogOut, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { HiOutlineInbox, HiOutlineUserGroup } from "react-icons/hi2";
import { TbBuildingEstate, TbBuildingSkyscraper, TbChartPie, TbDatabaseEdit, TbGavel, TbSchool } from "react-icons/tb";
import Link from "next/link";
import { breakdownStatus } from "@/lib/utils";
import { generatedSignedCertificate } from "@/utils/certificates";
import { RiQuillPenAiLine } from "react-icons/ri";
import { BiBadgeCheck } from "react-icons/bi";

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
  const [submenuSubOpen, setSubmenuSubOpen] = useState(false);
  const [menuP2MKPOpen, setMenuP2MKPOpen] = useState(false);
  const [subMenuP2MKPOpen, setSubMenuP2MKPOpen] = useState(false);

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

      Cookies.set("IDLemdik", data.data.IdLemdik);
      Cookies.set("IDUnitKerja", data.data.IdUnitKerja);
      Cookies.set("Nama", data.data.NamaLemdik);
      Cookies.set("Role", breakdownStatus(data.data.Deskripsi)[0]);
      Cookies.set("Eselon", breakdownStatus(data.data.Deskripsi)[0]);
      Cookies.set("Access", breakdownStatus(data.data.Deskripsi)[1]);
      Cookies.set("PimpinanLemdiklat", data.data.NamaKaBalai);

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
    <div className="h-screen w-full flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`flex-none flex flex-col bg-[#0f172a] text-slate-300 transition-all duration-300 ease-in-out z-50 shadow-2xl ${sidebarOpen ? "w-72" : "w-20"
          }`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50 bg-[#0f172a]">
          {sidebarOpen ? (
            <div className="flex gap-3 items-center overflow-hidden">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src="/logo-kkp-white.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="leading-tight text-xs font-semibold text-white tracking-wide">
                ELAUT <br /> <span className="text-slate-400 font-normal">Kementerian Kelautan</span>
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="relative w-8 h-8">
                <Image src="/logo-kkp-white.png" alt="Logo" fill className="object-contain" />
              </div>
            </div>
          )}

          {sidebarOpen && <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FiMenu size={20} />
          </button>}
        </div>
        {!sidebarOpen && <div className="flex justify-center py-4 border-b border-slate-800/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <FiMenu size={20} />
          </button>
        </div>}


        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {/* Dashboard */}
          <li>
            <a
              href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/dashboard/`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/dashboard`)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <LucideLayoutDashboard className={pathname.includes("dashboard") ? "text-white" : "text-slate-400 group-hover:text-white"} />
              {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
            </a>
          </li>

          {/* Master Pelatihan */}
          {
            (Cookies.get('Role')?.includes('Pengelola') || Cookies.get('Access')?.includes('superAdmin')) && <li>
              <button
                onClick={() => { setSubmenuOpen(!submenuOpen) }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes("master")
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <TbDatabaseEdit className={`w-6 h-6 ${pathname.includes("master") ? "text-white" : "text-slate-400 group-hover:text-white"}`} />

                  {sidebarOpen && (
                    <span className="text-sm font-medium text-left">Master Pelatihan</span>
                  )}
                </div>
                {sidebarOpen && (submenuOpen ? <FiChevronDown className="opacity-70" /> : <FiChevronRight className="opacity-70" />)}
              </button>
              {submenuOpen && sidebarOpen && (
                <ul className="ml-4 mt-1 pl-3 border-l border-slate-700 space-y-1">
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/instruktur`}
                    icon={<HiOutlineUserGroup className="flex-shrink-0 w-5 h-5" />}
                    label="Instruktur/Pelatih"
                  />
                  <button
                    onClick={() => { setSubmenuSubOpen(!submenuSubOpen) }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-sm ${submenuSubOpen
                      ? "text-blue-400 font-medium"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IoBookOutline className="w-5 h-5" />
                      {sidebarSubOpen && (
                        <span className="text-left">Perangkat Pelatihan</span>
                      )}
                    </div>
                    {sidebarSubOpen && (submenuSubOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
                  </button>
                  {submenuSubOpen && sidebarSubOpen && (
                    <ul className="ml-3 mt-1 pl-3 border-l border-slate-700 space-y-1">
                      {
                        Cookies.get('Access')?.includes('viewModul') &&
                        <NavItem
                          href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/modul`}
                          icon={<IoDocumentOutline className="flex-shrink-0 w-5 h-5" />}
                          label="Modul Pelatihan"
                          compact
                        />
                      }
                      {
                        Cookies.get('Access')?.includes('viewModul') &&
                        <NavItem
                          href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/bahan-ajar`}
                          icon={<IoFolderOpenOutline className="flex-shrink-0 w-5 h-5" />}
                          label="Bahan Ajar"
                          compact
                        />
                      }
                    </ul>)}
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/unit-kerja`}
                    icon={<TbBuildingSkyscraper className="flex-shrink-0 w-5 h-5" />}
                    label="Unit Kerja"
                  />
                  {
                    Cookies.get('Access')?.includes('superAdmin') &&
                    <>
                      <NavItem
                        href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/klaster-pelatihan`}
                        icon={<HiOutlineInbox className="flex-shrink-0 w-5 h-5" />}
                        label="Klaster Pelatihan"
                      />
                    </>
                  }
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/master/program-pelatihan`}
                    icon={<RiQuillPenAiLine className="flex-shrink-0 w-5 h-5" />}
                    label="Program Pelatihan"
                  />

                </ul>
              )}
            </li>
          }

          {/* Pusat Pelatihan Mandiri KP */}
          {
            (Cookies.get('Role')?.includes('Pengelola') || Cookies.get('Access')?.includes('superAdmin')) && <li>
              <button
                onClick={() => { setSubMenuP2MKPOpen(!subMenuP2MKPOpen) }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes("p2mkp")
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <TbBuildingEstate className={`w-6 h-6 ${pathname.includes("p2mkp") ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium text-left">P2MKP</span>
                  )}

                </div>
                {sidebarOpen && (subMenuP2MKPOpen ? <FiChevronDown className="opacity-70" /> : <FiChevronRight className="opacity-70" />)}
              </button>
              {subMenuP2MKPOpen && (
                <ul className="ml-4 mt-1 pl-3 border-l border-slate-700 space-y-1">
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/manage`}
                    icon={<BiBadgeCheck className="flex-shrink-0 w-5 -ml-0.5 h-6" />}
                    label="Data P2MKP"
                  />
                  <NavItem
                    href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/p2mkp/penetapan`}
                    icon={<TbGavel className="flex-shrink-0 w-5 h-6" />}
                    label="Penetapan dan Klasifikasi"
                  />
                </ul>
              )}
            </li>
          }

          {/* Penyelenggaraan Pelatihan */}
          <li>
            <a
              href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/pelatihan`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/pelatihan`)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <TbSchool className={`flex-shrink-0 w-6 h-6 ${pathname.includes("pelatihan") ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              {sidebarOpen && <span className="text-sm font-medium">Penyelenggaraan Pelatihan</span>}
            </a>
          </li>

          {/* Kinerja */}
          <li>
            <a
              href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/kinerja/`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/kinerja`)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "hover:bg-slate-800 hover:text-white"
                }`}
            >
              <TbChartPie className={`flex-shrink-0 w-6 h-6 ${pathname.includes("kinerja") ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
              {sidebarOpen && <span className="text-sm font-medium">Indikator Kinerja</span>}
            </a>
          </li>

          {/* Layanan Publik */}
          {
            Cookies.get('Access')?.includes('superAdmin') && <li>
              <a
                href={`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/layanan/`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${pathname.includes(`/admin/${pathname.includes("lemdiklat") ? 'lemdiklat' : 'pusat'}/layanan`)
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <IoAlbumsOutline className={`flex-shrink-0 w-6 h-6 ${pathname.includes("layanan") ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                {sidebarOpen && <span className="text-sm font-medium">Layanan dan Pengaduan</span>}
              </a>
            </li>
          }

        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]">
          <button
            onClick={handleLogOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5 group-hover:text-rose-500" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col overflow-y-auto">
        <header className="flex justify-end items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 h-20 px-8 border-b border-slate-200/60 shadow-sm">
          <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
        </header>
        <main className="flex-grow p-6 bg-slate-50">{children}</main>
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
    <article className="flex flex-row gap-2 items-center mb-6">
      <header
        aria-label="page caption"
        className="flex-row w-full flex h-auto items-center gap-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl p-6"
      >
        <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shrink-0">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <h1 id="page-caption" className="font-bold text-xl text-slate-900">
            {title}
          </h1>
          <p className="font-medium text-slate-500 text-sm">
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
  compact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, compact }) => {
  const pathname = usePathname();

  const isActive = pathname.includes(href);

  return (
    <li>
      <Link
        href={href}
        className={`flex gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 items-center ${isActive
          ? "text-blue-400 font-medium bg-blue-400/10 border-r-2 border-blue-400"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
          } ${compact ? "py-1.5" : ""}`}
      >
        <span className={`flex-shrink-0 ${compact ? "opacity-70" : ""}`}>{icon}</span>
        {label}
      </Link>
    </li>
  );
};
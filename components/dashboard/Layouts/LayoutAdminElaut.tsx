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
import { breakdownStatus, setSecureCookie, removeSecureCookie } from "@/lib/utils";
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
      setSecureCookie("NIK", data.data.Nip);
      setSecureCookie("IDLemdik", data.data.IdAdminPusat);
      setSecureCookie("Status", data.data.Status);
      setSecureCookie("Nama", data.data.Nama);
      setSecureCookie("Satker", generatedSignedCertificate(data.data.NoTelpon).status_indo);
      setSecureCookie("PimpinanLemdiklat", data.data.NoTelpon);
      setSecureCookie("Role", breakdownStatus(data.data.Status)[0]);
      setSecureCookie("Access", breakdownStatus(data.data.Status)[1]);

    } catch (error) {
      // console.error(error);
    }
  };

  const fetchInformationLemdiklat = async () => {
    try {
      const { data } = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, {
        headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` },
      });

      setLemdikData(data);

      setSecureCookie("IDLemdik", data.data.IdLemdik);
      setSecureCookie("IDUnitKerja", data.data.IdUnitKerja);
      setSecureCookie("Nama", data.data.NamaLemdik);
      setSecureCookie("Role", breakdownStatus(data.data.Deskripsi)[0]);
      setSecureCookie("Eselon", breakdownStatus(data.data.Deskripsi)[0]);
      setSecureCookie("Access", breakdownStatus(data.data.Deskripsi)[1]);
      setSecureCookie("PimpinanLemdiklat", data.data.NamaKaBalai);

      const token = Cookies.get("XSRF091");
      const unitResponse = await axios.get(
        `${elautBaseUrl}/unit-kerja/getUnitKerjaById?id=${data.data.IdUnitKerja}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const unitData = unitResponse.data.data;
      if (unitData?.nama) {
        setSecureCookie("Satker", unitData.nama);
      }

      // console.log({ data, unitData });
    } catch (error) {
      // console.error("LEMDIK INFO: ", error);
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
    ].forEach((key) => removeSecureCookie(key));

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
            (Cookies.get('Access')?.includes('superAdmin')) && <li>
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
    <article className="flex flex-col gap-2 mb-6 group">
      <header
        aria-label="page caption"
        className="relative overflow-hidden flex flex-col md:flex-row w-full h-auto items-center gap-5 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 transition-all duration-500"
      >
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl group-hover:bg-blue-100/30 transition-colors duration-700" />

        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-blue-500/20 transform group-hover:scale-105 transition-all duration-500">
          <span className="relative z-10">{icon}</span>
        </div>

        <div className="relative flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <h1 id="page-caption" className="font-bold text-xl text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
          <p className="font-medium text-slate-400 text-xs max-w-2xl leading-relaxed uppercase tracking-wider">
            {description}
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-end ml-auto pr-4 border-l border-slate-100 pl-6 space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Konsol Manajemen</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-slate-700 uppercase">Sistem Aktif</span>
          </div>
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
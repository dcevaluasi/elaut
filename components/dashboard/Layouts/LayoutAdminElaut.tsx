"use client";

import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { BadgeCheck, LayoutDashboard, PanelLeftClose, PanelLeftOpen, ChevronRight, LogOut, Menu, X, Search, CalendarDays, CornerDownLeft, Bell, BellRing, Clock, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { IoAlbumsOutline, IoBookOutline, IoDocumentOutline, IoFolderOpenOutline } from "react-icons/io5";
import { FiYoutube } from "react-icons/fi";
import { HiBookmark, HiOutlineInbox, HiOutlineUserGroup } from "react-icons/hi2";
import { HiOutlineUser } from "react-icons/hi";
import { TbBuildingEstate, TbBuildingSkyscraper, TbDatabaseEdit, TbGavel, TbSchool } from "react-icons/tb";
import { BiBadgeCheck } from "react-icons/bi";

import Toast from "@/commons/Toast";
import { elautBaseUrl } from "@/constants/urls";
import { LemdiklatDetailInfo } from "@/types/lemdiklat";
import { PusatDetailInfo } from "@/types/pusat";
import { breakdownStatus, setSecureCookie, removeSecureCookie, encryptValue } from "@/lib/utils";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import { generatedSignedCertificate } from "@/utils/certificates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DropdownUser from "../Header/DropdownUser";

/* ============================ SESSION ============================ */

type Session = { access: string; role: string };

const readSession = (): Session => ({
  access: Cookies.get("Access") || "",
  role: Cookies.get("Role") || "",
});

const SESSION_COOKIES = [
  "IDLemdik", "IDUnitKerja", "XSRF091", "XSRF092", "XSRF093", "Satker", "Eselon",
  "Status", "Jabatan", "Access", "NIK", "Nama", "Role", "PimpinanLemdiklat",
];

const authHeader = () => ({ headers: { Authorization: `Bearer ${Cookies.get("XSRF091")}` } });

/* ============================ ANTRIAN (SPV / VERIFIKATOR) ============================ */

type QueueRole = "supervisor" | "verifikator";

/** Sama dengan getQueueRole di PendingPelatihanQueue */
const getQueueRole = (s: Session): QueueRole | null => {
  const access = s.access;
  const role = s.role.toLowerCase();
  if (access.includes("verifyPelaksanaan") && access.includes("verifyCertificate")) return "verifikator";
  // TODO: sesuaikan flag akses Supervisor di sistem
  if (access.toLowerCase().includes("supervisor") || role.includes("supervisor")) return "supervisor";
  return null;
};

const QUEUE_META = {
  "1": { label: "Pending SPV", dot: "bg-amber-500", text: "text-amber-600" },
  "2": { label: "Pending Verifikator", dot: "bg-blue-500", text: "text-blue-600" },
  "6": { label: "Pending STTPL", dot: "bg-violet-500", text: "text-violet-600" },
} as const;
type QueueStatus = keyof typeof QUEUE_META;

const ROLE_STATUS: Record<QueueRole, QueueStatus[]> = {
  supervisor: ["1"],
  verifikator: ["2", "6"],
};

const SEEN_KEY = "admin:queueSeen";

/* ============================ NAV CONFIG ============================ */

type Can = (s: Session) => boolean;

interface NavLeaf {
  label: string;
  href: string; // relatif terhadap /admin/{level}
  icon: ReactNode;
  show?: Can;
}

interface NavNode extends Partial<NavLeaf> {
  id: string;
  label: string;
  icon: ReactNode;
  show?: Can;
  children?: NavNode[];
}

interface NavSection {
  title: string;
  items: NavNode[];
}

const isSuper: Can = (s) => s.access.includes("superAdmin");
const has = (key: string): Can => (s) => s.access.includes(key);
const any = (...fns: Can[]): Can => (s) => fns.some((f) => f(s));

const ICON = "w-[18px] h-[18px]";

const NAV: NavSection[] = [
  {
    title: "Utama",
    items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className={ICON} /> }],
  },
  {
    title: "Manajemen",
    items: [
      {
        id: "master",
        label: "Master Pelatihan",
        icon: <TbDatabaseEdit className={ICON} />,
        show: any((s) => s.role.includes("Pengelola"), isSuper),
        children: [
          { id: "instruktur", label: "Instruktur/Pelatih", href: "/master/instruktur", icon: <HiOutlineUserGroup className={ICON} /> },
          {
            id: "perangkat",
            label: "Perangkat Pelatihan",
            icon: <IoBookOutline className={ICON} />,
            show: has("viewModul"),
            children: [
              { id: "modul", label: "Modul Pelatihan", href: "/master/modul", icon: <IoDocumentOutline className={ICON} /> },
              { id: "bahan-ajar", label: "Bahan Ajar", href: "/master/bahan-ajar", icon: <IoFolderOpenOutline className={ICON} /> },
            ],
          },
          { id: "unit-kerja", label: "Unit Kerja", href: "/master/unit-kerja", icon: <TbBuildingSkyscraper className={ICON} /> },
          { id: "klaster", label: "Klaster Pelatihan", href: "/master/klaster-pelatihan", icon: <HiOutlineInbox className={ICON} />, show: isSuper },
          { id: "program", label: "Program Pelatihan", href: "/master/program-pelatihan", icon: <HiBookmark className={ICON} /> },
          { id: "peserta", label: "Peserta Pelatihan", href: "/master/peserta", icon: <HiOutlineUser className={ICON} /> },
        ],
      },
      {
        id: "p2mkp",
        label: "P2MKP",
        icon: <TbBuildingEstate className={ICON} />,
        show: any(isSuper, has("viewP2MKP")),
        children: [
          { id: "p2mkp-manage", label: "Data P2MKP", href: "/p2mkp/manage", icon: <BiBadgeCheck className={ICON} /> },
          { id: "p2mkp-penetapan", label: "Pengajuan Penetapan", href: "/p2mkp/penetapan", icon: <TbGavel className={ICON} /> },
        ],
      },
      {
        id: "pelatihan",
        label: "Penyelenggaraan Pelatihan",
        icon: <TbSchool className={ICON} />,
        show: any(isSuper, has("viewPelatihan")),
        children: [
          { id: "kelas", label: "Kelas Pelatihan", href: "/pelatihan", icon: <TbSchool className={ICON} /> },
          { id: "video", label: "Video Pelatihan", href: "/pelatihan/video", icon: <FiYoutube className={ICON} />, show: isSuper },
        ],
      },
    ],
  },
  {
    title: "Layanan",
    items: [
      { id: "layanan", label: "Layanan & Pengaduan", href: "/layanan", icon: <IoAlbumsOutline className={ICON} />, show: isSuper },
      { id: "perbaikan", label: "Perbaikan Sertifikat", href: "/layanan/perbaikan-sertifikat", icon: <BadgeCheck className={ICON} />, show: isSuper },
    ],
  },
];

/** Filter menu sesuai akses + buang grup kosong */
const filterNodes = (nodes: NavNode[], s: Session): NavNode[] =>
  nodes
    .filter((n) => !n.show || n.show(s))
    .map((n) => (n.children ? { ...n, children: filterNodes(n.children, s) } : n))
    .filter((n) => !n.children || n.children.length > 0);

const collectLeaves = (nodes: NavNode[], trail: NavNode[] = []): { leaf: NavNode; trail: NavNode[] }[] =>
  nodes.flatMap((n) => (n.children ? collectLeaves(n.children, [...trail, n]) : n.href ? [{ leaf: n, trail }] : []));

/* ============================ LAYOUT ============================ */

const COLLAPSE_KEY = "admin:sidebarCollapsed";

export default function LayoutAdminElaut({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const level = pathname.includes("lemdiklat") ? "lemdiklat" : "pusat";
  const base = `/admin/${level}`;

  const [session, setSession] = useState<Session | null>(null);
  const [pusatData, setPusatData] = useState<PusatDetailInfo | null>(null);
  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  /* ---------- Preferensi collapse ---------- */
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch { /* abaikan */ }
    setSession(readSession());
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      try { localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1"); } catch { /* abaikan */ }
      return !c;
    });
  }, []);

  // Ctrl/⌘ + B untuk buka/tutup sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCollapsed]);

  // Ctrl/⌘ + K untuk pencarian menu cepat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Jam & tanggal (di client saja → bebas hydration mismatch)
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Tutup drawer mobile saat pindah halaman
  useEffect(() => setMobileOpen(false), [pathname]);

  /* ---------- Info user ---------- */
  useEffect(() => {
    let cancelled = false;

    const loadPusat = async () => {
      const { data } = await axios.get(`${elautBaseUrl}/adminPusat/getAdminPusat`, authHeader());
      if (cancelled) return;
      const d = data.data;
      const [role, access] = breakdownStatus(d.Status);
      setPusatData(data);
      setSecureCookie("NIK", d.Nip);
      setSecureCookie("IDLemdik", d.IdAdminPusat);
      setSecureCookie("Status", d.Status);
      setSecureCookie("Nama", d.Nama);
      setSecureCookie("Satker", generatedSignedCertificate(d.NoTelpon).status_indo);
      setSecureCookie("PimpinanLemdiklat", d.NoTelpon);
      setSecureCookie("Role", role);
      setSecureCookie("Access", access);
    };

    const loadLemdik = async () => {
      const { data } = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, authHeader());
      if (cancelled) return;
      const d = data.data;
      const [role, access] = breakdownStatus(d.Deskripsi);
      setLemdikData(data);
      setSecureCookie("IDLemdik", d.IdLemdik);
      setSecureCookie("IDUnitKerja", d.IdUnitKerja);
      setSecureCookie("Nama", d.NamaLemdik);
      setSecureCookie("Role", role);
      setSecureCookie("Eselon", role);
      setSecureCookie("Access", access);
      setSecureCookie("PimpinanLemdiklat", d.NamaKaBalai);

      const unit = await axios.get(`${elautBaseUrl}/unit-kerja/getUnitKerjaById?id=${d.IdUnitKerja}`, authHeader());
      if (!cancelled && unit.data?.data?.nama) setSecureCookie("Satker", unit.data.data.nama);
    };

    (level === "lemdiklat" ? loadLemdik() : loadPusat())
      .catch(() => { /* sesi tidak valid / jaringan */ })
      .finally(() => !cancelled && setSession(readSession()));

    return () => {
      cancelled = true;
    };
  }, [level]);

  const queueRole = useMemo(() => (session ? getQueueRole(session) : null), [session]);

  /* ---------- Menu sesuai akses ---------- */
  const sections = useMemo(
    () =>
      session
        ? NAV.map((s) => ({ ...s, items: filterNodes(s.items, session) })).filter((s) => s.items.length > 0)
        : [],
    [session]
  );

  // Item aktif = href terpanjang yang cocok dengan pathname
  const active = useMemo(() => {
    let best: { leaf: NavNode; trail: NavNode[] } | null = null;
    let bestLen = -1;
    for (const entry of sections.flatMap((s) => collectLeaves(s.items))) {
      const full = base + entry.leaf.href;
      if ((pathname === full || pathname.startsWith(full + "/")) && full.length > bestLen) {
        best = entry;
        bestLen = full.length;
      }
    }
    return best;
  }, [sections, pathname, base]);

  const activeIds = useMemo(
    () => new Set(active ? [active.leaf.id, ...active.trail.map((t) => t.id)] : []),
    [active]
  );

  // Semua halaman yang boleh diakses (untuk pencarian ⌘K)
  const allLeaves = useMemo(
    () => sections.flatMap((s) => collectLeaves(s.items).map((e) => ({ ...e, section: s.title }))),
    [sections]
  );

  // Buka otomatis grup yang berisi halaman aktif
  useEffect(() => {
    if (!active) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      active.trail.forEach((t) => next.add(t.id));
      return next;
    });
  }, [active]);

  const toggleGroup = (id: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((p) => new Set(p).add(id));
      return;
    }
    setOpenGroups((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ---------- Logout ---------- */
  const handleLogOut = () => {
    SESSION_COOKIES.forEach((key) => removeSecureCookie(key));
    Toast.fire({ icon: "success", title: "Berhasil logout dari dashboard Admin!" });
    router.replace("/admin/auth/login");
  };

  const userName =
    (lemdikData as any)?.data?.NamaLemdik || (pusatData as any)?.data?.Nama || Cookies.get("Nama") || "Admin";
  const userRole = session?.role || (level === "lemdiklat" ? "Lemdiklat" : "Pusat");

  /* ============================ RENDER ============================ */

  const isCollapsed = collapsed && !mobileOpen; // drawer mobile selalu lebar penuh

  const sidebar = (
    <aside
      className={`relative isolate flex h-full flex-col overflow-hidden bg-[#0B1B3F] text-blue-100/80 transition-[width] duration-300 ease-out ${isCollapsed ? "w-[84px]" : "w-72"}`}
    >
      {/* Mesh & pola, selaras dengan hero dashboard */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_40%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(80%_40%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Brand */}
      <div className={`flex h-20 items-center border-b border-white/10 ${isCollapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href={`${base}/dashboard`} className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/15 p-1.5">
            <Image src="/logo-kkp-white.png" alt="Logo KKP" fill sizes="40px" className="object-contain p-1.5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-black tracking-tight text-white">ELAUT</p>
              <p className="truncate text-[10px] font-medium text-blue-100/50">Kementerian Kelautan dan Perikanan</p>
            </div>
          )}
        </Link>
        {mobileOpen ? (
          <button onClick={() => setMobileOpen(false)} className="lg:hidden rounded-lg p-1.5 text-blue-100/60 hover:bg-white/10 hover:text-white" aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        ) : (
          !isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="hidden lg:flex rounded-lg p-1.5 text-blue-100/60 hover:bg-white/10 hover:text-white"
              title="Ciutkan sidebar (Ctrl+B)"
              aria-label="Ciutkan sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={toggleCollapsed}
          className="mx-auto mt-3 hidden lg:flex rounded-lg p-2 text-blue-100/60 hover:bg-white/10 hover:text-white"
          title="Lebarkan sidebar (Ctrl+B)"
          aria-label="Lebarkan sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
        {!session ? (
          <div className="space-y-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.title} className="mb-5 last:mb-0">
              {isCollapsed ? (
                <div className="mx-auto mb-2 h-px w-8 bg-white/10" />
              ) : (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/35">{section.title}</p>
              )}
              <ul className="space-y-1">
                {section.items.map((node) => (
                  <NavEntry
                    key={node.id}
                    node={node}
                    base={base}
                    depth={0}
                    collapsed={isCollapsed}
                    activeIds={activeIds}
                    activeLeafId={active?.leaf.id}
                    openGroups={openGroups}
                    onToggle={toggleGroup}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-2 ${isCollapsed ? "justify-center" : ""}`}>
          {!isCollapsed && (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-black text-white">
                {String(userName).trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{userName}</p>
                <p className="truncate text-[10px] font-medium text-blue-100/50">{userRole}</p>
              </div>
            </>
          )}
          <NavTooltip label="Logout" enabled={isCollapsed}>
            <button
              onClick={() => setConfirmLogout(true)}
              className="shrink-0 rounded-xl p-2 text-blue-100/60 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
              aria-label="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </NavTooltip>
        </div>
      </div>
    </aside>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans">
        {/* Sidebar desktop */}
        <div className="hidden lg:block h-full shrink-0 z-50 shadow-2xl shadow-blue-950/20">{sidebar}</div>

        {/* Drawer mobile */}
        <div className={`lg:hidden fixed inset-0 z-[60] transition ${mobileOpen ? "visible" : "invisible"}`}>
          <div
            className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setMobileOpen(false)}
          />
          <div className={`absolute inset-y-0 left-0 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {sidebar}
          </div>
        </div>

        {/* Konten */}
        <div className="flex min-w-0 flex-grow flex-col overflow-y-auto">
          <header className="sticky top-0 z-40 px-3 md:px-6 pt-3 pb-1">
            <div className="relative isolate flex h-16 items-center justify-between gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl ring-1 ring-slate-200/70 dark:ring-slate-800 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)] px-2.5 md:px-3">
              {/* Garis aksen gradien + glow halus */}
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
              <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(40%_140%_at_0%_0%,rgba(37,99,235,0.08)_0%,transparent_70%),radial-gradient(30%_140%_at_100%_100%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

              {/* Kiri: menu mobile + judul halaman */}
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Buka menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="relative isolate hidden sm:flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0B1B3F] text-sky-100 shadow-md shadow-blue-600/25 ring-1 ring-white/10">
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,#2563EB_0%,transparent_70%),radial-gradient(80%_80%_at_100%_100%,#0EA5E9_0%,transparent_70%)]" />
                  {active?.leaf.icon ?? <LayoutDashboard className="h-[18px] w-[18px]" />}
                </div>

                <div className="min-w-0 leading-tight">
                  {/* Breadcrumb */}
                  <nav aria-label="Breadcrumb">
                    <ol className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      <li className="shrink-0">{level === "lemdiklat" ? "Lemdiklat" : "Pusat"}</li>
                      {active?.trail.map((t) => (
                        <React.Fragment key={t.id}>
                          <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
                          <li className="truncate max-w-[140px]">{t.label}</li>
                        </React.Fragment>
                      ))}
                    </ol>
                  </nav>
                  <h2 className="truncate text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
                    {active?.leaf.label ?? "Dashboard"}
                  </h2>
                </div>
              </div>

              {/* Tengah: pencarian cepat */}
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden md:flex flex-1 max-w-sm items-center gap-2.5 h-10 px-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 ring-1 ring-transparent hover:ring-slate-200 dark:hover:ring-slate-700 text-sm text-slate-400 transition-all group"
              >
                <Search className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
                <span className="flex-1 text-left font-medium">Cari menu atau halaman…</span>
                <kbd className="rounded-md bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Ctrl K</kbd>
              </button>

              {/* Kanan: sapaan + tanggal + user */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="md:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Cari menu"
                >
                  <Search className="h-5 w-5" />
                </button>

                {now && (
                  <div className="hidden xl:flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-slate-800">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11px] font-black text-slate-800 dark:text-white">
                        {greeting(now)}, {String(userName).split(" ")[0]}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 tabular-nums">
                        {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} · {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notifikasi antrian hanya untuk Supervisor / Verifikator */}
                {queueRole && <QueueBell role={queueRole} base={base} />}

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <DropdownUser lemdiklatLoggedInInfo={lemdikData} pusatLoggedInInfo={pusatData} />
              </div>
            </div>
          </header>

          <main className="flex-grow p-4 md:p-6">{children}</main>
        </div>

        {/* Pencarian menu cepat (Ctrl/⌘ + K) */}
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          items={allLeaves.map((e) => ({
            id: e.leaf.id,
            label: e.leaf.label,
            icon: e.leaf.icon,
            path: [e.section, ...e.trail.map((t) => t.label)].join(" › "),
            href: base + e.leaf.href!,
          }))}
          activeId={active?.leaf.id}
          onSelect={(href) => {
            setPaletteOpen(false);
            router.push(href);
          }}
        />

        {/* Konfirmasi logout */}
        <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
          <AlertDialogContent className="rounded-3xl max-w-sm">
            <AlertDialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <LogOut className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-center">Keluar dari dashboard?</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Sesi Anda akan diakhiri dan Anda perlu login kembali untuk mengakses dashboard admin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2">
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogOut} className="rounded-xl bg-rose-600 hover:bg-rose-700">
                Ya, Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

/* ============================ NOTIFIKASI ANTRIAN ============================ */

const DAY = 86_400_000;
const waitLabel = (v?: string) => {
  const t = v ? new Date(v).getTime() : NaN;
  if (isNaN(t)) return "";
  const d = Math.floor((Date.now() - t) / DAY);
  return d <= 0 ? "hari ini" : `${d} hari`;
};

function QueueBell({ role, base }: { role: QueueRole; base: string }) {
  const router = useRouter();
  const { data, isFetching, refetch } = useFetchDataPelatihanMasyarakat();
  const statuses = ROLE_STATUS[role];

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<QueueStatus | "all">("all");
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // ID yang sudah pernah dilihat (per browser)
  useEffect(() => {
    try {
      setSeen(new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")));
    } catch { /* abaikan */ }
  }, []);

  // Pending sesuai role, paling lama menunggu di atas
  const items = useMemo(
    () =>
      (data as any[])
        .filter((p) => statuses.includes(String(p.StatusPenerbitan) as QueueStatus))
        .sort((a, b) => new Date(a.UpdateAt ?? 0).getTime() - new Date(b.UpdateAt ?? 0).getTime()),
    [data, statuses]
  );

  const counts = useMemo(() => {
    const c = {} as Record<QueueStatus, number>;
    statuses.forEach((s) => (c[s] = 0));
    items.forEach((p) => c[String(p.StatusPenerbitan) as QueueStatus]++);
    return c;
  }, [items, statuses]);

  const unseen = useMemo(() => items.filter((p) => !seen.has(String(p.IdPelatihan))).length, [items, seen]);
  const shown = tab === "all" ? items : items.filter((p) => String(p.StatusPenerbitan) === tab);

  const markSeen = useCallback(() => {
    const next = new Set(items.map((p) => String(p.IdPelatihan))); // hanya simpan yang masih pending
    setSeen(next);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(next))); } catch { /* abaikan */ }
  }, [items]);

  // Tutup saat klik di luar / Esc; tandai dibaca saat panel ditutup
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      markSeen();
    };
  }, [open, markSeen]);

  const goTo = (p: any) => {
    setOpen(false);
    router.push(
      p.KodePelatihan
        ? `${base}/pelatihan/detail/${p.KodePelatihan}/${encryptValue(String(p.IdPelatihan))}`
        : `${base}/pelatihan`
    );
  };

  const total = items.length;
  const title = role === "supervisor" ? "Menunggu persetujuan Anda" : "Menunggu verifikasi Anda";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifikasi, ${total} pending`}
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${open ? "bg-[#0B1B3F] text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
      >
        {unseen > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unseen > 0 && <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-rose-500/60 animate-ping" />}
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 tabular-nums">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[9999999999999] w-[min(92vw,380px)] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl">
          {/* Header hero */}
          <div className="relative isolate overflow-hidden bg-[#0B1B3F] px-5 py-4 text-white">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(50%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-90" />
            <BellRing aria-hidden strokeWidth={1.5} className="absolute -right-3 -bottom-5 -z-10 h-24 w-24 -rotate-12 text-sky-300 opacity-20" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/80">{role === "supervisor" ? "Supervisor" : "Verifikator"}</p>
                <p className="mt-0.5 text-sm font-black">{title}</p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {total} <span className="text-xs font-semibold text-blue-100/70">pelatihan{unseen > 0 ? ` · ${unseen} baru` : ""}</span>
                </p>
              </div>
              <button type="button" onClick={() => refetch?.()} disabled={isFetching} title="Muat ulang" className="rounded-lg p-1.5 text-blue-100/70 hover:bg-white/10 hover:text-white disabled:opacity-40">
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Tab status (verifikator punya 2 status) */}
          {statuses.length > 1 && (
            <div className="flex gap-1 p-1.5 m-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
              {(["all", ...statuses] as (QueueStatus | "all")[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(s)}
                  className={`flex-1 h-8 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${tab === s ? "bg-[#0B1B3F] text-white shadow" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {s === "all" ? "Semua" : QUEUE_META[s].label.replace("Pending ", "")} <span className="opacity-60 tabular-nums">{s === "all" ? total : counts[s]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Daftar */}
          <ul className="max-h-[52vh] overflow-y-auto px-2 pb-2 divide-y divide-slate-100 dark:divide-slate-800">
            {isFetching && items.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="p-2"><div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" /></li>
              ))
            ) : shown.length === 0 ? (
              <li className="py-10 flex flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Semua beres!</p>
                <p className="text-[11px] text-slate-400">Tidak ada pelatihan yang menunggu.</p>
              </li>
            ) : (
              shown.slice(0, 20).map((p) => {
                const meta = QUEUE_META[String(p.StatusPenerbitan) as QueueStatus];
                const isNew = !seen.has(String(p.IdPelatihan));
                const wait = waitLabel(p.UpdateAt);
                return (
                  <li key={p.IdPelatihan}>
                    <button type="button" onClick={() => goTo(p)} className="group w-full flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isNew ? "bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950" : meta.dot}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">{p.NamaPelatihan}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400">
                          <span className={`font-semibold ${meta.text}`}>{meta.label}</span>
                          {p.PenyelenggaraPelatihan && <span className="truncate max-w-[150px]">{p.PenyelenggaraPelatihan}</span>}
                          {wait && <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> {wait}</span>}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-2.5">
            <span className="text-[10px] font-semibold text-slate-400">{shown.length > 20 ? `20 dari ${shown.length} ditampilkan` : "Urut: paling lama menunggu"}</span>
            <Link href={`${base}/pelatihan`} onClick={() => setOpen(false)} className="text-[11px] font-bold text-blue-600 hover:underline">
              Lihat semua
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ HEADER HELPERS ============================ */

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

type PaletteItem = { id: string; label: string; icon: ReactNode; path: string; href: string };

/** Pencarian menu cepat bergaya command palette */
function CommandPalette({
  open,
  onClose,
  items,
  activeId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
  activeId?: string;
  onSelect: (href: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) => `${i.label} ${i.path}`.toLowerCase().includes(term));
  }, [items, q]);

  useEffect(() => setCursor(0), [q]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      onSelect(results[cursor].href);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-blue-500" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik nama menu, mis. peserta, modul, P2MKP…"
            className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal rounded-xl border-none placeholder:text-slate-400"
          />
          <kbd className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Esc</kbd>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="py-10 text-center text-sm text-slate-400">Tidak ada menu yang cocok.</li>
          ) : (
            results.map((r, i) => {
              const hl = i === cursor;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => onSelect(r.href)}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${hl ? "bg-[#0B1B3F] text-white" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${hl ? "bg-white/15 text-sky-100" : "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-sky-300"}`}>
                      {r.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{r.label}</span>
                      <span className={`block truncate text-[11px] ${hl ? "text-sky-200/70" : "text-slate-400"}`}>{r.path}</span>
                    </span>
                    {r.id === activeId && (
                      <span className={`text-[10px] font-black uppercase tracking-wider ${hl ? "text-sky-300" : "text-blue-500"}`}>Aktif</span>
                    )}
                    {hl && <CornerDownLeft className="h-4 w-4 text-sky-200/70" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-400">
          <span>↑ ↓ untuk memilih · Enter untuk membuka</span>
          <span>{results.length} menu</span>
        </div>
      </div>
    </div>
  );
}

/* ============================ NAV ENTRY ============================ */

interface NavEntryProps {
  node: NavNode;
  base: string;
  depth: number;
  collapsed: boolean;
  activeIds: Set<string>;
  activeLeafId?: string;
  openGroups: Set<string>;
  onToggle: (id: string) => void;
}

function NavEntry({ node, base, depth, collapsed, activeIds, activeLeafId, openGroups, onToggle }: NavEntryProps) {
  const isGroup = !!node.children;
  const inTrail = activeIds.has(node.id);
  const isActiveLeaf = activeLeafId === node.id;
  const isOpen = openGroups.has(node.id) && !collapsed;

  // Level atas: item penuh; level bawah: item ringkas
  const top = depth === 0;

  const baseCls = `group relative flex w-full items-center gap-3 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 ${collapsed ? "justify-center px-0 py-2.5" : top ? "px-3 py-2.5" : "px-3 py-2"
    }`;

  const stateCls = top
    ? inTrail
      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30"
      : "text-blue-100/70 hover:bg-white/[0.07] hover:text-white"
    : isActiveLeaf
      ? "bg-white/10 text-white"
      : inTrail
        ? "text-white"
        : "text-blue-100/55 hover:bg-white/[0.06] hover:text-white";

  const iconEl = (
    <span className={`shrink-0 ${top && inTrail ? "text-white" : isActiveLeaf ? "text-sky-300" : ""}`}>{node.icon}</span>
  );

  const content = (
    <>
      {/* Indikator aktif sub-item */}
      {!top && isActiveLeaf && <span className="absolute -left-[13px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.9)]" />}
      {iconEl}
      {!collapsed && <span className={`flex-1 truncate text-left ${top ? "text-[13px] font-semibold" : "text-[13px] font-medium"}`}>{node.label}</span>}
      {!collapsed && isGroup && (
        <ChevronRight className={`h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      )}
      {collapsed && inTrail && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-300" />}
    </>
  );

  return (
    <li className="list-none">
      <NavTooltip label={node.label} enabled={collapsed}>
        {isGroup ? (
          <button type="button" onClick={() => onToggle(node.id)} aria-expanded={isOpen} className={`${baseCls} ${stateCls}`}>
            {content}
          </button>
        ) : (
          <Link href={base + node.href} aria-current={isActiveLeaf ? "page" : undefined} className={`${baseCls} ${stateCls}`}>
            {content}
          </Link>
        )}
      </NavTooltip>

      {/* Submenu dengan animasi tinggi */}
      {isGroup && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <ul className="ml-[22px] mt-1 space-y-0.5 border-l border-white/10 pl-3 pb-1">
              {node.children!.map((child) => (
                <NavEntry
                  key={child.id}
                  node={child}
                  base={base}
                  depth={depth + 1}
                  collapsed={collapsed}
                  activeIds={activeIds}
                  activeLeafId={activeLeafId}
                  openGroups={openGroups}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

function NavTooltip({ label, enabled, children }: { label: string; enabled: boolean; children: React.ReactElement }) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="rounded-lg bg-slate-900 text-white text-xs font-bold border-0">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ============================ PAGE HEADER ============================ */

interface HeaderPageLayoutAdminElautProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function HeaderPageLayoutAdminElaut({ icon, title, description }: HeaderPageLayoutAdminElautProps) {
  return (
    <header
      aria-label="page caption"
      className="relative isolate mt-2 overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 md:p-6 text-white ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.45)]"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-80" />
      <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5 text-center md:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 text-3xl text-sky-100 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 id="page-caption" className="text-xl md:text-2xl font-black tracking-tight">
            {title}
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm font-medium leading-relaxed text-blue-100/70">{description}</p>
        </div>
      </div>
    </header>
  );
}

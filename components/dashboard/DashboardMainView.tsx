"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, BookOpen } from "lucide-react";
import { TbBuildingEstate, TbChartPie } from "react-icons/tb";

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */

const PanelSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="h-72 lg:col-span-2 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      <div className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
  </div>
);

/* ─── Lazy load per dashboard (bundle terpisah, hanya dimuat saat dibuka) ──── */

const SummaryPelatihan = dynamic(() => import("@/components/dashboard").then((m) => m.SummaryPelatihan), {
  ssr: false,
  loading: PanelSkeleton,
});
const DashboardInstruktur = dynamic(() => import("@/components/dashboard/DashboardInstruktur"), { ssr: false, loading: PanelSkeleton });
const DashboardModul = dynamic(() => import("@/components/dashboard/DashboardModul"), { ssr: false, loading: PanelSkeleton });
const DashboardP2MKP = dynamic(() => import("@/components/dashboard/DashboardP2MKP"), { ssr: false, loading: PanelSkeleton });
const SummaryKinerja = dynamic(() => import("@/components/dashboard/SummaryKinerja"), { ssr: false, loading: PanelSkeleton });

/* ─── Konfigurasi tab ──────────────────────────────────────────────────────── */

// ElementType → menerima ikon lucide (LucideIcon) maupun react-icons (IconType) tanpa konflik tipe props
type IconType = React.ElementType;

interface AccessFlags {
  isSuperAdmin: boolean;
  viewP2MKP: boolean;
  viewPelatihan: boolean;
  viewModul: boolean;
}

interface TabConfig {
  value: string;
  label: string;
  sublabel: string;
  icon: IconType;
  accent: string; // hex, sama dengan aksen StatCard
  Component: React.ComponentType;
  visible: (a: AccessFlags) => boolean;
}

const TABS: TabConfig[] = [
  {
    value: "pelatihan",
    label: "Pelatihan",
    sublabel: "Realisasi & PNPB",
    icon: BarChart3,
    accent: "#3B82F6",
    Component: SummaryPelatihan,
    visible: (a) => a.isSuperAdmin || a.viewPelatihan || (!a.viewP2MKP && !a.viewModul),
  },
  { value: "instruktur", label: "SDM Pelatih", sublabel: "Instruktur & WI", icon: Users, accent: "#8B5CF6", Component: DashboardInstruktur, visible: () => true },
  { value: "modul", label: "Perangkat", sublabel: "Modul Pelatihan", icon: BookOpen, accent: "#10B981", Component: DashboardModul, visible: (a) => a.isSuperAdmin || a.viewModul },
  { value: "p2mkp", label: "P2MKP", sublabel: "Penetapan & Klasifikasi", icon: TbBuildingEstate, accent: "#06B6D4", Component: DashboardP2MKP, visible: (a) => a.isSuperAdmin || a.viewP2MKP },
  { value: "kinerja", label: "Kinerja", sublabel: "Indikator Kinerja", icon: TbChartPie, accent: "#F59E0B", Component: SummaryKinerja, visible: () => true },
];

const STORAGE_KEY = "dashboard:lastTab";

const readStoredTab = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeTab = (tab: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, tab);
  } catch {
    /* abaikan (private mode, dll) */
  }
};

/* ─── Main view ────────────────────────────────────────────────────────────── */

export default function DashboardMainView() {
  const [access, setAccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  // Tab yang pernah dibuka tetap ter-mount → pindah tab balik tidak fetch/render ulang
  const [visited, setVisited] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAccess(Cookies.get("Access") || "");
  }, []);

  const flags = useMemo<AccessFlags | null>(() => {
    if (access === null) return null;
    return {
      isSuperAdmin: access.includes("superAdmin"),
      viewP2MKP: access.includes("viewP2MKP"),
      viewPelatihan: access.includes("viewPelatihan"),
      viewModul: access.includes("viewModul"),
    };
  }, [access]);

  const visibleTabs = useMemo(() => (flags ? TABS.filter((t) => t.visible(flags)) : []), [flags]);

  const isOnlyViewP2MKP = !!flags && flags.viewP2MKP && !flags.isSuperAdmin && !flags.viewPelatihan && !flags.viewModul;

  // Tab awal: tab terakhir (jika masih boleh) → default per role → tab pertama
  useEffect(() => {
    if (!flags || visibleTabs.length === 0 || activeTab) return;
    const allowed = new Set(visibleTabs.map((t) => t.value));
    const stored = readStoredTab();
    const roleDefault = flags.viewP2MKP && !flags.viewPelatihan && !flags.isSuperAdmin ? "p2mkp" : "pelatihan";
    const initial = (stored && allowed.has(stored) && stored) || (allowed.has(roleDefault) && roleDefault) || visibleTabs[0].value;
    setActiveTab(initial);
    setVisited(new Set([initial]));
  }, [flags, visibleTabs, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    storeTab(value);
    setVisited((prev) => (prev.has(value) ? prev : new Set(prev).add(value)));
  };

  if (!flags) return <PanelSkeleton />;
  if (isOnlyViewP2MKP) return <DashboardP2MKP />;
  if (!activeTab) return <PanelSkeleton />;

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-2">
      {/* Tab bar navy — tab aktif berupa kaca (glassmorphism) + ikon besar di latar seperti StatCard */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
          <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="bg-transparent h-auto p-1.5 flex items-stretch gap-1.5 min-w-max md:min-w-0 w-full">
              {visibleTabs.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    style={{ ["--accent" as string]: t.accent }}
                    className="group relative isolate overflow-hidden flex-1 min-w-[150px] justify-start rounded-[1.35rem] py-3 px-4 text-blue-100/70 font-bold ring-1 ring-transparent transition-all duration-300 outline-none
                      hover:text-white hover:bg-white/[0.06]
                      focus-visible:ring-2 focus-visible:ring-sky-300/60
                      data-[state=active]:text-white data-[state=active]:bg-white/[0.12] data-[state=active]:backdrop-blur-xl data-[state=active]:ring-white/25
                      data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-12px_var(--accent)]"
                  >
                    {/* Glow aksen (kanan → kiri), menyala lembut saat hover / aktif */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-50 group-data-[state=active]:opacity-100"
                      style={{ background: `linear-gradient(to left, ${t.accent}59 0%, ${t.accent}1f 40%, transparent 80%)` }}
                    />
                    {/* Kilau kaca di bagian atas */}
                    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                    {/* Ikon besar di latar kanan */}
                    <Icon
                      aria-hidden
                      strokeWidth={1.5}
                      className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-[0.08] transition-all duration-500 ease-out group-hover:opacity-20 group-hover:-rotate-6 group-data-[state=active]:opacity-35 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-6"
                      style={{ color: t.accent, filter: `drop-shadow(0 0 16px ${t.accent}80)` }}
                    />

                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-1.5 rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/15 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 group-data-[state=active]:[background:var(--accent)] group-data-[state=active]:shadow-[0_6px_16px_-4px_var(--accent)]"
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-sm tracking-tight whitespace-nowrap">{t.label}</span>
                        <span className="hidden sm:block mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-blue-100/45 group-data-[state=active]:text-sky-100/80">
                          {t.sublabel}
                        </span>
                      </div>
                    </div>

                    {/* Garis aksen bawah saat aktif */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 scale-x-50 transition-all duration-300 group-data-[state=active]:opacity-100 group-data-[state=active]:scale-x-100"
                      style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {visibleTabs.map(({ value, Component }) =>
          visited.has(value) ? (
            <TabsContent
              key={value}
              value={value}
              forceMount
              className="space-y-4 outline-none mt-0 data-[state=inactive]:hidden animate-in fade-in-50 duration-300"
            >
              <Component />
            </TabsContent>
          ) : null
        )}
      </div>
    </Tabs>
  );
}

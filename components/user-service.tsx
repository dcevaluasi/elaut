"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, KeyboardEvent, ReactNode } from "react";
import { HiUserGroup } from "react-icons/hi2";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";
import { motion, MotionConfig } from "framer-motion";
import type { Variants } from "framer-motion";
import { User } from "@/types/user";
import UserTrainingService from "./user-training-service";
import UserCertificateService, {
  isCertificateAvailable,
} from "./user-certificate-service";
import UserDocuments from "./user-documents";

type TabId = "pelatihan" | "sertifikat" | "profil";

type TabMenu = {
  id: TabId;
  name: string;
  /** Dipakai di layar sempit supaya tiga tab muat dalam satu baris. */
  shortName: string;
  description: string;
  icon: ReactNode;
  Panel: ComponentType<{ user: User | null }>;
};

const TABS: TabMenu[] = [
  {
    id: "pelatihan",
    name: "Pelatihan Diikuti",
    shortName: "Pelatihan",
    description: "Riwayat dan status pelatihan yang Anda ambil.",
    icon: <FaFilePen />,
    Panel: UserTrainingService,
  },
  {
    id: "sertifikat",
    name: "Sertifikat",
    shortName: "Sertifikat",
    description: "Sertifikat resmi yang sudah Anda raih.",
    icon: <RiVerifiedBadgeFill />,
    Panel: UserCertificateService,
  },
  {
    id: "profil",
    name: "Profil & Dokumen",
    shortName: "Profil",
    description: "Perbarui data profil dan unggah berkas.",
    icon: <HiUserGroup />,
    Panel: UserDocuments,
  },
];

const DEFAULT_TAB: TabId = "pelatihan";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e293b]";

/* -------------------------------------------------------------------------- */
/*  Lencana jumlah pada tab                                                    */
/* -------------------------------------------------------------------------- */

type TabBadge = {
  value: number;
  tone: "neutral" | "success";
  /** Dibaca pembaca layar sebagai bagian dari nama tab. */
  label: string;
};

type TrainingItem = Parameters<typeof isCertificateAvailable>[0];

function getBadges(user: User | null): Partial<Record<TabId, TabBadge>> {
  if (!user) return {};

  const trainings = (user.Pelatihan ?? []) as TrainingItem[];
  const badges: Partial<Record<TabId, TabBadge>> = {};

  if (trainings.length > 0) {
    badges.pelatihan = {
      value: trainings.length,
      tone: "neutral",
      label: `${trainings.length} pelatihan`,
    };
  }

  const available = trainings.filter(
    (t) => t.NoSertifikat && isCertificateAvailable(t),
  ).length;
  if (available > 0) {
    badges.sertifikat = {
      value: available,
      tone: "success",
      label: `${available} tersedia`,
    };
  }

  return badges;
}

/* -------------------------------------------------------------------------- */
/*  Animasi panel                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Panel yang sudah dibuka tetap terpasang (state dan pencarian tidak hilang),
 * jadi animasi masuk dijalankan lewat variants, bukan lewat mount ulang.
 * Panel yang disembunyikan langsung hilang agar tidak menumpuk dengan panel baru.
 */
const panelVariants: Variants = {
  show: {
    opacity: 1,
    y: 0,
    display: "block",
    transition: { duration: 0.22, ease: "easeOut" },
  },
  hide: {
    opacity: 0,
    y: 8,
    display: "none",
    transition: { duration: 0 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function UserService({ user }: { user: User | null }) {
  // `null` = URL belum dibaca (hanya sesaat setelah halaman dimuat).
  const [active, setActive] = useState<TabId | null>(null);
  // Tab baru dimuat saat pertama dibuka, lalu tetap terpasang agar
  // pencarian, pilihan, dan data di dalamnya tidak hilang saat berpindah tab.
  const [visited, setVisited] = useState<TabId[]>([]);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  const badges = useMemo(() => getBadges(user), [user]);

  // Buka tab dari URL (?tab=sertifikat) agar muat ulang dan tautan tetap benar.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    const initial = TABS.find((t) => t.id === param)?.id ?? DEFAULT_TAB;
    setActive(initial);
    setVisited([initial]);
  }, []);

  const select = useCallback((id: TabId, focus = false) => {
    setActive(id);
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));

    const url = new URL(window.location.href);
    if (id === DEFAULT_TAB) url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    window.history.replaceState(window.history.state, "", url);

    if (focus) tabRefs.current[id]?.focus();
  }, []);

  const current = active ?? DEFAULT_TAB;
  const currentTab = TABS.find((t) => t.id === current) ?? TABS[0];

  // Navigasi keyboard: panah kiri/kanan, Home, End.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.id === current);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === -1) return;
    e.preventDefault();
    select(TABS[next].id, true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div id="explore" className="flex w-full scroll-mt-24 flex-col gap-4">
        {/* Bilah tab: menempel di atas saat halaman di-scroll agar mudah berpindah. */}
        <div className="sticky top-24 z-20">
          <div
            role="tablist"
            aria-label="Layanan pengguna"
            onKeyDown={handleKeyDown}
            className="grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-[#1e293b]/80 p-1.5 shadow-lg shadow-black/20 backdrop-blur-xl"
          >
            {TABS.map((tab) => {
              const isActive = tab.id === current;
              const badge = badges[tab.id];
              const badgeTone = isActive
                ? "bg-white/20 text-white"
                : badge?.tone === "success"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-white/10 text-slate-300";

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-label={badge ? `${tab.name}, ${badge.label}` : tab.name}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(tab.id)}
                  className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors sm:flex-row sm:gap-2.5 sm:px-4 sm:text-sm ${focusRing} ${isActive
                      ? "text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="user-service-active-tab"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      className="absolute inset-0 rounded-xl bg-cyan-600 shadow-lg shadow-cyan-500/25 ring-1 ring-inset ring-white/20"
                    />
                  )}
                  <span className="relative z-10 text-lg sm:text-xl" aria-hidden>
                    {tab.icon}
                  </span>
                  <span className="relative z-10 flex items-center gap-1.5" aria-hidden>
                    <span className="sm:hidden">{tab.shortName}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                    {badge && (
                      <span
                        className={`min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-4 tabular-nums transition-colors ${badgeTone}`}
                      >
                        {badge.value}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.p
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="px-1 text-sm text-slate-400"
        >
          {currentTab.description}
        </motion.p>

        <div className="mt-2 w-full">
          {active === null && (
            <div
              aria-hidden
              className="h-64 animate-pulse rounded-2xl bg-white/5 motion-reduce:animate-none"
            />
          )}

          {active !== null &&
            TABS.map(({ id, Panel }) =>
              visited.includes(id) ? (
                <motion.div
                  key={id}
                  id={`panel-${id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${id}`}
                  hidden={id !== current}
                  variants={panelVariants}
                  initial="hide"
                  animate={id === current ? "show" : "hide"}
                  className="w-full"
                >
                  <Panel user={user} />
                </motion.div>
              ) : null,
            )}
        </div>
      </div>
    </MotionConfig>
  );
}
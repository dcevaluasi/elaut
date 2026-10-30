"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MapPin, RotateCcw, Search, Target, X } from "lucide-react";

import type { P2MKP } from "@/types/p2mkp";
import type { P2MKPPin } from "@/components/ui/P2MKPLeafletMap";
import { cn } from "@/lib/utils";
import { BPPP_GROUPS, ISLAND_GROUPS, KLASIFIKASI_LEGEND } from "./data";
import { KlasifikasiLabel, klasifikasiOf, normalizeProvinsi, toPin } from "./utils";
import { SectionTitle, StatCard } from "./shared";

const P2MKPLeafletMap = dynamic(() => import("@/components/ui/P2MKPLeafletMap"), {
  ssr: false,
  loading: () => <MapLoading label="Memuat peta…" />,
});

function MapLoading({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#030d1a]">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-400" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

const chip =
  "flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200";

export default function MapSection({ p2mkpList, loading }: { p2mkpList: P2MKP[]; loading: boolean }) {
  const [regionTab, setRegionTab] = React.useState<"bppp" | "kepulauan">("bppp");
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const [province, setProvince] = React.useState<string | null>(null);
  const [klasifikasi, setKlasifikasi] = React.useState<KlasifikasiLabel | null>(null);
  const [query, setQuery] = React.useState("");

  /* ----------------------------- Derived ------------------------------ */
  // The list is already filtered to approved P2MKP by the page.
  const allPins = React.useMemo(
    () => p2mkpList.map(toPin).filter((p): p is P2MKPPin => p !== null),
    [p2mkpList]
  );

  const provinceCount = React.useMemo(() => {
    const counts: Record<string, number> = {};
    allPins.forEach((p) => {
      const prov = normalizeProvinsi(p.provinsi);
      if (prov) counts[prov] = (counts[prov] ?? 0) + 1;
    });
    return counts;
  }, [allPins]);

  const klasifikasiCount = React.useMemo(() => {
    const counts = {} as Record<KlasifikasiLabel, number>;
    allPins.forEach((p) => {
      const k = klasifikasiOf(p.klasifikasi);
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return counts;
  }, [allPins]);

  const totalProvinsi = React.useMemo(
    () => new Set(p2mkpList.map((i) => normalizeProvinsi(i.provinsi)).filter(Boolean)).size,
    [p2mkpList]
  );

  const q = query.trim().toLowerCase();
  const displayPins = allPins.filter(
    (p) =>
      (!province || normalizeProvinsi(p.provinsi) === province) &&
      (!klasifikasi || klasifikasiOf(p.klasifikasi) === klasifikasi) &&
      (!q || `${p.nama} ${p.kota} ${p.provinsi} ${p.jenisPelatihan}`.toLowerCase().includes(q))
  );

  const groups = regionTab === "kepulauan" ? ISLAND_GROUPS : BPPP_GROUPS;
  const hasFilter = !!(province || klasifikasi || q);
  const resetFilters = () => {
    setProvince(null);
    setKlasifikasi(null);
    setQuery("");
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <section id="sebaran" className="relative scroll-mt-32 overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute left-[-5%] top-0 h-[50%] w-[45%] rounded-full bg-blue-600/10 blur-[140px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <SectionTitle
          eyebrow="Sebaran Nasional"
          title="Peta P2MKP Indonesia"
          description="Persebaran Pusat Pelatihan Mandiri Kelautan dan Perikanan di seluruh kepulauan nusantara."
        />

        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard icon={Briefcase} label="Total Lembaga" value={p2mkpList.length} loading={loading} />
          <StatCard icon={MapPin} label="Provinsi Aktif" value={totalProvinsi} loading={loading} />
          <StatCard icon={Target} label="Titik Dipetakan" value={allPins.length} loading={loading} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]"
        >
          {/* Map */}
          <div className="relative h-[460px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-blue-500/5 md:h-[560px] lg:h-[680px]">
            {loading ? (
              <MapLoading label="Memuat data peta…" />
            ) : (
              <>
                <P2MKPLeafletMap pins={displayPins} />

                <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-md">
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-gray-500">Klasifikasi</p>
                  {KLASIFIKASI_LEGEND.map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-300">{l.label}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute right-4 top-4 z-[1000] rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                  {displayPins.length} titik ditampilkan
                </div>

                {allPins.length === 0 && (
                  <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="space-y-2 text-center">
                      <div className="text-3xl" aria-hidden="true">📍</div>
                      <p className="text-sm font-black uppercase tracking-wider text-white">Belum ada data koordinat</p>
                      <p className="text-[10px] text-gray-400">Koordinat lembaga belum tersedia.</p>
                    </div>
                  </div>
                )}
                {allPins.length > 0 && displayPins.length === 0 && (
                  <div className="absolute inset-x-0 top-1/2 z-[999] mx-auto w-fit -translate-y-1/2 rounded-2xl border border-white/10 bg-black/80 px-5 py-4 text-center backdrop-blur-md">
                    <p className="text-sm font-semibold text-white">Tidak ada P2MKP untuk filter ini</p>
                    <button type="button" onClick={resetFilters} className="mt-2 text-xs font-semibold text-blue-300 hover:underline">
                      Reset filter
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filters */}
          <aside className="flex flex-col gap-4 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar]:w-1.5">
            {/* Search */}
            <label className="flex shrink-0 items-center rounded-2xl border border-white/10 bg-white/5 px-3 transition focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <span className="sr-only">Cari lembaga</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama, kota, bidang…"
                className="w-full bg-transparent px-2.5 py-3 text-sm text-white outline-none placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            {/* Classification */}
            <div className="shrink-0 space-y-2">
              <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Klasifikasi</p>
              <div className="grid grid-cols-2 gap-2">
                {KLASIFIKASI_LEGEND.map((k) => {
                  const count = klasifikasiCount[k.label] ?? 0;
                  const active = klasifikasi === k.label;
                  return (
                    <button
                      key={k.label}
                      type="button"
                      onClick={() => setKlasifikasi(active ? null : k.label)}
                      disabled={count === 0}
                      aria-pressed={active}
                      style={active ? { borderColor: k.color, backgroundColor: `${k.color}1f` } : undefined}
                      className={cn(
                        "flex items-center justify-between gap-1 rounded-xl border px-2.5 py-2 text-left transition-all",
                        count === 0 ? "cursor-not-allowed border-white/5 opacity-40" : !active && "border-white/10 hover:bg-white/5"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: k.color }} />
                        <span className={cn("truncate text-[10px] font-bold uppercase tracking-wider", active ? "text-white" : "text-gray-400")}>
                          {k.label}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-gray-300">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Wilayah</p>
              <div className="flex gap-2 rounded-xl bg-white/5 p-1">
                {(["bppp", "kepulauan"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={regionTab === tab}
                    onClick={() => {
                      setRegionTab(tab);
                      setOpenGroup(null);
                      setProvince(null);
                    }}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      regionTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-white"
                    )}
                  >
                    {tab === "bppp" ? "Per BPPP" : "Per Kepulauan"}
                  </button>
                ))}
              </div>

              {groups.map((group) => {
                const total = group.provinces.reduce((s, p) => s + (provinceCount[p] ?? 0), 0);
                const covered = group.provinces.filter((p) => provinceCount[p]).length;
                const open = openGroup === group.name;
                return (
                  <div key={group.name} className="overflow-hidden rounded-2xl border border-white/10">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenGroup(open ? null : group.name)}
                      className={cn("flex w-full items-center justify-between gap-3 p-3.5 transition-colors", open ? "bg-white/10" : "bg-white/5 hover:bg-white/[0.08]")}
                    >
                      <span className="flex items-center gap-3 text-left">
                        <span className="text-xl" aria-hidden="true">{group.icon}</span>
                        <span>
                          <span className="block text-[11px] font-black uppercase tracking-wider text-white">{group.name}</span>
                          <span className="mt-0.5 block text-[10px] font-bold text-gray-500">
                            {covered}/{group.provinces.length} provinsi
                          </span>
                        </span>
                      </span>
                      {total > 0 && (
                        <span className={cn("rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-black text-white", group.color)}>{total}</span>
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="space-y-1 p-2">
                            {group.provinces.map((prov) => {
                              const count = provinceCount[prov] ?? 0;
                              const active = province === prov;
                              return (
                                <button
                                  key={prov}
                                  type="button"
                                  disabled={count === 0}
                                  aria-pressed={active}
                                  onClick={() => setProvince(active ? null : prov)}
                                  className={cn(
                                    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[10px] font-bold transition-all",
                                    count === 0
                                      ? "cursor-not-allowed text-gray-700"
                                      : active
                                        ? cn("bg-gradient-to-r text-white", group.color)
                                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                                  )}
                                >
                                  <span className="flex items-center gap-2 truncate uppercase tracking-wider">
                                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", count ? cn("bg-gradient-to-br", group.color) : "bg-white/10")} />
                                    {prov}
                                  </span>
                                  {count > 0 && (
                                    <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black", active ? "bg-white/20" : "bg-white/10 text-gray-500")}>
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </aside>
        </motion.div>

        {/* Active filters */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3" aria-live="polite">
          <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {displayPins.length} dari {allPins.length} titik
          </span>
          {klasifikasi && (
            <span className={chip}>
              {klasifikasi}
              <button type="button" onClick={() => setKlasifikasi(null)} aria-label="Hapus filter klasifikasi" className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {province && (
            <span className={chip}>
              {province}
              <button type="button" onClick={() => setProvince(null)} aria-label="Hapus filter provinsi" className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {q && (
            <span className={chip}>
              “{query.trim()}”
              <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

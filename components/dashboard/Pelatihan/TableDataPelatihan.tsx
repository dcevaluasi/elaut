"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import {
  Briefcase,
  Users,
  Loader,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  Search,
  X,
  RefreshCw,
  ListChecks,
  PlusCircle,
  LucideIcon,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import { encryptValue } from "@/lib/utils";
import { isSigned } from "@/utils/status";
import { UPT } from "@/constants/nomenclatures";
import { PelatihanMasyarakat } from "@/types/product";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import TableDataPelatihanMasyarakat from "./Table/TableDataPelatihanMasyrakat";
import FormPelatihan from "@/components/form/FormPelatihan";

/* ============================ KONSTANTA ============================ */

// Urutan tampil di tabel (index kecil = paling atas)
const STATUS_ORDER = [
  "Draft",
  "Pending SPV",
  "Perbaikan SPV",
  "Pending Verifikator",
  "Perbaikan Verifikator",
  "Pending Kapus",
  "Perbaikan Kapus",
  "Approved Kapus",
  "Pending Kabalai",
  "Perbaikan Kabalai",
  "Approved Kabalai",
  "Pending Kabadan",
  "Perbaikan Kabadan",
  "Approved Kabadan",
  "Approved Pelaksanaan",
  "Pending STTPL Verifikator",
  "Perbaikan STTPL Verifikator",
  "Signed",
  "Publish",
  "Closed",
  "Tidak Diketahui",
];
const STATUS_RANK = new Map(STATUS_ORDER.map((s, i) => [s, i]));

const QUICK_STATUS_FILTERS = [
  { key: "All", label: "Semua", dot: "bg-slate-400", active: "bg-[#0B1B3F] text-white border-[#0B1B3F]" },
  { key: "Draft", label: "Draft", dot: "bg-slate-400", active: "bg-slate-700 text-white border-slate-700" },
  { key: "Pending SPV", label: "Pending SPV", dot: "bg-orange-500", active: "bg-orange-500 text-white border-orange-500" },
  { key: "Pending Verifikator", label: "Pending Verifikator", dot: "bg-amber-500", active: "bg-amber-500 text-white border-amber-500" },
  { key: "Pending Kapus", label: "Pending Kapus", dot: "bg-purple-500", active: "bg-purple-600 text-white border-purple-600" },
  { key: "Approved Kapus", label: "Approved Kapus", dot: "bg-blue-500", active: "bg-blue-600 text-white border-blue-600" },
  { key: "Signed", label: "Signed", dot: "bg-emerald-500", active: "bg-emerald-600 text-white border-emerald-600" },
] as const;

const UPT_OPTIONS: string[] = Array.from(new Set<string>(UPT || [])).filter(Boolean);

const AKP_KEYWORDS = ["ANKAPIN", "ATKAPIN", "BSTF", "Rating", "SKN", "SKPI", "SOPI", "Fishing Master"];
const KELAUTAN_KEYWORDS = ["BCL", "Sampah", "Ruang Laut", "Mitigasi", "Konservasi"];

const CURRENT_YEAR = new Date().getFullYear().toString();

/* ============================ HELPERS ============================ */

const toTime = (s?: string | null) => {
  if (!s) return NaN;
  return new Date(s).getTime();
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const pct = (n: number, t: number) => (t > 0 ? Math.round((n / t) * 100) : 0);

interface IndexedRow {
  p: PelatihanMasyarakat;
  nama: string;
  program: string;
  penyelenggara: string;
  year: string;
  pill: string; // label status (atau "Draft")
  signed: boolean;
  peserta: number;
}

/** Hitung field turunan SEKALI per data, sudah terurut → filter tidak perlu sort ulang */
const buildIndex = (data: PelatihanMasyarakat[]): IndexedRow[] => {
  const rows = data.map((p) => {
    const status = String(p.StatusPenerbitan ?? "");
    const label = getStatusInfo(status).label;
    const isDraft = label === "Draft" || status === "0" || !p.StatusPenerbitan;
    const t = toTime(p.TanggalMulaiPelatihan);
    return {
      row: {
        p,
        nama: (p.NamaPelatihan || "").toLowerCase(),
        program: (p.Program || "").toLowerCase(),
        penyelenggara: (p.PenyelenggaraPelatihan || "").toLowerCase(),
        year: isNaN(t) ? "" : new Date(t).getFullYear().toString(),
        pill: isDraft ? "Draft" : label,
        signed: isSigned(status),
        peserta: p.UserPelatihan?.length || 0,
      } as IndexedRow,
      rank: STATUS_RANK.get(label) ?? STATUS_ORDER.length,
      time: isNaN(t) ? 0 : t,
    };
  });

  rows.sort((a, b) => a.rank - b.rank || b.time - a.time);
  return rows.map((r) => r.row);
};

/* ============================ STAT CARD (gaya hero) ============================ */

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  sub?: string;
  icon: LucideIcon;
  accent: string; // warna hex aksen
  progress?: number;
  onClick?: () => void;
  active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, sub, icon: Icon, accent, progress, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={`group relative isolate overflow-hidden rounded-3xl bg-[#0B1B3F] p-5 text-left text-white ring-1 transition-all duration-300 ${onClick ? "hover:-translate-y-0.5 cursor-pointer" : "cursor-default"} ${active ? "ring-2 ring-white/50 shadow-xl" : "ring-white/10 shadow-lg"}`}
    style={{ boxShadow: active ? `0 18px 40px -16px ${accent}` : undefined }}
  >
    {/* Mesh aksen */}
    <div
      className="absolute inset-0 -z-10 opacity-90"
      style={{ background: `radial-gradient(70% 90% at 100% 0%, ${accent}66 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #2563EB55 0%, transparent 60%)` }}
    />
    <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />

    {/* Cahaya lembut kanan → kiri saat hover / aktif */}
    <div
      className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ease-out ${active ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
      style={{ background: `linear-gradient(to left, ${accent}59 0%, ${accent}26 35%, transparent 75%)` }}
    />

    {/* Ikon besar sebagai background di kanan */}
    <Icon
      aria-hidden
      strokeWidth={1.5}
      className={`pointer-events-none absolute -right-5 -bottom-7 -z-10 w-32 h-32 -rotate-12 transition-all duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 ${active ? "opacity-40" : "opacity-20 group-hover:opacity-40"}`}
      style={{ color: accent, filter: `drop-shadow(0 0 24px ${accent}66)` }}
    />

    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-100/75 pr-10">{label}</p>
    <div className="mt-1 flex items-baseline gap-1.5">
      <span className="text-3xl md:text-4xl font-black tracking-[-0.03em] tabular-nums">{fmt(value)}</span>
      <span className="text-[10px] font-bold uppercase text-sky-100/70">{unit}</span>
    </div>

    {progress !== undefined && (
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #fff)` }} />
      </div>
    )}
    {sub && <p className="mt-2 text-[11px] font-medium text-blue-100/60 truncate">{sub}</p>}
  </button>
);

const StatSkeleton = () => <div className="h-[132px] rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />;

/* ============================ KOMPONEN ============================ */

const TableDataPelatihan: React.FC = () => {
  const { data, isFetching, refetch } = useFetchDataPelatihanMasyarakat();
  const { data: programs } = useFetchDataProgramPelatihan();

  const [canCreate] = useState(() => (Cookies.get("Access") || "").includes("createPelatihan"));
  const [tabValue, setTabValue] = useState<"list" | "create">("list");

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterUPT, setFilterUPT] = useState("all");
  const [filterYear, setFilterYear] = useState(CURRENT_YEAR);

  // Shortcut "/" untuk fokus ke pencarian
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Index (sekali per perubahan data) ---------- */
  const indexed = useMemo(() => buildIndex(data), [data]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>([CURRENT_YEAR]);
    for (const r of indexed) if (r.year) years.add(r.year);
    return Array.from(years).sort((a, b) => +b - +a);
  }, [indexed]);

  const groupedPrograms = useMemo(() => {
    const valid = programs.filter((p) => p.name_indo?.trim());
    const akp = valid.filter((p) => AKP_KEYWORDS.some((k) => p.name_indo.includes(k)) || p.abbrv_name?.includes("AKP"));
    const akpIds = new Set(akp.map((p) => p.id_program_pelatihan));
    const kelautan = valid.filter((p) => !akpIds.has(p.id_program_pelatihan) && KELAUTAN_KEYWORDS.some((k) => p.name_indo.includes(k)));
    const kelautanIds = new Set(kelautan.map((p) => p.id_program_pelatihan));
    const perikanan = valid.filter((p) => !akpIds.has(p.id_program_pelatihan) && !kelautanIds.has(p.id_program_pelatihan));
    return [
      { label: "AKP", items: akp },
      { label: "Perikanan", items: perikanan },
      { label: "Kelautan", items: kelautan },
    ].filter((g) => g.items.length > 0);
  }, [programs]);

  /* ---------- Filter + statistik + hitungan pill dalam 1 loop ---------- */
  const { rows, pillCounts, stats } = useMemo(() => {
    const prog = filterProgram === "all" ? "" : filterProgram.toLowerCase().trim();
    const upt = filterUPT === "all" ? "" : filterUPT.toLowerCase().trim();

    const counts: Record<string, number> = {};
    QUICK_STATUS_FILTERS.forEach((f) => (counts[f.key] = 0));

    const out: PelatihanMasyarakat[] = [];
    let total = 0, peserta = 0, proses = 0, selesai = 0;

    for (const r of indexed) {
      if (filterYear !== "All" && r.year !== filterYear) continue;
      if (prog && !r.program.includes(prog)) continue;
      if (upt && !r.penyelenggara.includes(upt)) continue;
      if (deferredSearch && !r.nama.includes(deferredSearch) && !r.penyelenggara.includes(deferredSearch) && !String(r.p.IdPelatihan).includes(deferredSearch)) continue;

      // base (tanpa filter status) → untuk kartu statistik & hitungan pill
      total++;
      peserta += r.peserta;
      if (r.signed) selesai++;
      else if (r.pill !== "Draft") proses++;
      counts.All++;
      if (r.pill in counts) counts[r.pill]++;

      if (statusFilter === "All" || r.pill === statusFilter) out.push(r.p);
    }

    return { rows: out, pillCounts: counts, stats: { total, peserta, proses, selesai } };
  }, [indexed, filterYear, filterProgram, filterUPT, deferredSearch, statusFilter]);

  /* ---------- Chip filter aktif ---------- */
  const activeChips = [
    searchQuery && { key: "search", label: `"${searchQuery}"`, clear: () => setSearchQuery("") },
    statusFilter !== "All" && { key: "status", label: statusFilter, clear: () => setStatusFilter("All") },
    filterYear !== CURRENT_YEAR && { key: "year", label: filterYear === "All" ? "Semua Tahun" : `Tahun ${filterYear}`, clear: () => setFilterYear(CURRENT_YEAR) },
    filterProgram !== "all" && { key: "program", label: filterProgram, clear: () => setFilterProgram("all") },
    filterUPT !== "all" && { key: "upt", label: filterUPT, clear: () => setFilterUPT("all") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const advancedCount = (filterProgram !== "all" ? 1 : 0) + (filterUPT !== "all" ? 1 : 0);

  const resetAll = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setFilterProgram("all");
    setFilterUPT("all");
    setFilterYear(CURRENT_YEAR);
  };

  const initialLoading = isFetching && data.length === 0;
  const avgPeserta = stats.total > 0 ? Math.round(stats.peserta / stats.total) : 0;

  /* ============================ RENDER ============================ */

  const listContent = (
    <div className="flex flex-col gap-5">
      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {initialLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Total Pelatihan"
              value={stats.total}
              unit="Kelas"
              sub={filterYear === "All" ? "semua tahun" : `tahun ${filterYear}`}
              icon={Briefcase}
              accent="#3B82F6"
              onClick={() => setStatusFilter("All")}
              active={statusFilter === "All"}
            />
            <StatCard
              label="Total Peserta"
              value={stats.peserta}
              unit="Orang"
              sub={`rata-rata ${fmt(avgPeserta)} / kelas`}
              icon={Users}
              accent="#06B6D4"
            />
            <StatCard
              label="Dalam Proses"
              value={stats.proses}
              unit="Kelas"
              sub={`${pct(stats.proses, stats.total)}% dari total`}
              icon={Loader}
              accent="#F59E0B"
              progress={pct(stats.proses, stats.total)}
            />
            <StatCard
              label="Selesai (Signed)"
              value={stats.selesai}
              unit="Kelas"
              sub={`${pct(stats.selesai, stats.total)}% tersertifikasi`}
              icon={CheckCircle2}
              accent="#10B981"
              progress={pct(stats.selesai, stats.total)}
              onClick={() => setStatusFilter(statusFilter === "Signed" ? "All" : "Signed")}
              active={statusFilter === "Signed"}
            />
          </>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center bg-white dark:bg-slate-900 p-2.5 rounded-3xl ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Cari nama pelatihan, penyelenggara, atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-16 h-11 w-full border-none bg-slate-50 dark:bg-slate-800 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-semibold text-sm placeholder:font-normal"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400">
              /
            </kbd>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className={`h-11 flex-1 md:w-[140px] border-none rounded-2xl font-bold text-xs ${filterYear !== CURRENT_YEAR ? "bg-[#0B1B3F] text-white" : "bg-slate-50 dark:bg-slate-800"}`}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="All">Semua Tahun</SelectItem>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 flex-1 md:flex-none px-4 gap-2 border-none rounded-2xl font-bold text-xs ${advancedCount > 0 ? "bg-[#0B1B3F] text-white hover:bg-[#0B1B3F]/90 hover:text-white" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
                Filter
                {advancedCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-sky-400 text-[#0B1B3F] text-[10px] font-black flex items-center justify-center">
                    {advancedCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4 space-y-4 rounded-2xl shadow-xl" align="end" onPointerDown={(e) => e.stopPropagation()}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Lanjutan</p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Program Pelatihan</label>
                <Select value={filterProgram} onValueChange={setFilterProgram}>
                  <SelectTrigger className="h-9 text-xs w-full rounded-xl" onPointerDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Semua Program" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-72">
                    <SelectItem value="all">Semua Program</SelectItem>
                    {groupedPrograms.map((g) => (
                      <SelectGroup key={g.label}>
                        <SelectLabel>{g.label}</SelectLabel>
                        {g.items.map((i) => (
                          <SelectItem key={i.id_program_pelatihan} value={i.name_indo}>{i.name_indo}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Unit Penyelenggara</label>
                <Select value={filterUPT} onValueChange={setFilterUPT}>
                  <SelectTrigger className="h-9 text-xs w-full rounded-xl" onPointerDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Semua UPT" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-72">
                    <SelectItem value="all">Semua UPT</SelectItem>
                    {UPT_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {advancedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-xl"
                  onClick={() => {
                    setFilterProgram("all");
                    setFilterUPT("all");
                  }}
                >
                  Reset Filter Lanjutan
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Muat ulang data"
            className="h-11 w-11 shrink-0 border-none bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Quick Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {QUICK_STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.key;
          const count = pillCounts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(isActive && f.key !== "All" ? "All" : f.key)}
              className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${isActive
                ? `${f.active} shadow-md`
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50"
                } ${count === 0 && !isActive ? "opacity-50" : ""}`}
            >
              {!isActive && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />}
              {f.label}
              <span className={`min-w-[22px] text-center text-[10px] font-black px-1.5 py-0.5 rounded-full tabular-nums ${isActive ? "bg-white/25" : "bg-slate-100 dark:bg-slate-800"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info hasil + chip filter aktif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xs text-slate-500 mr-1">
            Menampilkan <span className="font-black text-slate-800 dark:text-slate-200">{fmt(rows.length)}</span> dari{" "}
            <span className="font-bold">{fmt(stats.total)}</span> pelatihan
          </p>
          {activeChips.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold max-w-[220px]">
              <span className="truncate">{c.label}</span>
              <button type="button" onClick={c.clear} className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900" aria-label={`Hapus filter ${c.label}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {activeChips.length > 1 && (
          <button type="button" onClick={resetAll} className="text-[11px] font-bold text-rose-500 hover:text-rose-600 self-start sm:self-auto">
            Reset semua
          </button>
        )}
      </div>

      {/* Tabel / Loading / Empty */}
      {initialLoading ? (
        <div className="rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <Image src="/illustrations/not-found.png" alt="Tidak ada data" width={288} height={288} className="w-64 h-auto opacity-80" />
          <div>
            <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">Belum Ada Pelatihan</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">Buka kelas pelatihan baru untuk mulai melihat data di sini.</p>
          </div>
          {canCreate && (
            <Button onClick={() => setTabValue("create")} className="rounded-xl bg-[#0B1B3F] hover:bg-blue-700 gap-2">
              <PlusCircle className="w-4 h-4" /> Buat Pelatihan
            </Button>
          )}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-700 dark:text-slate-200">Tidak Ada Hasil</h3>
            <p className="text-sm text-slate-400 mt-1">Tidak ada pelatihan yang cocok dengan filter saat ini.</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetAll} className="rounded-xl text-xs">
            Hapus semua filter
          </Button>
        </div>
      ) : (
        <TableDataPelatihanMasyarakat
          data={rows}
          generateTanggalPelatihan={generateTanggalPelatihan}
          encryptValue={encryptValue}
        />
      )}
    </div>
  );

  if (!canCreate) {
    return <div className="pb-10 mt-10">{listContent}</div>;
  }
  const TABS = [
    { value: "list", label: "Daftar Pelatihan", sub: "Kelola & pantau kelas", icon: ListChecks, accent: "#3B82F6", count: stats.total },
    { value: "create", label: "Buat Pelatihan Baru", sub: "Buka kelas pelatihan", icon: PlusCircle, accent: "#10B981" },
  ] as const;

  return (
    <div className="pb-10 mt-10">
      <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as "list" | "create")} className="w-full">
        {/* Tab bar navy — tab aktif kaca (glassmorphism) + ikon besar di latar, sama dengan DashboardMainView */}
        <div className="relative isolate overflow-hidden mb-6 rounded-[1.75rem] bg-[#0B1B3F] ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.5)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_0%_0%,#2563EB_0%,transparent_60%),radial-gradient(40%_120%_at_100%_100%,#0EA5E9_0%,transparent_60%)] opacity-70" />
          <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

          <TabsList className="bg-transparent h-auto p-1.5 grid grid-cols-2 gap-1.5 w-full">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  style={{ ["--accent" as string]: t.accent }}
                  className="group relative isolate overflow-hidden justify-start rounded-[1.35rem] py-3 px-4 text-blue-100/70 font-bold ring-1 ring-transparent transition-all duration-300 outline-none
                    hover:text-white hover:bg-white/[0.06]
                    focus-visible:ring-2 focus-visible:ring-sky-300/60
                    data-[state=active]:text-white data-[state=active]:bg-white/[0.12] data-[state=active]:backdrop-blur-xl data-[state=active]:ring-white/25
                    data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_30px_-12px_var(--accent)]"
                >
                  {/* Glow aksen kanan → kiri */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-50 group-data-[state=active]:opacity-100"
                    style={{ background: `linear-gradient(to left, ${t.accent}59 0%, ${t.accent}1f 40%, transparent 80%)` }}
                  />
                  {/* Kilau kaca */}
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent opacity-0 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
                  {/* Ikon besar di latar */}
                  <Icon
                    aria-hidden
                    strokeWidth={1.5}
                    className="pointer-events-none absolute -right-3 -bottom-4 -z-10 w-16 h-16 -rotate-12 opacity-[0.08] transition-all duration-500 ease-out group-hover:opacity-20 group-hover:-rotate-6 group-data-[state=active]:opacity-35 group-data-[state=active]:scale-110 group-data-[state=active]:-rotate-6"
                    style={{ color: t.accent, filter: `drop-shadow(0 0 16px ${t.accent}80)` }}
                  />

                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-white/10 text-sky-100 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/15 group-data-[state=active]:text-white group-data-[state=active]:ring-white/30 group-data-[state=active]:[background:var(--accent)] group-data-[state=active]:shadow-[0_6px_16px_-4px_var(--accent)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm tracking-tight whitespace-nowrap flex items-center gap-1.5">
                        {t.label}
                        {"count" in t && !initialLoading && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/10 group-data-[state=active]:bg-white/20 tabular-nums">{fmt(t.count)}</span>
                        )}
                      </span>
                      <span className="hidden sm:block mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap text-blue-100/45 group-data-[state=active]:text-sky-100/80">
                        {t.sub}
                      </span>
                    </div>
                  </div>

                  {/* Garis aksen bawah */}
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

        <TabsContent value="list" className="mt-0">{listContent}</TabsContent>

        {/* FormPelatihan sudah punya panel sendiri → tanpa Card pembungkus */}
        <TabsContent value="create" className="mt-0 animate-in fade-in-50 duration-300">
          <FormPelatihan
            edit={false}
            onSuccess={() => {
              setTabValue("list");
              refetch();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TableDataPelatihan;

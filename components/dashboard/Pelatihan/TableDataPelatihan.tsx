import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import Image from "next/image";
import Cookies from "js-cookie";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan, getStatusInfo } from "@/utils/text";
import { Button } from "@/components/ui/button";
import { MdSearch } from "react-icons/md";

import { encryptValue } from "@/lib/utils";
import { HashLoader } from "react-spinners";
import { UPT } from "@/constants/nomenclatures";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import { useFetchDataProgramPelatihan } from "@/hooks/elaut/master/useFetchDataProgramPelatihan";
import TabStatusPelatihanMasyarakat from "./TabStatusPelatihanMasyarakat";
import TableDataPelatihanMasyarakat from "./Table/TableDataPelatihanMasyrakat";
import { isPendingSigning, isSigned, isVerifyDiklat } from "@/utils/status";
import FormPelatihan from "@/components/form/FormPelatihan";
import { Calendar, Users, Briefcase, GraduationCap, TrendingUp, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PelatihanMasyarakat } from "@/types/product";

// Urutan tampil di tabel berdasarkan label status (getStatusInfo).
// Index lebih kecil = tampil lebih dulu (atas).
// Ordered: Draft first (needs action) → Pending chain → Approved → Signed (done)
const STATUS_ORDER: string[] = [
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

// Quick-filter status pills shown inline above the table
const QUICK_STATUS_FILTERS = [
  { key: "All", label: "Semua", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { key: "Draft", label: "Draft", color: "bg-slate-50 text-slate-700 border-slate-200" },
  { key: "Pending SPV", label: "Pending SPV", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "Pending Verifikator", label: "Pending Verifikator", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "Pending Kapus", label: "Pending Kapus", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "Approved Kapus", label: "Approved Kapus", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "Signed", label: "Signed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const TableDataPelatihan: React.FC = () => {
  const {
    data,
    isFetching,
    setIsFetching,
    countDone,
    countDiklatSPV,
    countPublished,
    countVerifying,
    countPendingSigning,
    countSigned,
    refetch,
  } = useFetchDataPelatihanMasyarakat();

  const { data: programs } = useFetchDataProgramPelatihan();

  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>("All");

  // FILTERS
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = React.useState<string>("all");
  const [filterCategorySasaran, setFilterCategorySasaran] = React.useState<string>("all");
  const [filterYear, setFilterYear] = React.useState<string>(new Date().getFullYear().toString());

  // ROLE DETECTION
  const access = Cookies.get('Access') || '';
  const isSupervisor = access.includes('supervisePelaksanaan') && access.includes('superviseCertificate');

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const isPendingSigningForUser = (p: PelatihanMasyarakat) => {
    const status = String(p.StatusPenerbitan);
    if (!isPendingSigning(status)) return false;

    const role = Cookies.get('Role') || '';
    const access = Cookies.get('Access') || '';

    if (access.includes('approveKapus') && status === '10') return true;
    if (access.includes('approveKabadan') && status === '14') return true;
    if (access.includes('approveKabalai') && status === '1.4') return true;

    return (!!role.includes(p.TtdSertifikat) || role === p.TtdSertifikat);
  };

  const isSignedForUser = (p: PelatihanMasyarakat) => {
    const status = String(p.StatusPenerbitan);
    if (!isSigned(status)) return false;

    const role = Cookies.get('Role') || '';
    const access = Cookies.get('Access') || '';

    if (access.includes('approveKapus') && status === '11') return true;
    if (access.includes('approveKabadan') && status === '15') return true;
    if (access.includes('approveKabalai') && status === '1.6') return true;

    return (!!role.includes(p.TtdSertifikat) || role === p.TtdSertifikat);
  };


  const getYearFromDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
  };

  // Rank kelompok status berdasarkan STATUS_ORDER (label dari getStatusInfo).
  // Label di luar daftar didorong ke paling belakang.
  const getStatusRank = (p: PelatihanMasyarakat) => {
    const label = getStatusInfo(String(p.StatusPenerbitan)).label;
    const idx = STATUS_ORDER.indexOf(label);
    return idx === -1 ? STATUS_ORDER.length : idx;
  };

  const getDateValue = (dateStr: string | undefined | null) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Helper: label-based status matcher for pill filters
  const matchesStatusFilter = (p: PelatihanMasyarakat, filterKey: string): boolean => {
    if (filterKey === "All") return true;
    const label = getStatusInfo(String(p.StatusPenerbitan)).label;
    // Special case: "Draft" maps to status label "Draft" OR raw StatusPenerbitan of "0"/empty
    if (filterKey === "Draft") {
      return label === "Draft" || String(p.StatusPenerbitan) === "0" || !p.StatusPenerbitan;
    }
    return label === filterKey;
  };

  const filteredData = useMemo(() => {
    const filtered = data.filter(p => {
      const program = (p.Program || "").toLowerCase().trim();
      const namaPelatihan = (p.NamaPelatihan || "").toLowerCase().trim();
      const penyelenggara = (p.PenyelenggaraPelatihan || "").toLowerCase().trim();
      const sasaran = (p.AsalPelatihan || "").toLowerCase().trim();
      const pYear = getYearFromDate(p.TanggalMulaiPelatihan);
      const matchesYear = filterYear === "All" || pYear === filterYear;

      return (
        (filterCategory === "all" || program.includes(filterCategory.toLowerCase().trim())) &&
        (filterCategoryPenyelenggara === "all" || penyelenggara.includes(filterCategoryPenyelenggara.toLowerCase().trim())) &&
        (filterCategorySasaran === "all" || sasaran.includes(filterCategorySasaran.toLowerCase().trim())) &&
        namaPelatihan.includes(searchQuery.toLowerCase().trim()) &&
        matchesYear &&
        matchesStatusFilter(p, selectedStatusFilter)
      );
    });

    return filtered.sort((a, b) => {
      const rankDiff = getStatusRank(a) - getStatusRank(b);
      if (rankDiff !== 0) return rankDiff;
      return getDateValue(b.TanggalMulaiPelatihan) - getDateValue(a.TanggalMulaiPelatihan);
    });
  }, [data, filterCategory, filterCategoryPenyelenggara, filterCategorySasaran, searchQuery, selectedStatusFilter, filterYear]);

  const groupedPrograms = useMemo(() => {
    const akp = programs.filter(p =>
      p.name_indo.includes("ANKAPIN") ||
      p.name_indo.includes("ATKAPIN") ||
      p.name_indo.includes("BSTF") ||
      p.name_indo.includes("Rating") ||
      p.name_indo.includes("SKN") ||
      p.name_indo.includes("SKPI") ||
      p.name_indo.includes("SOPI") ||
      p.name_indo.includes("Fishing Master") ||
      p.abbrv_name?.includes("AKP")
    );

    const kelautan = programs.filter(p =>
      p.name_indo.includes("BCL") ||
      p.name_indo.includes("Sampah") ||
      p.name_indo.includes("Ruang Laut") ||
      p.name_indo.includes("Mitigasi") ||
      p.name_indo.includes("Konservasi")
    );

    const perikanan = programs.filter(p =>
      !akp.find(a => a.id_program_pelatihan === p.id_program_pelatihan) &&
      !kelautan.find(k => k.id_program_pelatihan === p.id_program_pelatihan)
    );

    return { akp, perikanan, kelautan };
  }, [programs]);

  // Year Options
  const yearOptions = useMemo(() => {
    const years = new Set(data.map(p => getYearFromDate(p.TanggalMulaiPelatihan)).filter(y => y && y.trim() !== ""));
    // Ensure current year is always available even if no data
    years.add(new Date().getFullYear().toString());
    return ["All", ...Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))];
  }, [data]);

  // Stats Logic
  const stats = useMemo(() => {
    const total = filteredData.length;
    const totalPeserta = filteredData.reduce((acc, curr) => acc + (curr.UserPelatihan?.length || 0), 0);

    // Distribution by Program
    const programDist = [
      { name: "Prodi AKP", value: filteredData.filter(p => p.Program?.includes("AKP")).length },
      { name: "Prodi Perikanan", value: filteredData.filter(p => p.Program?.includes("Perikanan")).length },
      { name: "Prodi Kelautan", value: filteredData.filter(p => p.Program?.includes("Kelautan")).length },
    ].filter(d => d.value > 0);

    // Trend by Month (for the filtered data)
    const monthCounts: Record<string, number> = {};
    filteredData.forEach(p => {
      if (p.TanggalMulaiPelatihan) {
        const d = new Date(p.TanggalMulaiPelatihan);
        if (!isNaN(d.getTime())) {
          const month = d.toLocaleString('id-ID', { month: 'short' });
          monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
      }
    });

    // Ensure chronological order if possible or just standard months
    const standardMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const trendData = standardMonths.map(m => ({
      name: m,
      value: monthCounts[m] || 0
    }));

    return { total, totalPeserta, programDist, trendData };
  }, [filteredData]);

  // Quick-filter pill counts — must use `data` (NOT filteredData) with all
  // non-status filters so sibling pill counts stay accurate while a pill is active.
  const quickFilterCounts = useMemo(() => {
    const base = data.filter(p => {
      const prog = (p.Program || "").toLowerCase();
      const nama = (p.NamaPelatihan || "").toLowerCase();
      const peny = (p.PenyelenggaraPelatihan || "").toLowerCase();
      const yr   = getYearFromDate(p.TanggalMulaiPelatihan);
      return (
        (filterCategory === "all" || prog.includes(filterCategory.toLowerCase())) &&
        (filterCategoryPenyelenggara === "all" || peny.includes(filterCategoryPenyelenggara.toLowerCase())) &&
        (filterCategorySasaran === "all" || (p.AsalPelatihan || "").toLowerCase().includes(filterCategorySasaran.toLowerCase())) &&
        (filterYear === "All" || yr === filterYear) &&
        nama.includes(searchQuery.toLowerCase())
      );
    });
    const counts: Record<string, number> = { All: base.length };
    QUICK_STATUS_FILTERS.slice(1).forEach(f => {
      counts[f.key] = base.filter(p => matchesStatusFilter(p, f.key)).length;
    });
    return counts;
  }, [data, filterCategory, filterCategoryPenyelenggara, filterCategorySasaran, filterYear, searchQuery]);

  const [tabValue, setTabValue] = React.useState<string>("account");

  return (
    <div className="space-y-2 pb-10 mt-10">

      {/* 2. Main Content (Filters + Table) */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl transition-all duration-500 hover:shadow-blue-500/10">
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest opacity-80">Statistik</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Aktif</span>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wider opacity-80">Total Pelatihan</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white tracking-tighter">{stats.total}</span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">Kelas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden shadow-sm border border-slate-200 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl transition-all duration-500 hover:shadow-emerald-500/10">
            <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Registrasi</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Terverifikasi</span>
                  </div>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider opacity-80">Total Peserta</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white tracking-tighter">{stats.totalPeserta}</span>
                  <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-tighter">Peserta</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional info cards made smaller and more subtle */}
          <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tren Bulanan</h4>
              <p className="text-[9px] font-bold text-blue-500 uppercase">+12% Bulan ini</p>
            </div>
          </Card>

          <Card className="group hidden lg:flex relative overflow-hidden shadow-sm border border-slate-100 bg-white rounded-2xl p-5 flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <GraduationCap className="h-6 w-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio Kelulusan</h4>
              <p className="text-[9px] font-bold text-amber-500 uppercase">Rerata 89.4%</p>
            </div>
          </Card>
        </div>

        <section className="w-full">
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            {
              Cookies.get('Access')?.includes('createPelatihan') &&
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1.5 h-fit rounded-2xl mb-8 border border-slate-200/50 backdrop-blur-sm">
                <TabsTrigger
                  value="account"
                  onClick={() => refetch()}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
                >
                  Daftar Pelatihan
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
                >
                  Buat Pelatihan Baru
                </TabsTrigger>
              </TabsList>
            }

            <TabsContent value="account">
              {isFetching ? (
                <div className="py-32 w-full flex flex-col items-center justify-center gap-4">
                  <HashLoader color="#338CF5" size={50} />
                  <p className="text-sm text-slate-400 font-medium animate-pulse">Memuat data pelatihan...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">

                  {/* ── Search + Filter Bar ─────────────────────────────── */}
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1 group">
                      <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                      <Input
                        type="text"
                        placeholder="Cari nama pelatihan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-11 w-full border-none bg-slate-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-semibold text-sm placeholder:font-normal"
                      />
                    </div>

                    <div className="flex gap-2 items-center">
                      <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="h-11 w-[130px] bg-slate-50 border-none rounded-2xl font-bold text-xs focus:ring-2 focus:ring-blue-500/20 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {yearOptions.map(y => (
                            <SelectItem key={y} value={y}>{y === "All" ? "Semua Tahun" : y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-11 px-5 gap-2 border-none bg-slate-50 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-all shrink-0">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            Filter
                            {(filterCategory !== "all" || filterCategoryPenyelenggara !== "all") && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72 p-4 space-y-4 rounded-2xl shadow-xl" align="end" onPointerDown={(e) => e.stopPropagation()}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Lanjutan</p>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">Program Pelatihan</label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                              <SelectTrigger className="h-9 text-xs w-full rounded-xl" onPointerDown={(e) => e.stopPropagation()}>
                                <SelectValue placeholder="Semua Program" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua Program</SelectItem>
                                {groupedPrograms.akp.length > 0 && (
                                  <SelectGroup>
                                    <SelectLabel>AKP</SelectLabel>
                                    {groupedPrograms.akp.filter(i => i.name_indo?.trim()).map(i => <SelectItem key={i.id_program_pelatihan} value={i.name_indo}>{i.name_indo}</SelectItem>)}
                                  </SelectGroup>
                                )}
                                {groupedPrograms.perikanan.length > 0 && (
                                  <SelectGroup>
                                    <SelectLabel>Perikanan</SelectLabel>
                                    {groupedPrograms.perikanan.filter(i => i.name_indo?.trim()).map(i => <SelectItem key={i.id_program_pelatihan} value={i.name_indo}>{i.name_indo}</SelectItem>)}
                                  </SelectGroup>
                                )}
                                {groupedPrograms.kelautan.length > 0 && (
                                  <SelectGroup>
                                    <SelectLabel>Kelautan</SelectLabel>
                                    {groupedPrograms.kelautan.filter(i => i.name_indo?.trim()).map(i => <SelectItem key={i.id_program_pelatihan} value={i.name_indo}>{i.name_indo}</SelectItem>)}
                                  </SelectGroup>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">Unit Penyelenggara</label>
                            <Select value={filterCategoryPenyelenggara} onValueChange={setFilterCategoryPenyelenggara}>
                              <SelectTrigger className="h-9 text-xs w-full rounded-xl" onPointerDown={(e) => e.stopPropagation()}>
                                <SelectValue placeholder="Semua UPT" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="all">Semua UPT</SelectItem>
                                {Array.from(new Set(UPT || [])).filter(Boolean).map((item: string, i) => (
                                  <SelectItem key={i} value={item}>{item}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {(filterCategory !== "all" || filterCategoryPenyelenggara !== "all") && (
                            <Button variant="outline" size="sm" className="w-full text-xs rounded-xl"
                              onClick={() => { setFilterCategory("all"); setFilterCategoryPenyelenggara("all"); setFilterCategorySasaran("all"); }}>
                              Reset Semua Filter
                            </Button>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* ── Quick Status Pills ───────────────────────────────── */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 pr-1">Status:</span>
                    {QUICK_STATUS_FILTERS.map(f => {
                      const count = quickFilterCounts[f.key] ?? 0;
                      const isActive = selectedStatusFilter === f.key;
                      return (
                        <button
                          key={f.key}
                          onClick={() => setSelectedStatusFilter(f.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${isActive
                            ? `${f.color} ring-2 ring-offset-1 ring-current shadow-sm scale-105`
                            : `${f.color} opacity-60 hover:opacity-100`
                            }`}
                        >
                          {f.label}
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-current/10" : "bg-white/60"
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                    {selectedStatusFilter !== "All" && (
                      <button
                        onClick={() => setSelectedStatusFilter("All")}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2 shrink-0 transition-colors"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>

                  {/* ── Result Info ─────────────────────────────────────── */}
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-slate-500">
                      Menampilkan <span className="font-bold text-slate-700">{filteredData.length}</span> dari <span className="font-bold">{filteredData.length}</span> pelatihan
                      {selectedStatusFilter !== "All" && <span className="text-blue-500 font-semibold"> · {selectedStatusFilter}</span>}
                    </p>
                    {(searchQuery || selectedStatusFilter !== "All" || filterCategory !== "all" || filterCategoryPenyelenggara !== "all") && (
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedStatusFilter("All"); setFilterCategory("all"); setFilterCategoryPenyelenggara("all"); }}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        Reset semua
                      </button>
                    )}
                  </div>

                  {/* ── Table / Empty State ─────────────────────────────── */}
                  {filteredData.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-center">
                      <Image src="/illustrations/not-found.png" alt="Tidak ada data" width={0} height={0} className="w-72 opacity-80" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-700">Belum Ada Pelatihan</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-xs">
                          Buka kelas pelatihan baru untuk mulai melihat data di sini.
                        </p>
                      </div>
                    </div>
                  ) : filteredData.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <MdSearch className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-700">Tidak Ada Hasil</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Tidak ada pelatihan yang cocok dengan filter saat ini.
                        </p>
                      </div>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedStatusFilter("All"); setFilterCategory("all"); setFilterCategoryPenyelenggara("all"); }}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 underline underline-offset-2"
                      >
                        Hapus semua filter
                      </button>
                    </div>
                  ) : (
                    <TableDataPelatihanMasyarakat
                      data={filteredData}
                      generateTanggalPelatihan={generateTanggalPelatihan}
                      encryptValue={encryptValue}
                    />
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="password">
              <Card className="border-slate-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <FormPelatihan
                    edit={false}
                    onSuccess={() => {
                      setTabValue("account");
                      refetch();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div >
  )
};

export default TableDataPelatihan;

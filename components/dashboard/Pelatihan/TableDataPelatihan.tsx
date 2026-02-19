import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import Image from "next/image";
import Cookies from "js-cookie";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan } from "@/utils/text";
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

  const statusMapping: Record<string, (p: PelatihanMasyarakat) => boolean> = {
    "Proses Pengajuan Sertifikat": p => String(p.StatusPenerbitan) === "On Progress",
    "Pending SPV": p => String(p.StatusPenerbitan) === "1",
    "Verifikasi Pelaksanaan": p => isVerifyDiklat(String(p.StatusPenerbitan)),
    "Pending Signing": p => isPendingSigning(String(p.StatusPenerbitan)) && (!!Cookies.get('Role')?.includes(p.TtdSertifikat) || Cookies.get('Role') === p.TtdSertifikat),
    "Done": p => isSigned(String(p.StatusPenerbitan)),
    "Signed": p => isSigned(String(p.StatusPenerbitan)) && (!!Cookies.get('Role')?.includes(p.TtdSertifikat) || Cookies.get('Role') === p.TtdSertifikat),
    "Published": p => p.Status === "Publish",
    "Approved": p => String(p.StatusPenerbitan) === "1.1",
  };

  const getYearFromDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "" : date.getFullYear().toString();
  };

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const program = (p.Program || "").toLowerCase().trim();
      const namaPelatihan = (p.NamaPelatihan || "").toLowerCase().trim();
      const penyelenggara = (p.PenyelenggaraPelatihan || "").toLowerCase().trim();
      const sasaran = (p.AsalPelatihan || "").toLowerCase().trim();
      const pYear = getYearFromDate(p.TanggalMulaiPelatihan);

      const matchesYear = filterYear === "All" || pYear === filterYear;

      return (
        (!filterCategory || filterCategory === "all" || program.includes(filterCategory.toLowerCase().trim())) &&
        (!filterCategoryPenyelenggara || filterCategoryPenyelenggara === "all" || penyelenggara.includes(filterCategoryPenyelenggara.toLowerCase().trim())) &&
        (!filterCategorySasaran || filterCategorySasaran === "all" || sasaran.includes(filterCategorySasaran.toLowerCase().trim())) &&
        namaPelatihan.includes(searchQuery.toLowerCase().trim()) &&
        matchesYear &&
        (
          selectedStatusFilter === "All" ||
          statusMapping[selectedStatusFilter]?.(p) ||
          p.Status === selectedStatusFilter
        )
      );
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

  // Reactive Status Counts based on filtered total (except status itself)
  const tabCounts = useMemo(() => {
    const baseFiltered = data.filter(p => {
      const program = (p.Program || "").toLowerCase().trim();
      const namaPelatihan = (p.NamaPelatihan || "").toLowerCase().trim();
      const penyelenggara = (p.PenyelenggaraPelatihan || "").toLowerCase().trim();
      const sasaran = (p.AsalPelatihan || "").toLowerCase().trim();
      const pYear = getYearFromDate(p.TanggalMulaiPelatihan);
      const matchesYear = filterYear === "All" || pYear === filterYear;

      return (
        (!filterCategory || program.includes(filterCategory.toLowerCase().trim())) &&
        (!filterCategoryPenyelenggara || penyelenggara.includes(filterCategoryPenyelenggara.toLowerCase().trim())) &&
        (!filterCategorySasaran || sasaran.includes(filterCategorySasaran.toLowerCase().trim())) &&
        namaPelatihan.includes(searchQuery.toLowerCase().trim()) &&
        matchesYear
      );
    });

    return {
      all: baseFiltered.length,
      published: baseFiltered.filter(p => p.Status === "Publish").length,
      verifying: baseFiltered.filter(p => isVerifyDiklat(String(p.StatusPenerbitan))).length,
      done: baseFiltered.filter(p => isSigned(String(p.StatusPenerbitan))).length,
      diklatSPV: baseFiltered.filter(p => String(p.StatusPenerbitan) === "1").length,
      pendingSigning: baseFiltered.filter(p =>
        isPendingSigning(String(p.StatusPenerbitan)) &&
        (!!Cookies.get('Role')?.includes(p.TtdSertifikat) || Cookies.get('Role') === p.TtdSertifikat)
      ).length,
      signed: baseFiltered.filter(p =>
        isSigned(String(p.StatusPenerbitan)) &&
        (!!Cookies.get('Role')?.includes(p.TtdSertifikat) || Cookies.get('Role') === p.TtdSertifikat)
      ).length,
      approved: baseFiltered.filter(p => String(p.StatusPenerbitan) === "1.1").length,
    };
  }, [data, filterCategory, filterCategoryPenyelenggara, filterCategorySasaran, searchQuery, filterYear]);

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

        <TabStatusPelatihanMasyarakat
          dataLength={tabCounts.all}
          countPublished={tabCounts.published}
          countVerifying={tabCounts.verifying}
          countDone={tabCounts.done}
          countDiklatSPV={tabCounts.diklatSPV}
          countPendingSigning={tabCounts.pendingSigning}
          countSigned={tabCounts.signed}
          countApproved={tabCounts.approved}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          activeYear={filterYear}
          isSupervisor={isSupervisor}
        />



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
              {
                isFetching ?
                  <div className="py-32 w-full items-center flex justify-center">
                    <HashLoader color="#338CF5" size={50} />
                  </div> :
                  <div className="flex flex-col gap-6">
                    {/* Compact Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-3xl border border-slate-200 shadow-sm">
                      {/* Search */}
                      <div className="relative flex-1 w-full group">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 transition-colors group-focus-within:text-blue-500" />
                        <Input
                          type="text"
                          placeholder="Cari nama pelatihan..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 h-12 w-full border-none bg-slate-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-bold text-sm"
                        />
                      </div>

                      <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {/* Year Filter */}
                        <Select value={filterYear} onValueChange={setFilterYear}>
                          <SelectTrigger className="w-[140px] h-12 bg-slate-50 border-none rounded-2xl font-bold text-xs ring-offset-0 focus:ring-2 focus:ring-blue-500/20 transition-all">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200">
                            {yearOptions.map(y => (
                              <SelectItem key={y} value={y} className="rounded-xl">{y === 'All' ? 'Semua Tahun' : y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* More Filters Dropdown (To save space) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 px-6 gap-3 border-none bg-slate-50 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-all">
                              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                              Filter
                              {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72 p-4 space-y-4" align="end" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">Program</label>
                              <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="h-8 text-xs w-full" onPointerDown={(e) => e.stopPropagation()}><SelectValue placeholder="Semua Program" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Semua Program</SelectItem>
                                  {groupedPrograms.akp.length > 0 && (
                                    <SelectGroup>
                                      <SelectLabel>AKP</SelectLabel>
                                      {groupedPrograms.akp.filter(item => item.name_indo && item.name_indo.trim() !== "").map((item) => <SelectItem key={item.id_program_pelatihan} value={item.name_indo}>{item.name_indo}</SelectItem>)}
                                    </SelectGroup>
                                  )}
                                  {groupedPrograms.perikanan.length > 0 && (
                                    <SelectGroup>
                                      <SelectLabel>Perikanan</SelectLabel>
                                      {groupedPrograms.perikanan.filter(item => item.name_indo && item.name_indo.trim() !== "").map((item) => <SelectItem key={item.id_program_pelatihan} value={item.name_indo}>{item.name_indo}</SelectItem>)}
                                    </SelectGroup>
                                  )}
                                  {groupedPrograms.kelautan.length > 0 && (
                                    <SelectGroup>
                                      <SelectLabel>Kelautan</SelectLabel>
                                      {groupedPrograms.kelautan.filter(item => item.name_indo && item.name_indo.trim() !== "").map((item) => <SelectItem key={item.id_program_pelatihan} value={item.name_indo}>{item.name_indo}</SelectItem>)}
                                    </SelectGroup>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">Penyelenggara</label>
                              <Select value={filterCategoryPenyelenggara} onValueChange={setFilterCategoryPenyelenggara}>
                                <SelectTrigger className="h-8 text-xs w-full" onPointerDown={(e) => e.stopPropagation()}><SelectValue placeholder="Semua Penyelenggara" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Semua Penyelenggara</SelectItem>
                                  {Array.from(new Set(UPT || [])).filter(item => item && item.trim() !== "").map((item: string, index: number) => (
                                    <SelectItem key={index} value={item}>{item}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(filterCategory !== "all" || filterCategoryPenyelenggara !== "all" || filterCategorySasaran !== "all") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  setFilterCategory("all");
                                  setFilterCategoryPenyelenggara("all");
                                  setFilterCategorySasaran("all");
                                }}
                              >
                                Reset Filters
                              </Button>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {data.length == 0 ? (
                      <div className="pt-12 md:pt-20 flex flex-col items-center">
                        <Image
                          src={"/illustrations/not-found.png"}
                          alt="Not Found"
                          width={0}
                          height={0}
                          className="w-[400px]"
                        />
                        <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
                          <h1 className="text-3xl font-calsans leading-[110%] text-black">
                            Belum Ada Pelatihan
                          </h1>
                          <div className="text-gray-600 text-sm text-center  max-w-md">
                            Buka kelas pelatihan segera untuk dapat melihat berbagai
                            macam pelatihan berdasarkan programnya!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <TableDataPelatihanMasyarakat
                        data={filteredData}
                        generateTanggalPelatihan={generateTanggalPelatihan}
                        encryptValue={encryptValue}
                      />
                    )}
                  </div>
              }

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

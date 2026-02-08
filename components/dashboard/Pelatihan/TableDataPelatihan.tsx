import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import Image from "next/image";
import Cookies from "js-cookie";

import { Input } from "@/components/ui/input";
import { generateTanggalPelatihan } from "@/utils/text";
import { Button } from "@/components/ui/button";
import {
  PROGRAM_AKP,
  PROGRAM_KELAUTAN,
  PROGRAM_PERIKANAN,
} from "@/constants/pelatihan";
import { MdBusiness, MdClear, MdPeople, MdSchool, MdSearch } from "react-icons/md";

import { encryptValue } from "@/lib/utils";
import { HashLoader } from "react-spinners";
import { UPT } from "@/constants/nomenclatures";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFetchDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
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
  const isOperatorBalaiPelatihan = Cookies.get('Eselon') !== 'Operator Pusat'

  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>("All");

  // FILTERS
  const [filterCategory, setFilterCategory] = React.useState<string>("");
  const [filterCategoryPenyelenggara, setFilterCategoryPenyelenggara] = React.useState<string>("");
  const [filterCategorySasaran, setFilterCategorySasaran] = React.useState<string>("");
  const [filterYear, setFilterYear] = React.useState<string>(new Date().getFullYear().toString());

  // SEARCHING
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const statusMapping: Record<string, (p: typeof data[number]) => boolean> = {
    "Proses Pengajuan Sertifikat": p => p.StatusPenerbitan === "On Progress",
    "Pending SPV": p => p.StatusPenerbitan === "1",
    "Verifikasi Pelaksanaan": p => isVerifyDiklat(p.StatusPenerbitan),
    "Pending Signing": p => isPendingSigning(p.StatusPenerbitan) && (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat),
    "Done": p => isSigned(p.StatusPenerbitan),
    "Signed": p => isSigned(p.StatusPenerbitan) && (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat),
    "Published": p => p.Status === "Publish",
    "Approved": p => p.StatusPenerbitan === "1.1",
  };

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const program = p.Program.toLowerCase();
      const namaPelatihan = p.NamaPelatihan.toLowerCase();
      const penyelenggara = p.PenyelenggaraPelatihan.toLowerCase();
      const sasaran = p.AsalPelatihan.toLowerCase();
      const pYear = p.TanggalMulaiPelatihan ? new Date(p.TanggalMulaiPelatihan).getFullYear().toString() : "";

      const matchesYear = filterYear === "All" || pYear === filterYear;

      return (
        (!filterCategory || program === filterCategory.toLowerCase()) &&
        (!filterCategoryPenyelenggara || penyelenggara === filterCategoryPenyelenggara.toLowerCase()) &&
        (!filterCategorySasaran || sasaran === filterCategorySasaran.toLowerCase()) &&
        namaPelatihan.includes(searchQuery.toLowerCase()) &&
        matchesYear &&
        (
          selectedStatusFilter === "All" ||
          statusMapping[selectedStatusFilter]?.(p) ||
          p.Status === selectedStatusFilter
        )
      );
    });
  }, [data, filterCategory, filterCategoryPenyelenggara, filterCategorySasaran, searchQuery, selectedStatusFilter, filterYear]);



  // Year Options
  const yearOptions = useMemo(() => {
    const years = new Set(data.map(p => p.TanggalMulaiPelatihan ? new Date(p.TanggalMulaiPelatihan).getFullYear().toString() : "").filter(Boolean));
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
      { name: "Prodi AKP", value: filteredData.filter(p => p.Program.includes("AKP")).length },
      { name: "Prodi Perikanan", value: filteredData.filter(p => p.Program.includes("Perikanan")).length },
      { name: "Prodi Kelautan", value: filteredData.filter(p => p.Program.includes("Kelautan")).length },
    ].filter(d => d.value > 0);

    // Trend by Month (for the filtered data)
    const monthCounts: Record<string, number> = {};
    filteredData.forEach(p => {
      if (p.TanggalMulaiPelatihan) {
        const month = new Date(p.TanggalMulaiPelatihan).toLocaleString('id-ID', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
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
      const program = p.Program.toLowerCase();
      const namaPelatihan = p.NamaPelatihan.toLowerCase();
      const penyelenggara = p.PenyelenggaraPelatihan.toLowerCase();
      const sasaran = p.AsalPelatihan.toLowerCase();
      const pYear = p.TanggalMulaiPelatihan ? new Date(p.TanggalMulaiPelatihan).getFullYear().toString() : "";
      const matchesYear = filterYear === "All" || pYear === filterYear;

      return (
        (!filterCategory || program === filterCategory.toLowerCase()) &&
        (!filterCategoryPenyelenggara || penyelenggara === filterCategoryPenyelenggara.toLowerCase()) &&
        (!filterCategorySasaran || sasaran === filterCategorySasaran.toLowerCase()) &&
        namaPelatihan.includes(searchQuery.toLowerCase()) &&
        matchesYear
      );
    });

    return {
      all: baseFiltered.length,
      published: baseFiltered.filter(p => p.Status === "Publish").length,
      verifying: baseFiltered.filter(p => isVerifyDiklat(p.StatusPenerbitan)).length,
      done: baseFiltered.filter(p => isSigned(p.StatusPenerbitan)).length,
      diklatSPV: baseFiltered.filter(p => p.StatusPenerbitan === "1").length,
      pendingSigning: baseFiltered.filter(p =>
        isPendingSigning(p.StatusPenerbitan) &&
        (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat)
      ).length,
      signed: baseFiltered.filter(p =>
        isSigned(p.StatusPenerbitan) &&
        (Cookies.get('Role')?.includes(p.TtdSertifikat)! || Cookies.get('Role') == p.TtdSertifikat)
      ).length,
      approved: baseFiltered.filter(p => p.StatusPenerbitan === "1.1").length,
    };
  }, [data, filterCategory, filterCategoryPenyelenggara, filterCategorySasaran, searchQuery, filterYear]);

  const [tabValue, setTabValue] = React.useState<string>("account");

  return (
    <div className="space-y-2 pb-10">

      {/* 2. Main Content (Filters + Table) */}
      <div className="space-y-2">
        <div className="flex flex-row w-full gap-4">
          <Card className="shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden w-full">
            <div className="p-5 flex items-center justify-between bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Pelatihan</p>
                <span className="text-3xl font-extrabold text-slate-800">{stats.total}</span>
                <p className="text-xs text-slate-400">Kelas dibuka</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="shadow-sm border border-slate-200 bg-white rounded-xl overflow-hidden w-full current-year-highlight">
            <div className="p-5 flex items-center justify-between bg-gradient-to-br from-emerald-50 to-white">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Peserta</p>
                <span className="text-3xl font-extrabold text-slate-800">{stats.totalPeserta}</span>
                <p className="text-xs text-slate-400">Orang terdaftar</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
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
        />



        <section className="w-full">
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            {
              Cookies.get('Access')?.includes('createPelatihan') &&
              <TabsList className={`grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl mb-3`}>
                <TabsTrigger
                  value="account"
                  onClick={() => refetch()}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  Daftar Pelatihan
                </TabsTrigger>
                <TabsTrigger value="password" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all">Buat Pelatihan Baru</TabsTrigger>
              </TabsList>
            }

            <TabsContent value="account">
              {
                isFetching ?
                  <div className="py-32 w-full items-center flex justify-center">
                    <HashLoader color="#338CF5" size={50} />
                  </div> :
                  <div className="flex flex-col gap-4">
                    {/* Compact Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      {/* Search */}
                      <div className="relative flex-1 w-full">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Cari nama pelatihan..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {/* Year Filter */}
                        <Select value={filterYear} onValueChange={setFilterYear}>
                          <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map(y => (
                              <SelectItem key={y} value={y}>{y === 'All' ? 'Semua Tahun' : y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* More Filters Dropdown (To save space) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 border-slate-200 bg-slate-50">
                              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                              Filters
                              {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72 p-4 space-y-4" align="end">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">Program</label>
                              <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Semua Program" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Semua Program</SelectItem>
                                  <SelectGroup>
                                    <SelectLabel>AKP</SelectLabel>
                                    {PROGRAM_AKP.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Perikanan</SelectLabel>
                                    {PROGRAM_PERIKANAN.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                  </SelectGroup>
                                  <SelectGroup>
                                    <SelectLabel>Kelautan</SelectLabel>
                                    {PROGRAM_KELAUTAN.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">Sasaran</label>
                              <Select value={filterCategorySasaran} onValueChange={setFilterCategorySasaran}>
                                <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Semua Sasaran" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Semua Sasaran</SelectItem>
                                  <SelectItem value="Masyarakat Umum">Masyarakat Umum</SelectItem>
                                  <SelectItem value="Peserta Didik Sekolah Usaha Perikanan Menengah">Peserta Didik SUPM</SelectItem>
                                  <SelectItem value="Peserta Didik Politeknik Kelautan dan Perikanan">Peserta Didik Politeknik</SelectItem>
                                  <SelectItem value="Karyawan/Pegawai/Mining Agent">Karyawan/Pegawai</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-slate-500">Penyelenggara</label>
                              <Select value={filterCategoryPenyelenggara} onValueChange={setFilterCategoryPenyelenggara}>
                                <SelectTrigger className="h-8 text-xs w-full"><SelectValue placeholder="Semua Penyelenggara" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Semua Penyelenggara</SelectItem>
                                  {UPT.map((item: string, index: number) => (
                                    <SelectItem key={index} value={item}>{item}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(filterCategory || filterCategoryPenyelenggara || filterCategorySasaran) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={() => {
                                  setFilterCategory("");
                                  setFilterCategoryPenyelenggara("");
                                  setFilterCategorySasaran("");
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

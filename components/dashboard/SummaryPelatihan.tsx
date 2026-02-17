"use client";
import React from "react";
import { HashLoader } from "react-spinners";
import Image from "next/image";
import ChartMasyarakatDilatihMonthly from "@/commons/charts/ChartMasyarakatDilatihMonthly";
import ChartDetailMasyarakatDilatih from "@/commons/charts/ChartDetailMasyarakatDilatih";
import useFetchDataDukung from "@/hooks/elaut/useFetchDataDukung";
import { useFetchAllDataPelatihanMasyarakat } from "@/hooks/elaut/pelatihan/useFetchDataPelatihanMasyarakat";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiFilter } from "react-icons/fi";
import { parseIndonesianDate, tahunList } from "@/utils/time";
import { Wallet, Users, BookOpen, TrendingUp } from "lucide-react";
import { formatToRupiah, formatToShorthandRupiah } from "@/lib/utils";
import MetricsSummaryPelatihan from "./MetricsSummaryPelatihan";
import { StatsMetricStatus } from "./Summary/StatsMetricStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SummaryPelatihan: React.FC = () => {
  const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()
  const { data, isFetching, refetch: refechDataPelatihan } = useFetchAllDataPelatihanMasyarakat()

  const [tahun, setTahun] = React.useState(() => dayjs().year());
  const [triwulan, setTriwulan] = React.useState("TW I");

  // Automatically set triwulan to latest when year changes
  React.useEffect(() => {
    const currentYear = dayjs().year();
    if (tahun < currentYear) {
      setTahun(tahun);
      setTriwulan("TW IV");
    } else {
      const month = dayjs().month() + 1;
      if (month <= 3) setTriwulan("TW I");
      else if (month <= 6) setTriwulan("TW II");
      else if (month <= 9) setTriwulan("TW III");
      else setTriwulan("TW IV");
    }
  }, [tahun]);

  // ================== GLOBAL FILTERING ==================
  const getQuarter = (month: number) => {
    if (month <= 3) return "TW I";
    if (month <= 6) return "TW II";
    if (month <= 9) return "TW III";
    return "TW IV";
  };

  const filteredDataPelatihan = React.useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const dateStr = item.TanggalMulaiPelatihan;
      if (!dateStr) return false;

      let itemTahun;
      let itemMonth;
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          itemTahun = parseInt(parts[0]);
          itemMonth = parseInt(parts[1]);
        } else {
          itemTahun = parseInt(parts[2]);
          itemMonth = parseInt(parts[1]);
        }
      } else {
        const d = parseIndonesianDate(dateStr);
        itemTahun = d?.getFullYear();
        itemMonth = (d?.getMonth() || 0) + 1;
      }

      const matchYear = itemTahun === tahun;

      const quarters = ["TW I", "TW II", "TW III", "TW IV"];
      const selectedIdx = quarters.indexOf(triwulan);
      const itemIdx = quarters.indexOf(getQuarter(itemMonth || 0));
      const matchQuarter = !triwulan || itemIdx <= selectedIdx;

      // Filter by having at least one signed participant
      const hasSigned = item.UserPelatihan?.some(u => u.FileSertifikat?.includes("signed"));

      return matchYear && matchQuarter && hasSigned;
    });
  }, [data, tahun, triwulan]);

  const filteredDataDukung = React.useMemo(() => {
    if (!dataDukung) return [];
    return dataDukung.filter((item) => {
      const dateStr = item.TanggalMulai;
      if (!dateStr) return false;

      let itemTahun;
      let itemMonth;
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
          itemTahun = parseInt(parts[0]);
          itemMonth = parseInt(parts[1]);
        } else {
          itemTahun = parseInt(parts[2]);
          itemMonth = parseInt(parts[1]);
        }
      } else {
        const d = parseIndonesianDate(dateStr);
        itemTahun = d?.getFullYear();
        itemMonth = (d?.getMonth() || 0) + 1;
      }

      const matchYear = itemTahun === tahun;

      const quarters = ["TW I", "TW II", "TW III", "TW IV"];
      const selectedIdx = quarters.indexOf(triwulan);
      const itemIdx = quarters.indexOf(getQuarter(itemMonth || 0));
      const matchQuarter = !triwulan || itemIdx <= selectedIdx;

      // Filter by signed certificate
      const isSigned = item.FileSertifikat?.includes("signed");
      const isPenyelenggara = !item.PenyelenggaraPelatihan?.includes("Pusat Pelatihan Kelautan dan Perikanan");

      return matchYear && matchQuarter && isSigned && isPenyelenggara;
    });
  }, [dataDukung, tahun, triwulan]);

  // Calculate key analytics
  const analytics = React.useMemo(() => {
    if (!filteredDataPelatihan || !filteredDataDukung) return null;

    const totalPelatihan = filteredDataPelatihan.length;
    const totalPeserta = filteredDataDukung.length;

    // Calculate average participants per training
    const avgPeserta = totalPelatihan > 0 ? Math.round(totalPeserta / totalPelatihan) : 0;

    // Calculate completion rate
    const completedTrainings = filteredDataPelatihan.filter(item => {
      const status = parseInt(item?.StatusPenerbitan);
      return status >= 5;
    }).length;
    const completionRate = totalPelatihan > 0 ? Math.round((completedTrainings / totalPelatihan) * 100) : 0;

    // Flatten participants from filtered trainings for consistent metrics
    const participantsFromFilteredTrainings = filteredDataDukung;

    // Calculate gender distribution
    const maleCount = participantsFromFilteredTrainings.filter(item => ["L", "Laki - Laki"].includes(item.JenisKelamin)).length;
    const femaleCount = participantsFromFilteredTrainings.filter(item => ["P", "Perempuan"].includes(item.JenisKelamin)).length;
    const malePercentage = totalPeserta > 0 ? Math.round((maleCount / totalPeserta) * 100) : 0;
    const femalePercentage = totalPeserta > 0 ? Math.round((femaleCount / totalPeserta) * 100) : 0;

    // Calculate certification rate (Now 100% since we filter by signed)
    const certifiedCount = totalPeserta;
    const certificationRate = 100;

    // Calculate monthly trend and growth
    const monthlyData: { [key: string]: number } = {};
    filteredDataDukung.forEach(item => {
      if (item.TanggalMulai) {
        const date = new Date(item.TanggalMulai);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        }
      }
    });

    const months = Object.keys(monthlyData).sort();
    const lastMonth = months.length > 0 ? monthlyData[months[months.length - 1]] : 0;
    const prevMonth = months.length > 1 ? monthlyData[months[months.length - 2]] : 0;
    const growthRate = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;
    const isPositiveGrowth = growthRate >= 0;

    // Calculate training efficiency (avg participants per day)
    const totalDays = filteredDataPelatihan.reduce((sum, item) => {
      if (item.TanggalMulaiPelatihan && item.TanggalBerakhirPelatihan) {
        const start = new Date(item.TanggalMulaiPelatihan);
        const end = new Date(item.TanggalBerakhirPelatihan);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (days > 0 ? days : 0);
      }
      return sum;
    }, 0);
    const avgParticipantsPerDay = totalDays > 0 ? Math.round(totalPeserta / totalDays) : 0;

    // Calculate performance score (weighted average)
    const performanceScore = Math.round(
      (completionRate * 0.4) +
      (certificationRate * 0.4) +
      ((totalPeserta / Math.max(totalPelatihan, 1)) / 50 * 100 * 0.2)
    );

    // Calculate total PNPB (HargaPelatihan * Signed Participants)
    const totalPNPB = filteredDataPelatihan.reduce((sum, item) => {
      const price = Number(item.HargaPelatihan || 0);
      const signedParticipants = item.UserPelatihan?.filter(u => u.FileSertifikat?.includes("signed")).length || 0;
      return sum + (price * signedParticipants);
    }, 0);

    return {
      totalPelatihan,
      totalPeserta,
      avgPeserta,
      completionRate,
      maleCount,
      femaleCount,
      malePercentage,
      femalePercentage,
      certifiedCount,
      certificationRate,
      growthRate,
      isPositiveGrowth,
      avgParticipantsPerDay,
      performanceScore,
      totalDays,
      totalPNPB
    };
  }, [filteredDataPelatihan, filteredDataDukung]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {isFetching || isFetchingDataDukung ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <HashLoader color="#3b82f6" size={50} />
            <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat data dashboard...</p>
          </div>
        </div>
      ) : data != null ? (
        <div className="flex flex-col gap-8 max-w-[1920px] mx-auto">
          {/* Dashboard Header with Global Year Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Ringkasan Capaian</h2>
              <p className="text-sm font-medium text-slate-500">Periode Pelaksanaan {tahun}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FiFilter className="text-blue-600" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tahun Anggaran</span>
              </div>
              <Select value={tahun.toString()} onValueChange={(val) => setTahun(parseInt(val))}>
                <SelectTrigger className="w-[120px] h-12 rounded-2xl border-slate-200 bg-white shadow-sm text-sm font-bold hover:bg-slate-50 transition-all focus:ring-2 focus:ring-blue-100 dark:bg-slate-950 dark:border-slate-800">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {tahunList.sort((a, b) => b - a).map((t) => (
                    <SelectItem key={t} value={t.toString()} className="font-bold cursor-pointer text-xs py-3">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={triwulan} onValueChange={setTriwulan}>
                <SelectTrigger className="w-[120px] h-12 rounded-2xl border-slate-200 bg-white shadow-sm text-sm font-bold hover:bg-slate-50 transition-all focus:ring-2 focus:ring-blue-100 dark:bg-slate-950 dark:border-slate-800">
                  <SelectValue placeholder="Triwulan" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="TW I" className="font-bold cursor-pointer text-xs py-3">TW I</SelectItem>
                  <SelectItem value="TW II" className="font-bold cursor-pointer text-xs py-3">TW II</SelectItem>
                  <SelectItem value="TW III" className="font-bold cursor-pointer text-xs py-3">TW III</SelectItem>
                  <SelectItem value="TW IV" className="font-bold cursor-pointer text-xs py-3">TW IV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Total Pelatihan</p>
                    <h4 className="text-3xl font-black tracking-tighter">{analytics?.totalPelatihan}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-100/60 uppercase tracking-tighter">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Capaian kumulatif pelatihan</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-violet-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-purple-100 text-xs font-bold uppercase tracking-widest opacity-80">Total Peserta</p>
                    <h4 className="text-3xl font-black tracking-tighter">{analytics?.totalPeserta}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-100/60 uppercase tracking-tighter">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Masyarakat telah dilatih</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-200 dark:shadow-none group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest opacity-80">Total PNPB</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h4 className="text-2xl md:text-3xl font-black tracking-tighter cursor-help">
                            {formatToShorthandRupiah(analytics?.totalPNPB || 0)}
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white/90 backdrop-blur-md border-emerald-100 text-emerald-900 px-4 py-2 rounded-xl font-bold shadow-xl">
                          {formatToRupiah(analytics?.totalPNPB || 0)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-100/60 uppercase tracking-tighter">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Realisasi Penerimaan Negara</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Power BI Layout */}
          {/* Top Section: Monthly Trend & Status Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {/* Left Panel - Monthly Trend (Takes 2/3 width on large screens) */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl ring-1 ring-blue-100 dark:ring-blue-500/20">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Trend Pelatihan</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Statistik bulanan masyarakat dilatih</p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1">
                <ChartMasyarakatDilatihMonthly data={filteredDataPelatihan} dataUser={filteredDataDukung} tahun={tahun.toString()} triwulan={triwulan} />
              </div>
            </div>

            {/* Right Panel - Metrics Summary (Takes 1/3 width) */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              <MetricsSummaryPelatihan data={filteredDataPelatihan} tahun={tahun.toString()} />
            </div>
          </div>

          {/* Stats Section - Full Width */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl ring-1 ring-emerald-100 dark:ring-emerald-500/20">
                  <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Statistik Status</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Distribusi status penyelenggaraan pelatihan</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <StatsMetricStatus data={filteredDataPelatihan} tahun={tahun.toString()} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl ring-1 ring-indigo-100 dark:ring-indigo-500/20">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Detail Realisasi</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rincian data pelatihan per triwulan</p>
                </div>
              </div>
            </div>
            <div className="p-0">
              <ChartDetailMasyarakatDilatih data={filteredDataPelatihan} dataUser={filteredDataDukung} tahun={tahun.toString()} triwulan={triwulan} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative max-w-7xl w-full mx-auto mt-20 p-6">
          <div className="pt-7 md:pt-0 flex flex-col items-center bg-white rounded-3xl shadow-xl border border-slate-200 p-12">
            <Image
              src={"/illustrations/not-found.png"}
              alt="Not Found"
              width={0}
              height={0}
              className="w-[350px] md:w-[400px]"
            />
            <div className="max-w-3xl mx-auto text-center pb-5 md:pb-8 -mt-2">
              <h1 className="text-2xl md:text-3xl font-bold leading-[110%] bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Belum Ada Pelatihan
              </h1>
              <div className="text-slate-600 text-center leading-[125%] max-w-md mt-3">
                Capaian ataupun summary dari pelaksanaan pelatihan belum dapat
                dilihat, karena Balai Pelatihan belum memiliki penyelenggaraan
                pelatihan!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPelatihan;

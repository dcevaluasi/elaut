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
import { tahunList } from "@/utils/time";
import MetricsSummaryPelatihan from "./MetricsSummaryPelatihan";
import { StatsMetricStatus } from "./Summary/StatsMetricStatus";

const SummaryPelatihan: React.FC = () => {
  const { data: dataDukung, isFetching: isFetchingDataDukung, refetch } = useFetchDataDukung()
  const { data, isFetching, refetch: refechDataPelatihan } = useFetchAllDataPelatihanMasyarakat()

  const [tahun, setTahun] = React.useState(() => dayjs().year());
  const [triwulan, setTriwulan] = React.useState(() => {
    const month = dayjs().month() + 1;
    if (month <= 3) return "TW I";
    if (month <= 6) return "TW II";
    if (month <= 9) return "TW III";
    return "TW IV";
  });

  // Calculate key analytics
  const analytics = React.useMemo(() => {
    if (!data || !dataDukung) return null;

    const totalPelatihan = data.length;
    const totalPeserta = dataDukung.length;

    // Calculate average participants per training
    const avgPeserta = totalPelatihan > 0 ? Math.round(totalPeserta / totalPelatihan) : 0;

    // Calculate completion rate
    const completedTrainings = data.filter(item => {
      const status = parseInt(item?.StatusPenerbitan);
      return status >= 5;
    }).length;
    const completionRate = totalPelatihan > 0 ? Math.round((completedTrainings / totalPelatihan) * 100) : 0;

    // Calculate gender distribution
    const maleCount = dataDukung.filter(item => ["L", "Laki - Laki"].includes(item.JenisKelamin)).length;
    const femaleCount = dataDukung.filter(item => ["P", "Perempuan"].includes(item.JenisKelamin)).length;
    const malePercentage = totalPeserta > 0 ? Math.round((maleCount / totalPeserta) * 100) : 0;
    const femalePercentage = totalPeserta > 0 ? Math.round((femaleCount / totalPeserta) * 100) : 0;

    // Calculate certification rate
    const certifiedCount = dataDukung.filter(item => item.FileSertifikat?.includes("signed")).length;
    const certificationRate = totalPeserta > 0 ? Math.round((certifiedCount / totalPeserta) * 100) : 0;

    // Calculate monthly trend and growth
    const monthlyData: { [key: string]: number } = {};
    dataDukung.forEach(item => {
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
    const totalDays = data.reduce((sum, item) => {
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
      totalDays
    };
  }, [data, dataDukung]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 dark:bg-slate-950/50 -m-6 p-6">
      {isFetching || isFetchingDataDukung ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <HashLoader color="#3b82f6" size={50} />
            <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">Memuat data dashboard...</p>
          </div>
        </div>
      ) : data != null ? (
        <div className="flex flex-col gap-8 max-w-[1920px] mx-auto">

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
                <Select value={tahun.toString()} onValueChange={(val) => setTahun(parseInt(val))}>
                  <SelectTrigger className="w-[120px] h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm font-semibold hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-blue-100">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunList.map((t) => (
                      <SelectItem key={t} value={t.toString()} className="font-medium cursor-pointer">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-6 flex-1">
                <ChartMasyarakatDilatihMonthly data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
              </div>
            </div>

            {/* Right Panel - Metrics Summary (Takes 1/3 width) */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              <MetricsSummaryPelatihan data={data} tahun={tahun.toString()} />
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
              <StatsMetricStatus data={data} tahun={tahun.toString()} />
            </div>
          </div>

          {/* Detail Charts Section - Full Width */}
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
              <div className="flex gap-2">
                <Select value={triwulan} onValueChange={setTriwulan}>
                  <SelectTrigger className="w-[110px] h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm font-semibold hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-indigo-100">
                    <SelectValue placeholder="Triwulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TW I" className="font-medium cursor-pointer">TW I</SelectItem>
                    <SelectItem value="TW II" className="font-medium cursor-pointer">TW II</SelectItem>
                    <SelectItem value="TW III" className="font-medium cursor-pointer">TW III</SelectItem>
                    <SelectItem value="TW IV" className="font-medium cursor-pointer">TW IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-0">
              <ChartDetailMasyarakatDilatih data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
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

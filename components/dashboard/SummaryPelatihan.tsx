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
    <div className="w-full min-h-screen ">
      {isFetching || isFetchingDataDukung ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <HashLoader color="#338CF5" size={60} />
            <p className="text-sm font-medium text-slate-600 animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      ) : data != null ? (
        <div className="flex flex-col gap-6 py-6">

          {/* Main Content Grid - Power BI Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            {/* Left Panel - Monthly Trend */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Trend Bulanan
                </h3>
              </div>
              <ChartMasyarakatDilatihMonthly data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
            </div>

            {/* Right Panel - Metrics Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  Status Pelatihan
                </h3>
              </div>
              <MetricsSummaryPelatihan data={data} tahun={tahun.toString()} />
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                Statistik Status
              </h3>
            </div>
            <StatsMetricStatus data={data} tahun={tahun.toString()} />
          </div>

          {/* Detail Charts Section */}
          <ChartDetailMasyarakatDilatih data={data} dataUser={dataDukung} tahun={tahun.toString()} triwulan={triwulan} />
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

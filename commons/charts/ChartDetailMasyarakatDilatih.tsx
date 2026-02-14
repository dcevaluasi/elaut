"use client";

import React, { useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { formatDateTime } from "@/utils";
import {
  getFilteredDataByBalai,
  getFilteredDataPelatihanByBalai,
} from "@/lib/training";
import { isSigned, isUnsigned } from "@/lib/sign";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";
import { getQuarterForFiltering, parseIndonesianDate } from "@/utils/time";

// ========================================================
// Color Palette
// ========================================================
const barColors = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#a855f7", // Purple
  "#ef4444", // Red
];

// ========================================================
// Chart Configurations
// ========================================================
const chartConfigs = {
  jenisPelatihan: { visitors: { label: "Masyarakat Dilatih" } },
  gender: { visitors: { label: "Masyarakat Dilatih" } },
  sertifikat: { visitors: { label: "Masyarakat Dilatih" } },
  programPelatihan: { visitors: { label: "Masyarakat Dilatih" } },
  programPrioritas: { visitors: { label: "Masyarakat Dilatih" } },
};

// ========================================================
// Reusable Chart Card
// ========================================================
interface ChartCardProps {
  title: string;
  chartConfig: any;
  chartData: any[];
  barHeight?: number
  chartType?: "vertical" | "horizontal" | "pie";
  itemsPerPage?: number;
}

const TrainingChartCard: React.FC<ChartCardProps> = ({
  title,
  chartConfig,
  chartData,
  barHeight = 50,
  chartType: initialChartType = "horizontal",
  itemsPerPage = 8,
}) => {
  const [chartType, setChartType] = useState<"vertical" | "horizontal" | "pie">(initialChartType);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(chartData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = chartData.slice(startIndex, endIndex);

  const chartHeight = chartType === "horizontal"
    ? Math.max(300, paginatedData.length * barHeight)
    : Math.max(350, 400);

  // Calculate total for this chart
  const totalVisitors = chartData.reduce((sum, item) => sum + item.visitors, 0);
  const highestValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.visitors)) : 0;
  const topItem = chartData.length > 0 ? chartData[0] : null;

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card className="flex flex-col w-full shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group hover:ring-1 hover:ring-blue-100 dark:hover:ring-blue-900">
      <CardHeader className="pb-4 pt-6 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            {title}
          </CardTitle>
          {totalPages > 1 && (
            <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
              {startIndex + 1}-{Math.min(endIndex, chartData.length)} of {chartData.length}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all duration-200">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalVisitors.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all duration-200">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Kategori</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{chartData.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-all duration-200">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Tertinggi</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{highestValue.toLocaleString()}</p>
          </div>
        </div>

        {topItem && (
          <div className="mt-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-xs font-semibold text-indigo-900">
                Top: <span className="text-blue-500">{topItem.name}</span> ({topItem.visitors.toLocaleString()} peserta)
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-6">
        <ChartContainer config={chartConfig} className="mx-auto w-full">
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chartType === "pie" ? (
              <PieChart>
                <Tooltip
                  content={<ChartTooltipContent hideLabel />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Pie
                  data={paginatedData}
                  dataKey="visitors"
                  nameKey="name"
                  outerRadius={120}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {paginatedData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[(startIndex + index) % barColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart
                data={paginatedData}
                layout={chartType === "horizontal" ? "vertical" : "horizontal"}
                margin={{
                  top: 20,
                  right: chartType === "horizontal" ? 30 : 20,
                  left: chartType === "vertical" ? 0 : 10,
                  bottom: chartType === "vertical" ? 40 : 5
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.2}
                  stroke="#e5e7eb"
                  vertical={chartType === "vertical"}
                  horizontal={chartType === "horizontal"}
                />
                <XAxis
                  type={chartType === "horizontal" ? "number" : "category"}
                  dataKey={chartType === "vertical" ? "name" : undefined}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={chartType === "vertical" ? -45 : 0}
                  textAnchor={chartType === "vertical" ? "end" : "middle"}
                  height={chartType === "vertical" ? 80 : 30}
                />
                <YAxis
                  type={chartType === "horizontal" ? "category" : "number"}
                  dataKey={chartType === "horizontal" ? "name" : undefined}
                  width={chartType === "horizontal" ? 180 : 50}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar
                  dataKey="visitors"
                  radius={chartType === "horizontal" ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                  maxBarSize={chartType === "horizontal" ? 35 : 50}
                  label={{
                    position: chartType === "horizontal" ? "right" : "top",
                    fill: "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {paginatedData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[(startIndex + index) % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-4 text-sm items-start bg-gradient-to-b from-slate-50 to-gray-50 border-t border-slate-200 pt-5 pb-5">
        <div className="w-full">
          <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Legend
          </p>
          <div className="flex gap-3 flex-wrap">
            {paginatedData.map((entry, index) => (
              <div key={entry.name} className="flex gap-2 items-center group bg-white px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <div
                  className="w-4 h-4 rounded-md shadow-md group-hover:scale-110 transition-transform duration-200"
                  style={{
                    backgroundColor: barColors[(startIndex + index) % barColors.length],
                  }}
                />
                <span className="text-sm text-slate-700 font-semibold">
                  {entry.name} <span className="text-slate-500 font-normal">({entry.visitors})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Controls for Chart */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === 1
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === page
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg scale-110"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-300 hover:border-indigo-400"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${currentPage === totalPages
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};


// ========================================================
// Main Component
// ========================================================
interface ChartDetailMasyarakatDilatihProps {
  data: PelatihanMasyarakat[];
  dataUser: UserPelatihan[];
  tahun: string
  triwulan: string
}

const ChartDetailMasyarakatDilatih: React.FC<
  ChartDetailMasyarakatDilatihProps
> = ({ data, dataUser, tahun, triwulan }) => {
  const isAdminBalaiPelatihan = Cookies.get("Role") === "Pengelola UPT";
  const nameBalaiPelatihan = Cookies.get("Satker");

  const filteredData = React.useMemo(() => {
    return dataUser.filter((item: UserPelatihan) => {
      if (!item.TanggalMulai) return false

      let d = new Date(item.TanggalMulai)
      if (isNaN(d.getTime())) {
        d = parseIndonesianDate(item.TanggalMulai) as Date
      }
      if (!d || isNaN(d.getTime())) return false

      const itemTahun = String(d.getFullYear())
      const itemTriwulan = getQuarterForFiltering(item.TanggalMulai!)

      // filter by tahun
      if (tahun && itemTahun !== tahun) return false
      // Accumulated data: include all data up to and including the selected TW
      if (triwulan) {
        const order = ["TW I", "TW II", "TW III", "TW IV"]
        const selectedIdx = order.indexOf(triwulan)
        const itemIdx = order.indexOf(itemTriwulan)
        // Include all quarters up to the selected one (accumulated)
        if (itemIdx > selectedIdx) return false
      }

      return true
    })
  }, [dataUser, tahun, triwulan])


  const filteredDataByBalai = useMemo(
    () => getFilteredDataByBalai(filteredData, nameBalaiPelatihan!),
    [filteredData, nameBalaiPelatihan]
  );

  const filteredPelatihanByBalai = useMemo(() => {
    let filtered = getFilteredDataPelatihanByBalai(
      data,
      isAdminBalaiPelatihan,
      nameBalaiPelatihan!,
    );

    const currentYear = new Date().getFullYear().toString();
    const targetYear = tahun || currentYear;

    return filtered.filter((item) => {
      if (!item.TanggalMulaiPelatihan) return false;
      let d = new Date(item.TanggalMulaiPelatihan);
      if (isNaN(d.getTime())) {
        d = parseIndonesianDate(item.TanggalMulaiPelatihan) as Date;
      }
      if (!d || isNaN(d.getTime())) return false;

      const itemTahun = String(d.getFullYear());

      // Filter by target year (selected or current)
      if (itemTahun !== targetYear) return false;

      // Optional: Filter by Triwulan to match UserPelatihan logic
      if (triwulan) {
        const itemTriwulan = getQuarterForFiltering(item.TanggalMulaiPelatihan!);
        const order = ["TW I", "TW II", "TW III", "TW IV"];
        const selectedIdx = order.indexOf(triwulan);
        const itemIdx = order.indexOf(itemTriwulan);
        if (itemIdx > selectedIdx) return false;
      }

      return true;
    });
  }, [data, isAdminBalaiPelatihan, nameBalaiPelatihan, tahun, triwulan]);

  const countWith = (cond: (item: any) => boolean) =>
    filteredDataByBalai.filter(cond).length;

  const chartData = useMemo(() => {
    const filteredByStatus = filteredPelatihanByBalai.filter(item =>
      ['7D', '11', '15'].includes(String(item?.StatusPenerbitan).trim().toUpperCase())
    );

    // Source categories from PelatihanMasyarakat (data) and sum signed users
    const uniqueJenisPelatihan = [
      ...new Set(filteredByStatus.map((i) => i.JenisPelatihan?.trim()).filter(Boolean)),
    ];
    const byJenisPelatihan = uniqueJenisPelatihan.map((jenis) => ({
      name: jenis!,
      visitors: filteredByStatus
        .filter(item => item.JenisPelatihan?.trim() === jenis)
        .reduce((sum, item) => sum + (item.UserPelatihan?.filter(u => u.FileSertifikat?.includes("signed")).length || 0), 0)
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);

    const uniquePenyelenggaraPelatihan = [
      ...new Set(filteredDataByBalai.map((i) => i.PenyelenggaraPelatihan).filter(Boolean)),
    ];
    const byPenyelenggaraPelatihan = uniquePenyelenggaraPelatihan.map((penyelenggara) => ({
      name: penyelenggara,
      visitors: countWith((i) => i.PenyelenggaraPelatihan === penyelenggara && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);

    const uniqueSektor = [
      ...new Set(filteredDataByBalai.map((i) => i.JenisProgram).filter(Boolean)),
    ];
    const bySektorPelatihan = uniqueSektor.map((program) => ({
      name: program,
      visitors: countWith((i) => i.JenisProgram === program && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);

    const uniqueProgram = [
      ...new Set(filteredDataByBalai.map((i) => i.Program).filter(Boolean)),
    ];
    const byProgramPelatihan = uniqueProgram.map((program) => ({
      name: program,
      visitors: countWith((i) => i.Program === program && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);


    const uniqueKlaster = [
      ...new Set(filteredDataByBalai.map((i) => i.BidangPelatihan).filter(Boolean)),
    ];
    const byKlasterPelatihan = uniqueKlaster.map((bidang) => ({
      name: bidang,
      visitors: countWith((i) => i.BidangPelatihan === bidang && i.FileSertifikat.includes("signed")),
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);

    const uniquePrioritas = [
      ...new Set(filteredByStatus.map((i) => i.DukunganProgramTerobosan?.trim()).filter(Boolean)),
    ];
    const byProgramPrioritas = uniquePrioritas.map((kategori) => ({
      name: kategori!,
      visitors: filteredByStatus
        .filter(item => item.DukunganProgramTerobosan?.trim() === kategori)
        .reduce((sum, item) => sum + (item.UserPelatihan?.filter(u => u.FileSertifikat?.includes("signed")).length || 0), 0)
    })).filter((item) => item.visitors > 0).sort((a, b) => b.visitors - a.visitors);

    const byGender = [
      {
        name: "Laki - Laki",
        visitors: countWith(
          (i) => ["L", "Laki - Laki"].includes(i.JenisKelamin) && i.FileSertifikat.includes("signed")
        ),
      },
      {
        name: "Perempuan",
        visitors: countWith(
          (i) => ["P", "Perempuan"].includes(i.JenisKelamin) && i.FileSertifikat.includes("signed")
        ),
      },
    ];

    const bySertifikat = [
      {
        name: "Tidak Bersertifikat",
        visitors: countWith((i) => isUnsigned(i.FileSertifikat)),
      },
      {
        name: "Bersertifikat",
        visitors: countWith((i) => isSigned(i.FileSertifikat)),
      },
    ];

    return {
      byGender,
      byJenisPelatihan,
      bySektorPelatihan,
      byKlasterPelatihan,
      byProgramPrioritas,
      byProgramPelatihan,
      bySertifikat,
      byPenyelenggaraPelatihan
    };
  }, [filteredDataByBalai, filteredPelatihanByBalai]);

  return (
    <div className="p-6">

      <div className="flex h-full gap-6 flex-col">
        {/* First Row - Mixed Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TrainingChartCard
            title="Sektor Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.bySektorPelatihan}
            chartType={chartData.bySektorPelatihan.length > 5 ? "horizontal" : "pie"}
            itemsPerPage={6}
          />
          <TrainingChartCard
            title="Sumber Pembiayaan atau Pemenuhan IKU"
            chartConfig={chartConfigs.jenisPelatihan}
            chartData={chartData.byJenisPelatihan}
            chartType={chartData.byJenisPelatihan.length > 5 ? "horizontal" : "pie"}
            itemsPerPage={6}
          />

        </div>


        {/* Second Row - Full Width Charts */}
        <div className="w-full grid grid-cols-2 gap-6">
          <TrainingChartCard
            title="Dukungan Program Prioritas"
            chartConfig={chartConfigs.programPrioritas}
            chartData={chartData.byProgramPrioritas}
            chartType={chartData.byProgramPrioritas.length > 5 ? "horizontal" : "vertical"}
            itemsPerPage={6}
          />
          <TrainingChartCard
            title="Program Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.byProgramPelatihan}
            chartType={chartData.byProgramPelatihan.length > 5 ? "horizontal" : "vertical"}
            itemsPerPage={8}
            barHeight={45}
          />
        </div>

        {/* Third Row - Side by Side */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <TrainingChartCard
            title="Penyelenggara Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.byPenyelenggaraPelatihan}
            chartType={chartData.byPenyelenggaraPelatihan.length > 5 ? "horizontal" : "vertical"}
            itemsPerPage={6}
          />

          <TrainingChartCard
            title="Klaster atau Bidang Pelatihan"
            chartConfig={chartConfigs.programPelatihan}
            chartData={chartData.byKlasterPelatihan}
            chartType={chartData.byKlasterPelatihan.length > 5 ? "horizontal" : "vertical"}
            itemsPerPage={6}
          />
        </div>
      </div>

    </div>
  );
};

export default ChartDetailMasyarakatDilatih;

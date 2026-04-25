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
    ? Math.max(200, paginatedData.length * (barHeight + 10) + 80)
    : 380;

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

  const truncateLabel = (value: string, maxLength = 22) => {
    if (!value || typeof value !== 'string') return value;
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  };

  // Custom Tooltip for Modern Look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const displayName = payload[0].payload?.name || label;
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800">
          {displayName && (
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">{displayName}</p>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: payload[0].payload?.colorHex || payload[0].fill }} />
            <p className="text-sm font-black text-slate-700 dark:text-slate-300">
              {payload[0].value.toLocaleString()} <span className="text-xs font-medium text-slate-500">peserta</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhance paginatedData with colors and gradient IDs
  const enhancedData = paginatedData.map((item, index) => {
    const colorIndex = (startIndex + index) % barColors.length;
    return {
      ...item,
      colorHex: barColors[colorIndex],
      gradId: chartType === "horizontal" ? `grad-h-${colorIndex}` : `grad-v-${colorIndex}`
    };
  });

  return (
    <Card className="flex flex-col w-full shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] overflow-hidden group">
      <CardHeader className="pb-2 pt-8 px-8 border-none">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <div className="w-2.5 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm shadow-blue-200"></div>
              {title}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-5">Statistik distribusi masyarakat dilatih</p>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-4 py-2 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-bold tracking-wide">
                Hal {currentPage} / {totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Modern Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/10 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group/stat">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover/stat:bg-blue-500/10 transition-colors" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">Total Keseluruhan</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{totalVisitors.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-800/10 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group/stat">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover/stat:bg-emerald-500/10 transition-colors" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">Kategori / Segmen</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{chartData.length}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden group/stat">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover/stat:bg-indigo-500/20 transition-colors" />
            <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400 font-bold uppercase tracking-widest mb-1.5">Capaian Tertinggi</p>
            <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300 tracking-tighter">{highestValue.toLocaleString()}</p>
          </div>
        </div>

        {topItem && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700 shadow-sm mt-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg">🏆</span>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight">
              Kategori terbanyak adalah <span className="font-bold text-slate-800 dark:text-white">{topItem.name}</span> dengan total <span className="text-blue-600 dark:text-blue-400 font-bold">{topItem.visitors.toLocaleString()}</span> peserta.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-4 px-6">
        <ChartContainer config={chartConfig} className="mx-auto w-full">
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chartType === "pie" ? (
              <PieChart>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Pie
                  data={enhancedData}
                  dataKey="visitors"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  cornerRadius={10}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {enhancedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.colorHex} className="hover:opacity-80 transition-all duration-300 cursor-pointer" />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart
                data={enhancedData}
                layout={chartType === "horizontal" ? "vertical" : "horizontal"}
                margin={{
                  top: 10,
                  right: chartType === "horizontal" ? 50 : 20,
                  left: chartType === "vertical" ? 0 : 20,
                  bottom: chartType === "vertical" ? 80 : 0
                }}
                barCategoryGap={chartType === "horizontal" ? "20%" : "30%"}
              >
                <defs>
                  {barColors.map((color, idx) => (
                    <React.Fragment key={idx}>
                      <linearGradient id={`grad-h-${idx}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.6}/>
                        <stop offset="100%" stopColor={color} stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id={`grad-v-${idx}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.6}/>
                        <stop offset="100%" stopColor={color} stopOpacity={1}/>
                      </linearGradient>
                    </React.Fragment>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  opacity={0.3}
                  stroke="#cbd5e1"
                  vertical={chartType === "vertical"}
                  horizontal={chartType === "horizontal"}
                />
                <XAxis
                  type={chartType === "horizontal" ? "number" : "category"}
                  dataKey={chartType === "vertical" ? "name" : undefined}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickFormatter={chartType === "vertical" ? (val) => truncateLabel(val, 15) : undefined}
                  angle={chartType === "vertical" ? -45 : 0}
                  textAnchor={chartType === "vertical" ? "end" : "middle"}
                  height={chartType === "vertical" ? 100 : 30}
                  interval={chartType === "vertical" ? 0 : "preserveEnd"}
                  dy={chartType === "vertical" ? 10 : 0}
                />
                <YAxis
                  type={chartType === "horizontal" ? "category" : "number"}
                  dataKey={chartType === "horizontal" ? "name" : undefined}
                  width={chartType === "horizontal" ? 180 : 50}
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                  tickFormatter={chartType === "horizontal" ? (val) => truncateLabel(val, 20) : undefined}
                  tickLine={false}
                  axisLine={false}
                  dx={chartType === "horizontal" ? -10 : 0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)', radius: 12 }} />
                <Bar
                  dataKey="visitors"
                  radius={chartType === "horizontal" ? [0, 100, 100, 0] : [100, 100, 0, 0]}
                  barSize={chartType === "horizontal" ? 22 : 46}
                  label={{
                    position: chartType === "horizontal" ? "right" : "top",
                    fill: "#334155",
                    fontSize: 12,
                    fontWeight: 800,
                    formatter: (value: number) => value > 0 ? value : '',
                  }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {enhancedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#${entry.gradId})`}
                      className="hover:brightness-110 transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex flex-col gap-5 px-8 pb-8 pt-5 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div className="w-full flex flex-col gap-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Legend
          </p>
          <div className="flex gap-2 flex-wrap">
            {enhancedData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2.5 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.colorHex }}
                />
                <span className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold">
                  {entry.name} <span className="text-slate-400 font-medium ml-1">({entry.visitors})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${currentPage === 1
                ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-[0_4px_15px_-3px_rgba(59,130,246,0.15)] active:scale-95"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Sebelumnya
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full text-[13px] font-bold transition-all duration-300 ${currentPage === page
                    ? "bg-blue-600 text-white shadow-[0_4px_15px_-3px_rgba(59,130,246,0.4)]"
                    : "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${currentPage === totalPages
                ? "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                : "bg-blue-600 text-white shadow-[0_4px_15px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_20px_-4px_rgba(59,130,246,0.4)] hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95"
                }`}
            >
              Selanjutnya
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
    // Rely on the dataUser (which is already filteredDataDukung from SummaryPelatihan)
    return dataUser;
  }, [dataUser]);


  const filteredDataByBalai = useMemo(
    () => getFilteredDataByBalai(filteredData, nameBalaiPelatihan!),
    [filteredData, nameBalaiPelatihan]
  );

  const filteredPelatihanByBalai = useMemo(() => {
    let filtered = [...data]; // Use already filteredDataPelatihan from SummaryPelatihan

    if (isAdminBalaiPelatihan) {
      filtered = filtered.filter((p) => p.PenyelenggaraPelatihan === nameBalaiPelatihan);
    }

    return filtered;
  }, [data, isAdminBalaiPelatihan, nameBalaiPelatihan]);

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

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
import { ChartContainer } from "@/components/ui/chart";
import {
  getFilteredDataByBalai,
} from "@/lib/training";
import { isSigned, isUnsigned } from "@/lib/sign";
import { PelatihanMasyarakat, UserPelatihan } from "@/types/product";

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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: barColors[0] }}>Total Peserta</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{totalVisitors.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">keseluruhan</p>
          </div>
          <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: barColors[4] }}>Segmen</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{chartData.length}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">kategori unik</p>
          </div>
          <div className="rounded-2xl p-4 border-2 bg-white" style={{ borderColor: barColors[2] + '40', backgroundColor: barColors[2] + '08' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: barColors[2] }}>Tertinggi</p>
            <p className="text-3xl font-black tracking-tighter" style={{ color: barColors[2] }}>{highestValue.toLocaleString()}</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: barColors[2] + 'aa' }}>
              {totalVisitors > 0 ? Math.round((highestValue / totalVisitors) * 100) : 0}% dari total
            </p>
          </div>
        </div>

        {topItem && (
          <div className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border-2 shadow-sm mt-2"
            style={{ borderColor: barColors[0] + '30', backgroundColor: barColors[0] + '06' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: barColors[0] + '20' }}>
              <span className="text-base">🏆</span>
            </div>
            <p className="text-sm font-medium text-slate-600 leading-tight">
              Terbanyak: <span className="font-black text-slate-800">{topItem.name}</span>
              {" — "}
              <span className="font-black" style={{ color: barColors[0] }}>{topItem.visitors.toLocaleString()}</span>
              <span className="text-slate-400 font-medium"> peserta</span>
              {totalVisitors > 0 && (
                <span className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: barColors[0] + '18', color: barColors[0] }}>
                  {Math.round((topItem.visitors / totalVisitors) * 100)}%
                </span>
              )}
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
                        <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                      <linearGradient id={`grad-v-${idx}`} x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
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

      <CardFooter className="flex flex-col gap-5 px-8 pb-8 pt-5 bg-white/50 border-t border-slate-100">
        <div className="w-full flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribusi per Kategori</p>
          <div className="flex gap-2 flex-wrap">
            {enhancedData.map((entry) => (
              <div key={entry.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-default"
                style={{ borderColor: entry.colorHex + '40', backgroundColor: entry.colorHex + '0d' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.colorHex }} />
                <span className="text-[12px] font-bold" style={{ color: entry.colorHex }}>
                  {entry.visitors.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-600 font-medium">{entry.name}</span>
                {totalVisitors > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {Math.round((entry.visitors / totalVisitors) * 100)}%
                  </span>
                )}
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
// Synchronized Cross-Tab Chart Card
// Y-axis: Sektor Pelatihan | Bars: Sumber Pembiayaan
// ========================================================
interface CrossTabRow {
  sektor: string;
  [jenis: string]: string | number;
}

interface SyncChartCardProps {
  title: string;
  crossTabData: CrossTabRow[];
  jenisKeys: string[];   // unique Sumber Pembiayaan names → one bar each
}

const SYNC_PALETTE = [
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

const SynchronizedChartCard: React.FC<SyncChartCardProps> = ({
  title,
  crossTabData,
  jenisKeys,
}) => {
  const truncateLabel = (value: string, maxLength = 22) =>
    value?.length > maxLength ? value.substring(0, maxLength) + "\u2026" : value;

  const grandTotal = crossTabData.reduce(
    (sum, row) => sum + jenisKeys.reduce((s, k) => s + ((row[k] as number) || 0), 0),
    0
  );

  const SyncTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 min-w-[200px]">
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          {label}
        </p>
        {payload
          .filter((p: any) => (p.value as number) > 0)
          .map((p: any) => (
            <div key={p.name} className="flex items-center gap-2.5 mt-1.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex-1 leading-tight">{p.name}:</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {(p.value as number).toLocaleString()}
                <span className="text-xs font-medium text-slate-400 ml-1">org</span>
              </span>
            </div>
          ))}
      </div>
    );
  };



  return (
    <Card className="flex flex-col w-full shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-500 border border-slate-100/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      <CardHeader className="pb-2 pt-8 px-8 border-none">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-indigo-500 rounded-full" />
          <div>
            <h3 className="text-sm font-black text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">Distribusi peserta per sektor pelatihan, dikelompokkan berdasarkan sumber pembiayaan</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl p-4 border-2 bg-white"
            style={{ borderColor: SYNC_PALETTE[0] + '35', backgroundColor: SYNC_PALETTE[0] + '08' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: SYNC_PALETTE[0] }}>Total Peserta</p>
            <p className="text-2xl font-black text-slate-800">{grandTotal.toLocaleString()}</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: SYNC_PALETTE[0] + '90' }}>bersertifikat</p>
          </div>
          <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sektor</p>
            <p className="text-2xl font-black text-slate-800">{crossTabData.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">jenis sektor</p>
          </div>
          <div className="rounded-2xl p-4 border border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pembiayaan</p>
            <p className="text-2xl font-black text-slate-800">{jenisKeys.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">sumber</p>
          </div>
        </div>
        {/* Insight note */}
        {crossTabData.length > 0 && (() => {
          const topRow = crossTabData[0];
          const topRowTotal = jenisKeys.reduce((s, k) => s + ((topRow[k] as number) || 0), 0);
          return (
            <div className="flex items-center gap-3 rounded-2xl p-3.5 border-2 bg-white mb-1"
              style={{ borderColor: SYNC_PALETTE[0] + '30', backgroundColor: SYNC_PALETTE[0] + '06' }}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: SYNC_PALETTE[0] + '20' }}>
                <span className="text-base">📊</span>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-tight">
                Sektor terbesar: <span className="font-black text-slate-800">{topRow.sektor}</span>
                {" — "}
                <span className="font-black" style={{ color: SYNC_PALETTE[0] }}>{topRowTotal.toLocaleString()}</span>
                <span className="text-slate-400 font-medium"> peserta</span>
                {grandTotal > 0 && (
                  <span className="ml-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: SYNC_PALETTE[0] + '18', color: SYNC_PALETTE[0] }}>
                    {Math.round((topRowTotal / grandTotal) * 100)}%
                  </span>
                )}
              </p>
            </div>
          );
        })()}
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-4 px-6">
        <ResponsiveContainer width="100%" height={Math.max(320, crossTabData.length * jenisKeys.length * 28 + 100)}>
          <BarChart
            data={crossTabData}
            margin={{ top: 20, right: 20, left: 10, bottom: crossTabData.length > 4 ? 80 : 50 }}
            barCategoryGap="22%"
            barGap={2}
          >
            <defs>
              {jenisKeys.map((_, idx) => (
                <linearGradient key={idx} id={`sg-${idx}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={SYNC_PALETTE[idx % SYNC_PALETTE.length]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={SYNC_PALETTE[idx % SYNC_PALETTE.length]} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="4 4" opacity={0.22} stroke="#cbd5e1" vertical={false} horizontal />
            <XAxis
              type="category"
              dataKey="sektor"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
              tickFormatter={(val) => truncateLabel(val, 18)}
              angle={crossTabData.length > 4 ? -40 : 0}
              textAnchor={crossTabData.length > 4 ? "end" : "middle"}
              height={crossTabData.length > 4 ? 80 : 50}
              interval={0}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              width={40}
            />
            <Tooltip content={<SyncTooltip />} cursor={{ fill: 'rgba(241,245,249,0.45)', radius: 8 }} />
            {jenisKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={`url(#sg-${idx})`}
                radius={[6, 6, 0, 0]}
                barSize={Math.max(12, Math.min(32, Math.floor(180 / (crossTabData.length * jenisKeys.length + 1))))}
                label={{
                  position: 'top',
                  fill: '#334155',
                  fontSize: 10,
                  fontWeight: 800,
                  formatter: (v: number) => v > 0 ? v : '',
                }}
                animationDuration={1100 + idx * 150}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>


      <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-5 bg-white/50 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sumber Pembiayaan</p>
        <div className="flex gap-2 flex-wrap">
          {jenisKeys.map((key, idx) => {
            const color = SYNC_PALETTE[idx % SYNC_PALETTE.length];
            const total = crossTabData.reduce((s, row) => s + ((row[key] as number) || 0), 0);
            return (
              <div key={key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                style={{ borderColor: color + '40', backgroundColor: color + '0d' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-bold" style={{ color }}>{total.toLocaleString()}</span>
                <span className="text-[11px] text-slate-600 font-medium">{key}</span>
                {grandTotal > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {Math.round((total / grandTotal) * 100)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
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

    // Cross-tab: Y=Sektor Pelatihan, bars=Sumber Pembiayaan (JenisPelatihan)
    const uniqueSektorForCrossTab = [
      ...new Set(filteredByStatus.map((i) => i.JenisProgram?.trim()).filter(Boolean)),
    ] as string[];
    const uniqueJenisForCrossTab = [
      ...new Set(filteredByStatus.map((i) => i.JenisPelatihan?.trim()).filter(Boolean)),
    ] as string[];

    const bySektorXJenis: CrossTabRow[] = uniqueSektorForCrossTab
      .map((sektor) => {
        const row: CrossTabRow = { sektor };
        let rowTotal = 0;
        uniqueJenisForCrossTab.forEach((jenis) => {
          const count = filteredByStatus
            .filter((p) => p.JenisProgram?.trim() === sektor && p.JenisPelatihan?.trim() === jenis)
            .reduce((sum, p) => sum + (p.UserPelatihan?.filter((u) => u.FileSertifikat?.includes("signed")).length || 0), 0);
          row[jenis] = count;
          rowTotal += count;
        });
        return { ...row, _total: rowTotal };
      })
      .filter((row) => (row._total as number) > 0)
      .sort((a, b) => (b._total as number) - (a._total as number))
      .map(({ _total, ...rest }) => rest as CrossTabRow);

    return {
      byGender,
      byJenisPelatihan,
      bySektorPelatihan,
      byKlasterPelatihan,
      byProgramPrioritas,
      byProgramPelatihan,
      bySertifikat,
      byPenyelenggaraPelatihan,
      bySektorXJenis,
      jenisKeysForSync: uniqueJenisForCrossTab,
    };
  }, [filteredDataByBalai, filteredPelatihanByBalai]);

  return (
    <div className="p-6">

      <div className="flex h-full gap-6 flex-col">
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

// ============================================================
// Standalone export: Sektor × Sumber Pembiayaan card
// Styled to match ChartMasyarakatDilatihMonthly
// ============================================================
interface ChartSektorPembiayaanCardProps {
  data: PelatihanMasyarakat[];      // filteredDataPelatihan
  dataUser: UserPelatihan[];        // kept for API parity
}

export const ChartSektorPembiayaanCard: React.FC<ChartSektorPembiayaanCardProps> = ({ data }) => {
  const isAdminBalaiPelatihan = Cookies.get("Role") === "Pengelola UPT";
  const nameBalaiPelatihan = Cookies.get("Satker");

  const { crossTabData, jenisKeys, grandTotal } = useMemo(() => {
    let filtered = [...data];
    if (isAdminBalaiPelatihan) {
      filtered = filtered.filter((p) => p.PenyelenggaraPelatihan === nameBalaiPelatihan);
    }

    const filteredByStatus = filtered.filter((item) =>
      ["7D", "11", "15"].includes(String(item?.StatusPenerbitan).trim().toUpperCase())
    );

    const uniqueSektor = [
      ...new Set(filteredByStatus.map((i) => i.JenisProgram?.trim()).filter(Boolean)),
    ] as string[];
    const uniqueJenis = [
      ...new Set(filteredByStatus.map((i) => i.JenisPelatihan?.trim()).filter(Boolean)),
    ] as string[];

    const crossTab: CrossTabRow[] = uniqueSektor
      .map((sektor) => {
        const row: CrossTabRow = { sektor };
        let total = 0;
        uniqueJenis.forEach((jenis) => {
          const count = filteredByStatus
            .filter((p) => p.JenisProgram?.trim() === sektor && p.JenisPelatihan?.trim() === jenis)
            .reduce((sum, p) => sum + (p.UserPelatihan?.filter((u) => u.FileSertifikat?.includes("signed")).length || 0), 0);
          row[jenis] = count;
          total += count;
        });
        return { ...row, _total: total };
      })
      .filter((row) => (row._total as number) > 0)
      .sort((a, b) => (b._total as number) - (a._total as number))
      .map(({ _total, ...rest }) => rest as CrossTabRow);

    const total = crossTab.reduce(
      (s, row) => s + uniqueJenis.reduce((ss, k) => ss + ((row[k] as number) || 0), 0), 0
    );

    return { crossTabData: crossTab, jenisKeys: uniqueJenis, grandTotal: total };
  }, [data, isAdminBalaiPelatihan, nameBalaiPelatihan]);

  const truncate = (v: string, n = 16) => v?.length > n ? v.slice(0, n) + "…" : v;

  const SyncTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-slate-100 min-w-[180px]">
        <p className="text-[12px] font-bold text-slate-800 mb-1.5 border-b border-slate-100 pb-1.5">{label}</p>
        {payload.filter((p: any) => (p.value as number) > 0).map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.fill }} />
            <span className="text-[11px] text-slate-500 flex-1">{p.name}:</span>
            <span className="text-[12px] font-black text-slate-800">{(p.value as number).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartHeight = Math.max(280, crossTabData.length * 40 + 80);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Stats — same style as ChartMasyarakatDilatihMonthly */}
      <div className="flex flex-wrap gap-5 px-5 pt-2">
        {/* Sektor */}
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Sektor Pelatihan</p>
            <p className="text-lg font-bold text-slate-800 leading-none">{crossTabData.length} Sektor</p>
          </div>
        </div>
        {/* Sumber */}
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-pink-500 ring-4 ring-pink-500/20 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Sumber Pembiayaan</p>
            <p className="text-lg font-bold text-slate-800 leading-none">{jenisKeys.length} Sumber</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="-ml-3 flex-1" style={{ minHeight: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={crossTabData}
            margin={{ top: 16, right: 16, left: 0, bottom: crossTabData.length > 4 ? 70 : 40 }}
            barCategoryGap="22%"
            barGap={2}
          >
            <defs>
              {jenisKeys.map((_, idx) => (
                <linearGradient key={idx} id={`spg-${idx}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={SYNC_PALETTE[idx % SYNC_PALETTE.length]} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={SYNC_PALETTE[idx % SYNC_PALETTE.length]} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
            <XAxis
              dataKey="sektor"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              tickFormatter={(v) => truncate(v, 14)}
              angle={crossTabData.length > 3 ? -35 : 0}
              textAnchor={crossTabData.length > 3 ? "end" : "middle"}
              height={crossTabData.length > 3 ? 70 : 40}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              width={32}
            />
            <Tooltip content={<SyncTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)', radius: 8 }} />
            {jenisKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={`url(#spg-${idx})`}
                radius={[5, 5, 0, 0]}
                barSize={Math.max(10, Math.min(28, Math.floor(140 / (crossTabData.length * jenisKeys.length + 1))))}
                animationDuration={900 + idx * 120}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend — subtle pills like stat items */}
      {jenisKeys.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pb-1">
          {jenisKeys.map((key, idx) => {
            const color = SYNC_PALETTE[idx % SYNC_PALETTE.length];
            const total = crossTabData.reduce((s, row) => s + ((row[key] as number) || 0), 0);
            return (
              <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold" style={{ color }}>{total.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-medium">{key}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

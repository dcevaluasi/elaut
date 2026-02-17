"use client";

import React, { useMemo } from "react";
import { File, Layers, TrendingUp, CheckCircle, PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

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

const COLORS_CLUSTERS = ["#3B82F6", "#0EA5E9", "#06B6D4", "#10B981", "#8B5CF6", "#F59E0B", "#F97316", "#EF4444"];
const COLORS_STATUS = ["#10B981", "#EF4444"]; // Green, Red
const COLORS_YEARS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"];

export default function StatsModulPelatihan({ data, stats }: { data: any[]; stats: any }) {
    // Metrics
    const totalModul = data.reduce((acc, m) => acc + m.ModulPelatihan.length, 0);
    const totalMateri = data.length;

    // Chart Data Transforms
    const clusterData = useMemo(() => {
        const allClusters = Object.entries(stats.bidang)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);

        const top5 = allClusters.slice(0, 5);
        const others = allClusters.slice(5).reduce((acc, curr) => acc + curr.value, 0);

        if (others > 0) {
            return [...top5, { name: "Lainnya", value: others }];
        }
        return top5;
    }, [stats.bidang]);

    const fullClusterList = useMemo(() => {
        return Object.entries(stats.bidang)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value);
    }, [stats.bidang]);


    const yearData = useMemo(() => {
        return Object.entries(stats.tahun)
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Chronological
    }, [stats.tahun]);

    const statusData = useMemo(() => {
        const verified = data.filter(d => d.IsVerified === "Verified").length;
        const notVerified = data.length - verified;
        return [
            { name: "Disahkan", value: verified },
            { name: "Belum Disahkan", value: notVerified }
        ].filter(d => d.value > 0);
    }, [data]);


    // ========================================================
    // Reusable Chart Card
    // ========================================================
    interface ChartCardProps {
        title: string;
        chartConfig?: any;
        chartData: any[];
        barHeight?: number
        chartType?: "vertical" | "horizontal" | "pie";
        itemsPerPage?: number;
        colorScheme?: "blue" | "emerald" | "violet" | "indigo" | "amber";
        stackId?: string;
        dataKeys?: string[];
    }

    const TrainingChartCard: React.FC<ChartCardProps> = ({
        title,
        chartData,
        barHeight = 50,
        chartType = "horizontal",
        itemsPerPage = 6,
        colorScheme = "blue",
        stackId,
        dataKeys = ["value"]
    }) => {
        const [currentPage, setCurrentPage] = React.useState(1);

        const totalPages = Math.ceil(chartData.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = chartData.slice(startIndex, endIndex);

        const chartHeight = chartType === "horizontal"
            ? Math.max(300, paginatedData.length * barHeight)
            : 350;

        const totalVisitors = chartData.reduce((sum, item) => {
            if (dataKeys.length > 1) {
                return sum + dataKeys.reduce((s, k) => s + (item[k] || 0), 0);
            }
            return sum + (item.value || 0);
        }, 0);

        const highestValue = chartData.length > 0
            ? Math.max(...chartData.map(d => dataKeys.length > 1 ? dataKeys.reduce((s, k) => s + (d[k] || 0), 0) : d.value))
            : 0;

        const topItem = chartData.length > 0 ? chartData[0] : null;

        const schemeColors = {
            blue: "from-blue-500 to-indigo-500",
            emerald: "from-emerald-500 to-teal-500",
            violet: "from-violet-500 to-purple-500",
            indigo: "from-indigo-500 to-blue-500",
            amber: "from-amber-500 to-orange-500",
        };

        const accentGradient = schemeColors[colorScheme as keyof typeof schemeColors] || schemeColors.blue;

        return (
            <Card className="flex flex-col w-full shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:ring-1 hover:ring-slate-100 dark:hover:ring-slate-800">
                <CardHeader className="pb-4 pt-6 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <div className={`w-1 h-6 bg-gradient-to-b ${accentGradient} rounded-full`}></div>
                            {title}
                        </CardTitle>
                        {totalPages > 1 && (
                            <div className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                {startIndex + 1}-{Math.min(endIndex, chartData.length)} of {chartData.length}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white">{totalVisitors.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Kategori</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white">{chartData.length}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tertinggi</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white">{highestValue.toLocaleString()}</p>
                        </div>
                    </div>

                    {topItem && chartType !== "pie" && (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                                    Dominan: <span className="text-blue-600 dark:text-blue-400">{topItem.name}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="flex-1 pb-6 pt-6">
                    <ResponsiveContainer width="100%" height={chartHeight}>
                        {chartType === "pie" ? (
                            <PieChart>
                                <Pie
                                    data={paginatedData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    paddingAngle={5}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {paginatedData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                            </PieChart>
                        ) : (
                            <BarChart
                                data={paginatedData}
                                layout={chartType === "horizontal" ? "vertical" : "horizontal"}
                                margin={{ top: 5, right: 30, left: chartType === "horizontal" ? 40 : 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={chartType === "vertical"} horizontal={chartType === "horizontal"} opacity={0.1} />
                                <XAxis
                                    type={chartType === "horizontal" ? "number" : "category"}
                                    dataKey={chartType === "vertical" ? "name" : undefined}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                />
                                <YAxis
                                    type={chartType === "horizontal" ? "category" : "number"}
                                    dataKey={chartType === "horizontal" ? "name" : undefined}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    width={chartType === "horizontal" ? 120 : 40}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                />
                                {dataKeys.map((key, index) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId={stackId}
                                        fill={barColors[index % barColors.length]}
                                        radius={chartType === "horizontal" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                ))}
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>

                {totalPages > 1 && (
                    <CardFooter className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 py-4 px-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                        >
                            <div className="w-4 h-4 text-slate-600 flex items-center justify-center">←</div>
                        </button>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 disabled:opacity-50"
                        >
                            <div className="w-4 h-4 text-slate-600 flex items-center justify-center">→</div>
                        </button>
                    </CardFooter>
                )}
            </Card>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <TrainingChartCard
                    title="Tren Tahunan"
                    chartData={yearData}
                    chartType="vertical"
                    colorScheme="blue"
                />
                <TrainingChartCard
                    title="Status Verifikasi"
                    chartData={statusData}
                    chartType="pie"
                    colorScheme="emerald"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 w-full">
                <TrainingChartCard
                    title="Distribusi Rumpun Pelatihan"
                    chartData={fullClusterList}
                    chartType="horizontal"
                    colorScheme="amber"
                    itemsPerPage={8}
                    barHeight={40}
                />
            </div>
        </div>
    );
}

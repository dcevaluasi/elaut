"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlankoKeluar } from "@/types/blanko";
import { getMonthFromDateString } from "@/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Certificate of Competence (CoC)",
    color: "#3C50E0",
  },
  mobile: {
    label: "Certificate of Proficiency (CoP)",
    color: "#80CAEE",
  },
} satisfies ChartConfig;

export function AreaCharts({ data, dataSertifikat }: { data: BlankoKeluar[], dataSertifikat: any }) {
  const [timeRange, setTimeRange] = React.useState("2024");

  // Generate dynamic years starting from 2024
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) =>
    (startYear + i).toString()
  );

  // Generate chart data dynamically based on selected year
  const chartData = React.useMemo(() => {
    const months = [
      { month: "Jan", num: "01" },
      { month: "Feb", num: "02" },
      { month: "Mar", num: "03" },
      { month: "Apr", num: "04" },
      { month: "Mei", num: "05" },
      { month: "Jun", num: "06" },
      { month: "Jul", num: "07" },
      { month: "Aug", num: "08" },
      { month: "Sep", num: "09" },
      { month: "Okt", num: "10" },
      { month: "Nov", num: "11" },
      { month: "Des", num: "12" },
    ];

    return months.map(({ month, num }) => ({
      date: `${timeRange}-${num}-01`,
      month,
      desktop: data
        .filter(
          (item) =>
            item.TipeBlanko === "Certificate of Competence (CoC)" &&
            getMonthFromDateString(item.TanggalKeluar) === num &&
            new Date(item.TanggalKeluar).getFullYear().toString() === timeRange
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      mobile: data
        .filter(
          (item) =>
            item.TipeBlanko === "Certificate of Proficiency (CoP)" &&
            getMonthFromDateString(item.TanggalKeluar) === num &&
            new Date(item.TanggalKeluar).getFullYear().toString() === timeRange
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    }));
  }, [data, timeRange]);

  return (
    <div className="-mt-10">
      <div className="flex items-center justify-end gap-2 space-y-0 py-5 sm:flex-row mr-6 w-full ">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[350px] w-full"
      >
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <YAxis />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => {
                  return value;
                }}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="url(#fillDesktop)"
            stroke="var(--color-desktop)"
            stackId="a"
          />
          <Area
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            stroke="var(--color-mobile)"
            stackId="a"
          />

          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

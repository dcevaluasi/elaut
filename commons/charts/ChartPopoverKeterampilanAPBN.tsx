"use client";

import { BlankoKeluar } from "@/types/blanko";
import { formatDateTime } from "@/utils";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

import CountUp from "react-countup";

import TableDataBlankoKeluarPublic from "../Pelatihan/TableDataBlankoKeluarPublic";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  XAxis,
  Pie,
  PieChart,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TableDataBlankoKeluar from "../Pelatihan/TableDataBlankoKeluar";
import { usePathname } from "next/navigation";
export const description = "A bar chart with an active bar";

const chartConfig = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "BSTF I",
    color: "#211951",
  },
  safari: {
    label: "BSTF II",
    color: "#836FFF",
  },
  firefox: {
    label: "SKN",
    color: "#15F5BA",
  },
  edge: {
    label: "SKPI",
    color: "#F0F3FF",
  },
  other: {
    label: "SOPI",
    color: "#E0366F",
  },
  other2: {
    label: "Fisihing Master",
    color: "#60432F",
  },
} satisfies ChartConfig;

const chartConfigLemdiklat = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "BPPP Tegal",
    color: "#211951",
  },
  safari: {
    label: "BPPP Medan",
    color: "#836FFF",
  },
  firefox: {
    label: "BPPP Banyuwangi",
    color: "#15F5BA",
  },
  edge: {
    label: "BPPP Bitung",
    color: "#F0F3FF",
  },
  other: {
    label: "BPPP Ambon",
    color: "#10375C",
  },

  other2: {
    label: "Politeknik AUP Jakarta",
    color: "#1E0342",
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const ChartPopoverKeterampilanAPBN: React.FC<{ data: BlankoKeluar[] }> = ({
  data,
}) => {
  const [state, setState] = useState<ChartThreeState>({
    series: [
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries I" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Basic Safety Training Fisheries II" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Kecakapan Nelayan" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Sertifikat Keterampilan Penanganan Ikan" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "SOPI" && item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Fishing Master" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ],
  });

  const [stateLemdiklat, setStateLemdiklat] = useState<ChartThreeState>({
    series: [
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Tegal" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Medan" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Banyuwangi" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Bitung" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "BPPP Ambon" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaPelaksana === "Politeknik AUP Jakarta" &&
            item.AsalPendapatan === "APBN"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ],
  });

  // Log state to debug
  useEffect(() => {
    console.log("Chart state:", state);
  }, [state]);

  const chartData = [
    {
      browser: "chrome",
      visitors: state.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: state.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: state.series[2],
      fill: "var(--color-firefox)",
    },
    { browser: "edge", visitors: state.series[3], fill: "var(--color-edge)" },
    { browser: "other", visitors: state.series[4], fill: "var(--color-other)" },
    {
      browser: "other2",
      visitors: state.series[5],
      fill: "var(--color-other2)",
    },
  ];

  const chartDataLemdiklat = [
    {
      browser: "chrome",
      visitors: stateLemdiklat.series[0],
      fill: "var(--color-chrome)",
    },
    {
      browser: "safari",
      visitors: stateLemdiklat.series[1],
      fill: "var(--color-safari)",
    },
    {
      browser: "firefox",
      visitors: stateLemdiklat.series[2],
      fill: "var(--color-firefox)",
    },
    {
      browser: "edge",
      visitors: stateLemdiklat.series[3],
      fill: "var(--color-edge)",
    },
    {
      browser: "other",
      visitors: stateLemdiklat.series[4],
      fill: "var(--color-other)",
    },
  ];

  return (
    <div className="flex gap-2 w-full mb-8">
      <Card className="w-[50%]">
        <CardHeader>
          <CardTitle>
            Jumlah Sertifikat Berdasarkan Program Keterampilan - AKP
          </CardTitle>
          <CardDescription>27 May 2024 - Now 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="browser"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="visitors"
                strokeWidth={2}
                radius={8}
                max={20000}
                activeIndex={2}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground text-black"
                  fontSize={12}
                  fill="#000"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total certificate issued since 27 May 2024
          </div>
        </CardFooter>
      </Card>

      <Card className="w-[50%]">
        <CardHeader>
          <CardTitle>
            Jumlah Sertifikat Berdasarkan Pelaksana Diklat - AKP
          </CardTitle>
          <CardDescription>27 May 2024 - Now 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigLemdiklat} className="">
            <BarChart accessibilityLayer data={chartDataLemdiklat}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="browser"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartConfigLemdiklat[value as keyof typeof chartConfig]?.label
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="visitors"
                strokeWidth={2}
                radius={8}
                activeIndex={2}
                maxBarSize={20000}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground text-black"
                  fontSize={12}
                  fill="#000"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing total certificate issued since 27 May 2024
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChartPopoverKeterampilanAPBN;

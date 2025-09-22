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
export const description = "A bar chart with an active bar";

const chartConfig = {
  visitors: {
    label: "Sertifikat",
  },
  chrome: {
    label: "ANKAPIN I",
    color: "#2662D9",
  },
  safari: {
    label: "ATKAPIN I",
    color: "#2EB88A",
  },
  firefox: {
    label: "ANKAPIN II",
    color: "#e88c30",
  },
  edge: {
    label: "ATKAPIN II",
    color: "#AF57DB",
  },
  other: {
    label: "ANKAPIN III",
    color: "#E0366F",
  },
  other2: {
    label: "ATKAPIN III",
    color: "#60432F",
  },
  other3: {
    label: "Rating",
    color: "#274754",
  },
} satisfies ChartConfig;

interface ChartThreeState {
  series: number[];
}

const options2: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: [
    "#3C50E0", // blue
    "#6577F3", // light blue
    "#026bec", // blue
    "#991dce", // purple
    "#0FADCF", // cyan
    "#25ca46", // green
    "#12e7d2", // light cyan
    "#2D42FF", // blue
    "#4C5EFF", // light blue
    "#0033CC", // dark blue
    "#8A2BE2", // blue-violet
    "#4682B4", // steel blue
    "#5F9EA0", // cadet blue
    "#00CED1", // dark turquoise
    "#20B2AA", // light sea green
    "#3CB371", // medium sea green
    "#7FFFD4", // aquamarine
  ],

  labels: [
    "PUKAKP I (Aceh)",
    "PUKAKP II (Medan)",
    "PUKAKP III (Lampung)",
    "PUKAKP IV (Jakarta)",
    "PUKAKP V (Tegal)",
    "PUKAKP VI (Tegal)",
    "PUKAKP VII (Banyuwangi)",
    "PUKAKP VIII (Kupang)",
    "PUKAKP IX (Pontianak)",
    "PUKAKP X (Bitung)",
    "PUKAKP XI (Bitung)",
    "PUKAKP XII (Bone)",
    "PUKAKP XIII (Ambon)",
    "PUKAKP XIV (Ambon)",
    "PUKAKP XV (Sorong)",
    "PUKAKP XVI (Sorong)",
    "PUKAKP XVII (Dumai)",
  ],
  legend: {
    show: true,
    position: "bottom",
  },
  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 570,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 300,
        },
      },
    },
  ],
};

const options1: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "pie",
  },
  colors: [
    "#3C50E0",
    "#6577F3",
    "#026bec",
    "#991dce",
    "#0FADCF",
    "#25ca46",
    "#12e7d2",
  ],
  labels: [
    "Ahli Nautika Kapal Penangkap Ikan Tingkat I",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat I",
    "Ahli Nautika Kapal Penangkap Ikan Tingkat II",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat II",
    "Ahli Nautika Kapal Penangkap Ikan Tingkat III",
    "Ahli Teknika Kapal Penangkap Ikan Tingkat III",
    "Rating Keahlian",
  ],
  legend: {
    show: true,
    position: "bottom",
  },
  // title: {
  //   text: "Grafik Jumlah per Jenis Pendidikan",
  //   style: {
  //     fontFamily: "Plus Sans Jakarta",
  //   },
  // },
  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 480,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 300,
        },
      },
    },
  ],
};

const ChartPopoverSertifikasi: React.FC<{ data: BlankoKeluar[] }> = ({
  data,
}) => {
  const [state, setState] = useState<ChartThreeState>({
    series: [
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Nautika Kapal Penangkap Ikan Tingkat I"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Teknika Kapal Penangkap Ikan Tingkat I"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Nautika Kapal Penangkap Ikan Tingkat II"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Teknika Kapal Penangkap Ikan Tingkat II"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Nautika Kapal Penangkap Ikan Tingkat III"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter(
          (item) =>
            item.NamaProgram === "Ahli Teknika Kapal Penangkap Ikan Tingkat III"
        )
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
      data
        .filter((item) => item.NamaProgram === "Rating Keahlian")
        .reduce((total, item) => total + item.JumlahBlankoDisetujui, 0),
    ],
  });

  const totalSum = [
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat I",
      color: "bg-primary",
      multiplier: 565000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat I",
      color: "bg-[#8FD0EF]",
      multiplier: 565000,
    },
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat II",
      color: "bg-[#026bec]",
      multiplier: 540000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat II",
      color: "bg-[#991dce]",
      multiplier: 540000,
    },
    {
      label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III",
      color: "bg-[#0FADCF]",
      multiplier: 693000,
    },
    {
      label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III",
      color: "bg-[#25ca46]",
      multiplier: 693000,
    },
    {
      label: "Ujian Rating Keahlian",
      color: "bg-[#12e7d2]",
      multiplier: 2031000,
    },
  ].reduce(
    (acc, item) => {
      const totalBlanko = data
        .filter((d) => "Ujian " + d.NamaProgram === item.label)
        .reduce((total, d) => total + d.JumlahBlankoDisetujui, 0);

      const totalAmount = totalBlanko * item.multiplier;

      acc.totalAmount += totalAmount;
      acc.totalBlanko += totalBlanko;

      return acc;
    },
    { totalAmount: 0, totalBlanko: 0 }
  );

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
    {
      browser: "other3",
      visitors: state.series[6],
      fill: "var(--color-other3)",
    },
  ];

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default sm:px-7.5 xl:col-span-5 w-full">
      <div className="mb-3 justify-between gap-4 sm:flex w-full">
        <div>
          <h5 className="text-xl font-semibold text-black">
            Total Sertifikat Ujian Keahlian
          </h5>
          <p className="italic text-sm">{formatDateTime()}</p>
        </div>
      </div>

      <div className="flex gap-2 w-full">
        <Card className="w-[50%]">
          <CardHeader>
            <CardTitle>Grafik Jenis Sertifikasi Keahlian - AKP</CardTitle>
            <CardDescription>January - Now 2025</CardDescription>
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
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total certificate issued since 27 May 2024
            </div>
          </CardFooter>
        </Card>

        {/* 
        <Card className="flex flex-col w-[40%]">
          <CardHeader className="items-center pb-0">
            <CardTitle>Pie Chart - Donut with Text</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalVisitors.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Visitors
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </CardFooter>
        </Card> */}
      </div>

      <div className="flex gap-2 flex-col mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Total Perkiraan Penerimaan PNBP</CardTitle>
            <CardDescription>
              {" "}
              The unit prices used in this data were obtained from{" "}
              <span className="font-semibold">BPPP Tegal</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 flex flex-wrap items-center justify-center gap-y-3 mt-0 border-t border-t-gray-200">
              {[
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat I",
                  color: "bg-primary",
                  multiplier: 565000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat I",
                  color: "bg-[#8FD0EF]",
                  multiplier: 565000,
                },
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat II",
                  color: "bg-[#026bec]",
                  multiplier: 540000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat II",
                  color: "bg-[#991dce]",
                  multiplier: 540000,
                },
                {
                  label: "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III",
                  color: "bg-[#0FADCF]",
                  multiplier: 693000,
                },
                {
                  label: "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III",
                  color: "bg-[#25ca46]",
                  multiplier: 693000,
                },
                {
                  label: "Ujian Rating Keahlian",
                  color: "bg-[#12e7d2]",
                  multiplier: 2031000,
                },
              ].map((item, index) => (
                <div className="w-full px-8 " key={index}>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-1 w-full items-center">
                      <span
                        className={`mr-2 block h-3 w-full max-w-3 rounded-full ${item.color}`}
                      ></span>
                      <p className="flex w-full justify-between text-sm font-medium text-black">
                        <span>
                          {item.label}{" "}
                          {item.label ==
                            "Ujian Ahli Teknika Kapal Penangkap Ikan Tingkat III" ||
                            item.label ==
                            "Ujian Ahli Nautika Kapal Penangkap Ikan Tingkat III"
                            ? "SKK 60 Mil"
                            : ""}{" "}
                          - Rp {item.multiplier.toLocaleString("id-ID")}
                        </span>
                      </p>
                    </div>

                    <span className="w-full flex items-end justify-end">
                      Rp.
                      {(
                        data
                          .filter(
                            (d) => "Ujian " + d.NamaProgram === item.label
                          )
                          .reduce(
                            (total, d) => total + d.JumlahBlankoDisetujui,
                            0
                          ) * item.multiplier
                      ).toLocaleString("id-ID")}{" "}
                      <span className="font-semibold text-xs ml-3">
                        (
                        {data
                          .filter(
                            (d) => "Ujian " + d.NamaProgram === item.label
                          )
                          .reduce(
                            (total, d) => total + d.JumlahBlankoDisetujui,
                            0
                          )
                          .toLocaleString("id-ID")}
                        Sertifikat )
                      </span>
                    </span>
                  </div>
                </div>
              ))}
              <div className="w-full flex justify-end items-center px-8">
                <div className="flex gap-1 items-end">
                  <h5 className="text-3xl font-bold text-black">
                    Rp{" "}
                    <CountUp
                      start={0}
                      duration={12.75}
                      end={totalSum.totalAmount}
                    />
                  </h5>
                  <span className="font-semibold text-xs ml-3">
                    ({totalSum.totalBlanko}
                    Sertifikat )
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total certificate issued since 27 May 2024
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex gap-2 flex-col mt-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Detail Data CoC</CardTitle>
            <CardDescription>
              {" "}
              The unit prices used in this data were obtained from{" "}
              <span className="font-semibold">BPPP Tegal</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableDataBlankoKeluarPublic />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total certificate issued since 27 May 2024
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChartPopoverSertifikasi;
